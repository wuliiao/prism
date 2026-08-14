import { useCallback, useEffect } from 'react'
import type { Track } from '@entities/track'
import { useAudioEngine } from '@entities/audio'
import { usePlaylist } from '@features/manage-playlist'
import { UploadTrackButton } from '@features/upload-track'
import { IconMusic } from '@shared/ui/Icon'
import { useToast } from '@shared/ui/Toast'
import { AudioVisualizer } from '@widgets/audio-visualizer'
import { PlayerBar } from '@widgets/player-bar'
import { PlaylistPanel } from '@widgets/playlist-panel'
import { TrackSearchPanel } from '@widgets/track-search'

export function PlayerPage() {
  const { loadTrack, currentTrack, isPlaying, isLoading, error, clearError, registerOnTrackEnded } =
    useAudioEngine()
  const { showToast } = useToast()
  const {
    tracks,
    addTrack,
    addTracks,
    removeTrack,
    selectTrack,
    isInPlaylist,
    playNext,
    playPrevious,
  } = usePlaylist()

  const playTrack = useCallback(
    async (track: Track) => {
      selectTrack(track)
      await loadTrack(track)
    },
    [loadTrack, selectTrack],
  )

  const handleAddTrack = useCallback(
    async (track: Track) => {
      const result = addTrack(track)
      if (result === 'exists') {
        showToast('Already in playlist — playing', 'info')
      }
      await playTrack(track)
      if (result === 'added') {
        showToast(`Now playing: ${track.title}`, 'success')
      }
    },
    [addTrack, playTrack, showToast],
  )

  const handleUpload = useCallback(
    async (track: Track) => {
      await playTrack(track)
      showToast(`Uploaded: ${track.title}`, 'success')
    },
    [playTrack, showToast],
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
        const next = playNext()
        if (next) await loadTrack(next)
      })()
    })
  }, [loadTrack, playNext, registerOnTrackEnded])

  useEffect(() => {
    if (error) {
      showToast(error, 'error')
      clearError()
    }
  }, [clearError, error, showToast])

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-36 pt-6 sm:px-6 sm:pt-8">
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
        <UploadTrackButton onUpload={handleUpload} />
      </header>

      <section className="mb-8 grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
        <div className="flex flex-col items-center gap-4 lg:items-start">
          <div className="relative aspect-square w-full max-w-[280px]">
            {currentTrack?.coverUrl ? (
              <img
                src={currentTrack.coverUrl}
                alt=""
                className={`h-full w-full rounded-2xl object-cover shadow-2xl shadow-black/50 ring-1 ring-white/10 transition ${
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
          onAddTrack={handleAddTrack}
          onAddAll={addTracks}
          isInPlaylist={isInPlaylist}
        />
        <PlaylistPanel
          tracks={tracks}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onSelect={(track) => void playTrack(track)}
          onRemove={(track) => removeTrack(track.id)}
        />
      </div>

      <PlayerBar
        canNavigate={tracks.length > 0}
        onNext={() => void handleNext()}
        onPrevious={() => void handlePrevious()}
      />
    </div>
  )
}
