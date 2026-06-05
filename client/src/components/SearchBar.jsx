import { useState } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ onSearch, loading }) {
  const [q, setQ] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) onSearch(q.trim());
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: 8 }}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="ค้นหาเพลง Karaoke..."
        disabled={loading}
        style={{
          flex: 1, padding: '10px 16px', borderRadius: 10,
          background: 'var(--surface2)', border: '1px solid var(--border)',
          color: 'var(--text)', fontSize: 15, outline: 'none',
        }}
      />
      <button
        type="submit"
        disabled={loading || !q.trim()}
        style={{
          padding: '10px 20px', borderRadius: 10, border: 'none',
          background: loading ? 'var(--border)' : 'var(--accent)',
          color: '#fff', cursor: loading ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 6, fontSize: 15,
        }}
      >
        <Search size={16} />
        {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
      </button>
    </form>
  );
}
