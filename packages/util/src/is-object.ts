import { isArray } from './is-array.js';

export const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !isArray(value);
};
