import base64
import io
import numpy as np
import tensorflow as tf
from PIL import Image


def _find_last_conv_layer(keras_model):
  for layer in reversed(keras_model.layers):
    if len(layer.output_shape) == 4:
      return layer.name
    if hasattr(layer, 'layers'):
      for sub in reversed(layer.layers):
        if hasattr(sub, 'output_shape') and len(sub.output_shape) == 4:
          return sub.name
  return None


def generate_gradcam_overlay(model, img_array, class_idx):
  """Return base64 PNG of Grad-CAM heatmap overlaid on the input image."""
  try:
    base_layer = model.get_layer('mobilenetv2_1.00_224')
    last_conv_name = _find_last_conv_layer(base_layer)
    if last_conv_name is None:
      return None

    grad_model = tf.keras.models.Model(
        [model.inputs, base_layer.get_layer(last_conv_name).output],
        base_layer.get_layer(last_conv_name).output,
    )

    with tf.GradientTape() as tape:
      conv_outputs = grad_model(img_array)
      tape.watch(conv_outputs)
      preds = model(img_array)
      loss = preds[:, class_idx]

    grads = tape.gradient(loss, conv_outputs)
    if grads is None:
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
  except Exception:
    return None
