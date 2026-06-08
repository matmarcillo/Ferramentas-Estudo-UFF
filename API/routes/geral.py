from fastapi import APIRouter, HTTPException, Header, Depends
from api_types import CreateSemester
from bdd import get_db
from auth import get_current_admin

router = APIRouter(tags=["General"])

@router.get("/")
def root():
    return {"message": "Welcome to the API"}


@router.get("/status")
def status():
    return "API is running"

@router.delete("/all")
def delete_all(admin_id: int = Depends(get_current_admin)):
    with get_db() as conn:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM avaliacao_disciplina")
            cursor.execute("DELETE FROM documento")
            cursor.execute("DELETE FROM professor")
            cursor.execute("DELETE FROM semestro")
            cursor.execute("DELETE FROM disciplina")
            cursor.execute("DELETE FROM usuarios")
        conn.commit()
    return {"message": "All data deleted successfully"}

@router.get("/db-status")
def db_status():
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT 1")
        return {"status": "ok", "message": "Database connection is healthy"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")
    
@router.get("/tables")
def get_tables():
    try:
        with get_db() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
                    tables = [row[0] for row in cursor.fetchall()]
                return {"tables": tables}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching tables: {str(e)}")


@router.post("/semester")
def create_semester(req: CreateSemester, admin_id: int = Depends(get_current_admin)):
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO semestro (ano, periodo) VALUES (%s, %s) RETURNING id",
                    (req.ano, req.periodo)
                )
                new_id = cursor.fetchone()[0]
                conn.commit()
                return {"id": new_id, "message": "Semester created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating semester: {str(e)}")
