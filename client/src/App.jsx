import { useState, useCallback } from 'react';
import SearchBar from './components/SearchBar.jsx';
import VideoList from './components/VideoList.jsx';
import Player from './components/Player.jsx';
import { useAudioMixer } from './hooks/useAudioMixer.js';
import { useDevices } from './hooks/useDevices.js';
import { Mic } from 'lucide-react';

export default function App() {
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  const {
    micVolume, monitorVolume, micActive, micLevel,
    playback, noiseSuppression,
    connectMic, disconnectMic,
    updateMicVolume, updateMonitorVolume,
    togglePlayback, toggleNoiseSuppression,
    switchOutputDevice,
  } = useAudioMixer();
  const { audioInputs, audioOutputs, inputDeviceId, outputDeviceId, setInputDeviceId, setOutputDeviceId, refresh } = useDevices();

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

  const handleRefreshDevices = useCallback(() => {
    refresh(true);
  }, [refresh]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <header style={{
        padding: '16px 24px', borderBottom: '1px solid var(--border)',
        background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Mic size={24} color="var(--accent2)" />
        <h1 style={{ fontSize: 20, fontWeight: 700, background: 'linear-gradient(90deg, var(--accent2), #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Karaoke
        </h1>
      </header>

      {/* Main layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar: search + list */}
        <aside style={{
          width: 380, borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', gap: 0,
          background: 'var(--surface)', overflow: 'hidden',
        }}>
          <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
            <SearchBar onSearch={handleSearch} loading={searching} />
            {error && <p style={{ marginTop: 10, color: 'var(--red)', fontSize: 13 }}>{error}</p>}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            <VideoList
              videos={videos}
              currentId={currentVideo?.id}
              onSelect={setCurrentVideo}
            />
            {!videos.length && !searching && (
              <div style={{ textAlign: 'center', color: 'var(--muted)', marginTop: 40, fontSize: 14 }}>
                <p>ค้นหาเพลงที่ต้องการร้อง</p>
                <p style={{ marginTop: 6, fontSize: 12 }}>เช่น "เพลงสตริง karaoke", "ลูกทุ่ง karaoke"</p>
              </div>
            )}
          </div>
        </aside>

        {/* Main: player */}
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

              audioInputs={audioInputs}
              audioOutputs={audioOutputs}
              inputDeviceId={inputDeviceId}
              outputDeviceId={outputDeviceId}
              onInputChange={handleInputChange}
              onOutputChange={handleOutputChange}
              onRefreshDevices={handleRefreshDevices}
            />
        </main>
      </div>
    </div>
  );
}
