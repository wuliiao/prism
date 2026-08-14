import { useEffect, useState } from 'react'
import type { Track } from '@entities/track'
import { TrackItem } from '@entities/track'
import { useJamendoTracks } from '@features/load-jamendo-tracks'
import { isJamendoConfigured } from '@shared/config/env'
import { Button } from '@shared/ui/Button'

interface TrackSearchPanelProps {
  onPreviewTrack: (track: Track) => void
  onAddTrack: (track: Track) => void
  onAddAll: (tracks: Track[]) => void
  isInPlaylist: (trackId: string) => boolean
  currentTrack: Track | null
  isPlaying: boolean
}

const GENRE_TAGS = ['chill', 'jazz', 'electronic', 'ambient', 'rock', 'lofi', 'pop']

export function TrackSearchPanel({
  onPreviewTrack,
  onAddTrack,
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

  const handleTagClick = (tag: string) => {
    setQuery(tag)
    void search(tag)
  }

  if (!isJamendoConfigured()) {
    return (
      <section className="glass-panel flex h-full min-h-[420px] flex-col rounded-2xl p-5">
        <header className="mb-4">
          <h2 className="text-base font-semibold text-zinc-100">Discover</h2>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            Jamendo search is unavailable. Upload a local file or add{' '}
            <code className="rounded bg-white/5 px-1 py-0.5 text-zinc-400">VITE_JAMENDO_CLIENT_ID</code> to{' '}
            <code className="rounded bg-white/5 px-1 py-0.5 text-zinc-400">.env</code>.
          </p>
        </header>
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center">
          <p className="max-w-xs text-sm text-zinc-500">
            Use the Upload button above to play your own music while API access is not configured.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="glass-panel flex h-full min-h-[420px] flex-col rounded-2xl p-5">
      <header className="mb-4">
        <h2 className="text-base font-semibold text-zinc-100">Discover</h2>
        <p className="mt-0.5 text-xs text-zinc-500">Hover and play to preview, then add to playlist</p>

        <form className="mt-4 flex gap-2" onSubmit={handleSubmit}>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by mood or genre..."
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-violet-400/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-violet-400/20"
          />
          <Button type="submit" disabled={isLoading} className="min-w-[88px]">
            {isLoading ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              'Search'
            )}
          </Button>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          {GENRE_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
                query === tag
                  ? 'bg-violet-500/25 text-violet-200 ring-1 ring-violet-400/40'
                  : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </header>

      {error ? (
        <p className="mb-3 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</p>
      ) : null}

      {tracks.length > 0 ? (
        <div className="mb-3">
          <Button variant="ghost" className="w-full text-xs" disabled={isLoading} onClick={() => onAddAll(tracks)}>
            Add all {tracks.length} tracks to playlist
          </Button>
        </div>
      ) : null}

      <ul className="custom-scrollbar flex flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
        {isLoading && tracks.length === 0
          ? Array.from({ length: 5 }).map((_, index) => (
              <li
                key={index}
                className="h-[58px] animate-pulse rounded-xl bg-white/[0.04]"
              />
            ))
          : null}

        {!isLoading && tracks.length === 0 ? (
          <li className="flex flex-1 items-center justify-center py-12 text-sm text-zinc-500">
            No tracks found — try another tag
          </li>
        ) : null}

        {tracks.map((track) => (
          <li key={track.id}>
            <TrackItem
              track={track}
              onPlay={onPreviewTrack}
              onAdd={onAddTrack}
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
