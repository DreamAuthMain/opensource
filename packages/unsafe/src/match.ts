import { deepMatch, type Dict, type Falsy } from '@dreamauth/util';

export type Match<TError extends Error> = (error: unknown) => error is TError;

export const createMatch = <TError extends Error>(type: Function | Falsy, props: Dict | undefined): Match<TError> => {
  return (error: unknown): error is TError => {
    return typeof type === 'function' && error instanceof type && (!props || deepMatch(error, props));
  };
};
