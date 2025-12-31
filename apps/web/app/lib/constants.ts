/// <reference types="vite/client" />

import { CHANGELOG_DATA } from '@/lib/changelog-data';

/* c8 ignore start */
export const API_URL = import.meta.env.VITE_API_URL;
export const TITLE = 'Snippet Share - Private Code Sharing';
export const DESCRIPTION
  = 'A secure and easy way to share code snippets with others. Create self-destructing, password-protected snippets with end-to-end encryption.';
export const KEYWORDS = 'secure code sharing, encrypted pastebin, zero-knowledge encryption, pastebin alternative, private code snippets, self-destructing code, password protected snippets, AES-256 encryption, burn after reading code, anonymous code sharing, developer code sharing tool';
export const URL = 'https://snippet-share.com';
export const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
export const POSTHOG_API_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_API_HOST;
export const APP_VERSION = CHANGELOG_DATA[0]?.version ?? '';
/* c8 ignore end */
