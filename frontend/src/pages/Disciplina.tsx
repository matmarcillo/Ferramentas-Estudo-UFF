import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function Disciplina() {
  const { name } = useParams();
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

  if (!course) return <div>Carregando...</div>;

  return (
    <div>
      <h1>{course.nome}</h1>
      <p>Código: {course.codigo} | Faculdade: {course.faculdade}</p>
      
      <Link to={`/disciplina/${name}/documentos`} style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
        Ver Documentos
      </Link>

      <h2>Avaliações</h2>
      {reviews.map((r) => (
        <div key={r.id} className="card">
          <p>Métrica 1: {r.metrica_1}/5</p>
          <p>Métrica 2: {r.metrica_2}/5</p>
          <p>Métrica 3: {r.metrica_3}/5</p>
          {r.comentario && <p>"{r.comentario}"</p>}
        </div>
      ))}
    </div>
  );
}
