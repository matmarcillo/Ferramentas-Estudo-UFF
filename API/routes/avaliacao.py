from fastapi import APIRouter, HTTPException, Depends
from psycopg2.extras import RealDictCursor
from api_types import *
from bdd import get_db
from auth import get_current_user_id

router = APIRouter(tags=["Avaliação"])

@router.post("/avaliacao/disciplina")
def create_avaliacao(req: CreateAvaliacao, user_id: int = Depends(get_current_user_id)):
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO avaliacao_disciplina (estudante_id, disciplina_id, semestro_id, professor_id, metrica_1, metrica_2, metrica_3, status_aprovacao, comentario) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
                    (user_id, req.disciplina_id, req.semestre_id, req.professor_id, req.metrica_1, req.metrica_2, req.metrica_3, req.status_aprovacao.value, req.comentario)
                )
                new_id = cursor.fetchone()[0]
                conn.commit()
                return {"id": new_id, "message": "Avaliação de disciplina criada com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar avaliação de disciplina: {str(e)}")


@router.post("/avaliacao/professor")
def create_avaliacao_professor(req: CreateAvaliacaoProfessor, user_id: int = Depends(get_current_user_id)):
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO avaliacao_professor (estudante_id, professor_id, semestro_id, metrica_1, metrica_2, metrica_3, comentario) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id",
                    (user_id, req.professor_id, req.semestre_id, req.metrica_1, req.metrica_2, req.metrica_3, req.comentario)
                )
                new_id = cursor.fetchone()[0]
                conn.commit()
                return {"id": new_id, "message": "Avaliação de professor criada com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar avaliação de professor: {str(e)}")