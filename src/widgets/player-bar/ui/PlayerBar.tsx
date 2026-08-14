import { useAudioEngine } from '@entities/audio'
import { PlayPauseButton } from '@features/toggle-playback'
import { SeekBar } from '@features/seek-track'
import { IconMusic, IconSkipBack, IconSkipForward, IconVolume } from '@shared/ui/Icon'
import { Slider } from '@shared/ui/Slider'
import { Button } from '@shared/ui/Button'

interface PlayerBarProps {
  canNavigate: boolean
  onNext: () => void
  onPrevious: () => void
}

export function PlayerBar({ canNavigate, onNext, onPrevious }: PlayerBarProps) {
  const { currentTrack, volume, setVolume } = useAudioEngine()

  return (
    <footer className="glass-panel-strong fixed inset-x-0 bottom-0 z-50 border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="mb-2 hidden sm:block">
          <SeekBar />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {currentTrack?.coverUrl ? (
              <img
                src={currentTrack.coverUrl}
                alt=""
                className="h-12 w-12 shrink-0 rounded-lg object-cover shadow-lg ring-1 ring-white/10"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300 ring-1 ring-white/10">
                <IconMusic className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-100">
                {currentTrack?.title ?? 'No track selected'}
              </p>
              <p className="truncate text-xs text-zinc-400">
                {currentTrack?.artist ?? 'Pick something from Discover or your playlist'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="icon" aria-label="Previous track" disabled={!canNavigate} onClick={onPrevious}>
              <IconSkipBack className="h-5 w-5" />
            </Button>
            <PlayPauseButton />
            <Button variant="icon" aria-label="Next track" disabled={!canNavigate} onClick={onNext}>
              <IconSkipForward className="h-5 w-5" />
            </Button>
          </div>

          <div className="hidden min-w-0 flex-1 items-center justify-end gap-2 md:flex">
            <IconVolume className="h-4 w-4 shrink-0 text-zinc-400" />
            <Slider
              showLabel={false}
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              className="w-28"
            />
          </div>
        </div>

        <div className="mt-2 sm:hidden">
          <SeekBar />
        </div>
      </div>
    </footer>
  )
}
