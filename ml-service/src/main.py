import os
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

MODEL_VERSION = "mobilenetv2-v2"

# Resolve paths relative to the directory containing main.py
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH_KERAS = os.path.join(BASE_DIR, 'models', 'krishicare_mobilenetv2.keras')
MODEL_PATH_H5 = os.path.join(BASE_DIR, 'models', 'krishicare_mobilenetv2.h5')
MODEL_PATH_SAVED = os.path.join(BASE_DIR, 'models', 'krishicare_mobilenetv2')
CLASS_NAMES_PATH = os.path.join(BASE_DIR, 'src', 'class_names.json')

model = None
class_names = None

def make_readable(class_name):
    """Convert raw dataset folder names to beautiful, user-friendly labels."""
    parts = class_name.split('___')
    if len(parts) == 2:
        crop = parts[0]
        disease = parts[1].replace('_', ' ').title()
        return f"{crop} ({disease})"
    return class_name.replace('___', ' - ').replace('_', ' ')

def load_model_and_classes():
    """Load the model and class mapping if not already loaded."""
    global model, class_names
    if model is not None and class_names is not None:
        return True

    print("Loading model and classes dynamically...")
    # Try loading model from Keras format first, then H5, then SavedModel
    model_loaded = False
    for model_path in [MODEL_PATH_KERAS, MODEL_PATH_H5, MODEL_PATH_SAVED]:
        if os.path.exists(model_path):
            try:
                print(f"Loading trained MobileNetV2 model from {model_path}...")
                model = tf.keras.models.load_model(
                    model_path,
                    compile=False,
                    safe_mode=False,
                )
                print(f"Model loaded successfully from {model_path}")
                model_loaded = True
                break
            except Exception as e:
                print(f"Error loading model from {model_path}: {e}")
                continue

    if os.path.exists(CLASS_NAMES_PATH):
        try:
            with open(CLASS_NAMES_PATH, 'r') as f:
                class_names = json.load(f)
            print(f"Loaded {len(class_names)} class names from {CLASS_NAMES_PATH}")
        except Exception as e:
            print(f"Error loading class names: {e}")
            class_names = None

    return model is not None and class_names is not None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Pre-load ML model and class labels at application startup."""
    print(f"Starting ML Service - Model Version: {MODEL_VERSION}")
    load_model_and_classes()
    yield

app = FastAPI(
    title="KrishiCare AI ML Microservice",
    description="Dedicated microservice exposing MobileNetV2 crop health predictions.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS to allow internal Spring Boot API requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "https://krishi-care-ai.vercel.app",
    ],
    allow_credentials=True,
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
        "model_version": MODEL_VERSION
    }

@app.get("/ping")
def ping():
    """Lightweight endpoint for keep-alive pings to prevent Render sleep."""
    return {
        "status": "pong",
        "service": "KrishiCare AI ML Service",
        "timestamp": str(time.time())
    }

def run_inference(img_batch, class_idx=None, explain=False):
    predictions = model.predict(img_batch, verbose=0)
    score = predictions[0]
    top_indices = np.argsort(score)[::-1][:3]

    top_predictions = []
    for idx in top_indices:
        raw = class_names[int(idx)]
        top_predictions.append({
            "class": raw,
            "readable_class": make_readable(raw),
            "confidence": round(float(score[idx] * 100), 2)
        })

    best = top_predictions[0]
    result = {
        "class": best["class"],
        "readable_class": best["readable_class"],
        "confidence": best["confidence"],
        "model_version": MODEL_VERSION,
        "top_predictions": top_predictions
    }

    if explain:
        from src.gradcam import generate_gradcam_overlay
        idx = class_idx if class_idx is not None else int(top_indices[0])
        heatmap = generate_gradcam_overlay(model, img_batch, idx)
        if heatmap:
            result["heatmap_base64"] = heatmap

    return result

@app.post("/predict")
async def predict(file: UploadFile = File(...), explain: bool = False):
    """Perform crop disease prediction on uploaded leaf image."""
    if not load_model_and_classes():
        raise HTTPException(
            status_code=503, 
            detail="ML model is not loaded. Please train the model before requesting predictions."
        )

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert('RGB')
        img_resized = img.resize((224, 224))
        img_array = np.array(img_resized, dtype=np.float32)
        img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)
        img_batch = np.expand_dims(img_array, axis=0)

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, lambda: run_inference(img_batch, explain=explain))

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
