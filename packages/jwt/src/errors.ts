import { createErrors } from '@dreamauth/errors';

export const [error, errors] = createErrors({
  ExpiredJwt: 'expired jwt',
  InvalidJwt: 'invalid jwt',
  // InvalidJwtIat: 'invalid jwt iat claim',
  InvalidJwtNbf: 'invalid jwt nbf claim',
  InvalidJwtIss: 'invalid jwt iss claim',
  InvalidJwtSignature: 'invalid jwt signature',
  UnsupportedJwtTyp: 'unsupported jwt typ claim',
  UnsupportedJwtAlg: 'unsupported jwt algorithm',
});
