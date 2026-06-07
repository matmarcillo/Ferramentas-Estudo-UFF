import { useState } from 'react';
import api from '../services/api';

export default function CreateDisciplina() {
  const [form, setForm] = useState({ nome: '', codigo: '', faculdade: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/course', form);
      alert('Disciplina cadastrada com sucesso!');
    } catch (err) {
      alert('Erro ao cadastrar disciplina');
    }
  };

  return (
    <div>
      <h1>Cadastrar Disciplina</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Nome" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
        <input placeholder="Código" value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} />
        <input placeholder="Faculdade" value={form.faculdade} onChange={e => setForm({...form, faculdade: e.target.value})} />
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}
