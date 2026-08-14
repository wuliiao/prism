import { useCallback, useState } from 'react'
import type { Track } from '@entities/track'

const STORAGE_KEY = 'harmony-hub-playlist'

export type AddTrackResult = 'added' | 'exists'

function readStoredPlaylist(): Track[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Track[]
  } catch {
    return []
  }
}

export function usePlaylist() {
  const [tracks, setTracks] = useState<Track[]>(() => readStoredPlaylist())
  const [currentIndex, setCurrentIndex] = useState(-1)

  const persist = useCallback((next: Track[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // quota exceeded — keep in memory only
    }
  }, [])

  const addTrack = useCallback((track: Track): AddTrackResult => {
    let result: AddTrackResult = 'exists'
    setTracks((prev) => {
      if (prev.some((item) => item.id === track.id)) return prev
      result = 'added'
      const next = [...prev, track]
      persist(next)
      return next
    })
    return result
  }, [persist])

  const addTracks = useCallback((newTracks: Track[]): number => {
    let addedCount = 0
    setTracks((prev) => {
      const ids = new Set(prev.map((track) => track.id))
      const unique = newTracks.filter((track) => !ids.has(track.id))
      addedCount = unique.length
      if (unique.length === 0) return prev
      const next = [...prev, ...unique]
      persist(next)
      return next
    })
    return addedCount
  }, [persist])

  const removeTrack = useCallback((trackId: string, options?: { keepPlaying?: boolean }) => {
    setTracks((prev) => {
      const index = prev.findIndex((track) => track.id === trackId)
      const next = prev.filter((track) => track.id !== trackId)

      if (!options?.keepPlaying) {
        setCurrentIndex((current) => {
          if (index === -1) return current
          if (current === index) return next.length === 0 ? -1 : Math.min(current, next.length - 1)
          if (current > index) return current - 1
          return current
        })
      }

      persist(next)
      return next
    })
  }, [persist])

  const selectTrack = useCallback((track: Track) => {
    setTracks((prev) => {
      const index = prev.findIndex((item) => item.id === track.id)
      if (index >= 0) setCurrentIndex(index)
      return prev
    })
  }, [])

  const addAndSelect = useCallback((track: Track): AddTrackResult => {
    let result: AddTrackResult = 'exists'
    setTracks((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === track.id)
      if (existingIndex >= 0) {
        setCurrentIndex(existingIndex)
        return prev
      }
      result = 'added'
      const next = [...prev, track]
      setCurrentIndex(next.length - 1)
      persist(next)
      return next
    })
    return result
  }, [persist])

  const isInPlaylist = useCallback(
    (trackId: string) => tracks.some((track) => track.id === trackId),
    [tracks],
  )

  const playNext = useCallback((): Track | null => {
    if (tracks.length === 0) return null
    const nextIndex = currentIndex < tracks.length - 1 ? currentIndex + 1 : 0
    setCurrentIndex(nextIndex)
    return tracks[nextIndex] ?? null
  }, [tracks, currentIndex])

  const playPrevious = useCallback((): Track | null => {
    if (tracks.length === 0) return null
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : tracks.length - 1
    setCurrentIndex(prevIndex)
    return tracks[prevIndex] ?? null
  }, [tracks, currentIndex])

  const currentTrack = currentIndex >= 0 ? tracks[currentIndex] ?? null : null

  return {
    tracks,
    currentTrack,
    currentIndex,
    addTrack,
    addTracks,
    removeTrack,
    selectTrack,
    addAndSelect,
    isInPlaylist,
    playNext,
    playPrevious,
  }
}
