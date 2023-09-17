import { type Dict } from '@dreamauth/util';

export type ErrorConstructor<TError extends Error> = new (...args: any[]) => TError;
export type InferErrorProps<T> = T extends Error ? { readonly [P in keyof T]?: T[P] } : never;
export type AnyError = Error & Dict;

export const getError = (error: unknown): Error & Dict<unknown> => {
  return (error instanceof Error ? error : new TypeError('Invalid Error', { cause: error })) as AnyError;
};
