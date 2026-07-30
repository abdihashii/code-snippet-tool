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

/**
 * Check in both themes: the border-top reads against the page, the wordmark
 * lockup sits hard left and the links hard right at 28px gutters, and Changelog
 * and Feedback underline on hover. Below 640px the tagline, Changelog and Feedback
 * all hide, as the tagline and badge do in the header, leaving the mark and the
 * copyright alone on one line down to 320px.
 */
export const Default: Story = {};
