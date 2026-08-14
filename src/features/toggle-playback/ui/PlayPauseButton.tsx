import { useAudioEngine } from '@entities/audio'
import { IconPause, IconPlay } from '@shared/ui/Icon'
import { Button } from '@shared/ui/Button'

export function PlayPauseButton() {
  const { isPlaying, toggle, currentTrack, isLoading } = useAudioEngine()

  return (
    <Button
      aria-label={isPlaying ? 'Pause' : 'Play'}
      aria-pressed={isPlaying}
      className="h-12 w-12 rounded-full bg-white text-zinc-900 shadow-xl shadow-black/30 hover:bg-zinc-100 hover:scale-105 active:scale-95"
      disabled={!currentTrack || isLoading}
      onClick={() => void toggle()}
    >
      {isLoading ? (
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
      ) : isPlaying ? (
        <IconPause className="h-5 w-5" />
      ) : (
        <IconPlay className="h-5 w-5 translate-x-0.5" />
      )}
    </Button>
  )
}
