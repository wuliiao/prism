import { useEffect, useRef } from 'react'
import { useAudioEngine } from '@entities/audio'
import { buildWavePath, drawHudFrame, drawHudLabels } from '../lib/draw'
import {
  DISPLAY_RATIO,
  IDLE_POINTS,
  WAVE_FOLLOW,
  averageEnergy,
  copyOscilloscopeWindow,
  fillIdleWave,
  lerp,
  peakAbs,
  restorePeak,
} from '../lib/oscilloscope'

interface AudioVisualizerProps {
  height?: number
}

export function AudioVisualizer({ height = 240 }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sizeRef = useRef({ width: 0, height, dpr: 1 })
  const { analyser, isPlaying, currentTrack } = useAudioEngine()
  const animationRef = useRef<number | null>(null)
  const phaseRef = useRef(0)
  const energyRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fftSize = analyser?.fftSize ?? 2048
    const timeDomain = new Float32Array(fftSize)
    const spectrum = new Uint8Array(analyser?.frequencyBinCount ?? fftSize / 2)
    const liveWave = new Float32Array(Math.max(2, Math.floor(fftSize * DISPLAY_RATIO)))
    const capturedWave = new Float32Array(liveWave.length)
    const idleWave = new Float32Array(IDLE_POINTS)
    let triggerStart = 0

    const drawFrame = (animateIdle: boolean) => {
      const { width, height: canvasHeight, dpr } = sizeRef.current
      if (width <= 0 || canvasHeight <= 0) return

      const centerY = canvasHeight / 2
      const hasLiveAudio = Boolean(analyser && isPlaying)

      if (hasLiveAudio) {
        analyser!.getFloatTimeDomainData(timeDomain)
        analyser!.getByteFrequencyData(spectrum)
        triggerStart = copyOscilloscopeWindow(timeDomain, capturedWave, triggerStart)
        for (let index = 0; index < liveWave.length; index += 1) {
          liveWave[index] = lerp(liveWave[index] ?? 0, capturedWave[index] ?? 0, WAVE_FOLLOW)
        }
        restorePeak(liveWave, peakAbs(capturedWave))
        energyRef.current = lerp(energyRef.current, averageEnergy(spectrum), 0.18)
      } else {
        energyRef.current = lerp(energyRef.current, 0.12, 0.08)
        if (animateIdle) phaseRef.current += 0.018
        fillIdleWave(idleWave, phaseRef.current)
      }

      const energy = energyRef.current
      const amplitude = canvasHeight * (hasLiveAudio ? 0.76 : 0.22)

      context.setTransform(1, 0, 0, 1, 0, 0)
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)

      const background = context.createLinearGradient(0, 0, 0, canvasHeight)
      background.addColorStop(0, '#050a14')
      background.addColorStop(0.5, '#0a1525')
      background.addColorStop(1, '#050a14')
      context.fillStyle = background
      context.fillRect(0, 0, width, canvasHeight)

      const glow = context.createRadialGradient(width / 2, centerY, 0, width / 2, centerY, width * 0.48)
      glow.addColorStop(0, `rgba(56, 189, 248, ${0.06 + energy * 0.1})`)
      glow.addColorStop(1, 'transparent')
      context.fillStyle = glow
      context.fillRect(0, 0, width, canvasHeight)

      drawHudFrame(context, width, canvasHeight)
      drawHudLabels(context, width, canvasHeight, energy, hasLiveAudio)

      context.lineCap = 'round'
      context.lineJoin = 'round'

      if (hasLiveAudio) {
        context.strokeStyle = 'rgba(212, 175, 95, 0.28)'
        context.lineWidth = 1
        buildWavePath(context, liveWave, width, centerY + 6, amplitude * 0.55)
        context.stroke()
      }

      context.strokeStyle = hasLiveAudio
        ? `rgba(56, 189, 248, ${0.55 + energy * 0.35})`
        : 'rgba(56, 189, 248, 0.35)'
      context.lineWidth = hasLiveAudio ? 2 : 1.25
      buildWavePath(context, hasLiveAudio ? liveWave : idleWave, width, centerY, amplitude)
      context.stroke()
    }

    const draw = () => {
      const keepAnimating = !mediaQuery.matches
      drawFrame(keepAnimating)
      if (keepAnimating) {
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
  }, [analyser, isPlaying])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return

      const dpr = window.devicePixelRatio || 1
      const displayWidth = parent.clientWidth
      sizeRef.current = { width: displayWidth, height, dpr }
      canvas.width = Math.max(1, Math.floor(displayWidth * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      canvas.style.width = `${displayWidth}px`
      canvas.style.height = `${height}px`
    }

    resize()
    const observer = new ResizeObserver(resize)
    if (canvas.parentElement) observer.observe(canvas.parentElement)
    return () => observer.disconnect()
  }, [height])

  return (
    <div className="relative overflow-hidden rounded-2xl border border-sky-500/20 bg-[#050a14] shadow-[inset_0_0_40px_rgba(56,189,248,0.04)]">
      <canvas
        ref={canvasRef}
        aria-label="Audio visualizer"
        className="block w-full"
        style={{ height, background: '#050a14' }}
      />
      {!currentTrack ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="font-mono text-xs tracking-widest text-sky-400/50">AWAITING AUDIO INPUT</p>
        </div>
      ) : null}
    </div>
  )
}
