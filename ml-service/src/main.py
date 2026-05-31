import os
import io
import json
import numpy as np
import tensorflow as tf
from PIL import Image
from contextlib import asynccontextmanager
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Global references for model and classification names
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
    model_path = 'models/krishicare_mobilenetv2.h5'
    class_names_path = 'src/class_names.json'
    
    if os.path.exists(model_path):
        print("Loading trained MobileNetV2 model...")
        model = tf.keras.models.load_model(model_path)
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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    """Verify service health and model initialization status."""
    return {
        "status": "healthy",
        "service": "KrishiCare AI ML Service",
        "model_loaded": model is not None
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """Perform crop disease prediction on uploaded leaf image."""
    global model, class_names
    
    # Reload model on-the-fly if it was trained post-startup
    if model is None or class_names is None:
        model_path = 'models/krishicare_mobilenetv2.h5'
        class_names_path = 'src/class_names.json'
        if os.path.exists(model_path) and os.path.exists(class_names_path):
            model = tf.keras.models.load_model(model_path)
            with open(class_names_path, 'r') as f:
                class_names = json.load(f)
        else:
            raise HTTPException(
                status_code=503, 
                detail="ML model is not loaded. Please train the model before requesting predictions."
            )

    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    try:
        # Load and convert image to RGB
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert('RGB')
        
        # Resize to MobileNetV2 input dimensions
        img_resized = img.resize((224, 224))
        img_array = np.array(img_resized)
        img_batch = np.expand_dims(img_array, axis=0)

        # Run inference
        predictions = model.predict(img_batch, verbose=0)
        score = predictions[0]
        predicted_class_idx = np.argmax(score)
        
        # Format prediction results
        raw_class_name = class_names[predicted_class_idx]
        readable_name = make_readable(raw_class_name)
        confidence = float(score[predicted_class_idx] * 100)

        return {
            "class": raw_class_name,
            "readable_class": readable_name,
            "confidence": round(confidence, 2)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
