import { type NotNever } from './types.js';

type UndefinedKeys<T> = {
  [P in keyof T]-?: undefined extends T[P] ? P : never;
}[keyof T];

export type AutoPartial<T> = Omit<T, UndefinedKeys<T>> & Partial<Pick<T, UndefinedKeys<T>>>;
export type Simplify<T> = T extends object ? { [P in keyof T]: T[P] } : T;

export type Merged<TBase, TSources> = TSources extends [infer TSource, ...infer TRest]
  ? Merged<
      {
        [P in Extract<keyof TBase | keyof TSource, string>]: P extends keyof TBase
          ? P extends keyof TSource
            ? undefined extends NotNever<TSource[P]>
              ? NotNever<TBase[P]> | Exclude<NotNever<TSource[P]>, undefined>
              : NotNever<TSource[P]>
            : NotNever<TBase[P]>
          : NotNever<TSource[P & keyof TSource]>;
      },
      TRest
    >
  : AutoPartial<TBase>;

export const merge = <TBase extends object, TSources extends readonly (object | undefined)[]>(
  a: TBase | undefined,
  ...[b, ...rest]: TSources
): Simplify<Merged<TBase, TSources>> => {
  while (b !== undefined) {
    a = Object.assign({}, a, Object.fromEntries(Object.entries(b).filter(([, v]) => v !== undefined)));
    b = rest.shift();
  }

  return a as unknown as Simplify<Merged<TBase, TSources>>;
};
