export type TrackSource = 'jamendo' | 'local'

export interface Track {
  id: string
  title: string
  artist: string
  duration: number
  audioUrl: string
  coverUrl?: string
  source: TrackSource
  genre?: string
}

export interface JamendoTrackResponse {
  id: string
  name: string
  artist_name: string
  duration: number
  audio: string
  album_image: string
  musicinfo?: {
    tags?: {
      genres?: string[]
    }
  }
}

export interface JamendoApiResponse {
  headers: { status: string; code: number; error_message?: string }
  results: JamendoTrackResponse[]
}
