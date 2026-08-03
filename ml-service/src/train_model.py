import os
import json
import argparse
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow.keras import layers, models, callbacks
import numpy as np

# Configuration constants
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 30
NUM_CLASSES = 38  # Will be updated dynamically based on available classes

def setup_directories():
    """Ensure necessary directories exist and create the expected structure."""
    os.makedirs('models', exist_ok=True)
    os.makedirs('src', exist_ok=True)
    
    # Dataset subfolders mapping - comprehensive 38 classes
    dataset_dirs = ['dataset/train', 'dataset/val', 'dataset/test']
    classes = [
        # Tomato (10 classes)
        'Tomato___healthy', 'Tomato___Early_blight', 'Tomato___Late_blight',
        'Tomato___Bacterial_spot', 'Tomato___Leaf_Mold', 'Tomato___Septoria_leaf_spot',
        'Tomato___Spider_mites_Two-spotted_spider_mite', 'Tomato___Target_Spot',
        'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus',
        # Potato (3 classes)
        'Potato___healthy', 'Potato___Early_blight', 'Potato___Late_blight',
        # Corn (4 classes)
        'Corn_(maize)___healthy', 'Corn_(maize)___Common_rust',
        'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
        # Apple (4 classes)
        'Apple___healthy', 'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust',
        # Grape (4 classes)
        'Grape___healthy', 'Grape___Black_rot', 'Grape___Esca_(Black_Measles)',
        'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
        # Pepper (2 classes)
        'Pepper,_bell___healthy', 'Pepper,_bell___Bacterial_spot',
        # Peach (2 classes)
        'Peach___healthy', 'Peach___Bacterial_spot',
        # Cherry (2 classes)
        'Cherry_(including_sour)___healthy', 'Cherry_(including_sour)___Powdery_mildew',
        # Strawberry (2 classes)
        'Strawberry___healthy', 'Strawberry___Leaf_scorch',
        # Orange (1 class)
        'Orange___Haunglongbing_(Citrus_greening)',
        # Squash (1 class)
        'Squash___Powdery_mildew',
        # Blueberry (1 class)
        'Blueberry___healthy',
        # Soybean (1 class)
        'Soybean___healthy',
    ]
    
    for base_dir in dataset_dirs:
        for cls in classes:
            os.makedirs(os.path.join(base_dir, cls), exist_ok=True)

def build_model():
    """Build the transfer learning model based on MobileNetV2 with improved architecture."""
    # Enhanced Data Augmentation pipeline to prevent overfitting
    data_augmentation = models.Sequential([
        layers.RandomFlip("horizontal_and_vertical"),
        layers.RandomRotation(0.3),
        layers.RandomZoom(0.3),
        layers.RandomContrast(0.3),
        layers.RandomTranslation(0.1, 0.1),
        layers.RandomBrightness(0.2)
    ], name="data_augmentation")

    # Load pre-trained MobileNetV2 base model with ImageNet weights
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3),
        include_top=False,
        weights='imagenet'
    )
    base_model.trainable = False  # Freeze pre-trained weights initially

    # Input layer
    inputs = layers.Input(shape=(IMG_SIZE[0], IMG_SIZE[1], 3), name="input_image")
    
    # Apply data augmentation
    x = data_augmentation(inputs)
    
    # Extract features using base model in inference mode
    x = base_model(x, training=False)
    
    # Enhanced classification head with better regularization
    x = layers.GlobalAveragePooling2D(name="global_pooling")(x)
    x = layers.BatchNormalization(name="batch_norm")(x)
    x = layers.Dropout(0.3, name="dropout1")(x)
    x = layers.Dense(512, activation='relu', name="fc1")(x)
    x = layers.BatchNormalization(name="batch_norm2")(x)
    x = layers.Dropout(0.2, name="dropout2")(x)
    outputs = layers.Dense(NUM_CLASSES, activation='softmax', name="classifier")(x)
    
    model = models.Model(inputs, outputs, name="KrishiCare_MobileNetV2_Enhanced")
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss='categorical_crossentropy',
        metrics=['accuracy', tf.keras.metrics.TopKCategoricalAccuracy(k=3, name='top3_accuracy')]
    )
    return model

