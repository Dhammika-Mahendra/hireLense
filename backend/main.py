from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import tempfile
import os

from utils.pdf_reader import extract_text_from_pdf
from utils.embedder import get_embedding
from utils.ranker import rank_resumes

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/rank")
async def rank_resumes_api(
    job_description: str = Form(...),
    resumes: List[UploadFile] = File(...)
):
    job_embedding = get_embedding(job_description)

    resume_embeddings = []
    resume_names = []

    for resume in resumes:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await resume.read())
            path = tmp.name

        text = extract_text_from_pdf(path)
        emb = get_embedding(text)

        resume_embeddings.append(emb)
        resume_names.append(resume.filename)

        os.remove(path)

    ranked = rank_resumes(job_embedding, resume_embeddings, resume_names)

    return {
        "results": [
            {"name": name, "score": round(score, 4)}
            for name, score in ranked
        ]
    }
