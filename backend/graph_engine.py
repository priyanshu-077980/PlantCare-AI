import os
import re
from typing import TypedDict, Annotated, Optional, List, Dict, Any
from pathlib import Path
from dotenv import load_dotenv

from langgraph.graph.message import add_messages
from langgraph.graph import StateGraph, START, END
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from backend.config import ACADEMICS_PDF, FEE_PDF, ROOT_ACADEMICS, ROOT_FEE, GROQ_MODEL

load_dotenv()

# Step 1 - Building Robust Retrievers
class SimpleDoc:
    def __init__(self, page_content: str, metadata: dict = None):
        self.page_content = page_content
        self.metadata = metadata or {}

class FallbackRetriever:
    """Fast, zero-download TF-IDF & keyword retriever that works offline without HuggingFace weights."""
    def __init__(self, chunks: List[SimpleDoc]):
        self.chunks = chunks
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
            from sklearn.metrics.pairwise import cosine_similarity
            self.vectorizer = TfidfVectorizer(stop_words='english')
            corpus = [c.page_content for c in self.chunks]
            if corpus:
                self.matrix = self.vectorizer.fit_transform(corpus)
                self.has_tfidf = True
            else:
                self.has_tfidf = False
        except Exception:
            self.has_tfidf = False

    def invoke(self, query: str, k: int = 4) -> List[SimpleDoc]:
        if not self.chunks:
            return []
        if self.has_tfidf:
            try:
                from sklearn.metrics.pairwise import cosine_similarity
                q_vec = self.vectorizer.transform([query])
                scores = cosine_similarity(q_vec, self.matrix)[0]
                top_indices = scores.argsort()[::-1][:k]
                return [self.chunks[i] for i in top_indices if scores[i] > 0] or self.chunks[:k]
            except Exception:
                pass
        
        # Simple word-overlap fallback
        q_words = set(re.findall(r'\w+', query.lower()))
        scored = []
        for c in self.chunks:
            c_words = set(re.findall(r'\w+', c.page_content.lower()))
            overlap = len(q_words & c_words)
            scored.append((overlap, c))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored[:k]]


def load_pdf_chunks(pdf_path: str) -> List[Any]:
    path = Path(pdf_path)
    if not path.exists():
        # Fallback to root path if exists
        root_path = Path.cwd() / path.name
        if root_path.exists():
            path = root_path
        else:
            return [SimpleDoc(page_content=f"Document {path.name} is currently not loaded on server.", metadata={"source": path.name})]
    
    try:
        loader = PyPDFLoader(str(path))
        documents = loader.load()
        splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
        chunks = splitter.split_documents(documents)
        return chunks
    except Exception as e:
        print(f"Error loading {pdf_path}: {e}")
        return [SimpleDoc(page_content=f"Error reading {path.name}: {e}", metadata={"source": path.name})]


def build_retriever(pdf_path: str):
    chunks = load_pdf_chunks(pdf_path)
    
    # Try HuggingFace + FAISS first if sentence-transformers is ready
    try:
        from langchain_huggingface import HuggingFaceEmbeddings
        from langchain_community.vectorstores import FAISS
        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        vectorstore = FAISS.from_documents(chunks, embeddings)
        return vectorstore.as_retriever(search_kwargs={"k": 4}), "faiss"
    except Exception as e:
        print(f"Using lightweight TF-IDF retriever for {pdf_path} (Reason: {e})")
        return FallbackRetriever(chunks), "tfidf"


# Global state for retrievers
academic_retriever = None
fee_retriever = None
retriever_type = "uninitialized"

def initialize_retrievers():
    global academic_retriever, fee_retriever, retriever_type
    acad_path = str(ACADEMICS_PDF if ACADEMICS_PDF.exists() else (ROOT_ACADEMICS if ROOT_ACADEMICS.exists() else "academics_handbook.pdf"))
    fee_path = str(FEE_PDF if FEE_PDF.exists() else (ROOT_FEE if ROOT_FEE.exists() else "fee_structure.pdf"))
    
    academic_retriever, r1_type = build_retriever(acad_path)
    fee_retriever, r2_type = build_retriever(fee_path)
    retriever_type = r1_type
    print(f"Retrievers initialized: type={retriever_type}")

