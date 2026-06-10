import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useUser } from '../hooks/useUser';
import { RefreshCcw, PlusCircle } from 'lucide-react';

export default function CreateSemester() {
  const [form, setForm] = useState({ ano: new Date().getFullYear(), periodo: '1' });
  const { isAdmin } = useUser();
  const navigate = useNavigate();

  if (!isAdmin) {
    return <div>Acesso negado. Apenas administradores podem acessar esta página.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/semester', form);
      alert('Semestre cadastrado com sucesso!');
      navigate('/');
    } catch (err) {
      alert('Erro ao cadastrar semestre');
    }
  };

  const handleResetTiers = async () => {
    if (!window.confirm("Isso irá reduzir o tier de TODOS os usuários em um nível. Esta ação não pode ser desfeita. Continuar?")) return;
    try {
      await api.post('/admin/reset-tiers');
      alert("Tiers resetados com sucesso!");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erro ao resetar");
    }
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <PlusCircle size={24} /> Cadastrar Novo Semestre
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Adicione um novo período letivo ao sistema.</p>
        <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label htmlFor="ano">Ano</label>
            <input 
              id="ano"
              type="number" 
              placeholder="Ex: 2024" 
              value={form.ano} 
              onChange={e => setForm({...form, ano: parseInt(e.target.value)})} 
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="periodo">Período</label>
            <select 
              id="periodo"
              value={form.periodo} 
              onChange={e => setForm({...form, periodo: e.target.value})}
              required
            >
              <option value="1">1º Semestre</option>
              <option value="2">2º Semestre</option>
              <option value="S">Summer</option>
            </select>
          </div>
          <button type="submit" className="primary">Cadastrar</button>
        </form>
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--error)' }}>
          <RefreshCcw size={24} /> Ações Críticas
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Ações que impactam todos os usuários do sistema.</p>
        <div className="card" style={{ padding: '2rem', border: '1px solid var(--error-faint)' }}>
          <h3>Resetar Tiers (Novo Semestre)</h3>
          <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Esta ação deve ser executada no início de cada novo semestre. Ela reduzirá o nível de experiência de todos os usuários para o limite inferior do tier imediatamente abaixo, incentivando a participação contínua.
          </p>
          <button 
            onClick={handleResetTiers}
            className="secondary" 
            style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
          >
            Executar Reset de Semestre
          </button>
        </div>
      </div>
    </div>
  );
}
