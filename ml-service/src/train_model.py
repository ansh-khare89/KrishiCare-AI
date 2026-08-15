"""
KrishiCare AI - Enhanced Real-World Generalization Model Training Script
========================================================================
Designed specifically for high accuracy on real-world, field-condition leaf photos taken by farmers.

Key Accuracy & Generalization Enhancements:
  1. EfficientNetV2B0 backbone (pretrained on ImageNet)
  2. Heavy Field-Condition Augmentation Pipeline:
     - Multi-angle rotations & flips
     - Color jitter (hue/saturation/brightness) to handle outdoor daylight & shadows
     - Contrast & translation variations to ignore complex background soil/foliage
     - Gaussian noise & random scaling
  3. Two-phase training: Classifier Head Warmup → Top 60 Layers Fine-Tuning
  4. Class-weight balancing for imbalanced dataset splits
  5. Label smoothing (0.1) for calibrated confidence & out-of-distribution resilience
"""

import os
import sys
import json
import argparse
import numpy as np
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow.keras import layers, models, callbacks, regularizers
from collections import Counter

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

# Global Configuration
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS_WARMUP = 15      # Phase 1: train classifier head only
EPOCHS_FINETUNE = 25    # Phase 2: fine-tune top layers of backbone

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def compute_class_weights(train_dir):
    """Compute inverse-frequency class weights for imbalanced datasets."""
    counts = {}
    for cls in sorted(os.listdir(train_dir)):
        cls_path = os.path.join(train_dir, cls)
        if os.path.isdir(cls_path):
            n = len([f for f in os.listdir(cls_path) if f.lower().endswith(
                ('.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'))])
            counts[cls] = max(n, 1)

    total = sum(counts.values())
    n_classes = len(counts)
    weights = {}
    for i, cls in enumerate(sorted(counts.keys())):
        weights[i] = total / (n_classes * counts[cls])
    return weights


class RandomColorJitter(layers.Layer):
    """Custom Keras layer to simulate real-world daylight, shadow, and mobile camera color variations."""
    def __init__(self, brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1, **kwargs):
        super().__init__(**kwargs)
        self.brightness = brightness
        self.contrast = contrast
        self.saturation = saturation
        self.hue = hue

    def call(self, inputs, training=None):
        if not training:
            return inputs
        x = inputs
        if self.brightness > 0:
            x = tf.image.random_brightness(x, max_delta=self.brightness)
        if self.contrast > 0:
            x = tf.image.random_contrast(x, lower=1.0 - self.contrast, upper=1.0 + self.contrast)
        if self.saturation > 0:
            x = tf.image.random_saturation(x, lower=1.0 - self.saturation, upper=1.0 + self.saturation)
        if self.hue > 0:
            x = tf.image.random_hue(x, max_delta=self.hue)
        return tf.clip_by_value(x, 0.0, 255.0)


def build_model(num_classes, use_efficientnet=True):
    """
    Build enhanced transfer-learning model with heavy real-world augmentations.
    """
    # ── Field-Condition Data Augmentation Pipeline ─────────────────────────
    data_augmentation = models.Sequential([
        RandomColorJitter(brightness=0.25, contrast=0.3, saturation=0.25, hue=0.08),
        layers.RandomFlip("horizontal_and_vertical"),
        layers.RandomRotation(0.4),
        layers.RandomZoom(0.3),
        layers.RandomTranslation(0.15, 0.15),
        layers.GaussianNoise(0.08),
    ], name="real_world_data_augmentation")

    # ── Pretrained Backbone ───────────────────────────────────────────────
    if use_efficientnet:
        base_model = tf.keras.applications.EfficientNetV2B0(
            input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3),
            include_top=False,
            weights='imagenet'
        )
        preprocess_fn = tf.keras.applications.efficientnet_v2.preprocess_input
        backbone_name = "EfficientNetV2B0"
    else:
        base_model = tf.keras.applications.MobileNetV2(
            input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3),
            include_top=False,
            weights='imagenet'
        )
        preprocess_fn = tf.keras.applications.mobilenet_v2.preprocess_input
        backbone_name = "MobileNetV2"

    base_model.trainable = False  # Freeze during Phase 1 Warmup
    print(f"Backbone: {backbone_name} with {len(base_model.layers)} layers (frozen for warmup)")

    # ── Model Graph Construction ──────────────────────────────────────────
    inputs = layers.Input(shape=(IMG_SIZE[0], IMG_SIZE[1], 3), name="input_image")
    x = data_augmentation(inputs)
    x = base_model(x, training=False)

    # Robust Classification Head with BatchNorm & Heavy Dropout
    x = layers.GlobalAveragePooling2D(name="global_avg_pool")(x)
    x = layers.BatchNormalization(name="bn1")(x)
    x = layers.Dropout(0.4, name="drop1")(x)
    
    x = layers.Dense(
        512, activation='relu',
        kernel_regularizer=regularizers.l2(1e-4),
        name="fc1"
    )(x)
    x = layers.BatchNormalization(name="bn2")(x)
    x = layers.Dropout(0.35, name="drop2")(x)
    
    x = layers.Dense(
        256, activation='relu',
        kernel_regularizer=regularizers.l2(1e-4),
        name="fc2"
    )(x)
    x = layers.Dropout(0.25, name="drop3")(x)
    
    outputs = layers.Dense(num_classes, activation='softmax', name="classifier")(x)

    model = models.Model(inputs, outputs, name=f"KrishiCare_{backbone_name}")

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        # Label smoothing = 0.1 improves resilience on real outdoor field photos
        loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.1),
        metrics=[
            'accuracy',
            tf.keras.metrics.TopKCategoricalAccuracy(k=3, name='top3_acc')
        ]
    )
    return model, base_model, preprocess_fn


