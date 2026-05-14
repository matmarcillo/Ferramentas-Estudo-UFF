from pydantic import BaseModel

class CreateUser(BaseModel):
    nome: str
    email: str
    tier: str

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
    semestre_id: int
    titulo: str
    url: str
