import { useCallback, useState } from 'react'
import type { Track } from '@entities/track'
import { fetchJamendoTracks } from '../api/jamendoApi'

export function useJamendoTracks() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (query: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const results = await fetchJamendoTracks({ search: query.trim() })
      setTracks(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tracks')
      setTracks([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { tracks, isLoading, error, search }
}
