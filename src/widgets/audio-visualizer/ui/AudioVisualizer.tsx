import { useEffect, useRef } from 'react'
import { useAudioEngine } from '@entities/audio'

interface AudioVisualizerProps {
  barCount?: number
  height?: number
}

export function AudioVisualizer({ barCount = 64, height = 160 }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { analyser, isPlaying } = useAudioEngine()
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const bufferLength = analyser?.frequencyBinCount ?? barCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw)

      const width = canvas.width
      const canvasHeight = canvas.height

      context.clearRect(0, 0, width, canvasHeight)

      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray)
      } else {
        dataArray.fill(0)
      }

      const gradient = context.createLinearGradient(0, 0, 0, canvasHeight)
      gradient.addColorStop(0, '#a78bfa')
      gradient.addColorStop(1, '#4c1d95')
      context.fillStyle = gradient

      const step = Math.floor(bufferLength / barCount)
      const gap = 2
      const barWidth = width / barCount - gap

      for (let i = 0; i < barCount; i += 1) {
        const value = dataArray[i * step] ?? 0
        const barHeight = (value / 255) * canvasHeight * 0.9
        const x = i * (barWidth + gap)
        const y = canvasHeight - barHeight

        context.beginPath()
        context.roundRect(x, y, barWidth, barHeight, 2)
        context.fill()
      }
    }

    draw()

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [analyser, barCount, isPlaying])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      canvas.width = parent.clientWidth
      canvas.height = height
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [height])

  return (
    <canvas
      ref={canvasRef}
      aria-label="Audio visualizer"
      className="w-full rounded-2xl bg-zinc-950/80"
      style={{ height }}
    />
  )
}
