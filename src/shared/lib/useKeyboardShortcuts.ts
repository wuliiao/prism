import { useEffect } from 'react'

interface KeyboardShortcutsOptions {
  onTogglePlay: () => void
  onSeekBackward: () => void
  onSeekForward: () => void
  enabled?: boolean
}

export function useKeyboardShortcuts({
  onTogglePlay,
  onSeekBackward,
  onSeekForward,
  enabled = true,
}: KeyboardShortcutsOptions): void {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      switch (event.code) {
        case 'Space':
          event.preventDefault()
          onTogglePlay()
          break
        case 'ArrowLeft':
          event.preventDefault()
          onSeekBackward()
          break
        case 'ArrowRight':
          event.preventDefault()
          onSeekForward()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, onSeekBackward, onSeekForward, onTogglePlay])
}
