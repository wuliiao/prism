import { useState } from 'react';
import { useJamendoApi } from '../hooks/useJamendoApi';

function TrackList() {
  const [query, setQuery] = useState('');
  const { tracks, loading, error } = useJamendoApi(query);

  return (
    <section className="w-full max-w-2xl">
      <label className="block text-sm font-medium text-zinc-300" htmlFor="track-search">
        Search tracks
      </label>
      <input
        className="mt-2 h-12 w-full rounded-md border border-zinc-700 bg-zinc-900 px-4 text-base text-zinc-50 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/25"
        id="track-search"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Type a song or artist"
        type="search"
        value={query}
      />

      <div className="mt-6 min-h-40">
        {loading && <p className="text-sm text-zinc-400">Loading tracks...</p>}

        {!loading && error && <p className="text-sm text-red-300">{error}</p>}

        {!loading && !error && query.trim() && (
          <ul className="divide-y divide-zinc-800 overflow-hidden rounded-md border border-zinc-800">
            {tracks.map((track) => (
              <li className="bg-zinc-900/70 px-4 py-3" key={track.id}>
                <p className="font-medium text-zinc-50">{track.name}</p>
                <p className="mt-1 text-sm text-zinc-400">{track.artist_name}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default TrackList;
