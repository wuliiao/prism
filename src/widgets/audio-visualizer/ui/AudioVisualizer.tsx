import { useEffect, useRef } from 'react'
import { useAudioEngine } from '@entities/audio'

interface AudioVisualizerProps {
  pointCount?: number
  height?: number
}

interface SmoothedEnergy {
  bass: number
  mid: number
  treble: number
  total: number
}

interface WaveLayerConfig {
  rgb: readonly [number, number, number]
  phaseOffset: number
  lineCount: number
  depthShift: number
  frequencyScale: number
  energyKey: keyof SmoothedEnergy
  amplitudeWeight: number
}

// PRISM palette — cool holographic cyan + subtle gold accent
const WAVE_LAYERS: WaveLayerConfig[] = [
  {
    rgb: [56, 189, 248],
    phaseOffset: 0,
    lineCount: 16,
    depthShift: -0.42,
    frequencyScale: 1,
    energyKey: 'bass',
    amplitudeWeight: 1,
  },
  {
    rgb: [103, 232, 249],
    phaseOffset: 0.65,
    lineCount: 17,
    depthShift: -0.08,
    frequencyScale: 1.05,
    energyKey: 'mid',
    amplitudeWeight: 0.9,
  },
  {
    rgb: [186, 230, 253],
    phaseOffset: 1.25,
    lineCount: 15,
    depthShift: 0.28,
    frequencyScale: 0.97,
    energyKey: 'treble',
    amplitudeWeight: 0.75,
  },
  {
    rgb: [212, 175, 95],
    phaseOffset: 0.35,
    lineCount: 11,
    depthShift: 0.48,
    frequencyScale: 1.02,
    energyKey: 'total',
    amplitudeWeight: 0.45,
  },
]

const BASE_FREQUENCY = 2.6
const HUD_CYAN = 'rgba(56, 189, 248, 0.55)'
const HUD_GOLD = 'rgba(212, 175, 95, 0.7)'

function rgba([r, g, b]: readonly [number, number, number], alpha: number) {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function lerp(current: number, target: number, amount: number) {
  return current + (target - current) * amount
}

function smoothEnergy(current: number, target: number) {
  const amount = target > current ? 0.68 : 0.42
  return lerp(current, target, amount)
}

function normalizeEnergy(value: number) {
  return Math.max(0, Math.min(1, (value - 0.05) / 0.48))
}

function blendBandEnergy(averageNormalized: number, peak: number) {
  return normalizeEnergy(averageNormalized * 0.4 + (peak / 255) * 0.6)
}

function smoothPoints(values: Float32Array, passes = 2) {
  const temp = new Float32Array(values.length)

  for (let pass = 0; pass < passes; pass += 1) {
    for (let index = 0; index < values.length; index += 1) {
      const prev = values[Math.max(0, index - 1)] ?? 0
      const current = values[index] ?? 0
      const next = values[Math.min(values.length - 1, index + 1)] ?? 0
      temp[index] = prev * 0.16 + current * 0.68 + next * 0.16
    }
    values.set(temp)
  }
}

function smoothWavePath(
  context: CanvasRenderingContext2D,
  points: Array<{ x: number; y: number }>,
) {
  if (points.length < 2) return

  context.beginPath()
  context.moveTo(points[0]?.x ?? 0, points[0]?.y ?? 0)

  for (let index = 1; index < points.length - 1; index += 1) {
    const current = points[index]
    const next = points[index + 1]
    if (!current || !next) continue
    const midX = (current.x + next.x) / 2
    const midY = (current.y + next.y) / 2
    context.quadraticCurveTo(current.x, current.y, midX, midY)
  }

  const last = points[points.length - 1]
  if (last) {
    context.lineTo(last.x, last.y)
  }
}

function drawHudGrid(context: CanvasRenderingContext2D, width: number, height: number) {
  const centerX = width / 2
  const centerY = height / 2

  context.save()
  context.lineWidth = 1

  for (let radius = 28; radius < Math.max(width, height) * 0.55; radius += 32) {
    context.strokeStyle = `rgba(56, 189, 248, ${0.04 + (radius % 64 === 28 ? 0.04 : 0)})`
    context.beginPath()
    context.arc(centerX, centerY, radius, 0, Math.PI * 2)
    context.stroke()
  }

  context.strokeStyle = 'rgba(56, 189, 248, 0.07)'
  const columnStep = width / 8
  const rowStep = height / 4

  for (let x = 0; x <= width; x += columnStep) {
    context.beginPath()
    context.moveTo(x, 0)
    context.lineTo(x, height)
    context.stroke()
  }

  for (let y = 0; y <= height; y += rowStep) {
    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(width, y)
    context.stroke()
  }

  context.strokeStyle = 'rgba(56, 189, 248, 0.28)'
  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
    const innerR = 24
    const outerR = 42
    context.beginPath()
    context.moveTo(centerX + Math.cos(angle) * innerR, centerY + Math.sin(angle) * innerR)
    context.lineTo(centerX + Math.cos(angle) * outerR, centerY + Math.sin(angle) * outerR)
    context.stroke()
  }

  context.restore()
}

