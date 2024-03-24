/**
 * A type which converts a complex type into a simple object type.
 *
 * WARNING: This works best on simple value structs. It does not work
 * well with functions, classes, or other complex types.
 */
export type Simplify<T> = any extends any ? { [P in keyof T]: T[P] } : never;

/**
 * Falsy value type.
 */
export type Falsy = false | 0 | 0n | '' | null | undefined;

/**
 * Matches any primitive type.
 */
export type Primitive = string | number | boolean | symbol | bigint | undefined | null;

/**
 * Like `Record`, but the key type is always `string`.
 */
export type Dict<T = any> = Readonly<Record<string, T>>;

/**
 * Like `keyof`, but it only returns string keys and can be narrowed
 * by value type.
 */
export type KeyOf<TItem extends object, TType = any> = {
  [P in Extract<keyof TItem, string>]: TItem[P] extends TType ? P : never;
}[Extract<keyof TItem, string>];

/**
 * Convert a `never` type into `undefined`, or another specific type.
 */
export type NotNever<T, V = undefined> = ((a: never) => void) extends (a: T) => void ? V : T;

/**
 * Get the keys of `T` which can be undefined.
 */
export type UndefinedKeys<T> = {
  [P in keyof T]-?: undefined extends T[P] ? P : never;
}[keyof T];

/**
 * Make all properties of `T` which can be undefined, optional.
 */
export type AutoPartial<T> = T extends object ? Omit<T, UndefinedKeys<T>> & Partial<Pick<T, UndefinedKeys<T>>> : T;

/**
 * Provide auto completion for string literals, while still allowing any
 * string value.
 */
export type StringHint<T extends string> = T | (string & {});

/**
 * Like `Pick`, but it allows any string key. Keys which are not present
 * in `TValue` will be ignored.
 */
export type Select<TValue extends object, TKey extends StringHint<KeyOf<TValue>>> = Pick<
  TValue,
  Extract<TKey, KeyOf<TValue>>
>;
