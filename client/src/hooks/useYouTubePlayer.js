import { useRef, useState, useEffect, useCallback } from 'react';

let ytApiReady = false;
let ytApiCallbacks = [];

function loadYTApi() {
  if (window.YT && window.YT.Player) { ytApiReady = true; return; }
  if (document.getElementById('yt-iframe-api')) return;
  const tag = document.createElement('script');
  tag.id = 'yt-iframe-api';
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
  window.onYouTubeIframeAPIReady = () => {
    ytApiReady = true;
    ytApiCallbacks.forEach((cb) => cb());
    ytApiCallbacks = [];
  };
}

function onYTReady(cb) {
  if (ytApiReady) { cb(); return; }
  ytApiCallbacks.push(cb);
  loadYTApi();
}

export function useYouTubePlayer(containerId, { onEnded } = {}) {
  const playerRef = useRef(null);
  const [playerState, setPlayerState] = useState('unstarted'); // unstarted | playing | paused | ended | buffering
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef(null);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  const destroyPlayer = useCallback(() => {
    clearInterval(timerRef.current);
    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch (_) {}
      playerRef.current = null;
    }
    setPlayerState('unstarted');
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const loadVideo = useCallback((videoId) => {
    destroyPlayer();

    onYTReady(() => {
      // Small delay to ensure container is in DOM
      setTimeout(() => {
        if (!document.getElementById(containerId)) return;
        playerRef.current = new window.YT.Player(containerId, {
          videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            rel: 0,
            modestbranding: 1,
            iv_load_policy: 3,
            cc_load_policy: 0,
          },
          events: {
            onReady(e) {
              e.target.setVolume(volume);
              setDuration(e.target.getDuration());
            },
            onStateChange(e) {
              const states = { '-1': 'unstarted', 0: 'ended', 1: 'playing', 2: 'paused', 3: 'buffering', 5: 'cued' };
              setPlayerState(states[e.data] || 'unstarted');
              if (e.data === window.YT.PlayerState.ENDED) {
                onEndedRef.current?.();
              }
              if (e.data === window.YT.PlayerState.PLAYING) {
                setDuration(e.target.getDuration());
                timerRef.current = setInterval(() => {
                  setCurrentTime(e.target.getCurrentTime());
                }, 500);
              } else {
                clearInterval(timerRef.current);
              }
            },
          },
        });
      }, 100);
    });
  }, [containerId, destroyPlayer, volume]);

  const play = useCallback(() => playerRef.current?.playVideo(), []);
  const pause = useCallback(() => playerRef.current?.pauseVideo(), []);
  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (playerState === 'playing') playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  }, [playerState]);

  const seek = useCallback((t) => {
    setCurrentTime(t);
    playerRef.current?.seekTo(t, true);
  }, []);

  const setVol = useCallback((v) => {
    setVolume(v);
    playerRef.current?.setVolume(v);
  }, []);

  useEffect(() => () => destroyPlayer(), [destroyPlayer]);

  return { loadVideo, destroyPlayer, play, pause, togglePlay, seek, setVol, playerState, volume, currentTime, duration };
}
