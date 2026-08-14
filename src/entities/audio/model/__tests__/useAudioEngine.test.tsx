import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { AudioEngineProvider, useAudioEngine } from '../useAudioEngine'
import { PLAYBACK_STORAGE_KEY } from '../playbackStorage'
import type { PlayingMedia } from '../types'

const track: PlayingMedia = {
  id: 'jamendo-1',
  title: 'Ocean',
  artist: 'Blue Sky',
  duration: 180,
  audioUrl: 'https://example.com/ocean.mp3',
  source: 'jamendo',
}

const otherTrack: PlayingMedia = {
  ...track,
  id: 'jamendo-2',
  title: 'Forest',
  audioUrl: 'https://example.com/forest.mp3',
}

function wrapper({ children }: { children: ReactNode }) {
  return <AudioEngineProvider>{children}</AudioEngineProvider>
}

describe('useAudioEngine', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.mocked(HTMLMediaElement.prototype.play).mockClear()
  })

  it('loadTrack sets the current track, starts playback, and persists it', async () => {
    const { result } = renderHook(() => useAudioEngine(), { wrapper })

    await act(async () => {
      await result.current.loadTrack(track)
    })

    expect(result.current.currentTrack).toEqual(track)
    expect(result.current.isPlaying).toBe(true)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.currentTime).toBe(0)
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled()
    expect(JSON.parse(String(localStorage.getItem(PLAYBACK_STORAGE_KEY)))).toEqual({
      track,
      currentTime: 0,
    })
  })

  it('lets the latest loadTrack win when switching tracks', async () => {
    const { result } = renderHook(() => useAudioEngine(), { wrapper })

    await act(async () => {
      await result.current.loadTrack(track)
      await result.current.loadTrack(otherTrack)
    })

    expect(result.current.currentTrack?.id).toBe(otherTrack.id)
    expect(result.current.currentTrack?.title).toBe('Forest')
  })

  it('restores the saved track after refresh without autoplay', async () => {
    localStorage.setItem(
      PLAYBACK_STORAGE_KEY,
      JSON.stringify({ track, currentTime: 42 }),
    )

    const { result } = renderHook(() => useAudioEngine(), { wrapper })

    await waitFor(() => {
      expect(result.current.currentTrack).toEqual(track)
    })

    expect(result.current.isPlaying).toBe(false)
    expect(result.current.currentTime).toBe(42)
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled()
  })
})
