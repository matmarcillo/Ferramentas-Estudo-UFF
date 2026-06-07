import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Leaderboard() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    api.get('/users/leaderboard').then(res => setUsers(res.data));
  }, []);

  return (
    <div>
      <h1>Leaderboard</h1>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Posição</th>
              <th>Nome</th>
              <th>Tier</th>
              <th>Exp</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u[0]}>
                <td>{i + 1}</td>
                <td>{u[1]}</td>
                <td>{u[2]}</td>
                <td>{parseFloat(u[3]).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
