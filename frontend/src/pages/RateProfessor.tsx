import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';

export default function RateProfessor() {
  const location = useLocation();
  const preSelectedProfessorId = location.state?.professorId?.toString() || '';

  const [profs, setProfs] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [form, setForm] = useState({ 
    professor_id: preSelectedProfessorId, 
    semestre_id: '', 
    metrica_1: 5, 
    metrica_2: 5, 
    metrica_3: 5, 
    comentario: '' 
  });

  useEffect(() => {
    api.get('/professors').then(res => setProfs(res.data));
    api.get('/semesters').then(res => {
      setSemesters(res.data);
      if (res.data.length > 0) {
        setForm(f => ({ ...f, semestre_id: res.data[0].id }));
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.professor_id || !form.semestre_id) {
      alert('Selecione um professor e um semestre');
      return;
    }
    try {
      await api.post('/avaliacao/professor', {
        ...form,
        professor_id: parseInt(form.professor_id),
        semestre_id: parseInt(form.semestre_id as string)
      });
      alert('Avaliação enviada!');
    } catch (err) {
      alert('Erro ao enviar avaliação');
    }
  };

  return (
    <div className="container">
      <h1>Avaliar Professor</h1>
      <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
        <div className="form-group">
          <label>Professor</label>
          <select value={form.professor_id} onChange={e => setForm({...form, professor_id: e.target.value})} required>
            <option value="">Selecione o Professor</option>
            {profs.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
        
        <div className="form-group">
          <label>Semestre</label>
          <select value={form.semestre_id} onChange={e => setForm({...form, semestre_id: e.target.value})} required>
            <option value="">Selecione o Semestre</option>
            {semesters.map(s => <option key={s.id} value={s.id}>{s.ano}.{s.periodo}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Métrica 1 (1-5)</label>
          <input type="number" min="1" max="5" value={form.metrica_1} onChange={e => setForm({...form, metrica_1: parseInt(e.target.value)})} required />
        </div>

        <div className="form-group">
          <label>Métrica 2 (1-5)</label>
          <input type="number" min="1" max="5" value={form.metrica_2} onChange={e => setForm({...form, metrica_2: parseInt(e.target.value)})} required />
        </div>

        <div className="form-group">
          <label>Métrica 3 (1-5)</label>
          <input type="number" min="1" max="5" value={form.metrica_3} onChange={e => setForm({...form, metrica_3: parseInt(e.target.value)})} required />
        </div>

        <div className="form-group">
          <label>Comentário</label>
          <textarea placeholder="Comentário" value={form.comentario} onChange={e => setForm({...form, comentario: e.target.value})} />
        </div>

        <button type="submit" className="primary">Enviar Avaliação</button>
      </form>
    </div>
  );
}
