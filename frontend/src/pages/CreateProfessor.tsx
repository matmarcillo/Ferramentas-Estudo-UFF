import { useState } from 'react';
import api from '../services/api';

export default function CreateProfessor() {
  const [form, setForm] = useState({ nome: '', email: '', departamento: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/professor', form);
      alert('Professor cadastrado com sucesso!');
    } catch (err) {
      alert('Erro ao cadastrar professor');
    }
  };

  return (
    <div className="container">
      <h1>Cadastrar Professor</h1>
      <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
        <div className="form-group">
          <label>Nome</label>
          <input placeholder="Nome" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
        </div>
        <div className="form-group">
          <label>Departamento</label>
          <input placeholder="Departamento" value={form.departamento} onChange={e => setForm({...form, departamento: e.target.value})} required />
        </div>
        <button type="submit" className="primary">Cadastrar</button>
      </form>
    </div>
  );
}
