import { deepMatch } from './deep-match.js';
import { isPromiseLike } from './is-promise-like.js';
import { type NotNever, type Simplify } from './types.js';

type ErrorConstructor<TError extends Error> = new (...args: any[]) => TError;

type ErrorCallback<TReturn, TError extends Error, TProps extends Record<string, unknown>> = (
  this: UnsafeContext,
  error: TError & Simplify<Omit<TProps, '$type'> & Record<string, unknown>>,
) => TReturn;

type ErrorProps<TError extends Error, TProps extends Record<string, unknown>> = {
  readonly $type?: ErrorConstructor<TError>;
} & {
  readonly [P in keyof TProps]: TProps[P];
};

interface ErrorHandler<TReturn = any> {
  readonly match: (error: Error) => error is Error;
  readonly handle: 'retry' | ErrorCallback<TReturn, any, any>;
}

interface UnsafeContext {
  readonly retry: number;
  readonly previousErrors: readonly Error[];
}

type UnsafeCallback<TReturn, TArgs extends unknown[]> = (this: UnsafeContext, ...args: TArgs) => TReturn;

interface Unsafe<TReturn, THandlerReturn, TCleanerReturn extends void | PromiseLike<void>, TArgs extends unknown[]> {
  /**
   * Invoke a callback matching errors.
   */
  readonly handle: <TNewHandlerReturn, TError extends Error, const TProps extends Record<string, unknown>>(
    match: ErrorConstructor<TError> | ErrorProps<TError, TProps>,
    handle: ErrorCallback<TNewHandlerReturn, TError, TProps>,
  ) => Unsafe<TReturn, THandlerReturn | TNewHandlerReturn, TCleanerReturn, TArgs>;

  /**
   * Catch the matching error and return undefined or a literal value.
   */
  readonly allow: <TNewHandlerReturn = undefined>(
    match: ErrorConstructor<any> | ErrorProps<any, any>,
    value?: TNewHandlerReturn,
  ) => Unsafe<TReturn, THandlerReturn | TNewHandlerReturn, TCleanerReturn, TArgs>;

  /**
   * Add a callback to be invoked immediately before the final value is
   * returned or an handled error is thrown.
   *
   * Cleanup callbacks are invoked in the order they are defined.
   */
  readonly cleanup: <TNewCleanerReturn extends void | PromiseLike<void>>(
    callback: () => TNewCleanerReturn,
  ) => Unsafe<TReturn, THandlerReturn, TCleanerReturn | TNewCleanerReturn, TArgs>;

  /**
   * Retry when a matching error occurs. The default number of retries
   * is 1, but it can be changed by calling `maxRetries(count)`.
   */
  readonly retry: (
    match: ErrorConstructor<any> | ErrorProps<any, any>,
  ) => Unsafe<TReturn, THandlerReturn, TCleanerReturn, TArgs>;

  /**
   * Set the maximum number of retries (default = 1).
   */
  readonly maxRetries: (count: number) => Unsafe<TReturn, THandlerReturn, TCleanerReturn, TArgs>;

  /**
   * Call the unsafe function, invoke any matched error handlers, and
   * return the final result.
   */
  readonly call: (
    ...args: TArgs
  ) => NotNever<Extract<TReturn | TCleanerReturn, PromiseLike<unknown>>> extends PromiseLike<unknown>
    ? PromiseLike<Awaited<TReturn | THandlerReturn>>
    : NotNever<Extract<THandlerReturn, PromiseLike<unknown>>> extends PromiseLike<unknown>
    ? PromiseLike<Awaited<TReturn | THandlerReturn>> | Exclude<TReturn | THandlerReturn, PromiseLike<unknown>>
    : TReturn | THandlerReturn;
}

const getError = (error: unknown): Error => {
  return error instanceof Error ? error : new TypeError('Invalid Error', { cause: error });
};

const getErrorMatcher = <TError extends Error>(
  condition: ErrorConstructor<any> | ErrorProps<any, any>,
): ((error: unknown) => error is TError) => {
  return typeof condition === 'function'
    ? (error: unknown): error is TError => error instanceof condition
    : (error: unknown): error is TError => {
        const { $type, ...props } = condition;
        return (!$type || error instanceof $type) && deepMatch(error, props);
      };
};

