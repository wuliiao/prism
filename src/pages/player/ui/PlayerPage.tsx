import { useCallback, useEffect } from 'react'
import type { Track } from '@entities/track'
import { useAudioEngine } from '@entities/audio'
import { usePlaylist } from '@features/manage-playlist'
import { UploadTrackButton } from '@features/upload-track'
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

    // Auto-advance handled via audio engine ended callback in provider would be cleaner,
    // but we wire it here through a custom event from the page orchestration layer.
    const engineEndedHandler = () => {
      void onEnded()
    }

    window.addEventListener('harmony-hub:track-ended', engineEndedHandler)
    return () => window.removeEventListener('harmony-hub:track-ended', engineEndedHandler)
  }, [loadTrack, playNext])

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Harmony Hub</h1>
          <p className="text-sm text-zinc-400">
            Music player with real-time Web Audio visualizer
          </p>
        </div>
        <UploadTrackButton onUpload={handleUpload} />
      </header>

      <AudioVisualizer />

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
