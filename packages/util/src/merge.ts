import { type AutoPartial, type NotNever, type ObjectLiteral, type Simplify } from './types.js';

export type Merged<
  TBase extends ObjectLiteral | undefined | null,
  TValues extends readonly (ObjectLiteral | undefined | null)[],
> = TValues extends readonly [infer TFirst, ...infer TRest]
  ? Merged<
      {
        [P in Extract<keyof TBase | keyof TFirst, string>]: P extends keyof TBase
          ? P extends keyof TFirst
            ? undefined extends NotNever<TFirst[P]>
              ? NotNever<TBase[P]> | Exclude<NotNever<TFirst[P]>, undefined>
              : NotNever<TFirst[P]>
            : NotNever<TBase[P]>
          : NotNever<TFirst[P & keyof TFirst]>;
      },
      TRest extends readonly (ObjectLiteral | undefined | null)[] ? TRest : []
    >
  : AutoPartial<TBase>;

export const merge = <
  const TBase extends ObjectLiteral | undefined | null,
  const TValues extends readonly (ObjectLiteral | undefined | null)[],
>(
  base: TBase,
  ...values: TValues
): Simplify<Merged<TBase, TValues>> => {
  let result: Record<string, any> = base ?? {};

  for (const value of values) {
    if (value == null) continue;
    result = Object.assign({}, result, Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)));
  }

  return result as Simplify<Merged<TBase, TValues>>;
};
