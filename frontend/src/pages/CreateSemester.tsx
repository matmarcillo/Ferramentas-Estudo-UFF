import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useUser } from '../hooks/useUser';

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

  return (
    <div className="container">
      <h1>Cadastrar Semestre</h1>
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
  );
}
