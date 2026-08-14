import { useCallback, useEffect, useRef, useState } from 'react'
import type { Track } from '@entities/track'

const STORAGE_KEY = 'prism-playlist'
const INDEX_STORAGE_KEY = 'prism-playlist-index'
const REPEAT_STORAGE_KEY = 'prism-repeat'
const SHUFFLE_STORAGE_KEY = 'prism-shuffle'

export type AddTrackResult = 'added' | 'exists'
export type RepeatMode = 'off' | 'all' | 'one'

function readStoredIndex(tracks: Track[]): number {
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

function readStoredRepeat(): RepeatMode {
  try {
    const raw = localStorage.getItem(REPEAT_STORAGE_KEY)
    if (raw === 'off' || raw === 'all' || raw === 'one') return raw
  } catch {
    // ignore quota / private mode
  }
  return 'all'
}

function readStoredShuffle(): boolean {
  try {
    return localStorage.getItem(SHUFFLE_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function pickShuffledIndex(length: number, currentIndex: number): number {
  if (length <= 1) return 0
  let next = currentIndex
  while (next === currentIndex) {
    next = Math.floor(Math.random() * length)
  }
  return next
}

interface UsePlaylistOptions {
  onStorageError?: () => void
  onDroppedLocalTracks?: () => void
}

function canRestoreTrack(track: Track): boolean {
  return track.source !== 'local' && !track.audioUrl.startsWith('blob:')
}

function readStoredPlaylist(): { tracks: Track[]; droppedLocal: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { tracks: [], droppedLocal: false }

    const parsed = JSON.parse(raw) as Track[]
    if (!Array.isArray(parsed)) return { tracks: [], droppedLocal: false }

    const tracks = parsed.filter(canRestoreTrack)
    return { tracks, droppedLocal: tracks.length !== parsed.length }
  } catch {
    return { tracks: [], droppedLocal: false }
  }
}

export function usePlaylist(options?: UsePlaylistOptions) {
  const onStorageError = options?.onStorageError
  const onDroppedLocalTracks = options?.onDroppedLocalTracks
  const restoredRef = useRef(readStoredPlaylist())
  const notifiedDropRef = useRef(false)
  const [tracks, setTracks] = useState<Track[]>(() => restoredRef.current.tracks)
  const [currentIndex, setCurrentIndex] = useState(() => readStoredIndex(restoredRef.current.tracks))
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(readStoredRepeat)
  const [shuffle, setShuffle] = useState(readStoredShuffle)

  useEffect(() => {
    try {
      localStorage.setItem(INDEX_STORAGE_KEY, String(currentIndex))
    } catch {
      // ignore quota / private mode
    }
  }, [currentIndex])

  useEffect(() => {
    try {
      localStorage.setItem(REPEAT_STORAGE_KEY, repeatMode)
    } catch {
      // ignore quota / private mode
    }
  }, [repeatMode])

  useEffect(() => {
    try {
      localStorage.setItem(SHUFFLE_STORAGE_KEY, String(shuffle))
    } catch {
      // ignore quota / private mode
    }
  }, [shuffle])

  const persist = useCallback((next: Track[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      onStorageError?.()
    }
  }, [onStorageError])

  useEffect(() => {
    if (!restoredRef.current.droppedLocal || notifiedDropRef.current) return
    notifiedDropRef.current = true
    persist(restoredRef.current.tracks)
    onDroppedLocalTracks?.()
  }, [onDroppedLocalTracks, persist])

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

  const updateTrackDuration = useCallback((trackId: string, duration: number) => {
    if (!Number.isFinite(duration) || duration <= 0) return

    setTracks((prev) => {
      const index = prev.findIndex((track) => track.id === trackId)
      if (index < 0) return prev
      const current = prev[index]
      if (!current || current.duration === duration) return prev
      const next = [...prev]
      next[index] = { ...current, duration }
      persist(next)
      return next
    })
  }, [persist])

  const isInPlaylist = useCallback(
    (trackId: string) => tracks.some((track) => track.id === trackId),
    [tracks],
  )

  const cycleRepeat = useCallback(() => {
    setRepeatMode((current) => (current === 'off' ? 'all' : current === 'all' ? 'one' : 'off'))
  }, [])

  const toggleShuffle = useCallback(() => {
    setShuffle((current) => !current)
  }, [])

  const playNext = useCallback((): Track | null => {
    if (tracks.length === 0) return null

    if (shuffle && tracks.length > 1) {
      const nextIndex = pickShuffledIndex(tracks.length, currentIndex)
      setCurrentIndex(nextIndex)
      return tracks[nextIndex] ?? null
    }

    if (currentIndex < tracks.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      return tracks[nextIndex] ?? null
    }

    if (repeatMode === 'off') return null

    setCurrentIndex(0)
    return tracks[0] ?? null
  }, [tracks, currentIndex, shuffle, repeatMode])

  const playPrevious = useCallback((): Track | null => {
    if (tracks.length === 0) return null

    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      setCurrentIndex(prevIndex)
      return tracks[prevIndex] ?? null
    }

    if (repeatMode === 'off') return null

    const lastIndex = tracks.length - 1
    setCurrentIndex(lastIndex)
    return tracks[lastIndex] ?? null
  }, [tracks, currentIndex, repeatMode])

  const playOnEnded = useCallback((): Track | null => {
    if (repeatMode === 'one') {
      return currentIndex >= 0 ? tracks[currentIndex] ?? null : null
    }
    return playNext()
  }, [repeatMode, currentIndex, tracks, playNext])

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
    updateTrackDuration,
    isInPlaylist,
    playNext,
    playPrevious,
    playOnEnded,
    repeatMode,
    shuffle,
    cycleRepeat,
    toggleShuffle,
  }
}
