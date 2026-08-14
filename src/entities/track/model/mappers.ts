import type { JamendoTrackResponse, Track } from './types'

export function mapJamendoTrack(raw: JamendoTrackResponse): Track {
  return {
    id: `jamendo-${raw.id}`,
    title: raw.name,
    artist: raw.artist_name,
    duration: raw.duration,
    audioUrl: raw.audio,
    coverUrl: raw.album_image,
    source: 'jamendo',
  }
}

export function createLocalTrack(file: File, objectUrl: string): Track {
  return {
    id: `local-${crypto.randomUUID()}`,
    title: file.name.replace(/\.[^.]+$/, ''),
    artist: 'Local file',
    duration: 0,
    audioUrl: objectUrl,
    source: 'local',
  }
}
