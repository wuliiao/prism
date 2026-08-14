import { readStoredPlayback, writeStoredPlayback, canPersistTrack } from '../playbackStorage'
import type { PlayingMedia } from '../types'

describe('playbackStorage', () => {
  const track: PlayingMedia = {
    id: 'jamendo-1',
    title: 'Ocean',
    artist: 'Blue Sky',
    duration: 180,
    audioUrl: 'https://example.com/audio.mp3',
    source: 'jamendo',
  }

  beforeEach(() => {
    localStorage.clear()
  })

  it('round-trips a remote track and position', () => {
    writeStoredPlayback(track, 42)
    expect(readStoredPlayback()).toEqual({ track, currentTime: 42 })
  })

  it('does not persist local blob URLs', () => {
    writeStoredPlayback({ ...track, source: 'local', audioUrl: 'blob:http://localhost/abc' }, 10)
    expect(canPersistTrack({ ...track, audioUrl: 'blob:http://localhost/abc' })).toBe(false)
    expect(readStoredPlayback()).toBeNull()
  })

  it('clears storage when track is null', () => {
    writeStoredPlayback(track, 12)
    writeStoredPlayback(null, 0)
    expect(readStoredPlayback()).toBeNull()
  })
})
