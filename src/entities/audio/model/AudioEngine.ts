import type { Track } from '@entities/track'

export class AudioEngine {
  private audio: HTMLAudioElement
  private context: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private sourceNode: MediaElementAudioSourceNode | null = null

  onTimeUpdate: ((currentTime: number) => void) | null = null
  onEnded: (() => void) | null = null
  onLoadedMetadata: ((duration: number) => void) | null = null

  constructor() {
    this.audio = new Audio()
    this.audio.crossOrigin = 'anonymous'
    this.audio.preload = 'auto'

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
      this.analyser.fftSize = 512
      this.analyser.smoothingTimeConstant = 0.62
      this.analyser.connect(this.context.destination)
    }
    return this.context
  }

  private ensureSourceConnected(): void {
    if (this.sourceNode) return

    const context = this.ensureContext()
    this.sourceNode = context.createMediaElementSource(this.audio)
    this.sourceNode.connect(this.analyser!)
  }

  private waitForCanPlay(): Promise<void> {
    if (this.audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      const cleanup = () => {
        this.audio.removeEventListener('canplay', onCanPlay)
        this.audio.removeEventListener('error', onError)
      }

      const onCanPlay = () => {
        cleanup()
        resolve()
      }

      const onError = () => {
        cleanup()
        reject(new Error('Failed to load audio'))
      }

      this.audio.addEventListener('canplay', onCanPlay)
      this.audio.addEventListener('error', onError)
    })
  }

  async loadTrack(track: Track): Promise<void> {
    this.pause()
    this.ensureSourceConnected()
    this.audio.src = track.audioUrl
    this.audio.load()
    await this.waitForCanPlay()
  }

  async play(): Promise<void> {
    const context = this.ensureContext()
    if (context.state === 'suspended') {
      await context.resume()
    }
    try {
      await this.audio.play()
    } catch (error) {
      throw error instanceof Error ? error : new Error('Playback failed')
    }
  }

  pause(): void {
    this.audio.pause()
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
  }
}
