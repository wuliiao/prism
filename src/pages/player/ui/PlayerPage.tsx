import { UploadTrackButton } from '@features/upload-track'
import { IconCheck, IconPlus } from '@shared/ui/Icon'
import { AudioVisualizer } from '@widgets/audio-visualizer'
import { PlayerBar } from '@widgets/player-bar'
import { PlaylistPanel } from '@widgets/playlist-panel'
import { TrackSearchPanel } from '@widgets/track-search'
import { usePlayerPage } from '../model/usePlayerPage'

export function PlayerPage() {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    tracks,
    isInPlaylist,
    canNavigate,
    coverInPlaylist,
    playTrack,
    previewTrack,
    handleAddToPlaylist,
    handleRemoveFromPlaylist,
    handleAddAll,
    handleUpload,
    handleUploadError,
    handleRemoveTrack,
    handleNext,
    handlePrevious,
  } = usePlayerPage()

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
        <UploadTrackButton onUpload={handleUpload} onError={handleUploadError} />
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
                className={`hud-action absolute bottom-3 right-3 ${coverInPlaylist ? 'hud-action-active' : ''}`}
                onClick={() =>
                  coverInPlaylist
                    ? handleRemoveFromPlaylist(currentTrack)
                    : handleAddToPlaylist(currentTrack)
                }
              >
                {coverInPlaylist ? <IconCheck className="h-4 w-4" /> : <IconPlus className="h-4 w-4" />}
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
          onRemove={handleRemoveTrack}
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
