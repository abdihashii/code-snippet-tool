import { describe, expect, it } from 'vitest';

import {
  isEditableTarget,
  matchesShortcut,
  parseShortcut,
} from '@/lib/utils/shortcut-utils';

function event(overrides: Partial<KeyboardEvent> = {}) {
  return {
    altKey: false,
    ctrlKey: false,
    key: 'l',
    metaKey: false,
    shiftKey: false,
    ...overrides,
  } as KeyboardEvent;
}

describe('shortcut-utils', () => {
  it('matches mod shortcuts to the platform modifier', () => {
    const shortcut = parseShortcut('mod+shift+l');

    expect(matchesShortcut(event({ key: 'L', metaKey: true, shiftKey: true }), shortcut, true)).toBe(true);
    expect(matchesShortcut(event({ ctrlKey: true, shiftKey: true }), shortcut, false)).toBe(true);
  });

  it('matches option shortcuts when macOS changes the typed key', () => {
    const shortcut = parseShortcut('alt+t');

    expect(matchesShortcut(event({ altKey: true, code: 'KeyT', key: '†' }), shortcut)).toBe(true);
  });

  it('rejects extra modifiers', () => {
    const shortcut = parseShortcut('mod+shift+l');

    expect(matchesShortcut(event({ ctrlKey: true, metaKey: true, shiftKey: true }), shortcut, false)).toBe(false);
  });

  it('fails fast for invalid shortcut strings', () => {
    expect(() => parseShortcut('mod+nope+l')).toThrow('Unknown shortcut modifier "nope".');
    expect(() => parseShortcut('mod++l')).toThrow('Invalid shortcut "mod++l".');
  });

  it('detects editable targets', () => {
    expect(isEditableTarget({ tagName: 'input', isContentEditable: false } as unknown as EventTarget)).toBe(true);
    expect(isEditableTarget({ tagName: 'div', isContentEditable: true } as unknown as EventTarget)).toBe(true);
    expect(isEditableTarget({ tagName: 'button', isContentEditable: false } as unknown as EventTarget)).toBe(false);
  });
});
