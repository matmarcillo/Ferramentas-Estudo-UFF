import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      <h1>Game Analytics - UFF</h1>
      <p>Bem-vindo ao sistema de avaliação e compartilhamento de documentos da UFF.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="card">
          <h2>Disciplinas</h2>
          <Link to="/search-disciplina">Pesquisar Disciplina</Link><br/>
          <Link to="/create-disciplina">Cadastrar Disciplina</Link><br/>
          <Link to="/rate-disciplina">Avaliar Disciplina</Link>
        </div>
        <div className="card">
          <h2>Professores</h2>
          <Link to="/search-professor">Pesquisar Professor</Link><br/>
          <Link to="/create-professor">Cadastrar Professor</Link><br/>
          <Link to="/rate-professor">Avaliar Professor</Link>
        </div>
      </div>
    </div>
  );
}
