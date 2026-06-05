import { Play, Plus } from 'lucide-react';

export default function VideoList({ videos, currentId, onSelect, onAddToQueue, queueIds }) {
  if (!videos.length) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {videos.map((v) => {
        const isPlaying = currentId === v.id;
        const inQueue = queueIds?.has(v.id);
        return (
          <div
            key={v.id}
            style={{
              display: 'flex', gap: 10, padding: '10px 10px', borderRadius: 10,
              background: isPlaying ? 'var(--accent)' : 'var(--surface2)',
              border: `1px solid ${isPlaying ? 'var(--accent2)' : 'var(--border)'}`,
              transition: 'all 0.15s', alignItems: 'center',
            }}
          >
            <div onClick={() => onSelect(v)} style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }}>
              <img
                src={v.thumbnail} alt=""
                style={{ width: 76, height: 48, borderRadius: 6, objectFit: 'cover', display: 'block' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              {isPlaying && (
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', background: 'rgba(0,0,0,0.5)', borderRadius: 6,
                }}>
                  <Play size={20} fill="#fff" color="#fff" />
                </div>
              )}
            </div>

            <div onClick={() => onSelect(v)} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
              <div style={{
                fontSize: 13, fontWeight: 500, overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                color: isPlaying ? '#fff' : 'var(--text)',
              }}>
                {v.title}
              </div>
              <div style={{ fontSize: 11, color: isPlaying ? 'rgba(255,255,255,0.7)' : 'var(--muted)', marginTop: 3 }}>
                {v.channel} {v.duration && `• ${v.duration}`}
              </div>
            </div>

            <button
              onClick={() => onAddToQueue(v)}
              title={inQueue ? 'อยู่ในคิวแล้ว' : 'เพิ่มในคิว'}
              style={{
                flexShrink: 0, width: 28, height: 28, borderRadius: 8, border: 'none',
                background: inQueue ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.08)',
                color: inQueue ? 'var(--accent2)' : 'var(--muted)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Plus size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
