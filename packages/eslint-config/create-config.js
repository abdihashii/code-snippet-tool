import antfu from '@antfu/eslint-config';

export default function createConfig(options, ...userConfigs) {
  return antfu({
    type: 'app',
    react: true,
    typescript: true,
    formatters: true,
    stylistic: {
      indent: 2,
      semi: true,
      quotes: 'single',
    },
    ignores: ['.pnpm-store/*', '**/tsconfig.json'],
    ...options,
  }, {
    rules: {
      'ts/no-redeclare': 'off',
      'ts/consistent-type-definitions': ['error', 'interface'],
      'no-console': ['warn'],
      'antfu/no-top-level-await': ['off'],
      'node/prefer-global/process': ['off'],
      'node/no-process-env': ['error'],
      'perfectionist/sort-imports': ['error', {
        tsconfigRootDir: '.',
      }],
      'unicorn/filename-case': ['error', {
        case: 'kebabCase',
        ignore: ['README.md', 'CLAUDE.md'],
      }],
      'style/brace-style': ['error', '1tbs', {
        allowSingleLine: true,
      }],
      'style/arrow-parens': ['error', 'always'],
      'antfu/if-newline': ['off'],
      // 'style/max-len': ['error', {
      //   code: 40,
      //   tabWidth: 2,
      //   ignoreUrls: true,
      //   ignoreComments: false,
      //   ignoreTrailingComments: true,
      //   ignoreStrings: true,
      //   ignoreTemplateLiterals: true,
      // }],
    },
  }, {
    files: ['**/*.md/**'],
    rules: {
      // Disable all linting for code blocks in markdown - treat them as examples only
      '@typescript-eslint/no-unused-vars': 'off',
      'ts/no-unused-vars': 'off',
      'ts/no-redeclare': 'off',
      'ts/no-undef': 'off',
      'ts/consistent-type-definitions': 'off',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-console': 'off',
      'unused-imports/no-unused-vars': 'off',
      'import/no-unresolved': 'off',
      'node/prefer-global/buffer': 'off',
      'node/prefer-global/process': 'off',
      'style/semi': 'off',
      'style/comma-dangle': 'off',
      'style/quotes': 'off',
      'antfu/no-import-dist': 'off',
      'antfu/no-import-node-modules-by-path': 'off',
    },
  }, ...userConfigs);
}
