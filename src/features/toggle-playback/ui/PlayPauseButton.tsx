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
      className="h-12 w-12 shrink-0 rounded-full border-2 border-sky-400/50 arc-reactor text-sky-950 shadow-[0_0_24px_rgb(56_189_248/30%)] hover:scale-105 hover:border-sky-300/70 active:scale-95"
      disabled={!currentTrack || isLoading}
      onClick={() => void toggle()}
    >
      {isLoading ? (
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-sky-700 border-t-sky-300" />
      ) : isPlaying ? (
        <IconPause className="h-5 w-5" />
      ) : (
        <IconPlay className="h-5 w-5" />
      )}
    </Button>
  )
}
