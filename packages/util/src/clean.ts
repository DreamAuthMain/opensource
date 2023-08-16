import { type AutoPartial } from './types.js';

export const clean = <TValue extends object>(obj: TValue): AutoPartial<TValue> => {
  return Object.fromEntries(
    Object.entries(obj).flatMap(([key, value]) => (value === undefined ? [] : [[key, value]])),
  ) as AutoPartial<TValue>;
};
