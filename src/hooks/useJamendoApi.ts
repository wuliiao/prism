import { useEffect, useState } from 'react';
import { searchTracks, type Track } from '../services/jamendoApi';

interface UseJamendoApiResult {
  tracks: Track[];
  loading: boolean;
  error: string | null;
}

export function useJamendoApi(query: string): UseJamendoApiResult {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setTracks([]);
      setLoading(false);
      setError(null);
      return;
    }

    // AbortController prevents an older request from updating state after the
    // user has already typed a new query.
    const abortController = new AbortController();

    // useEffect must return either nothing or a cleanup function, not a Promise.
    // Declaring the async function inside keeps the effect cleanup synchronous.
    async function loadTracks() {
      setLoading(true);
      setError(null);

      try {
        const results = await searchTracks(trimmedQuery, abortController.signal);

        if (results.length === 0) {
          setError('No tracks found.');
        }

        setTracks(results);
      } catch (caughtError) {
        if (abortController.signal.aborted) {
          return;
        }

        const message =
          caughtError instanceof TypeError
            ? 'Network is unavailable. Please try again later.'
            : caughtError instanceof Error
              ? caughtError.message
              : 'Unable to load tracks.';

        setTracks([]);
        setError(message);
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadTracks();

    return () => {
      abortController.abort();
    };
  }, [query]);

  return { tracks, loading, error };
}
