import { type ObjectLiteral } from './types.js';

export const isObjectLiteral = <T>(value: T): value is Extract<T & {}, ObjectLiteral> & ObjectLiteral => {
  if (typeof value !== 'object') return false;
  if (value === null) return false;

  const prototype = Object.getPrototypeOf(value);

  return prototype === null || prototype === Object.prototype;
};
