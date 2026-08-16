import type { Track } from '@entities/track'

export const JAMENDO_CACHE_KEY = 'prism-jamendo-cache'

interface JamendoCache {
  query: string
  tracks: Track[]
}

function normalizeQuery(query: string) {
  return query.trim().toLowerCase()
}

function isTrack(value: unknown): value is Track {
  if (!value || typeof value !== 'object') return false
  const track = value as Track
  return (
    typeof track.id === 'string' &&
    typeof track.title === 'string' &&
    typeof track.audioUrl === 'string' &&
    !track.audioUrl.startsWith('blob:')
  )
}

export function readJamendoCache(query: string): Track[] | null {
  try {
    const raw = localStorage.getItem(JAMENDO_CACHE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<JamendoCache>
    if (normalizeQuery(parsed.query ?? '') !== normalizeQuery(query)) return null
    if (!Array.isArray(parsed.tracks) || parsed.tracks.length === 0) return null
    if (!parsed.tracks.every(isTrack)) return null

    return parsed.tracks
  } catch {
    return null
  }
}

export function writeJamendoCache(query: string, tracks: Track[]): void {
  try {
    if (tracks.length === 0) return
    const payload: JamendoCache = { query: normalizeQuery(query), tracks }
    localStorage.setItem(JAMENDO_CACHE_KEY, JSON.stringify(payload))
  } catch {
    // ignore quota / private mode
  }
}
