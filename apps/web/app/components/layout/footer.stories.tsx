import type { Meta, StoryObj } from '@storybook/react-vite';

import { withRouter, withTheme } from '../../../.storybook/decorators';
import { Footer } from './footer';

const meta: Meta<typeof Footer> = {
  component: Footer,
  title: 'Layout/Footer',
  decorators: [withRouter, withTheme],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Footer>;

export const Default: Story = {};
