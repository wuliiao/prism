import { HUD_CYAN, HUD_GOLD } from './oscilloscope'

function waveValue(sample: number) {
  return Math.tanh(sample)
}

export function drawHudFrame(context: CanvasRenderingContext2D, width: number, height: number) {
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

export function drawHudLabels(
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

export function buildWavePath(
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
