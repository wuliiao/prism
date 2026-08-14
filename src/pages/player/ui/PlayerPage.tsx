import { useCallback, useEffect, useRef } from 'react'
import type { Track } from '@entities/track'
import { useAudioEngine } from '@entities/audio'
import { usePlaylist } from '@features/manage-playlist'
import { UploadTrackButton } from '@features/upload-track'
import { IconMusic, IconPlus } from '@shared/ui/Icon'
import { useToast } from '@shared/ui/Toast'
import { useKeyboardShortcuts } from '@shared/lib/useKeyboardShortcuts'
import { AudioVisualizer } from '@widgets/audio-visualizer'
import { PlayerBar } from '@widgets/player-bar'
import { PlaylistPanel } from '@widgets/playlist-panel'
import { TrackSearchPanel } from '@widgets/track-search'

export function PlayerPage() {
  const { loadTrack, currentTrack, isPlaying, isLoading, error, clearError, registerOnTrackEnded, toggle, seek, currentTime } =
    useAudioEngine()
  const { showToast } = useToast()
  const {
    tracks,
    addTrack,
    addAndSelect,
    addTracks,
    removeTrack,
    selectTrack,
    isInPlaylist,
    playNext,
    playPrevious,
  } = usePlaylist({
    onStorageError: () => showToast("Playlist couldn't be saved on this device", 'error'),
  })

  const isPlaylistPlaybackRef = useRef(true)
  const queuedAfterRemoveRef = useRef<Track | null>(null)

  const playTrack = useCallback(
    async (track: Track) => {
      isPlaylistPlaybackRef.current = true
      selectTrack(track)
      await loadTrack(track)
    },
    [loadTrack, selectTrack],
  )

  const previewTrack = useCallback(
    async (track: Track) => {
      isPlaylistPlaybackRef.current = isInPlaylist(track.id)
      if (isInPlaylist(track.id)) {
        selectTrack(track)
      }
      await loadTrack(track)
    },
    [isInPlaylist, loadTrack, selectTrack],
  )

  const handleAddToPlaylist = useCallback(
    (track: Track) => {
      const result = addTrack(track)
      if (result === 'added') {
        showToast(`Added: ${track.title}`, 'success')
        if (currentTrack?.id === track.id) {
          isPlaylistPlaybackRef.current = true
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
      if (currentTrack?.id === track.id) {
        isPlaylistPlaybackRef.current = false
      }
      showToast(`Removed: ${track.title}`, 'info')
    },
    [currentTrack?.id, isInPlaylist, removeTrack, showToast],
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
      isPlaylistPlaybackRef.current = true
      await loadTrack(track)
      showToast(`Uploaded: ${track.title}`, 'success')
    },
    [addAndSelect, loadTrack, showToast],
  )

  const handleRemoveTrack = useCallback(
    (track: Track) => {
      const isCurrentlyPlaying = currentTrack?.id === track.id

      if (isCurrentlyPlaying) {
        const index = tracks.findIndex((item) => item.id === track.id)
        queuedAfterRemoveRef.current =
          index >= 0 && index < tracks.length - 1 ? tracks[index + 1] ?? null : null
        isPlaylistPlaybackRef.current = queuedAfterRemoveRef.current !== null
        removeTrack(track.id, { keepPlaying: true })
        return
      }

      removeTrack(track.id)
    },
    [currentTrack?.id, removeTrack, tracks],
  )

  const handleNext = useCallback(async () => {
    isPlaylistPlaybackRef.current = true
    const next = playNext()
    if (next) await loadTrack(next)
  }, [loadTrack, playNext])

  const handlePrevious = useCallback(async () => {
    isPlaylistPlaybackRef.current = true
    const previous = playPrevious()
    if (previous) await loadTrack(previous)
  }, [loadTrack, playPrevious])

  useEffect(() => {
    return registerOnTrackEnded(() => {
      void (async () => {
        if (queuedAfterRemoveRef.current) {
          const next = queuedAfterRemoveRef.current
          queuedAfterRemoveRef.current = null
          isPlaylistPlaybackRef.current = true
          selectTrack(next)
          await loadTrack(next)
          return
        }

        if (!isPlaylistPlaybackRef.current) return

        const next = playNext()
        if (next) await loadTrack(next)
      })()
    })
  }, [loadTrack, playNext, registerOnTrackEnded, selectTrack])

  useEffect(() => {
    if (error) {
      showToast(error, 'error')
      clearError()
    }
  }, [clearError, error, showToast])

  useKeyboardShortcuts({
    onTogglePlay: () => void toggle(),
    onSeekBackward: () => seek(Math.max(0, currentTime - 5)),
    onSeekForward: () => seek(currentTime + 5),
    enabled: Boolean(currentTrack),
  })

  const isPreviewMode = Boolean(currentTrack && !isInPlaylist(currentTrack.id))
  const canNavigate = tracks.length > 0 && !isPreviewMode

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-44 pt-6 sm:px-6 sm:pb-36 sm:pt-8">
      <p className="sr-only" aria-live="polite">
        {currentTrack
          ? `${isPlaying ? 'Playing' : 'Paused'}: ${currentTrack.title} by ${currentTrack.artist}`
          : 'No track selected'}
      </p>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30">
            <IconMusic className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gradient sm:text-3xl">
              Harmony Hub
            </h1>
            <p className="text-xs text-zinc-500 sm:text-sm">Listen. Visualize. Vibe.</p>
          </div>
        </div>
        <UploadTrackButton
          onUpload={handleUpload}
          onError={(message) => showToast(message, 'error')}
        />
      </header>

      <section className="mb-8 grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
        <div className="flex flex-col items-center gap-4 lg:items-start">
          <div className="relative aspect-square w-full max-w-[280px]">
            {currentTrack?.coverUrl ? (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className={`h-full w-full rounded-2xl object-cover shadow-2xl shadow-black/50 ring-1 ring-white/10 transition motion-reduce:transform-none ${
                  isPlaying ? 'scale-[1.02]' : ''
                } ${isLoading ? 'opacity-60' : ''}`}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-2xl ring-1 ring-white/10">
                <IconMusic className="h-16 w-16 text-zinc-600" />
              </div>
            )}
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-violet-400" />
              </div>
            ) : null}
            {currentTrack && !isLoading ? (
              isInPlaylist(currentTrack.id) ? (
                <button
                  type="button"
                  aria-label={`Remove ${currentTrack.title} from playlist`}
                  title="Remove from playlist"
                  className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/90 text-sm font-semibold text-white shadow-lg ring-2 ring-black/20 transition hover:bg-emerald-400 active:scale-95"
                  onClick={() => handleRemoveFromPlaylist(currentTrack)}
                >
                  ✓
                </button>
              ) : (
                <button
                  type="button"
                  aria-label={`Add ${currentTrack.title} to playlist`}
                  title="Add to playlist"
                  className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/90 text-white shadow-lg ring-2 ring-black/20 transition hover:bg-violet-400 active:scale-95"
                  onClick={() => handleAddToPlaylist(currentTrack)}
                >
                  <IconPlus className="h-5 w-5" />
                </button>
              )
            ) : null}
          </div>
          <div className="w-full text-center lg:text-left">
            <p className="truncate text-lg font-semibold text-zinc-100">
              {currentTrack?.title ?? 'Ready when you are'}
            </p>
            <p className="truncate text-sm text-zinc-400">
              {currentTrack?.artist ?? 'Explore tracks below'}
            </p>
            {currentTrack ? (
              <span className="mt-2 inline-block rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                {currentTrack.source}
              </span>
            ) : null}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 sm:p-5">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            Live visualizer
          </p>
          <AudioVisualizer height={220} />
        </div>
      </section>

      <div className="grid flex-1 gap-6 lg:grid-cols-2">
        <TrackSearchPanel
          onPreviewTrack={(track) => void previewTrack(track)}
          onAddTrack={handleAddToPlaylist}
          onRemoveFromPlaylist={handleRemoveFromPlaylist}
          onAddAll={handleAddAll}
          isInPlaylist={isInPlaylist}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
        />
        <PlaylistPanel
          tracks={tracks}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onSelect={(track) => void playTrack(track)}
          onRemove={(track) => handleRemoveTrack(track)}
        />
      </div>

      <PlayerBar
        canNavigate={canNavigate}
        onNext={() => void handleNext()}
        onPrevious={() => void handlePrevious()}
      />
    </div>
  )
}
