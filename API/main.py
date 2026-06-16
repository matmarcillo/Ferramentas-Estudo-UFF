import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import usuarios, disciplinas, professores, geral, documentos, avaliacao, admin
from bdd import get_db
from tier_system import set_double_xp

app = FastAPI(title="Game Analytics API")

@app.on_event("startup")
def startup_event():
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT value FROM system_config WHERE key = 'double_xp_active'")
                row = cursor.fetchone()
                if row:
                    set_double_xp(row[0] == 'true')
    except Exception as e:
        print(f"Error initializing Double XP status: {e}")

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
app.include_router(admin.router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
