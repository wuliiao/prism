import { useEffect, useRef } from 'react'
import { useAudioEngine } from '@entities/audio'

interface AudioVisualizerProps {
  height?: number
}

const HUD_CYAN = 'rgba(56, 189, 248, 0.7)'
const HUD_GOLD = 'rgba(212, 175, 95, 0.7)'
const IDLE_POINTS = 160
const TRIGGER_THRESHOLD = 0.015
const TRIGGER_LOCK_WINDOW = 48
const DISPLAY_RATIO = 0.5
const WAVE_FOLLOW = 0.06

function lerp(current: number, target: number, amount: number) {
  return current + (target - current) * amount
}

function averageEnergy(spectrum: Uint8Array) {
  if (spectrum.length === 0) return 0
  let sum = 0
  let peak = 0
  for (const value of spectrum) {
    sum += value
    peak = Math.max(peak, value)
  }
  return Math.min(1, (sum / spectrum.length / 255) * 0.7 + (peak / 255) * 0.3)
}

function waveValue(sample: number) {
  return Math.tanh(sample)
}

function peakAbs(samples: Float32Array) {
  let peak = 0
  for (const value of samples) {
    peak = Math.max(peak, Math.abs(value))
  }
  return peak
}

function restorePeak(samples: Float32Array, targetPeak: number) {
  const currentPeak = peakAbs(samples)
  if (currentPeak < 1e-4 || targetPeak < 1e-4) return
  const gain = targetPeak / currentPeak
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = (samples[index] ?? 0) * gain
  }
}

function findRisingTrigger(samples: Float32Array, searchEnd: number, preferredStart: number) {
  const searchRange = (from: number, to: number) => {
    for (let index = from; index < to; index += 1) {
      const previous = samples[index - 1] ?? 0
      const current = samples[index] ?? 0
      if (previous < 0 && current >= TRIGGER_THRESHOLD) {
        return index
      }
    }
    return -1
  }

  if (preferredStart > 0) {
    const from = Math.max(1, preferredStart - TRIGGER_LOCK_WINDOW)
    const to = Math.min(searchEnd, preferredStart + TRIGGER_LOCK_WINDOW)
    const locked = searchRange(from, to)
    if (locked >= 0) return locked
  }

  const next = searchRange(1, searchEnd)
  if (next >= 0) return next
  return preferredStart > 0 ? preferredStart : 0
}

function copyOscilloscopeWindow(
  source: Float32Array,
  target: Float32Array,
  preferredStart: number,
) {
  const searchEnd = Math.max(1, source.length - target.length)
  const start = findRisingTrigger(source, searchEnd, preferredStart)
  for (let index = 0; index < target.length; index += 1) {
    target[index] = source[start + index] ?? 0
  }
  return start
}

function fillIdleWave(samples: Float32Array, phase: number) {
  const last = samples.length - 1
  for (let index = 0; index <= last; index += 1) {
    const progress = last === 0 ? 0 : index / last
    samples[index] = Math.sin(progress * Math.PI * 2.4 + phase) * 0.22
  }
}

function drawHudFrame(context: CanvasRenderingContext2D, width: number, height: number) {
  const pad = 14
  const corner = 22
  context.strokeStyle = 'rgba(56, 189, 248, 0.35)'
  context.lineWidth = 1

  const corners: Array<[number, number, number, number]> = [
    [pad, pad, 1, 1],
    [width - pad, pad, -1, 1],
    [pad, height - pad, 1, -1],
    [width - pad, height - pad, -1, -1],
  ]

  corners.forEach(([x, y, dirX, dirY]) => {
    context.beginPath()
    context.moveTo(x + dirX * corner, y)
    context.lineTo(x, y)
    context.lineTo(x, y + dirY * corner)
    context.stroke()
  })
}

function drawHudLabels(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  energy: number,
  isLive: boolean,
) {
  context.font = '600 9px ui-monospace, monospace'
  context.fillStyle = HUD_CYAN
  context.fillText('PRISM // AUDIO.SYS', 18, 22)

  context.font = '9px ui-monospace, monospace'
  context.fillStyle = HUD_GOLD
  context.fillText(isLive ? 'STREAM: ACTIVE' : 'STREAM: STANDBY', 18, height - 14)

  context.textAlign = 'right'
  context.fillStyle = 'rgba(56, 189, 248, 0.45)'
  context.fillText(`AMP ${Math.round(energy * 100)}%`, width - 18, 22)
  context.textAlign = 'left'
}

function buildWavePath(
  context: CanvasRenderingContext2D,
  samples: Float32Array,
  width: number,
  centerY: number,
  amplitude: number,
) {
  const last = samples.length - 1
  if (last < 0) return

  context.beginPath()
  for (let index = 0; index <= last; index += 1) {
    const progress = last === 0 ? 0 : index / last
    const x = progress * width
    const y = centerY + waveValue(samples[index] ?? 0) * amplitude
    if (index === 0) context.moveTo(x, y)
    else context.lineTo(x, y)
  }
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
