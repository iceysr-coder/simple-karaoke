import { useState, useCallback, useEffect } from 'react';

export function useDevices() {
  const [audioInputs, setAudioInputs] = useState([]);
  const [audioOutputs, setAudioOutputs] = useState([]);
  const [inputDeviceId, setInputDeviceId] = useState('default');
  const [outputDeviceId, setOutputDeviceId] = useState('default');
  const [permissionGranted, setPermissionGranted] = useState(false);

  const refresh = useCallback(async (requestPermission = false) => {
    try {
      // Need at least one getUserMedia call to get device labels
      if (requestPermission && !permissionGranted) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
        setPermissionGranted(true);
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputs = devices.filter((d) => d.kind === 'audioinput');
      const outputs = devices.filter((d) => d.kind === 'audiooutput');
      setAudioInputs(inputs);
      setAudioOutputs(outputs);
    } catch (err) {
      console.warn('enumerateDevices error:', err);
    }
  }, [permissionGranted]);

  useEffect(() => {
    refresh(false);
    navigator.mediaDevices?.addEventListener('devicechange', () => refresh(false));
    return () => navigator.mediaDevices?.removeEventListener('devicechange', () => refresh(false));
  }, []);

  return { audioInputs, audioOutputs, inputDeviceId, outputDeviceId, setInputDeviceId, setOutputDeviceId, refresh };
}
