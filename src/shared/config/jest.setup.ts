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
