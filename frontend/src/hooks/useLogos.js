import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function useLogos() {
  const [logos, setLogos] = useState({});

  useEffect(() => {
    fetch(`${API_URL}/standings/logos`)
      .then((r) => r.json())
      .then((data) => setLogos(data))
      .catch(() => {});
  }, []);

  return logos;
}
