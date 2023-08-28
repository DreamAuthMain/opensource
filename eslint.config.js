import dreamauth from '@dreamauth/eslint-plugin';
import rational from 'eslint-config-rational';

export default rational({
  override: [...dreamauth.configs.recommended],
});
