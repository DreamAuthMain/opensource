export type Picked<
  TValue extends Record<string | symbol | number, any>,
  TKeys extends readonly (string | number | symbol)[],
> = any extends any
  ? {
      [P in TKeys[number]]: P extends keyof TValue ? TValue[P] : unknown;
    }
  : never;

export const pick = <
  TValue extends Readonly<Record<string | symbol | number, any>>,
  TKeys extends readonly (string | symbol | number)[],
>(
  value: TValue,
  ...keys: TKeys
): Picked<TValue, TKeys> => {
  const result: Record<string | number | symbol, any> = {};

  for (const key of keys) {
    result[key] = key in value ? value[key] : undefined;
  }

  return result as Picked<TValue, TKeys>;
};
