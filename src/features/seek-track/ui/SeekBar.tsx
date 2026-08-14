import { useCallback, useEffect, useState } from 'react'
import { useAudioEngine } from '@entities/audio'
import { formatTime } from '@shared/lib/formatTime'
import { Slider } from '@shared/ui/Slider'

export function SeekBar() {
  const { currentTime, duration, seek, currentTrack } = useAudioEngine()
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0
  const [isDragging, setIsDragging] = useState(false)
  const [dragValue, setDragValue] = useState(0)

  useEffect(() => {
    if (!isDragging) {
      setDragValue(currentTime)
    }
  }, [currentTime, isDragging])

  useEffect(() => {
    if (!isDragging) return

    const stopDragging = () => setIsDragging(false)

    window.addEventListener('pointerup', stopDragging)
    window.addEventListener('pointercancel', stopDragging)

    return () => {
      window.removeEventListener('pointerup', stopDragging)
      window.removeEventListener('pointercancel', stopDragging)
    }
  }, [isDragging])

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(event.target.value)
      setDragValue(value)
      seek(value)
    },
    [seek],
  )

  return (
    <div className="flex w-full items-center gap-3">
      <span className="w-10 text-right font-mono text-xs tabular-nums text-sky-400/55">
        {formatTime(isDragging ? dragValue : currentTime)}
      </span>
      <Slider
        aria-label="Seek"
        min={0}
        max={safeDuration || 100}
        step={0.1}
        value={isDragging ? dragValue : currentTime}
        disabled={!currentTrack || safeDuration === 0}
        onChange={handleChange}
        onPointerDown={() => setIsDragging(true)}
        className="flex-1"
      />
      <span className="w-10 font-mono text-xs tabular-nums text-sky-400/55">
        {formatTime(safeDuration)}
      </span>
    </div>
  )
}
