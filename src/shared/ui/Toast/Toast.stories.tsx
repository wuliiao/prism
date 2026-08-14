import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@shared/ui/Button'
import { ToastProvider, useToast } from './ToastProvider'

function ToastDemo() {
  const { showToast } = useToast()

  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={() => showToast('Track added to playlist', 'success')}>Success</Button>
      <Button variant="ghost" onClick={() => showToast('Already in playlist', 'info')}>
        Info
      </Button>
      <Button variant="danger" onClick={() => showToast("Couldn't play this track", 'error')}>
        Error
      </Button>
    </div>
  )
}

const meta = {
  title: 'Shared/Toast',
  component: ToastDemo,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
} satisfies Meta<typeof ToastDemo>

export default meta
type Story = StoryObj<typeof meta>

export const Triggers: Story = {}
