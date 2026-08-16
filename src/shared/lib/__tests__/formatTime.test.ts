import { formatTime } from '../formatTime'

describe('formatTime', () => {
  it('formats zero seconds', () => {
    expect(formatTime(0)).toBe('0:00')
  })

  it('formats minutes and seconds', () => {
    expect(formatTime(125)).toBe('2:05')
  })

  it('pads single-digit seconds', () => {
    expect(formatTime(61)).toBe('1:01')
  })

  it('handles invalid values', () => {
    expect(formatTime(-1)).toBe('0:00')
    expect(formatTime(Number.NaN)).toBe('0:00')
  })
})
