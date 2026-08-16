export const VOLUME_STORAGE_KEY = 'prism-volume'

export function readStoredVolume(): number {
  try {
    const raw = localStorage.getItem(VOLUME_STORAGE_KEY)
    if (!raw) return 0.8
    const value = Number(raw)
    return Number.isFinite(value) && value >= 0 && value <= 1 ? value : 0.8
  } catch {
    return 0.8
  }
}

export function writeStoredVolume(value: number): void {
  try {
    localStorage.setItem(VOLUME_STORAGE_KEY, String(value))
  } catch {
    // ignore storage failures for volume
  }
}
