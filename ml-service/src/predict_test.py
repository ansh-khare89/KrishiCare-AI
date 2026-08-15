import os
import json
import numpy as np
import tensorflow as tf
from PIL import Image

def make_readable(class_name):
    """Convert raw dataset folder names to readable labels."""
    parts = class_name.split('___')
    if len(parts) == 2:
        crop = parts[0]
        disease = parts[1].replace('_', ' ').title()
        return f"{crop} ({disease})"
    return class_name.replace('___', ' - ').replace('_', ' ')

class RandomColorJitter(tf.keras.layers.Layer):
    """Custom Keras layer for real-world color variation resilience."""
    def __init__(self, brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1, **kwargs):
        super().__init__(**kwargs)

def main():
    model_paths = [
        'models/krishicare_mobilenetv2.keras',
        'models/krishicare_mobilenetv2.h5',
        'models/krishicare_mobilenetv2'
    ]
    class_names_path = 'src/class_names.json'

    model = None
    for mp in model_paths:
        if os.path.exists(mp):
            try:
                print(f"Loading model from '{mp}'...")
                model = tf.keras.models.load_model(
                    mp,
                    custom_objects={'RandomColorJitter': RandomColorJitter},
                    compile=False
                )
                print(f"✓ Model '{mp}' loaded successfully!")
                break
            except Exception as e:
                print(f"Could not load '{mp}': {e}")

    if model is None:
        print("Error: No trained model found.")
        print("Please train the model first by running: python src/train_model.py")
        return

    if not os.path.exists(class_names_path):
        print(f"Error: Class mapping not found at '{class_names_path}'.")
        print("Please train the model first to generate it.")
        return

    with open(class_names_path, 'r') as f:
        class_names = json.load(f)
    print("Class mapping loaded successfully!\n")

    while True:
        img_path = input("Enter path to test image (or 'q' to quit): ").strip()
        if img_path.lower() == 'q':
            print("Exiting prediction test. Goodbye!")
            break

        if not os.path.exists(img_path):
            print(f"Error: File '{img_path}' does not exist.\n")
            continue

        try:
            # Load and format the target image
            img = Image.open(img_path).convert('RGB')
            img_resized = img.resize((224, 224))
            img_array = np.array(img_resized)
            img_batch = np.expand_dims(img_array, axis=0)

            # Perform prediction
            predictions = model.predict(img_batch, verbose=0)
            score = predictions[0]
            predicted_class_idx = np.argmax(score)
            
            # Map predicted index to label and confidence
            raw_class_name = class_names[predicted_class_idx]
            readable_name = make_readable(raw_class_name)
            confidence = score[predicted_class_idx] * 100

            print("\n" + "="*45)
            print(f"Prediction: {readable_name}")
            print(f"Confidence: {confidence:.2f}%")
            print("="*45 + "\n")

        except Exception as e:
            print(f"Error processing image: {e}\n")

if __name__ == '__main__':
    main()
