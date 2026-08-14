import { useCallback, useEffect, useRef } from 'react'
import type { Track } from '@entities/track'
import { useAudioEngine } from '@entities/audio'
import { usePlaylist } from '@features/manage-playlist'
import { UploadTrackButton } from '@features/upload-track'
import { IconPlus } from '@shared/ui/Icon'
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
  const coverInPlaylist = Boolean(currentTrack && isInPlaylist(currentTrack.id))

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-44 pt-6 sm:px-6 sm:pb-36 sm:pt-8">
      <p className="sr-only" aria-live="polite">
        {currentTrack
          ? `${isPlaying ? 'Playing' : 'Paused'}: ${currentTrack.title} by ${currentTrack.artist}`
          : 'No track selected'}
      </p>

      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src="/logo.png"
            alt="PRISM logo"
            className="h-14 w-14 shrink-0 rounded-full object-cover drop-shadow-[0_0_16px_rgb(56_189_248/45%)]"
          />
          <div>
            <p className="hud-label mb-0.5">Stark Industries</p>
            <h1 className="text-2xl font-bold tracking-tight text-gradient sm:text-3xl">PRISM</h1>
            <p className="font-mono text-[10px] uppercase tracking-widest text-sky-400/45">
              Personal Reactive Interactive Sound Matrix
            </p>
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
                className={`h-full w-full rounded-lg border border-sky-400/25 object-cover shadow-[0_8px_40px_rgb(0_0_0/50%),0_0_40px_rgb(56_189_248/8%)] transition motion-reduce:transform-none ${
                  isPlaying ? 'scale-[1.02]' : ''
                } ${isLoading ? 'opacity-60' : ''}`}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <img
                  src="/logo.png"
                  alt=""
                  aria-hidden
                  className="h-36 w-36 rounded-full object-cover opacity-40 drop-shadow-[0_0_32px_rgb(56_189_248/35%)]"
                />
              </div>
            )}
            <span className="hud-corners" aria-hidden />
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-[#050a14]/40 backdrop-blur-[2px]">
                <span className="h-10 w-10 animate-spin rounded-full border-2 border-sky-400/20 border-t-sky-400" />
              </div>
            ) : null}
            {currentTrack && !isLoading ? (
              <button
                type="button"
                aria-label={
                  coverInPlaylist
                    ? `Remove ${currentTrack.title} from playlist`
                    : `Add ${currentTrack.title} to playlist`
                }
                title={coverInPlaylist ? 'Remove from playlist' : 'Add to playlist'}
                className={
                  coverInPlaylist
                    ? 'absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#d4af5f]/40 bg-[#d4af5f]/90 font-mono text-sm font-semibold text-[#0a1525] shadow-[0_0_16px_rgb(212_175_95/35%)] transition hover:bg-[#e8c878] active:scale-95'
                    : 'absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full border border-sky-300/40 bg-sky-500/90 text-white shadow-[0_0_16px_rgb(56_189_248/35%)] transition hover:bg-sky-400 active:scale-95'
                }
                onClick={() =>
                  coverInPlaylist
                    ? handleRemoveFromPlaylist(currentTrack)
                    : handleAddToPlaylist(currentTrack)
                }
              >
                {coverInPlaylist ? '✓' : <IconPlus className="h-5 w-5" />}
              </button>
            ) : null}
          </div>
          <div className="w-full text-center lg:text-left">
            <p className="truncate font-mono text-[10px] uppercase tracking-widest text-sky-400/50">
              Now playing
            </p>
            <p className="truncate text-lg font-semibold text-sky-50">
              {currentTrack?.title ?? 'Awaiting signal'}
            </p>
            <p className="truncate font-mono text-sm text-sky-300/60">
              {currentTrack?.artist ?? 'Select track from Search or queue'}
            </p>
            {currentTrack ? (
              <span className="mt-2 inline-block rounded border border-sky-400/20 bg-sky-500/8 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-sky-300/70">
                {currentTrack.source}
              </span>
            ) : null}
          </div>
        </div>

        <div className="glass-panel rounded-lg p-4 sm:p-5">
          <p className="hud-label mb-3">PRISM // Audio analysis</p>
          <AudioVisualizer height={240} />
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
