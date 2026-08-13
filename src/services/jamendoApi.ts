export interface Track {
  id: string;
  name: string;
  artist_name: string;
  audio: string;
  duration: number;
  image: string;
}

interface JamendoTracksResponse {
  headers: {
    status: string;
    code: number;
    error_message?: string;
    results_count: number;
  };
  results: Track[];
}

const JAMENDO_TRACKS_URL = 'https://api.jamendo.com/v3.0/tracks/';
const DEFAULT_LIMIT = 10;

export async function searchTracks(
  query: string,
  signal?: AbortSignal,
): Promise<Track[]> {
  const clientId = import.meta.env.VITE_JAMENDO_CLIENT_ID;
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  if (!clientId) {
    throw new Error('Jamendo client id is not configured.');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    format: 'json',
    search: trimmedQuery,
    limit: String(DEFAULT_LIMIT),
  });

  const response = await fetch(`${JAMENDO_TRACKS_URL}?${params.toString()}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error('Jamendo API request failed.');
  }

  const data = (await response.json()) as JamendoTracksResponse;

  if (data.headers.status !== 'success') {
    throw new Error(data.headers.error_message ?? 'Jamendo API returned an error.');
  }

  return data.results;
}
