import { readJamendoCache, writeJamendoCache } from '../jamendoCache'
import type { Track } from '@entities/track'

const track: Track = {
  id: 'jamendo-1',
  title: 'Ocean',
  artist: 'Blue Sky',
  duration: 180,
  audioUrl: 'https://example.com/audio.mp3',
  source: 'jamendo',
}

describe('jamendoCache', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('round-trips tracks for the same query', () => {
    writeJamendoCache('Chill', [track])
    expect(readJamendoCache('chill')).toEqual([track])
  })

  it('does not return a cache for a different query', () => {
    writeJamendoCache('chill', [track])
    expect(readJamendoCache('ocean')).toBeNull()
  })

  it('ignores empty result lists', () => {
    writeJamendoCache('chill', [])
    expect(readJamendoCache('chill')).toBeNull()
  })
})
