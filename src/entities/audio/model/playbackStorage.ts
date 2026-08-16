import type { PlayingMedia } from './types'

export const PLAYBACK_STORAGE_KEY = 'prism-playback'

export interface StoredPlayback {
  track: PlayingMedia
  currentTime: number
}

function isPlayingMedia(value: unknown): value is PlayingMedia {
  if (!value || typeof value !== 'object') return false
  const item = value as PlayingMedia
  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.artist === 'string' &&
    typeof item.audioUrl === 'string' &&
    (item.source === 'jamendo' || item.source === 'local')
  )
}

export function canPersistTrack(track: PlayingMedia): boolean {
  return !track.audioUrl.startsWith('blob:')
}

export function readStoredPlayback(): StoredPlayback | null {
  try {
    const raw = localStorage.getItem(PLAYBACK_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<StoredPlayback>
    if (!isPlayingMedia(parsed.track) || !canPersistTrack(parsed.track)) return null

    const currentTime = Number(parsed.currentTime)
    return {
      track: parsed.track,
      currentTime: Number.isFinite(currentTime) && currentTime > 0 ? currentTime : 0,
    }
  } catch {
    return null
  }
}

export function writeStoredPlayback(track: PlayingMedia | null, currentTime: number): void {
  try {
    if (!track || !canPersistTrack(track)) {
      localStorage.removeItem(PLAYBACK_STORAGE_KEY)
      return
    }

    const payload: StoredPlayback = {
      track,
      currentTime: Number.isFinite(currentTime) ? Math.max(0, currentTime) : 0,
    }
    localStorage.setItem(PLAYBACK_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore quota / private mode
  }
}
