module.exports = {
  root: true,
  env: { node: true },
  parserOptions: { warnOnUnsupportedTypeScriptVersion: false, ecmaVersion: 2022, sourceType: 'module' },
  extends: ['rational', 'rational/react', 'rational/warn'],
  ignorePatterns: ['node_modules', '**/lib/**', 'out', 'dist'],
  overrides: [
    {
      files: ['*.cjs'],
      parserOptions: { sourceType: 'script' },
    },
    {
      files: ['*.ts', '*.tsx'],
      extends: ['rational/typescript'],
      parserOptions: { project: './tsconfig.json' },
    },
  ],
};
