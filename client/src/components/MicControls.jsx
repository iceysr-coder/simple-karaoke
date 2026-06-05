import { Mic, MicOff, Headphones } from 'lucide-react';

function Toggle({ label, value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 12px', borderRadius: 20, fontSize: 12,
        border: `1px solid ${value ? 'var(--accent2)' : 'var(--border)'}`,
        background: value ? 'rgba(168,85,247,0.15)' : 'var(--bg)',
        color: value ? 'var(--accent2)' : 'var(--muted)',
        cursor: 'pointer', transition: 'all 0.15s',
      }}
    >
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: value ? 'var(--accent2)' : 'var(--border)',
        flexShrink: 0,
      }} />
      {label}
    </button>
  );
}

function SliderRow({ icon, label, value, onChange, color = 'var(--accent)', disabled }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: disabled ? 0.4 : 1 }}>
      <span style={{ color: 'var(--muted)', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 12, color: 'var(--muted)', width: 90, flexShrink: 0 }}>{label}</span>
      <input
        type="range" min={0} max={100} value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ flex: 1, accentColor: color, height: 4 }}
      />
      <span style={{ fontSize: 12, color: 'var(--text)', width: 30, textAlign: 'right' }}>{value}%</span>
    </div>
  );
}

export default function MicControls({
  micActive, micLevel,
  micVolume, onMicVolume,
  monitorVolume, onMonitorVolume,
  playback, onTogglePlayback,
  noiseSuppression, onToggleNoiseSuppression,
  onMicToggle,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Mic on/off + meter */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', borderRadius: 10,
        background: 'var(--surface2)',
        border: `1px solid ${micActive ? 'var(--green)' : 'var(--border)'}`,
      }}>
        <button
          onClick={onMicToggle}
          style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: micActive ? 'var(--green)' : 'var(--surface)',
            color: micActive ? '#fff' : 'var(--muted)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
            border: `1px solid ${micActive ? 'var(--green)' : 'var(--border)'}`,
            flexShrink: 0,
          }}
        >
          {micActive ? <Mic size={15} /> : <MicOff size={15} />}
          {micActive ? 'ไมค์เปิด' : 'เปิดไมค์'}
        </button>

        {/* Level meter */}
        <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 20, flex: 1 }}>
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} style={{
              flex: 1, borderRadius: 2,
              height: 4 + (i / 23) * 16,
              background: micActive && (i / 24) * 100 < micLevel
                ? i < 16 ? 'var(--green)' : i < 20 ? '#facc15' : 'var(--red)'
                : 'var(--border)',
              transition: 'background 0.05s',
            }} />
          ))}
        </div>
        {micActive && <span style={{ fontSize: 11, color: 'var(--green)', flexShrink: 0 }}>● LIVE</span>}
      </div>

      {/* Sliders */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 10,
        padding: '12px 16px', borderRadius: 10,
        background: 'var(--surface2)', border: '1px solid var(--border)',
      }}>
        <SliderRow
          icon={<Mic size={13} />}
          label="ระดับไมค์"
          value={micVolume}
          onChange={onMicVolume}
          color="var(--green)"
        />
        <SliderRow
          icon={<Headphones size={13} />}
          label="Playback"
          value={monitorVolume}
          onChange={onMonitorVolume}
          color="var(--accent2)"
          disabled={!playback}
        />
      </div>

      {/* Toggles + noise gate threshold */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 10,
        padding: '12px 16px', borderRadius: 10,
        background: 'var(--surface2)', border: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Toggle label="ได้ยินเสียงตัวเอง" value={playback} onChange={onTogglePlayback} />
          <Toggle label="ตัดเสียงรบกวน" value={noiseSuppression} onChange={onToggleNoiseSuppression} />
        </div>
      </div>
    </div>
  );
}
