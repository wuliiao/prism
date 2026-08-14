import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TrackItem } from '../TrackItem'
import type { Track } from '../../model/types'

const mockTrack: Track = {
  id: 'jamendo-1',
  title: 'Sunset Drive',
  artist: 'Neon Waves',
  duration: 210,
  audioUrl: 'https://example.com/track.mp3',
  coverUrl: 'https://example.com/cover.jpg',
  source: 'jamendo',
}

describe('TrackItem', () => {
  it('renders track title and artist', () => {
    render(<TrackItem track={mockTrack} />)

    expect(screen.getByText('Sunset Drive')).toBeInTheDocument()
    expect(screen.getByText('Neon Waves')).toBeInTheDocument()
  })

  it('calls onSelect when clicked', async () => {
    const user = userEvent.setup()
    const onSelect = jest.fn()

    render(<TrackItem track={mockTrack} onSelect={onSelect} />)
    await user.click(screen.getByText('Sunset Drive'))

    expect(onSelect).toHaveBeenCalledWith(mockTrack)
  })

  it('calls onPlay when cover play button is clicked', async () => {
    const user = userEvent.setup()
    const onPlay = jest.fn()

    render(<TrackItem track={mockTrack} onPlay={onPlay} actionLabel="Add" onAdd={() => {}} />)
    await user.click(screen.getByLabelText('Play Sunset Drive'))

    expect(onPlay).toHaveBeenCalledWith(mockTrack)
  })

  it('calls onAdd when add button is clicked', async () => {
    const user = userEvent.setup()
    const onAdd = jest.fn()

    render(<TrackItem track={mockTrack} onPlay={() => {}} actionLabel="Add" onAdd={onAdd} />)
    await user.click(screen.getByLabelText('Add Sunset Drive'))

    expect(onAdd).toHaveBeenCalledWith(mockTrack)
  })

  it('shows remove button when onRemove is provided', async () => {
    const user = userEvent.setup()
    const onRemove = jest.fn()

    render(<TrackItem track={mockTrack} onRemove={onRemove} />)
    await user.click(screen.getByLabelText('Remove Sunset Drive'))

    expect(onRemove).toHaveBeenCalledWith(mockTrack)
  })
})
