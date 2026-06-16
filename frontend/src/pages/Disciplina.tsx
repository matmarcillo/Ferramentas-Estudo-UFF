import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useUser } from '../hooks/useUser';
import { Trash2, Star, FileText } from 'lucide-react';
import { courseMetricsMapping } from '../utils/metricsMapping';

export default function Disciplina() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useUser();
  const [course, setCourse] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cRes = await api.get(`/course/${name}`);
        setCourse(cRes.data);
        const rRes = await api.get(`/course/${name}/avaliacoes`);
        setReviews(rRes.data.reviews);
      } catch (err: any) {
        console.error(err.response?.data?.detail || err);
      }
    };
    fetchData();
  }, [name]);

  const handleDelete = async () => {
    if (!window.confirm("Apagar esta disciplina?")) return;
    try {
      await api.delete(`/course/${course.id}`);
      alert("Disciplina apagada");
      navigate('/search-disciplina');
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erro ao apagar");
    }
  };

  const calculateAverages = () => {
    if (reviews.length === 0) return null;
    const sums = reviews.reduce((acc, r) => ({
      dificuldade: acc.dificuldade + r.dificuldade,
      utilidade: acc.utilidade + r.utilidade,
      interesse: acc.interesse + r.interesse,
      carga_trabalho: acc.carga_trabalho + r.carga_trabalho,
    }), { dificuldade: 0, utilidade: 0, interesse: 0, carga_trabalho: 0 });
    
    const count = reviews.length;
    const avgDificuldade = sums.dificuldade / count;
    const avgUtilidade = sums.utilidade / count;
    const avgInteresse = sums.interesse / count;
    const avgCarga = sums.carga_trabalho / count;

    const globalMean = (avgDificuldade + avgUtilidade + avgInteresse + avgCarga) / 4;
    
    return {
      dificuldade: avgDificuldade.toFixed(1),
      utilidade: avgUtilidade.toFixed(1),
      interesse: avgInteresse.toFixed(1),
      carga_trabalho: avgCarga.toFixed(1),
      global: globalMean.toFixed(1)
    };
  };

  const averages = calculateAverages();

  if (!course) return <div>Carregando...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1>{course.nome}</h1>
          {averages && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.25rem' }}>
              <Star size={20} fill="var(--primary)" /> {averages.global} / 5.0
            </div>
          )}
        </div>
        {isAdmin && (
          <button onClick={handleDelete} className="secondary" style={{ color: '#ef4444', borderColor: '#ef4444' }}>
            <Trash2 size={18} /> Apagar Disciplina
          </button>
        )}
      </div>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Código: <span style={{ color: 'var(--text-main)' }}>{course.codigo}</span> | 
        Faculdade: <span style={{ color: 'var(--text-main)' }}>{course.faculdade}</span>
      </p>
      
      {averages && (
        <div className="card" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-around', textAlign: 'center', flexWrap: 'wrap', gap: '2rem', padding: '1.5rem' }}>
          {Object.entries(courseMetricsMapping).map(([key, metric]) => {
            const val = parseFloat((averages as any)[key]);
            const mappingKey = Math.floor(val) as keyof typeof metric.options;
            return (
              <div key={key}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{(averages as any)[key]}</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.25rem' }}>{metric.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  {metric.options[mappingKey] || metric.options[1 as keyof typeof metric.options]}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginBottom: '3rem', display: 'flex', gap: '1rem' }}>
        <Link to={`/disciplina/${name}/documentos`} className="primary" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius)', background: 'var(--primary)', color: 'white', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} /> Ver Documentos
        </Link>
        <button 
          onClick={() => navigate('/rate-disciplina', { state: { disciplinaId: course.id } })}
          className="secondary" 
          style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Star size={18} /> Avaliar esta Disciplina
        </button>
      </div>

      <h2>Avaliações dos Alunos ({reviews.length})</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {reviews.length === 0 ? (
          <p>Nenhuma avaliação disponível ainda.</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {Object.entries(courseMetricsMapping).map(([key, metric]) => (
                    <span key={key} className="badge badge-primary" title={(metric.options as any)[r[key]]}>
                      {metric.label}: {r[key]}
                    </span>
                  ))}
                </div>
                <span className={`badge ${r.status_aprovacao === 'Aprovado' ? 'badge-accent' : 'badge-secondary'}`} 
                      style={{ background: r.status_aprovacao === 'Aprovado' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', 
                               color: r.status_aprovacao === 'Aprovado' ? '#4ade80' : '#f87171' }}>
                  {r.status_aprovacao}
                </span>
              </div>
              {r.comentario && (
                <p style={{ fontStyle: 'italic', color: 'var(--text-main)', marginTop: '0.5rem' }}>
                  "{r.comentario}"
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
