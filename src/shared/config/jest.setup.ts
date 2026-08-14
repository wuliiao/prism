import '@testing-library/jest-dom'

Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  value: jest.fn(),
})

Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  configurable: true,
  value: jest.fn().mockResolvedValue(undefined),
})

Object.defineProperty(HTMLMediaElement.prototype, 'load', {
  configurable: true,
  value: function load() {
    Object.defineProperty(this, 'readyState', { configurable: true, writable: true, value: 4 })
    this.dispatchEvent(new Event('canplay'))
  },
})

class MockAnalyserNode {
  fftSize = 512
  frequencyBinCount = 256
  smoothingTimeConstant = 0
  connect = jest.fn()
  getByteTimeDomainData = jest.fn()
  getByteFrequencyData = jest.fn()
}

class MockAudioContext {
  state = 'running'
  destination = {}
  resume = jest.fn().mockResolvedValue(undefined)
  close = jest.fn().mockResolvedValue(undefined)
  createAnalyser = jest.fn(() => new MockAnalyserNode())
  createMediaElementSource = jest.fn(() => ({ connect: jest.fn(), disconnect: jest.fn() }))
}

Object.defineProperty(globalThis, 'AudioContext', {
  configurable: true,
  writable: true,
  value: MockAudioContext,
})
