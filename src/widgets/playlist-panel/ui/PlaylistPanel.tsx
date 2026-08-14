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
    <section className="glass-panel flex h-full min-h-[420px] flex-col rounded-lg p-5">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-sky-100">
            Playlist
          </h2>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-sky-400/50">
            {tracks.length === 0
              ? 'Queue empty'
              : activeGenre
                ? `${visibleTracks.length} / ${tracks.length} tracks`
                : `${tracks.length} tracks loaded`}
          </p>
        </div>
        {tracks.length > 0 ? (
          <span className="rounded border border-sky-400/25 bg-sky-500/10 px-2.5 py-1 font-mono text-xs text-sky-300">
            {tracks.length}
          </span>
        ) : null}
      </header>

      {showFilters ? (
        <div className="mb-4">
          <p className="hud-label mb-2">Filter // Mood</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveGenre(null)}
              className={`hud-chip capitalize ${activeGenre === null ? 'hud-chip-active' : ''}`}
            >
              All
            </button>
            {availableGenres.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => setActiveGenre(genre)}
                className={`hud-chip capitalize ${activeGenre === genre ? 'hud-chip-active' : ''}`}
              >
                {genre}
              </button>
            ))}
            {hasLocalTracks ? (
              <button
                type="button"
                onClick={() => setActiveGenre('local')}
                className={`hud-chip capitalize ${activeGenre === 'local' ? 'hud-chip-active' : ''}`}
              >
                Local
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {tracks.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-sky-400/15 bg-sky-500/5 text-sky-400/40">
            <IconMusic className="h-8 w-8" />
          </div>
          <div>
            <p className="font-mono text-sm text-sky-100/80">No tracks in queue</p>
            <p className="mt-1 max-w-[240px] font-mono text-[10px] leading-relaxed text-sky-400/45">
              Scan Search or import local audio file
            </p>
          </div>
        </div>
      ) : visibleTracks.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-12 text-center font-mono text-xs text-sky-400/50">
          No matches for selected filter
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
