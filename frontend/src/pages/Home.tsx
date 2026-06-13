import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Search, PlusCircle, Star, ArrowRight, Trophy } from 'lucide-react';
import api from '../services/api';

export default function Home() {
  const [topCourses, setTopCourses] = useState<any[]>([]);
  const [topProfs, setTopProfs] = useState<any[]>([]);

  useEffect(() => {
    api.get('/courses/ranking?limit=3&order=desc').then(res => setTopCourses(res.data));
    api.get('/professors/ranking?limit=3&order=desc').then(res => setTopProfs(res.data));
  }, []);

  return (
    <div style={{ padding: '2rem 0' }}>
      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Game Analytics - UFF
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          A plataforma definitiva para avaliação de disciplinas e professores, e compartilhamento de conhecimento na UFF.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        <div className="card">
          <h2>
            <BookOpen className="accent" size={24} style={{ color: 'var(--primary)' }} />
            Disciplinas
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Explore e avalie as disciplinas do seu curso. Encontre materiais de estudo compartilhados por outros alunos.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/search-disciplina" className="nav-link-item">
              <Search size={18} /> Pesquisar Disciplina <ArrowRight size={16} className="arrow" />
            </Link>
            <Link to="/create-disciplina" className="nav-link-item">
              <PlusCircle size={18} /> Cadastrar Disciplina <ArrowRight size={16} className="arrow" />
            </Link>
            <Link to="/rate-disciplina" className="nav-link-item">
              <Star size={18} /> Avaliar Disciplina <ArrowRight size={16} className="arrow" />
            </Link>
          </div>
        </div>

        <div className="card">
          <h2>
            <Users size={24} style={{ color: 'var(--accent)' }} />
            Professores
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Conheça melhor o corpo docente da universidade através das avaliações e experiências de outros estudantes.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/search-professor" className="nav-link-item">
              <Search size={18} /> Pesquisar Professor <ArrowRight size={16} className="arrow" />
            </Link>
            <Link to="/create-professor" className="nav-link-item">
              <PlusCircle size={18} /> Cadastrar Professor <ArrowRight size={16} className="arrow" />
            </Link>
            <Link to="/rate-professor" className="nav-link-item">
              <Star size={18} /> Avaliar Professor <ArrowRight size={16} className="arrow" />
            </Link>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Trophy size={22} color="#ffd700" /> Top 3 Disciplinas
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {topCourses.map((c, i) => (
              <Link key={c.id} to={`/disciplina/${c.nome}`} className="ranking-item">
                <span className="rank-number">{i + 1}</span>
                <span style={{ flex: 1 }}>{c.nome}</span>
                <span className="rank-score"><Star size={14} fill="currentColor" /> {parseFloat(c.mean_score).toFixed(1)}</span>
              </Link>
            ))}
            {topCourses.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Nenhuma disciplina avaliada ainda.</p>}
          </div>
        </div>

        <div className="card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Trophy size={22} color="#ffd700" /> Top 3 Professores
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {topProfs.map((p, i) => (
              <Link key={p.id} to={`/professor/${p.nome}`} className="ranking-item">
                <span className="rank-number">{i + 1}</span>
                <span style={{ flex: 1 }}>{p.nome}</span>
                <span className="rank-score"><Star size={14} fill="currentColor" /> {parseFloat(p.mean_score).toFixed(1)}</span>
              </Link>
            ))}
            {topProfs.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Nenhum professor avaliado ainda.</p>}
          </div>
        </div>
      </div>

      <style>{`
        .nav-link-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: var(--bg-dark);
          border-radius: var(--radius);
          color: var(--text-main);
          font-weight: 500;
          transition: all 0.2s;
        }
        .nav-link-item:hover {
          background: var(--border);
          color: var(--primary);
          padding-left: 1.25rem;
        }
        .nav-link-item .arrow {
          margin-left: auto;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .nav-link-item:hover .arrow {
          opacity: 1;
        }

        .ranking-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius);
          color: var(--text-main);
          text-decoration: none;
          transition: transform 0.2s;
        }
        .ranking-item:hover {
          transform: translateX(5px);
          background: rgba(255, 255, 255, 0.05);
        }
        .rank-number {
          font-weight: bold;
          color: var(--primary);
          width: 20px;
        }
        .rank-score {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-weight: bold;
          color: var(--accent);
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}

