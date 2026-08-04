import type { VariantProps } from 'class-variance-authority';

import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils/class-name-utils';

const buttonVariants = cva(
  // Font size lives on each size, not here. The DS gives `sm` its own 13px step.
  // Hover is guarded by not-disabled because the DS wants a not-allowed cursor,
  // which rules out disabled:pointer-events-none.
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive not-disabled:hover:cursor-pointer',
  {
    variants: {
      variant: {
        'default':
          'bg-primary text-primary-foreground shadow-xs not-disabled:hover:bg-primary/90',
        'destructive':
          'bg-destructive text-white not-disabled:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        'outline':
          'border bg-background text-foreground not-disabled:hover:bg-secondary dark:bg-transparent dark:border-input',
        // --primary is border-only. It fails AA as text, so text uses --primary-text.
        'primary-outline':
          'border border-primary bg-transparent text-primary-text not-disabled:hover:bg-secondary',
        'secondary':
          'bg-secondary text-secondary-foreground not-disabled:hover:bg-secondary-hover',
        'ghost':
          'text-foreground not-disabled:hover:bg-secondary',
        'link': 'text-primary-text underline underline-offset-4 not-disabled:hover:text-primary-text/80',
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
