import { Link } from 'react-router-dom';
import { BookOpen, Users, Search, PlusCircle, Star, ArrowRight } from 'lucide-react';

export default function Home() {
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
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
      `}</style>
    </div>
  );
}
