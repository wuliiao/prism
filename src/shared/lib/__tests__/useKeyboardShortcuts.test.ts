import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts } from '../useKeyboardShortcuts'

function press(code: string, target: EventTarget = document.body) {
  target.dispatchEvent(
    new KeyboardEvent('keydown', { code, bubbles: true, cancelable: true }),
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
})
