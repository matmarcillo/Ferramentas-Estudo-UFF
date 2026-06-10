from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from typing import Annotated
from fastapi.responses import FileResponse
from psycopg2.extras import RealDictCursor
import os
import shutil
import uuid
from api_types import *
from bdd import get_db
from auth import get_current_user_id
from tier_system import EXP_REWARDS, get_tier_info

TIER_MAP = {
    "prova": 1,
    "trabalho": 2,
    "projeto": 3,
    "resumo": 4
}

VOTE_VALUE = 1 # 10 comentarios = uma avaliação de professsor
# antes era 20*0.05 votos para um ponto, mas menos simples

UPLOAD_DIR = "documentos"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(tags=["Documentos"])

@router.post("/documento")
def create_documento(
    disciplina_id: int = Form(...),
    semestre_id: int = Form(...),
    tipo: str = Form(...),
    file: UploadFile = File(...),
    user_id: int = Depends(get_current_user_id)
):
    try:
        # Save file to disk
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Assuming `link` is the relative path to be served or internal path
        link = file_path
        nome = file.filename

        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO documento (disciplina_id, tipo, tier, semestro_id, publicador_id, link, nome) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id",
                    (disciplina_id, tipo, TIER_MAP[tipo], semestre_id, user_id, link, nome)
                )
                new_id = cursor.fetchone()[0]

                # Award EXP based on type
                exp_to_add = EXP_REWARDS["doc_resumo"] if tipo == "resumo" else EXP_REWARDS["doc_other"]
                cursor.execute(
                    "UPDATE usuarios SET exp = exp + %s WHERE id = %s",
                    (exp_to_add, user_id)
                )

                conn.commit()
                return {"id": new_id, "message": "Documento criado com sucesso", "file_path": link}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar documento: {str(e)}")

@router.get("/{disciplina_id}/documentos/{documento_id}/download")
def download_documento(disciplina_id: int, documento_id: int, user_id: int = Depends(get_current_user_id)):
    try:
        with get_db() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                # Get user's tier level
                cursor.execute("SELECT exp FROM usuarios WHERE id = %s", (user_id,))
                user_row = cursor.fetchone()
                user_tier_level = get_tier_info(user_row['exp'] if user_row else 0)['level']

                cursor.execute("SELECT link, nome, tier FROM documento WHERE id = %s", (documento_id,))
                doc = cursor.fetchone()
                if not doc:
                    raise HTTPException(status_code=404, detail="Documento não encontrado")
                
                # Check tier restriction
                if int(doc['tier']) > user_tier_level:
                    raise HTTPException(status_code=403, detail="Você não tem nível de Tier suficiente para baixar este documento")

                file_path = doc['link']
                nome = doc['nome']
                
                if not os.path.exists(file_path):
                    raise HTTPException(status_code=404, detail="Arquivo no servidor não foi encontrado")

                return FileResponse(path=file_path, filename=nome)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar o arquivo do documento: {str(e)}")

@router.get("/{disciplina_id}/documentos/{documento_id}/view")
def view_documento(disciplina_id: int, documento_id: int, user_id: int = Depends(get_current_user_id)):
    try:
        with get_db() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                # Get user's tier level
                cursor.execute("SELECT exp FROM usuarios WHERE id = %s", (user_id,))
                user_row = cursor.fetchone()
                user_tier_level = get_tier_info(user_row['exp'] if user_row else 0)['level']

                cursor.execute("SELECT link, nome, tier FROM documento WHERE id = %s", (documento_id,))
                doc = cursor.fetchone()
                if not doc:
                    raise HTTPException(status_code=404, detail="Documento não encontrado")
                
                # Check tier restriction
                if int(doc['tier']) > user_tier_level:
                    raise HTTPException(status_code=403, detail="Você não tem nível de Tier suficiente para visualizar este documento")

                file_path = doc['link']
                nome = doc['nome']
                
                if not os.path.exists(file_path):
                    raise HTTPException(status_code=404, detail="Arquivo no servidor não foi encontrado")

                return FileResponse(path=file_path, filename=nome, content_disposition_type="inline")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar o arquivo do documento: {str(e)}")
    
@router.get("/{disciplina_id}/documentos")
def get_documentos(disciplina_id: int, user_id: int = Depends(get_current_user_id)):
    try:
        with get_db() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                # Get user's tier level
                cursor.execute("SELECT exp FROM usuarios WHERE id = %s", (user_id,))
                user_row = cursor.fetchone()
                user_tier_level = get_tier_info(user_row['exp'] if user_row else 0)['level']

                cursor.execute('''
                    SELECT id, nome, link, semestro_id, tipo, tier, publicador_id 
                    FROM documento 
                    WHERE disciplina_id = %s AND (CAST(tier AS INTEGER) <= %s OR publicador_id = %s)
                ''', (disciplina_id, user_tier_level, user_id))
                documentos = cursor.fetchall()
                return {"disciplina_id": disciplina_id, "documentos": documentos}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar documentos: {str(e)}")

    
