import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function useStandings(tableType = 'apertura') {
  const [standings, setStandings] = useState({ groupA: [], groupB: [], hasGroups: true, tableType });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/standings?type=${tableType}`)
      .then((r) => r.json())
      .then((data) => {
        setStandings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tableType]);

  return { standings, loading };
}
