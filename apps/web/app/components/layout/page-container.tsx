import React from 'react';

import { cn } from '@/lib/utils/class-name-utils';

interface PageContainerProps {
  /** DS column: page 900, reader 760, narrow 640, focus 420. */
  width?: 'page' | 'reader' | 'narrow' | 'focus';
  /** Centres in the remaining shell height, for single-card states. */
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
  // The gutter matches the shell's p-7, so content starts at the wordmark's x.
  // Call sites own vertical spacing only; the column itself lives here so the
  // five routes can't drift apart again.
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
