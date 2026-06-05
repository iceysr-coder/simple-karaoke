import { useEffect, useState } from 'react';
import { Play, Pause, Volume2, Music, Mic, MicOff, Headphones, Settings, RefreshCw } from 'lucide-react';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer.js';

const fmt = (s) => {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
};

function LevelMeter({ level, active }) {
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 18 }}>
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} style={{
          width: 3, borderRadius: 1,
          height: 3 + (i / 15) * 12,
          background: active && (i / 16) * 100 < level
            ? i < 10 ? 'var(--green)' : i < 13 ? '#facc15' : 'var(--red)'
            : 'rgba(255,255,255,0.15)',
          transition: 'background 0.05s',
        }} />
      ))}
    </div>
  );
}

function Popover({ children, trigger, align = 'center' }) {
  const [open, setOpen] = useState(false);
  const posStyle = align === 'left'
    ? { left: 0 }
    : align === 'right'
    ? { right: 0 }
    : { left: '50%', transform: 'translateX(-50%)' };
  return (
    <div style={{ position: 'relative' }}>
      <div onClick={() => setOpen(o => !o)}>{trigger}</div>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', bottom: '100%', ...posStyle,
            marginBottom: 10, zIndex: 100,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, padding: 16, minWidth: 260, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}>
            {children}
          </div>
        </>
      )}
    </div>
  );
}

function SliderRow({ icon, label, value, onChange, color = 'var(--accent)', disabled }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: disabled ? 0.4 : 1 }}>
      <span style={{ color: 'var(--muted)', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 12, color: 'var(--muted)', width: 80, flexShrink: 0 }}>{label}</span>
      <input
        type="range" min={0} max={100} value={value} disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ flex: 1, accentColor: color, height: 4 }}
      />
      <span style={{ fontSize: 12, color: 'var(--text)', width: 30, textAlign: 'right' }}>{value}%</span>
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 12px', borderRadius: 20, fontSize: 12, width: '100%',
        border: `1px solid ${value ? 'var(--accent2)' : 'var(--border)'}`,
        background: value ? 'rgba(168,85,247,0.15)' : 'var(--bg)',
        color: value ? 'var(--accent2)' : 'var(--muted)',
        cursor: 'pointer',
      }}
    >
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: value ? 'var(--accent2)' : 'var(--border)', flexShrink: 0,
      }} />
      {label}
    </button>
  );
}

function BarButton({ onClick, active, activeColor = 'var(--accent)', title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 4, padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
        background: active ? activeColor : 'rgba(255,255,255,0.08)',
        color: active ? '#fff' : 'rgba(255,255,255,0.75)',
        transition: 'all 0.15s', minWidth: 48,
      }}
    >
      {children}
    </button>
  );
}

const selectStyle = {
  width: '100%', padding: '6px 10px', borderRadius: 8,
  background: 'var(--bg)', border: '1px solid var(--border)',
  color: 'var(--text)', fontSize: 12, outline: 'none', cursor: 'pointer',
};

