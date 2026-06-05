import { useState, useCallback, useMemo } from 'react';
import SearchBar from './components/SearchBar.jsx';
import VideoList from './components/VideoList.jsx';
import Queue from './components/Queue.jsx';
import Player from './components/Player.jsx';
import { useAudioMixer } from './hooks/useAudioMixer.js';
import { useDevices } from './hooks/useDevices.js';
import { useQueue } from './hooks/useQueue.js';
import { Mic, Search, ListMusic } from 'lucide-react';

export default function App() {
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('search'); // 'search' | 'queue'

  const {
    micVolume, monitorVolume, micActive, micLevel,
    playback, noiseSuppression,
    connectMic, disconnectMic,
    updateMicVolume, updateMonitorVolume,
    togglePlayback, toggleNoiseSuppression,
    switchOutputDevice,
  } = useAudioMixer();
  const { audioInputs, audioOutputs, inputDeviceId, outputDeviceId, setInputDeviceId, setOutputDeviceId, refresh } = useDevices();
  const { queue, addToQueue, removeFromQueue, moveUp, moveDown, clearQueue, shiftQueue } = useQueue();

  const queueIds = useMemo(() => new Set(queue.map((v) => v.id)), [queue]);

  const handleSearch = useCallback(async (q) => {
    setSearching(true);
    setError('');
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
    const next = shiftQueue();
    if (next) setCurrentVideo(next);
  }, [shiftQueue]);

  const handleAddToQueue = useCallback((video) => {
    addToQueue(video);
    setTab('queue');
  }, [addToQueue]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <header style={{
        padding: '12px 24px', borderBottom: '1px solid var(--border)',
        background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 10,
        flexShrink: 0,
      }}>
        <Mic size={22} color="var(--accent2)" />
        <h1 style={{ fontSize: 18, fontWeight: 700, background: 'linear-gradient(90deg, var(--accent2), #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Karaoke
        </h1>
      </header>

      {/* Main layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        <aside style={{
          width: 360, borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          background: 'var(--surface)', overflow: 'hidden', flexShrink: 0,
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            {[
              { id: 'search', icon: <Search size={14} />, label: 'ค้นหา' },
              { id: 'queue', icon: <ListMusic size={14} />, label: `คิวเพลง${queue.length ? ` (${queue.length})` : ''}` },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1, padding: '11px 8px', border: 'none', cursor: 'pointer',
                  background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
                  color: tab === t.id ? 'var(--accent2)' : 'var(--muted)',
                  borderBottom: `2px solid ${tab === t.id ? 'var(--accent2)' : 'transparent'}`,
                  transition: 'all 0.15s',
                }}
              >
                {t.icon}{t.label}
              </button>
            ))}
          </div>

          {/* Search tab */}
          {tab === 'search' && (
            <>
              <div style={{ padding: 14, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                <SearchBar onSearch={handleSearch} loading={searching} />
                {error && <p style={{ marginTop: 8, color: 'var(--red)', fontSize: 12 }}>{error}</p>}
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
                <VideoList
                  videos={videos}
                  currentId={currentVideo?.id}
                  onSelect={setCurrentVideo}
                  onAddToQueue={handleAddToQueue}
                  queueIds={queueIds}
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

          {/* Queue tab */}
          {tab === 'queue' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
              <Queue
                queue={queue}
                currentId={currentVideo?.id}
                onSelect={setCurrentVideo}
                onRemove={removeFromQueue}
                onMoveUp={moveUp}
                onMoveDown={moveDown}
                onClear={clearQueue}
              />
            </div>
          )}
        </aside>

        {/* Player */}
        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Player
            video={currentVideo}
            micVolume={micVolume}
            monitorVolume={monitorVolume}
            micActive={micActive}
            micLevel={micLevel}
            playback={playback}
            noiseSuppression={noiseSuppression}
            onMicVolume={updateMicVolume}
            onMonitorVolume={updateMonitorVolume}
            onMicToggle={handleMicToggle}
            onTogglePlayback={togglePlayback}
            onToggleNoiseSuppression={toggleNoiseSuppression}
            onEnded={handleEnded}
            audioInputs={audioInputs}
            audioOutputs={audioOutputs}
            inputDeviceId={inputDeviceId}
            outputDeviceId={outputDeviceId}
            onInputChange={handleInputChange}
            onOutputChange={handleOutputChange}
            onRefreshDevices={() => refresh(true)}
          />
        </main>
      </div>
    </div>
  );
}
