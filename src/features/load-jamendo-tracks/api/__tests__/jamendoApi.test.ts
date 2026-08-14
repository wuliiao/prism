import { fetchJamendoTracks } from '../jamendoApi'

jest.mock('@shared/config', () => ({
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

function successBody(results: unknown[] = [oceanTrack]) {
  return {
    headers: { status: 'success', code: 0 },
    results,
  }
}

function internalErrorBody() {
  return {
    headers: { status: 'failed', code: 1, error_message: 'Internal Error' },
    results: [],
  }
}

describe('fetchJamendoTracks', () => {
  const fetchMock = jest.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    globalThis.fetch = fetchMock
  })

  it('searches by track name, not tags', async () => {
    fetchMock.mockReturnValue(jsonResponse(successBody()))

    const tracks = await fetchJamendoTracks({ search: 'ocean' })
    const url = new URL(String(fetchMock.mock.calls[0]?.[0]))

    expect(url.searchParams.get('namesearch')).toBe('ocean')
    expect(url.searchParams.has('tags')).toBe(false)
    expect(url.searchParams.has('search')).toBe(false)
    expect(tracks[0]?.title).toBe('Ocean')
  })

  it('uses tags for genre queries like chill', async () => {
    fetchMock.mockReturnValue(jsonResponse(successBody()))

    await fetchJamendoTracks({ search: 'chill' })
    const url = new URL(String(fetchMock.mock.calls[0]?.[0]))

    expect(url.searchParams.get('tags')).toBe('chill')
    expect(url.searchParams.has('search')).toBe(false)
  })

  it('retries Internal Error and returns tracks when Jamendo recovers', async () => {
    fetchMock
      .mockReturnValueOnce(jsonResponse(internalErrorBody()))
      .mockReturnValueOnce(jsonResponse(successBody()))

    const tracks = await fetchJamendoTracks({ search: 'ocean' })

    expect(tracks[0]?.title).toBe('Ocean')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('does not fan out extra searches after Internal Error', async () => {
    fetchMock.mockReturnValue(jsonResponse(internalErrorBody()))

    await expect(fetchJamendoTracks({ search: 'ocean' })).rejects.toThrow(
      'Jamendo is temporarily unavailable. Try another search in a moment.',
    )
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('falls back to artist name when title search is empty', async () => {
    fetchMock
      .mockReturnValueOnce(jsonResponse(successBody([])))
      .mockReturnValueOnce(jsonResponse(successBody()))

    const tracks = await fetchJamendoTracks({ search: 'Blue Sky' })
    const artistUrl = new URL(String(fetchMock.mock.calls[1]?.[0]))

    expect(tracks[0]?.artist).toBe('Blue Sky')
    expect(artistUrl.searchParams.get('artist_name')).toBe('Blue Sky')
  })
})
