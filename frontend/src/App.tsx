import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Home as HomeIcon, Trophy, User, LogOut, LogIn, Settings, Github, Heart } from 'lucide-react';
import Home from './pages/Home';
import SearchDisciplina from './pages/SearchDisciplina';
import Disciplina from './pages/Disciplina';
import Documentos from './pages/Documentos';
import Documento from './pages/Documento';
import SearchProfessor from './pages/SearchProfessor';
import Professor from './pages/Professor';
import CreateProfessor from './pages/CreateProfessor';
import CreateDisciplina from './pages/CreateDisciplina';
import CreateSemester from './pages/CreateSemester';
import PostDocument from './pages/PostDocument';
import RateProfessor from './pages/RateProfessor';
import RateDisciplina from './pages/RateDisciplina';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import Profile from './pages/Profile';
import { useUser } from './hooks/useUser';

function App() {
  const { isAdmin, isLoggedIn } = useUser();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <NavLink to="/" className="nav-brand" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
            Game Analytics
          </NavLink>
          <div className="nav-links">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
              <HomeIcon size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Home
            </NavLink>
            <NavLink to="/leaderboard" className={({ isActive }) => isActive ? 'active' : ''}>
              <Trophy size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Leaderboard
            </NavLink>
            {isLoggedIn && (
               <NavLink to="/post-document" className={({ isActive }) => isActive ? 'active' : ''}>
                  Postar Documento
               </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/create-semester" className={({ isActive }) => isActive ? 'active' : ''}>
                <Settings size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Admin
              </NavLink>
            )}
            {isLoggedIn ? (
              <>
                <NavLink to="/me" className={({ isActive }) => isActive ? 'active' : ''}>
                  <User size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  Profile
                </NavLink>
                <button onClick={handleLogout} className="secondary" style={{ padding: '0.5rem 1rem' }}>
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>
                <LogIn size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Login
              </NavLink>
            )}
          </div>
        </nav>

        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search-disciplina" element={<SearchDisciplina />} />
            <Route path="/disciplina/:name" element={<Disciplina />} />
            <Route path="/disciplina/:name/documentos" element={<Documentos />} />
            <Route path="/disciplina/:name/documentos/:docId" element={<Documento />} />
            <Route path="/search-professor" element={<SearchProfessor />} />
            <Route path="/professor/:name" element={<Professor />} />
            <Route path="/create-professor" element={<CreateProfessor />} />
            <Route path="/create-disciplina" element={<CreateDisciplina />} />
            <Route path="/create-semester" element={<CreateSemester />} />
            <Route path="/post-document" element={<PostDocument />} />
            <Route path="/rate-professor" element={<RateProfessor />} />
            <Route path="/rate-disciplina" element={<RateDisciplina />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/me" element={<Profile />} />
          </Routes>
        </main>

        <footer className="footer">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Game Analytics</h4>
              <p>Promovendo a colaboração e transparência acadêmica na UFF.</p>
            </div>
            <div className="footer-section">
              <h4>Links Rápidos</h4>
              <div className="footer-links">
                <NavLink to="/leaderboard">Leaderboard</NavLink>
                <NavLink to="/search-disciplina">Disciplinas</NavLink>
                <NavLink to="/search-professor">Professores</NavLink>
              </div>
            </div>
            <div className="footer-section">
              <h4>Comunidade</h4>
              <div className="footer-links">
                <a href="https://github.com/matmarcillo/Ferramentas-Estudo-UFF" target="_blank" rel="noopener noreferrer">
                  <Github size={16} /> GitHub
                </a>
                <span>UFF - Universidade Federal Fluminense</span>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>Feito com <Heart size={14} style={{ color: '#ef4444' }} /> por estudantes para estudantes</p>
            <p>&copy; {new Date().getFullYear()} Game Analytics UFF</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
