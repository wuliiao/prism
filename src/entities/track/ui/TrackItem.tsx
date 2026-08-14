import type { Track } from '../model/types'

interface TrackItemProps {
  track: Track
  isActive?: boolean
  isPlaying?: boolean
  onSelect?: (track: Track) => void
  onRemove?: (track: Track) => void
}

export function TrackItem({
  track,
  isActive = false,
  isPlaying = false,
  onSelect,
  onRemove,
}: TrackItemProps) {
  return (
    <div
      className={`group flex items-center gap-3 rounded-xl border px-3 py-2 transition ${
        isActive
          ? 'border-violet-400/50 bg-violet-500/10'
          : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10'
      }`}
    >
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
        onClick={() => onSelect?.(track)}
      >
        {track.coverUrl ? (
          <img
            src={track.coverUrl}
            alt=""
            className="h-10 w-10 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300">
            ♪
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-100">
            {isPlaying && isActive ? '▶ ' : ''}
            {track.title}
          </p>
          <p className="truncate text-xs text-zinc-400">{track.artist}</p>
        </div>
      </button>
      {onRemove ? (
        <button
          type="button"
          aria-label={`Remove ${track.title}`}
          className="rounded-lg px-2 py-1 text-xs text-zinc-500 opacity-0 transition group-hover:opacity-100 hover:bg-rose-500/20 hover:text-rose-300"
          onClick={() => onRemove(track)}
        >
          ✕
        </button>
      ) : null}
    </div>
  )
}
