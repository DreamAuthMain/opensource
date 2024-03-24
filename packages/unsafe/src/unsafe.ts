import { type Dict, type Falsy, isObject } from '@dreamauth/util';

import { createMatcher, type Matcher } from './match.js';

type ErrorConstructor<TError extends Error> = new (...args: any[]) => TError;
type InferErrorProps<T> = T extends Error ? { readonly [P in keyof T]?: T[P] } : never;
type AnyError = Error & Dict;

type Handler<TReturn, TError extends Error> = (
  this: UnsafeContext,
  error: TError,
  context: UnsafeContext,
) => TReturn | PromiseLike<TReturn>;

interface HandlerEntry<TReturn> {
  readonly match: Matcher<AnyError>;
  readonly action: 'retry' | Handler<TReturn, AnyError>;
}

/**
 * Information about the current retry attempt which passed to handlers.
 */
export interface UnsafeContext {
  /**
   * The current retry attempt number (0 = first attempt).
   */
  readonly retry: number;
  /**
   * The list of errors that occurred during the operation, most recent
   * last.
   */
  readonly errors: readonly Error[];
}

/**
 * Wrapper for an unsafe operation with error handling and retry logic.
 */
export interface Unsafe<TReturn, THandlerReturn, TArgs extends unknown[]> {
  /**
   * Set the maximum number of retries (default = 1).
   */
  readonly maxRetries: (count: number) => Unsafe<TReturn, THandlerReturn, TArgs>;

  /**
   * Match an error by type and/or properties, and mark it as retryable.
   * The default maximum number of retries is 1, which can be changed by
   * calling the `maxRetries` method.
   */
  readonly retry: <TError extends Error>(
    type: ErrorConstructor<TError> | Falsy,
    props?: InferErrorProps<TError>,
  ) => Unsafe<TReturn, THandlerReturn, TArgs>;

  /**
   * Match an error by type and/or properties, and handle it with a
   * callback. The callback may return a value or throw a new error.
   * Errors thrown by handlers are not caught by other handlers.
   */
  readonly handle: {
    <TError extends Error, TNewHandlerReturn = undefined>(
      type: ErrorConstructor<TError> | Falsy,
      handle?: Handler<TNewHandlerReturn, TError>,
    ): Unsafe<TReturn, THandlerReturn | TNewHandlerReturn, TArgs>;
    <TError extends Error, TNewHandlerReturn = undefined>(
      type: ErrorConstructor<TError> | Falsy,
      props: InferErrorProps<TError>,
      handle?: Handler<TNewHandlerReturn, TError>,
    ): Unsafe<TReturn, THandlerReturn | TNewHandlerReturn, TArgs>;
  };

  /**
   * Add a callback to be invoked immediately before the final value is
   * returned or an handled error is thrown.
   *
   * Cleanup callbacks are invoked in the order they are defined.
   */
  readonly cleanup: (callback: () => void | PromiseLike<void>) => Unsafe<TReturn, THandlerReturn, TArgs>;

  /**
   * Call the unsafe function, invoke any matched error handlers, and
   * return the final result.
   */
  readonly call: (...args: TArgs) => Promise<TReturn | THandlerReturn>;
}

const createUnsafe = <TReturn, THandlerReturn, TArgs extends unknown[]>(
  callback: (this: UnsafeContext, ...args: TArgs) => TReturn | PromiseLike<TReturn>,
  handlers: readonly HandlerEntry<THandlerReturn>[],
  cleaners: readonly (() => void | PromiseLike<void>)[],
  maxRetries: number,
): Unsafe<TReturn, THandlerReturn, TArgs> => {
  return {
    maxRetries: (count) => {
      return createUnsafe(callback, handlers, cleaners, count);
    },

    retry: (type: ErrorConstructor<AnyError> | Falsy, props?: Dict) => {
      const match = createMatcher(type, props);

      return createUnsafe(callback, [...handlers, { match, action: 'retry' }], cleaners, maxRetries);
    },

    handle: <TNewHandlerReturn>(
      ...args:
        | [type: ErrorConstructor<AnyError> | Falsy, errorCallback?: Handler<TNewHandlerReturn, AnyError>]
        | [type: ErrorConstructor<AnyError> | Falsy, props: Dict, errorCallback?: Handler<TNewHandlerReturn, AnyError>]
    ) => {
      const type = args[0];
      const props = isObject(args[1]) || !args[1] ? args[1] : undefined;
      const action = (
        typeof args[1] === 'function'
          ? args[1]
          : typeof args[2] === 'function'
            ? args[2]
            : () => undefined as TNewHandlerReturn
      ) as Handler<TNewHandlerReturn, AnyError>;
      const match = createMatcher(type, props);

      return createUnsafe<TReturn, THandlerReturn | TNewHandlerReturn, TArgs>(
        callback,
        [...handlers, { match, action }],
        cleaners,
        maxRetries,
      );
    },

    cleanup: (cleaner) => {
      return createUnsafe(callback, handlers, [...cleaners, cleaner], maxRetries);
    },

    call: async (...args) => {
      let errors: readonly Error[] = [];
      let error: AnyError = new Error('Unsafe operation failed.');

      try {
        for (let retry = 0; retry === 0 || retry <= maxRetries; ++retry) {
          const context = { retry, errors };

          try {
            return await callback.call(context, ...args);
          }
          catch (cause) {
            error = getError(cause);
            errors = [...errors, error];

            const handler = handlers.find(
              ({ match, action }) => (action !== 'retry' || retry < maxRetries) && match(error),
            );

            if (!handler) break;
            if (handler.action === 'retry') continue;

            return await handler.action.call(context, error, context);
          }
        }
      }
      finally {
        for (const cleaner of cleaners) {
          await cleaner();
        }
      }

      throw error;
    },
  };
};

/**
 * Wrap a function that might throw with error handling and retry logic.
 *
 * Handled errors (`handle`), retryable errors (`retry`), and allowed
 * errors (`allow`), are matched in the order they are defined.
 *
 * Only one handler callback is ever invoked. If a handler throws, will
 * not be caught by another handler.
 */
export const unsafe = <TReturn, TArgs extends unknown[] = unknown[]>(
  callback: (this: UnsafeContext, ...args: TArgs) => TReturn | PromiseLike<TReturn>,
): Unsafe<TReturn, never, TArgs> => {
  return createUnsafe(callback, [], [], 1);
};

const getError = (error: unknown): Error & Dict<unknown> => {
  return (error instanceof Error ? error : new TypeError('Invalid Error', { cause: error })) as AnyError;
};
