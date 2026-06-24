import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export function useAdminData(loader, fallback = []) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    loader()
      .then((response) => {
        if (mounted) setData(response);
      })
      .catch((err) => {
        if (mounted) {
          const message = err.response?.data?.message || 'Unable to load data';
          setError(message);
          toast.error(message);
        }
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [loader]);

  return { data, setData, loading, error };
}