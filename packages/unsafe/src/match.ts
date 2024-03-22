import { type Dict, type Falsy, isArray, isDict, isObject } from '@dreamauth/util';

/**
 * Error matcher.
 */
export type Matcher<TError extends Error> = (error: unknown) => error is TError;

/**
 * Create a matcher for an error type and optional properties.
 */
export const createMatcher = <TError extends Error>(
  type: Function | Falsy,
  props: Dict | undefined,
): Matcher<TError> => {
  return (error: unknown): error is TError => {
    return typeof type === 'function' && error instanceof type && (!props || deepMatch(error, props));
  };
};

const deepMatch = <const T>(value: unknown, match: T): value is T => {
  if (value === match) return true;

  if (isArray(value) && isArray(match)) {
    if (value.length !== match.length) return false;

    for (let i = 0; i < value.length; ++i) {
      if (!deepMatch(value[i], match[i])) return false;
    }

    return true;
  }

  if (isObject(value) && isDict(match)) {
    const keys = Object.getOwnPropertyNames(match);

    for (const key of keys) {
      if (!deepMatch(value[key], match[key])) return false;
    }

    return true;
  }

  return false;
};
