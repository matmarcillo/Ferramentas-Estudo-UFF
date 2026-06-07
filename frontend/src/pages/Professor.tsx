import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

export default function Professor() {
  const { name } = useParams();
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

  if (!professor) return <div>Carregando...</div>;

  return (
    <div>
      <h1>{professor.nome}</h1>
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
