import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Profile() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    api.get('/users/me').then(res => setUser(res.data)).catch(() => {
      localStorage.removeItem('token');
      window.location.href = '/login';
    });
  }, []);

  if (!user) return <div>Carregando...</div>;

  return (
    <div>
      <h1>Meu Perfil</h1>
      <div className="card">
        <p>Nome: {user.nome}</p>
        <p>Email: {user.email}</p>
        <p>Tier: {user.tier}</p>
        <p>Exp: {user.exp}</p>
      </div>

      <h2>Meus Documentos</h2>
      {user.documentos.map((d: any) => (
        <div key={d.id} className="card">
          <p>{d.nome} ({d.tipo})</p>
        </div>
      ))}
    </div>
  );
}
