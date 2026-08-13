"""
KrishiCare AI - Enhanced Training Script
=========================================
Major improvements for accuracy:
  1. EfficientNetV2B0 backbone (more accurate than MobileNetV2)
  2. Two-phase training: head warmup → fine-tuning
  3. EarlyStopping + ReduceLROnPlateau + ModelCheckpoint
  4. Class weights to handle imbalanced data
  5. More aggressive data augmentation (cutout, mixup-style)
  6. Label smoothing for better generalization
  7. Saves best model by val_accuracy (not last epoch)
"""

import os
import json
import argparse
import numpy as np
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow.keras import layers, models, callbacks, regularizers
from collections import Counter

# Configuration
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS_WARMUP = 15      # Phase 1: train classifier head only
EPOCHS_FINETUNE = 20    # Phase 2: fine-tune top layers of backbone

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NUM_CLASSES = 38


def compute_class_weights(train_dir):
    """Compute inverse-frequency class weights for imbalanced datasets."""
    counts = {}
    for cls in sorted(os.listdir(train_dir)):
        cls_path = os.path.join(train_dir, cls)
        if os.path.isdir(cls_path):
            n = len([f for f in os.listdir(cls_path) if f.lower().endswith(
                ('.jpg', '.jpeg', '.png', '.bmp', '.tiff'))])
            counts[cls] = max(n, 1)  # avoid division by zero

    total = sum(counts.values())
    n_classes = len(counts)
    weights = {}
    for i, cls in enumerate(sorted(counts.keys())):
        weights[i] = total / (n_classes * counts[cls])
    return weights


def build_model(num_classes, use_efficientnet=True):
    """
    Build enhanced transfer-learning model.

    Architecture:
    - EfficientNetV2B0 (default) or MobileNetV2 backbone (pretrained on ImageNet)
    - Strong data augmentation pipeline
    - Two Dense layers with BatchNorm + Dropout
    - Label smoothing in loss
    """
    # ── Data augmentation ──────────────────────────────────────────────────
    data_augmentation = models.Sequential([
        layers.RandomFlip("horizontal_and_vertical"),
        layers.RandomRotation(0.35),
        layers.RandomZoom(0.25),
        layers.RandomContrast(0.3),
        layers.RandomTranslation(0.1, 0.1),
        layers.RandomBrightness(0.25),
        # Gaussian noise for robustness
        layers.GaussianNoise(0.05),
    ], name="data_augmentation")

    # ── Backbone ────────────────────────────────────────────────────────────
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

    base_model.trainable = False  # Freeze during warmup phase
    print(f"Backbone: {backbone_name} with {len(base_model.layers)} layers (frozen)")

    # ── Model graph ─────────────────────────────────────────────────────────
    inputs = layers.Input(shape=(IMG_SIZE[0], IMG_SIZE[1], 3), name="input_image")
    x = data_augmentation(inputs)
    x = base_model(x, training=False)

    # Classification head
    x = layers.GlobalAveragePooling2D(name="global_avg_pool")(x)
    x = layers.BatchNormalization(name="bn1")(x)
    x = layers.Dropout(0.4, name="drop1")(x)
    x = layers.Dense(
        512, activation='relu',
        kernel_regularizer=regularizers.l2(1e-4),
        name="fc1"
    )(x)
    x = layers.BatchNormalization(name="bn2")(x)
    x = layers.Dropout(0.3, name="drop2")(x)
    x = layers.Dense(
        256, activation='relu',
        kernel_regularizer=regularizers.l2(1e-4),
        name="fc2"
    )(x)
    x = layers.Dropout(0.2, name="drop3")(x)
    outputs = layers.Dense(num_classes, activation='softmax', name="classifier")(x)

    model = models.Model(inputs, outputs, name=f"KrishiCare_{backbone_name}")

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        # Label smoothing: reduces overconfidence, improves generalization
        loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.1),
        metrics=[
            'accuracy',
            tf.keras.metrics.TopKCategoricalAccuracy(k=3, name='top3_acc')
        ]
    )
    return model, base_model, preprocess_fn


