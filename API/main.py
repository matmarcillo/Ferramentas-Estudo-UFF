import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import usuarios, disciplinas, professores, geral, documentos, avaliacao

app = FastAPI(title="Game Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(usuarios.router)
app.include_router(disciplinas.router)
app.include_router(professores.router)
app.include_router(geral.router)
app.include_router(documentos.router)
app.include_router(avaliacao.router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