def get_callbacks(model_path, phase="warmup"):
    """Get callbacks for phase 1 and phase 2."""
    return [
        callbacks.EarlyStopping(
            monitor='val_accuracy',
            patience=7 if phase == "warmup" else 10,
            restore_best_weights=True,
            verbose=1
        ),
        callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.3,
            patience=3,
            min_lr=1e-7,
            verbose=1
        ),
        callbacks.ModelCheckpoint(
            filepath=model_path,
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1
        ),
    ]


def plot_history(history, phase_name, output_dir):
    """Save clean accuracy and loss plots."""
    acc = history.history.get('accuracy', [])
    val_acc = history.history.get('val_accuracy', [])
    loss = history.history.get('loss', [])
    val_loss = history.history.get('val_loss', [])
    epochs_range = range(len(acc))

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

    ax1.plot(epochs_range, acc, label='Train Acc', color='#10b981', linewidth=2)
    ax1.plot(epochs_range, val_acc, label='Val Acc', color='#3b82f6', linewidth=2)
    ax1.set_title(f'{phase_name} — Accuracy', fontsize=13, fontweight='bold')
    ax1.set_xlabel('Epochs')
    ax1.set_ylabel('Accuracy')
    ax1.legend()
    ax1.grid(True, linestyle='--', alpha=0.5)

    ax2.plot(epochs_range, loss, label='Train Loss', color='#ef4444', linewidth=2)
    ax2.plot(epochs_range, val_loss, label='Val Loss', color='#f59e0b', linewidth=2)
    ax2.set_title(f'{phase_name} — Loss', fontsize=13, fontweight='bold')
    ax2.set_xlabel('Epochs')
    ax2.set_ylabel('Loss')
    ax2.legend()
    ax2.grid(True, linestyle='--', alpha=0.5)

    plt.tight_layout()
    plot_path = os.path.join(output_dir, f'{phase_name.lower().replace(" ", "_")}_plot.png')
    plt.savefig(plot_path, dpi=150)
    plt.close()
    print(f"Plot saved → {plot_path}")
    return plot_path


