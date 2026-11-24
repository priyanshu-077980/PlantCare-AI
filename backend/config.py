import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
DOCUMENTS_DIR = BASE_DIR / "documents"
DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)

ACADEMICS_PDF = DOCUMENTS_DIR / "academics_handbook.pdf"
FEE_PDF = DOCUMENTS_DIR / "fee_structure.pdf"

# If root has the PDFs, ensure they exist in documents/ or link to root
ROOT_ACADEMICS = BASE_DIR / "academics_handbook.pdf"
ROOT_FEE = BASE_DIR / "fee_structure.pdf"

if ROOT_ACADEMICS.exists() and not ACADEMICS_PDF.exists():
    import shutil
    shutil.copy(ROOT_ACADEMICS, ACADEMICS_PDF)

if ROOT_FEE.exists() and not FEE_PDF.exists():
    import shutil
    shutil.copy(ROOT_FEE, FEE_PDF)

PROGRAMMES = [
    {
        "id": "BCA",
        "name": "Bachelor of Computer Applications",
        "code": "BCA",
        "duration": "3 Years (6 Semesters)",
        "badge": "Tech & AI",
        "description": "Programming, Web Tech, Database Systems, AI & Machine Learning",
        "semester_fee": "Rs. 57,000",
        "color": "indigo"
    },
    {
        "id": "BBA",
        "name": "Bachelor of Business Administration",
        "code": "BBA",
        "duration": "3 Years (6 Semesters)",
        "badge": "Management",
        "description": "Business Strategy, Marketing, Finance, HR & Business Analytics",
        "semester_fee": "Rs. 50,000",
        "color": "amber"
    },
    {
        "id": "B.Com (H)",
        "name": "Bachelor of Commerce (Honours)",
        "code": "B.Com (H)",
        "duration": "3 Years (6 Semesters)",
        "badge": "Commerce & Finance",
        "description": "Corporate Accounting, Tax Law, Auditing & Banking Operations",
        "semester_fee": "Rs. 43,000",
        "color": "emerald"
    }
]

SAMPLE_QUESTIONS = [
    {"category": "academic", "text": "What is the minimum attendance required to sit for semester exams?"},
    {"category": "academic", "text": "What are the rules and credits for the 4th semester summer internship?"},
    {"category": "academic", "text": "What is the passing criteria and grading scale for our subjects?"},
    {"category": "fee", "text": "What is the total fee per semester for my programme and what are the due dates?"},
    {"category": "fee", "text": "What is the late fee penalty if I delay payment by 10 days?"},
    {"category": "fee", "text": "What scholarships are available for students with high 12th board marks?"},
    {"category": "fee", "text": "What is the college fee refund policy if a student withdraws?"},
    {"category": "general", "text": "Can you give me tips to balance semester studies and coding projects?"}
]
