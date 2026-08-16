import type { Meta, StoryObj } from '@storybook/react-vite'
import { Slider } from './Slider'

const meta = {
  title: 'Shared/Slider',
  component: Slider,
  tags: ['autodocs'],
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Volume', min: 0, max: 100, defaultValue: 70 },
}
