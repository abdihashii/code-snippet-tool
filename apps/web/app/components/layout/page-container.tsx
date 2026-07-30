import React from 'react';

import { cn } from '@/lib/utils/class-name-utils';

interface PageContainerProps {
  /** DS column: page 900, reader 760, narrow 640, focus 420. Prop only: a `max-w-*` in `className` won't override it. */
  width?: 'page' | 'reader' | 'narrow' | 'focus';
  /** Centres in the shell's content slot. Needs a flex-column parent to grow into. */
  centered?: boolean;
  className?: string;
  children: React.ReactNode;
}

const WIDTH = {
  page: 'max-w-page',
  reader: 'max-w-reader',
  narrow: 'max-w-narrow',
  focus: 'max-w-focus',
};

export function PageContainer({
  width = 'page',
  centered = false,
  className,
  children,
}: PageContainerProps) {
  // px-7 matches the shell, so below the column width content lines up with the
  // wordmark. Call sites own vertical spacing only.
  return (
    <div
      className={cn(
        'mx-auto w-full px-7',
        WIDTH[width],
        centered && 'flex flex-1 items-center justify-center',
        className,
      )}
    >
      {children}
    </div>
  );
}