# State Definition
class AssistantState(TypedDict):
    programme: str
    messages: Annotated[list, add_messages]
    query_type: str
    retrieved_context: str
    sources: List[str]
    api_key: Optional[str]


def get_llm(api_key: Optional[str] = None):
    key = api_key or os.getenv("GROQ_API_KEY", "")
    if not key:
        return None
    try:
        from langchain_groq import ChatGroq
        return ChatGroq(model=GROQ_MODEL, temperature=0.4, groq_api_key=key)
    except Exception as e:
        print(f"Error instantiating ChatGroq: {e}")
        return None


def generate_offline_response(query: str, programme: str, category: str, context: str) -> str:
    """Smart offline response generator when Groq API key is not yet configured."""
    q_lower = query.lower()
    
    if category == "academic":
        if "attendance" in q_lower:
            return (
                f"**Attendance Policy ({programme})**\n\n"
                f"• **Mandatory Requirement:** You must maintain at least **75% attendance** in lectures, practicals, and tutorials.\n"
                f"• **Medical Condonation:** Up to 10% relaxation is permitted on genuine medical grounds (hospitalization), requiring a minimum of 65%.\n"
                f"• **Debarment:** Students falling below 75% without authorized condonation will be awarded an 'F-Debarred' grade and will not be permitted to take the final exams."
            )
        elif "internship" in q_lower or "summer" in q_lower or "training" in q_lower:
            spec = "practical software development / data analytics" if programme == "BCA" else ("market research / sales / finance" if programme == "BBA" else "auditing, banking & tax filing")
            return (
                f"**Summer Internship Guidelines ({programme})**\n\n"
                f"• **Duration:** 6 to 8 weeks mandatory corporate/industrial internship after Semester 4.\n"
                f"• **Focus for {programme}:** {spec}.\n"
                f"• **Evaluation:** Submission of a project report and viva-voce carries **4 academic credits** in Semester 5."
            )
        elif "grading" in q_lower or "passing" in q_lower or "exam" in q_lower:
            return (
                f"**Examination & Grading Scheme ({programme})**\n\n"
                f"• **Passing Criteria:** Minimum 40% aggregate marks (Grade Point 4.0 / Grade D).\n"
                f"• **Evaluation Split:** Continuous Internal Assessment carries 30% (Mid-term: 15%, Assignments & Quizzes: 10%, Attendance: 5%) and End-Semester Exam carries 70%.\n"
                f"• **10-Point Scale:** O (90-100%, 10 pts), A+ (80-89%, 9 pts), A (70-79%, 8 pts), B+ (60-69%, 7 pts), D (40-49%, 4 pts)."
            )
        elif "promotion" in q_lower or "credit" in q_lower or "backlog" in q_lower:
            return (
                f"**Promotion & Credit Policy ({programme})**\n\n"
                f"• **Total Programme Credits:** 120 Credits across 6 semesters.\n"
                f"• **1st to 2nd Year Promotion:** Must clear at least 50% of 1st year credits.\n"
                f"• **2nd to 3rd Year Promotion:** Must earn 50% cumulative credits with no more than 4 backlogs from 1st year."
            )
        else:
            return (
                f"**Academic Information for {programme}**\n\n"
                f"Based on the official Academic Handbook:\n\n{context[:600]}...\n\n"
                f"*(Tip: Add your Groq API Key in Settings to get fully generative reasoning with Llama 3.3)*"
            )

    elif category == "fee":
        fee_map = {
            "BCA": {"tuition": "Rs. 45,000", "lab": "Rs. 8,000", "total": "Rs. 57,000", "annual": "Rs. 1,14,000"},
            "BBA": {"tuition": "Rs. 40,000", "lab": "Rs. 6,000", "total": "Rs. 50,000", "annual": "Rs. 1,00,000"},
            "B.Com (H)": {"tuition": "Rs. 35,000", "lab": "Rs. 5,000", "total": "Rs. 43,000", "annual": "Rs. 86,000"}
        }
        details = fee_map.get(programme, fee_map["BCA"])
        
        if "scholarship" in q_lower or "discount" in q_lower or "waiver" in q_lower:
            return (
                f"**Scholarships & Financial Aid ({programme})**\n\n"
                f"• **Tier 1 Merit:** 90%+ in 12th Board = **50% Tuition Fee waiver** for 1st year.\n"
                f"• **Tier 2 Merit:** 80% - 89.9% in 12th Board = **25% Tuition Fee waiver** for 1st year.\n"
                f"• **Retention:** Maintain a CGPA of 8.5 or higher with no backlogs in subsequent semesters.\n"
                f"• **Sports & Need-based:** Up to 35% tuition waiver available upon committee approval."
            )
        elif "late" in q_lower or "fine" in q_lower or "penalty" in q_lower:
            return (
                f"**Late Payment Fine Schedule**\n\n"
                f"• **Days 1 to 10 past due date:** **Rs. 100 per calendar day**.\n"
                f"• **Days 11 to 25:** Flat penalty of **Rs. 2,500**.\n"
                f"• **Beyond 25 Days:** Student portal is locked and examination hall tickets are withheld until clearance."
            )
        elif "refund" in q_lower or "cancel" in q_lower or "withdraw" in q_lower:
            return (
                f"**Fee Refund Policy**\n\n"
                f"• **15+ days prior to class commencement:** 100% refund (minus Rs. 1,000 admin charge).\n"
                f"• **Within 15 days of class start:** 80% tuition refund.\n"
                f"• **16 to 30 days:** 50% tuition refund.\n"
                f"• **After 30 days:** Only the Rs. 10,000 refundable caution deposit is returned."
            )
        else:
            return (
                f"**Fee Structure for {programme} (AY 2026-2027)**\n\n"
                f"• **Tuition Fee:** {details['tuition']} / semester\n"
                f"• **Lab / Tech / Immersion Fee:** {details['lab']} / semester\n"
                f"• **Activity & Library Fee:** Included\n"
                f"• **Total Semester Fee:** **{details['total']}** (Annual: {details['annual']})\n"
                f"• **Refundable Caution Deposit:** Rs. 10,000 (one-time on admission)\n\n"
                f"**Due Dates:** Odd Semesters by **July 15th** | Even Semesters by **January 15th**."
            )

    else:
        return (
            f"Hello! I am your AI College Assistant for **{programme}** students. "
            f"You can ask me anything about attendance rules, exam dates, grading criteria, summer internships, semester fee amounts, payment due dates, and scholarships. How can I assist you today?"
        )


