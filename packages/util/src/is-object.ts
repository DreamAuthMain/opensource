import { isArray } from './is-array.js';
import { type ObjectLiteral } from './types.js';

export const isObject = (value: unknown): value is ObjectLiteral => {
  return typeof value === 'object' && value !== null && !isArray(value);
};
