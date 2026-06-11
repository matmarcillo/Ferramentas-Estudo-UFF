import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FileText, Plus, ExternalLink } from 'lucide-react';
import api from '../services/api';

export default function Documentos() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [docs, setDocs] = useState<any[]>([]);
  const [courseId, setCourseId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cRes = await api.get(`/course/${name}`);
        setCourseId(cRes.data.id);
        const dRes = await api.get(`/${cRes.data.id}/documentos`);
        setDocs(dRes.data.documentos);
      } catch (err: any) {
        console.error(err.response?.data?.detail || err);
      }
    };
    fetchData();
  }, [name]);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Documentos: {name}</h1>
        {courseId && (
          <button onClick={() => navigate(`/post-document?courseId=${courseId}`)} className="primary">
            <Plus size={18} /> Novo Documento
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {docs.length === 0 ? (
          <p>Nenhum documento disponível para esta disciplina.</p>
        ) : (
          docs.map((d) => (
            <div key={d.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <FileText size={24} color="var(--primary)" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{d.nome}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <span className="badge badge-primary">Tipo: {d.tipo}</span>
                    <span className="badge badge-accent">Tier: {d.tier}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a href={`/api/${courseId}/documentos/${d.id}/view`} target="_blank" rel="noreferrer" className="secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textDecoration: 'none', color: 'var(--text-main)' }}>
                  <ExternalLink size={16} /> Abrir
                </a>
                <Link to={`/disciplina/${name}/documentos/${d.id}`} className="primary" style={{ display: 'inline-flex', alignItems: 'center', padding: '0.5rem 1rem', borderRadius: 'var(--radius)', border: 'none', textDecoration: 'none', color: 'white', background: 'var(--primary)' }}>
                  Detalhes
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
