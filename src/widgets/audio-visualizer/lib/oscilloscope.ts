export const HUD_CYAN = 'rgba(56, 189, 248, 0.7)'
export const HUD_GOLD = 'rgba(212, 175, 95, 0.7)'
export const IDLE_POINTS = 160
export const DISPLAY_RATIO = 0.5
export const WAVE_FOLLOW = 0.06

const TRIGGER_THRESHOLD = 0.015
const TRIGGER_LOCK_WINDOW = 48

export function lerp(current: number, target: number, amount: number) {
  return current + (target - current) * amount
}

export function averageEnergy(spectrum: Uint8Array) {
  if (spectrum.length === 0) return 0
  let sum = 0
  let peak = 0
  for (const value of spectrum) {
    sum += value
    peak = Math.max(peak, value)
  }
  return Math.min(1, (sum / spectrum.length / 255) * 0.7 + (peak / 255) * 0.3)
}

export function peakAbs(samples: Float32Array) {
  let peak = 0
  for (const value of samples) {
    peak = Math.max(peak, Math.abs(value))
  }
  return peak
}

export function restorePeak(samples: Float32Array, targetPeak: number) {
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

export function copyOscilloscopeWindow(
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

export function fillIdleWave(samples: Float32Array, phase: number) {
  const last = samples.length - 1
  for (let index = 0; index <= last; index += 1) {
    const progress = last === 0 ? 0 : index / last
    samples[index] = Math.sin(progress * Math.PI * 2.4 + phase) * 0.22
  }
}
