import os
import io
import json
import asyncio
import numpy as np
import tensorflow as tf
from PIL import Image
from contextlib import asynccontextmanager
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

MODEL_VERSION = "mobilenetv2-v2"
MODEL_PATH = 'models/krishicare_mobilenetv2.h5'
CLASS_NAMES_PATH = 'src/class_names.json'

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

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Pre-load ML model and class labels at application startup."""
    global model, class_names
    model_path = MODEL_PATH
    class_names_path = CLASS_NAMES_PATH
    if os.path.exists(model_path):
        print("Loading trained MobileNetV2 model...")
        model = tf.keras.models.load_model(
            model_path,
            compile=False,
            safe_mode=False,
        )
    else:
        print(f"Warning: Model not found at '{model_path}'. Prediction endpoint will be disabled.")
        
    if os.path.exists(class_names_path):
        with open(class_names_path, 'r') as f:
            class_names = json.load(f)
    else:
        print(f"Warning: Class labels mapping not found at '{class_names_path}'.")
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
        "timestamp": str(asyncio.get_event_loop().time())
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
    global model, class_names
    
    if model is None or class_names is None:
        if os.path.exists(MODEL_PATH) and os.path.exists(CLASS_NAMES_PATH):
            model = tf.keras.models.load_model(MODEL_PATH, compile=False, safe_mode=False)
            with open(CLASS_NAMES_PATH, 'r') as f:
                class_names = json.load(f)
        else:
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
