from fastapi import APIRouter, HTTPException, Depends
from psycopg2.extras import RealDictCursor
import jwt
from datetime import datetime, timedelta, timezone
from api_types import CreateUser, Login
from bdd import get_db
from auth import get_current_user_id, get_current_admin, SECRET_KEY, ALGORITHM
from tier_system import get_tier_info, get_tier_below, get_next_tier_info


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
                    "INSERT INTO usuarios (nome, email, exp, user_role) VALUES (%s, %s, %s, %s) RETURNING id",
                    (req.nome, req.email, 0, 'student')
                )
                new_id = cursor.fetchone()[0]
                conn.commit()
                return {"id": new_id, "message": "User created successfully"}
    except HTTPException:
        raise
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
                cursor.execute('SELECT id, nome, user_role, exp FROM usuarios WHERE email = %s', (login_req.email,))
                user = cursor.fetchone()
                
                if user is None:
                    raise HTTPException(status_code=401, detail="Invalid email or password")
                
                # Create JWT Token
                expire = datetime.now(timezone.utc) + timedelta(days=7)
                token_data = {"sub": str(user[0]), "role": user[2], "exp": expire}
                token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
                
                tier_info = get_tier_info(user[3])
                
                return {
                    "access_token": token, 
                    "token_type": "bearer", 
                    "user_id": user[0], 
                    "nome": user[1], 
                    "role": user[2],
                    "exp": user[3],
                    "tier": tier_info["name"]
                }
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
                cursor.execute('SELECT id, nome, email, user_role, exp FROM usuarios WHERE id = %s', (user_id,))
                user = cursor.fetchone()
                if not user:
                    raise HTTPException(status_code=404, detail="User not found")
                
                # Add tier info
                tier_info = get_tier_info(user['exp'])
                user['tier'] = tier_info['name']
                user['tier_level'] = tier_info['level']
                
                next_tier = get_next_tier_info(user['exp'])
                if next_tier:
                    user['next_tier_name'] = next_tier['name']
                    user['next_tier_threshold'] = next_tier['threshold']
                else:
                    user['next_tier_name'] = "Max"
                    user['next_tier_threshold'] = user['exp']

                # Fetch recent documents uploaded
                cursor.execute('''
                    SELECT d.id, d.tipo, d.tier, d.nome, d.link, d.disciplina_id, di.nome as disciplina_nome 
                    FROM documento d
                    JOIN disciplina di ON d.disciplina_id = di.id
                    WHERE d.publicador_id = %s 
                    ORDER BY d.id DESC
                ''', (user_id,))
                user['documentos'] = cursor.fetchall()
                
                # Fetch recent evaluations (disciplina)
                cursor.execute('SELECT id, disciplina_id, semestro_id, metrica_1, metrica_2, metrica_3, status_aprovacao, comentario FROM avaliacao_disciplina WHERE estudante_id = %s ORDER BY id DESC', (user_id,))
                user['avaliacoes_disciplina'] = cursor.fetchall()
                
                # Fetch recent evaluations (professor)
                cursor.execute('SELECT id, professor_id, semestro_id, metrica_1, metrica_2, metrica_3, comentario FROM avaliacao_professor WHERE estudante_id = %s ORDER BY id DESC', (user_id,))
                user['avaliacoes_professor'] = cursor.fetchall()
                
                return user
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user data: {str(e)}")



@router.get("/users/leaderboard")
def get_leaderboard():
    try:
        with get_db() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute('SELECT id, nome, exp FROM usuarios ORDER BY exp DESC LIMIT 50')
                users = cursor.fetchall()
                
                # Add tier to each user
                for user in users:
                    user['tier'] = get_tier_info(user['exp'])['name']
                
                return users
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching leaderboard: {str(e)}")

@router.post("/admin/reset-tiers")
def reset_tiers(_ = Depends(get_current_admin)):
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                
                cursor.execute("SELECT id, exp FROM usuarios")
                users = cursor.fetchall()
                
                for u in users:
                    new_exp = get_tier_below(u['exp'])
                    cursor.execute("UPDATE usuarios SET exp = %s WHERE id = %s", (new_exp, u['id']))
                
                conn.commit()
                return {"message": "Tiers resetados com sucesso para o novo semestre"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao resetar tiers: {str(e)}")
