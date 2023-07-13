import rational from 'eslint-config-rational';

export default rational({
  override: [
    {
      files: ['packages/*/examples.ts'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
});
