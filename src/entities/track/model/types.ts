export type TrackSource = 'jamendo' | 'local'

export interface Track {
  id: string
  title: string
  artist: string
  duration: number
  audioUrl: string
  coverUrl?: string
  source: TrackSource
}

export interface JamendoTrackResponse {
  id: string
  name: string
  artist_name: string
  duration: number
  audio: string
  album_image: string
}

export interface JamendoApiResponse {
  headers: { status: string; code: number }
  results: JamendoTrackResponse[]
}
