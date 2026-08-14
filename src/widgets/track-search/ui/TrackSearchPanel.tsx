import { useEffect, useState } from 'react'
import type { Track } from '@entities/track'
import { TrackItem } from '@entities/track'
import { useJamendoTracks } from '@features/load-jamendo-tracks'
import { isJamendoConfigured } from '@shared/config/env'
import { Button } from '@shared/ui/Button'

interface TrackSearchPanelProps {
  onAddTrack: (track: Track) => void
  onAddAll: (tracks: Track[]) => void
}

export function TrackSearchPanel({ onAddTrack, onAddAll }: TrackSearchPanelProps) {
  const [query, setQuery] = useState('chill')
  const { tracks, isLoading, error, search } = useJamendoTracks()

  useEffect(() => {
    if (isJamendoConfigured()) {
      void search('chill')
    }
  }, [search])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    void search(query)
  }

  if (!isJamendoConfigured()) {
    return (
      <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
        <p className="font-medium">Jamendo API not configured</p>
        <p className="mt-1 text-amber-200/80">
          Copy <code className="rounded bg-black/20 px-1">.env.example</code> to{' '}
          <code className="rounded bg-black/20 px-1">.env</code> and set your{' '}
          <code className="rounded bg-black/20 px-1">VITE_JAMENDO_CLIENT_ID</code>.
        </p>
      </section>
    )
  }

  return (
    <section className="flex h-full flex-col rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-100">Discover (Jamendo)</h2>
        <form className="mt-3 flex gap-2" onSubmit={handleSubmit}>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by tag: jazz, rock, ambient..."
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-400"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? '...' : 'Search'}
          </Button>
        </form>
      </header>

      {error ? <p className="mb-3 text-sm text-rose-300">{error}</p> : null}

      <div className="mb-3">
        <Button
          variant="ghost"
          disabled={tracks.length === 0}
          onClick={() => onAddAll(tracks)}
        >
          Add all to playlist
        </Button>
      </div>

      <ul className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
        {tracks.map((track) => (
          <li key={track.id}>
            <TrackItem track={track} onSelect={onAddTrack} />
          </li>
        ))}
      </ul>
    </section>
  )
}
