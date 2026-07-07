interface ShortcutEvent {
  altKey: boolean;
  code?: string;
  ctrlKey: boolean;
  key: string;
  metaKey: boolean;
  shiftKey: boolean;
}

interface Shortcut {
  altKey: boolean;
  ctrlKey: boolean;
  key: string;
  metaKey: boolean;
  modKey: boolean;
  shiftKey: boolean;
}

const modifierAliases: Record<string, keyof Omit<Shortcut, 'key'>> = {
  alt: 'altKey',
  command: 'metaKey',
  control: 'ctrlKey',
  ctrl: 'ctrlKey',
  cmd: 'metaKey',
  meta: 'metaKey',
  mod: 'modKey',
  option: 'altKey',
  shift: 'shiftKey',
};

const keyAliases: Record<string, string> = {
  esc: 'escape',
  space: ' ',
};

export function parseShortcut(shortcut: string): Shortcut {
  const parts = shortcut.toLowerCase().split('+').map((part) => part.trim());
  if (parts.includes('')) {
    throw new Error(`Invalid shortcut "${shortcut}".`);
  }

  const key = parts.at(-1);
  if (!key) {
    throw new Error('Shortcut must include a key.');
  }

  const parsed: Shortcut = {
    altKey: false,
    ctrlKey: false,
    key: keyAliases[key] ?? key,
    metaKey: false,
    modKey: false,
    shiftKey: false,
  };

  for (const part of parts.slice(0, -1)) {
    const modifier = modifierAliases[part];
    if (!modifier) {
      throw new Error(`Unknown shortcut modifier "${part}".`);
    }
    parsed[modifier] = true;
  }

  return parsed;
}

export function matchesShortcut(
  event: ShortcutEvent,
  shortcut: Shortcut,
  applePlatform = isApplePlatform(),
) {
  const needsMeta = shortcut.metaKey || (shortcut.modKey && applePlatform);
  const needsCtrl = shortcut.ctrlKey || (shortcut.modKey && !applePlatform);

  return matchesKey(event, shortcut.key)
    && event.altKey === shortcut.altKey
    && event.ctrlKey === needsCtrl
    && event.metaKey === needsMeta
    && event.shiftKey === shortcut.shiftKey;
}

function matchesKey(event: ShortcutEvent, key: string) {
  if (event.key.toLowerCase() === key) return true;

  const code = key.length === 1 && /^[a-z\d]$/.test(key)
    ? `${/[a-z]/.test(key) ? 'key' : 'digit'}${key}`
    : undefined;

  return event.code?.toLowerCase() === code;
}

export function isEditableTarget(target: EventTarget | null) {
  if (!target || !('tagName' in target)) return false;

  const element = target as HTMLElement;
  const tagName = element.tagName.toUpperCase();

  return element.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA'].includes(tagName);
}

export function isApplePlatform() {
  if (typeof navigator === 'undefined') return false;

  return /mac|iphone|ipad|ipod/i.test(navigator.platform);
}
