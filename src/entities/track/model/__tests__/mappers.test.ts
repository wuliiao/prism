import { mapJamendoTrack, createLocalTrack } from '../mappers'

describe('track mappers', () => {
  it('maps Jamendo API track to domain model', () => {
    const track = mapJamendoTrack({
      id: '42',
      name: 'Ocean',
      artist_name: 'Blue Sky',
      duration: 180,
      audio: 'https://example.com/audio.mp3',
      album_image: 'https://example.com/image.jpg',
    })

    expect(track).toEqual({
      id: 'jamendo-42',
      title: 'Ocean',
      artist: 'Blue Sky',
      duration: 180,
      audioUrl: 'https://example.com/audio.mp3',
      coverUrl: 'https://example.com/image.jpg',
      source: 'jamendo',
      genre: undefined,
    })
  })

  it('maps Jamendo genre from musicinfo tags', () => {
    const track = mapJamendoTrack({
      id: '7',
      name: 'Night Drive',
      artist_name: 'Neon',
      duration: 200,
      audio: 'https://example.com/night.mp3',
      album_image: 'https://example.com/cover.jpg',
      musicinfo: { tags: { genres: ['Electronic'] } },
    })

    expect(track.genre).toBe('electronic')
  })

  it('creates local track from uploaded file', () => {
    const file = new File(['audio'], 'my-song.mp3', { type: 'audio/mpeg' })
    const track = createLocalTrack(file, 'blob:local')

    expect(track.title).toBe('my-song')
    expect(track.artist).toBe('Local file')
    expect(track.audioUrl).toBe('blob:local')
    expect(track.source).toBe('local')
  })
})
