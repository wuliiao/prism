import type { Meta, StoryObj } from '@storybook/react-vite'
import { PlaylistPanel } from './PlaylistPanel'
import type { Track } from '@entities/track'

const tracks: Track[] = [
  {
    id: '1',
    title: 'Ocean Breeze',
    artist: 'Blue Sky',
    duration: 180,
    audioUrl: '#',
    coverUrl: 'https://picsum.photos/seed/ocean/100',
    source: 'jamendo',
    genre: 'chill',
  },
  {
    id: '2',
    title: 'Night City',
    artist: 'Synth Wave',
    duration: 240,
    audioUrl: '#',
    source: 'jamendo',
    genre: 'electronic',
  },
  {
    id: '3',
    title: 'Midnight Jazz',
    artist: 'Smooth Trio',
    duration: 200,
    audioUrl: '#',
    source: 'jamendo',
    genre: 'jazz',
  },
  {
    id: '4',
    title: 'My Upload',
    artist: 'Local file',
    duration: 160,
    audioUrl: '#',
    source: 'local',
  },
]

const meta = {
  title: 'Widgets/PlaylistPanel',
  component: PlaylistPanel,
  tags: ['autodocs'],
} satisfies Meta<typeof PlaylistPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    tracks: [],
    currentTrack: null,
    isPlaying: false,
    onSelect: () => {},
    onRemove: () => {},
  },
}

export const WithTracks: Story = {
  args: {
    tracks,
    currentTrack: tracks[0] ?? null,
    isPlaying: true,
    onSelect: () => {},
    onRemove: () => {},
  },
}

export const WithGenreFilters: Story = {
  args: {
    tracks,
    currentTrack: tracks[2] ?? null,
    isPlaying: false,
    onSelect: () => {},
    onRemove: () => {},
  },
}
