import { useCallback, useEffect, useRef, useState } from 'react'
import type { Track } from '@entities/track'
import {
  readStoredIndex,
  readStoredPlaylist,
  readStoredRepeat,
  readStoredShuffle,
  writeStoredIndex,
  writeStoredPlaylist,
  writeStoredRepeat,
  writeStoredShuffle,
  type AddTrackResult,
  type RepeatMode,
} from '../lib/playlistStorage'
import { createShuffleQueue } from '../lib/shuffleQueue'

export type { AddTrackResult, RepeatMode }

interface UsePlaylistOptions {
  onStorageError?: () => void
  onDroppedLocalTracks?: () => void
}

export function usePlaylist(options?: UsePlaylistOptions) {
  const onStorageError = options?.onStorageError
  const onDroppedLocalTracks = options?.onDroppedLocalTracks
  const restoredRef = useRef(readStoredPlaylist())
  const notifiedDropRef = useRef(false)
  const shuffleQueueRef = useRef(createShuffleQueue())
  const currentIndexRef = useRef(-1)
  const [tracks, setTracks] = useState<Track[]>(() => restoredRef.current.tracks)
  const [currentIndex, setCurrentIndex] = useState(() => readStoredIndex(restoredRef.current.tracks))
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(readStoredRepeat)
  const [shuffle, setShuffle] = useState(readStoredShuffle)
  currentIndexRef.current = currentIndex

  useEffect(() => {
    writeStoredIndex(currentIndex)
  }, [currentIndex])

  useEffect(() => {
    writeStoredRepeat(repeatMode)
  }, [repeatMode])

  useEffect(() => {
    writeStoredShuffle(shuffle)
  }, [shuffle])

  const playlistIds = tracks.map((track) => track.id).join('\0')

  useEffect(() => {
    const queue = shuffleQueueRef.current
    if (!shuffle) {
      queue.clear()
      return
    }
    queue.reset(tracks.length, currentIndexRef.current)
  }, [playlistIds, shuffle, tracks.length])

  const persist = useCallback((next: Track[]) => {
    if (!writeStoredPlaylist(next)) onStorageError?.()
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

  const selectTrack = useCallback((track: Track, options?: { restartShuffle?: boolean }) => {
    setTracks((prev) => {
      const index = prev.findIndex((item) => item.id === track.id)
      if (index >= 0) {
        setCurrentIndex(index)
        if (shuffle && options?.restartShuffle) shuffleQueueRef.current.reset(prev.length, index)
      }
      return prev
    })
  }, [shuffle])

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

    if (shuffle) {
      if (tracks.length === 1) {
        return repeatMode === 'off' ? null : tracks[0] ?? null
      }

      const nextIndex = shuffleQueueRef.current.takeNext(currentIndex, tracks.length, repeatMode === 'off')
      if (nextIndex === null) return null
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

    if (shuffle) {
      if (tracks.length === 1) {
        return repeatMode === 'off' ? null : tracks[0] ?? null
      }

      const prevIndex = shuffleQueueRef.current.takePrevious(currentIndex, tracks.length, repeatMode === 'off')
      if (prevIndex === null) return null
      setCurrentIndex(prevIndex)
      return tracks[prevIndex] ?? null
    }

    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      setCurrentIndex(prevIndex)
      return tracks[prevIndex] ?? null
    }

    if (repeatMode === 'off') return null

    const lastIndex = tracks.length - 1
    setCurrentIndex(lastIndex)
    return tracks[lastIndex] ?? null
  }, [tracks, currentIndex, shuffle, repeatMode])

  const playOnEnded = useCallback((endedTrack?: Track | null): Track | null => {
    if (repeatMode === 'one') {
      if (endedTrack) return endedTrack
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
