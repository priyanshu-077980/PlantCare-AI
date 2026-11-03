import json
from pathlib import Path
from io import BytesIO

import numpy as np
import tensorflow as tf

from PIL import Image, UnidentifiedImageError
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from chatbot import (
    get_ollama_status,
    stream_chat_response,
    non_stream_chat_response
)


# --------------------------------
# 1. Configuration
# --------------------------------

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "plant_disease_model.keras"
CLASS_NAMES_PATH = BASE_DIR / "class_names.json"

IMG_SIZE = 128

app = FastAPI(
    title="PlantCare AI API",
    description="CNN-based Plant Disease Classification API",
    version="1.0.0"
)


# --------------------------------
# 2. CORS Configuration
# --------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------
# 3. Load Model and Class Names
# --------------------------------

model = None
class_names = None


@app.on_event("startup")
def load_model():

    global model, class_names

    if not MODEL_PATH.exists():
        raise RuntimeError(
            f"Model file not found: {MODEL_PATH}"
        )

    if not CLASS_NAMES_PATH.exists():
        raise RuntimeError(
            f"Class names file not found: {CLASS_NAMES_PATH}"
        )

    h5_path = BASE_DIR / "plant_disease_model.h5"
    v3_path = BASE_DIR / "plant_disease_model_v3.keras"
    if v3_path.exists():
        model = tf.keras.models.load_model(v3_path, compile=False)
    elif h5_path.exists():
        model = tf.keras.models.load_model(h5_path, compile=False)
    elif MODEL_PATH.exists():
        with open(MODEL_PATH, "rb") as f_m:
            header = f_m.read(4)
        if header == b"\x89HDF":
            import shutil
            shutil.copyfile(MODEL_PATH, h5_path)
            model = tf.keras.models.load_model(h5_path, compile=False)
        else:
            model = tf.keras.models.load_model(MODEL_PATH, compile=False)

    with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as f:
        class_names = json.load(f)

    if not isinstance(class_names, list) or not class_names:
        raise RuntimeError(
            "class_names.json must contain a non-empty list."
        )

    output_classes = model.output_shape[-1]

    if output_classes != len(class_names):
        raise RuntimeError(
            f"Model outputs {output_classes} classes, "
            f"but class_names.json contains {len(class_names)}."
        )

    print("PlantCare AI model loaded successfully!")
    print("Number of classes:", len(class_names))


# --------------------------------
# 4. Health Check Endpoint
# --------------------------------

@app.get("/")
def home():

    return {
        "message": "Welcome to PlantCare AI API",
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    ollama_info = await get_ollama_status()
    return {
        "status": "healthy" if model is not None else "not_ready",
        "model_loaded": model is not None,
        "model_name": "Plant Disease CNN",
        "model_type": "Convolutional Neural Network (CNN)",
        "framework": "TensorFlow/Keras",
        "image_size": f"{IMG_SIZE} x {IMG_SIZE} x 3",
        "normalization": "Pixel values divided by 255",
        "num_classes": len(class_names) if class_names else 0,
        "classes": class_names if class_names else [],
        "ollama": ollama_info
    }


# --------------------------------
# 5. Image Preprocessing
# --------------------------------

def preprocess_image(image_bytes: bytes):

    try:
        with Image.open(BytesIO(image_bytes)) as img:

            img = img.convert("RGB")
            img = img.resize(
                (IMG_SIZE, IMG_SIZE),
                Image.Resampling.BILINEAR
            )

            image = np.asarray(
                img,
                dtype=np.float32
            )

    except (
        UnidentifiedImageError,
        OSError,
        ValueError
    ) as exc:

        raise HTTPException(
            status_code=400,
            detail="Invalid or corrupted image file."
        ) from exc

    # Same normalization as training: pixel values / 255
    image = image / 255.0

    # Add batch dimension: (1, 128, 128, 3)
    image = np.expand_dims(image, axis=0)

    return image


# --------------------------------
# 6. Prediction Endpoint
# --------------------------------

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    if model is None or class_names is None:
        raise HTTPException(
            status_code=503,
            detail="Model is not ready."
        )

    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/bmp"
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=415,
            detail="Upload a JPEG, PNG, WEBP or BMP image."
        )

    # Read image and enforce a 10 MB upload limit
    max_size = 10 * 1024 * 1024
    image_bytes = await file.read(max_size + 1)

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty."
        )

    if len(image_bytes) > max_size:
        raise HTTPException(
            status_code=413,
            detail="Image must be smaller than 10 MB."
        )

    # Preprocess
    image = preprocess_image(image_bytes)

    # Predict
    predictions = model.predict(
        image,
        verbose=0
    )[0]

    if len(predictions) != len(class_names):
        raise HTTPException(
            status_code=500,
            detail="Model output does not match class names."
        )

    # Get top 3 predictions
    top_indices = np.argsort(predictions)[::-1][:3]

    top_predictions = []

    for index in top_indices:

        top_predictions.append({
            "class_name": class_names[int(index)],
            "confidence": round(
                float(predictions[index]) * 100,
                2
            )
        })

    best_index = int(np.argmax(predictions))

    predicted_class = class_names[best_index]
    confidence = float(predictions[best_index]) * 100

    # Parse plant name & condition for SQL Server persistence
    return {
        "predicted_class": predicted_class,
        "confidence": round(confidence, 2),
        "status": "success",
        "top_predictions": top_predictions
    }


# --------------------------------
# 7. GenAI Chatbot Endpoints (Ollama)
# --------------------------------

class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: Optional[str] = None
    stream: Optional[bool] = True
    context: Optional[Dict[str, Any]] = None
    language: Optional[str] = "en"


@app.get("/api/chat/models")
@app.get("/chat/models")
async def chat_models():
    """
    Returns Ollama connection health and all available installed LLM models.
    """
    return await get_ollama_status()


@app.post("/api/chat")
@app.post("/chat")
async def chat_completion(request: ChatRequest):
    """
    GenAI Chatbot endpoint powered by Ollama.
    Supports token-by-token streaming via Server-Sent Events (SSE) or JSON response.
    """
    raw_messages = [{"role": m.role, "content": m.content} for m in request.messages]

    if request.stream:
        return StreamingResponse(
            stream_chat_response(
                messages=raw_messages,
                model=request.model,
                context=request.context,
                language=request.language
            ),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
    else:
        result = await non_stream_chat_response(
            messages=raw_messages,
            model=request.model,
            context=request.context,
            language=request.language
        )
        return result


