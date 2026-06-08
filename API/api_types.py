from pydantic import BaseModel
from enum import Enum
from metricas_avaliacao import *

class CreateUser(BaseModel):
    nome: str
    email: str
    password: str

class Login(BaseModel):
    email: str
    password: str

class CreateCourse(BaseModel):
    nome: str
    codigo: str
    faculdade: str

class CreateSemester(BaseModel):
    ano: int
    periodo: str

class CreateProfessor(BaseModel):
    nome: str
    email: str
    departamento: str

class CreateAvaliacao(BaseModel):
    disciplina_id: int
    semestre_id: int
    professor_id: int | None = None
    metrica_1: int
    metrica_2: int
    metrica_3: int
    status_aprovacao: Aprovacao
    comentario: str

class CreateAvaliacaoProfessor(BaseModel):
    professor_id: int
    semestre_id: int
    metrica_1: int
    metrica_2: int
    metrica_3: int
    comentario: str

class CreateDocumento(BaseModel):
    disciplina_id: int
    semestre_id: int
    tipo: str

class CreateComentario(BaseModel):
    documento_id: int
    texto: str
    replies_to_id: int | None = None

class Votes(Enum):
    UPVOTE = 1
    NO_VOTE = 0
    DOWNVOTE = -1

class CreateVoto(BaseModel):
    documento_id: int
    valor: Votes 