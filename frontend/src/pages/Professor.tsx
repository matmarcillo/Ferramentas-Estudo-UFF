import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useUser } from '../hooks/useUser';
import { Trash2, Star } from 'lucide-react';
import { professorMetricsMapping } from '../utils/metricsMapping';

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
      pedagogia: acc.pedagogia + r.pedagogia,
      organizacao: acc.organizacao + r.organizacao,
      rigidez: acc.rigidez + r.rigidez,
    }), { pedagogia: 0, organizacao: 0, rigidez: 0 });
    
    const count = reviews.length;
    const avgPedagogia = sums.pedagogia / count;
    const avgOrganizacao = sums.organizacao / count;
    const avgRigidez = sums.rigidez / count;

    const globalMean = (avgPedagogia + avgOrganizacao + avgRigidez) / 3;
    
    return {
      pedagogia: avgPedagogia.toFixed(1),
      organizacao: avgOrganizacao.toFixed(1),
      rigidez: avgRigidez.toFixed(1),
      global: globalMean.toFixed(1)
    };
  };

  const averages = calculateAverages();

  if (!professor) return <div>Carregando...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1>{professor.nome}</h1>
          {averages && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.25rem' }}>
              <Star size={20} fill="var(--primary)" /> {averages.global} / 5.0
            </div>
          )}
        </div>
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
        <div className="card" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-around', textAlign: 'center', flexWrap: 'wrap', gap: '2rem', padding: '1.5rem' }}>
          {Object.entries(professorMetricsMapping).map(([key, metric]) => {
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
      
      <h2>Avaliações dos Alunos ({reviews.length})</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {reviews.length === 0 ? (
          <p>Nenhuma avaliação disponível ainda.</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="card">
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {Object.entries(professorMetricsMapping).map(([key, metric]) => (
                  <span key={key} className="badge badge-primary" title={(metric.options as any)[r[key]]}>
                    {metric.label}: {r[key]}
                  </span>
                ))}
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
