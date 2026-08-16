import { useCallback, useEffect, useRef } from 'react'
import type { Track } from '@entities/track'
import { useAudioEngine } from '@entities/audio'
import { usePlaylist } from '@features/manage-playlist'
import { useToast } from '@shared/ui/Toast'
import { useKeyboardShortcuts } from '@shared/lib'

export function usePlayerPage() {
  const { loadTrack, currentTrack, isPlaying, isLoading, error, clearError, registerOnTrackEnded, toggle, seek, currentTime, duration, toggleMute } =
    useAudioEngine()
  const { showToast } = useToast()
  const {
    tracks,
    addTrack,
    addAndSelect,
    addTracks,
    removeTrack,
    selectTrack,
    updateTrackDuration,
    isInPlaylist,
    playNext,
    playPrevious,
    playOnEnded,
    repeatMode,
    shuffle,
    cycleRepeat,
    toggleShuffle,
  } = usePlaylist({
    onStorageError: () => showToast("Playlist couldn't be saved on this device", 'error'),
    onDroppedLocalTracks: () =>
      showToast('Local files were removed after refresh. Import them again.', 'info'),
  })

  const queuedAfterRemoveRef = useRef<Track | null>(null)
  const currentTrackRef = useRef(currentTrack)
  currentTrackRef.current = currentTrack

  const playTrack = useCallback(
    async (track: Track) => {
      selectTrack(track, { restartShuffle: true })
      await loadTrack(track)
    },
    [loadTrack, selectTrack],
  )

  const handleAddToPlaylist = useCallback(
    (track: Track) => {
      const result = addTrack(track)
      if (result === 'added') {
        showToast(`Added: ${track.title}`, 'success')
        if (currentTrack?.id === track.id) {
          selectTrack(track)
        }
      } else {
        showToast('Already in playlist', 'info')
      }
    },
    [addTrack, currentTrack?.id, selectTrack, showToast],
  )

  const handleRemoveFromPlaylist = useCallback(
    (track: Track) => {
      if (!isInPlaylist(track.id)) return

      removeTrack(track.id)
      showToast(`Removed: ${track.title}`, 'info')
    },
    [isInPlaylist, removeTrack, showToast],
  )

  const handleAddAll = useCallback(
    (newTracks: Track[]) => {
      const addedCount = addTracks(newTracks)
      if (addedCount > 0) {
        showToast(`Added ${addedCount} track${addedCount === 1 ? '' : 's'} to playlist`, 'success')
      } else {
        showToast('All tracks are already in playlist', 'info')
      }
    },
    [addTracks, showToast],
  )

  const handleUpload = useCallback(
    async (track: Track) => {
      addAndSelect(track)
      await loadTrack(track)
      showToast(`Uploaded: ${track.title}`, 'success')
    },
    [addAndSelect, loadTrack, showToast],
  )

  const handleUploadError = useCallback(
    (message: string) => showToast(message, 'error'),
    [showToast],
  )

  const handleRemoveTrack = useCallback(
    (track: Track) => {
      const isCurrentlyPlaying = currentTrack?.id === track.id

      if (isCurrentlyPlaying) {
        const index = tracks.findIndex((item) => item.id === track.id)
        queuedAfterRemoveRef.current =
          index >= 0 && index < tracks.length - 1 ? tracks[index + 1] ?? null : null
        removeTrack(track.id, { keepPlaying: true })
        return
      }

      removeTrack(track.id)
    },
    [currentTrack?.id, removeTrack, tracks],
  )

  const handleNext = useCallback(async () => {
    const next = playNext()
    if (next) await loadTrack(next)
  }, [loadTrack, playNext])

  const handlePrevious = useCallback(async () => {
    const previous = playPrevious()
    if (previous) await loadTrack(previous)
  }, [loadTrack, playPrevious])

  useEffect(() => {
    return registerOnTrackEnded(() => {
      void (async () => {
        if (queuedAfterRemoveRef.current) {
          const next = queuedAfterRemoveRef.current
          queuedAfterRemoveRef.current = null
          selectTrack(next)
          await loadTrack(next)
          return
        }

        const next = playOnEnded(currentTrackRef.current)
        if (next) await loadTrack(next)
      })()
    })
  }, [loadTrack, playOnEnded, registerOnTrackEnded, selectTrack])

  useEffect(() => {
    if (error) {
      showToast(error, 'error')
      clearError()
    }
  }, [clearError, error, showToast])

  useEffect(() => {
    if (!currentTrack) return
    if (isInPlaylist(currentTrack.id)) {
      selectTrack(currentTrack)
    }
  }, [currentTrack, isInPlaylist, selectTrack])

  useEffect(() => {
    if (!currentTrack || currentTrack.source !== 'local') return
    if (!Number.isFinite(duration) || duration <= 0) return
    updateTrackDuration(currentTrack.id, duration)
  }, [currentTrack, duration, updateTrackDuration])

  useKeyboardShortcuts({
    onTogglePlay: () => void toggle(),
    onSeekBackward: () => seek(Math.max(0, currentTime - 5)),
    onSeekForward: () => seek(currentTime + 5),
    onNext: () => void handleNext(),
    onPrevious: () => void handlePrevious(),
    onMute: toggleMute,
    enabled: Boolean(currentTrack),
  })

  return {
    currentTrack,
    isPlaying,
    isLoading,
    tracks,
    isInPlaylist,
    canNavigate: tracks.length > 0,
    coverInPlaylist: Boolean(currentTrack && isInPlaylist(currentTrack.id)),
    playTrack,
    handleAddToPlaylist,
    handleRemoveFromPlaylist,
    handleAddAll,
    handleUpload,
    handleUploadError,
    handleRemoveTrack,
    handleNext,
    handlePrevious,
    shuffle,
    repeatMode,
    toggleShuffle,
    cycleRepeat,
  }
}
