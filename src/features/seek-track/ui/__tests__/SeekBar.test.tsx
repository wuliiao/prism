import { render, screen } from '@testing-library/react'
import { AudioEngineProvider } from '@entities/audio'
import { SeekBar } from '../SeekBar'

describe('SeekBar', () => {
  it('renders seek controls', () => {
    render(
      <AudioEngineProvider>
        <SeekBar />
      </AudioEngineProvider>,
    )

    expect(screen.getByLabelText('Seek')).toBeInTheDocument()
    expect(screen.getAllByText('0:00')).toHaveLength(2)
  })
})
