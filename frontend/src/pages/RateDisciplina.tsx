import { useState, useEffect } from 'react';
import api from '../services/api';

export default function RateDisciplina() {
  const [courses, setCourses] = useState<any[]>([]);
  const [form, setForm] = useState({ disciplina_id: '', semestre_id: 1, nota: 5, comentario: '' });

  useEffect(() => {
    api.get('/courses').then(res => setCourses(res.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/avaliacao/disciplina', {
        ...form,
        disciplina_id: parseInt(form.disciplina_id)
      });
      alert('Avaliação enviada!');
    } catch (err) {
      alert('Erro ao enviar avaliação');
    }
  };

  return (
    <div>
      <h1>Avaliar Disciplina</h1>
      <form onSubmit={handleSubmit}>
        <select value={form.disciplina_id} onChange={e => setForm({...form, disciplina_id: e.target.value})}>
          <option value="">Selecione a Disciplina</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <input type="number" min="1" max="5" value={form.nota} onChange={e => setForm({...form, nota: parseInt(e.target.value)})} />
        <textarea placeholder="Comentário" value={form.comentario} onChange={e => setForm({...form, comentario: e.target.value})} />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}
