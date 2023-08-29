export type Simplify<T> = any extends any ? { [P in keyof T]: T[P] } : never;

export type Primitive = string | number | boolean | symbol | bigint | undefined | null;

export type Dict<T> = Readonly<Record<string, T>>;

export type KeyOf<TItem extends object, TType = any> = {
  [P in Extract<keyof TItem, string>]: TItem[P] extends TType ? P : never;
}[Extract<keyof TItem, string>];

export type NotNever<T, V = undefined> = ((a: never) => void) extends (a: T) => void ? V : T;

export type UndefinedKeys<T> = {
  [P in keyof T]-?: undefined extends T[P] ? P : never;
}[keyof T];

export type AutoPartial<T> = T extends object ? Omit<T, UndefinedKeys<T>> & Partial<Pick<T, UndefinedKeys<T>>> : T;

export type Uuid = `${string}-${string}-${string}-${string}-${string}`;

export type Email = `${string}@${string}.${string}`;
