import { useRef, useState, useCallback, useEffect } from 'react';

export function useAudioMixer() {
  const audioCtxRef = useRef(null);
  const micSourceRef = useRef(null);
  const micGainRef = useRef(null);
  const monitorGainRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);

  const inputDeviceIdRef = useRef('default');
  const outputDeviceIdRef = useRef('default');
  const micVolumeRef = useRef(80);
  const monitorVolumeRef = useRef(80);
  const playbackRef = useRef(true);
  const noiseSuppressionRef = useRef(true);
  const micActiveRef = useRef(false);

  const [micVolume, setMicVolume] = useState(80);
  const [monitorVolume, setMonitorVolume] = useState(80);
  const [micActive, setMicActive] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [playback, setPlayback] = useState(true);
  const [noiseSuppression, setNoiseSuppression] = useState(true);

  const getCtx = useCallback(async (outputDeviceId) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext({ latencyHint: 'interactive', sampleRate: 48000 });
    }
    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }
    if (outputDeviceId && outputDeviceId !== 'default' && audioCtxRef.current.setSinkId) {
      await audioCtxRef.current.setSinkId(outputDeviceId).catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  const _teardownMic = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    micSourceRef.current?.disconnect();
    micGainRef.current?.disconnect();
    monitorGainRef.current?.disconnect();
    analyserRef.current?.disconnect();
    micSourceRef.current = null;
    micGainRef.current = null;
    monitorGainRef.current = null;
    analyserRef.current = null;
  }, []);

  const connectMic = useCallback(async (inputDeviceId, outputDeviceId) => {
    const inId = inputDeviceId ?? inputDeviceIdRef.current;
    const outId = outputDeviceId ?? outputDeviceIdRef.current;
    inputDeviceIdRef.current = inId;
    outputDeviceIdRef.current = outId;

    try {
      _teardownMic();
      const ctx = await getCtx(outId);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          ...(inId && inId !== 'default' ? { deviceId: { exact: inId } } : {}),
          noiseSuppression: noiseSuppressionRef.current,
          echoCancellation: true,
          autoGainControl: false,
        },
        video: false,
      });
      streamRef.current = stream;

      const source = ctx.createMediaStreamSource(stream);

      // Minimum chain: source → monitorGain → destination (monitor/playback)
      const monitorGain = ctx.createGain();
      monitorGain.gain.value = playbackRef.current ? monitorVolumeRef.current / 100 : 0;
      source.connect(monitorGain);
      monitorGain.connect(ctx.destination);

      // Metering only: source → micGain → analyser (does NOT go to destination)
      const micGain = ctx.createGain();
      micGain.gain.value = micVolumeRef.current / 100;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(micGain);
      micGain.connect(analyser);

      micSourceRef.current = source;
      micGainRef.current = micGain;
      monitorGainRef.current = monitorGain;
      analyserRef.current = analyser;
      micActiveRef.current = true;
      setMicActive(true);

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setMicLevel(Math.min(100, (avg / 128) * 100));
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      console.error('Mic error:', err);
      alert('ไม่สามารถเข้าถึงไมโครโฟนได้: ' + err.message);
    }
  }, [getCtx, _teardownMic]);

  const disconnectMic = useCallback(() => {
    _teardownMic();
    micActiveRef.current = false;
    setMicActive(false);
    setMicLevel(0);
  }, [_teardownMic]);

  const updateMicVolume = useCallback((v) => {
    micVolumeRef.current = v;
    setMicVolume(v);
    if (micGainRef.current) micGainRef.current.gain.value = v / 100;
  }, []);

  const updateMonitorVolume = useCallback((v) => {
    monitorVolumeRef.current = v;
    setMonitorVolume(v);
    if (monitorGainRef.current && playbackRef.current) monitorGainRef.current.gain.value = v / 100;
  }, []);

  const togglePlayback = useCallback((val) => {
    const next = val ?? !playbackRef.current;
    playbackRef.current = next;
    setPlayback(next);
    if (monitorGainRef.current) monitorGainRef.current.gain.value = next ? monitorVolumeRef.current / 100 : 0;
  }, []);

  const toggleNoiseSuppression = useCallback((val) => {
    const next = val ?? !noiseSuppressionRef.current;
    noiseSuppressionRef.current = next;
    setNoiseSuppression(next);
    if (micActiveRef.current) connectMic();
  }, [connectMic]);

  const switchOutputDevice = useCallback(async (deviceId) => {
    outputDeviceIdRef.current = deviceId;
    if (audioCtxRef.current?.setSinkId) {
      await audioCtxRef.current.setSinkId(deviceId).catch(() => {});
    }
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return {
    micVolume, monitorVolume, micActive, micLevel,
    playback, noiseSuppression,
    connectMic, disconnectMic,
    updateMicVolume, updateMonitorVolume,
    togglePlayback, toggleNoiseSuppression,
    switchOutputDevice,
  };
}
