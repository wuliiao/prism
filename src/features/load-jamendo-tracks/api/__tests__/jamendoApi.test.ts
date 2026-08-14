import { fetchJamendoTracks } from '../jamendoApi'

jest.mock('@shared/config/env', () => ({
  env: { jamendoClientId: 'test-client' },
}))

const oceanTrack = {
  id: '42',
  name: 'Ocean',
  artist_name: 'Blue Sky',
  duration: 180,
  audio: 'https://example.com/audio.mp3',
  album_image: 'https://example.com/image.jpg',
}

function jsonResponse(body: unknown) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(body),
  }) as Promise<Response>
}

describe('fetchJamendoTracks', () => {
  const fetchMock = jest.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    globalThis.fetch = fetchMock
  })

  it('searches by track name, not tags', async () => {
    fetchMock.mockReturnValue(
      jsonResponse({
        headers: { status: 'success', code: 0 },
        results: [oceanTrack],
      }),
    )

    const tracks = await fetchJamendoTracks({ search: 'ocean' })
    const url = new URL(String(fetchMock.mock.calls[0]?.[0]))

    expect(url.searchParams.get('namesearch')).toBe('ocean')
    expect(url.searchParams.has('tags')).toBe(false)
    expect(url.searchParams.has('search')).toBe(false)
    expect(tracks[0]?.title).toBe('Ocean')
  })

  it('uses fuzzy mood tags for genre queries like chill', async () => {
    fetchMock.mockReturnValue(
      jsonResponse({
        headers: { status: 'success', code: 0 },
        results: [oceanTrack],
      }),
    )

    await fetchJamendoTracks({ search: 'chill' })
    const url = new URL(String(fetchMock.mock.calls[0]?.[0]))

    expect(url.searchParams.get('fuzzytags')).toBe('chill')
    expect(url.searchParams.has('tags')).toBe(false)
  })

  it('surfaces Jamendo error_message instead of generic failed', async () => {
    fetchMock.mockReturnValue(
      jsonResponse({
        headers: { status: 'failed', code: 1, error_message: 'Internal Error' },
        results: [],
      }),
    )

    await expect(fetchJamendoTracks({ search: 'ocean' })).rejects.toThrow('Internal Error')
  })
})
