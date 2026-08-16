import type { Track } from '@entities/track'

export type RepeatMode = 'off' | 'all' | 'one'
export type AddTrackResult = 'added' | 'exists'

export const PLAYLIST_STORAGE_KEY = 'prism-playlist'
export const INDEX_STORAGE_KEY = 'prism-playlist-index'
export const REPEAT_STORAGE_KEY = 'prism-repeat'
export const SHUFFLE_STORAGE_KEY = 'prism-shuffle'

function canRestoreTrack(track: Track): boolean {
  return track.source !== 'local' && !track.audioUrl.startsWith('blob:')
}

export function readStoredIndex(tracks: Track[]): number {
  try {
    const raw = localStorage.getItem(INDEX_STORAGE_KEY)
    if (raw == null) return -1
    const index = Number(raw)
    if (!Number.isInteger(index) || index < 0 || index >= tracks.length) return -1
    return index
  } catch {
    return -1
  }
}

export function readStoredRepeat(): RepeatMode {
  try {
    const raw = localStorage.getItem(REPEAT_STORAGE_KEY)
    if (raw === 'off' || raw === 'all' || raw === 'one') return raw
  } catch {
    // ignore quota / private mode
  }
  return 'all'
}

export function readStoredShuffle(): boolean {
  try {
    return localStorage.getItem(SHUFFLE_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function readStoredPlaylist(): { tracks: Track[]; droppedLocal: boolean } {
  try {
    const raw = localStorage.getItem(PLAYLIST_STORAGE_KEY)
    if (!raw) return { tracks: [], droppedLocal: false }

    const parsed = JSON.parse(raw) as Track[]
    if (!Array.isArray(parsed)) return { tracks: [], droppedLocal: false }

    const tracks = parsed.filter(canRestoreTrack)
    return { tracks, droppedLocal: tracks.length !== parsed.length }
  } catch {
    return { tracks: [], droppedLocal: false }
  }
}

export function writeStoredPlaylist(tracks: Track[]): boolean {
  try {
    localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(tracks))
    return true
  } catch {
    return false
  }
}

export function writeStoredIndex(index: number): void {
  try {
    localStorage.setItem(INDEX_STORAGE_KEY, String(index))
  } catch {
    // ignore quota / private mode
  }
}

export function writeStoredRepeat(repeatMode: RepeatMode): void {
  try {
    localStorage.setItem(REPEAT_STORAGE_KEY, repeatMode)
  } catch {
    // ignore quota / private mode
  }
}

export function writeStoredShuffle(shuffle: boolean): void {
  try {
    localStorage.setItem(SHUFFLE_STORAGE_KEY, String(shuffle))
  } catch {
    // ignore quota / private mode
  }
}
