from fastapi import APIRouter, HTTPException, Depends
from psycopg2.extras import RealDictCursor
import jwt
from datetime import datetime, timedelta, timezone
from api_types import CreateUser, Login
from bdd import get_db
from API.tests.auth import get_current_user_id, SECRET_KEY, ALGORITHM


router = APIRouter(tags=["Users"])

@router.post("/user")
def create_user(req: CreateUser):
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute('SELECT id FROM usuarios WHERE email = %s', (req.email,))
                if cursor.fetchone() is not None:
                    raise HTTPException(status_code=400, detail="Email already in use")

                cursor.execute(
                    'INSERT INTO usuarios (nome, email, tier) VALUES (%s, %s, %s) RETURNING id',
                    (req.nome, req.email, req.tier)
                )
                new_id = cursor.fetchone()[0]
                conn.commit()
                return {"id": new_id, "message": "User created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")

@router.post("/users/login")
def login(login_req: Login):
    """Check if user/pwd combination is valid provide auth token"""
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                # We skip real password checks here since DB doesn't have passwords for this school project.
                # Just verifying if email exists.
                cursor.execute('SELECT id, nome FROM usuarios WHERE email = %s', (login_req.email,))
                user = cursor.fetchone()
                
                if user is None:
                    raise HTTPException(status_code=401, detail="Invalid email or password")
                
                # Create JWT Token
                expire = datetime.now(timezone.utc) + timedelta(days=7)
                token_data = {"sub": str(user[0]), "exp": expire}
                token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
                
                return {"access_token": token, "token_type": "bearer", "user_id": user[0], "nome": user[1]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")

@router.get("/users/me")
def get_me(user_id: int = Depends(get_current_user_id)):
    """Get the currently logged-in user profile with their recent activity."""
    try:
        with get_db() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute('SELECT id, nome, email, tier, exp FROM usuarios WHERE id = %s', (user_id,))
                user = cursor.fetchone()
                if not user:
                    raise HTTPException(status_code=404, detail="User not found")
                
                # Fetch recent documents uploaded
                cursor.execute('SELECT id, tipo, tier, nome, link FROM documento WHERE publicador_id = %s ORDER BY id DESC', (user_id,))
                user['documentos'] = cursor.fetchall()
                
                # Fetch recent evaluations (disciplina)
                cursor.execute('SELECT id, disciplina_id, semestro_id, metrica_1, metrica_2, metrica_3 FROM avaliacao_disciplina WHERE estudante_id = %s ORDER BY id DESC', (user_id,))
                user['avaliacoes_disciplina'] = cursor.fetchall()
                
                # Fetch recent evaluations (professor)
                cursor.execute('SELECT id, professor_id, semestro_id, metrica_1, metrica_2, metrica_3 FROM avaliacao_professor WHERE estudante_id = %s ORDER BY id DESC', (user_id,))
                user['avaliacoes_professor'] = cursor.fetchall()
                
                return user
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user data: {str(e)}")



@router.get("/users/leaderboard")
def get_leaderboard():
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute('SELECT id, nome, tier, exp FROM usuarios ORDER BY exp DESC LIMIT 50')
                return cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching leaderboard: {str(e)}")
