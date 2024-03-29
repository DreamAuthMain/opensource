import { isArray } from './is-array.js';
import { isDict } from './is-dict.js';
import { isObject } from './is-object.js';

export const deepMatch = <const T>(value: unknown, match: T): value is T => {
  if (value === match) return true;

  if (isArray(value) && isArray(match)) {
    if (value.length !== match.length) return false;

    for (let i = 0; i < value.length; ++i) {
      if (!deepMatch(value[i], match[i])) return false;
    }

    return true;
  }

  if (isObject(value) && isDict(match)) {
    const keys = Object.getOwnPropertyNames(match);

    for (const key of keys) {
      if (!deepMatch(value[key], match[key])) return false;
    }

    return true;
  }

  return false;
};
