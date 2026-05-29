from fastapi import APIRouter, HTTPException
from psycopg2.extras import RealDictCursor
from api_types import CreateCourse
from bdd import get_db

router = APIRouter(tags=["Courses"])

@router.post("/course")
def create_course(req: CreateCourse):
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute('SELECT id FROM disciplina WHERE codigo = %s', (req.codigo,))
                if cursor.fetchone() is not None:
                    raise HTTPException(status_code=400, detail="Course code already in use")

                cursor.execute(
                    "INSERT INTO disciplina (nome, codigo, faculdade) VALUES (%s, %s, %s) RETURNING id",
                    (req.nome, req.codigo, req.faculdade)
                )
                new_id = cursor.fetchone()[0]
                conn.commit()
                return {"id": new_id, "message": "Course created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating course: {str(e)}")

@router.get("/courses")
def get_courses():
    try:
        with get_db() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute('SELECT id, nome, codigo, faculdade FROM disciplina ORDER BY nome ASC')
                return cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching courses: {str(e)}")

@router.get("/course/{course_id}/avaliacoes")
def get_course_reviews(course_id: int):
    try:
        with get_db() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute('''
                    SELECT av.id, av.estudante_id, av.semestro_id, av.professor_id, 
                        av.metrica_1, av.metrica_2, av.metrica_3, -- modifique conforme suas métricas
                        av.comentario
                    FROM avaliacao_disciplina av 
                    LEFT JOIN professor p ON av.professor_id = p.id
                    WHERE av.disciplina_id = %s
                ''', (course_id,))
                reviews = cursor.fetchall()
                return {"course_id": course_id, "reviews": reviews}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching course reviews: {str(e)}")