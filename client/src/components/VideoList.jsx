import { Play } from 'lucide-react';

export default function VideoList({ videos, currentId, onSelect }) {
  if (!videos.length) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {videos.map((v) => (
        <div
          key={v.id}
          onClick={() => onSelect(v)}
          style={{
            display: 'flex', gap: 12, padding: '10px 12px', borderRadius: 10,
            background: currentId === v.id ? 'var(--accent)' : 'var(--surface2)',
            border: `1px solid ${currentId === v.id ? 'var(--accent2)' : 'var(--border)'}`,
            cursor: 'pointer', transition: 'all 0.15s', alignItems: 'center',
          }}
        >
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={v.thumbnail}
              alt=""
              style={{ width: 80, height: 50, borderRadius: 6, objectFit: 'cover' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            {currentId === v.id && (
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: 'rgba(0,0,0,0.5)', borderRadius: 6,
              }}>
                <Play size={20} fill="#fff" color="#fff" />
              </div>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 14, fontWeight: 500, overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              color: currentId === v.id ? '#fff' : 'var(--text)',
            }}>
              {v.title}
            </div>
            <div style={{ fontSize: 12, color: currentId === v.id ? 'rgba(255,255,255,0.7)' : 'var(--muted)', marginTop: 3 }}>
              {v.channel} {v.duration && `• ${v.duration}`}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
