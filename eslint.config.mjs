import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  rules: {
    'no-use-before-define': 'off',
    'node/prefer-global/process': 'off',
    'node/prefer-global/buffer': 'off',
    'ts/explicit-function-return-type': 'off',
    'e18e/prefer-static-regex': 'warn',
  },
  ignores: [
    'CLAUDE.md',
    'docs/**',
    '.claude/skills/**',
    'test/fixtures/**',
  ],
}, {
  files: ['**/*.md/**'],
  rules: {
    'style/max-statements-per-line': 'off',
  },
}, {
  files: ['**/test/**/*.ts', '**/test/**/*.js'],
  rules: {
    'ts/no-unsafe-function-type': 'off',
    'no-console': 'off',
    'e18e/prefer-static-regex': 'off',
  },
})
