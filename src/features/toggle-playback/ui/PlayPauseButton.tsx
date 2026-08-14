import { useAudioEngine } from '@entities/audio'
import { Button } from '@shared/ui/Button'

export function PlayPauseButton() {
  const { isPlaying, toggle, currentTrack } = useAudioEngine()

  return (
    <Button
      aria-label={isPlaying ? 'Pause' : 'Play'}
      className="h-12 w-12 rounded-full px-0 text-lg"
      disabled={!currentTrack}
      onClick={toggle}
    >
      {isPlaying ? '⏸' : '▶'}
    </Button>
  )
}
