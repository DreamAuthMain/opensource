import rational from 'eslint-config-rational';

export default rational({
  override: [
    {
      files: ['packages/*/examples.ts'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
});
