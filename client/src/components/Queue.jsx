import { ChevronUp, ChevronDown, X, ListMusic } from 'lucide-react';

export default function Queue({ queue, currentId, onSelect, onRemove, onMoveUp, onMoveDown, onClear }) {
  if (!queue.length) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--muted)', marginTop: 40, fontSize: 14 }}>
        <ListMusic size={32} strokeWidth={1} style={{ margin: '0 auto 10px', display: 'block' }} />
        <p>ยังไม่มีเพลงในคิว</p>
        <p style={{ marginTop: 6, fontSize: 12 }}>กดปุ่ม + จากผลการค้นหาเพื่อเพิ่มเพลง</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px 10px' }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{queue.length} เพลง</span>
        <button
          onClick={onClear}
          style={{ fontSize: 12, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}
        >
          ล้างทั้งหมด
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {queue.map((v, i) => (
          <div
            key={v.id}
            style={{
              display: 'flex', gap: 8, padding: '8px 10px', borderRadius: 10,
              background: currentId === v.id ? 'var(--accent)' : 'var(--surface2)',
              border: `1px solid ${currentId === v.id ? 'var(--accent2)' : 'var(--border)'}`,
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 11, color: currentId === v.id ? 'rgba(255,255,255,0.6)' : 'var(--muted)', width: 16, textAlign: 'center', flexShrink: 0 }}>
              {i + 1}
            </span>

            <img
              src={v.thumbnail} alt=""
              onClick={() => onSelect(v)}
              style={{ width: 56, height: 36, borderRadius: 5, objectFit: 'cover', cursor: 'pointer', flexShrink: 0 }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />

            <div onClick={() => onSelect(v)} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
              <div style={{
                fontSize: 13, fontWeight: 500, overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                color: currentId === v.id ? '#fff' : 'var(--text)',
              }}>
                {v.title}
              </div>
              <div style={{ fontSize: 11, color: currentId === v.id ? 'rgba(255,255,255,0.6)' : 'var(--muted)', marginTop: 2 }}>
                {v.channel}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
              <button onClick={() => onMoveUp(v.id)} disabled={i === 0} style={arrowBtn(i === 0)}>
                <ChevronUp size={13} />
              </button>
              <button onClick={() => onMoveDown(v.id)} disabled={i === queue.length - 1} style={arrowBtn(i === queue.length - 1)}>
                <ChevronDown size={13} />
              </button>
            </div>

            <button onClick={() => onRemove(v.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 4,
              color: 'var(--muted)', flexShrink: 0, display: 'flex', alignItems: 'center',
            }}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const arrowBtn = (disabled) => ({
  background: 'none', border: 'none', cursor: disabled ? 'default' : 'pointer',
  padding: '1px 3px', color: disabled ? 'var(--border)' : 'var(--muted)',
  display: 'flex', alignItems: 'center',
});
