import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import SearchBar from './components/SearchBar.jsx';
import VideoList from './components/VideoList.jsx';
import Queue from './components/Queue.jsx';
import Player from './components/Player.jsx';
import { useAudioMixer } from './hooks/useAudioMixer.js';
import { useDevices } from './hooks/useDevices.js';
import { useQueue } from './hooks/useQueue.js';
import { useWindowWidth } from './hooks/useWindowWidth.js';
import { Mic, Search, ListMusic, X } from 'lucide-react';

function SidebarContent({ tab, setTab, queue, videos, searching, error, currentVideo, queueIds,
  onSearch, onSelect, onAddToQueue, onRemove, onMoveUp, onMoveDown, onClear }) {
  return (
    <>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {[
          { id: 'search', icon: <Search size={14} />, label: 'ค้นหา' },
          { id: 'queue', icon: <ListMusic size={14} />, label: `คิวเพลง${queue.length ? ` (${queue.length})` : ''}` },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '11px 8px', border: 'none', cursor: 'pointer',
            background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
            color: tab === t.id ? 'var(--accent2)' : 'var(--muted)',
            borderBottom: `2px solid ${tab === t.id ? 'var(--accent2)' : 'transparent'}`,
            transition: 'all 0.15s',
          }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {tab === 'search' && (
        <>
          <div style={{ padding: 14, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <SearchBar onSearch={onSearch} loading={searching} />
            {error && <p style={{ marginTop: 8, color: 'var(--red)', fontSize: 12 }}>{error}</p>}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            <VideoList
              videos={videos} currentId={currentVideo?.id}
              onSelect={onSelect} onAddToQueue={onAddToQueue} queueIds={queueIds}
            />
            {!videos.length && !searching && (
              <div style={{ textAlign: 'center', color: 'var(--muted)', marginTop: 40, fontSize: 14 }}>
                <p>ค้นหาเพลงที่ต้องการร้อง</p>
                <p style={{ marginTop: 6, fontSize: 12 }}>เช่น "เพลงสตริง", "ลูกทุ่ง"</p>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'queue' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          <Queue
            queue={queue} currentId={currentVideo?.id}
            onSelect={onSelect} onRemove={onRemove}
            onMoveUp={onMoveUp} onMoveDown={onMoveDown} onClear={onClear}
          />
        </div>
      )}
    </>
  );
}

export default function App() {
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('search');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const width = useWindowWidth();
  const isMobile = width < 768;

  const {
    micVolume, monitorVolume, micActive, micLevel,
    playback, noiseSuppression,
    connectMic, disconnectMic,
    updateMicVolume, updateMonitorVolume,
    togglePlayback, toggleNoiseSuppression,
    switchOutputDevice,
  } = useAudioMixer();
  const { audioInputs, audioOutputs, inputDeviceId, outputDeviceId, setInputDeviceId, setOutputDeviceId, refresh } = useDevices();
  const { queue, addToQueue, removeFromQueue, moveUp, moveDown, clearQueue } = useQueue();
  const queueRef = useRef(queue);
  useEffect(() => { queueRef.current = queue; }, [queue]);

  const queueIds = useMemo(() => new Set(queue.map((v) => v.id)), [queue]);

  const handleSearch = useCallback(async (q) => {
    setSearching(true); setError('');
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q + ' คาราโอเกะ')}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setVideos(data.videos || []);
      if (!data.videos?.length) setError('ไม่พบเพลงที่ค้นหา');
    } catch (err) {
      setError('ค้นหาไม่สำเร็จ: ' + err.message);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleMicToggle = useCallback(() => {
    if (micActive) disconnectMic();
    else connectMic(inputDeviceId, outputDeviceId);
  }, [micActive, connectMic, disconnectMic, inputDeviceId, outputDeviceId]);

  const handleInputChange = useCallback((deviceId) => {
    setInputDeviceId(deviceId);
    if (micActive) connectMic(deviceId, outputDeviceId);
  }, [micActive, connectMic, outputDeviceId, setInputDeviceId]);

  const handleOutputChange = useCallback((deviceId) => {
    setOutputDeviceId(deviceId);
    switchOutputDevice(deviceId);
  }, [switchOutputDevice, setOutputDeviceId]);

  const handleEnded = useCallback(() => {
    const q = queueRef.current;
    if (!q.length) return;
    const next = q[0];
    removeFromQueue(next.id);
    setCurrentVideo(next);
  }, [removeFromQueue]);

  const handleAddToQueue = useCallback((video) => {
    addToQueue(video);
    setTab('queue');
    if (isMobile) setDrawerOpen(true);
  }, [addToQueue, isMobile]);

  const handleMobileTab = useCallback((id) => {
    if (drawerOpen && tab === id) { setDrawerOpen(false); return; }
    setTab(id);
    setDrawerOpen(true);
  }, [drawerOpen, tab]);

  const playerProps = {
    video: currentVideo,
    micVolume, monitorVolume, micActive, micLevel, playback, noiseSuppression,
    onMicVolume: updateMicVolume, onMonitorVolume: updateMonitorVolume,
    onMicToggle: handleMicToggle, onTogglePlayback: togglePlayback,
    onToggleNoiseSuppression: toggleNoiseSuppression, onEnded: handleEnded,
    audioInputs, audioOutputs, inputDeviceId, outputDeviceId,
    onInputChange: handleInputChange, onOutputChange: handleOutputChange,
    onRefreshDevices: () => refresh(true),
  };

  const sidebarProps = {
    tab, setTab, queue, videos, searching, error, currentVideo, queueIds,
    onSearch: handleSearch,
    onSelect: (v) => { setCurrentVideo(v); if (isMobile) setDrawerOpen(false); },
    onAddToQueue: handleAddToQueue,
    onRemove: removeFromQueue, onMoveUp: moveUp, onMoveDown: moveDown, onClear: clearQueue,
  };

  /* ── Desktop layout ── */
  if (!isMobile) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          padding: '12px 24px', borderBottom: '1px solid var(--border)',
          background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        }}>
          <Mic size={22} color="var(--accent2)" />
          <h1 style={{ fontSize: 18, fontWeight: 700, background: 'linear-gradient(90deg, var(--accent2), #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Karaoke
          </h1>
        </header>
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <aside style={{
            width: 360, borderRight: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column',
            background: 'var(--surface)', overflow: 'hidden', flexShrink: 0,
          }}>
            <SidebarContent {...sidebarProps} />
          </aside>
          <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Player {...playerProps} />
          </main>
        </div>
      </div>
    );
  }

  /* ── Mobile layout ── */
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Player fills screen */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Player {...playerProps} />
      </div>

      {/* Bottom drawer */}
      {drawerOpen && (
        <>
          <div
            onClick={() => setDrawerOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.5)' }}
          />
          <div style={{
            position: 'fixed', bottom: 56, left: 0, right: 0, zIndex: 50,
            height: '60vh',
            background: 'var(--surface)', borderTop: '1px solid var(--border)',
            borderRadius: '16px 16px 0 0',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px 0', flexShrink: 0 }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto' }} />
            </div>
            <div style={{ display: 'flex', flex: 1, flexDirection: 'column', overflow: 'hidden' }}>
              <SidebarContent {...sidebarProps} />
            </div>
          </div>
        </>
      )}

      {/* Bottom nav */}
      <nav style={{
        display: 'flex', height: 56, flexShrink: 0,
        background: 'var(--surface)', borderTop: '1px solid var(--border)',
        zIndex: 60,
      }}>
        {[
          { id: 'search', icon: Search, label: 'ค้นหา' },
          { id: 'queue', icon: ListMusic, label: `คิว${queue.length ? ` (${queue.length})` : ''}` },
        ].map(({ id, icon: Icon, label }) => {
          const active = drawerOpen && tab === id;
          return (
            <button key={id} onClick={() => handleMobileTab(id)} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 3, border: 'none', background: 'none',
              color: active ? 'var(--accent2)' : 'var(--muted)', cursor: 'pointer',
              fontSize: 11, fontWeight: active ? 600 : 400,
            }}>
              <Icon size={20} />
              {label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