# Step 3 - Nodes
def classifier_node(state: AssistantState) -> dict:
    last_message = state['messages'][-1].content
    llm = get_llm(state.get("api_key"))

    if llm:
        prompt = (
            "Classify the following student query into exactly one category: "
            "'academic', 'fee', or 'general'.\n\n"
            "Use 'academic' for questions about attendance, exams, grading, credits, "
            "promotion, course structure, summer training, or degree requirements.\n"
            "Use 'fee' for questions about tuition, payment, refund, late charges, "
            "scholarships, or any money-related topic.\n"
            "Use 'general' for greetings, casual talk, or anything not related to "
            "the college rules or fee.\n\n"
            f"Query: {last_message}\n\n"
            "Return only one word: academic, fee, or general."
        )
        try:
            response = llm.invoke(prompt)
            category = response.content.strip().lower()
            if "academic" in category:
                category = "academic"
            elif "fee" in category:
                category = "fee"
            else:
                category = "general"
            return {"query_type": category}
        except Exception as e:
            print(f"Classification via LLM failed ({e}), using rule heuristic.")

    # Heuristic Classification
    q = last_message.lower()
    fee_keywords = ["fee", "tuition", "cost", "rupee", "rs", "payment", "due date", "late", "fine", "scholarship", "refund", "hostel", "transport", "bus", "money", "instalment"]
    academic_keywords = ["attendance", "exam", "grade", "grading", "marks", "credit", "promotion", "backlog", "internship", "summer", "training", "subject", "syllabus", "course", "debarred", "cgpa", "sgpa", "degree"]
    
    if any(k in q for k in fee_keywords):
        return {"query_type": "fee"}
    elif any(k in q for k in academic_keywords):
        return {"query_type": "academic"}
    else:
        return {"query_type": "general"}


