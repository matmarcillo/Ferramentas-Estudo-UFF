import { useState } from 'react';
import api from '../services/api';

export default function CreateDisciplina() {
  const [form, setForm] = useState({ nome: '', codigo: '', faculdade: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/course', form);
      alert('Disciplina cadastrada com sucesso!');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro ao cadastrar disciplina');
    }
  };

  return (
    <div className="container">
      <h1>Cadastrar Disciplina</h1>
      <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
        <div className="form-group">
          <label>Nome</label>
          <input placeholder="Nome" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
        </div>
        <div className="form-group">
          <label>Código</label>
          <input placeholder="Código" value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} required />
        </div>
        <div className="form-group">
          <label>Faculdade</label>
          <input placeholder="Faculdade" value={form.faculdade} onChange={e => setForm({...form, faculdade: e.target.value})} required />
        </div>
        <button type="submit" className="primary">Cadastrar</button>
      </form>
    </div>
  );
}
