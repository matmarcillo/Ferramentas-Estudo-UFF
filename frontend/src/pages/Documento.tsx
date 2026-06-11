import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useUser } from '../hooks/useUser';
import { Trash2, Download, MessageSquare, ThumbsUp, ThumbsDown, ExternalLink } from 'lucide-react';

export default function Documento() {
  const { name, docId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useUser();
  const [doc, setDoc] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [courseId, setCourseId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const cRes = await api.get(`/course/${name}`);
      setCourseId(cRes.data.id);
      const dRes = await api.get(`/${cRes.data.id}/documentos/${docId}`);
      setDoc(dRes.data.documento);
      setComments(dRes.data.comentarios);
      setScore(dRes.data.score);
    } catch (err: any) {
      console.error(err.response?.data?.detail || err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [name, docId]);

  const handleVote = async (val: number) => {
    if (!courseId) return;
    try {
      await api.post(`/${courseId}/documentos/${docId}/voto`, {
        documento_id: parseInt(docId!),
        valor: val
      });
      fetchData();
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

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !courseId) return;
    try {
      await api.post(`/${courseId}/documentos/${docId}/comentario`, {
        documento_id: parseInt(docId!),
        texto: newComment
      });
      setNewComment('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erro ao postar comentário");
    }
  };

  const handleDeleteComment = async (comentarioId: number) => {
    if (!window.confirm("Apagar este comentário?")) return;
    try {
      await api.delete(`/comentario/${comentarioId}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erro ao apagar comentário");
    }
  };

  const canDeleteDoc = isAdmin || (doc && doc.publicador_id === user?.id);

  if (!doc) return <div style={{ textAlign: 'center', padding: '3rem' }}>Carregando documento...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>{doc.titulo}</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <a href={`/api/${courseId}/documentos/${docId}/view?token=${localStorage.getItem('token')}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            <button className="secondary">
              <ExternalLink size={18} /> Abrir
            </button>
          </a>
          <a href={`/api/${courseId}/documentos/${docId}/download?token=${localStorage.getItem('token')}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            <button className="primary">
              <Download size={18} /> Download
            </button>
          </a>
          {canDeleteDoc && (
            <button onClick={handleDelete} className="secondary" style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>
              <Trash2 size={18} /> Apagar
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <span className="badge badge-primary">Tipo: {doc.tipo}</span>
        <span className="badge badge-accent">Tier: {doc.tier}</span>
      </div>

      <div className="card" style={{ display: 'inline-flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem', padding: '1rem 2rem' }}>
        <button onClick={() => handleVote(1)} className="secondary" style={{ border: 'none', padding: '0.5rem', color: 'var(--text-main)' }}>
          <ThumbsUp size={24} />
        </button>
        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{score}</span>
        <button onClick={() => handleVote(-1)} className="secondary" style={{ border: 'none', padding: '0.5rem', color: 'var(--text-main)' }}>
          <ThumbsDown size={24} />
        </button>
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <MessageSquare size={24} color="var(--primary)" /> 
          Comentários ({comments.length})
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {comments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Seja o primeiro a comentar!</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <small style={{ color: 'var(--text-muted)' }}>Postado em {new Date(c.data).toLocaleString()}</small>
                  {(isAdmin || c.usuario_id === user?.id) && (
                    <button onClick={() => handleDeleteComment(c.id)} className="secondary" style={{ padding: '0.25rem', border: 'none', color: 'var(--error)' }}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <p style={{ margin: 0 }}>{c.texto}</p>
              </div>
            ))
          )}
        </div>

        {user && (
          <form onSubmit={handlePostComment} className="card" style={{ padding: '1.5rem' }}>
            <div className="form-group">
              <label>Adicionar um comentário</label>
              <textarea 
                value={newComment} 
                onChange={e => setNewComment(e.target.value)} 
                placeholder="O que você achou deste material?"
                required
                rows={3}
              />
            </div>
            <button type="submit" className="primary" style={{ marginTop: '1rem' }}>Comentar</button>
          </form>
        )}
      </div>
    </div>
  );
}
