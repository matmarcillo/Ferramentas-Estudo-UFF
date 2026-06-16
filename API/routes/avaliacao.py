from fastapi import APIRouter, HTTPException, Depends
from psycopg2.extras import RealDictCursor
from api_types import *
from bdd import get_db
from auth import get_current_user_id
from tier_system import EXP_REWARDS, get_xp_multiplier

router = APIRouter(tags=["Avaliação"])

@router.post("/avaliacao/disciplina")
def create_avaliacao(req: CreateAvaliacao, user_id: int = Depends(get_current_user_id)):
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT status_aprovacao FROM avaliacao_disciplina WHERE estudante_id = %s AND disciplina_id = %s AND semestro_id = %s",
                    (user_id, req.disciplina_id, req.semestre_id)
                )
                existing_eval = cursor.fetchall()
                if existing_eval:
                    for eval in existing_eval:
                        if eval[0] != "Reprovado":
                            raise HTTPException(status_code=400, detail="Você ja aprovou a disciplina e avaliou")


                cursor.execute(
                    "INSERT INTO avaliacao_disciplina (estudante_id, disciplina_id, semestro_id, professor_id, dificuldade, utilidade, interesse, carga_trabalho, status_aprovacao, comentario) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
                    (user_id, req.disciplina_id, req.semestre_id, req.professor_id, req.dificuldade, req.utilidade, req.interesse, req.carga_trabalho, req.status_aprovacao.value, req.comentario)
                )
                new_id = cursor.fetchone()[0]
                
                # Award EXP
                exp_to_add = EXP_REWARDS["review"] * get_xp_multiplier()
                cursor.execute(
                    "UPDATE usuarios SET exp = exp + %s WHERE id = %s",
                    (exp_to_add, user_id)
                )
                
                conn.commit()
                return {
                    "id": new_id, 
                    "message": "Avaliação de disciplina criada com sucesso",
                    "exp_earned": exp_to_add
                }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar avaliação de disciplina: {str(e)}")


@router.post("/avaliacao/professor")
def create_avaliacao_professor(req: CreateAvaliacaoProfessor, user_id: int = Depends(get_current_user_id)):
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("Select professor_id FROM avaliacao_professor WHERE estudante_id = %s AND professor_id = %s",
                               (user_id, req.professor_id))
                if cursor.fetchone():
                    raise HTTPException(status_code=400, detail="Você ja avaliou o professor.")

                cursor.execute(
                    "INSERT INTO avaliacao_professor (estudante_id, professor_id, semestro_id, pedagogia, organizacao, rigidez, comentario) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id",
                    (user_id, req.professor_id, req.semestre_id, req.pedagogia, req.organizacao, req.rigidez, req.comentario)
                )
                new_id = cursor.fetchone()[0]
                
                # Award EXP
                exp_to_add = EXP_REWARDS["review"] * get_xp_multiplier()
                cursor.execute(
                    "UPDATE usuarios SET exp = exp + %s WHERE id = %s",
                    (exp_to_add, user_id)
                )
                
                conn.commit()
                return {
                    "id": new_id, 
                    "message": "Avaliação de professor criada com sucesso",
                    "exp_earned": exp_to_add
                }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar avaliação de professor: {str(e)}")