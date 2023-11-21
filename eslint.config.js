import dreamauth from '@dreamauth/eslint-plugin';
import rational from 'eslint-config-rational';

export default rational({
  ignores: ['**/{.git,node_modules,out,lib,dist}'],
  override: [...dreamauth.configs.recommended],
});
