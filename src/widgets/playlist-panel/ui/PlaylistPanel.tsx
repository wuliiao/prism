import { useEffect, useMemo, useState } from 'react'
import type { Track } from '@entities/track'
import { TrackItem } from '@entities/track'
import { IconMusic } from '@shared/ui/Icon'

const GENRE_FILTERS = ['chill', 'jazz', 'electronic', 'ambient', 'rock', 'lofi', 'pop'] as const

interface PlaylistPanelProps {
  tracks: Track[]
  currentTrack: Track | null
  isPlaying: boolean
  onSelect: (track: Track) => void
  onRemove: (track: Track) => void
}

export function PlaylistPanel({
  tracks,
  currentTrack,
  isPlaying,
  onSelect,
  onRemove,
}: PlaylistPanelProps) {
  const [activeGenre, setActiveGenre] = useState<string | null>(null)

  const availableGenres = useMemo(
    () => GENRE_FILTERS.filter((genre) => tracks.some((track) => track.genre === genre)),
    [tracks],
  )

  const hasLocalTracks = useMemo(
    () => tracks.some((track) => track.source === 'local' || !track.genre),
    [tracks],
  )

  const visibleTracks = useMemo(() => {
    if (!activeGenre) return tracks
    if (activeGenre === 'local') {
      return tracks.filter((track) => track.source === 'local' || !track.genre)
    }
    return tracks.filter((track) => track.genre === activeGenre)
  }, [activeGenre, tracks])

  useEffect(() => {
    if (!activeGenre) return
    if (activeGenre === 'local' && hasLocalTracks) return
    if (GENRE_FILTERS.includes(activeGenre as (typeof GENRE_FILTERS)[number])) {
      if (availableGenres.includes(activeGenre as (typeof GENRE_FILTERS)[number])) return
    }
    setActiveGenre(null)
  }, [activeGenre, availableGenres, hasLocalTracks])

  const showFilters = tracks.length > 0 && (availableGenres.length > 0 || hasLocalTracks)

  return (
    <section className="glass-panel flex h-full min-h-[420px] flex-col rounded-2xl p-5">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">Your playlist</h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            {tracks.length === 0
              ? 'Empty for now'
              : activeGenre
                ? `${visibleTracks.length} of ${tracks.length} track${tracks.length === 1 ? '' : 's'}`
                : `${tracks.length} track${tracks.length === 1 ? '' : 's'}`}
          </p>
        </div>
        {tracks.length > 0 ? (
          <span className="rounded-full bg-violet-500/15 px-2.5 py-1 text-xs font-medium text-violet-300">
            {tracks.length}
          </span>
        ) : null}
      </header>

      {showFilters ? (
        <div className="mb-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Filter by mood
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveGenre(null)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
                activeGenre === null
                  ? 'bg-violet-500/25 text-violet-200 ring-1 ring-violet-400/40'
                  : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
              }`}
            >
              All
            </button>
            {availableGenres.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => setActiveGenre(genre)}
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
                  activeGenre === genre
                    ? 'bg-violet-500/25 text-violet-200 ring-1 ring-violet-400/40'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
                }`}
              >
                {genre}
              </button>
            ))}
            {hasLocalTracks ? (
              <button
                type="button"
                onClick={() => setActiveGenre('local')}
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
                  activeGenre === 'local'
                    ? 'bg-violet-500/25 text-violet-200 ring-1 ring-violet-400/40'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
                }`}
              >
                Local
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {tracks.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-zinc-500">
            <IconMusic className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-300">Nothing here yet</p>
            <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-zinc-500">
              Preview tracks in Discover, add the ones you like, or upload a local file
            </p>
          </div>
        </div>
      ) : visibleTracks.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-12 text-center text-sm text-zinc-500">
          No tracks in this category
        </div>
      ) : (
        <ul className="custom-scrollbar flex flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
          {visibleTracks.map((track) => (
            <li key={track.id}>
              <TrackItem
                track={track}
                isActive={currentTrack?.id === track.id}
                isPlaying={isPlaying && currentTrack?.id === track.id}
                onSelect={onSelect}
                onRemove={onRemove}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
