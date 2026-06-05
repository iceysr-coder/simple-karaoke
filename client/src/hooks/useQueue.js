import { useState, useCallback } from 'react';

export function useQueue() {
  const [queue, setQueue] = useState([]);

  const addToQueue = useCallback((video) => {
    setQueue((q) => {
      if (q.some((v) => v.id === video.id)) return q;
      return [...q, video];
    });
  }, []);

  const removeFromQueue = useCallback((id) => {
    setQueue((q) => q.filter((v) => v.id !== id));
  }, []);

  const moveUp = useCallback((id) => {
    setQueue((q) => {
      const i = q.findIndex((v) => v.id === id);
      if (i <= 0) return q;
      const next = [...q];
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      return next;
    });
  }, []);

  const moveDown = useCallback((id) => {
    setQueue((q) => {
      const i = q.findIndex((v) => v.id === id);
      if (i < 0 || i >= q.length - 1) return q;
      const next = [...q];
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      return next;
    });
  }, []);

  const clearQueue = useCallback(() => setQueue([]), []);

  const shiftQueue = useCallback(() => {
    let next = null;
    setQueue((q) => {
      if (!q.length) return q;
      next = q[0];
      return q.slice(1);
    });
    return next;
  }, []);

  const peekNext = useCallback((queue) => queue[0] ?? null, []);

  return { queue, addToQueue, removeFromQueue, moveUp, moveDown, clearQueue, shiftQueue, peekNext };
}
