import os
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

import io
import json
import time
import asyncio
import numpy as np
import tensorflow as tf
from PIL import Image
from contextlib import asynccontextmanager
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

MODEL_VERSION = "efficientnetv2b0-v3"

# Confidence threshold: if best prediction < this value, flag as uncertain
CONFIDENCE_THRESHOLD = 35.0   # percent

# Resolve paths relative to this file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH_KERAS  = os.path.join(BASE_DIR, 'models', 'krishicare_mobilenetv2.keras')
MODEL_PATH_H5     = os.path.join(BASE_DIR, 'models', 'krishicare_mobilenetv2.h5')
MODEL_PATH_SAVED  = os.path.join(BASE_DIR, 'models', 'krishicare_mobilenetv2')
CLASS_NAMES_PATH  = os.path.join(BASE_DIR, 'src', 'class_names.json')

model         = None
class_names   = None
model_loading = False
load_error    = None
# Track which backbone preprocessing to use
is_efficientnet = False


def make_readable(class_name: str) -> str:
    """Convert raw dataset folder names to human-friendly labels."""
    parts = class_name.split('___')
    if len(parts) == 2:
        crop    = parts[0].replace('_', ' ').replace('(', '').replace(')', '').strip()
        disease = parts[1].replace('_', ' ').title()
        return f"{crop} — {disease}"
    return class_name.replace('___', ' — ').replace('_', ' ')


def warmup_model():
    """Perform a dummy prediction to force TensorFlow graph initialization and memory allocation."""
    global model
    if model is not None:
        try:
            print("Warming up TensorFlow model execution graph...")
            dummy_img = np.zeros((1, 224, 224, 3), dtype=np.float32)
            model.predict(dummy_img, verbose=0)
            print("Model warmup complete! Model is instantly ready for predictions.")
        except Exception as e:
            print(f"Model warmup failed: {e}")


def load_model_and_classes():
    """Load model and class mapping if not already loaded."""
    global model, class_names, is_efficientnet, model_loading, load_error
    if model is not None and class_names is not None:
        return True

    model_loading = True
    load_error = None
    try:
        print("Loading model and classes...")
        for model_path in [MODEL_PATH_KERAS, MODEL_PATH_H5, MODEL_PATH_SAVED]:
            if os.path.exists(model_path):
                try:
                    print(f"Loading model from {model_path} ...")
                    model = tf.keras.models.load_model(
                        model_path,
                        compile=False,
                        safe_mode=False,
                    )
                    # Detect backbone type from model name
                    model_name = getattr(model, 'name', '').lower()
                    is_efficientnet = 'efficient' in model_name
                    print(f"Model '{model.name}' loaded. EfficientNet mode: {is_efficientnet}")
                    warmup_model()
                    break
                except Exception as e:
                    print(f"Error loading {model_path}: {e}")
                    load_error = str(e)
                    continue

        if os.path.exists(CLASS_NAMES_PATH):
            try:
                with open(CLASS_NAMES_PATH, 'r') as f:
                    class_names = json.load(f)
                print(f"Loaded {len(class_names)} class names.")
            except Exception as e:
                print(f"Error loading class names: {e}")
                class_names = None
    finally:
        model_loading = False

    return model is not None and class_names is not None


def preprocess_image(img: Image.Image) -> np.ndarray:
    """Resize and preprocess a PIL image to match training pipeline."""
    img_resized = img.resize((224, 224))
    img_array   = np.array(img_resized, dtype=np.float32)
    if is_efficientnet:
        img_array = tf.keras.applications.efficientnet_v2.preprocess_input(img_array)
    else:
        img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)
    return np.expand_dims(img_array, axis=0)


async def keep_alive_task():
    """Background task to run a dummy inference periodically to prevent model sleep/cold-start."""
    while True:
        if model is not None:
            try:
                dummy_img = np.zeros((1, 224, 224, 3), dtype=np.float32)
                model.predict(dummy_img, verbose=0)
            except Exception as e:
                print(f"Keep-alive pulse failed: {e}")
        await asyncio.sleep(300)  # Pulse every 5 minutes


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Pre-load ML model asynchronously so server binds port 8000 instantly."""
    print(f"Starting ML Service — Model Version: {MODEL_VERSION}")
    loop = asyncio.get_running_loop()
    loop.run_in_executor(None, load_model_and_classes)
    bg_task = asyncio.create_task(keep_alive_task())
    yield
    bg_task.cancel()


app = FastAPI(
    title="KrishiCare AI ML Microservice",
    description="MobileNetV2/EfficientNetV2 crop disease prediction service.",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "KrishiCare AI ML Service",
        "model_loaded": model is not None,
        "model_loading": model_loading,
        "load_error": load_error,
        "model_version": MODEL_VERSION,
        "num_classes": len(class_names) if class_names else 0,
        "confidence_threshold": CONFIDENCE_THRESHOLD,
    }


@app.get("/ping")
def ping():
    """Lightweight keep-alive endpoint."""
    return {
        "status": "pong",
        "service": "KrishiCare AI ML Service",
        "timestamp": str(time.time())
    }


@app.get("/classes")
def get_classes():
    """Return all supported class names."""
    if not class_names:
        raise HTTPException(status_code=503, detail="Model not loaded.")
    return {
        "count": len(class_names),
        "classes": [
            {"raw": cn, "readable": make_readable(cn)}
            for cn in class_names
        ]
    }


def run_inference(img_batch, explain: bool = False) -> dict:
    predictions = model.predict(img_batch, verbose=0)
    score       = predictions[0]
    top_indices = np.argsort(score)[::-1][:5]   # top-5

    top_predictions = []
    for idx in top_indices:
        raw = class_names[int(idx)]
        top_predictions.append({
            "class":          raw,
            "readable_class": make_readable(raw),
            "confidence":     round(float(score[idx] * 100), 2),
        })

    best = top_predictions[0]
    is_low_confidence = best["confidence"] < CONFIDENCE_THRESHOLD

    result = {
        "class":             best["class"],
        "readable_class":    best["readable_class"],
        "confidence":        best["confidence"],
        "model_version":     MODEL_VERSION,
        "top_predictions":   top_predictions,
        "low_confidence":    is_low_confidence,
        # Warn when model is uncertain
        "warning": (
            "Low confidence — image may not be a plant leaf or disease is not in training set."
            if is_low_confidence else None
        ),
    }

    if explain:
        try:
            from src.gradcam import generate_gradcam_overlay
            idx     = int(top_indices[0])
            heatmap = generate_gradcam_overlay(model, img_batch, idx)
            if heatmap:
                result["heatmap_base64"] = heatmap
        except Exception as e:
            result["gradcam_error"] = str(e)

    return result


@app.post("/predict")
async def predict(file: UploadFile = File(...), explain: bool = False):
    """Perform crop disease prediction on an uploaded leaf image."""
    if model_loading:
        raise HTTPException(
            status_code=503,
            detail="ML model is waking up and loading into memory. Please try again in a few seconds."
        )

    if not load_model_and_classes():
        raise HTTPException(
            status_code=503,
            detail="ML model is not loaded. Train the model first."
        )

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    try:
        contents = await file.read()
        img      = Image.open(io.BytesIO(contents)).convert('RGB')
        img_batch = preprocess_image(img)

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, lambda: run_inference(img_batch, explain=explain)
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
