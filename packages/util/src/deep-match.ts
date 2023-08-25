import { isArray } from './is-array.js';
import { isIndexable } from './is-indexable.js';
import { isObjectLiteral } from './is-object-literal.js';

export const deepMatch = <A, B>(value: A, test: B): value is A & B => {
  if ((value as unknown) === test) return true;

  if (isArray(value) && isArray(test)) {
    if (value.length !== test.length) return false;

    for (let i = 0; i < value.length; ++i) {
      if (!deepMatch(value[i], test[i])) return false;
    }

    return true;
  }

  if (isIndexable(value) && isObjectLiteral(test)) {
    const keys = Object.getOwnPropertyNames(test);

    for (const key of keys) {
      if (!deepMatch(value[key], test[key])) return false;
    }

    return true;
  }

  return false;
};
