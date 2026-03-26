import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function useStandings() {
  const [standings, setStandings] = useState({ groupA: [], groupB: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/standings`)
      .then((r) => r.json())
      .then((data) => {
        setStandings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { standings, loading };
}
