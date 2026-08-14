import type { Track } from '@entities/track'
import { TrackItem } from '@entities/track'

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
  return (
    <section className="flex h-full flex-col rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">Playlist</h2>
        <span className="text-xs text-zinc-400">{tracks.length} tracks</span>
      </header>

      {tracks.length === 0 ? (
        <p className="flex flex-1 items-center justify-center text-sm text-zinc-500">
          Add tracks from Jamendo search or upload local files
        </p>
      ) : (
        <ul className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
          {tracks.map((track) => (
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