def main():
    parser = argparse.ArgumentParser(description="Train KrishiCare model for real-world photo accuracy")
    parser.add_argument("--quick", action="store_true", help="Quick mode for testing")
    parser.add_argument("--no-efficientnet", action="store_true", help="Use MobileNetV2 instead of EfficientNetV2B0")
    parser.add_argument("--unfreeze-layers", type=int, default=60, help="Backbone layers to unfreeze (default 60)")
    args = parser.parse_args()

    global EPOCHS_WARMUP, EPOCHS_FINETUNE, BATCH_SIZE
    if args.quick:
        EPOCHS_WARMUP = 5
        EPOCHS_FINETUNE = 8
        BATCH_SIZE = 16
        print("⚡ Quick mode enabled: reduced epochs")

    os.chdir(BASE_DIR)
    train_dir = 'dataset/train'
    val_dir   = 'dataset/val'
    test_dir  = 'dataset/test'
    model_output = 'models/krishicare_mobilenetv2.keras'
    models_dir   = 'models'
    os.makedirs(models_dir, exist_ok=True)

    print("\n[INFO] Loading training, validation, and test datasets...")
    try:
        train_ds_raw = tf.keras.utils.image_dataset_from_directory(
            train_dir, image_size=IMG_SIZE, batch_size=BATCH_SIZE, label_mode='categorical'
        )
        val_ds_raw = tf.keras.utils.image_dataset_from_directory(
            val_dir, image_size=IMG_SIZE, batch_size=BATCH_SIZE, label_mode='categorical'
        )
        test_ds_raw = tf.keras.utils.image_dataset_from_directory(
            test_dir, image_size=IMG_SIZE, batch_size=BATCH_SIZE, label_mode='categorical'
        )
    except ValueError as e:
        print(f"\n[ERROR] Dataset loading error: {e}")
        print("Run: python src/download_dataset.py --max-per-class 300")
        return

    class_names = train_ds_raw.class_names
    num_classes = len(class_names)
    print(f"[OK] Detected {num_classes} classes")

    with open('src/class_names.json', 'w') as f:
        json.dump(class_names, f, indent=2)
    print("Saved src/class_names.json")

    print("\n[INFO] Computing class weights...")
    class_weights = compute_class_weights(train_dir)

    use_efficientnet = not args.no_efficientnet
    model, base_model, preprocess_fn = build_model(num_classes, use_efficientnet)

    AUTOTUNE = tf.data.AUTOTUNE
    def preprocess(images, labels):
        images = tf.cast(images, tf.float32)
        images = preprocess_fn(images)
        return images, labels

    train_ds = train_ds_raw.map(preprocess, num_parallel_calls=AUTOTUNE).prefetch(AUTOTUNE)
    val_ds   = val_ds_raw.map(preprocess, num_parallel_calls=AUTOTUNE).prefetch(AUTOTUNE)
    test_ds  = test_ds_raw.map(preprocess, num_parallel_calls=AUTOTUNE).prefetch(AUTOTUNE)

    # ════════════════════════════════════════════════════════════════════════
    # PHASE 1 — Classifier Head Warmup
    # ════════════════════════════════════════════════════════════════════════
    print(f"\n{'='*60}")
    print("PHASE 1 — Classifier Head Warmup")
    print(f"{'='*60}")

    history_warmup = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS_WARMUP,
        class_weight=class_weights,
        callbacks=get_callbacks(model_output, phase="warmup"),
        verbose=1
    )
    plot_history(history_warmup, "Phase 1 Warmup", models_dir)

    best_warmup_acc = max(history_warmup.history.get('val_accuracy', [0]))
    print(f"\n[OK] Phase 1 best val_accuracy: {best_warmup_acc*100:.2f}%")

    # ════════════════════════════════════════════════════════════════════════
    # PHASE 2 — Real-World Fine-Tuning (Unfreeze Top Backbone Layers)
    # ════════════════════════════════════════════════════════════════════════
    print(f"\n{'='*60}")
    print(f"PHASE 2 — Fine-tuning (Unfreezing top {args.unfreeze_layers} backbone layers)")
    print(f"{'='*60}")

    if os.path.exists(model_output):
        model = tf.keras.models.load_model(
            model_output,
            custom_objects={'RandomColorJitter': RandomColorJitter},
            compile=False
        )
        for lyr in model.layers:
            if hasattr(lyr, 'layers') and len(lyr.layers) > 5:
                base_model = lyr
                break

    base_model.trainable = True
    total_layers = len(base_model.layers)
    freeze_until = max(0, total_layers - args.unfreeze_layers)
    for i, layer in enumerate(base_model.layers):
        layer.trainable = (i >= freeze_until)
    trainable_count = sum(1 for l in base_model.layers if l.trainable)
    print(f"Unfrozen {trainable_count}/{total_layers} backbone layers for real-world fine tuning")

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=5e-5),
        loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.08),
        metrics=[
            'accuracy',
            tf.keras.metrics.TopKCategoricalAccuracy(k=3, name='top3_acc')
        ]
    )

    history_finetune = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS_FINETUNE,
        class_weight=class_weights,
        callbacks=get_callbacks(model_output, phase="finetune"),
        verbose=1
    )
    plot_history(history_finetune, "Phase 2 Finetune", models_dir)

    best_finetune_acc = max(history_finetune.history.get('val_accuracy', [0]))
    print(f"\n[OK] Phase 2 best val_accuracy: {best_finetune_acc*100:.2f}%")

    # ════════════════════════════════════════════════════════════════════════
    # EVALUATION
    # ════════════════════════════════════════════════════════════════════════
    if os.path.exists(model_output):
        best_model = tf.keras.models.load_model(
            model_output,
            custom_objects={'RandomColorJitter': RandomColorJitter},
            compile=False
        )
        best_model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy', tf.keras.metrics.TopKCategoricalAccuracy(k=3, name='top3_acc')]
        )
        print("\n[EVAL] Evaluating final model performance on test set...")
        eval_res = best_model.evaluate(test_ds, verbose=1)
        # Handle dict or list return types in Keras
        if isinstance(eval_res, dict):
            acc = eval_res.get('accuracy', 0) * 100
            top3 = eval_res.get('top3_acc', 0) * 100
            loss_val = eval_res.get('loss', 0)
        else:
            loss_val = eval_res[0]
            acc = eval_res[1] * 100 if len(eval_res) > 1 else 0
            top3 = eval_res[2] * 100 if len(eval_res) > 2 else 0

        print(f"\n[RESULT] Test Accuracy  : {acc:.2f}%")
        print(f"[RESULT] Top-3 Accuracy : {top3:.2f}%")
        print(f"[RESULT] Test Loss      : {loss_val:.4f}")

    print(f"\n✅ Real-world enhanced model saved to: {os.path.abspath(model_output)}")


if __name__ == '__main__':
    main()
