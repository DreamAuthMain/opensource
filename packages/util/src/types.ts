export type ObjectLiteral = Readonly<Record<string, unknown>>;

export type Simplify<T> = T extends ObjectLiteral ? { [P in keyof T]: T[P] } : T;

export type ObjectLike = Readonly<Record<string, any>>;

/**
 * @deprecated Use `ObjectLike` instead.
 */
export type AnyRecord = ObjectLike;

export type KeyOf<TItem extends AnyRecord, TType = any> = {
  [P in Extract<keyof TItem, string>]: TItem[P] extends TType ? P : never;
}[Extract<keyof TItem, string>];

export type NotNever<T, V = undefined> = ((a: never) => void) extends (a: T) => void ? V : T;

export type UndefinedKeys<T> = {
  [P in keyof T]-?: undefined extends T[P] ? P : never;
}[keyof T];

export type AutoPartial<T> = T extends ObjectLiteral
  ? Omit<T, UndefinedKeys<T>> & Partial<Pick<T, UndefinedKeys<T>>>
  : T;
