import { type AutoPartial, type NotNever, type Simplify } from './types.js';

export type Assigned<TBase, TValues> = TValues extends [infer TFirst, ...infer TRest]
  ? Assigned<
      {
        [P in Extract<keyof TBase | keyof TFirst, string>]: P extends keyof TBase
          ? P extends keyof TFirst
            ? undefined extends NotNever<TFirst[P]>
              ? NotNever<TBase[P]> | NotNever<TFirst[P]>
              : NotNever<TFirst[P]>
            : NotNever<TBase[P]>
          : NotNever<TFirst[P & keyof TFirst]>;
      },
      TRest
    >
  : AutoPartial<TBase>;

export const assign = <TBase extends object, TValues extends readonly (object | undefined | null)[]>(
  base: TBase | undefined | null,
  ...values: TValues
): Simplify<Assigned<TBase, TValues>> => {
  let result: Record<string, any> = base ?? {};

  for (const value of values) {
    if (value == null) continue;
    result = Object.assign({}, result, value);
  }

  return result as Simplify<Assigned<TBase, TValues>>;
};
