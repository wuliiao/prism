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
}

const AudioEngineContext = createContext<AudioEngineContextValue | null>(null)

export function AudioEngineProvider({ children }: { children: ReactNode }) {
  const engineRef = useRef<AudioEngine | null>(null)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.8)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)

  useEffect(() => {
    const engine = new AudioEngine()
    engineRef.current = engine
    engine.setVolume(0.8)
    setAnalyser(engine.getAnalyser())

    engine.onTimeUpdate = (time) => {
      setCurrentTime(time)
      setIsPlaying(!engine.isPaused())
    }
    engine.onEnded = () => {
      setIsPlaying(false)
      window.dispatchEvent(new CustomEvent('harmony-hub:track-ended'))
    }
    engine.onLoadedMetadata = (trackDuration) => {
      setDuration(trackDuration)
    }

    return () => {
      engine.destroy()
      engineRef.current = null
    }
  }, [])

  const loadTrack = useCallback(async (track: Track) => {
    const engine = engineRef.current
    if (!engine) return

    await engine.loadTrack(track)
    setCurrentTrack(track)
    setCurrentTime(0)
    setDuration(track.duration || engine.getDuration())
    setAnalyser(engine.getAnalyser())
    await engine.play()
    setIsPlaying(true)
  }, [])

  const play = useCallback(async () => {
    const engine = engineRef.current
    if (!engine) return
    await engine.play()
    setIsPlaying(true)
  }, [])

  const pause = useCallback(() => {
    engineRef.current?.pause()
    setIsPlaying(false)
  }, [])

  const toggle = useCallback(() => {
    const engine = engineRef.current
    if (!engine) return
    engine.toggle()
    setIsPlaying(!engine.isPaused())
  }, [])

  const seek = useCallback((seconds: number) => {
    engineRef.current?.seek(seconds)
    setCurrentTime(seconds)
  }, [])

  const setVolume = useCallback((value: number) => {
    engineRef.current?.setVolume(value)
    setVolumeState(value)
  }, [])

  const value = useMemo(
    () => ({
      currentTrack,
      isPlaying,
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
    }),
    [
      currentTrack,
      isPlaying,
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
