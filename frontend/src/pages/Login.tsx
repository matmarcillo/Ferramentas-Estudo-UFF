import { useState } from 'react';
import api from '../services/api';
import { Mail, Lock, User, UserPlus, LogIn } from 'lucide-react';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await api.post('/user', form);
        alert('Usuário criado com sucesso! Agora você pode fazer login.');
        setIsRegister(false);
      } else {
        const res = await api.post('/users/login', { email: form.email, password: form.password });
        localStorage.setItem('token', res.data.access_token);
        window.location.href = '/';
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro na operação. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '450px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            background: 'var(--primary)', 
            width: '60px', 
            height: '60px', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 8px 16px -4px rgba(139, 92, 246, 0.4)'
          }}>
            {isRegister ? <UserPlus color="white" size={30} /> : <LogIn color="white" size={30} />}
          </div>
          <h1>{isRegister ? 'Criar Conta' : 'Bem-vindo de volta'}</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {isRegister ? 'Junte-se à comunidade Game Analytics' : 'Acesse sua conta para continuar'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label>Nome Completo</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  style={{ paddingLeft: '40px' }}
                  placeholder="Seu nome" 
                  value={form.nome} 
                  onChange={e => setForm({...form, nome: e.target.value})} 
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>E-mail</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                style={{ paddingLeft: '40px' }}
                type="email"
                placeholder="seu@email.com" 
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})} 
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                style={{ paddingLeft: '40px' }}
                type="password" 
                placeholder="••••••••" 
                value={form.password} 
                onChange={e => setForm({...form, password: e.target.value})} 
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? 'Processando...' : (isRegister ? 'Registrar' : 'Entrar')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button 
            onClick={() => setIsRegister(!isRegister)} 
            className="secondary"
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.875rem' }}
          >
            {isRegister ? 'Já tem uma conta? Faça login' : 'Ainda não tem conta? Cadastre-se'}
          </button>
        </div>
      </div>
    </div>
  );
}
