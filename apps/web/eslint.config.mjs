import createConfig from '@snippet-share/eslint-config/create-config';
import pluginRouter from '@tanstack/eslint-plugin-router';

export default createConfig({
  // Primitives not yet rebuilt to the DS stay unlinted. Re-include each as it lands.
  ignores: [
    'dist',
    'storybook-static',
    // Single star. ESLint prunes directories matched by `**`, which would
    // skip the re-inclusions below.
    'app/components/ui/*',
    '!app/components/ui/button.tsx',
    '!app/components/ui/button.stories.tsx',
    '**/*.gen.ts',
  ],
  plugins: {
    '@tanstack/router': pluginRouter,
  },
  rules: {
    ...pluginRouter.configs['flat/recommended'].rules,
  },
});
