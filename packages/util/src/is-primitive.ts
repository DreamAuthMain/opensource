import { type Primitive } from './types.js';

export const isPrimitive = (value: unknown): value is Primitive => {
  return typeof value !== 'function' && (typeof value !== 'object' || value === null);
};
