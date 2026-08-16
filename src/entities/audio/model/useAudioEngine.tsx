import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AudioEngine } from './AudioEngine'
import type { PlayingMedia } from './types'
import { readStoredPlayback, writeStoredPlayback } from './playbackStorage'
import { readStoredVolume, writeStoredVolume } from './volumeStorage'

interface LoadTrackOptions {
  autoplay?: boolean
  startAt?: number
}

interface AudioEngineContextValue {
  currentTrack: PlayingMedia | null
  isPlaying: boolean
  isLoading: boolean
  error: string | null
  currentTime: number
  duration: number
  volume: number
  analyser: AnalyserNode | null
  loadTrack: (track: PlayingMedia, options?: LoadTrackOptions) => Promise<void>
  play: () => Promise<void>
  pause: () => void
  toggle: () => void
  seek: (seconds: number) => void
  setVolume: (value: number) => void
  toggleMute: () => void
  clearError: () => void
  registerOnTrackEnded: (handler: () => void) => () => void
}

const AudioEngineContext = createContext<AudioEngineContextValue | null>(null)

export function AudioEngineProvider({ children }: { children: ReactNode }) {
  const engineRef = useRef<AudioEngine | null>(null)
  const onTrackEndedRef = useRef<(() => void) | null>(null)
  const activeBlobUrlRef = useRef<string | null>(null)
  const loadRequestRef = useRef(0)
  const lastPersistAtRef = useRef(0)
  const currentTrackRef = useRef<PlayingMedia | null>(null)
  const currentTimeRef = useRef(0)
  const [currentTrack, setCurrentTrack] = useState<PlayingMedia | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(() => readStoredVolume())
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const lastAudibleVolumeRef = useRef(readStoredVolume() || 0.8)
  const volumeRef = useRef(volume)
  volumeRef.current = volume

  useEffect(() => {
    const engine = new AudioEngine()
    engineRef.current = engine
    engine.setVolume(readStoredVolume())
    setAnalyser(engine.getAnalyser())

    engine.onTimeUpdate = (time) => {
      currentTimeRef.current = time
      setCurrentTime(time)
      setIsPlaying(!engine.isPaused())

      const now = Date.now()
      if (now - lastPersistAtRef.current >= 2000) {
        lastPersistAtRef.current = now
        writeStoredPlayback(currentTrackRef.current, time)
      }
    }
    engine.onEnded = () => {
      setIsPlaying(false)
      onTrackEndedRef.current?.()
    }
    engine.onLoadedMetadata = (trackDuration) => {
      setDuration(trackDuration)
    }

    return () => {
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current)
        activeBlobUrlRef.current = null
      }
      engine.destroy()
      engineRef.current = null
    }
  }, [])

  const loadTrack = useCallback(async (track: PlayingMedia, options?: LoadTrackOptions) => {
    const engine = engineRef.current
    if (!engine) return

    const requestId = ++loadRequestRef.current
    const autoplay = options?.autoplay !== false
    const startAt = options?.startAt ?? 0

    if (activeBlobUrlRef.current && activeBlobUrlRef.current !== track.audioUrl) {
      URL.revokeObjectURL(activeBlobUrlRef.current)
      activeBlobUrlRef.current = null
    }

    if (track.audioUrl.startsWith('blob:')) {
      activeBlobUrlRef.current = track.audioUrl
    }

    setIsLoading(true)
    setError(null)

    try {
      await engine.load(track.audioUrl)
      if (requestId !== loadRequestRef.current) return

      currentTrackRef.current = track
      setCurrentTrack(track)
      if (startAt > 0) {
        engine.seek(startAt)
        currentTimeRef.current = startAt
        setCurrentTime(startAt)
      } else {
        currentTimeRef.current = 0
        setCurrentTime(0)
      }
      setDuration(track.duration || engine.getDuration())
      setAnalyser(engine.getAnalyser())
      writeStoredPlayback(track, startAt)

      if (!autoplay) {
        setIsPlaying(false)
        return
      }

      await engine.play()
      if (requestId !== loadRequestRef.current) return

      setIsPlaying(true)
    } catch {
      if (requestId !== loadRequestRef.current) return

      setError("Couldn't play this track. Try another one or upload a local file.")
      setIsPlaying(false)
    } finally {
      if (requestId === loadRequestRef.current) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    const stored = readStoredPlayback()
    if (!stored) return
    void loadTrack(stored.track, { autoplay: false, startAt: stored.currentTime })
  }, [loadTrack])

  useEffect(() => {
    const persist = () => writeStoredPlayback(currentTrackRef.current, currentTimeRef.current)
    window.addEventListener('pagehide', persist)
    return () => window.removeEventListener('pagehide', persist)
  }, [])

  const play = useCallback(async () => {
    const engine = engineRef.current
    if (!engine) return

    setError(null)
    try {
      await engine.play()
      setIsPlaying(true)
    } catch {
      setError("Couldn't start playback.")
      setIsPlaying(false)
    }
  }, [])

  const pause = useCallback(() => {
    engineRef.current?.pause()
    setIsPlaying(false)
    writeStoredPlayback(currentTrackRef.current, currentTimeRef.current)
  }, [])

  const toggle = useCallback(async () => {
    const engine = engineRef.current
    if (!engine) return

    if (engine.isPaused()) {
      await play()
    } else {
      pause()
    }
  }, [pause, play])

  const seek = useCallback((seconds: number) => {
    engineRef.current?.seek(seconds)
    currentTimeRef.current = seconds
    setCurrentTime(seconds)
    writeStoredPlayback(currentTrackRef.current, seconds)
  }, [])

  const setVolume = useCallback((value: number) => {
    const next = Math.min(1, Math.max(0, value))
    engineRef.current?.setVolume(next)
    setVolumeState(next)
    if (next > 0) lastAudibleVolumeRef.current = next
    writeStoredVolume(next)
  }, [])

  const toggleMute = useCallback(() => {
    if (volumeRef.current > 0) {
      lastAudibleVolumeRef.current = volumeRef.current
      setVolume(0)
      return
    }
    setVolume(lastAudibleVolumeRef.current || 0.8)
  }, [setVolume])

  const clearError = useCallback(() => setError(null), [])

  const registerOnTrackEnded = useCallback((handler: () => void) => {
    onTrackEndedRef.current = handler
    return () => {
      if (onTrackEndedRef.current === handler) {
        onTrackEndedRef.current = null
      }
    }
  }, [])

  const value = useMemo(
    () => ({
      currentTrack,
      isPlaying,
      isLoading,
      error,
      currentTime,
      duration,
      volume,
      analyser,
      loadTrack,
      play,
      pause,
      toggle,
      seek,
      setVolume,
      toggleMute,
      clearError,
      registerOnTrackEnded,
    }),
    [
      currentTrack,
      isPlaying,
      isLoading,
      error,
      currentTime,
      duration,
      volume,
      analyser,
      loadTrack,
      play,
      pause,
      toggle,
      seek,
      setVolume,
      toggleMute,
      clearError,
      registerOnTrackEnded,
    ],
  )

  return (
    <AudioEngineContext.Provider value={value}>{children}</AudioEngineContext.Provider>
  )
}

export function useAudioEngine(): AudioEngineContextValue {
  const context = useContext(AudioEngineContext)
  if (!context) {
    throw new Error('useAudioEngine must be used within AudioEngineProvider')
  }
  return context
}
