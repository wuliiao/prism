import { useAudioEngine } from '@entities/audio'
import { formatTime } from '@shared/lib/formatTime'
import { Slider } from '@shared/ui/Slider'

export function SeekBar() {
  const { currentTime, duration, seek, currentTrack } = useAudioEngine()
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0

  return (
    <div className="flex w-full items-center gap-3">
      <span className="w-10 text-right text-xs tabular-nums text-zinc-400">
        {formatTime(currentTime)}
      </span>
      <Slider
        aria-label="Seek"
        min={0}
        max={safeDuration || 100}
        step={0.1}
        value={currentTime}
        disabled={!currentTrack || safeDuration === 0}
        onChange={(event) => seek(Number(event.target.value))}
        className="flex-1"
      />
      <span className="w-10 text-xs tabular-nums text-zinc-400">
        {formatTime(safeDuration)}
      </span>
    </div>
  )
}
