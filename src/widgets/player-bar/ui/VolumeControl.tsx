import { useAudioEngine } from '@entities/audio'
import { IconVolume, IconVolumeMuted } from '@shared/ui/Icon'
import { Slider } from '@shared/ui/Slider'
import { Button } from '@shared/ui/Button'

export function VolumeControl() {
  const { volume, setVolume, toggleMute } = useAudioEngine()

  return (
    <>
      <Button
        variant="icon"
        aria-label={volume === 0 ? 'Unmute' : 'Mute'}
        aria-pressed={volume === 0}
        className="h-8 w-8"
        onClick={toggleMute}
      >
        {volume === 0 ? <IconVolumeMuted className="h-4 w-4" /> : <IconVolume className="h-4 w-4" />}
      </Button>
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
    </>
  )
}
