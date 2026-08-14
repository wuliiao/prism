import { useAudioEngine } from '@entities/audio'
import { IconPause, IconPlay } from '@shared/ui/Icon'
import { Button } from '@shared/ui/Button'

export function PlayPauseButton() {
  const { isPlaying, toggle, currentTrack } = useAudioEngine()

  return (
    <Button
      aria-label={isPlaying ? 'Pause' : 'Play'}
      className="h-12 w-12 rounded-full bg-white text-zinc-900 shadow-xl shadow-black/30 hover:bg-zinc-100 hover:scale-105 active:scale-95"
      disabled={!currentTrack}
      onClick={toggle}
    >
      {isPlaying ? (
        <IconPause className="h-5 w-5" />
      ) : (
        <IconPlay className="h-5 w-5 translate-x-0.5" />
      )}
    </Button>
  )
}
