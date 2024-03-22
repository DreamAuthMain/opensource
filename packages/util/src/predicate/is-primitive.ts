import { type Primitive } from '../types.js';

/**
 * Primitive type predicate.
 */
export const isPrimitive = (value: unknown): value is Primitive => {
  return typeof value !== 'function' && (typeof value !== 'object' || value === null);
};
