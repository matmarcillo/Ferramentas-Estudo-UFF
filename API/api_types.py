from pydantic import BaseModel
from enum import Enum

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
    nota: float
    comentario: str

class CreateAvaliacaoProfessor(BaseModel):
    professor_id: int
    semestre_id: int
    nota: float
    comentario: str

class CreateDocumento(BaseModel):
    disciplina_id: int
    semestro_id: int
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