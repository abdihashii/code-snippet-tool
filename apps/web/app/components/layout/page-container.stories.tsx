import type { Meta, StoryObj } from '@storybook/react-vite';

import { PageContainer } from './page-container';

const meta: Meta<typeof PageContainer> = {
  component: PageContainer,
  title: 'Layout/PageContainer',
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    width: {
      control: 'select',
      options: ['page', 'reader', 'narrow', 'focus'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof PageContainer>;

/** Bordered so both the column's edges and the 28px gutter are visible. */
function sample(label: string) {
  return (
    <div className="rounded-lg border border-border py-10 text-center text-body text-foreground">
      {label}
    </div>
  );
}

/** Home. */
export const Page: Story = {
  args: {
    width: 'page',
    className: 'py-12',
    children: sample('page / 900px'),
  },
};

/** View and Changelog. */
export const Reader: Story = {
  args: {
    width: 'reader',
    className: 'py-12',
    children: sample('reader / 760px'),
  },
};

/** Home FAQ. */
export const Narrow: Story = {
  args: {
    width: 'narrow',
    className: 'py-12',
    children: sample('narrow / 640px'),
  },
};

/** Password Gate, Expired, 404. */
export const Focus: Story = {
  args: {
    width: 'focus',
    className: 'py-12',
    children: sample('focus / 420px'),
  },
};

/**
 * Single-card states. The wrapper stands in for the shell's content slot, which
 * is the flex column `centered` grows inside.
 */
export const Centered: Story = {
  args: {
    width: 'focus',
    centered: true,
    children: sample('focus / 420px, centered'),
  },
  render: (args) => (
    <div className="flex h-screen flex-col bg-background">
      <PageContainer {...args} />
    </div>
  ),
};
