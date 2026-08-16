import { render, screen, waitFor } from '@testing-library/react'
import { AppProviders } from '@app/providers/AppProviders'
import { PlayerPage } from '../PlayerPage'
import { PLAYBACK_STORAGE_KEY } from '@entities/audio/model/playbackStorage'

jest.mock('@shared/config', () => ({
  env: { jamendoClientId: '' },
  isJamendoConfigured: () => false,
}))

const storedTrack = {
  id: 'jamendo-1',
  title: 'Ocean',
  artist: 'Blue Sky',
  duration: 180,
  audioUrl: 'https://example.com/ocean.mp3',
  source: 'jamendo',
}

function mockVisualizerApis() {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value: jest.fn(() => ({
      setTransform: jest.fn(),
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      quadraticCurveTo: jest.fn(),
      stroke: jest.fn(),
      fillText: jest.fn(),
      createLinearGradient: () => ({ addColorStop: jest.fn() }),
      createRadialGradient: () => ({ addColorStop: jest.fn() }),
    })),
  })

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: jest.fn().mockReturnValue({
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }),
  })

  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    writable: true,
    value: class {
      observe() {}
      disconnect() {}
    },
  })
}

describe('PlayerPage restore', () => {
  beforeEach(() => {
    localStorage.clear()
    mockVisualizerApis()
    jest.mocked(HTMLMediaElement.prototype.play).mockClear()
  })

  it('shows the restored track in the player UI after refresh', async () => {
    localStorage.setItem(
      PLAYBACK_STORAGE_KEY,
      JSON.stringify({ track: storedTrack, currentTime: 42 }),
    )

    render(
      <AppProviders>
        <PlayerPage />
      </AppProviders>,
    )

    await waitFor(() => {
      expect(screen.getByText('Paused: Ocean by Blue Sky')).toBeInTheDocument()
    })

    expect(screen.getAllByText('Ocean').length).toBeGreaterThan(0)
    expect(screen.getByLabelText('Play')).toBeInTheDocument()
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled()
  })
})
