import { useEffect, useState } from 'react';
import api from '../services/api';
import { Medal, Shield, Zap } from 'lucide-react';

export default function Leaderboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/leaderboard').then(res => {
      setUsers(res.data);
      setLoading(false);
    });
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Medal color="#ffd700" size={20} />;
      case 1: return <Medal color="#c0c0c0" size={20} />;
      case 2: return <Medal color="#cd7f32" size={20} />;
      default: return null;
    }
  };

  const getTierBadge = (tier: string) => {
    const isHigh = ['Gold', 'Platinum', 'Diamond'].some(t => tier.includes(t));
    return (
      <span className={`badge ${isHigh ? 'badge-accent' : 'badge-primary'}`}>
        <Shield size={12} style={{ marginRight: '4px' }} />
        {tier}
      </span>
    );
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Carregando...</div>;

  return (
    <div style={{ padding: '2rem 0' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <TrophyIcon /> Leaderboard
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Os estudantes mais ativos na comunidade UFF.</p>
      </header>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: '80px', textAlign: 'center' }}>Pos</th>
              <th>Estudante</th>
              <th>Tier</th>
              <th style={{ textAlign: 'right' }}>Experiência</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} style={{ background: i < 3 ? 'rgba(139, 92, 246, 0.05)' : 'transparent' }}>
                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    {getRankIcon(i)}
                    {i + 1}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: '600' }}>{u.nome}</div>
                </td>
                <td>{getTierBadge(u.tier)}</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--accent)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Zap size={14} />
                    {parseFloat(u.exp).toFixed(0)} XP
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TrophyIcon() {
  return (
    <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: '12px', display: 'flex' }}>
      <Medal color="white" />
    </div>
  );
}
