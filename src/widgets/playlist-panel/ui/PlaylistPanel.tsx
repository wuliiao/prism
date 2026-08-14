import type { Track } from '@entities/track'
import { TrackItem } from '@entities/track'
import { IconMusic } from '@shared/ui/Icon'

const QUICK_ADD_TAGS = ['chill', 'jazz', 'electronic', 'ambient', 'rock', 'lofi', 'pop']

interface PlaylistPanelProps {
  tracks: Track[]
  currentTrack: Track | null
  isPlaying: boolean
  onSelect: (track: Track) => void
  onRemove: (track: Track) => void
  onQuickAddGenre?: (tag: string) => void
  isQuickAddLoading?: boolean
}

export function PlaylistPanel({
  tracks,
  currentTrack,
  isPlaying,
  onSelect,
  onRemove,
  onQuickAddGenre,
  isQuickAddLoading = false,
}: PlaylistPanelProps) {
  return (
    <section className="glass-panel flex h-full min-h-[420px] flex-col rounded-2xl p-5">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">Your playlist</h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            {tracks.length === 0 ? 'Empty for now' : `${tracks.length} track${tracks.length === 1 ? '' : 's'}`}
          </p>
        </div>
        {tracks.length > 0 ? (
          <span className="rounded-full bg-violet-500/15 px-2.5 py-1 text-xs font-medium text-violet-300">
            {tracks.length}
          </span>
        ) : null}
      </header>

      {onQuickAddGenre ? (
        <div className="mb-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Quick add from Jamendo
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_ADD_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                disabled={isQuickAddLoading}
                onClick={() => onQuickAddGenre(tag)}
                className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium capitalize text-zinc-400 transition hover:bg-violet-500/20 hover:text-violet-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {tag}
              </button>
            ))}
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
              {onQuickAddGenre
                ? 'Pick a mood above or preview tracks in Discover'
                : 'Preview tracks in Discover, add the ones you like, or upload a local file'}
            </p>
          </div>
        </div>
      ) : (
        <ul className="custom-scrollbar flex flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
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
