import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import SearchDisciplina from './pages/SearchDisciplina';
import Disciplina from './pages/Disciplina';
import Documentos from './pages/Documentos';
import Documento from './pages/Documento';
import SearchProfessor from './pages/SearchProfessor';
import Professor from './pages/Professor';
import CreateProfessor from './pages/CreateProfessor';
import CreateDisciplina from './pages/CreateDisciplina';
import RateProfessor from './pages/RateProfessor';
import RateDisciplina from './pages/RateDisciplina';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import Profile from './pages/Profile';

function App() {
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <Router>
      <nav className="navbar">
        <Link to="/">Home</Link>
        <Link to="/leaderboard">Leaderboard</Link>
        {isLoggedIn ? (
          <>
            <Link to="/me">My Profile</Link>
            <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/'; }}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login/Register</Link>
        )}
      </nav>
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
        <Route path="/rate-professor" element={<RateProfessor />} />
        <Route path="/rate-disciplina" element={<RateDisciplina />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/me" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
