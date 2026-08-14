import base64
import io
import numpy as np
import tensorflow as tf
from PIL import Image


def _find_last_conv_layer(keras_model):
    """Find the name of the last convolutional layer with a 4D output tensor."""
    layers_to_search = keras_model.layers if hasattr(keras_model, 'layers') else [keras_model]
    for layer in reversed(layers_to_search):
        try:
            shape = layer.output.shape if hasattr(layer, 'output') else None
            if shape is not None and len(shape) == 4:
                return layer.name
        except Exception:
            pass
        if hasattr(layer, 'layers'):
            for sub in reversed(layer.layers):
                try:
                    sub_shape = sub.output.shape if hasattr(sub, 'output') else None
                    if sub_shape is not None and len(sub_shape) == 4:
                        return sub.name
                except Exception:
                    pass
    return None


def generate_gradcam_overlay(model, img_array, class_idx):
    """Return base64 PNG of Grad-CAM heatmap overlaid on the input image."""
    try:
        # Find backbone layer (sub-model with inner layers) or fallback to top-level model
        base_layer = None
        base_idx = -1
        for i, layer in enumerate(model.layers):
            if hasattr(layer, 'layers') and len(layer.layers) > 0:
                base_layer = layer
                base_idx = i
                break

        if base_layer is None:
            base_layer = model
            base_idx = -1

        last_conv_name = _find_last_conv_layer(base_layer)
        if last_conv_name is None:
            print("GradCAM: Could not find last conv layer.")
            return None

        # Build sub-models for base feature extraction and classifier head
        base_sub = tf.keras.models.Model(
            inputs=base_layer.inputs,
            outputs=[base_layer.get_layer(last_conv_name).output, base_layer.outputs[0]]
        )

        head_input = tf.keras.Input(shape=base_layer.outputs[0].shape[1:])
        x = head_input
        if base_idx >= 0 and base_idx < len(model.layers) - 1:
            for layer in model.layers[base_idx + 1:]:
                x = layer(x)
        head_sub = tf.keras.models.Model(head_input, x)

        # Preprocess input through layers prior to base_layer (e.g. data_augmentation)
        input_data = img_array
        if base_idx > 0:
            for layer in model.layers[:base_idx]:
                input_data = layer(input_data)

        with tf.GradientTape() as tape:
            conv_outputs, base_out = base_sub(input_data)
            tape.watch(conv_outputs)
            preds = head_sub(base_out)
            loss = preds[:, class_idx]

        grads = tape.gradient(loss, conv_outputs)
        if grads is None:
            print("GradCAM: tape.gradient returned None.")
            return None

        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        conv_outputs = conv_outputs[0]
        heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap)
        heatmap = tf.maximum(heatmap, 0) / (tf.reduce_max(heatmap) + 1e-8)
        heatmap = heatmap.numpy()

        heatmap = np.uint8(255 * heatmap)
        heatmap_img = Image.fromarray(heatmap).resize((224, 224), Image.Resampling.BILINEAR)

        original = img_array[0]
        original = (original - original.min()) / (original.max() - original.min() + 1e-8)
        original = np.uint8(original * 255)
        original_img = Image.fromarray(original).convert('RGB')

        heatmap_colored = Image.new('RGB', (224, 224), (255, 0, 0))
        heatmap_colored = Image.composite(
            heatmap_colored, original_img, heatmap_img.convert('L')
        )
        blended = Image.blend(original_img, heatmap_colored, 0.45)

        buf = io.BytesIO()
        blended.save(buf, format='PNG')
        return base64.b64encode(buf.getvalue()).decode('utf-8')
    except Exception as e:
        print(f"GradCAM error: {e}")
        return None

