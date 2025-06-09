import createConfig from '@snippet-share/eslint-config/create-config';
import pluginRouter from '@tanstack/eslint-plugin-router';

export default createConfig({
  ignores: ['dist', 'app/components/ui/**', '**/*.gen.ts'],
  plugins: {
    '@tanstack/router': pluginRouter,
  },
  rules: {
    ...pluginRouter.configs['flat/recommended'].rules,
  },
});
