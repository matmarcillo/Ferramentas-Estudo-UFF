import type {
  CreateAvaliacao,
  CreateAvaliacaoProfessor,
  CreateComentario,
  CreateCourse,
  CreateDocumento,
  CreateProfessor,
  CreateSemester,
  CreateUser,
  CreateVoto,
  Course,
  Documento,
  DocumentoDetail,
  LeaderboardRow,
  Login,
  Professor,
  Semester,
  UserProfile,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const TOKEN_KEY = 'game-analytics-token';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type RequestOptions = RequestInit & {
  auth?: boolean;
};

async function parseError(response: Response): Promise<string> {
  try {
    const payload = await response.json();
    return payload.detail ?? payload.message ?? response.statusText;
  } catch {
    return response.statusText;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.auth) {
    const token = getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

function jsonHeaders(body?: unknown): HeadersInit {
  return body ? { 'Content-Type': 'application/json' } : {};
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export const api = {
  API_BASE_URL,
  getStatus: () => request<string>('/status'),
  getDbStatus: () => request<{ status: string; message: string }>('/db-status'),
  getTables: () => request<{ tables: string[] }>('/tables'),
  getSemesters: () => request<Semester[]>('/semesters'),
  getCourses: () => request<Course[]>('/courses'),
  searchCourses: (name: string) => request<Course[]>(`/courses/search?name=${encodeURIComponent(name)}`),
  getProfessors: () => request<Professor[]>('/professors'),
  searchProfessors: (name: string) => request<Professor[]>(`/professors/search?name=${encodeURIComponent(name)}`),
  getLeaderboard: () => request<LeaderboardRow[]>('/users/leaderboard'),
  getMe: () => request<UserProfile>('/users/me', { auth: true }),
  createUser: (payload: CreateUser) =>
    request('/user', {
      method: 'POST',
      headers: jsonHeaders(payload),
      body: JSON.stringify(payload),
    }),
  login: (payload: Login) =>
    request<{ access_token: string; token_type: string; user_id: number; nome: string }>('/users/login', {
      method: 'POST',
      headers: jsonHeaders(payload),
      body: JSON.stringify(payload),
    }),
  createCourse: (payload: CreateCourse) =>
    request('/course', {
      method: 'POST',
      headers: jsonHeaders(payload),
      body: JSON.stringify(payload),
    }),
  createProfessor: (payload: CreateProfessor) =>
    request('/professor', {
      method: 'POST',
      headers: jsonHeaders(payload),
      body: JSON.stringify(payload),
    }),
  createSemester: (payload: CreateSemester) =>
    request('/semester', {
      method: 'POST',
      headers: {
        ...jsonHeaders(payload),
        'is-admin': 'true',
      },
      body: JSON.stringify(payload),
    }),
  createAvaliacaoDisciplina: (payload: CreateAvaliacao) =>
    request('/avaliacao/disciplina', {
      method: 'POST',
      auth: true,
      headers: jsonHeaders(payload),
      body: JSON.stringify(payload),
    }),
  createAvaliacaoProfessor: (payload: CreateAvaliacaoProfessor) =>
    request('/avaliacao/professor', {
      method: 'POST',
      auth: true,
      headers: jsonHeaders(payload),
      body: JSON.stringify(payload),
    }),
  getCourse: (courseName: string) => request<Course>(`/course/${encodeURIComponent(courseName)}`),
  getCourseReviews: (courseName: string) =>
    request<{ course_id: number; course_name: string; reviews: unknown[] }>(`/course/${encodeURIComponent(courseName)}/avaliacoes`),
  getProfessor: (professorName: string) => request<Professor>(`/professor/${encodeURIComponent(professorName)}`),
  getProfessorReviews: (professorName: string) =>
    request<{ professor_id: number; professor_name: string; reviews: unknown[] }>(`/professor/${encodeURIComponent(professorName)}/avaliacoes`),
  getDocumentos: (disciplinaId: number) =>
    request<{ disciplina_id: number; documentos: Documento[] }>(`/${disciplinaId}/documentos`),
  getDocumento: (disciplinaId: number, documentoId: number) =>
    request<{ documento: DocumentoDetail; comentarios: unknown[]; score: number }>(`/${disciplinaId}/documentos/${documentoId}`),
  createDocumento: async (payload: CreateDocumento, file: File) => {
    const formData = new FormData();
    formData.append('disciplina_id', String(payload.disciplina_id));
    formData.append('semestro_id', String(payload.semestro_id));
    formData.append('tipo', payload.tipo);
    formData.append('file', file);

    return request('/documento', {
      method: 'POST',
      auth: true,
      body: formData,
    });
  },
  downloadDocumentoUrl: (disciplinaId: number, documentoId: number) =>
    `${API_BASE_URL}/${disciplinaId}/documentos/${documentoId}/download`,
  createComentario: (disciplinaId: number, documentoId: number, payload: CreateComentario) =>
    request(`/${disciplinaId}/documentos/${documentoId}/comentario`, {
      method: 'POST',
      auth: true,
      headers: jsonHeaders(payload),
      body: JSON.stringify(payload),
    }),
  createVoto: (disciplinaId: number, documentoId: number, payload: CreateVoto) =>
    request(`/${disciplinaId}/documentos/${documentoId}/voto`, {
      method: 'POST',
      auth: true,
      headers: jsonHeaders(payload),
      body: JSON.stringify(payload),
    }),
};