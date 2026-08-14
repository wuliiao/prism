import { useEffect, useRef } from 'react'
import { useAudioEngine } from '@entities/audio'

interface AudioVisualizerProps {
  height?: number
}

const HUD_CYAN = 'rgba(56, 189, 248, 0.7)'
const HUD_GOLD = 'rgba(212, 175, 95, 0.7)'
const WAVE_POINTS = 96

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

function bandEnergy(spectrum: Uint8Array, from: number, to: number) {
  const end = Math.min(to, spectrum.length)
  const start = Math.min(from, end)
  if (end <= start) return 0
  let sum = 0
  for (let index = start; index < end; index += 1) {
    sum += spectrum[index] ?? 0
  }
  return sum / ((end - start) * 255)
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

  const points: Array<{ x: number; y: number }> = []
  for (let index = 0; index <= last; index += 1) {
    const progress = last === 0 ? 0 : index / last
    const value = Math.tanh(samples[index] ?? 0)
    points.push({ x: progress * width, y: centerY + value * amplitude })
  }

  context.beginPath()
  const first = points[0]
  if (!first) return
  context.moveTo(first.x, first.y)

  for (let index = 1; index < points.length - 1; index += 1) {
    const current = points[index]
    const next = points[index + 1]
    if (!current || !next) continue
    context.quadraticCurveTo(current.x, current.y, (current.x + next.x) / 2, (current.y + next.y) / 2)
  }

  const end = points[points.length - 1]
  if (end) context.lineTo(end.x, end.y)
}

function fillWave(
  samples: Float32Array,
  phase: number,
  bass: number,
  mid: number,
  treble: number,
  gain: number,
) {
  const last = samples.length - 1
  for (let index = 0; index <= last; index += 1) {
    const progress = last === 0 ? 0 : index / last
    samples[index] =
      (Math.sin(progress * Math.PI * 2 + phase) * (0.42 + bass * 0.58) +
        Math.sin(progress * Math.PI * 4 + phase * 1.15) * mid * 0.32 +
        Math.sin(progress * Math.PI * 7 + phase * 1.4) * treble * 0.16) *
      gain
  }
}

export function AudioVisualizer({ height = 240 }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sizeRef = useRef({ width: 0, height, dpr: 1 })
  const { analyser, isPlaying, currentTrack } = useAudioEngine()
  const animationRef = useRef<number | null>(null)
  const phaseRef = useRef(0)
  const energyRef = useRef(0)
  const bassRef = useRef(0)
  const midRef = useRef(0)
  const trebleRef = useRef(0)
  const lastLiveWaveformRef = useRef<Float32Array | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const spectrum = new Uint8Array(analyser?.frequencyBinCount ?? 128)
    const liveWave = new Float32Array(WAVE_POINTS)
    const idleWave = new Float32Array(WAVE_POINTS)
    if (lastLiveWaveformRef.current && lastLiveWaveformRef.current.length === WAVE_POINTS) {
      liveWave.set(lastLiveWaveformRef.current)
    }

    const drawFrame = (animateIdle: boolean) => {
      const { width, height: canvasHeight, dpr } = sizeRef.current
      if (width <= 0 || canvasHeight <= 0) return

      const centerY = canvasHeight / 2
      const hasLiveAudio = Boolean(analyser && isPlaying)
      const frozenWaveform = lastLiveWaveformRef.current
      const hasFrozenWave = Boolean(currentTrack && frozenWaveform && frozenWaveform.length > 0)

      if (hasLiveAudio) {
        analyser!.getByteFrequencyData(spectrum)
        bassRef.current = lerp(bassRef.current, bandEnergy(spectrum, 0, 10), 0.1)
        midRef.current = lerp(midRef.current, bandEnergy(spectrum, 10, 48), 0.08)
        trebleRef.current = lerp(trebleRef.current, bandEnergy(spectrum, 48, 140), 0.06)
        energyRef.current = lerp(energyRef.current, averageEnergy(spectrum), 0.1)
        phaseRef.current += 0.028 + bassRef.current * 0.03
        fillWave(
          liveWave,
          phaseRef.current,
          bassRef.current,
          midRef.current,
          trebleRef.current,
          0.85 + energyRef.current * 0.2,
        )
        if (!lastLiveWaveformRef.current || lastLiveWaveformRef.current.length !== WAVE_POINTS) {
          lastLiveWaveformRef.current = new Float32Array(WAVE_POINTS)
        }
        lastLiveWaveformRef.current.set(liveWave)
      } else if (hasFrozenWave) {
        energyRef.current = lerp(energyRef.current, 0.08, 0.12)
      } else {
        lastLiveWaveformRef.current = null
        energyRef.current = lerp(energyRef.current, 0.12, 0.08)
        if (animateIdle) phaseRef.current += 0.018
        fillWave(idleWave, phaseRef.current, 0.18, 0.08, 0.04, 0.22)
      }

      const energy = energyRef.current
      const showLiveWave = hasLiveAudio || hasFrozenWave
      const amplitude = canvasHeight * (showLiveWave ? 0.28 + energy * 0.12 : 0.22)
      const liveSamples = hasLiveAudio ? liveWave : frozenWaveform

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

      if (showLiveWave && liveSamples) {
        context.strokeStyle = `rgba(212, 175, 95, ${hasLiveAudio ? 0.28 : 0.16})`
        context.lineWidth = 1
        buildWavePath(context, liveSamples, width, centerY + 6, amplitude * 0.55)
        context.stroke()
      }

      context.strokeStyle = showLiveWave
        ? `rgba(56, 189, 248, ${hasLiveAudio ? 0.55 + energy * 0.35 : 0.38})`
        : 'rgba(56, 189, 248, 0.35)'
      context.lineWidth = showLiveWave ? 2 : 1.25
      if (showLiveWave && liveSamples) {
        buildWavePath(context, liveSamples, width, centerY, amplitude)
      } else {
        buildWavePath(context, idleWave, width, centerY, amplitude)
      }
      context.stroke()
    }

    const draw = () => {
      const keepAnimating = !mediaQuery.matches && (Boolean(analyser && isPlaying) || !currentTrack)
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
  }, [analyser, currentTrack, isPlaying])

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
