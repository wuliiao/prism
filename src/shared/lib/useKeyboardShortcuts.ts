import { useEffect } from 'react'

interface KeyboardShortcutsOptions {
  onTogglePlay: () => void
  onSeekBackward: () => void
  onSeekForward: () => void
  onNext?: () => void
  onPrevious?: () => void
  onMute?: () => void
  enabled?: boolean
}

export function useKeyboardShortcuts({
  onTogglePlay,
  onSeekBackward,
  onSeekForward,
  onNext,
  onPrevious,
  onMute,
  enabled = true,
}: KeyboardShortcutsOptions): void {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      if (!(target instanceof HTMLElement)) return
      if (target.isContentEditable) return
      if (target.closest('input, textarea, select, button, [role="button"]')) return

      switch (event.code) {
        case 'Space':
          event.preventDefault()
          onTogglePlay()
          break
        case 'ArrowLeft':
          event.preventDefault()
          if (event.shiftKey) onPrevious?.()
          else onSeekBackward()
          break
        case 'ArrowRight':
          event.preventDefault()
          if (event.shiftKey) onNext?.()
          else onSeekForward()
          break
        case 'KeyM':
          event.preventDefault()
          onMute?.()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, onMute, onNext, onPrevious, onSeekBackward, onSeekForward, onTogglePlay])
}
