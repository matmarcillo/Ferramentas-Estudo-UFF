import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useUser } from '../hooks/useUser';
import { Trash2, Star } from 'lucide-react';

export default function Professor() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useUser();
  const [professor, setProfessor] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pRes = await api.get(`/professor/${name}`);
        setProfessor(pRes.data);
        const rRes = await api.get(`/professor/${name}/avaliacoes`);
        setReviews(rRes.data.reviews);
      } catch (err: any) {
        console.error(err.response?.data?.detail || err);
      }
    };
    fetchData();
  }, [name]);

  const handleDelete = async () => {
    if (!window.confirm("Apagar este professor?")) return;
    try {
      await api.delete(`/professor/${professor.id}`);
      alert("Professor apagado");
      navigate('/search-professor');
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

  if (!professor) return <div>Carregando...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>{professor.nome}</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => navigate('/rate-professor', { state: { professorId: professor.id } })}
            className="secondary" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Star size={18} /> Avaliar este Professor
          </button>
          {isAdmin && (
            <button onClick={handleDelete} className="secondary" style={{ color: '#ef4444', borderColor: '#ef4444' }}>
              <Trash2 size={18} /> Apagar Professor
            </button>
          )}
        </div>
      </div>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Email: <span style={{ color: 'var(--text-main)' }}>{professor.email}</span> | 
        Departamento: <span style={{ color: 'var(--text-main)' }}>{professor.departamento}</span>
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
      
      <h2>Avaliações dos Alunos ({reviews.length})</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {reviews.length === 0 ? (
          <p>Nenhuma avaliação disponível ainda.</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="card">
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <span className="badge badge-primary">M1: {r.metrica_1}</span>
                <span className="badge badge-primary">M2: {r.metrica_2}</span>
                <span className="badge badge-primary">M3: {r.metrica_3}</span>
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
