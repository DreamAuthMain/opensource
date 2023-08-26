import { type ObjectLiteral } from './types.js';

export const isComposite = <T>(value: T): value is Extract<T & {}, object> & ObjectLiteral => {
  return typeof value === 'function' || (typeof value === 'object' && value !== null);
};

/**
 * @deprecated Use `isComposite` instead.
 */
export const isIndexable = isComposite;
