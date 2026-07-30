import type { Meta, StoryObj } from '@storybook/react-vite';

import { withRouter, withTheme } from '../../.storybook/decorators';
import { NotFound } from './404';

const meta: Meta<typeof NotFound> = {
  component: NotFound,
  title: 'Routes/404',
  decorators: [withRouter, withTheme],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof NotFound>;

/**
 * The focus column is 420px, and the heading still scales to 48px at `md`, so
 * check how far it wraps on a wide viewport. Also the only place `centered` is
 * exercised in a real route: the card should hold the middle of the shell in
 * both a short and a tall window.
 */
export const Default: Story = {};
