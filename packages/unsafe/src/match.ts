import { deepMatch, type Dict, type Falsy, isObject, type Primitive } from '@dreamauth/util';

export type Match<TError extends Error> = (error: unknown) => error is TError;

export type MatchArgs<TArgs extends readonly (Function | Primitive)[] = []> =
  | [type: Function | Falsy, ...args: TArgs]
  | [props: Dict<any>, ...args: TArgs]
  | [type: Function | Falsy, props: Dict<any>, ...args: TArgs];

export const getMatchArgs = <TArgs extends readonly (Function | Primitive)[] = []>(
  args: MatchArgs<TArgs>,
): [type: Function | Falsy, props: Dict<unknown> | undefined, ...args: TArgs] => {
  const type = typeof args[0] === 'function' || !args[0] ? args[0] : Error;
  const props = isObject(args[0]) ? args[0] : isObject(args[1]) ? args[1] : undefined;
  const otherArgs = (isObject(args[1]) ? args.slice(2) : args.slice(1)) as unknown as TArgs;

  return [type, props, ...otherArgs];
};

export const createMatch = <TError extends Error>(
  type: Function | Falsy,
  props: Dict<any> | undefined,
): Match<TError> => {
  return (error: unknown): error is TError => {
    return typeof type === 'function' && error instanceof type && (!props || deepMatch(error, props));
  };
};
