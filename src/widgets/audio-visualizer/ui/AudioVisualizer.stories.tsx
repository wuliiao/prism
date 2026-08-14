import type { Meta, StoryObj } from '@storybook/react-vite'
import { AudioEngineProvider } from '@entities/audio'
import { AudioVisualizer } from './AudioVisualizer'

const meta = {
  title: 'Widgets/AudioVisualizer',
  component: AudioVisualizer,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[480px] rounded-2xl bg-zinc-900 p-4">
        <AudioEngineProvider>
          <Story />
        </AudioEngineProvider>
      </div>
    ),
  ],
} satisfies Meta<typeof AudioVisualizer>

export default meta
type Story = StoryObj<typeof meta>

export const Idle: Story = {}
