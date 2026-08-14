import { formatTime } from '@shared/lib/formatTime'
import { IconCheck, IconClose, IconMusic, IconPlay, IconPlus } from '@shared/ui/Icon'
import type { Track } from '../model/types'

interface TrackItemProps {
  track: Track
  isActive?: boolean
  isPlaying?: boolean
  onSelect?: (track: Track) => void
  onPlay?: (track: Track) => void
  onAdd?: (track: Track) => void
  onRemoveFromPlaylist?: (track: Track) => void
  onRemove?: (track: Track) => void
  actionLabel?: string
  isInPlaylist?: boolean
}

function EqualizerBars() {
  return (
    <span className="flex h-3.5 items-end gap-0.5" aria-hidden="true">
      <span className="animate-equalizer h-full w-0.5 rounded-full bg-sky-400" />
      <span className="animate-equalizer animate-equalizer-delay-1 h-full w-0.5 rounded-full bg-sky-400" />
      <span className="animate-equalizer animate-equalizer-delay-2 h-full w-0.5 rounded-full bg-sky-400" />
    </span>
  )
}

function TrackCover({
  track,
  isActive,
  isPlaying,
  onPlay,
}: {
  track: Track
  isActive: boolean
  isPlaying: boolean
  onPlay?: (track: Track) => void
}) {
  return (
    <div className="group/cover relative shrink-0">
      {track.coverUrl ? (
        <img
          src={track.coverUrl}
          alt={track.title}
          className="h-11 w-11 rounded-lg object-cover shadow-md ring-1 ring-white/10"
        />
      ) : (
        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-sky-400/20 bg-sky-500/10 text-sky-300">
          <IconMusic className="h-5 w-5" />
        </div>
      )}

      {onPlay ? (
        <button
          type="button"
          aria-label={`Play ${track.title}`}
          className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/5 opacity-0 transition-opacity group-hover/cover:opacity-100 focus-visible:opacity-100"
          onClick={() => onPlay(track)}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/55 text-zinc-900 shadow-sm backdrop-blur-[1px]">
            <IconPlay className="h-4 w-4" />
          </span>
        </button>
      ) : null}

      {isPlaying && isActive ? (
        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-sky-300/40 bg-[#0a1525] shadow-[0_0_8px_rgb(56_189_248/30%)]">
          <EqualizerBars />
        </span>
      ) : null}
    </div>
  )
}

export function TrackItem({
  track,
  isActive = false,
  isPlaying = false,
  onSelect,
  onPlay,
  onAdd,
  onRemoveFromPlaylist,
  onRemove,
  actionLabel,
  isInPlaylist = false,
}: TrackItemProps) {
  const durationLabel = track.duration > 0 ? formatTime(track.duration) : null
  const isDiscoverMode = Boolean(onPlay)

  const content = (
    <>
      <TrackCover track={track} isActive={isActive} isPlaying={isPlaying} onPlay={onPlay} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-sky-50">{track.title}</p>
        <p className="truncate text-xs text-sky-200/50">{track.artist}</p>
      </div>
      {durationLabel ? (
        <span className="shrink-0 font-mono text-xs tabular-nums text-sky-400/45">{durationLabel}</span>
      ) : null}
    </>
  )

  return (
    <div
      className={`group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all duration-200 ${
        isActive
          ? 'border-sky-400/35 bg-sky-500/10 shadow-[inset_0_0_20px_rgb(56_189_248/8%)]'
          : 'border-transparent bg-sky-950/20 hover:border-sky-400/15 hover:bg-sky-500/8'
      }`}
    >
      {isDiscoverMode ? (
        <div className="flex min-w-0 flex-1 items-center gap-3">{content}</div>
      ) : (
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          onClick={() => onSelect?.(track)}
        >
          {content}
        </button>
      )}

      {actionLabel ? (
        isInPlaylist ? (
          <button
            type="button"
            aria-label={`Remove ${track.title} from playlist`}
            title="Remove from playlist"
            className="hud-action hud-action-active h-8 w-8"
            onClick={() => onRemoveFromPlaylist?.(track)}
          >
            <IconCheck className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            type="button"
            aria-label={`${actionLabel} ${track.title}`}
            className="hud-action h-8 w-8"
            onClick={() => onAdd?.(track)}
          >
            <IconPlus className="h-3.5 w-3.5" />
          </button>
        )
      ) : null}

      {onRemove ? (
        <button
          type="button"
          aria-label={`Remove ${track.title}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-sky-400/40 opacity-0 transition group-hover:opacity-100 hover:border hover:border-rose-400/25 hover:bg-rose-500/10 hover:text-rose-300"
          onClick={() => onRemove(track)}
        >
          <IconClose />
        </button>
      ) : null}
    </div>
  )
}
