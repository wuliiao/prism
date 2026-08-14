import { renderHook, act } from '@testing-library/react'
import type { Track } from '@entities/track'
import { usePlaylist } from '../usePlaylist'

const mockTrack: Track = {
  id: 'jamendo-1',
  title: 'Sunset Drive',
  artist: 'Neon Waves',
  duration: 210,
  audioUrl: 'https://example.com/track.mp3',
  source: 'jamendo',
}

const mockTrackTwo: Track = {
  id: 'jamendo-2',
  title: 'Night City',
  artist: 'Synth Wave',
  duration: 180,
  audioUrl: 'https://example.com/track-2.mp3',
  source: 'jamendo',
}

describe('usePlaylist', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('adds a unique track and reports exists on duplicate', () => {
    const { result } = renderHook(() => usePlaylist())

    act(() => {
      expect(result.current.addTrack(mockTrack)).toBe('added')
      expect(result.current.addTrack(mockTrack)).toBe('exists')
    })

    expect(result.current.tracks).toHaveLength(1)
    expect(result.current.isInPlaylist(mockTrack.id)).toBe(true)
  })

  it('returns how many tracks were added in bulk', () => {
    const { result } = renderHook(() => usePlaylist())

    act(() => {
      expect(result.current.addTracks([mockTrack, mockTrackTwo])).toBe(2)
      expect(result.current.addTracks([mockTrack, mockTrackTwo])).toBe(0)
    })

    expect(result.current.tracks).toHaveLength(2)
  })

  it('calls onStorageError when persistence fails', () => {
    const onStorageError = jest.fn()
    const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })

    const { result } = renderHook(() => usePlaylist({ onStorageError }))

    act(() => {
      result.current.addTrack(mockTrack)
    })

    expect(onStorageError).toHaveBeenCalledTimes(1)

    setItem.mockRestore()
  })

  it('updates duration for a local track after metadata loads', () => {
    const localTrack: Track = {
      ...mockTrack,
      id: 'local-1',
      source: 'local',
      duration: 0,
    }
    const { result } = renderHook(() => usePlaylist())

    act(() => {
      result.current.addTrack(localTrack)
      result.current.updateTrackDuration(localTrack.id, 187)
    })

    expect(result.current.tracks[0]?.duration).toBe(187)
  })

  it('drops local blob tracks after reload and notifies', () => {
    const localTrack: Track = {
      ...mockTrack,
      id: 'local-1',
      source: 'local',
      audioUrl: 'blob:http://localhost/abc',
    }
    localStorage.setItem('prism-playlist', JSON.stringify([mockTrack, localTrack]))
    const onDroppedLocalTracks = jest.fn()

    const { result } = renderHook(() => usePlaylist({ onDroppedLocalTracks }))

    expect(result.current.tracks).toEqual([mockTrack])
    expect(onDroppedLocalTracks).toHaveBeenCalledTimes(1)
    expect(JSON.parse(String(localStorage.getItem('prism-playlist')))).toEqual([mockTrack])
  })
})
