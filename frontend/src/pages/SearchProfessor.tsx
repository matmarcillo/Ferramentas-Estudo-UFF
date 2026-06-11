import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function SearchProfessor() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.get(`/professors/search?name=${query}`);
      setResults(res.data);
    } catch (err: any) {
      console.error(err.response?.data?.detail || err);
    }
  };

  return (
    <div>
      <h1>Pesquisar Professor</h1>
      <form onSubmit={handleSearch}>
        <input 
          type="text" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          placeholder="Nome do professor..." 
        />
        <button type="submit">Buscar</button>
      </form>
      <div>
        {results.map((p) => (
          <div key={p.id} className="card">
            <h3>{p.nome}</h3>
            <p>{p.departamento}</p>
            <Link to={`/professor/${p.nome}`}>Ver Avaliações</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
