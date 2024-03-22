import { type DreamAuthError } from './error.js';

/**
 * A raise function can be shorter, strongly typed, more readable, and
 * more functional than a `throw new` statement. Use an eslint rule to
 * restrict no `throw` statements.
 *
 * ```
 * return raise('Code');
 * throw new CustomError('Code');
 * ```
 */
export const createRaise = <TError extends DreamAuthError<any>, TArgs extends unknown[]>(
  type: new (...args: TArgs) => TError,
) => {
  return (...args: TArgs): never => {
    // eslint-disable-next-line no-restricted-syntax
    throw new type(...args);
  };
};
