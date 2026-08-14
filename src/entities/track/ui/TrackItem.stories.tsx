import type { Meta, StoryObj } from '@storybook/react-vite'
import { TrackItem } from './TrackItem'
import type { Track } from '../model/types'

const mockTrack: Track = {
  id: 'jamendo-1',
  title: 'Sunset Drive',
  artist: 'Neon Waves',
  duration: 210,
  audioUrl: 'https://example.com/track.mp3',
  coverUrl: 'https://picsum.photos/seed/sunset/100',
  source: 'jamendo',
}

const meta = {
  title: 'Entities/TrackItem',
  component: TrackItem,
  tags: ['autodocs'],
} satisfies Meta<typeof TrackItem>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { track: mockTrack },
}

export const Active: Story = {
  args: { track: mockTrack, isActive: true, isPlaying: true },
}

export const InPlaylist: Story = {
  args: { track: mockTrack, actionLabel: 'Add', isInPlaylist: true, onAdd: () => {} },
}

export const DiscoverPreview: Story = {
  args: {
    track: mockTrack,
    actionLabel: 'Add',
    onPlay: () => {},
    onAdd: () => {},
    isActive: true,
    isPlaying: true,
  },
}
