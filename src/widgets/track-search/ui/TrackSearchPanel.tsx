import { useEffect, useState } from 'react'
import type { Track } from '@entities/track'
import { TrackItem } from '@entities/track'
import { useJamendoTracks } from '@features/load-jamendo-tracks'
import { isJamendoConfigured } from '@shared/config'
import { Button } from '@shared/ui/Button'

interface TrackSearchPanelProps {
  onPlayTrack: (track: Track) => void
  onAddTrack: (track: Track) => void
  onRemoveFromPlaylist: (track: Track) => void
  onAddAll: (tracks: Track[]) => void
  isInPlaylist: (trackId: string) => boolean
  currentTrack: Track | null
  isPlaying: boolean
}

const inputClassName =
  'flex-1 rounded-md border border-sky-400/20 bg-sky-950/40 px-4 py-2.5 font-mono text-sm text-sky-50 outline-none transition placeholder:text-sky-400/35 focus:border-sky-400/50 focus:bg-sky-950/60 focus:ring-2 focus:ring-sky-400/15'

export function TrackSearchPanel({
  onPlayTrack,
  onAddTrack,
  onRemoveFromPlaylist,
  onAddAll,
  isInPlaylist,
  currentTrack,
  isPlaying,
}: TrackSearchPanelProps) {
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
      <section className="glass-panel flex h-full min-h-[420px] flex-col rounded-lg p-5">
        <header className="mb-4">
          <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-sky-100">
            Search
          </h2>
          <p className="mt-1 font-mono text-[10px] leading-relaxed text-sky-400/50">
            Jamendo uplink offline. Set{' '}
            <code className="rounded border border-sky-400/15 bg-sky-950/50 px-1 py-0.5 text-sky-300/70">
              VITE_JAMENDO_CLIENT_ID
            </code>{' '}
            in env config.
          </p>
        </header>
        <div className="flex flex-1 items-center justify-center rounded-md border border-dashed border-sky-400/15 bg-sky-950/20 px-4 py-8 text-center">
          <p className="max-w-xs font-mono text-xs text-sky-400/50">
            Use Import Local File to load audio while uplink is unavailable
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="glass-panel flex h-full min-h-[420px] flex-col rounded-lg p-5">
      <header className="mb-4">
        <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-sky-100">
          Search
        </h2>

        <form className="mt-3 flex gap-2" onSubmit={handleSubmit}>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, artist, or mood..."
            className={inputClassName}
          />
          <Button type="submit" disabled={isLoading} className="min-w-[88px]">
            {isLoading ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-sky-900 border-t-sky-200" />
            ) : (
              'Scan'
            )}
          </Button>
        </form>
      </header>

      {error ? (
        <p className="mb-3 rounded-md border border-rose-400/25 bg-rose-500/10 px-3 py-2 font-mono text-xs text-rose-200">
          {error}
        </p>
      ) : null}

      {tracks.length > 0 ? (
        <div className="mb-3">
          <Button
            variant="ghost"
            className="w-full normal-case tracking-normal"
            disabled={isLoading}
            onClick={() => onAddAll(tracks)}
          >
            Import all {tracks.length} tracks
          </Button>
        </div>
      ) : null}

      <ul className="custom-scrollbar flex flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
        {isLoading && tracks.length === 0
          ? Array.from({ length: 5 }).map((_, index) => (
              <li key={index} className="h-[58px] animate-pulse rounded-lg border border-sky-400/5 bg-sky-950/30" />
            ))
          : null}

        {!isLoading && !error && tracks.length === 0 ? (
          <li className="flex flex-1 items-center justify-center py-12 font-mono text-xs text-sky-400/50">
            No results — try another query
          </li>
        ) : null}

        {tracks.map((track) => (
          <li key={track.id}>
            <TrackItem
              track={track}
              onPlay={onPlayTrack}
              onAdd={onAddTrack}
              onRemoveFromPlaylist={onRemoveFromPlaylist}
              actionLabel="Add"
              isInPlaylist={isInPlaylist(track.id)}
              isActive={currentTrack?.id === track.id}
              isPlaying={isPlaying && currentTrack?.id === track.id}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
