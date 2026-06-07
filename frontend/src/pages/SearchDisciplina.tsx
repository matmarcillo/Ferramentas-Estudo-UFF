import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function SearchDisciplina() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.get(`/courses/search?name=${query}`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Pesquisar Disciplina</h1>
      <form onSubmit={handleSearch}>
        <input 
          type="text" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          placeholder="Nome da disciplina..." 
        />
        <button type="submit">Buscar</button>
      </form>
      <div>
        {results.map((c) => (
          <div key={c.id} className="card">
            <h3>{c.nome} ({c.codigo})</h3>
            <p>{c.faculdade}</p>
            <Link to={`/disciplina/${c.nome}`}>Ver Detalhes</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
