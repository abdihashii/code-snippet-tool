import type { Meta, StoryObj } from '@storybook/react-vite';

import { Logo } from './logo';

const meta: Meta<typeof Logo> = {
  component: Logo,
  title: 'Layout/Logo',
  argTypes: {
    size: {
      control: 'select',
      options: ['header', 'lockup'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Logo>;

export const Default: Story = {
  args: {
    size: 'header',
  },
};

export const Lockup: Story = {
  args: {
    size: 'lockup',
  },
};
