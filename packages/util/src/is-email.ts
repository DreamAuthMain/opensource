export type Email = `${string}@${string}.${string}`;

/**
 * Matching doesn't guarantee a valid email address. This is just a quick
 * check that it has a name-like part, an `@` symbol, and a domain-like
 * part.
 */
export const isEmail = (value: unknown): value is Email => {
  return typeof value === 'string' && /^[^@]+@(?:[^@.]+\.)+[^@.]+$/iu.test(value);
};
