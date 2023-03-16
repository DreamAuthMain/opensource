module.exports = {
  env: {
    node: true,
  },
  extends: ['rational', 'rational/react', 'rational/warn', 'rational/prettier'],
  ignorePatterns: ['node_modules', 'lib', 'out', 'dist'],
  overrides: [
    {
      files: ['*.cjs'],
      parserOptions: {
        sourceType: 'script',
      },
    },
    {
      files: ['*.mjs'],
      parserOptions: {
        sourceType: 'module',
      },
    },
    {
      files: ['*.js'],
      parserOptions: {
        sourceType: 'module',
      },
    },
    {
      extends: ['rational/typescript', 'rational/prettier'],
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  ],
  root: true,
};
