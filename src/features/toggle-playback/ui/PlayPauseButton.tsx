import { useAudioEngine } from '@entities/audio'
import { IconPause, IconPlay } from '@shared/ui/Icon'
import { Button } from '@shared/ui/Button'

export function PlayPauseButton() {
  const { isPlaying, toggle, currentTrack, isLoading } = useAudioEngine()

  return (
    <Button
      variant="icon"
      aria-label={isPlaying ? 'Pause' : 'Play'}
      aria-pressed={isPlaying}
      className="h-12 w-12 shrink-0 border-0 bg-white text-zinc-900 shadow-xl shadow-black/30 hover:scale-105 hover:bg-zinc-100 hover:text-zinc-900 active:scale-95"
      disabled={!currentTrack || isLoading}
      onClick={() => void toggle()}
    >
      {isLoading ? (
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
      ) : isPlaying ? (
        <IconPause className="h-5 w-5" />
      ) : (
        <IconPlay className="h-5 w-5" />
      )}
    </Button>
  )
}
