import { AudioEngine } from '../AudioEngine'

class MockAnalyserNode {
  fftSize = 2048
  smoothingTimeConstant = 0
  frequencyBinCount = 1024
  connect = jest.fn()
}

class MockAudioContext {
  state = 'running'
  destination = {}
  resume = jest.fn().mockResolvedValue(undefined)
  close = jest.fn().mockResolvedValue(undefined)
  createAnalyser = jest.fn(() => new MockAnalyserNode())
  createMediaElementSource = jest.fn(() => ({ connect: jest.fn(), disconnect: jest.fn() }))
}

describe('AudioEngine', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'AudioContext', {
      configurable: true,
      writable: true,
      value: MockAudioContext,
    })
  })

  it('loads a url, waits for canplay, and can play pause and seek', async () => {
    const engine = new AudioEngine()
    const play = jest.spyOn(HTMLMediaElement.prototype, 'play')
    const pause = jest.spyOn(HTMLMediaElement.prototype, 'pause')

    await engine.load('https://example.com/track.mp3')
    await engine.play()
    engine.seek(12)
    engine.pause()

    expect(play).toHaveBeenCalled()
    expect(pause).toHaveBeenCalled()
    expect(engine.getCurrentTime()).toBe(12)
    expect(engine.isPaused()).toBe(true)
    expect(engine.getAnalyser()).not.toBeNull()

    engine.destroy()
  })

  it('clamps volume between 0 and 1', async () => {
    const engine = new AudioEngine()
    await engine.load('https://example.com/track.mp3')

    engine.setVolume(2)
    expect(engine['audio'].volume).toBe(1)
    engine.setVolume(-1)
    expect(engine['audio'].volume).toBe(0)

    engine.destroy()
  })

  it('resumes a suspended audio context before playing', async () => {
    const engine = new AudioEngine()
    await engine.load('https://example.com/track.mp3')

    const context = engine['context'] as unknown as MockAudioContext
    context.state = 'suspended'
    await engine.play()

    expect(context.resume).toHaveBeenCalled()
    engine.destroy()
  })
})
