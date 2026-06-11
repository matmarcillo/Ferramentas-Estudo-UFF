from fastapi import APIRouter, HTTPException, Query, Depends
from psycopg2.extras import RealDictCursor
from api_types import CreateProfessor
from bdd import get_db
from auth import get_current_admin, get_current_user_id

router = APIRouter(tags=["Professors"])

@router.post("/professor")
def create_professor(req: CreateProfessor, user_id: int = Depends(get_current_user_id)):
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
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating professor: {str(e)}")

@router.delete("/professor/{professor_id}")
def delete_professor(professor_id: int, admin_id: int = Depends(get_current_admin)):
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                # Check for dependent records (evaluations)
                cursor.execute("SELECT id FROM avaliacao_professor WHERE professor_id = %s", (professor_id,))
                if cursor.fetchone():
                    raise HTTPException(status_code=400, detail="Cannot delete professor with associated evaluations")

                cursor.execute("DELETE FROM professor WHERE id = %s", (professor_id,))
                conn.commit()
                return {"message": "Professor deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting professor: {str(e)}")

@router.get("/professors")
def get_professors():
    try:
        with get_db() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute('SELECT id, nome, departamento FROM professor ORDER BY nome ASC')
                return cursor.fetchall()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching professors: {str(e)}")


@router.get("/professors/search")
def search_professors(name: str = Query(..., min_length=1)):
    try:
        with get_db() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(
                    'SELECT id, nome, departamento FROM professor WHERE (nome ILIKE %s OR email ILIKE %s) ORDER BY nome ASC',
                    (f"%{name}%", f"%{name}%")
                )
                return cursor.fetchall()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching professors: {str(e)}")


@router.get("/professor/by-name")
def get_professor_by_name(name: str = Query(..., min_length=1)):
    try:
        with get_db() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(
                    'SELECT id, nome, email, departamento FROM professor WHERE (nome ILIKE %s OR email ILIKE %s) ORDER BY nome ASC',
                    (f"%{name}%", f"%{name}%")
                )
                professors = cursor.fetchall()
                if not professors:
                    raise HTTPException(status_code=404, detail="Professor not found")
                return {"query": name, "professors": professors}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching professor by name: {str(e)}")


@router.get("/professor/{professor_name}")
def get_professor(professor_name: str):
    try:
        with get_db() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(
                    'SELECT id, nome, email, departamento FROM professor WHERE lower(nome) = lower(%s)',
                    (professor_name,)
                )
                professor = cursor.fetchone()
                if not professor:
                    raise HTTPException(status_code=404, detail="Professor not found")
                return professor
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching professor: {str(e)}")


@router.get("/professor/{professor_name}/avaliacoes")
def get_professor_reviews(professor_name: str):
    try:
        with get_db() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(
                    'SELECT id FROM professor WHERE lower(nome) = lower(%s)',
                    (professor_name,)
                )
                professor = cursor.fetchone()
                if not professor:
                    raise HTTPException(status_code=404, detail="Professor not found")

                cursor.execute('''
                    SELECT av.id, av.estudante_id, av.semestro_id,
                           av.metrica_1, av.metrica_2, av.metrica_3,
                           av.comentario
                    FROM avaliacao_professor av
                    WHERE av.professor_id = %s
                ''', (professor['id'],))
                reviews = cursor.fetchall()
                return {"professor_name": professor_name, "professor_id": professor['id'], "reviews": reviews}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching professor reviews: {str(e)}")
