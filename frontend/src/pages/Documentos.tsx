import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function Documentos() {
  const { name } = useParams();
  const [docs, setDocs] = useState<any[]>([]);
  const [courseId, setCourseId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cRes = await api.get(`/course/${name}`);
        setCourseId(cRes.data.id);
        const dRes = await api.get(`/${cRes.data.id}/documentos`);
        setDocs(dRes.data.documentos);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [name]);

  return (
    <div>
      <h1>Documentos de {name}</h1>
      <div>
        {docs.map((d) => (
          <div key={d[0]} className="card">
            <h3>{d[1]}</h3>
            <p>Tipo: {d[4]} | Tier: {d[5]}</p>
            <Link to={`/disciplina/${name}/documentos/${d[0]}`}>Ver Detalhes</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
