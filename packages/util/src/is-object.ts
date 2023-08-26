import { isArray } from './is-array.js';
import { type ObjectLiteral } from './types.js';

export const isObject = <T>(value: T): value is Exclude<Extract<T & {}, object>, readonly any[]> & ObjectLiteral => {
  return typeof value === 'object' && value !== null && !isArray(value);
};
