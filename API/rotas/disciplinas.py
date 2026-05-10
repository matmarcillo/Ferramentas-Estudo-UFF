from fastapi import APIRouter, HTTPException
from psycopg2.extras import RealDictCursor
from api_types import CreateCourse
from bdd import get_db

router = APIRouter(tags=["Courses"])

@router.post("/course")
def create_course(req: CreateCourse):
    with get_db() as conn:
        with conn.cursor() as cursor:
            cursor.execute('SELECT id FROM disciplina WHERE codigo = %s', (req.codigo,))
            if cursor.fetchone() is not None:
                raise HTTPException(status_code=400, detail="Course code already in use")

            cursor.execute(
                "INSERT INTO disciplina (nome, codigo, faculdade) VALUES (%s, %s, %s) RETURNING id",
                (req.nome, req.codigo, req.faculdade)
            )
            new_id = None
            conn.commit()
            return {"id": new_id, "message": "Course created successfully"}

@router.get("/course/{course_id}/reviews")
def get_course_reviews(course_id: int):
    with get_db() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute('''
                SELECT id, estudante_id, semestro_id, professor_id, 
                       metrica_1, metrica_2, metrica_3 
                FROM avaliacao_disciplina 
                WHERE disciplina_id = %s
            ''', (course_id,))
            reviews = cursor.fetchall()
            return {"course_id": course_id, "reviews": reviews}

@router.get("/course/{course_id}/documents")
def get_course_documents(course_id: int):
    with get_db() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute('''
                SELECT id, tipo, tier, semestro_id, link, nome 
                FROM documento 
                WHERE disciplina_id = %s
            ''', (course_id,))
            documents = cursor.fetchall()
            return {"course_id": course_id, "documents": documents}
