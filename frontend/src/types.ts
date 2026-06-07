export type CreateUser = {
  nome: string;
  email: string;
  password: string;
};

export type Login = {
  email: string;
  password: string;
};

export type CreateCourse = {
  nome: string;
  codigo: string;
  faculdade: string;
};

export type CreateSemester = {
  ano: number;
  periodo: string;
};

export type CreateProfessor = {
  nome: string;
  email: string;
  departamento: string;
};

export type CreateAvaliacao = {
  disciplina_id: number;
  semestre_id: number;
  nota: number;
  comentario: string;
};

export type CreateAvaliacaoProfessor = {
  professor_id: number;
  semestre_id: number;
  nota: number;
  comentario: string;
};

export type CreateDocumento = {
  disciplina_id: number;
  semestro_id: number;
  tipo: string;
};

export type CreateComentario = {
  documento_id: number;
  texto: string;
  replies_to_id?: number | null;
};

export enum Votes {
  UPVOTE = 1,
  NO_VOTE = 0,
  DOWNVOTE = -1,
}

export type CreateVoto = {
  documento_id: number;
  valor: Votes;
};

export type Course = {
  id: number;
  nome: string;
  codigo: string;
  faculdade: string;
};

export type Professor = {
  id: number;
  nome: string;
  email?: string;
  departamento: string;
};

export type Semester = {
  id: number;
  ano: number;
  periodo: string;
};

export type LeaderboardRow = {
  id: number;
  nome: string;
  tier: string;
  exp: number;
};

export type ReviewItem = {
  id: number;
  estudante_id?: number;
  disciplina_id?: number;
  professor_id?: number;
  semestro_id?: number;
  metrica_1?: number;
  metrica_2?: number;
  metrica_3?: number;
  comentario?: string;
};

export type Documento = {
  id: number;
  nome: string;
  link: string;
  semestro_id: number;
  tipo: string;
  tier: string;
  publicador_id: number;
};

export type DocumentoDetail = {
  id: number;
  nome: string;
  titulo?: string;
  link?: string;
  url?: string;
  semestro_id: number;
  tipo: string;
  tier: string;
  publicador_id: number;
};

export type Comentario = {
  id: number;
  texto: string;
  usuario_id: number;
  replies_to_id: number | null;
  data: string;
};

export type UserProfile = {
  id: number;
  nome: string;
  email: string;
  tier: string;
  exp: number;
  documentos: Documento[];
  avaliacoes_disciplina: unknown[];
  avaliacoes_professor: unknown[];
};

export type ApiStatus = {
  message?: string;
  status?: string;
};
