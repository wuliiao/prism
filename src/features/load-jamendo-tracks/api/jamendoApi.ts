import { env } from '@shared/config'
import type { JamendoApiResponse, Track } from '@entities/track'
import { mapJamendoTrack } from '@entities/track'

const JAMENDO_BASE = 'https://api.jamendo.com/v3.0'

const MOOD_QUERIES = new Set([
  'ambient',
  'blues',
  'chill',
  'classical',
  'electronic',
  'folk',
  'funk',
  'guitar',
  'hip-hop',
  'hiphop',
  'house',
  'indie',
  'jazz',
  'lo-fi',
  'lofi',
  'metal',
  'piano',
  'pop',
  'rock',
  'soul',
  'techno',
])

export interface FetchJamendoTracksParams {
  search?: string
  limit?: number
}

function isMoodQuery(query: string) {
  return MOOD_QUERIES.has(query.trim().toLowerCase())
}

function jamendoErrorMessage(data: JamendoApiResponse) {
  const details = data.headers.error_message?.trim()
  if (details) return details
  return `Jamendo API error: ${data.headers.status}`
}

async function requestTracks(
  limit: number,
  extra: Record<string, string>,
): Promise<Track[]> {
  const params = new URLSearchParams({
    client_id: env.jamendoClientId,
    format: 'json',
    limit: String(limit),
    audioformat: 'mp32',
    include: 'musicinfo',
    ...extra,
  })

  const response = await fetch(`${JAMENDO_BASE}/tracks/?${params.toString()}`)

  if (!response.ok) {
    throw new Error(`Jamendo API error: ${response.status}`)
  }

  const data = (await response.json()) as JamendoApiResponse

  if (data.headers.code !== 0) {
    throw new Error(jamendoErrorMessage(data))
  }

  return data.results.map(mapJamendoTrack)
}

async function requestTracksWithRetry(
  limit: number,
  extra: Record<string, string>,
): Promise<Track[]> {
  try {
    return await requestTracks(limit, extra)
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (!message.toLowerCase().includes('internal error')) {
      throw error
    }
    return requestTracks(limit, extra)
  }
}

export async function fetchJamendoTracks({
  search = '',
  limit = 12,
}: FetchJamendoTracksParams = {}): Promise<Track[]> {
  if (!env.jamendoClientId) {
    throw new Error('Jamendo client ID is not configured. Set VITE_JAMENDO_CLIENT_ID in .env')
  }

  const query = search.trim()
  if (!query) {
    return requestTracksWithRetry(limit, { order: 'popularity_month' })
  }

  const primary: Record<string, string> = isMoodQuery(query)
    ? { fuzzytags: query }
    : { namesearch: query }
  const fallback: Record<string, string> = isMoodQuery(query)
    ? { namesearch: query }
    : { fuzzytags: query }

  try {
    const results = await requestTracksWithRetry(limit, primary)
    if (results.length > 0) return results
  } catch (error) {
    try {
      return await requestTracksWithRetry(limit, fallback)
    } catch {
      throw error
    }
  }

  return requestTracksWithRetry(limit, fallback)
}
