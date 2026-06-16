import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { User, Mail, Award, FileText, Zap, ChevronRight, Trash2, RefreshCcw } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = () => {
    api.get('/users/me').then(res => {
      setUser(res.data);
      setLoading(false);
    }).catch((err: any) => {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        alert(err.response?.data?.detail || "Erro ao carregar perfil");
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleDeleteDoc = async (e: React.MouseEvent, docId: number) => {
    e.stopPropagation();
    if (!window.confirm("Deseja apagar este documento?")) return;
    try {
      await api.delete(`/documento/${docId}`);
      fetchProfile();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erro ao apagar");
    }
  };

  const handleResetTiers = async () => {
    if (!window.confirm("Isso irá reduzir o tier de TODOS os usuários em um nível. Continuar?")) return;
    try {
      await api.post('/admin/reset-tiers');
      alert("Tiers resetados com sucesso!");
      fetchProfile();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erro ao resetar");
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Carregando perfil...</div>;

  // Calculate progress based on thresholds from backend
  const currentTierExp = user.exp;
  const nextTierThreshold = user.next_tier_threshold;
  const isMaxTier = user.next_tier_name === "Max";
  
  // To show meaningful progress, we should ideally know the start threshold of the current tier too
  // But for now, we'll just show progress towards the next one.
  const progress = isMaxTier ? 100 : Math.min(100, (currentTierExp / nextTierThreshold) * 100);

  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* User Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              background: 'var(--primary)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              border: '4px solid var(--border)'
            }}>
              <User size={48} color="white" />
            </div>
            <h2 style={{ marginBottom: '0.25rem' }}>{user.nome}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Mail size={14} /> {user.email}
            </p>
            
            <div style={{ textAlign: 'left', background: 'var(--bg-dark)', padding: '1rem', borderRadius: 'var(--radius)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{user.tier}</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user.exp} XP</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent)', borderRadius: '4px' }} />
              </div>
              {!isMaxTier ? (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
                  {nextTierThreshold - user.exp} XP para {user.next_tier_name}
                </p>
              ) : (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
                  Nível máximo atingido!
                </p>
              )}
            </div>

            {user.user_role === 'admin' && (
              <button 
                onClick={handleResetTiers}
                className="secondary" 
                style={{ marginTop: '1.5rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--error)' }}
              >
                <RefreshCcw size={16} /> Resetar Semestre
              </button>
            )}
          </div>

          <div className="card">
            <h3>Conquistas</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span className="badge badge-primary"><Award size={12} /> Contribuidor</span>
              <span className="badge badge-accent"><Zap size={12} /> Veterano</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FileText size={24} style={{ color: 'var(--primary)' }} />
              Meus Documentos
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Documentos e materiais de estudo que você compartilhou com a comunidade.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {user.documentos.length > 0 ? user.documentos.map((d: any) => (
                <Link key={d.id} to={`/disciplina/${d.disciplina_nome}/documentos/${d.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="document-item">
                    <div style={{ background: 'var(--bg-dark)', padding: '0.75rem', borderRadius: '8px' }}>
                      <FileText size={20} color="var(--primary)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600' }}>{d.nome}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{d.tipo} • {d.disciplina_nome}</div>
                    </div>
                    <button 
                      onClick={(e) => handleDeleteDoc(e, d.id)}
                      className="secondary"
                      style={{ padding: '0.5rem', color: 'var(--error)', borderColor: 'transparent', background: 'transparent' }}
                    >
                      <Trash2 size={18} />
                    </button>
                    <ChevronRight size={18} color="var(--text-muted)" />
                  </div>
                </Link>
              )) : (
                <div style={{ textAlign: 'center', padding: '2rem', border: '2px dashed var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-muted)' }}>
                  Você ainda não enviou nenhum documento.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .document-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          transition: all 0.2s;
        }
        .document-item:hover {
          background: rgba(139, 92, 246, 0.05);
          border-color: var(--primary);
        }
      `}</style>
    </div>
  );
}
