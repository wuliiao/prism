import type { Meta, StoryObj } from '@storybook/react-vite'
import { AudioEngineProvider } from '@entities/audio'
import { PlayPauseButton } from './PlayPauseButton'

const meta = {
  title: 'Features/PlayPauseButton',
  component: PlayPauseButton,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <AudioEngineProvider>
        <Story />
      </AudioEngineProvider>
    ),
  ],
} satisfies Meta<typeof PlayPauseButton>

export default meta
type Story = StoryObj<typeof meta>

export const Disabled: Story = {}
