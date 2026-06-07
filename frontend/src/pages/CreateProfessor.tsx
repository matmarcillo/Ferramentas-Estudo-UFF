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
    <div>
      <h1>Cadastrar Professor</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Nome" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
        <input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        <input placeholder="Departamento" value={form.departamento} onChange={e => setForm({...form, departamento: e.target.value})} />
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}
