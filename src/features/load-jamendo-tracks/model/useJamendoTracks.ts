import { useCallback, useState } from 'react'
import type { Track } from '@entities/track'
import { fetchJamendoTracks } from '../api/jamendoApi'
import { readJamendoCache, writeJamendoCache } from '../api/jamendoCache'

const UNAVAILABLE_MESSAGE = 'Jamendo catalog is temporarily unavailable. Try again in a moment.'
const UNAVAILABLE_CACHED_MESSAGE =
  'Jamendo catalog is temporarily unavailable. Showing last results.'

export function useJamendoTracks(initialQuery = 'chill') {
  const [tracks, setTracks] = useState<Track[]>(() => readJamendoCache(initialQuery) ?? [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (query: string) => {
    const normalized = query.trim()
    setIsLoading(true)
    setError(null)

    try {
      const results = await fetchJamendoTracks({ search: normalized })
      writeJamendoCache(normalized, results)
      setTracks(results)
    } catch (err) {
      const cached = readJamendoCache(normalized)
      if (cached && cached.length > 0) {
        setTracks(cached)
        setError(UNAVAILABLE_CACHED_MESSAGE)
      } else {
        setError(err instanceof Error ? err.message : UNAVAILABLE_MESSAGE)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { tracks, isLoading, error, search }
}
