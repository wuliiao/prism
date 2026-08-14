import { formatTime } from '@shared/lib/formatTime'
import { IconClose, IconMusic, IconPlus } from '@shared/ui/Icon'
import type { Track } from '../model/types'

interface TrackItemProps {
  track: Track
  isActive?: boolean
  isPlaying?: boolean
  onSelect?: (track: Track) => void
  onRemove?: (track: Track) => void
  actionLabel?: string
}

function EqualizerBars() {
  return (
    <span className="flex h-3.5 items-end gap-0.5" aria-hidden="true">
      <span className="animate-equalizer h-full w-0.5 rounded-full bg-violet-400" />
      <span className="animate-equalizer animate-equalizer-delay-1 h-full w-0.5 rounded-full bg-violet-400" />
      <span className="animate-equalizer animate-equalizer-delay-2 h-full w-0.5 rounded-full bg-violet-400" />
    </span>
  )
}

export function TrackItem({
  track,
  isActive = false,
  isPlaying = false,
  onSelect,
  onRemove,
  actionLabel,
}: TrackItemProps) {
  const durationLabel =
    track.duration > 0 ? formatTime(track.duration) : null

  return (
    <div
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
        isActive
          ? 'bg-violet-500/15 ring-1 ring-violet-400/40'
          : 'bg-white/[0.03] hover:bg-white/[0.07]'
      }`}
    >
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
        onClick={() => onSelect?.(track)}
      >
        <div className="relative shrink-0">
          {track.coverUrl ? (
            <img
              src={track.coverUrl}
              alt=""
              className="h-11 w-11 rounded-lg object-cover shadow-md ring-1 ring-white/10"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 text-violet-300 ring-1 ring-white/10">
              <IconMusic className="h-5 w-5" />
            </div>
          )}
          {isPlaying && isActive ? (
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 shadow-lg">
              <EqualizerBars />
            </span>
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-zinc-100">{track.title}</p>
          <p className="truncate text-xs text-zinc-400">{track.artist}</p>
        </div>
        {durationLabel ? (
          <span className="shrink-0 text-xs tabular-nums text-zinc-500">{durationLabel}</span>
        ) : null}
      </button>

      {actionLabel ? (
        <button
          type="button"
          aria-label={`${actionLabel} ${track.title}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300 transition hover:bg-violet-500/25"
          onClick={() => onSelect?.(track)}
        >
          <IconPlus />
        </button>
      ) : null}

      {onRemove ? (
        <button
          type="button"
          aria-label={`Remove ${track.title}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 opacity-0 transition group-hover:opacity-100 hover:bg-rose-500/15 hover:text-rose-300"
          onClick={() => onRemove(track)}
        >
          <IconClose />
        </button>
      ) : null}
    </div>
  )
}
