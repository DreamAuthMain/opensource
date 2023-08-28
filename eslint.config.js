import dreamauth from '@dreamauth/eslint-plugin';
import rational from 'eslint-config-rational';

export default rational({
  override: [
    {
      files: ['**/*'],
      plugins: { dreamauth },
      rules: {
        'dreamauth/no-throw-new': ['warn'],
      },
    },
    {
      files: ['packages/errors/**/*', '**/*.test.*'],
      plugins: { dreamauth },
      rules: {
        'dreamauth/no-throw-new': ['off'],
      },
    },
  ],
});