function drawHudFrame(context: CanvasRenderingContext2D, width: number, height: number) {
  const pad = 14
  const corner = 22

  context.save()
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

  context.restore()
}

function drawHudLabels(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  phase: number,
  energy: SmoothedEnergy,
  isLive: boolean,
) {
  context.save()
  context.font = '600 9px ui-monospace, monospace'
  context.fillStyle = HUD_CYAN
  context.fillText('PRISM // AUDIO.SYS', 18, 22)

  context.font = '9px ui-monospace, monospace'
  context.fillStyle = HUD_GOLD
  context.fillText(isLive ? 'STREAM: ACTIVE' : 'STREAM: STANDBY', 18, height - 14)

  context.textAlign = 'right'
  context.fillStyle = 'rgba(56, 189, 248, 0.45)'
  context.fillText(`AMP ${Math.round(energy.total * 100)}%`, width - 18, 22)
  context.fillText(`PH ${(phase % (Math.PI * 2)).toFixed(2)}`, width - 18, height - 14)
  context.textAlign = 'left'

  context.font = '8px ui-monospace, monospace'
  context.fillStyle = 'rgba(125, 211, 252, 0.2)'
  const readouts = [
    `B${Math.round(energy.bass * 100)}`,
    `M${Math.round(energy.mid * 100)}`,
    `T${Math.round(energy.treble * 100)}`,
  ]
  readouts.forEach((label, index) => {
    const x = width * (0.28 + index * 0.18) + Math.sin(phase * 0.5 + index) * 4
    const y = height * 0.18 + (index % 2) * 12
    context.fillText(label, x, y)
  })

  context.restore()
}

function getAudioEnergy(frequencyData: Uint8Array): SmoothedEnergy {
  let bassEnergy = 0
  let midEnergy = 0
  let trebleEnergy = 0
  let bassPeak = 0
  let midPeak = 0
  let treblePeak = 0
  let globalPeak = 0
  const third = Math.max(1, Math.floor(frequencyData.length / 3))

  for (let index = 0; index < frequencyData.length; index += 1) {
    const value = frequencyData[index] ?? 0
    globalPeak = Math.max(globalPeak, value)

    if (index < third) {
      bassEnergy += value
      bassPeak = Math.max(bassPeak, value)
    } else if (index < third * 2) {
      midEnergy += value
      midPeak = Math.max(midPeak, value)
    } else {
      trebleEnergy += value
      treblePeak = Math.max(treblePeak, value)
    }
  }

  const bassAvg = bassEnergy / third / 255
  const midAvg = midEnergy / third / 255
  const trebleAvg = trebleEnergy / third / 255
  const totalAvg = (bassAvg + midAvg + trebleAvg) / 3

  return {
    bass: blendBandEnergy(bassAvg, bassPeak),
    mid: blendBandEnergy(midAvg, midPeak),
    treble: blendBandEnergy(trebleAvg, treblePeak),
    total: normalizeEnergy(totalAvg * 0.35 + (globalPeak / 255) * 0.65),
  }
}

function buildWaveShape(
  pointCount: number,
  phase: number,
  motionGain: number,
  layer: WaveLayerConfig,
  target: Float32Array,
) {
  for (let index = 0; index < pointCount; index += 1) {
    const progress = index / (pointCount - 1)
    const wavePhase = phase + layer.phaseOffset
    const freq = BASE_FREQUENCY * layer.frequencyScale

    const primary = Math.sin(progress * Math.PI * freq + wavePhase)
    const secondary = Math.sin(progress * Math.PI * freq * 1.62 - wavePhase * 0.62) * 0.42
    const tertiary = Math.sin(progress * Math.PI * freq * 2.35 + wavePhase * 0.85) * 0.18

    let sample = (primary * 0.62 + secondary + tertiary) * motionGain * layer.amplitudeWeight
    target[index] = Math.max(-0.76, Math.min(0.76, sample))
  }

  smoothPoints(target, 2)
}

function drawHologramRibbonLayer(
  context: CanvasRenderingContext2D,
  wavePoints: Float32Array,
  width: number,
  centerY: number,
  waveAmplitude: number,
  ribbonDepth: number,
  layer: WaveLayerConfig,
) {
  for (let line = 0; line < layer.lineCount; line += 1) {
    const spread = (line / (layer.lineCount - 1) - 0.5) * 2
    const linePhaseShift = spread * 0.2
    const depth = layer.depthShift + spread * 0.16
    const centerWeight = 1 - Math.abs(spread)
    const alpha = 0.07 + centerWeight * 0.24
    const pathPoints: Array<{ x: number; y: number }> = []

    for (let index = 0; index < wavePoints.length; index += 1) {
      const progress = index / (wavePoints.length - 1)
      const x = progress * width
      const sample = wavePoints[index] ?? 0
      const twist =
        Math.sin(progress * Math.PI * 4 + linePhaseShift * 3 + layer.phaseOffset) * 0.05
      const y = centerY + (sample + twist) * waveAmplitude + depth * ribbonDepth

      pathPoints.push({ x, y })
    }

    context.strokeStyle = rgba(layer.rgb, alpha)
    context.lineWidth = 0.85 + centerWeight * 1.15
    context.shadowBlur = 0
    smoothWavePath(context, pathPoints)
    context.stroke()
  }
}

