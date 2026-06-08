import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useUser } from '../hooks/useUser';
import { Trash2 } from 'lucide-react';

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
      } catch (err) {
        console.error(err);
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
      m1: acc.m1 + r.metrica_1,
      m2: acc.m2 + r.metrica_2,
      m3: acc.m3 + r.metrica_3,
    }), { m1: 0, m2: 0, m3: 0 });
    
    return {
      m1: (sums.m1 / reviews.length).toFixed(1),
      m2: (sums.m2 / reviews.length).toFixed(1),
      m3: (sums.m3 / reviews.length).toFixed(1),
    };
  };

  const averages = calculateAverages();

  if (!course) return <div>Carregando...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>{course.nome}</h1>
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
        <div className="card" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{averages.m1}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Métrica 1</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{averages.m2}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Métrica 2</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{averages.m3}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Métrica 3</div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '3rem' }}>
        <Link to={`/disciplina/${name}/documentos`} className="primary" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius)', background: 'var(--primary)', color: 'white', display: 'inline-flex', alignItems: 'center' }}>
          Ver Documentos da Disciplina
        </Link>
      </div>

      <h2>Avaliações dos Alunos ({reviews.length})</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {reviews.length === 0 ? (
          <p>Nenhuma avaliação disponível ainda.</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <span className="badge badge-primary">M1: {r.metrica_1}</span>
                  <span className="badge badge-primary">M2: {r.metrica_2}</span>
                  <span className="badge badge-primary">M3: {r.metrica_3}</span>
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
