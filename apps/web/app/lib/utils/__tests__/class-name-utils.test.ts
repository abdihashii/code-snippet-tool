import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { cn, DS_TEXT_TOKENS } from '../class-name-utils';

describe('dS text tokens', () => {
  it('matches every type token in app.css', () => {
    const css = readFileSync(
      new URL('../../../styles/app.css', import.meta.url),
      'utf8',
    );
    // Skips modifiers like `--text-micro--font-weight`.
    const declared = [...css.matchAll(/^\s*--text-([\w-]+):/gm)]
      .map(([, name]) => name)
      .filter((name) => !name.includes('--'));

    expect([...declared].sort()).toEqual([...DS_TEXT_TOKENS].sort());
  });
});

describe('cn', () => {
  it('keeps a text colour alongside a DS type token', () => {
    // tailwind-merge reads unknown `text-*` values as colours. Without the
    // font-size registration it drops the colour and the element inherits.
    expect(cn('text-primary-foreground', 'text-caption')).toBe(
      'text-primary-foreground text-caption',
    );
    expect(cn('text-foreground', 'text-body')).toBe('text-foreground text-body');
    expect(cn('text-muted-foreground', 'text-micro')).toBe(
      'text-muted-foreground text-micro',
    );
  });

  it('lets DS type tokens override Tailwind sizes and each other', () => {
    expect(cn('text-sm', 'text-caption')).toBe('text-caption');
    expect(cn('text-caption', 'text-sm')).toBe('text-sm');
    expect(cn('text-body', 'text-hero')).toBe('text-hero');
  });

  it('still resolves conflicting text colours', () => {
    expect(cn('text-foreground', 'text-primary-foreground')).toBe(
      'text-primary-foreground',
    );
  });
});
