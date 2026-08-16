import type { Meta, StoryObj } from '@storybook/react-vite'
import { TrackSearchPanel } from './TrackSearchPanel'

const meta = {
  title: 'Widgets/TrackSearchPanel',
  component: TrackSearchPanel,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TrackSearchPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onPlayTrack: () => {},
    onAddTrack: () => {},
    onRemoveFromPlaylist: () => {},
    onAddAll: () => {},
    isInPlaylist: () => false,
    currentTrack: null,
    isPlaying: false,
  },
}
