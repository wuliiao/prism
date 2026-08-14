import { useEffect, useRef } from 'react'
import { useAudioEngine } from '@entities/audio'

interface AudioVisualizerProps {
  height?: number
}

const HUD_CYAN = 'rgba(56, 189, 248, 0.7)'
const HUD_GOLD = 'rgba(212, 175, 95, 0.7)'

function averageEnergy(spectrum: Uint8Array) {
  if (spectrum.length === 0) return 0
  let sum = 0
  let peak = 0
  for (const value of spectrum) {
    sum += value
    peak = Math.max(peak, value)
  }
  return Math.min(1, (sum / spectrum.length / 255) * 0.4 + (peak / 255) * 0.6)
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
  samples: Uint8Array | Float32Array,
  width: number,
  centerY: number,
  amplitude: number,
  isByteData: boolean,
) {
  context.beginPath()
  const last = samples.length - 1

  for (let index = 0; index < samples.length; index += 1) {
    const progress = last === 0 ? 0 : index / last
    const raw = samples[index] ?? (isByteData ? 128 : 0)
    const value = isByteData ? (raw - 128) / 128 : raw
    const x = progress * width
    const y = centerY + value * amplitude
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
  const lastLiveWaveformRef = useRef<Uint8Array | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const waveform = new Uint8Array(analyser?.fftSize ?? 256)
    const spectrum = new Uint8Array(analyser?.frequencyBinCount ?? 128)
    const idleWave = new Float32Array(waveform.length)

    const drawFrame = (animateIdle: boolean) => {
      const { width, height: canvasHeight, dpr } = sizeRef.current
      if (width <= 0 || canvasHeight <= 0) return

      const centerY = canvasHeight / 2
      const hasLiveAudio = Boolean(analyser && isPlaying)
      const frozenWaveform = lastLiveWaveformRef.current
      const hasFrozenWave = Boolean(currentTrack && frozenWaveform && frozenWaveform.length > 0)

      if (hasLiveAudio) {
        analyser!.getByteTimeDomainData(waveform)
        analyser!.getByteFrequencyData(spectrum)
        if (!lastLiveWaveformRef.current || lastLiveWaveformRef.current.length !== waveform.length) {
          lastLiveWaveformRef.current = new Uint8Array(waveform.length)
        }
        lastLiveWaveformRef.current.set(waveform)
        energyRef.current += (averageEnergy(spectrum) - energyRef.current) * 0.35
      } else if (hasFrozenWave) {
        energyRef.current += (0.08 - energyRef.current) * 0.18
      } else {
        lastLiveWaveformRef.current = null
        energyRef.current += (0.12 - energyRef.current) * 0.12
        if (animateIdle) phaseRef.current += 0.04
        for (let index = 0; index < idleWave.length; index += 1) {
          const progress = index / (idleWave.length - 1)
          idleWave[index] = Math.sin(progress * Math.PI * 2.4 + phaseRef.current) * 0.22
        }
      }

      const energy = energyRef.current
      const showLiveWave = hasLiveAudio || hasFrozenWave
      const amplitude = canvasHeight * (showLiveWave ? 0.32 + energy * 0.12 : 0.22)

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

      if (showLiveWave) {
        const liveSamples = hasLiveAudio ? waveform : frozenWaveform!
        context.strokeStyle = `rgba(212, 175, 95, ${hasLiveAudio ? 0.28 : 0.16})`
        context.lineWidth = 1
        buildWavePath(context, liveSamples, width, centerY + 6, amplitude * 0.55, true)
        context.stroke()
      }

      context.strokeStyle = showLiveWave
        ? `rgba(56, 189, 248, ${hasLiveAudio ? 0.55 + energy * 0.35 : 0.38})`
        : 'rgba(56, 189, 248, 0.35)'
      context.lineWidth = showLiveWave ? 2 : 1.25
      if (showLiveWave) {
        buildWavePath(context, hasLiveAudio ? waveform : frozenWaveform!, width, centerY, amplitude, true)
      } else {
        buildWavePath(context, idleWave, width, centerY, amplitude, false)
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
