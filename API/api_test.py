import uvicorn
from fastapi import FastAPI, HTTPException, Header
import psycopg2
from pip._internal import req
from psycopg2.extras import RealDictCursor
from api_types import *
import os

app = FastAPI()

def get_db():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        database=os.getenv("DB_NAME", "mydb"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "password")
    )

@app.get("/status")
def status():
    return "Hello World"

@app.post("/user")
def create_user(req: CreateUser):
    with get_db() as conn:
        with conn.cursor() as cursor:
            cursor.execute('SELECT id FROM usuarios WHERE email = %s', (req.email,))
            if cursor.fetchone() is not None:
                raise HTTPException(status_code=400, detail="Email already in use")

            cursor.execute(
                'INSERT INTO usuarios (nome, email, tier) VALUES (%s, %s, %s)',
                (req.nome, req.email, req.tier)
            )
            new_id = None
            conn.commit()
            return {"id": new_id, "message": "User created successfully"}

@app.post("/users/login")
def login(login_req: Login):
    """Check if user/pwd combination is valid provide auth token"""
    return login_req

@app.post("/course")
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

@app.post("/semester")
def create_semester(req: CreateSemester, is_admin: bool = Header(False, description="Set to true to mimic admin validation")):
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin permissions required to create a semester")

    with get_db() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO semestro (ano, periodo) VALUES (%s, %s) RETURNING id",
                (req.ano, req.periodo)
            )
            new_id = None
            conn.commit()
            return {"id": new_id, "message": "Semester created successfully"}

@app.post("/professor")
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

@app.get("/professor/{professor_id}")
def get_professor(professor_id: int):
    with get_db() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute('SELECT id, nome, email, departamento FROM professor WHERE id = %s', (professor_id,))
            prof = cursor.fetchone()
            if not prof:
                raise HTTPException(status_code=404, detail="Professor not found")
            return prof

@app.get("/user/{user_id}")
def get_user(user_id: int):
    with get_db() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute('SELECT id, nome, email, tier FROM usuarios WHERE id = %s', (user_id,))
            user = cursor.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            return user

@app.get("/course/{course_id}/reviews")
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

@app.get("/course/{course_id}/documents")
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


@app.get("/course/{course_id}/reviews")
def get_course_reviews(course_id: int):
    pass

if __name__ == "__main__":
    uvicorn.run("api_test:app", host="0.0.0.0", port=8000, reload=True)
