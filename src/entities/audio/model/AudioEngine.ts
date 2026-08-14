import type { Track } from '@entities/track'

export class AudioEngine {
  private audio: HTMLAudioElement
  private context: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private sourceNode: MediaElementAudioSourceNode | null = null
  private connectedUrl: string | null = null

  onTimeUpdate: ((currentTime: number) => void) | null = null
  onEnded: (() => void) | null = null
  onLoadedMetadata: ((duration: number) => void) | null = null

  constructor() {
    this.audio = new Audio()
    this.audio.crossOrigin = 'anonymous'
    this.audio.preload = 'metadata'

    this.audio.addEventListener('timeupdate', () => {
      this.onTimeUpdate?.(this.audio.currentTime)
    })
    this.audio.addEventListener('ended', () => {
      this.onEnded?.()
    })
    this.audio.addEventListener('loadedmetadata', () => {
      this.onLoadedMetadata?.(this.audio.duration)
    })
  }

  private ensureContext(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext()
      this.analyser = this.context.createAnalyser()
      this.analyser.fftSize = 256
      this.analyser.connect(this.context.destination)
    }
    return this.context
  }

  private connectSource(url: string): void {
    if (this.connectedUrl === url) return

    const context = this.ensureContext()

    if (this.sourceNode) {
      this.sourceNode.disconnect()
      this.sourceNode = null
    }

    this.sourceNode = context.createMediaElementSource(this.audio)
    this.sourceNode.connect(this.analyser!)
    this.connectedUrl = url
  }

  async loadTrack(track: Track): Promise<void> {
    this.pause()
    this.audio.src = track.audioUrl
    this.connectSource(track.audioUrl)
    this.audio.load()
  }

  async play(): Promise<void> {
    const context = this.ensureContext()
    if (context.state === 'suspended') {
      await context.resume()
    }
    await this.audio.play()
  }

  pause(): void {
    this.audio.pause()
  }

  toggle(): void {
    if (this.audio.paused) {
      void this.play()
    } else {
      this.pause()
    }
  }

  seek(seconds: number): void {
    this.audio.currentTime = seconds
  }

  setVolume(value: number): void {
    this.audio.volume = Math.min(1, Math.max(0, value))
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser
  }

  getCurrentTime(): number {
    return this.audio.currentTime
  }

  getDuration(): number {
    return this.audio.duration || 0
  }

  isPaused(): boolean {
    return this.audio.paused
  }

  destroy(): void {
    this.pause()
    this.audio.src = ''
    this.sourceNode?.disconnect()
    void this.context?.close()
    this.context = null
    this.analyser = null
    this.sourceNode = null
    this.connectedUrl = null
  }
}
