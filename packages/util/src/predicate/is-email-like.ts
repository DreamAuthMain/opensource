/**
 * An email-like string.
 */
export type EmailLike = `${string}@${string}.${string}`;

/**
 * Matching doesn't guarantee a valid email address. This is just a quick
 * check that it has a name-like part, an `@` symbol, and a domain-like
 * part.
 */
export const isEmailLike = (value: unknown): value is EmailLike => {
  return typeof value === 'string' && /^[^@]+@(?:[^@.]+\.)+[^@.]+$/u.test(value);
};
