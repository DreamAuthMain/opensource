import { type AutoPartial, type NotNever, type ObjectLiteral, type Simplify } from './types.js';

export type Assigned<
  TBase extends ObjectLiteral | undefined | null,
  TValues extends readonly (ObjectLiteral | undefined | null)[],
> = TValues extends readonly [infer TFirst, ...infer TRest]
  ? TBase extends ObjectLiteral
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
        TRest extends readonly (ObjectLiteral | undefined | null)[] ? TRest : []
      >
    : (TBase extends {} ? TBase : unknown) &
        Simplify<
          Assigned<
            TFirst extends ObjectLiteral ? TFirst : {},
            TRest extends readonly (ObjectLiteral | undefined | null)[] ? TRest : []
          >
        >
  : AutoPartial<TBase>;

export const assign = <
  const TBase extends ObjectLiteral | undefined | null,
  const TValues extends readonly (ObjectLiteral | undefined | null)[],
>(
  base: TBase,
  ...values: TValues
): Simplify<Assigned<TBase, TValues>> => {
  let result: Record<string, any> = base ?? {};

  for (const value of values) {
    if (value == null) continue;
    result = Object.assign({}, result, value);
  }

  return result as Simplify<Assigned<TBase, TValues>>;
};
