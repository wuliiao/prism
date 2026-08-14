import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts } from '../useKeyboardShortcuts'

function press(code: string, target: EventTarget = document.body, shiftKey = false) {
  target.dispatchEvent(
    new KeyboardEvent('keydown', { code, bubbles: true, cancelable: true, shiftKey }),
  )
}

describe('useKeyboardShortcuts', () => {
  it('toggles playback from the page, but not when a button is focused', () => {
    const onTogglePlay = jest.fn()
    renderHook(() =>
      useKeyboardShortcuts({
        onTogglePlay,
        onSeekBackward: jest.fn(),
        onSeekForward: jest.fn(),
      }),
    )

    press('Space')
    expect(onTogglePlay).toHaveBeenCalledTimes(1)

    const button = document.createElement('button')
    document.body.appendChild(button)
    press('Space', button)
    expect(onTogglePlay).toHaveBeenCalledTimes(1)
    button.remove()
  })

  it('mutes with M and skips tracks with Shift+Arrow', () => {
    const onMute = jest.fn()
    const onNext = jest.fn()
    const onPrevious = jest.fn()
    const onSeekForward = jest.fn()

    renderHook(() =>
      useKeyboardShortcuts({
        onTogglePlay: jest.fn(),
        onSeekBackward: jest.fn(),
        onSeekForward,
        onMute,
        onNext,
        onPrevious,
      }),
    )

    press('KeyM')
    press('ArrowRight', document.body, true)
    press('ArrowLeft', document.body, true)
    press('ArrowRight')

    expect(onMute).toHaveBeenCalledTimes(1)
    expect(onNext).toHaveBeenCalledTimes(1)
    expect(onPrevious).toHaveBeenCalledTimes(1)
    expect(onSeekForward).toHaveBeenCalledTimes(1)
  })
})
