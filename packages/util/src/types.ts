export type AnyRecord = Readonly<Record<string, any>>;

export type KeyOf<TItem extends AnyRecord, TType = any> = {
  [P in Extract<keyof TItem, string>]: TItem[P] extends TType ? P : never;
}[Extract<keyof TItem, string>];

export type NotNever<T, V = undefined> = ((a: never) => void) extends (a: T) => void ? V : T;

export type UndefinedKeys<T> = {
  [P in keyof T]-?: undefined extends T[P] ? P : never;
}[keyof T];

export type AutoPartial<T> = Omit<T, UndefinedKeys<T>> & Partial<Pick<T, UndefinedKeys<T>>>;

export type PickPartial<T, TKey extends keyof T> = Partial<Pick<T, TKey>> & Omit<T, TKey>;

export type Simplify<T> = T extends object ? { [P in keyof T]: T[P] } : T;
