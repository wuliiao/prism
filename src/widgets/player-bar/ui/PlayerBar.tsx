import { useAudioEngine } from '@entities/audio'
import { PlayPauseButton } from '@features/toggle-playback'
import { SeekBar } from '@features/seek-track'
import { Slider } from '@shared/ui/Slider'
import { Button } from '@shared/ui/Button'

interface PlayerBarProps {
  onNext: () => void
  onPrevious: () => void
}

export function PlayerBar({ onNext, onPrevious }: PlayerBarProps) {
  const { currentTrack, volume, setVolume } = useAudioEngine()

  return (
    <footer className="rounded-2xl border border-white/10 bg-zinc-900/90 p-4 backdrop-blur">
      <div className="mb-4 flex items-center gap-4">
        {currentTrack?.coverUrl ? (
          <img
            src={currentTrack.coverUrl}
            alt=""
            className="h-14 w-14 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-violet-500/20 text-2xl text-violet-300">
            ♪
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-zinc-100">
            {currentTrack?.title ?? 'No track selected'}
          </p>
          <p className="truncate text-sm text-zinc-400">
            {currentTrack?.artist ?? 'Choose a track from the playlist or search'}
          </p>
        </div>
        <div className="hidden w-32 sm:block">
          <Slider
            label="Volume"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
          />
        </div>
      </div>

      <SeekBar />

      <div className="mt-4 flex items-center justify-center gap-3">
        <Button variant="ghost" aria-label="Previous track" onClick={onPrevious}>
          ⏮
        </Button>
        <PlayPauseButton />
        <Button variant="ghost" aria-label="Next track" onClick={onNext}>
          ⏭
        </Button>
      </div>
    </footer>
  )
}
