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

  const volumeSlider = (
    <Slider
      showLabel={false}
      aria-label="Volume"
      min={0}
      max={1}
      step={0.01}
      value={volume}
      onChange={(event) => setVolume(Number(event.target.value))}
      className="w-full md:w-28"
    />
  )

  return (
    <footer className="glass-panel-strong fixed inset-x-0 bottom-0 z-50 border-t border-sky-400/20 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="mb-1 hidden items-center justify-between sm:flex">
          <span className="hud-label">Playback control</span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#d4af5f]/60">
            PRISM // Audio
          </span>
        </div>

        <div className="mb-2 hidden sm:block">
          <SeekBar />
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 sm:flex sm:gap-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3 sm:flex-1">
            {currentTrack?.coverUrl ? (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="h-10 w-10 shrink-0 rounded-md border border-sky-400/20 object-cover sm:h-12 sm:w-12"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-sky-400/20 bg-sky-500/10 text-sky-300 sm:h-12 sm:w-12">
                <IconMusic className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-sky-50">
                {currentTrack?.title ?? 'No signal'}
              </p>
              <p className="hidden truncate font-mono text-[10px] text-sky-400/50 sm:block">
                {currentTrack?.artist ?? 'Awaiting track selection'}
              </p>
            </div>
          </div>

          <div className="col-start-2 row-start-1 flex items-center gap-0.5 sm:gap-2">
            <Button variant="icon" aria-label="Previous track" disabled={!canNavigate} onClick={onPrevious}>
              <IconSkipBack className="h-5 w-5" />
            </Button>
            <PlayPauseButton />
            <Button variant="icon" aria-label="Next track" disabled={!canNavigate} onClick={onNext}>
              <IconSkipForward className="h-5 w-5" />
            </Button>
          </div>

          <div className="hidden min-w-0 flex-1 items-center justify-end gap-2 md:flex">
            <IconVolume className="h-4 w-4 shrink-0 text-sky-400/50" />
            {volumeSlider}
          </div>
        </div>

        <div className="mt-2 space-y-2 sm:hidden">
          <SeekBar />
          <div className="flex items-center gap-2">
            <IconVolume className="h-4 w-4 shrink-0 text-sky-400/50" />
            {volumeSlider}
          </div>
        </div>
      </div>
    </footer>
  )
}
