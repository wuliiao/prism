import { env } from '@shared/config/env'
import type { JamendoApiResponse } from '@entities/track'
import { mapJamendoTrack } from '@entities/track'
import type { Track } from '@entities/track'

const JAMENDO_BASE = 'https://api.jamendo.com/v3.0'

export interface FetchJamendoTracksParams {
  search?: string
  limit?: number
}

export async function fetchJamendoTracks({
  search = '',
  limit = 12,
}: FetchJamendoTracksParams = {}): Promise<Track[]> {
  if (!env.jamendoClientId) {
    throw new Error('Jamendo client ID is not configured. Set VITE_JAMENDO_CLIENT_ID in .env')
  }

  const params = new URLSearchParams({
    client_id: env.jamendoClientId,
    format: 'json',
    limit: String(limit),
    audioformat: 'mp32',
    include: 'musicinfo',
  })

  const query = search.trim()
  if (query) {
    params.set('search', query)
  }

  const response = await fetch(`${JAMENDO_BASE}/tracks/?${params.toString()}`)

  if (!response.ok) {
    throw new Error(`Jamendo API error: ${response.status}`)
  }

  const data = (await response.json()) as JamendoApiResponse

  if (data.headers.code !== 0) {
    throw new Error(`Jamendo API error: ${data.headers.status}`)
  }

  return data.results.map(mapJamendoTrack)
}
