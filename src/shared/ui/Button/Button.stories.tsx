import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'

const meta = {
  title: 'Shared/Button',
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: { children: 'Play' },
}

export const Ghost: Story = {
  args: { children: 'Cancel', variant: 'ghost' },
}

export const Danger: Story = {
  args: { children: 'Remove', variant: 'danger' },
}

export const Disabled: Story = {
  args: { children: 'Disabled', disabled: true },
}
