import { useEffect, useRef } from 'react'
import { useAudioEngine } from '@entities/audio'

interface AudioVisualizerProps {
  barCount?: number
  height?: number
}

export function AudioVisualizer({ barCount = 72, height = 200 }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { analyser, isPlaying, currentTrack } = useAudioEngine()
  const animationRef = useRef<number | null>(null)
  const phaseRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const bufferLength = analyser?.frequencyBinCount ?? barCount
    const dataArray = new Uint8Array(bufferLength)

    const drawFrame = (animateIdle: boolean) => {
      const width = canvas.width
      const canvasHeight = canvas.height
      const centerY = canvasHeight / 2

      context.clearRect(0, 0, width, canvasHeight)

      const bgGlow = context.createRadialGradient(
        width / 2,
        centerY,
        0,
        width / 2,
        centerY,
        width * 0.45,
      )
      bgGlow.addColorStop(0, 'rgb(139 92 246 / 12%)')
      bgGlow.addColorStop(1, 'transparent')
      context.fillStyle = bgGlow
      context.fillRect(0, 0, width, canvasHeight)

      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray)
      } else if (animateIdle) {
        phaseRef.current += 0.04
        for (let i = 0; i < bufferLength; i += 1) {
          dataArray[i] = Math.sin(phaseRef.current + i * 0.15) * 18 + 22
        }
      } else {
        for (let i = 0; i < bufferLength; i += 1) {
          dataArray[i] = 28
        }
      }

      const step = Math.floor(bufferLength / barCount)
      const gap = 3
      const barWidth = width / barCount - gap

      for (let i = 0; i < barCount; i += 1) {
        const value = dataArray[i * step] ?? 0
        const normalized = value / 255
        const barHeight = normalized * (canvasHeight * 0.42)
        const x = i * (barWidth + gap)

        const gradient = context.createLinearGradient(0, centerY - barHeight, 0, centerY + barHeight)
        gradient.addColorStop(0, '#c4b5fd')
        gradient.addColorStop(0.5, '#8b5cf6')
        gradient.addColorStop(1, '#6d28d9')

        context.fillStyle = gradient
        context.beginPath()
        context.roundRect(x, centerY - barHeight, barWidth, barHeight, 2)
        context.fill()

        context.globalAlpha = 0.55
        context.beginPath()
        context.roundRect(x, centerY, barWidth, barHeight * 0.85, 2)
        context.fill()
        context.globalAlpha = 1
      }
    }

    const draw = () => {
      drawFrame(!mediaQuery.matches)
      if (!mediaQuery.matches) {
        animationRef.current = requestAnimationFrame(draw)
      }
    }

    draw()

    const handleMotionChange = () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      draw()
    }

    mediaQuery.addEventListener('change', handleMotionChange)

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange)
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
    <div className="relative overflow-hidden rounded-2xl ring-1 ring-white/10">
      <canvas
        ref={canvasRef}
        aria-label="Audio visualizer"
        className="block w-full bg-zinc-950/60"
        style={{ height }}
      />
      {!currentTrack ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-zinc-500">Select a track to start listening</p>
        </div>
      ) : null}
    </div>
  )
}