export function AudioVisualizer({ pointCount = 160, height = 240 }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sizeRef = useRef({ width: 0, height, dpr: 1 })
  const { analyser, isPlaying, currentTrack } = useAudioEngine()
  const animationRef = useRef<number | null>(null)
  const phaseRef = useRef(0)
  const smoothedEnergyRef = useRef<SmoothedEnergy>({ bass: 0.3, mid: 0.3, treble: 0.3, total: 0.3 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const frequencyData = new Uint8Array(analyser?.frequencyBinCount ?? pointCount)
    const waveBuffers = WAVE_LAYERS.map(() => new Float32Array(pointCount))
    const waveDrafts = WAVE_LAYERS.map(() => new Float32Array(pointCount))

    const drawFrame = (animateIdle: boolean) => {
      const { width, height: canvasHeight, dpr } = sizeRef.current
      if (width <= 0 || canvasHeight <= 0) return

      const centerY = canvasHeight / 2
      const hasLiveAudio = Boolean(analyser && isPlaying)
      const isActive = hasLiveAudio || animateIdle

      if (hasLiveAudio) {
        analyser!.getByteFrequencyData(frequencyData)
        const rawEnergy = getAudioEnergy(frequencyData)

        smoothedEnergyRef.current = {
          bass: smoothEnergy(smoothedEnergyRef.current.bass, rawEnergy.bass),
          mid: smoothEnergy(smoothedEnergyRef.current.mid, rawEnergy.mid),
          treble: smoothEnergy(smoothedEnergyRef.current.treble, rawEnergy.treble),
          total: smoothEnergy(smoothedEnergyRef.current.total, rawEnergy.total),
        }
      }

      const energy = hasLiveAudio
        ? smoothedEnergyRef.current
        : { bass: 0.32, mid: 0.32, treble: 0.32, total: 0.32 }

      if (isActive) {
        phaseRef.current += hasLiveAudio ? 0.055 + energy.total * 0.022 : 0.038
      }

      const liveScale = hasLiveAudio ? 0.82 + energy.total * 0.16 : 0.9
      const waveAmplitude = canvasHeight * 0.14 * liveScale
      const ribbonDepth = canvasHeight * 0.12 * liveScale

      WAVE_LAYERS.forEach((layer, layerIndex) => {
        const draft = waveDrafts[layerIndex]
        const buffer = waveBuffers[layerIndex]
        if (!draft || !buffer) return

        const layerEnergy = energy[layer.energyKey]
        const motionGain = !isActive
          ? 0.35
          : hasLiveAudio
            ? 0.62 + layerEnergy * 0.58 + energy.total * 0.12
            : 0.88

        buildWaveShape(pointCount, phaseRef.current, motionGain, layer, draft)

        for (let index = 0; index < pointCount; index += 1) {
          buffer[index] = lerp(buffer[index] ?? 0, draft[index] ?? 0, hasLiveAudio ? 0.5 : 1)
        }
      })

      context.setTransform(1, 0, 0, 1, 0, 0)
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)

      const background = context.createLinearGradient(0, 0, 0, canvasHeight)
      background.addColorStop(0, '#050a14')
      background.addColorStop(0.5, '#0a1525')
      background.addColorStop(1, '#050a14')
      context.fillStyle = background
      context.fillRect(0, 0, width, canvasHeight)

      const arcGlow = context.createRadialGradient(
        width / 2,
        centerY,
        0,
        width / 2,
        centerY,
        width * 0.48,
      )
      arcGlow.addColorStop(0, 'rgba(59, 130, 246, 0.14)')
      arcGlow.addColorStop(0.35, 'rgba(56, 189, 248, 0.06)')
      arcGlow.addColorStop(1, 'transparent')
      context.fillStyle = arcGlow
      context.fillRect(0, 0, width, canvasHeight)

      drawHudGrid(context, width, canvasHeight)
      drawHudFrame(context, width, canvasHeight)
      drawHudLabels(context, width, canvasHeight, phaseRef.current, energy, hasLiveAudio)

      context.save()
      context.globalCompositeOperation = 'source-over'
      context.lineCap = 'round'
      context.lineJoin = 'round'

      WAVE_LAYERS.forEach((layer, layerIndex) => {
        const buffer = waveBuffers[layerIndex]
        if (!buffer) return
        drawHologramRibbonLayer(context, buffer, width, centerY, waveAmplitude, ribbonDepth, layer)
      })

      context.restore()
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
  }, [analyser, isPlaying, pointCount])

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
    if (canvas.parentElement) {
      observer.observe(canvas.parentElement)
    }

    window.addEventListener('resize', resize)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', resize)
    }
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
