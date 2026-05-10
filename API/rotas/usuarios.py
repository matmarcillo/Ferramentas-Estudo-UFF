from fastapi import APIRouter, HTTPException
from psycopg2.extras import RealDictCursor
from api_types import CreateUser, Login
from bdd import get_db

router = APIRouter(tags=["Users"])

@router.post("/user")
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

@router.post("/users/login")
def login(login_req: Login):
    """Check if user/pwd combination is valid provide auth token"""
    return login_req

@router.get("/user/{user_id}")
def get_user(user_id: int):
    with get_db() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute('SELECT id, nome, email, tier FROM usuarios WHERE id = %s', (user_id,))
            user = cursor.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            return user
