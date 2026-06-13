import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { courseMetricsMapping } from '../utils/metricsMapping';

export default function RateDisciplina() {
  const location = useLocation();
  const preSelectedDisciplinaId = location.state?.disciplinaId?.toString() || '';

  const [courses, setCourses] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [profs, setProfs] = useState<any[]>([]);
  const [form, setForm] = useState({ 
    disciplina_id: preSelectedDisciplinaId, 
    semestre_id: '', 
    professor_id: '', 
    dificuldade: 3, 
    utilidade: 3, 
    interesse: 3, 
    carga_trabalho: 3,
    status_aprovacao: 'Aprovado',
    comentario: '' 
  });

  useEffect(() => {
    api.get('/courses').then(res => setCourses(res.data));
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
    if (!form.disciplina_id || !form.semestre_id) {
      alert('Selecione uma disciplina e um semestre');
      return;
    }
    try {
      await api.post('/avaliacao/disciplina', {
        ...form,
        disciplina_id: parseInt(form.disciplina_id),
        semestre_id: parseInt(form.semestre_id as string),
        professor_id: form.professor_id ? parseInt(form.professor_id) : null
      });
      alert('Avaliação enviada!');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro ao enviar avaliação');
    }
  };

  return (
    <div className="container">
      <h1>Avaliar Disciplina</h1>
      <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
        <div className="form-group">
          <label>Disciplina</label>
          <select value={form.disciplina_id} onChange={e => setForm({...form, disciplina_id: e.target.value})} required>
            <option value="">Selecione a Disciplina</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Professor (Opcional)</label>
          <select value={form.professor_id} onChange={e => setForm({...form, professor_id: e.target.value})}>
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

        {Object.entries(courseMetricsMapping).map(([key, metric]) => (
          <div className="form-group" key={key}>
            <label>{metric.label}</label>
            <select 
              value={(form as any)[key]} 
              onChange={e => setForm({...form, [key]: parseInt(e.target.value)})} 
              required
            >
              {Object.entries(metric.options).map(([val, label]) => (
                <option key={val} value={val}>{val} - {label}</option>
              ))}
            </select>
          </div>
        ))}

        <div className="form-group">
          <label>Status de Aprovação</label>
          <select value={form.status_aprovacao} onChange={e => setForm({...form, status_aprovacao: e.target.value})} required>
            <option value="Aprovado">Aprovado</option>
            <option value="Reprovado">Reprovado</option>
            <option value="Recuperação">Recuperação</option>
          </select>
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
