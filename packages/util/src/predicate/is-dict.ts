import { type Dict } from '../types.js';

/**
 * A dictionary is an object with- `null` or `Object.prototype` prototype.
 * This does not include classes or arrays.
 */
export const isDict = (value: unknown): value is Dict<unknown> => {
  if (typeof value !== 'object' || value === null) return false;

  const prototype = Object.getPrototypeOf(value);

  return prototype === null || prototype === Object.prototype;
};
