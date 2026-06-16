import { useEffect, useState } from 'react';
import api from '../services/api';
import { Medal, Shield, Zap, Star, ThumbsUp, ThumbsDown, User, BookOpen, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

type Tab = 'alunos' | 'disciplinas' | 'professores';

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<Tab>('alunos');
  const [users, setUsers] = useState<any[]>([]);
  const [topItems, setTopItems] = useState<any[]>([]);
  const [bottomItems, setBottomItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'alunos') {
      api.get('/users/leaderboard').then(res => {
        setUsers(res.data);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    } else if (activeTab === 'disciplinas') {
      Promise.all([
        api.get('/courses/ranking?limit=10&order=desc'),
        api.get('/courses/ranking?limit=10&order=asc')
      ]).then(([top, bottom]) => {
        setTopItems(top.data);
        setBottomItems(bottom.data);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    } else if (activeTab === 'professores') {
      Promise.all([
        api.get('/professors/ranking?limit=10&order=desc'),
        api.get('/professors/ranking?limit=10&order=asc')
      ]).then(([top, bottom]) => {
        setTopItems(top.data);
        setBottomItems(bottom.data);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [activeTab]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Medal color="#ffd700" size={20} />;
      case 1: return <Medal color="#c0c0c0" size={20} />;
      case 2: return <Medal color="#cd7f32" size={20} />;
      default: return null;
    }
  };

  const getTierBadge = (tier: string) => {
    const isHigh = ['Gold', 'Platinum', 'Diamond'].some(t => tier.includes(t));
    return (
      <span className={`badge ${isHigh ? 'badge-accent' : 'badge-primary'}`}>
        <Shield size={12} style={{ marginRight: '4px' }} />
        {tier}
      </span>
    );
  };

  return (
    <div style={{ padding: '2rem 0' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: '12px', display: 'flex' }}>
            <Medal color="white" />
          </div> 
          Leaderboard
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Os rankings da nossa comunidade UFF.</p>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', background: 'var(--bg-dark)', padding: '0.5rem', borderRadius: 'var(--radius)', width: 'fit-content' }}>
        <button 
          onClick={() => setActiveTab('alunos')} 
          className={activeTab === 'alunos' ? 'tab-btn active' : 'tab-btn'}
        >
          <User size={18} /> Alunos
        </button>
        <button 
          onClick={() => setActiveTab('disciplinas')} 
          className={activeTab === 'disciplinas' ? 'tab-btn active' : 'tab-btn'}
        >
          <BookOpen size={18} /> Disciplinas
        </button>
        <button 
          onClick={() => setActiveTab('professores')} 
          className={activeTab === 'professores' ? 'tab-btn active' : 'tab-btn'}
        >
          <Users size={18} /> Professores
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Carregando...</div>
      ) : activeTab === 'alunos' ? (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: '80px', textAlign: 'center' }}>Pos</th>
                <th>Estudante</th>
                <th>Tier</th>
                <th style={{ textAlign: 'right' }}>Experiência</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} style={{ background: i < 3 ? 'rgba(139, 92, 246, 0.05)' : 'transparent' }}>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      {getRankIcon(i)}
                      {i + 1}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{u.nome}</div>
                  </td>
                  <td>{getTierBadge(u.tier)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--accent)' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Zap size={14} />
                      {parseFloat(u.exp).toFixed(0)} XP
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: '#4ade80' }}>
              <ThumbsUp size={24} /> Melhores Avaliados
            </h2>
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '60px', textAlign: 'center' }}>#</th>
                    <th>{activeTab === 'disciplinas' ? 'Disciplina' : 'Professor'}</th>
                    <th style={{ textAlign: 'right' }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {topItems.map((item, i) => (
                    <tr key={item.id}>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{i + 1}</td>
                      <td>
                        <Link 
                          to={activeTab === 'disciplinas' ? `/disciplina/${item.nome}` : `/professor/${item.nome}`}
                          style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: '600' }}
                        >
                          {item.nome}
                        </Link>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {activeTab === 'disciplinas' ? item.codigo : item.departamento}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                          <Star size={14} fill="var(--primary)" />
                          {parseFloat(item.mean_score).toFixed(1)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: '#f87171' }}>
              <ThumbsDown size={24} /> Piores Avaliados
            </h2>
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '60px', textAlign: 'center' }}>#</th>
                    <th>{activeTab === 'disciplinas' ? 'Disciplina' : 'Professor'}</th>
                    <th style={{ textAlign: 'right' }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {bottomItems.map((item, i) => (
                    <tr key={item.id}>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{i + 1}</td>
                      <td>
                        <Link 
                          to={activeTab === 'disciplinas' ? `/disciplina/${item.nome}` : `/professor/${item.nome}`}
                          style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: '600' }}
                        >
                          {item.nome}
                        </Link>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {activeTab === 'disciplinas' ? item.codigo : item.departamento}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold', color: '#f87171' }}>
                          <Star size={14} fill="#f87171" />
                          {parseFloat(item.mean_score).toFixed(1)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.25rem;
          border-radius: calc(var(--radius) - 4px);
          background: transparent;
          color: var(--text-muted);
          font-weight: 600;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
        }
        .tab-btn:hover {
          color: var(--text-main);
        }
        .tab-btn.active {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }
      `}</style>
    </div>
  );
}

