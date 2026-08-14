import type { Meta, StoryObj } from '@storybook/react-vite'
import { AudioEngineProvider } from '@entities/audio'
import { SeekBar } from './SeekBar'

const meta = {
  title: 'Features/SeekBar',
  component: SeekBar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl rounded-2xl bg-zinc-950 p-4">
        <AudioEngineProvider>
          <Story />
        </AudioEngineProvider>
      </div>
    ),
  ],
} satisfies Meta<typeof SeekBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
