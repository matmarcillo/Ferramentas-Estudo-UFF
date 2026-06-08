import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useUser } from '../hooks/useUser';
import { Trash2 } from 'lucide-react';

export default function Documento() {
  const { name, docId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useUser();
  const [doc, setDoc] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cRes = await api.get(`/course/${name}`);
        const dRes = await api.get(`/${cRes.data.id}/documentos/${docId}`);
        setDoc(dRes.data.documento);
        setComments(dRes.data.comentarios);
        setScore(dRes.data.score);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [name, docId]);

  const handleVote = async (val: number) => {
    try {
      const cRes = await api.get(`/course/${name}`);
      await api.post(`/${cRes.data.id}/documentos/${docId}/voto`, {
        documento_id: parseInt(docId!),
        valor: val
      });
      // Refresh score
      const dRes = await api.get(`/${cRes.data.id}/documentos/${docId}`);
      setScore(dRes.data.score);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erro ao votar");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Tem certeza que deseja apagar este documento?")) return;
    try {
      await api.delete(`/documento/${docId}`);
      alert("Documento apagado com sucesso");
      navigate(`/disciplina/${name}/documentos`);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erro ao apagar documento");
    }
  };

  const canDelete = isAdmin || (doc && doc[6] === user?.id);

  if (!doc) return <div>Carregando...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>{doc[1]}</h1>
        {canDelete && (
          <button onClick={handleDelete} className="secondary" style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>
            <Trash2 size={18} /> Apagar Documento
          </button>
        )}
      </div>
      <p>Tipo: {doc[4]} | Tier: {doc[5]}</p>
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => handleVote(1)}>▲</button>
        <span>Score: {score}</span>
        <button onClick={() => handleVote(-1)}>▼</button>
      </div>
      
      <a href={`/api/${doc[6]}/download`} target="_blank" rel="noreferrer">
        <button>Download Arquivo</button>
      </a>

      <h2>Comentários</h2>
      {comments.map((c) => (
        <div key={c[0]} className="card">
          <p>{c[1]}</p>
          <small>Postado em {new Date(c[4]).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}
