/**
 * PromiseLike type predicate.
 */
export const isPromiseLike = (value: unknown): value is PromiseLike<unknown> => {
  return typeof value === 'object' && value !== null && 'then' in value && typeof value.then === 'function';
};
