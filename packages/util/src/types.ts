export type AnyRecord = Readonly<Record<string, any>>;

export type KeyOf<TItem extends AnyRecord, TType = any> = {
  [P in Extract<keyof TItem, string>]: TItem[P] extends TType ? P : never;
}[Extract<keyof TItem, string>];

export type NotNever<T, V = undefined> = ((a: never) => void) extends (a: T) => void ? V : T;
