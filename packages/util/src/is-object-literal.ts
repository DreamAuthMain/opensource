import { type ObjectLiteral } from './types.js';

export const isObjectLiteral = (value: unknown): value is ObjectLiteral => {
  if (typeof value !== 'object') return false;
  if (value === null) return false;

  const prototype = Object.getPrototypeOf(value);

  return prototype === null || prototype === Object.prototype;
};
