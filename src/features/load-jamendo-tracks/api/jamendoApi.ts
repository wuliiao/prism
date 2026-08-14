import { env } from '@shared/config'
import type { JamendoApiResponse, Track } from '@entities/track'
import { mapJamendoTrack } from '@entities/track'

const JAMENDO_BASE = 'https://api.jamendo.com/v3.0'
const INTERNAL_ERROR_PATTERN = /internal error/i

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

function isInternalError(error: unknown) {
  return error instanceof Error && INTERNAL_ERROR_PATTERN.test(error.message)
}

function jamendoErrorMessage(data: JamendoApiResponse) {
  const details = data.headers.error_message?.trim()
  if (details) return details
  return `Jamendo API error: ${data.headers.status}`
}

function toUserFacingError(error: unknown) {
  if (isInternalError(error)) {
    return new Error('Jamendo catalog is temporarily unavailable. Try again in a moment.')
  }
  return error instanceof Error ? error : new Error('Failed to load tracks')
}

function retryPauseMs(attempt: number) {
  if ('jest' in globalThis) return 0
  return 400 * attempt
}

async function wait(ms: number) {
  if (ms <= 0) return
  await new Promise((resolve) => setTimeout(resolve, ms))
}

function searchStrategies(query: string): Record<string, string>[] {
  if (!query) {
    return [{ boost: 'popularity_month' }]
  }

  if (isMoodQuery(query)) {
    return [{ tags: query }, { fuzzytags: query }, { namesearch: query }]
  }

  return [{ namesearch: query }, { artist_name: query }, { fuzzytags: query }]
}

async function requestTracks(
  limit: number,
  extra: Record<string, string>,
  includeMusicInfo: boolean,
): Promise<Track[]> {
  const params = new URLSearchParams({
    client_id: env.jamendoClientId,
    format: 'json',
    limit: String(limit),
    audioformat: 'mp32',
    ...extra,
  })

  if (includeMusicInfo) {
    params.set('include', 'musicinfo')
  }

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

async function requestTracksStable(
  limit: number,
  extra: Record<string, string>,
): Promise<Track[]> {
  try {
    return await requestTracks(limit, extra, true)
  } catch (error) {
    if (!isInternalError(error)) throw error
    await wait(retryPauseMs(1))

    try {
      return await requestTracks(limit, extra, true)
    } catch (retryError) {
      if (!isInternalError(retryError)) throw retryError
      await wait(retryPauseMs(2))
      return requestTracks(limit, extra, false)
    }
  }
}

export async function fetchJamendoTracks({
  search = '',
  limit = 12,
}: FetchJamendoTracksParams = {}): Promise<Track[]> {
  if (!env.jamendoClientId) {
    throw new Error('Jamendo client ID is not configured. Set VITE_JAMENDO_CLIENT_ID in .env')
  }

  const strategies = searchStrategies(search.trim())
  let lastError: unknown

  for (const extra of strategies) {
    try {
      const results = await requestTracksStable(limit, extra)
      if (results.length > 0) return results
    } catch (error) {
      lastError = error
      if (isInternalError(error)) {
        throw toUserFacingError(error)
      }
      throw error
    }
  }

  if (lastError) throw toUserFacingError(lastError)
  return []
}
