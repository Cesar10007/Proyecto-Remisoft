from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.gemini_analyzer import consultar

app = FastAPI(title="RemiSoft IA", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "IA RemiSoft activa"}

@app.post("/ia/consultar")
def hacer_consulta(body: dict):
    pregunta = body.get("pregunta", "")
    return consultar(pregunta)