import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const socket = io(API_URL, { autoConnect: false });

export function useMatches() {
  const [matches, setMatches] = useState({ live: [], upcoming: [], finished: [] });
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/matches`)
      .then((r) => r.json())
      .then((data) => {
        setMatches(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    socket.connect();

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('matches:updated', (data) => setMatches(data));

    return () => {
      socket.off('matches:updated');
      socket.off('connect');
      socket.off('disconnect');
      socket.disconnect();
    };
  }, []);

  return { matches, loading, connected };
}
