import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { api, ApiError, getToken, setToken } from './api';
import type {
  Comentario,
  Course,
  CreateAvaliacao,
  CreateAvaliacaoProfessor,
  CreateDocumento,
  CreateCourse,
  CreateProfessor,
  CreateUser,
  Documento,
  DocumentoDetail,
  LeaderboardRow,
  Professor,
  ReviewItem,
  UserProfile,
} from './types';

type PageKey =
  | 'home'
  | 'auth'
  | 'disciplina.search'
  | 'disciplina.create'
  | 'disciplina.page'
  | 'disciplina.documentos'
  | 'disciplina.documento'
  | 'professores.search'
  | 'professores.create'
  | 'professores.page'
  | 'leaderboard'
  | 'me';

type Notice = {
  kind: 'success' | 'error' | 'info';
  title: string;
  message: string;
};

type DocumentPayload = {
  documento: DocumentoDetail;
  comentarios: Comentario[];
  score: number;
};

const pageTree: Array<{
  key: PageKey;
  label: string;
  description: string;
}> = [
  { key: 'home', label: 'Home', description: 'Start here' },
  { key: 'auth', label: 'Account', description: 'Login or create an account' },
  { key: 'disciplina.search', label: 'Buscar disciplina', description: 'Search course names' },
  { key: 'disciplina.create', label: 'Criar disciplina', description: 'Create a new course' },
  { key: 'disciplina.page', label: 'Página da disciplina', description: 'Course page with reviews and documents link' },
  { key: 'disciplina.documentos', label: 'Documentos', description: 'List all documents for the selected course' },
  { key: 'disciplina.documento', label: 'Documento', description: 'Inspect one document, comments, and download' },
  { key: 'professores.search', label: 'Buscar professor', description: 'Search professor names' },
  { key: 'professores.create', label: 'Criar professor', description: 'Create a new professor' },
  { key: 'professores.page', label: 'Página do professor', description: 'Professor page with reviews' },
  { key: 'leaderboard', label: 'Leaderboard', description: 'Top users by experience' },
  { key: 'me', label: 'Me', description: 'Current account profile' },
];

const defaultAuthForm: CreateUser = { nome: '', email: '', password: '' };
const defaultCourseForm: CreateCourse = { nome: '', codigo: '', faculdade: '' };
const defaultProfessorForm: CreateProfessor = { nome: '', email: '', departamento: '' };
const defaultCourseReviewForm: CreateAvaliacao = { disciplina_id: 0, semestre_id: 0, nota: 5, comentario: '' };
const defaultProfessorReviewForm: CreateAvaliacaoProfessor = { professor_id: 0, semestre_id: 0, nota: 5, comentario: '' };
const defaultDocumentForm: CreateDocumento = { disciplina_id: 0, semestro_id: 0, tipo: 'trabalho' };

