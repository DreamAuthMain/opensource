import { createErrors } from '@dreamauth/errors';

export const [error, ERRORS] = createErrors({
  UnsupportedAlg: 'unsupported algorithm',
});
