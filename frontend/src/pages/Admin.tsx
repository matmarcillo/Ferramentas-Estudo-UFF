import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useUser } from '../hooks/useUser';
import { Activity, Zap, ZapOff, PlusCircle } from 'lucide-react';

interface TelemetryData {
  date: string;
  document: number;
  course_review: number;
  professor_review: number;
}

export default function Admin() {
  const { isAdmin } = useUser();
  const navigate = useNavigate();
  const [telemetry, setTelemetry] = useState<TelemetryData[]>([]);
  const [doubleXp, setDoubleXp] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      const [telemetryRes, doubleXpRes] = await Promise.all([
        api.get('/admin/telemetry'),
        api.get('/admin/double-xp')
      ]);
      setTelemetry(telemetryRes.data);
      setDoubleXp(doubleXpRes.data.active);
    } catch (err) {
      console.error("Error fetching admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDoubleXp = async () => {
    try {
      const res = await api.post(`/admin/double-xp?active=${!doubleXp}`);
      setDoubleXp(res.data.active);
      alert(`Double XP ${res.data.active ? 'ativado' : 'desativado'}!`);
    } catch (err) {
      alert("Error toggling double XP");
    }
  };

  if (!isAdmin) return <div className="container">Acesso negado.</div>;
  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>Carregando dados administrativos...</div>;

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1>Painel Administrativo</h1>

      <section className="card">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Zap size={24} color={doubleXp ? "var(--accent)" : "currentColor"} />
          Evento Global: Double XP
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Ative o modo Double XP para incentivar a participação dos usuários durante períodos de baixa atividade.
        </p>
        <button 
          onClick={toggleDoubleXp} 
          className={doubleXp ? "primary" : "secondary"}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {doubleXp ? <ZapOff size={18} /> : <Zap size={18} />}
          {doubleXp ? "Desativar Double XP" : "Ativar Double XP"}
        </button>
      </section>

      <section className="card">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Activity size={24} /> Telemetria de Atividade
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Monitoramento de postagens diárias (Documentos e Avaliações).
        </p>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '1rem' }}>Data</th>
                <th style={{ textAlign: 'center', padding: '1rem' }}>Documentos</th>
                <th style={{ textAlign: 'center', padding: '1rem' }}>Aval. Disciplinas</th>
                <th style={{ textAlign: 'center', padding: '1rem' }}>Aval. Professores</th>
              </tr>
            </thead>
            <tbody>
              {telemetry.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Nenhuma atividade registrada ainda.
                  </td>
                </tr>
              ) : (
                telemetry.map(row => (
                  <tr key={row.date} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem' }}>{row.date}</td>
                    <td style={{ textAlign: 'center', padding: '1rem' }}>{row.document}</td>
                    <td style={{ textAlign: 'center', padding: '1rem' }}>{row.course_review}</td>
                    <td style={{ textAlign: 'center', padding: '1rem' }}>{row.professor_review}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <button onClick={() => navigate('/create-semester')} className="secondary" style={{ padding: '2rem', flexDirection: 'column' }}>
          <PlusCircle size={24} style={{ marginBottom: '0.5rem' }} /> Gerenciar Semestres
        </button>
        <button onClick={() => navigate('/create-disciplina')} className="secondary" style={{ padding: '2rem', flexDirection: 'column' }}>
          <PlusCircle size={24} style={{ marginBottom: '0.5rem' }} /> Gerenciar Disciplinas
        </button>
        <button onClick={() => navigate('/create-professor')} className="secondary" style={{ padding: '2rem', flexDirection: 'column' }}>
          <PlusCircle size={24} style={{ marginBottom: '0.5rem' }} /> Gerenciar Professores
        </button>
      </section>
    </div>
  );
}
