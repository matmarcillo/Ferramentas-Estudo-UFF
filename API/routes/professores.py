from fastapi import APIRouter, HTTPException
from psycopg2.extras import RealDictCursor
from api_types import CreateProfessor
from bdd import get_db

router = APIRouter(tags=["Professors"])

@router.post("/professor")
def create_professor(req: CreateProfessor):
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute('SELECT id FROM professor WHERE email = %s', (req.email,))
                if cursor.fetchone() is not None:
                    raise HTTPException(status_code=400, detail="Professor email already in use")

                cursor.execute(
                    "INSERT INTO professor (nome, email, departamento) VALUES (%s, %s, %s) RETURNING id",
                    (req.nome, req.email, req.departamento)
                )
                new_id = cursor.fetchone()[0]
                conn.commit()
                return {"id": new_id, "message": "Professor created successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating professor: {str(e)}")

@router.get("/professors")
def get_professors():
    try:
        with get_db() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute('SELECT id, nome, departamento FROM professor ORDER BY nome ASC')
                return cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching professors: {str(e)}")

@router.get("/professor/{professor_id}")
def get_professor(professor_id: int):
    try:
        with get_db() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute('SELECT id, nome, email, departamento FROM professor WHERE id = %s', (professor_id,))
                prof = cursor.fetchone()
                if not prof:
                    raise HTTPException(status_code=404, detail="Professor not found")
                return prof
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching professor: {str(e)}")

@router.get("/professor/{professor_id}/avaliacoes")
def get_professor_reviews(professor_id: int):
    try:
        with get_db() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute('''
                    SELECT av.id, av.estudante_id, av.semestro_id, 
                           av.metrica_1, av.metrica_2, av.metrica_3
                    FROM avaliacao_professor av 
                    WHERE av.professor_id = %s
                ''', (professor_id,))
                return cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching professor reviews: {str(e)}")
