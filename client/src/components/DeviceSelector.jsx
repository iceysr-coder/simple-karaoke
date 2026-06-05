import { Mic, Volume2, RefreshCw } from 'lucide-react';

const selectStyle = {
  flex: 1,
  padding: '7px 10px',
  borderRadius: 8,
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  fontSize: 13,
  outline: 'none',
  cursor: 'pointer',
  minWidth: 0,
};

export default function DeviceSelector({
  audioInputs, audioOutputs,
  inputDeviceId, outputDeviceId,
  onInputChange, onOutputChange, onRefresh,
}) {
  const label = (d) => d.label || `Device (${d.deviceId.slice(0, 8)})`;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 10,
      padding: '14px 16px', borderRadius: 10,
      background: 'var(--surface2)', border: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>อุปกรณ์เสียง</span>
        <button
          onClick={onRefresh}
          title="Refresh devices"
          style={{
            background: 'none', border: 'none', color: 'var(--muted)',
            cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center',
          }}
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {/* Microphone input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Mic size={14} color="var(--green)" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap', width: 50 }}>ไมค์</span>
        <select
          value={inputDeviceId}
          onChange={(e) => onInputChange(e.target.value)}
          style={selectStyle}
        >
          {audioInputs.length === 0 && (
            <option value="default">— กด Refresh เพื่อโหลด —</option>
          )}
          {audioInputs.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>{label(d)}</option>
          ))}
        </select>
      </div>

      {/* Speaker output */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Volume2 size={14} color="var(--accent2)" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap', width: 50 }}>ลำโพง</span>
        <select
          value={outputDeviceId}
          onChange={(e) => onOutputChange(e.target.value)}
          style={selectStyle}
        >
          {audioOutputs.length === 0 && (
            <option value="default">— กด Refresh เพื่อโหลด —</option>
          )}
          {audioOutputs.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>{label(d)}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
