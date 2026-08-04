import type { Meta, StoryObj } from '@storybook/react-vite';

import { LockIcon } from 'lucide-react';

import { Button } from './button';

const meta: Meta<typeof Button> = {
  component: Button,
  title: 'UI/Button',
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'primary-outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    asChild: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
    size: 'default',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

/** The DS renders this at `size="sm"`. */
export const PrimaryOutline: Story = {
  args: {
    children: 'Prettify Code',
    variant: 'primary-outline',
    size: 'sm',
  },
};

/** Text is `--secondary-foreground`, which the DS resolves to `--foreground` in both themes. */
export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost',
    variant: 'ghost',
  },
};

/** Underlined at rest. Hover changes the color, not the underline. */
export const Link: Story = {
  args: {
    children: 'Link',
    variant: 'link',
  },
};

/** Hover each one. Text color must stay put; only the background moves. */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2.5">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="primary-outline">Primary outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

/** DS heights are 32, 36, 40. `sm` is the only size on `text-caption` (13px); the rest are 14px. */
export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2.5">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Encrypt">
        <LockIcon />
      </Button>
    </div>
  ),
};

/** Padding matches the text-only sizes above. It used to narrow via `has-[>svg]`. */
export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2.5">
      <Button size="sm">
        <LockIcon />
        Small
      </Button>
      <Button size="default">
        <LockIcon />
        Default
      </Button>
      <Button size="lg">
        <LockIcon />
        Large
      </Button>
    </div>
  ),
};

/** Half opacity, not-allowed cursor. The cursor needs pointer events, so the base keeps them. */
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2.5">
      <Button disabled>Default</Button>
      <Button variant="outline" disabled>Outline</Button>
      <Button variant="primary-outline" disabled>Primary outline</Button>
    </div>
  ),
};

/** `asChild` moves the classes onto the child, so an anchor renders as a button. */
export const AsChildLink: Story = {
  render: () => (
    <Button asChild variant="primary-outline">
      <a href="#top">Anchor with button styling</a>
    </Button>
  ),
};
