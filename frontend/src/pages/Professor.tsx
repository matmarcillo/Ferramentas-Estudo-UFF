import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useUser } from '../hooks/useUser';
import { Trash2 } from 'lucide-react';

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
      } catch (err) {
        console.error(err);
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

  if (!professor) return <div>Carregando...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>{professor.nome}</h1>
        {isAdmin && (
          <button onClick={handleDelete} className="secondary" style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>
            <Trash2 size={18} /> Apagar Professor
          </button>
        )}
      </div>
      <p>Email: {professor.email} | Departamento: {professor.departamento}</p>
      
      <h2>Avaliações</h2>
      {reviews.map((r) => (
        <div key={r.id} className="card">
          <p>Métrica 1: {r.metrica_1}/5</p>
          <p>Métrica 2: {r.metrica_2}/5</p>
          <p>Métrica 3: {r.metrica_3}/5</p>
        </div>
      ))}
    </div>
  );
}
