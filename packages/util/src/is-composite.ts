import { type ObjectLiteral } from './types.js';

export const isComposite = (value: unknown): value is ObjectLiteral => {
  return typeof value === 'function' || (typeof value === 'object' && value !== null);
};

/**
 * @deprecated Use `isComposite` instead.
 */
export const isIndexable = isComposite;
