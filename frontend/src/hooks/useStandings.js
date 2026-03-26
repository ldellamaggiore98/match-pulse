import { useEffect, useState } from 'react';

export function useStandings() {
  const [standings, setStandings] = useState({ groupA: [], groupB: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/standings')
      .then((r) => r.json())
      .then((data) => {
        setStandings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { standings, loading };
}
