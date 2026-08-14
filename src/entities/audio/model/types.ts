export interface PlayingMedia {
  id: string
  title: string
  artist: string
  duration: number
  audioUrl: string
  coverUrl?: string
  source: 'jamendo' | 'local'
  genre?: string
}