def plot_history(history):
    """Save training accuracy and loss plots inside models directory."""
    acc = history.history.get('accuracy', [])
    val_acc = history.history.get('val_accuracy', [])
    loss = history.history.get('loss', [])
    val_loss = history.history.get('val_loss', [])
    epochs_range = range(len(acc))

    # Accuracy Plot
    plt.figure(figsize=(8, 6))
    plt.plot(epochs_range, acc, label='Training Accuracy', color='#10b981', linewidth=2)
    plt.plot(epochs_range, val_acc, label='Validation Accuracy', color='#3b82f6', linewidth=2)
    plt.title('Training & Validation Accuracy', fontsize=14, fontweight='bold')
    plt.xlabel('Epochs')
    plt.ylabel('Accuracy')
    plt.legend(loc='lower right')
    plt.grid(True, linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.savefig('models/accuracy_plot.png', dpi=300)
    plt.close()

    # Loss Plot
    plt.figure(figsize=(8, 6))
    plt.plot(epochs_range, loss, label='Training Loss', color='#ef4444', linewidth=2)
    plt.plot(epochs_range, val_loss, label='Validation Loss', color='#f59e0b', linewidth=2)
    plt.title('Training & Validation Loss', fontsize=14, fontweight='bold')
    plt.xlabel('Epochs')
    plt.ylabel('Loss')
    plt.legend(loc='upper right')
    plt.grid(True, linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.savefig('models/loss_plot.png', dpi=300)
    plt.close()

def main():
    parser = argparse.ArgumentParser(description="Train KrishiCare MobileNetV2 model")
    parser.add_argument(
        "--quick",
        action="store_true",
        help="Faster training (8 epochs, batch 16) for local dev setup",
    )
    args = parser.parse_args()

    global BATCH_SIZE, EPOCHS
    if args.quick:
        BATCH_SIZE = 16
        EPOCHS = 8
        print("Quick mode: 8 epochs, batch size 16")

    print("Setting up dataset directories...")
    setup_directories()

    # Define directory paths
    train_dir = 'dataset/train'
    val_dir = 'dataset/val'
    test_dir = 'dataset/test'

    print("Loading datasets...")
    try:
        train_ds = tf.keras.utils.image_dataset_from_directory(
            train_dir,
            image_size=IMG_SIZE,
            batch_size=BATCH_SIZE,
            label_mode='categorical'
        )
        val_ds = tf.keras.utils.image_dataset_from_directory(
            val_dir,
            image_size=IMG_SIZE,
            batch_size=BATCH_SIZE,
            label_mode='categorical'
        )
        test_ds = tf.keras.utils.image_dataset_from_directory(
            test_dir,
            image_size=IMG_SIZE,
            batch_size=BATCH_SIZE,
            label_mode='categorical'
        )
        
        # Dynamically update NUM_CLASSES based on actual dataset
        global NUM_CLASSES
        NUM_CLASSES = len(train_ds.class_names)
        print(f"Detected {NUM_CLASSES} classes in dataset: {train_ds.class_names}")
        
        # Update class names file with actual classes
        with open('src/class_names.json', 'w') as f:
            json.dump(train_ds.class_names, f, indent=2)
        print(f"Updated class_names.json with {NUM_CLASSES} classes")
    except ValueError as e:
        print("\n" + "="*70)
        print("ERROR: Dataset directory is empty!")
        print("="*70)
        print("We created the required dataset directory structure automatically.")
        print("Please place your training, validation, and test images inside:")
        print("  ml-service/dataset/train/")
        print("  ml-service/dataset/val/")
        print("  ml-service/dataset/test/")
        print("\nUnder each folder, ensure images are in class directories:")
        print("  Tomato___healthy, Tomato___Early_blight, Tomato___Late_blight, etc.")
        print("  Potato___healthy, Potato___Early_blight, Potato___Late_blight")
        print("  Corn_(maize)___healthy, Corn_(maize)___Common_rust, etc.")
        print("  Apple___healthy, Apple___Apple_scab, etc.")
        print("  (38 classes total covering 30+ crops)")
        print("\nOr run: python src/download_dataset.py --max-per-class 200")
        print("\nThen run this training script again.")
        print("="*70 + "\n")
        return

    # Save class names mapping
    class_names = train_ds.class_names
    print(f"\nDetected Classes: {class_names}")
    with open('src/class_names.json', 'w') as f:
        json.dump(class_names, f, indent=4)
    print("Saved class names to src/class_names.json")

    def preprocess_batch(images, labels):
        images = tf.cast(images, tf.float32)
        images = tf.keras.applications.mobilenet_v2.preprocess_input(images)
        return images, labels

    train_ds = train_ds.map(preprocess_batch)
    val_ds = val_ds.map(preprocess_batch)
    test_ds = test_ds.map(preprocess_batch)

    # Prefetch for performance optimization
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.prefetch(buffer_size=AUTOTUNE)
    test_ds = test_ds.prefetch(buffer_size=AUTOTUNE)

    # Build model architecture
    print("\nBuilding model...")
    model = build_model()
    model.summary()

    # Train the neural network
    print("\nStarting model training...")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS,
        callbacks=[]
    )
    
    # Save model in Keras 3 format
    print("\nSaving trained model...")
    model.save('models/krishicare_mobilenetv2.keras')
    print("Model saved successfully in Keras format!")

    # Plot metrics
    print("\nGenerating accuracy and loss plots...")
    plot_history(history)
    print("Plots saved in models/ directory.")

    # Evaluate final best model on test data
    print("\nEvaluating on test dataset...")
    test_loss, test_acc = model.evaluate(test_ds)
    print(f"\nTest Accuracy: {test_acc * 100:.2f}%")
    print(f"Test Loss: {test_loss:.4f}")

if __name__ == '__main__':
    main()
