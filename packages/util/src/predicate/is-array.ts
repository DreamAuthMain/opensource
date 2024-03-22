/**
 * Better version of `Array.isArray` that also works with readonly arrays.
 */
export const isArray: (value: unknown) => value is readonly any[] = Array.isArray;
