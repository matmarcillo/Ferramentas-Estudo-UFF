from fastapi import APIRouter, HTTPException, Query, Depends
from psycopg2.extras import RealDictCursor
from api_types import CreateCourse
from bdd import get_db
from auth import get_current_admin, get_current_user_id


router = APIRouter(tags=["Courses"])

@router.post("/course")
def create_course(req: CreateCourse, user_id: int = Depends(get_current_user_id)):
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
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating course: {str(e)}")

@router.delete("/course/{course_id}")
def delete_course(course_id: int, admin_id: int = Depends(get_current_admin)):
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                # Check for dependent records
                cursor.execute("SELECT id FROM documento WHERE disciplina_id = %s", (course_id,))
                if cursor.fetchone():
                    raise HTTPException(status_code=400, detail="Cannot delete course with associated documents")

                cursor.execute("SELECT id FROM avaliacao_disciplina WHERE disciplina_id = %s", (course_id,))
                if cursor.fetchone():
                    raise HTTPException(status_code=400, detail="Cannot delete course with associated evaluations")

                cursor.execute("DELETE FROM disciplina WHERE id = %s", (course_id,))
                conn.commit()
                return {"message": "Course deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting course: {str(e)}")

@router.get("/courses")
def get_courses():
    try:
        with get_db() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute('SELECT id, nome, codigo, faculdade FROM disciplina ORDER BY nome ASC')
                return cursor.fetchall()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching courses: {str(e)}")


@router.get("/courses/search")
def search_courses(name: str = Query(..., min_length=1)):
    try:
        with get_db() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(
                    'SELECT id, nome, codigo, faculdade FROM disciplina WHERE (nome ILIKE %s OR codigo ILIKE %s) ORDER BY nome ASC',
                    (f"%{name}%", f"%{name}%")
                )
                return cursor.fetchall()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching courses: {str(e)}")


@router.get("/course/by-name")
def get_course_by_name(name: str = Query(..., min_length=1)):
    try:
        with get_db() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(
                    'SELECT id, nome, codigo, faculdade FROM disciplina WHERE (nome ILIKE %s OR codigo ILIKE %s) ORDER BY nome ASC',
                    (f"%{name}%", f"%{name}%")
                )
                courses = cursor.fetchall()
                if not courses:
                    raise HTTPException(status_code=404, detail="Course not found")
                return {"query": name, "courses": courses}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching course by name: {str(e)}")


@router.get("/course/{course_name}")
def get_course(course_name: str):
    try:
        with get_db() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(
                    'SELECT id, nome, codigo, faculdade FROM disciplina WHERE lower(nome) = lower(%s)',
                    (course_name,)
                )
                course = cursor.fetchone()
                if not course:
                    raise HTTPException(status_code=404, detail="Course not found")
                return course
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching course: {str(e)}")


@router.get("/course/{course_name}/avaliacoes")
def get_course_reviews(course_name: str):
    try:
        with get_db() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(
                    'SELECT id FROM disciplina WHERE lower(nome) = lower(%s)',
                    (course_name,)
                )
                course = cursor.fetchone()
                if not course:
                    raise HTTPException(status_code=404, detail="Course not found")

                cursor.execute('''
                    SELECT av.id, av.estudante_id, av.semestro_id, av.professor_id,
                        av.dificuldade, av.utilidade, av.interesse, av.carga_trabalho,
                        av.status_aprovacao, av.comentario
                    FROM avaliacao_disciplina av
                    LEFT JOIN professor p ON av.professor_id = p.id
                    WHERE av.disciplina_id = %s
                ''', (course['id'],))
                reviews = cursor.fetchall()
                return {"course_name": course_name, "course_id": course['id'], "reviews": reviews}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching course reviews: {str(e)}")
