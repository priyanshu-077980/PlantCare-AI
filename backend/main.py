import os
import shutil
import time
from typing import Optional, List, Dict, Any
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from backend.config import (
    BASE_DIR,
    DOCUMENTS_DIR,
    ACADEMICS_PDF,
    FEE_PDF,
    PROGRAMMES,
    SAMPLE_QUESTIONS,
    GROQ_API_KEY,
    GROQ_MODEL
)
from backend.graph_engine import (
    graph_app,
    initialize_retrievers,
    build_retriever,
    retriever_type
)

app = FastAPI(
    title="College Academic & Fee Assistant API",
    description="FastAPI Backend for LangGraph-powered College School System Assistant",
    version="1.0.0"
)

# Enable CORS for Vite frontend (typically port 5173 or other local ports)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to warm up retrievers
@app.on_event("startup")
def on_startup():
    try:
        initialize_retrievers()
    except Exception as e:
        print(f"Warning on startup retriever initialization: {e}")


# Schemas
class ChatRequest(BaseModel):
    message: str
    programme: str = "BCA"
    api_key: Optional[str] = None
    history: Optional[List[Dict[str, str]]] = []

class ChatResponse(BaseModel):
    reply: str
    category: str  # academic | fee | general
    programme: str
    sources: List[str]
    retrieved_context: Optional[str] = None
    latency_ms: int

class SettingsRequest(BaseModel):
    api_key: str
    model: Optional[str] = "llama-3.3-70b-versatile"

# Endpoints
@app.get("/api/health")
def health_check():
    key_configured = bool(os.getenv("GROQ_API_KEY") or GROQ_API_KEY)
    acad_exists = ACADEMICS_PDF.exists() or (BASE_DIR / "academics_handbook.pdf").exists()
    fee_exists = FEE_PDF.exists() or (BASE_DIR / "fee_structure.pdf").exists()

    return {
        "status": "online",
        "service": "College Assistant API",
        "groq_configured": key_configured,
        "active_model": os.getenv("GROQ_MODEL", GROQ_MODEL),
        "documents": {
            "academics_handbook": acad_exists,
            "fee_structure": fee_exists
        },
        "retriever_type": retriever_type
    }

@app.get("/api/programmes")
def get_programmes():
    return {"programmes": PROGRAMMES}

@app.get("/api/sample-queries")
def get_sample_queries(programme: Optional[str] = "BCA"):
    return {
        "programme": programme,
        "questions": SAMPLE_QUESTIONS
    }

@app.post("/api/chat", response_model=ChatResponse)
def chat_endpoint(payload: ChatRequest):
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    
    start_time = time.time()
    
    # Run through the LangGraph StateGraph
    try:
        inputs = {
            "programme": payload.programme,
            "messages": [("human", payload.message)],
            "api_key": payload.api_key or os.getenv("GROQ_API_KEY", "")
        }
        
        result = graph_app.invoke(inputs)
        
        reply = result["messages"][-1].content
        category = result.get("query_type", "general")
        context = result.get("retrieved_context", "")
        sources = result.get("sources", [])
        
        latency = int((time.time() - start_time) * 1000)
        
        return ChatResponse(
            reply=reply,
            category=category,
            programme=payload.programme,
            sources=sources,
            retrieved_context=context if context != "NO_RETRIEVAL_NEEDED" else None,
            latency_ms=latency
        )
    except Exception as e:
        print(f"Chat graph error: {e}")
        raise HTTPException(status_code=500, detail=f"Assistant processing failed: {str(e)}")

@app.get("/api/documents")
def list_documents():
    docs = []
    for f in [ACADEMICS_PDF, FEE_PDF]:
        root_alt = BASE_DIR / f.name
        target = f if f.exists() else (root_alt if root_alt.exists() else None)
        if target and target.exists():
            stat = target.stat()
            docs.append({
                "filename": target.name,
                "size_kb": round(stat.st_size / 1024, 1),
                "modified": time.ctime(stat.st_mtime),
                "status": "Indexed"
            })
        else:
            docs.append({
                "filename": f.name,
                "size_kb": 0,
                "modified": "Not Found",
                "status": "Missing"
            })
            
    # Also include any custom uploaded docs in documents dir
    if DOCUMENTS_DIR.exists():
        for file_path in DOCUMENTS_DIR.glob("*.pdf"):
            if file_path.name not in ["academics_handbook.pdf", "fee_structure.pdf"]:
                stat = file_path.stat()
                docs.append({
                    "filename": file_path.name,
                    "size_kb": round(stat.st_size / 1024, 1),
                    "modified": time.ctime(stat.st_mtime),
                    "status": "Custom Document"
                })
                
    return {"documents": docs}

@app.post("/api/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    doc_type: str = Form("custom") # academic | fee | custom
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)
    
    target_filename = file.filename
    if doc_type == "academic":
        target_filename = "academics_handbook.pdf"
    elif doc_type == "fee":
        target_filename = "fee_structure.pdf"
        
    save_path = DOCUMENTS_DIR / target_filename
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Also update in root directory if standard file
    if target_filename in ["academics_handbook.pdf", "fee_structure.pdf"]:
        shutil.copy(save_path, BASE_DIR / target_filename)
        
    # Re-initialize retrievers with new document
    try:
        initialize_retrievers()
    except Exception as e:
        print(f"Error refreshing retrievers after upload: {e}")
        
    return {
        "success": True,
        "message": f"Successfully uploaded and re-indexed {target_filename}",
        "filename": target_filename
    }

@app.post("/api/settings")
def update_settings(payload: SettingsRequest):
    os.environ["GROQ_API_KEY"] = payload.api_key.strip()
    if payload.model:
        os.environ["GROQ_MODEL"] = payload.model.strip()
        
    # Write to .env file for persistence
    env_file = BASE_DIR / ".env"
    env_lines = []
    if env_file.exists():
        with open(env_file, "r") as f:
            env_lines = f.readlines()
            
    key_written = False
    model_written = False
    new_lines = []
    for line in env_lines:
        if line.startswith("GROQ_API_KEY="):
            new_lines.append(f"GROQ_API_KEY={payload.api_key.strip()}\n")
            key_written = True
        elif line.startswith("GROQ_MODEL="):
            new_lines.append(f"GROQ_MODEL={payload.model.strip()}\n")
            model_written = True
        else:
            new_lines.append(line)
            
    if not key_written:
        new_lines.append(f"GROQ_API_KEY={payload.api_key.strip()}\n")
    if not model_written and payload.model:
        new_lines.append(f"GROQ_MODEL={payload.model.strip()}\n")
        
    with open(env_file, "w") as f:
        f.writelines(new_lines)
        
    return {
        "success": True,
        "message": "Groq settings updated and saved to .env",
        "has_key": bool(payload.api_key.strip()),
        "model": payload.model
    }

# Mount built React Vite Frontend for standalone single-server serving
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIST), html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
