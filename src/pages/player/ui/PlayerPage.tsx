import { useCallback, useEffect } from 'react'
import type { Track } from '@entities/track'
import { useAudioEngine } from '@entities/audio'
import { usePlaylist } from '@features/manage-playlist'
import { UploadTrackButton } from '@features/upload-track'
import { IconMusic } from '@shared/ui/Icon'
import { AudioVisualizer } from '@widgets/audio-visualizer'
import { PlayerBar } from '@widgets/player-bar'
import { PlaylistPanel } from '@widgets/playlist-panel'
import { TrackSearchPanel } from '@widgets/track-search'

export function PlayerPage() {
  const { loadTrack, currentTrack, isPlaying } = useAudioEngine()
  const {
    tracks,
    addTrack,
    addTracks,
    removeTrack,
    selectTrack,
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
    (track: Track) => {
      addTrack(track)
    },
    [addTrack],
  )

  const handleUpload = useCallback(
    async (track: Track) => {
      await playTrack(track)
    },
    [playTrack],
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
    const onEnded = async () => {
      const next = playNext()
      if (next) await loadTrack(next)
    }

    const engineEndedHandler = () => {
      void onEnded()
    }

    window.addEventListener('harmony-hub:track-ended', engineEndedHandler)
    return () => window.removeEventListener('harmony-hub:track-ended', engineEndedHandler)
  }, [loadTrack, playNext])

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
          {currentTrack?.coverUrl ? (
            <img
              src={currentTrack.coverUrl}
              alt=""
              className={`aspect-square w-full max-w-[280px] rounded-2xl object-cover shadow-2xl shadow-black/50 ring-1 ring-white/10 transition ${
                isPlaying ? 'scale-[1.02]' : ''
              }`}
            />
          ) : (
            <div className="flex aspect-square w-full max-w-[280px] items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-2xl ring-1 ring-white/10">
              <IconMusic className="h-16 w-16 text-zinc-600" />
            </div>
          )}
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
        <TrackSearchPanel onAddTrack={handleAddTrack} onAddAll={addTracks} />
        <PlaylistPanel
          tracks={tracks}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onSelect={(track) => void playTrack(track)}
          onRemove={(track) => removeTrack(track.id)}
        />
      </div>

      <PlayerBar onNext={() => void handleNext()} onPrevious={() => void handlePrevious()} />
    </div>
  )
}