@router.get("/{disciplina_id}/documentos/{documento_id}")
def get_documento(disciplina_id: int, documento_id: int):
    try:
        with get_db() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute('''
                    SELECT id, nome as titulo, link as url, semestro_id, tipo, tier, publicador_id 
                    FROM documento 
                    WHERE id = %s AND disciplina_id = %s
                ''', (documento_id, disciplina_id))
                documento = cursor.fetchone()
                if documento is None:
                    raise HTTPException(status_code=404, detail="Documento não encontrado")
                
                cursor.execute('''
                    SELECT id, texto, usuario_id, replies_to_id, data
                    FROM comentario 
                    WHERE documento_id = %s
                ''', (documento_id,))
                comentarios = cursor.fetchall()

                cursor.execute('''
                    SELECT SUM(VALOR) as score
                    FROM voto
                    WHERE documento_id = %s
                ''', (documento_id,))
                row = cursor.fetchone()
                score = row['score'] if row and row['score'] else 0

                return {"documento": documento, "comentarios": comentarios, "score": score}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar documento: {str(e)}")
    
@router.post("/{disciplina_id}/documentos/{documento_id}/comentario")
def create_comentario(disciplina_id: int, documento_id: int, comentario: CreateComentario, user_id: int = Depends(get_current_user_id)):
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO comentario (documento_id, texto, usuario_id, replies_to_id) VALUES (%s, %s, %s, %s) RETURNING id",
                    (comentario.documento_id, comentario.texto, user_id, comentario.replies_to_id)
                )
                new_id = cursor.fetchone()[0]
                conn.commit()
                return {"id": new_id, "message": "Comentário criado com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar comentário: {str(e)}")

@router.post("/{disciplina_id}/documentos/{documento_id}/voto")
def create_voto(disciplina_id: int, documento_id: int, voto: CreateVoto, user_id: int = Depends(get_current_user_id)):
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                # implémenter la vérification que c'est pas le User qui upvote son propre document, sera fait post authentification
                cursor.execute(
                    "SELECT 1 FROM documento WHERE publicador_id = %s AND id = %s",
                    (user_id, voto.documento_id)
                )
                if cursor.fetchone() is not None:
                    raise HTTPException(status_code=400, detail="Você não pode votar no seu próprio documento")
                
                # Check if the user has already voted for this document to calculate the exp change later
                cursor.execute(
                    "SELECT valor FROM voto WHERE usuario_id = %s AND documento_id = %s",
                    (user_id, voto.documento_id)
                )
                row = cursor.fetchone()
                existing_vote = 0 if row is None else row[0]

                # Create/update the vote 
                # le ON CONFLICT c'est stylé, je connaissais pas forcément
                cursor.execute(
                    "INSERT INTO voto (usuario_id, documento_id, valor) VALUES (%s, %s, %s) ON CONFLICT (usuario_id, documento_id) DO UPDATE SET valor = EXCLUDED.valor",
                    (user_id, voto.documento_id, voto.valor.value)
                )
                
                # Update the exp of the document publisher
                exp_change = (voto.valor.value - existing_vote) * VOTE_VALUE
                cursor.execute(
                    "UPDATE usuarios SET exp = exp + %s WHERE id = (SELECT publicador_id FROM documento WHERE id = %s)",
                    (exp_change, voto.documento_id)
                )

                conn.commit()
                return {"message": "Voto registrado com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar voto: {str(e)}")

@router.delete("/documento/{documento_id}") # TODO: revoir cet enpoint
def delete_documento(documento_id: int, user_id: int = Depends(get_current_user_id)):
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                # Pegue o caminho para apagar o arquivo e verifique o dono
                cursor.execute("SELECT link, publicador_id FROM documento WHERE id = %s", (documento_id,))
                doc = cursor.fetchone()
                if not doc:
                    raise HTTPException(status_code=404, detail="Documento não encontrado")
                
                if doc[1] != user_id:
                    raise HTTPException(status_code=403, detail="Você não tem permissão para apagar este documento")
                
                file_path = doc[0]
                if file_path and os.path.exists(file_path):
                    os.remove(file_path)

                # Delete dependent records
                cursor.execute("DELETE FROM comentario WHERE documento_id = %s", (documento_id,))
                cursor.execute("DELETE FROM voto WHERE documento_id = %s", (documento_id,))
                cursor.execute("DELETE FROM documento WHERE id = %s", (documento_id,))
                
                conn.commit()
                return {"message": "Documento apagado com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao apagar documento: {str(e)}")

@router.delete("/comentario/{comentario_id}")
def delete_comentario(comentario_id: int, current_user: dict = Depends(get_current_user_id)):
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                # Verifique o dono do comentário
                cursor.execute("SELECT usuario_id FROM comentario WHERE id = %s", (comentario_id,))
                comentario = cursor.fetchone()
                if not comentario:
                    raise HTTPException(status_code=404, detail="Comentário não encontrado")
                    
                # Check if user is owner OR admin
                if comentario[0] != current_user["id"] and current_user["role"] != "admin":
                    raise HTTPException(status_code=403, detail="Você não tem permissão para apagar este comentário")

                cursor.execute("DELETE FROM comentario WHERE id = %s", (comentario_id,))
                conn.commit()
                return {"message": "Comentário apagado com sucesso"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao apagar comentário: {str(e)}")
