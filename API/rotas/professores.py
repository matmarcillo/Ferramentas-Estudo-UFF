from fastapi import APIRouter, HTTPException
from psycopg2.extras import RealDictCursor
from api_types import CreateProfessor
from bdd import get_db

router = APIRouter(tags=["Professors"])

@router.post("/professor")
def create_professor(req: CreateProfessor):
    with get_db() as conn:
        with conn.cursor() as cursor:
            cursor.execute('SELECT id FROM professor WHERE email = %s', (req.email,))
            if cursor.fetchone() is not None:
                raise HTTPException(status_code=400, detail="Professor email already in use")

            cursor.execute(
                "INSERT INTO professor (nome, email, departamento) VALUES (%s, %s, %s) RETURNING id",
                (req.nome, req.email, req.departamento)
            )
            new_id = None
            conn.commit()
            return {"id": new_id, "message": "Professor created successfully"}

@router.get("/professor/{professor_id}")
def get_professor(professor_id: int):
    with get_db() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute('SELECT id, nome, email, departamento FROM professor WHERE id = %s', (professor_id,))
            prof = cursor.fetchone()
            if not prof:
                raise HTTPException(status_code=404, detail="Professor not found")
            return prof
