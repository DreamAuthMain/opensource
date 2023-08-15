import { type AutoPartial, type NotNever, type Simplify } from './types.js';

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

export const merge = <TBase extends object, TSources extends readonly (object | undefined | null)[]>(
  first: TBase | undefined | null,
  ...rest: TSources
): Simplify<Merged<TBase, TSources>> => {
  for (const value of rest) {
    if (value == null) continue;
    first = Object.assign({}, first, Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)));
  }

  return first as unknown as Simplify<Merged<TBase, TSources>>;
};
