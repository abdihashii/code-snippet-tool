import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../app/components/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-themes'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal(config) {
    // Drop app-server plugins inherited from vite.config.ts; Storybook is client-only.
    config.plugins = (config.plugins as any[])
      .flat(Infinity)
      .filter(
        (p) =>
          p?.name
          && !p.name.startsWith('vite-plugin-cloudflare')
          && !p.name.startsWith('tanstack'),
      );
    return config;
  },
};

export default config;
