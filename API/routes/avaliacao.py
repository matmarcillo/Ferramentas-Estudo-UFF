from fastapi import APIRouter, HTTPException
from psycopg2.extras import RealDictCursor
from api_types import *
from bdd import get_db

router = APIRouter(tags=["Avaliação"])

@router.post("/avaliacao/disciplina")
def create_avaliacao(req: CreateAvaliacao):
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO avaliacao_disciplina (disciplina_id, semestre_id, nota, comentario) VALUES (%s, %s, %s, %s) RETURNING id",
                    (req.disciplina_id, req.semestre_id, req.nota, req.comentario)
                )
                new_id = cursor.fetchone()[0]
                conn.commit()
                return {"id": new_id, "message": "Avaliação de disciplina criada com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar avaliação de disciplina: {str(e)}")
    

@router.post("/avaliacao/professor")
def create_avaliacao_professor(req: CreateAvaliacaoProfessor):
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO avaliacao_professor (professor_id, semestre_id, nota, comentario) VALUES (%s, %s, %s, %s) RETURNING id",
                    (req.professor_id, req.semestre_id, req.nota, req.comentario)
                )
                new_id = cursor.fetchone()[0]
                conn.commit()
                return {"id": new_id, "message": "Avaliação de professor criada com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar avaliação de professor: {str(e)}")