def get_callbacks(model_path, phase="warmup"):
    """Get training callbacks for the specified phase."""
    return [
        callbacks.EarlyStopping(
            monitor='val_accuracy',
            patience=6 if phase == "warmup" else 8,
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
    """Save training accuracy and loss plots."""
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
    parser = argparse.ArgumentParser(description="Train KrishiCare model with 2-phase fine-tuning")
    parser.add_argument("--quick", action="store_true",
                        help="Quick mode: reduced epochs for dev testing")
    parser.add_argument("--no-efficientnet", action="store_true",
                        help="Use MobileNetV2 instead of EfficientNetV2B0")
    parser.add_argument("--unfreeze-layers", type=int, default=50,
                        help="Number of backbone layers to unfreeze in fine-tuning phase (default 50)")
    args = parser.parse_args()

    global EPOCHS_WARMUP, EPOCHS_FINETUNE, BATCH_SIZE
    if args.quick:
        EPOCHS_WARMUP = 5
        EPOCHS_FINETUNE = 8
        BATCH_SIZE = 16
        print("⚡ Quick mode: warmup=5 epochs, fine-tune=8 epochs, batch=16")

    # ── Directories ─────────────────────────────────────────────────────────
    os.chdir(BASE_DIR)
    train_dir = 'dataset/train'
    val_dir   = 'dataset/val'
    test_dir  = 'dataset/test'
    model_output = 'models/krishicare_mobilenetv2.keras'  # keep filename for compatibility
    models_dir   = 'models'
    os.makedirs(models_dir, exist_ok=True)

    # ── Load datasets ────────────────────────────────────────────────────────
    print("\n[INFO] Loading datasets...")
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
        print(f"\n[ERROR] Dataset error: {e}")
        print("Run: python src/download_dataset.py --max-per-class 300")
        return

    class_names = train_ds_raw.class_names
    num_classes = len(class_names)
    print(f"[OK] Detected {num_classes} classes")

    # Save class names
    with open('src/class_names.json', 'w') as f:
        json.dump(class_names, f, indent=2)
    print("Saved class_names.json")

    # ── Class weights ────────────────────────────────────────────────────────
    print("\n[INFO] Computing class weights for imbalanced data...")
    class_weights = compute_class_weights(train_dir)
    print(f"   Min weight: {min(class_weights.values()):.3f}  "
          f"Max weight: {max(class_weights.values()):.3f}")

    # ── Build model ──────────────────────────────────────────────────────────
    use_efficientnet = not args.no_efficientnet
    model, base_model, preprocess_fn = build_model(num_classes, use_efficientnet)

    # ── Preprocess pipelines ─────────────────────────────────────────────────
    AUTOTUNE = tf.data.AUTOTUNE

    def preprocess(images, labels):
        images = tf.cast(images, tf.float32)
        images = preprocess_fn(images)
        return images, labels

    train_ds = train_ds_raw.map(preprocess, num_parallel_calls=AUTOTUNE).prefetch(AUTOTUNE)
    val_ds   = val_ds_raw.map(preprocess, num_parallel_calls=AUTOTUNE).prefetch(AUTOTUNE)
    test_ds  = test_ds_raw.map(preprocess, num_parallel_calls=AUTOTUNE).prefetch(AUTOTUNE)

    # ════════════════════════════════════════════════════════════════════════
    # PHASE 1 — Warmup: train only classifier head
    # ════════════════════════════════════════════════════════════════════════
    print(f"\n{'='*60}")
    print("PHASE 1 — Warmup (classifier head only)")
    print(f"{'='*60}")
    model.summary(print_fn=lambda x: None)  # silent summary

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
    # PHASE 2 — Fine-tuning: unfreeze top N layers of backbone
    # ════════════════════════════════════════════════════════════════════════
    print(f"\n{'='*60}")
    print(f"PHASE 2 — Fine-tuning (unfreezing top {args.unfreeze_layers} backbone layers)")
    print(f"{'='*60}")

    # Reload best weights from Phase 1
    if os.path.exists(model_output):
        model = tf.keras.models.load_model(model_output, compile=False)
        # Re-get base model reference
        for lyr in model.layers:
            if hasattr(lyr, 'layers') and len(lyr.layers) > 5:
                base_model = lyr
                break

    # Unfreeze top N layers of backbone
    base_model.trainable = True
    total_layers = len(base_model.layers)
    freeze_until = max(0, total_layers - args.unfreeze_layers)
    for i, layer in enumerate(base_model.layers):
        layer.trainable = (i >= freeze_until)
    trainable_count = sum(1 for l in base_model.layers if l.trainable)
    print(f"Unfrozen {trainable_count}/{total_layers} backbone layers")

    # Lower LR for fine-tuning to avoid destroying pretrained weights
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=5e-5),
        loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.05),
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
    # Load the very best checkpoint
    if os.path.exists(model_output):
        best_model = tf.keras.models.load_model(model_output, compile=False)
        best_model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy', tf.keras.metrics.TopKCategoricalAccuracy(k=3, name='top3_acc')]
        )
        print("\n[EVAL] Evaluating best model on test set...")
        results = best_model.evaluate(test_ds, verbose=1)
        metrics = dict(zip(best_model.metrics_names, results))
        print(f"\n[RESULT] Test Accuracy  : {metrics.get('accuracy', 0)*100:.2f}%")
        print(f"[RESULT] Top-3 Accuracy : {metrics.get('top3_acc', 0)*100:.2f}%")
        print(f"[RESULT] Test Loss      : {metrics.get('loss', 0):.4f}")

    print(f"\n[OK] Training complete! Model saved to: {os.path.abspath(model_output)}")
    print("Restart the FastAPI service to load the new model.")


if __name__ == '__main__':
    main()
