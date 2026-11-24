# 🎓 CampusAI - College Academic & Fee Assistant

A full-stack AI Assistant application built with **React (Tailwind CSS + Vite)** on the frontend and **FastAPI + LangGraph** on the backend. It features multi-route RAG (Retrieval-Augmented Generation) over official college handbooks and fee structures tailored for different student programmes (BCA, BBA, B.Com (H)).

---

## 🚀 Tech Stack

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS (Modern dark mode UI)
- **Icons:** Lucide React
- **Features:**
  - Real-time Degree Programme switcher (BCA, BBA, B.Com (H))
  - Intelligent Query Routing Category badges (`Academic RAG`, `Fee RAG`, `Direct Response`)
  - Retrieved Context & Source document inspection drawer
  - PDF Knowledge Base management & upload modal
  - Groq API Key & Model settings modal
  - Frequently asked question quick-prompts

### Backend
- **Framework:** FastAPI + Uvicorn
- **AI / Multi-Agent Flow:** LangGraph StateGraph
- **LLM:** ChatGroq (`llama-3.3-70b-versatile`)
- **Embeddings & Vectorstore:** HuggingFace `sentence-transformers/all-MiniLM-L6-v2` + FAISS (with built-in offline TF-IDF fallback)
- **Document Processing:** PyPDFLoader + RecursiveCharacterTextSplitter

---

## 📂 Project Structure

```
SCHOOL SYSTEM/
├── backend/
│   ├── config.py           # Configuration, paths, programmes data
│   ├── graph_engine.py     # LangGraph workflow, nodes, retrievers & fallback engine
│   └── main.py             # FastAPI endpoints, CORS, file upload & static mounting
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx              # Navbar with health status & actions
│   │   │   ├── ProgrammeSelector.jsx   # BCA / BBA / B.Com (H) switcher
│   │   │   ├── ChatMessage.jsx         # Message bubble with routing badge
│   │   │   ├── ChatInput.jsx           # Auto-resizing input with keyboard shortcuts
│   │   │   ├── QuickQuestions.jsx      # Suggested inquiry chips
│   │   │   ├── ContextDrawer.jsx       # Side drawer showing RAG chunks
│   │   │   ├── KnowledgeBaseModal.jsx  # PDF document viewer & uploader
│   │   │   └── SettingsModal.jsx       # Groq API key configuration
│   │   ├── services/api.js             # API client methods
│   │   ├── App.jsx                     # Main React application
│   │   └── index.css                   # Tailwind styles
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── academics_handbook.pdf  # Generated sample college academic regulations
├── fee_structure.pdf       # Generated sample college fee schedule
├── conditional.py          # Original LangGraph script (preserved)
├── requirements.txt        # Python backend dependencies
├── start_all.bat           # One-click start script for both services
├── start_backend.bat       # Start FastAPI on port 8000
└── start_frontend.bat      # Start Vite dev server on port 5173
```

---

## ⚡ How to Run

### Option 1: One-Click Start (Recommended)
Double-click `start_all.bat` or run:
```powershell
.\start_all.bat
```
This automatically launches both the FastAPI backend and Vite frontend in separate terminal windows!

### Option 2: Run Separately

#### 1. Start the FastAPI Backend:
```powershell
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Health: `http://127.0.0.1:8000/api/health`
- Interactive Swagger Docs: `http://127.0.0.1:8000/docs`
- Production Web App: `http://127.0.0.1:8000/` (FastAPI directly serves the built React frontend!)

#### 2. Start the Vite React Frontend (for live hot-reload development):
```powershell
cd frontend
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🔑 Groq API Key Setup

1. Open the web app at `http://localhost:5173`.
2. Click on the **Settings** button in the top navbar.
3. Paste your Groq API Key (`gsk_...`) and click **Save Settings**.
4. The key is automatically stored in your local `.env` file.
*(Note: Even without an API key, the system works offline using the built-in handbook knowledge engine for testing!)*

---

## 🎯 LangGraph Multi-RAG Routing Logic

1. **Classifier Node:** Uses LLM or intent classifier to label query as `academic`, `fee`, or `general`.
2. **Conditional Router:**
   - `academic` ➔ queries `academic_rag` node (retrieves chunks from `academics_handbook.pdf`).
   - `fee` ➔ queries `fee_rag` node (retrieves chunks from `fee_structure.pdf`).
   - `general` ➔ routes to `general` node (direct response).
3. **Response Node:** Tailors the response specifically to the student's selected degree programme (BCA, BBA, or B.Com (H)) with transparent citations.