export default function Player({
  video,
  micVolume, monitorVolume, micActive, micLevel,
  playback, noiseSuppression,
  onMicVolume, onMonitorVolume, onMicToggle,
  onTogglePlayback, onToggleNoiseSuppression,
  audioInputs, audioOutputs, inputDeviceId, outputDeviceId,
  onInputChange, onOutputChange, onRefreshDevices,
}) {
  const ytContainerId = 'yt-player-container';
  const { loadVideo, destroyPlayer, togglePlay, seek, setVol, playerState, volume, currentTime, duration } = useYouTubePlayer(ytContainerId);

  useEffect(() => {
    if (video) loadVideo(video.id);
    else destroyPlayer();
  }, [video?.id]);

  const isPlaying = playerState === 'playing';
  const isBuffering = playerState === 'buffering';
  const labelDevice = (d) => d.label || `Device (${d.deviceId.slice(0, 6)})`;

  if (!video) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: 'var(--muted)' }}>
        <Music size={56} strokeWidth={1} />
        <p style={{ fontSize: 15 }}>เลือกเพลงเพื่อเริ่มร้องคาราโอเกะ</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0a0a' }}>
      {/* Video — fills all available space */}
      <div style={{ flex: 1, position: 'relative', background: '#000', minHeight: 0 }}>
        <div id={ytContainerId} style={{ width: '100%', height: '100%' }} />
        {isBuffering && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
            <span style={{ color: '#fff', fontSize: 13 }}>กำลังโหลด...</span>
          </div>
        )}

        {/* Title overlay (top) */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          padding: '12px 16px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{video.title}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{video.channel}</div>
        </div>

        {/* Progress overlay (bottom of video) */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '0 12px 6px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
        }}>
          <input
            type="range" min={0} max={duration || 100} value={currentTime} step={1}
            onChange={(e) => seek(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent)', height: 3, cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
            <span>{fmt(currentTime)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>
      </div>

      {/* Bottom control bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', gap: 8,
        background: 'rgba(20,20,20,0.95)', backdropFilter: 'blur(8px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}>
        {/* Left: Play + song volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarButton onClick={togglePlay} active={isPlaying} activeColor="var(--accent)">
            {isPlaying ? <Pause size={18} fill="#fff" /> : <Play size={18} fill="#fff" style={{ marginLeft: 1 }} />}
          </BarButton>

          <Popover align="left" trigger={
            <BarButton>
              <Volume2 size={16} />
              <span style={{ fontSize: 10 }}>{volume}%</span>
            </BarButton>
          }>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>ระดับเสียงเพลง</span>
              <SliderRow icon={<Volume2 size={13} />} label="เสียงเพลง" value={volume} onChange={setVol} color="var(--accent)" />
            </div>
          </Popover>
        </div>

        {/* Center: Mic */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LevelMeter level={micLevel} active={micActive} />

          <BarButton onClick={onMicToggle} active={micActive} activeColor="var(--green)">
            {micActive ? <Mic size={18} /> : <MicOff size={18} />}
            <span style={{ fontSize: 10 }}>{micActive ? 'ไมค์เปิด' : 'ไมค์ปิด'}</span>
          </BarButton>

          <Popover trigger={
            <BarButton active={playback || noiseSuppression} activeColor="rgba(168,85,247,0.4)">
              <Headphones size={16} />
              <span style={{ fontSize: 10 }}>ตั้งค่าไมค์</span>
            </BarButton>
          }>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>ตั้งค่าไมโครโฟน</span>
              <SliderRow icon={<Mic size={13} />} label="ระดับไมค์" value={micVolume} onChange={onMicVolume} color="var(--green)" />
              <SliderRow icon={<Headphones size={13} />} label="Playback" value={monitorVolume} onChange={onMonitorVolume} color="var(--accent2)" disabled={!playback} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Toggle label="ได้ยินเสียงตัวเอง" value={playback} onChange={onTogglePlayback} />
                <Toggle label="ตัดเสียงรบกวน" value={noiseSuppression} onChange={onToggleNoiseSuppression} />
              </div>
            </div>
          </Popover>
        </div>

        {/* Right: Devices */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Popover align="right" trigger={
            <BarButton>
              <Settings size={16} />
              <span style={{ fontSize: 10 }}>อุปกรณ์</span>
            </BarButton>
          }>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>อุปกรณ์เสียง</span>
                <button onClick={onRefreshDevices} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4 }}>
                  <RefreshCw size={13} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Mic size={13} color="var(--green)" style={{ flexShrink: 0 }} />
                  <select value={inputDeviceId} onChange={(e) => onInputChange(e.target.value)} style={selectStyle}>
                    {audioInputs.length === 0 && <option value="default">— กด Refresh —</option>}
                    {audioInputs.map((d) => <option key={d.deviceId} value={d.deviceId}>{labelDevice(d)}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Volume2 size={13} color="var(--accent2)" style={{ flexShrink: 0 }} />
                  <select value={outputDeviceId} onChange={(e) => onOutputChange(e.target.value)} style={selectStyle}>
                    {audioOutputs.length === 0 && <option value="default">— กด Refresh —</option>}
                    {audioOutputs.map((d) => <option key={d.deviceId} value={d.deviceId}>{labelDevice(d)}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </Popover>
        </div>
      </div>
    </div>
  );
}