def academic_rag_node(state: AssistantState) -> dict:
    global academic_retriever
    if academic_retriever is None:
        initialize_retrievers()
    
    query = state["messages"][-1].content
    docs = academic_retriever.invoke(query)
    context = "\n\n".join([doc.page_content for doc in docs])
    sources = list(set([doc.metadata.get("source", "academics_handbook.pdf") for doc in docs]))
    return {"retrieved_context": context, "sources": sources}


def fee_rag_node(state: AssistantState) -> dict:
    global fee_retriever
    if fee_retriever is None:
        initialize_retrievers()
        
    query = state["messages"][-1].content
    docs = fee_retriever.invoke(query)
    context = "\n\n".join([doc.page_content for doc in docs])
    sources = list(set([doc.metadata.get("source", "fee_structure.pdf") for doc in docs]))
    return {"retrieved_context": context, "sources": sources}


def general_node(state: AssistantState) -> dict:
    return {"retrieved_context": "NO_RETRIEVAL_NEEDED", "sources": []}


def response_node(state: AssistantState) -> dict:
    query = state["messages"][-1].content
    programme = state.get("programme", "BCA")
    category = state.get("query_type", "general")
    context = state.get("retrieved_context", "")
    llm = get_llm(state.get("api_key"))

    if llm:
        if context == "NO_RETRIEVAL_NEEDED":
            prompt = (
                f"You are a friendly college assistant talking to a {programme} student. "
                f"Answer this question warmly and concisely using your own general knowledge:\n\n{query}"
            )
        else:
            prompt = (
                f"You are a helpful college assistant helping a {programme} student. "
                f"Use the following official context from the college documents to answer the student's question accurately.\n"
                f"If the context mentions specific figures or rules for different programmes (BCA, BBA, B.Com (H)), "
                f"highlight the one relevant to {programme}.\n"
                f"Format your answer with clear markdown bullet points and bold highlights.\n\n"
                f"Context:\n{context}\n\n"
                f"Question: {query}\n\n"
                f"Give a clear, friendly, and precise answer."
            )
        try:
            response = llm.invoke(prompt)
            return {"messages": [("ai", response.content.strip())]}
        except Exception as e:
            print(f"LLM invoke failed: {e}. Falling back to offline generator.")

    # Offline Generator Fallback
    answer = generate_offline_response(query, programme, category, context)
    return {"messages": [("ai", answer)]}


def route_query(state: AssistantState):
    if state['query_type'] == 'academic':
        return "academic_rag"
    elif state['query_type'] == "fee":
        return "fee_rag"
    else:
        return "general"


# Build Graph
def create_graph_app():
    builder = StateGraph(AssistantState)
    builder.add_node("classifier", classifier_node)
    builder.add_node("academic_rag", academic_rag_node)
    builder.add_node("fee_rag", fee_rag_node)
    builder.add_node("general", general_node)
    builder.add_node("response", response_node)

    builder.add_edge(START, "classifier")
    builder.add_conditional_edges("classifier", route_query)
    builder.add_edge("academic_rag", "response")
    builder.add_edge("fee_rag", "response")
    builder.add_edge("general", "response")
    builder.add_edge("response", END)

    return builder.compile()

graph_app = create_graph_app()
