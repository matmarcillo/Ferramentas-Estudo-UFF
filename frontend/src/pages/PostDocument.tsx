import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

export default function PostDocument() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCourseId = queryParams.get('courseId') || '';

  const [courses, setCourses] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [form, setForm] = useState({
    disciplina_id: initialCourseId,
    semestre_id: '',
    tipo: 'resumo',
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/courses').then(res => setCourses(res.data));
    api.get('/semesters').then(res => {
      setSemesters(res.data);
      if (res.data.length > 0) {
        setForm(f => ({ ...f, semestre_id: res.data[0].id }));
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !form.disciplina_id || !form.semestre_id) {
      alert('Preencha todos os campos e selecione um arquivo');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('disciplina_id', form.disciplina_id);
    formData.append('semestre_id', form.semestre_id);
    formData.append('tipo', form.tipo);

    try {
      await api.post('/documento', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Documento postado com sucesso!');
      // Navigate back to the course documents page
      const course = courses.find(c => c.id === parseInt(form.disciplina_id));
      if (course) {
        navigate(`/disciplina/${course.nome}/documentos`);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro ao postar documento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Postar Documento</h1>
      <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
        <div className="form-group">
          <label>Disciplina</label>
          <select 
            value={form.disciplina_id} 
            onChange={e => setForm({ ...form, disciplina_id: e.target.value })}
            required
          >
            <option value="">Selecione a Disciplina</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Semestre</label>
          <select 
            value={form.semestre_id} 
            onChange={e => setForm({ ...form, semestre_id: e.target.value })}
            required
          >
            <option value="">Selecione o Semestre</option>
            {semesters.map(s => <option key={s.id} value={s.id}>{s.ano}.{s.periodo}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Tipo de Material</label>
          <select 
            value={form.tipo} 
            onChange={e => setForm({ ...form, tipo: e.target.value })}
            required
          >
            <option value="prova">Prova</option>
            <option value="trabalho">Trabalho</option>
            <option value="projeto">Projeto</option>
            <option value="resumo">Resumo</option>
          </select>
        </div>

        <div className="form-group">
          <label>Arquivo</label>
          <input 
            type="file" 
            onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
            required
            style={{ padding: '0.5rem 0' }}
          />
        </div>

        <button type="submit" className="primary" disabled={loading}>
          {loading ? 'Enviando...' : 'Postar Material'}
        </button>
      </form>
    </div>
  );
}
