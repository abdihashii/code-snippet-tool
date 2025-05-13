import createConfig from '@code-snippet-tool/eslint-config/create-config';
import pluginRouter from '@tanstack/eslint-plugin-router';

export default createConfig({
  ignores: ['dist', 'src/components/ui/**', '**/*.gen.ts'],
  plugins: {
    '@tanstack/router': pluginRouter,
  },
  rules: {
    ...pluginRouter.configs['flat/recommended'].rules,
  },
});
