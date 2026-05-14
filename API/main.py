import uvicorn
from fastapi import FastAPI
from routes import usuarios, disciplinas, professores, geral, documentos, avaliacao

app = FastAPI(title="Game Analytics API")

app.include_router(usuarios.router)
app.include_router(disciplinas.router)
app.include_router(professores.router)
app.include_router(geral.router)
app.include_router(documentos.router)
app.include_router(avaliacao.router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
