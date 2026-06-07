import { useState } from 'react';
import api from '../services/api';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await api.post('/user', form);
        alert('Usuário criado!');
        setIsRegister(false);
      } else {
        const res = await api.post('/users/login', { email: form.email, password: form.password });
        localStorage.setItem('token', res.data.access_token);
        window.location.href = '/';
      }
    } catch (err) {
      alert('Erro na operação');
    }
  };

  return (
    <div>
      <h1>{isRegister ? 'Registrar' : 'Login'}</h1>
      <form onSubmit={handleSubmit}>
        {isRegister && <input placeholder="Nome" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />}
        <input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
        <button type="submit">{isRegister ? 'Registrar' : 'Login'}</button>
      </form>
      <button onClick={() => setIsRegister(!isRegister)} style={{ background: 'none', color: '#646cff', marginTop: '1rem' }}>
        {isRegister ? 'Já tem conta? Faça login' : 'Não tem conta? Registre-se'}
      </button>
    </div>
  );
}
