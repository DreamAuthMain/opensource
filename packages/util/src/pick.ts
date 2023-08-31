export type Picked<
  TValue extends Record<string | symbol | number, any>,
  TKey extends string | number | symbol,
> = any extends any
  ? {
      [P in TKey]: P extends keyof TValue ? TValue[P] : unknown;
    }
  : never;

export const pick = <
  TValue extends Readonly<Record<string | symbol | number, any>>,
  TKey extends string | symbol | number,
>(
  value: TValue,
  ...keys: TKey[]
): Picked<TValue, TKey> => {
  const result: Record<string | number | symbol, any> = {};

  for (const key of keys) {
    result[key] = key in value ? value[key] : undefined;
  }

  return result as Picked<TValue, TKey>;
};
