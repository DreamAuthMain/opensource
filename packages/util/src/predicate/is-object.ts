import { type Dict } from '../types.js';

/**
 * Any non-primitive and non-function value.
 */
export const isObject = (value: unknown): value is Dict<unknown> => {
  return typeof value === 'object' && value !== null;
};
