import type { Meta, StoryObj } from '@storybook/react-vite'
import { AudioEngineProvider } from '@entities/audio'
import { PlayerBar } from './PlayerBar'

const meta = {
  title: 'Widgets/PlayerBar',
  component: PlayerBar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="min-h-[200px] bg-zinc-950">
        <AudioEngineProvider>
          <Story />
        </AudioEngineProvider>
      </div>
    ),
  ],
} satisfies Meta<typeof PlayerBar>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: { canNavigate: false, onNext: () => {}, onPrevious: () => {} },
}

export const WithNavigation: Story = {
  args: { canNavigate: true, onNext: () => {}, onPrevious: () => {} },
}