const chain = ([callback, ...callbacks]: readonly (() => void | PromiseLike<void>)[]): void | PromiseLike<void> => {
  if (!callback) return;

  const result = callback();

  return isPromiseLike(result) ? result.then(() => chain(callbacks)) : chain(callbacks);
};

const createUnsafe = <
  TReturn,
  THandlerReturn,
  TCleanerReturn extends void | PromiseLike<void>,
  TArgs extends unknown[],
>(
  callback: UnsafeCallback<TReturn, TArgs>,
  handlers: readonly ErrorHandler<THandlerReturn>[],
  cleaners: readonly (() => TCleanerReturn)[],
  maxRetries: number,
): Unsafe<TReturn, THandlerReturn, TCleanerReturn, TArgs> => {
  return {
    handle: <TNewHandlerReturn, TError extends Error, const TProps extends Record<string, unknown>>(
      condition: ErrorConstructor<TError> | ErrorProps<TError, TProps>,
      handle: ErrorCallback<TNewHandlerReturn, TError, TProps>,
    ) => {
      return createUnsafe<TReturn, THandlerReturn | TNewHandlerReturn, TCleanerReturn, TArgs>(
        callback,
        [...handlers, { match: getErrorMatcher(condition), handle }],
        cleaners,
        maxRetries,
      );
    },
    allow: <TNewHandlerReturn = undefined>(
      match: ErrorConstructor<any> | ErrorProps<any, any>,
      value?: TNewHandlerReturn,
    ) => {
      return createUnsafe<TReturn, THandlerReturn | TNewHandlerReturn, TCleanerReturn, TArgs>(
        callback,
        [...handlers, { match: getErrorMatcher(match), handle: () => value as TNewHandlerReturn }],
        cleaners,
        maxRetries,
      );
    },
    cleanup: <TNewCleanerReturn extends void | PromiseLike<void>>(cleaner: () => TNewCleanerReturn) => {
      return createUnsafe<TReturn, THandlerReturn, TCleanerReturn | TNewCleanerReturn, TArgs>(
        callback,
        handlers,
        [...cleaners, cleaner],
        maxRetries,
      );
    },
    retry: (match) => {
      return createUnsafe(
        callback,
        [...handlers, { match: getErrorMatcher(match), handle: 'retry' }],
        cleaners,
        maxRetries,
      );
    },
    maxRetries: (count) => {
      return createUnsafe(callback, handlers, cleaners, count);
    },
    call: (...args: TArgs): any => {
      let retry = 0;
      let previousErrors: readonly Error[] = [];

      const next = (remainingRetries: number): unknown => {
        const context: UnsafeContext = { retry: retry++, previousErrors };

        const handleError = (reason: unknown): unknown => {
          const error = getError(reason);
          const handler = handlers.find(
            ({ handle, match }) => (handle !== 'retry' || remainingRetries > 0) && match(error),
          );

          previousErrors = [...previousErrors, error];

          if (handler) {
            return handler.handle === 'retry' ? next(remainingRetries - 1) : handler.handle.call(context, error);
          }

          throw error;
        };

        try {
          const result: unknown = callback.call(context, ...args);

          return isPromiseLike(result) ? result.then(undefined, handleError) : result;
        } catch (reason) {
          return handleError(reason);
        }
      };

      let result: unknown;

      try {
        result = next(maxRetries);
      } catch (error) {
        result = chain(cleaners);

        if (isPromiseLike(result)) {
          return result.then(() => {
            throw error;
          });
        }

        throw error;
      }

      const cleanupResult = isPromiseLike(result)
        ? result.then(
            () => chain(cleaners),
            async (error) => {
              await chain(cleaners);
              throw error;
            },
          )
        : chain(cleaners);

      return isPromiseLike(cleanupResult) ? cleanupResult.then(() => result) : result;
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
  callback: (this: UnsafeContext, ...args: TArgs) => TReturn,
): Unsafe<TReturn, never, void, TArgs> => {
  return createUnsafe(callback, [], [], 1);
};
