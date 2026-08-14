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
import type { Track } from '@entities/track'
import { AudioEngine } from './AudioEngine'

interface AudioEngineContextValue {
  currentTrack: Track | null
  isPlaying: boolean
  isLoading: boolean
  error: string | null
  currentTime: number
  duration: number
  volume: number
  analyser: AnalyserNode | null
  loadTrack: (track: Track) => Promise<void>
  play: () => Promise<void>
  pause: () => void
  toggle: () => void
  seek: (seconds: number) => void
  setVolume: (value: number) => void
  clearError: () => void
  registerOnTrackEnded: (handler: () => void) => () => void
}

const AudioEngineContext = createContext<AudioEngineContextValue | null>(null)

const VOLUME_STORAGE_KEY = 'harmony-hub-volume'

function readStoredVolume(): number {
  try {
    const raw = localStorage.getItem(VOLUME_STORAGE_KEY)
    if (!raw) return 0.8
    const value = Number(raw)
    return Number.isFinite(value) && value >= 0 && value <= 1 ? value : 0.8
  } catch {
    return 0.8
  }
}

export function AudioEngineProvider({ children }: { children: ReactNode }) {
  const engineRef = useRef<AudioEngine | null>(null)
  const onTrackEndedRef = useRef<(() => void) | null>(null)
  const activeBlobUrlRef = useRef<string | null>(null)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(() => readStoredVolume())
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)

  useEffect(() => {
    const engine = new AudioEngine()
    engineRef.current = engine
    engine.setVolume(readStoredVolume())
    setAnalyser(engine.getAnalyser())

    engine.onTimeUpdate = (time) => {
      setCurrentTime(time)
      setIsPlaying(!engine.isPaused())
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

  const loadTrack = useCallback(async (track: Track) => {
    const engine = engineRef.current
    if (!engine) return

    if (isLoading) return

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
      await engine.loadTrack(track)
      setCurrentTrack(track)
      setCurrentTime(0)
      setDuration(track.duration || engine.getDuration())
      setAnalyser(engine.getAnalyser())
      await engine.play()
      setIsPlaying(true)
    } catch {
      setError("Couldn't play this track. Try another one or upload a local file.")
      setIsPlaying(false)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

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
    setCurrentTime(seconds)
  }, [])

  const setVolume = useCallback((value: number) => {
    engineRef.current?.setVolume(value)
    setVolumeState(value)
    try {
      localStorage.setItem(VOLUME_STORAGE_KEY, String(value))
    } catch {
      // ignore storage failures for volume
    }
  }, [])

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
