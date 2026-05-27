import os
import json
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow.keras import layers, models, callbacks

# Configuration constants
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 20
NUM_CLASSES = 6

def setup_directories():
    """Ensure necessary directories exist and create the expected structure."""
    os.makedirs('models', exist_ok=True)
    os.makedirs('src', exist_ok=True)
    
    # Dataset subfolders mapping
    dataset_dirs = ['dataset/train', 'dataset/val', 'dataset/test']
    classes = [
        'Tomato___healthy', 'Tomato___Early_blight', 'Tomato___Late_blight',
        'Potato___healthy', 'Potato___Early_blight', 'Potato___Late_blight'
    ]
    
    for base_dir in dataset_dirs:
        for cls in classes:
            os.makedirs(os.path.join(base_dir, cls), exist_ok=True)

def build_model():
    """Build the transfer learning model based on MobileNetV2."""
    # Data Augmentation pipeline to prevent overfitting
    data_augmentation = models.Sequential([
        layers.RandomFlip("horizontal_and_vertical"),
        layers.RandomRotation(0.2),
        layers.RandomZoom(0.2),
        layers.RandomContrast(0.2)
    ], name="data_augmentation")

    # Load pre-trained MobileNetV2 base model with ImageNet weights
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3),
        include_top=False,
        weights='imagenet'
    )
    base_model.trainable = False  # Freeze pre-trained weights

    # Input layer
    inputs = layers.Input(shape=(IMG_SIZE[0], IMG_SIZE[1], 3), name="input_image")
    
    # Apply data augmentation and normalization
    x = data_augmentation(inputs)
    # Preprocess inputs as required by MobileNetV2
    x = layers.Lambda(tf.keras.applications.mobilenet_v2.preprocess_input, name="mobilenetv2_preprocess")(x)
    
    # Extract features using base model in inference mode
    x = base_model(x, training=False)
    
    # Classification head
    x = layers.GlobalAveragePooling2D(name="global_pooling")(x)
    x = layers.Dropout(0.2, name="dropout")(x)
    outputs = layers.Dense(NUM_CLASSES, activation='softmax', name="classifier")(x)
    
    model = models.Model(inputs, outputs, name="KrishiCare_MobileNetV2")
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss='categorical_crossentropy',
        metrics=['accuracy']
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
        print("  Tomato___healthy, Tomato___Early_blight, Tomato___Late_blight")
        print("  Potato___healthy, Potato___Early_blight, Potato___Late_blight")
        print("\nThen run this training script again.")
        print("="*70 + "\n")
        return

    # Save class names mapping
    class_names = train_ds.class_names
    print(f"\nDetected Classes: {class_names}")
    with open('src/class_names.json', 'w') as f:
        json.dump(class_names, f, indent=4)
    print("Saved class names to src/class_names.json")

    # Prefetch for performance optimization
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.prefetch(buffer_size=AUTOTUNE)
    test_ds = test_ds.prefetch(buffer_size=AUTOTUNE)

    # Build model architecture
    print("\nBuilding model...")
    model = build_model()
    model.summary()

    # Training callbacks
    checkpoint = callbacks.ModelCheckpoint(
        filepath='models/krishicare_mobilenetv2.h5',
        monitor='val_loss',
        save_best_only=True,
        verbose=1
    )
    early_stopping = callbacks.EarlyStopping(
        monitor='val_loss',
        patience=5,
        restore_best_weights=True,
        verbose=1
    )
    reduce_lr = callbacks.ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.2,
        patience=3,
        min_lr=1e-6,
        verbose=1
    )

    # Train the neural network
    print("\nStarting model training...")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS,
        callbacks=[checkpoint, early_stopping, reduce_lr]
    )

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
