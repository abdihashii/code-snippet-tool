import type { Meta, StoryObj } from '@storybook/react-vite';

import { AppLayout } from '@/components/layout/app-layout';
import { PageContainer } from '@/components/layout/page-container';

import { withRouter, withTheme } from '../../../.storybook/decorators';
import { SnippetExpiredMessage } from './snippet-expired-message';

/**
 * Shown in the shell the route puts it in, since reaching these states for real
 * needs an expired snippet or a spent view count.
 */
const meta: Meta<typeof SnippetExpiredMessage> = {
  component: SnippetExpiredMessage,
  title: 'Snippet/SnippetExpiredMessage',
  decorators: [
    (Story) => (
      <AppLayout>
        <PageContainer width="focus" centered>
          <Story />
        </PageContainer>
      </AppLayout>
    ),
    withRouter,
    withTheme,
  ],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    showGoHomeButton: true,
  },
};

export default meta;
type Story = StoryObj<typeof SnippetExpiredMessage>;

export const Expired: Story = {
  args: {
    title: 'Snippet expired',
    message: 'This snippet has expired and is no longer available.',
  },
};

export const ViewLimit: Story = {
  args: {
    title: 'Snippet has reached its maximum view limit.',
    message: 'This snippet could not be retrieved.',
  },
};

export const NotFound: Story = {
  args: {
    title: 'Snippet not found or access denied',
    message: 'This snippet could not be retrieved.',
  },
};
