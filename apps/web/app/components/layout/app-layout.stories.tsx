import type { Meta, StoryObj } from '@storybook/react-vite';

import { withRouter, withTheme } from '../../../.storybook/decorators';
import { AppLayout } from './app-layout';
import { PageContainer } from './page-container';

const meta: Meta<typeof AppLayout> = {
  component: AppLayout,
  title: 'Layout/AppLayout',
  decorators: [withRouter, withTheme],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof AppLayout>;

/**
 * Short page — the footer should sit at the bottom of the viewport rather than
 * riding up under the header.
 */
export const Default: Story = {
  args: {
    children: (
      <PageContainer className="py-12">
        <p className="text-body text-foreground">Page content.</p>
      </PageContainer>
    ),
  },
};

/**
 * Tall page — the header stays pinned over the scrolling content, which is the
 * only way to read its translucent surface and backdrop blur.
 */
export const Scrolling: Story = {
  args: {
    children: (
      <PageContainer className="py-12 space-y-4">
        {Array.from({ length: 40 }, (_, i) => (
          <p key={i} className="text-body text-foreground">
            {`Line ${i + 1} — scroll this content beneath the header to check the frosted surface.`}
          </p>
        ))}
      </PageContainer>
    ),
  },
};
