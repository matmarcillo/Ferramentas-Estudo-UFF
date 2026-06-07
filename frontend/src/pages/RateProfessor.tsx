import { useState, useEffect } from 'react';
import api from '../services/api';

export default function RateProfessor() {
  const [profs, setProfs] = useState<any[]>([]);
  const [form, setForm] = useState({ professor_id: '', semestre_id: 1, nota: 5, comentario: '' });

  useEffect(() => {
    api.get('/professors').then(res => setProfs(res.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/avaliacao/professor', {
        ...form,
        professor_id: parseInt(form.professor_id)
      });
      alert('Avaliação enviada!');
    } catch (err) {
      alert('Erro ao enviar avaliação');
    }
  };

  return (
    <div>
      <h1>Avaliar Professor</h1>
      <form onSubmit={handleSubmit}>
        <select value={form.professor_id} onChange={e => setForm({...form, professor_id: e.target.value})}>
          <option value="">Selecione o Professor</option>
          {profs.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
        <input type="number" min="1" max="5" value={form.nota} onChange={e => setForm({...form, nota: parseInt(e.target.value)})} />
        <textarea placeholder="Comentário" value={form.comentario} onChange={e => setForm({...form, comentario: e.target.value})} />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}
