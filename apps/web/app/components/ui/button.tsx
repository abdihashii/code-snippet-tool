import type { VariantProps } from 'class-variance-authority';

import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils/class-name-utils';

const buttonVariants = cva(
  // Font size lives on each size, not here: tailwind-merge does not dedupe
  // `text-sm` against the `text-caption` token, so both would survive.
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background text-foreground hover:bg-secondary dark:bg-transparent dark:border-input',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary-hover',
        ghost:
          'text-foreground hover:bg-secondary',
        link: 'text-primary underline underline-offset-4 hover:text-primary/80',
      },
      size: {
        default: 'h-9 px-4 text-sm',
        sm: 'h-8 gap-1.5 px-3 text-caption',
        lg: 'h-10 px-6 text-sm',
        icon: 'size-9 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'>
  & VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