function formatError(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Unexpected error';
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="section-title">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

function ReviewList({ reviews }: { reviews: ReviewItem[] }) {
  if (reviews.length === 0) {
    return (
      <div className="mini-card">
        <strong>No reviews yet</strong>
        <p>Search a name to load reviews.</p>
      </div>
    );
  }

  return (
    <div className="list-block">
      {reviews.map((review) => (
        <div key={review.id} className="list-item">
          <strong>Review #{review.id}</strong>
          <p>{review.comentario || 'No comment'}</p>
        </div>
      ))}
    </div>
  );
}

function LinkButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="secondary-button" onClick={onClick}>
      {label}
    </button>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState<PageKey>('home');
  const [notice, setNotice] = useState<Notice>({ kind: 'info', title: 'Ready', message: 'Search by name to explore the site.' });
  const [token, setStoredToken] = useState<string | null>(() => getToken());
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState<CreateUser>(defaultAuthForm);
  const [courseForm, setCourseForm] = useState<CreateCourse>(defaultCourseForm);
  const [professorForm, setProfessorForm] = useState<CreateProfessor>(defaultProfessorForm);
  const [courseReviewForm, setCourseReviewForm] = useState<CreateAvaliacao>(defaultCourseReviewForm);
  const [professorReviewForm, setProfessorReviewForm] = useState<CreateAvaliacaoProfessor>(defaultProfessorReviewForm);
  const [documentForm, setDocumentForm] = useState<CreateDocumento>(defaultDocumentForm);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [apiStatus, setApiStatus] = useState('loading');
  const [dbStatus, setDbStatus] = useState('loading');
  const [courseCount, setCourseCount] = useState(0);
  const [professorCount, setProfessorCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const [courseSearch, setCourseSearch] = useState('');
  const [courseResults, setCourseResults] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseReviews, setCourseReviews] = useState<ReviewItem[]>([]);
  const [documents, setDocuments] = useState<Documento[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Documento | null>(null);
  const [documentDetail, setDocumentDetail] = useState<DocumentPayload | null>(null);

  const [professorSearch, setProfessorSearch] = useState('');
  const [professorResults, setProfessorResults] = useState<Professor[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [professorReviews, setProfessorReviews] = useState<ReviewItem[]>([]);

  const currentPage = useMemo(() => pageTree.find((page) => page.key === activePage) ?? pageTree[0], [activePage]);

  async function refreshBootstrap() {
    try {
      const [statusValue, dbValue, coursesValue, professorsValue, leaderboardValue] = await Promise.all([
        api.getStatus(),
        api.getDbStatus(),
        api.getCourses(),
        api.getProfessors(),
        api.getLeaderboard(),
      ]);

      setApiStatus(statusValue);
      setDbStatus(dbValue.status);
      setCourseCount(coursesValue.length);
      setProfessorCount(professorsValue.length);
      setLeaderboard(leaderboardValue);
    } catch (error) {
      setNotice({ kind: 'error', title: 'Backend error', message: formatError(error) });
      setApiStatus('error');
      setDbStatus('error');
    }
  }

  async function refreshProfile(currentToken: string | null) {
    if (!currentToken) {
      setProfile(null);
      return;
    }

    try {
      setProfile(await api.getMe());
    } catch (error) {
      setProfile(null);
      setToken(null);
      setStoredToken(null);
      setNotice({ kind: 'error', title: 'Session expired', message: formatError(error) });
    }
  }

  useEffect(() => {
    void refreshBootstrap();
  }, []);

  useEffect(() => {
    void refreshProfile(token);
  }, [token]);

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy('auth');

    try {
      if (authMode === 'register') {
        await api.createUser(authForm);
        setAuthMode('login');
        setNotice({ kind: 'success', title: 'Account created', message: 'You can now log in.' });
      } else {
        const result = await api.login({ email: authForm.email, password: authForm.password });
        setToken(result.access_token);
        setStoredToken(result.access_token);
        setNotice({ kind: 'success', title: 'Logged in', message: `Welcome, ${result.nome}.` });
        setActivePage('me');
      }
    } catch (error) {
      setNotice({ kind: 'error', title: 'Authentication failed', message: formatError(error) });
    } finally {
      setBusy(null);
    }
  }

  async function handleCreateCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy('course-create');

    try {
      await api.createCourse(courseForm);
      setCourseForm(defaultCourseForm);
      await refreshBootstrap();
      setNotice({ kind: 'success', title: 'Course created', message: 'The course was created successfully.' });
    } catch (error) {
      setNotice({ kind: 'error', title: 'Course creation failed', message: formatError(error) });
    } finally {
      setBusy(null);
    }
  }

  async function handleCreateProfessor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy('professor-create');

    try {
      await api.createProfessor(professorForm);
      setProfessorForm(defaultProfessorForm);
      await refreshBootstrap();
      setNotice({ kind: 'success', title: 'Professor created', message: 'The professor was created successfully.' });
    } catch (error) {
      setNotice({ kind: 'error', title: 'Professor creation failed', message: formatError(error) });
    } finally {
      setBusy(null);
    }
  }

  async function handleCreateCourseReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !selectedCourse) {
      setNotice({ kind: 'error', title: 'Login required', message: 'Authenticate before posting a course review.' });
      return;
    }

    setBusy('course-review');
    try {
      await api.createAvaliacaoDisciplina({ ...courseReviewForm, disciplina_id: selectedCourse.id });
      setCourseReviewForm({ ...defaultCourseReviewForm, disciplina_id: selectedCourse.id });
      const payload = await api.getCourseReviews(selectedCourse.nome);
      setCourseReviews(payload.reviews as ReviewItem[]);
      setNotice({ kind: 'success', title: 'Review sent', message: 'Course evaluation submitted.' });
    } catch (error) {
      setNotice({ kind: 'error', title: 'Course review failed', message: formatError(error) });
    } finally {
      setBusy(null);
    }
  }

  async function handleCreateProfessorReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !selectedProfessor) {
      setNotice({ kind: 'error', title: 'Login required', message: 'Authenticate before posting a professor review.' });
      return;
    }

    setBusy('professor-review');
    try {
      await api.createAvaliacaoProfessor({ ...professorReviewForm, professor_id: selectedProfessor.id });
      setProfessorReviewForm({ ...defaultProfessorReviewForm, professor_id: selectedProfessor.id });
      const payload = await api.getProfessorReviews(selectedProfessor.nome);
      setProfessorReviews(payload.reviews as ReviewItem[]);
      setNotice({ kind: 'success', title: 'Review sent', message: 'Professor evaluation submitted.' });
    } catch (error) {
      setNotice({ kind: 'error', title: 'Professor review failed', message: formatError(error) });
    } finally {
      setBusy(null);
    }
  }

  async function handleCreateDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !selectedCourse || !documentFile) {
      setNotice({ kind: 'error', title: 'Missing data', message: 'Select a course and choose a file before uploading.' });
      return;
    }

    setBusy('document-create');
    try {
      await api.createDocumento({ ...documentForm, disciplina_id: selectedCourse.id }, documentFile);
      setDocumentForm({ ...defaultDocumentForm, disciplina_id: selectedCourse.id });
      setDocumentFile(null);
      const payload = await api.getDocumentos(selectedCourse.id);
      setDocuments(payload.documentos);
      setActivePage('disciplina.documentos');
      setNotice({ kind: 'success', title: 'Document uploaded', message: 'The file was posted successfully.' });
    } catch (error) {
      setNotice({ kind: 'error', title: 'Document upload failed', message: formatError(error) });
    } finally {
      setBusy(null);
    }
  }

  async function openCourse(course: Course) {
    setSelectedCourse(course);
    setSelectedDocument(null);
    setDocumentDetail(null);
    setBusy('course-open');
    setActivePage('disciplina.page');

    try {
      const [coursePayload, reviewPayload, documentPayload] = await Promise.all([
        api.getCourse(course.nome),
        api.getCourseReviews(course.nome),
        api.getDocumentos(course.id),
      ]);

      setSelectedCourse(coursePayload);
      setCourseReviews(reviewPayload.reviews as ReviewItem[]);
      setDocuments(documentPayload.documentos);
      setNotice({ kind: 'success', title: 'Course loaded', message: `${course.nome} is ready.` });
    } catch (error) {
      setCourseReviews([]);
      setDocuments([]);
      setNotice({ kind: 'error', title: 'Course load failed', message: formatError(error) });
    } finally {
      setBusy(null);
    }
  }

  async function openDocument(documento: Documento) {
    if (!selectedCourse) return;

    setSelectedDocument(documento);
    setActivePage('disciplina.documento');
    setBusy('document');

    try {
      const payload = await api.getDocumento(selectedCourse.id, documento.id);
      setDocumentDetail(payload as DocumentPayload);
      setNotice({ kind: 'success', title: 'Document loaded', message: documento.nome });
    } catch (error) {
      setDocumentDetail(null);
      setNotice({ kind: 'error', title: 'Document load failed', message: formatError(error) });
    } finally {
      setBusy(null);
    }
  }

  async function openProfessor(professor: Professor) {
    setSelectedProfessor(professor);
    setBusy('professor-open');
    setActivePage('professores.page');

    try {
      const [professorPayload, reviewPayload] = await Promise.all([
        api.getProfessor(professor.nome),
        api.getProfessorReviews(professor.nome),
      ]);

      setSelectedProfessor(professorPayload);
      setProfessorReviews(reviewPayload.reviews as ReviewItem[]);
      setNotice({ kind: 'success', title: 'Professor loaded', message: professor.nome });
    } catch (error) {
      setProfessorReviews([]);
      setNotice({ kind: 'error', title: 'Professor load failed', message: formatError(error) });
    } finally {
      setBusy(null);
    }
  }

  async function searchCourses(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = courseSearch.trim();
    if (!query) return;

    setBusy('course-search');
    try {
      const results = await api.searchCourses(query);
      setCourseResults(results);
      if (results.length > 0) {
        setNotice({ kind: 'info', title: 'Courses found', message: 'Open one of the course pages below.' });
      } else {
        setNotice({ kind: 'info', title: 'No course matches', message: 'Try a different course name.' });
      }
    } catch (error) {
      setNotice({ kind: 'error', title: 'Course search failed', message: formatError(error) });
    } finally {
      setBusy(null);
    }
  }

  async function searchProfessors(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = professorSearch.trim();
    if (!query) return;

    setBusy('professor-search');
    try {
      const results = await api.searchProfessors(query);
      setProfessorResults(results);
      if (results.length > 0) {
        setNotice({ kind: 'info', title: 'Professors found', message: 'Open one of the professor pages below.' });
      } else {
        setNotice({ kind: 'info', title: 'No professor matches', message: 'Try a different professor name.' });
      }
    } catch (error) {
      setNotice({ kind: 'error', title: 'Professor search failed', message: formatError(error) });
    } finally {
      setBusy(null);
    }
  }

  const courseHeading = selectedCourse?.nome ?? 'No course selected';
  const professorHeading = selectedProfessor?.nome ?? 'No professor selected';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="eyebrow">Game Analytics</span>
          <h1>UFF</h1>
          <p>Search, open detail pages, and keep documents nested under each discipline.</p>
        </div>

        <nav className="nav-tree">
          {pageTree.map((page) => (
            <button
              key={page.key}
              type="button"
              className={`nav-item ${activePage === page.key ? 'active' : ''}`}
              onClick={() => setActivePage(page.key)}
            >
              <strong>{page.label}</strong>
              <span>{page.description}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="content">
        <header className="page-header">
          <div>
            <span className="eyebrow">{currentPage.description}</span>
            <h2>{currentPage.label}</h2>
          </div>
          <div className="page-header-meta">
            <span className="pill">{api.API_BASE_URL}</span>
            <span className="pill">{token ? 'Authenticated' : 'Guest'}</span>
          </div>
        </header>

        {notice ? <div className={`banner banner-${notice.kind}`}>{notice.title}: {notice.message}</div> : null}

        <section className="hero-strip">
          <StatCard label="API" value={apiStatus} />
          <StatCard label="DB" value={dbStatus} />
          <StatCard label="Courses" value={String(courseCount)} />
          <StatCard label="Professors" value={String(professorCount)} />
          <StatCard label="Leaderboard" value={String(leaderboard.length)} />
        </section>

        {activePage === 'home' ? (
          <section className="page-panel">
            <SectionTitle
              eyebrow="Home"
              title="Minimal, name-first navigation"
              description="Search a disciplina or professor by name and move through the nested pages from there."
            />
            <div className="mini-grid">
              <div className="mini-card"><strong>Disciplina</strong><p>Search by course name, open the course page, then move to documents.</p></div>
              <div className="mini-card"><strong>Documentos</strong><p>Browse the documents attached to the selected discipline.</p></div>
              <div className="mini-card"><strong>Professores</strong><p>Search professor names and open their review page.</p></div>
              <div className="mini-card"><strong>Me</strong><p>See your profile after login.</p></div>
            </div>
          </section>
        ) : null}

        {activePage === 'auth' ? (
          <section className="page-panel">
            <SectionTitle eyebrow="Account" title="Login or create an account" description="Use the existing backend auth endpoints to sign in or register." />
            <div className="panel-card flat">
              <div className="tabs">
                <button type="button" className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>Login</button>
                <button type="button" className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>Create account</button>
              </div>

              <form className="form-grid" onSubmit={handleAuth}>
                {authMode === 'register' ? (
                  <input value={authForm.nome} onChange={(event) => setAuthForm({ ...authForm, nome: event.target.value })} placeholder="Nome" required />
                ) : null}
                <input type="email" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} placeholder="Email" required />
                <input type="password" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} placeholder="Password" required />
                <button className="primary-button" type="submit" disabled={busy === 'auth'}>{busy === 'auth' ? 'Working...' : authMode === 'login' ? 'Login' : 'Create account'}</button>
              </form>
            </div>
          </section>
        ) : null}

        {activePage === 'disciplina.search' ? (
          <section className="page-panel">
            <SectionTitle eyebrow="Disciplina" title="Search by course name" description="This page provides links to each course's individual page." />
            <form className="panel-card flat form-grid" onSubmit={searchCourses}>
              <input value={courseSearch} onChange={(event) => setCourseSearch(event.target.value)} placeholder="Type a course name" />
              <button className="secondary-button" type="submit" disabled={busy === 'course-search'}>{busy === 'course-search' ? 'Searching...' : 'Search'}</button>
            </form>

            <div className="mini-grid">
              {courseResults.length > 0 ? courseResults.map((course) => (
                <div key={course.id} className={`mini-card ${selectedCourse?.id === course.id ? 'selected' : ''}`}>
                  <strong>{course.nome}</strong>
                  <p>{course.codigo}</p>
                  <p>{course.faculdade}</p>
                  <LinkButton label="Open course page" onClick={() => void openCourse(course)} />
                </div>
              )) : <div className="mini-card"><strong>No results yet</strong><p>Search a course name to load matches.</p></div>}
            </div>
          </section>
        ) : null}

        {activePage === 'disciplina.create' ? (
          <section className="page-panel">
            <SectionTitle eyebrow="Disciplina" title="Create course" description="A separate page for creating courses." />
            <form className="panel-card flat form-grid" onSubmit={handleCreateCourse}>
              <input value={courseForm.nome} onChange={(event) => setCourseForm({ ...courseForm, nome: event.target.value })} placeholder="Nome" required />
              <input value={courseForm.codigo} onChange={(event) => setCourseForm({ ...courseForm, codigo: event.target.value })} placeholder="Código" required />
              <input value={courseForm.faculdade} onChange={(event) => setCourseForm({ ...courseForm, faculdade: event.target.value })} placeholder="Faculdade" required />
              <button className="primary-button" type="submit" disabled={busy === 'course-create'}>{busy === 'course-create' ? 'Creating...' : 'Create course'}</button>
            </form>
          </section>
        ) : null}

        {activePage === 'disciplina.page' ? (
          <section className="page-panel">
            <SectionTitle eyebrow="Disciplina" title="Course page" description="Displays the reviews and links to documents." />
            {!selectedCourse ? (
              <div className="mini-card"><strong>No course selected</strong><p>Use the search page to open a course.</p></div>
            ) : (
              <>
                <div className="mini-card">
                  <strong>{courseHeading}</strong>
                  <p>{selectedCourse.codigo} · {selectedCourse.faculdade}</p>
                  <p>{courseReviews.length} review(s) loaded</p>
                  <LinkButton label="Open documents page" onClick={() => setActivePage('disciplina.documentos')} />
                </div>
                <ReviewList reviews={courseReviews} />
                <form className="panel-card flat form-grid" onSubmit={handleCreateCourseReview}>
                  <strong>Leave a review</strong>
                  <input type="number" min="1" value={courseReviewForm.semestre_id || ''} onChange={(event) => setCourseReviewForm({ ...courseReviewForm, semestre_id: Number(event.target.value) })} placeholder="Semestre ID" required />
                  <input type="number" min="0" max="5" step="0.1" value={courseReviewForm.nota} onChange={(event) => setCourseReviewForm({ ...courseReviewForm, nota: Number(event.target.value) })} placeholder="Nota" required />
                  <textarea value={courseReviewForm.comentario} onChange={(event) => setCourseReviewForm({ ...courseReviewForm, comentario: event.target.value })} placeholder="Comentário" required />
                  <button className="primary-button" type="submit" disabled={busy === 'course-review'}>{busy === 'course-review' ? 'Posting...' : 'Post review'}</button>
                </form>
              </>
            )}
          </section>
        ) : null}

        {activePage === 'disciplina.documentos' ? (
          <section className="page-panel">
            <SectionTitle eyebrow="Documentos" title="Documents for the selected discipline" description="The list stays nested under the discipline you selected above." />
            {selectedCourse ? (
              <div className="mini-card">
                <strong>{courseHeading}</strong>
                <p>{documents.length} document(s)</p>
                <LinkButton label="Back to course page" onClick={() => setActivePage('disciplina.page')} />
              </div>
            ) : (
              <div className="mini-card"><strong>No discipline selected</strong><p>Search a course first.</p></div>
            )}

            {selectedCourse ? (
              <form className="panel-card flat form-grid" onSubmit={handleCreateDocument}>
                <strong>Post a document</strong>
                <input type="number" value={selectedCourse.id} readOnly />
                <input type="number" value={documentForm.semestro_id || ''} onChange={(event) => setDocumentForm({ ...documentForm, semestro_id: Number(event.target.value) })} placeholder="Semestre ID" required />
                <input value={documentForm.tipo} onChange={(event) => setDocumentForm({ ...documentForm, tipo: event.target.value })} placeholder="Tipo" required />
                <input type="file" onChange={(event) => setDocumentFile(event.target.files?.[0] ?? null)} required />
                <button className="primary-button" type="submit" disabled={busy === 'document-create'}>{busy === 'document-create' ? 'Uploading...' : 'Upload document'}</button>
              </form>
            ) : null}

            <div className="mini-grid">
              {selectedCourse && documents.length > 0 ? documents.map((documento) => (
                <div key={documento.id} className={`mini-card ${selectedDocument?.id === documento.id ? 'selected' : ''}`}>
                  <strong>{documento.nome}</strong>
                  <p>{documento.tipo} · tier {documento.tier}</p>
                  <p>Document #{documento.id}</p>
                  <LinkButton label="Open document" onClick={() => void openDocument(documento)} />
                </div>
              )) : null}
              {selectedCourse && documents.length === 0 ? <div className="mini-card"><strong>No documents</strong><p>This discipline does not have documents yet.</p></div> : null}
            </div>
          </section>
        ) : null}

        {activePage === 'disciplina.documento' ? (
          <section className="page-panel">
            <SectionTitle eyebrow="Documento" title="Document detail" description="Info, comments, score, and download live here." />
            {!selectedCourse || !selectedDocument ? (
              <div className="mini-card"><strong>No document selected</strong><p>Open a document from the documents page.</p></div>
            ) : documentDetail ? (
              <>
                <div className="mini-card">
                  <strong>{documentDetail.documento.titulo || documentDetail.documento.nome}</strong>
                  <p>Score: {documentDetail.score}</p>
                  <p>Type: {documentDetail.documento.tipo} · tier {documentDetail.documento.tier}</p>
                  <a className="secondary-button" href={api.downloadDocumentoUrl(selectedCourse.id, selectedDocument.id)}>Download</a>
                </div>
                <div className="mini-card">
                  <strong>Comments</strong>
                  {documentDetail.comentarios.length > 0 ? (
                    <div className="list-block">
                      {documentDetail.comentarios.map((comentario) => (
                        <div key={comentario.id} className="list-item">
                          <strong>Comment #{comentario.id}</strong>
                          <p>{comentario.texto}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No comments yet.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="mini-card"><strong>Loading document</strong><p>{busy === 'document' ? 'Fetching document details...' : 'Select a document to open it.'}</p></div>
            )}
          </section>
        ) : null}

        {activePage === 'professores.search' ? (
          <section className="page-panel">
            <SectionTitle eyebrow="Professores" title="Search by professor name" description="This page provides links to each professor's individual page." />
            <form className="panel-card flat form-grid" onSubmit={searchProfessors}>
              <input value={professorSearch} onChange={(event) => setProfessorSearch(event.target.value)} placeholder="Type a professor name" />
              <button className="secondary-button" type="submit" disabled={busy === 'professor-search'}>{busy === 'professor-search' ? 'Searching...' : 'Search'}</button>
            </form>

            <div className="mini-grid">
              {professorResults.length > 0 ? professorResults.map((professor) => (
                <div key={professor.id} className={`mini-card ${selectedProfessor?.id === professor.id ? 'selected' : ''}`}>
                  <strong>{professor.nome}</strong>
                  <p>{professor.departamento}</p>
                  <LinkButton label="Open professor page" onClick={() => void openProfessor(professor)} />
                </div>
              )) : <div className="mini-card"><strong>No results yet</strong><p>Search a professor name to load matches.</p></div>}
            </div>
          </section>
        ) : null}

        {activePage === 'professores.create' ? (
          <section className="page-panel">
            <SectionTitle eyebrow="Professores" title="Create professor" description="A separate page for creating professors." />
            <form className="panel-card flat form-grid" onSubmit={handleCreateProfessor}>
              <input value={professorForm.nome} onChange={(event) => setProfessorForm({ ...professorForm, nome: event.target.value })} placeholder="Nome" required />
              <input value={professorForm.email} onChange={(event) => setProfessorForm({ ...professorForm, email: event.target.value })} placeholder="Email" required />
              <input value={professorForm.departamento} onChange={(event) => setProfessorForm({ ...professorForm, departamento: event.target.value })} placeholder="Departamento" required />
              <button className="primary-button" type="submit" disabled={busy === 'professor-create'}>{busy === 'professor-create' ? 'Creating...' : 'Create professor'}</button>
            </form>
          </section>
        ) : null}

        {activePage === 'professores.page' ? (
          <section className="page-panel">
            <SectionTitle eyebrow="Professores" title="Professor page" description="Displays the reviews for the selected professor." />
            {!selectedProfessor ? (
              <div className="mini-card"><strong>No professor selected</strong><p>Use the search page to open a professor.</p></div>
            ) : (
              <>
                <div className="mini-card">
                  <strong>{professorHeading}</strong>
                  <p>{selectedProfessor.departamento}</p>
                  <p>{professorReviews.length} review(s) loaded</p>
                </div>
                <ReviewList reviews={professorReviews} />
                <form className="panel-card flat form-grid" onSubmit={handleCreateProfessorReview}>
                  <strong>Leave a review</strong>
                  <input type="number" min="1" value={professorReviewForm.semestre_id || ''} onChange={(event) => setProfessorReviewForm({ ...professorReviewForm, semestre_id: Number(event.target.value) })} placeholder="Semestre ID" required />
                  <input type="number" min="0" max="5" step="0.1" value={professorReviewForm.nota} onChange={(event) => setProfessorReviewForm({ ...professorReviewForm, nota: Number(event.target.value) })} placeholder="Nota" required />
                  <textarea value={professorReviewForm.comentario} onChange={(event) => setProfessorReviewForm({ ...professorReviewForm, comentario: event.target.value })} placeholder="Comentário" required />
                  <button className="primary-button" type="submit" disabled={busy === 'professor-review'}>{busy === 'professor-review' ? 'Posting...' : 'Post review'}</button>
                </form>
              </>
            )}
          </section>
        ) : null}

        {activePage === 'leaderboard' ? (
          <section className="page-panel">
            <SectionTitle eyebrow="Leaderboard" title="Top users" description="Simple read-only leaderboard page." />
            <div className="mini-grid">
              {leaderboard.length > 0 ? leaderboard.slice(0, 10).map((row) => (
                <div key={row.id} className="mini-card">
                  <strong>{row.nome}</strong>
                  <p>{row.tier} · {row.exp} exp</p>
                </div>
              )) : <div className="mini-card"><strong>No leaderboard data</strong><p>Load the API first.</p></div>}
            </div>
          </section>
        ) : null}

        {activePage === 'me' ? (
          <section className="page-panel">
            <SectionTitle eyebrow="Me" title="Your profile" description="The authenticated user profile lives here." />
            {profile ? (
              <div className="mini-card">
                <strong>{profile.nome}</strong>
                <p>{profile.email}</p>
                <p>{profile.tier} · {profile.exp} exp</p>
                <p>{profile.documentos.length} uploaded document(s)</p>
              </div>
            ) : (
              <div className="mini-card">
                <strong>Not logged in</strong>
                <p>Open the Account page to login or create an account.</p>
              </div>
            )}
          </section>
        ) : null}
      </main>
    </div>
  );
}
