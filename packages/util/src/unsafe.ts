import { deepMatch } from './deep-match.js';
import { isPromiseLike } from './is-promise-like.js';
import { type NotNever, type ObjectLiteral } from './types.js';

type ErrorConstructor<TError extends Error> = new (...args: any[]) => TError;

type ErrorCallback<TReturn, TError extends Error, TProps extends ObjectLiteral> = (
  this: UnsafeContext,
  error: TError & TProps & ObjectLiteral,
) => TReturn;

interface ErrorHandler<TReturn = any> {
  readonly match: (error: Error) => error is Error;
  readonly handle: 'retry' | ErrorCallback<TReturn, any, ObjectLiteral>;
}

interface UnsafeContext {
  readonly retry: number;
  readonly previousErrors: readonly Error[];
}

type UnsafeCallback<TReturn, TArgs extends unknown[]> = (this: UnsafeContext, ...args: TArgs) => TReturn;

type UnsafeResult<
  TReturn,
  THandlerReturn,
  TCleanerReturn extends void | PromiseLike<void>,
  TRetry extends boolean,
> = NotNever<Extract<TReturn | TCleanerReturn, PromiseLike<unknown>>> extends PromiseLike<unknown>
  ? PromiseLike<Awaited<TReturn | THandlerReturn>>
  : TRetry extends true
  ? NotNever<Extract<THandlerReturn, PromiseLike<unknown>>> extends PromiseLike<unknown>
    ? PromiseLike<Awaited<TReturn | THandlerReturn>> | Exclude<TReturn | THandlerReturn, PromiseLike<unknown>>
    : TReturn | THandlerReturn
  : TReturn | THandlerReturn;

interface Unsafe<
  TReturn,
  THandlerReturn,
  TCleanerReturn extends void | PromiseLike<void>,
  TRetry extends boolean,
  TArgs extends unknown[],
> {
  /**
   * Set the maximum number of retries (default = 1).
   */
  readonly maxRetries: (count: number) => Unsafe<TReturn, THandlerReturn, TCleanerReturn, TRetry, TArgs>;

  /**
   * Retry when a matching error occurs. The default number of retries
   * is 1, but it can be changed by calling `maxRetries(count)`.
   */
  readonly retry: {
    (type: ErrorConstructor<any>): Unsafe<TReturn, THandlerReturn, TCleanerReturn, true, TArgs>;
    (props: ObjectLiteral): Unsafe<TReturn, THandlerReturn, TCleanerReturn, true, TArgs>;
    (type: ErrorConstructor<any>, props: ObjectLiteral): Unsafe<TReturn, THandlerReturn, TCleanerReturn, true, TArgs>;
  };

  /**
   * Invoke a callback matching errors.
   */
  readonly handle: {
    <TNewHandlerReturn, TError extends Error>(
      type: ErrorConstructor<TError>,
      handle: ErrorCallback<TNewHandlerReturn, TError, {}>,
    ): Unsafe<TReturn, THandlerReturn | TNewHandlerReturn, TCleanerReturn, TRetry, TArgs>;
    <TNewHandlerReturn, const TProps extends ObjectLiteral>(
      props: TProps,
      handle: ErrorCallback<TNewHandlerReturn, Error, TProps>,
    ): Unsafe<TReturn, THandlerReturn | TNewHandlerReturn, TCleanerReturn, TRetry, TArgs>;
    <TNewHandlerReturn, TError extends Error, const TProps extends ObjectLiteral>(
      type: ErrorConstructor<TError>,
      props: TProps,
      handle: ErrorCallback<TNewHandlerReturn, TError, TProps>,
    ): Unsafe<TReturn, THandlerReturn | TNewHandlerReturn, TCleanerReturn, TRetry, TArgs>;
  };

  /**
   * Add a callback to be invoked immediately before the final value is
   * returned or an handled error is thrown.
   *
   * Cleanup callbacks are invoked in the order they are defined.
   */
  readonly cleanup: <TNewCleanerReturn extends void | PromiseLike<void>>(
    callback: () => TNewCleanerReturn,
  ) => Unsafe<TReturn, THandlerReturn, TCleanerReturn | TNewCleanerReturn, TRetry, TArgs>;

  /**
   * Call the unsafe function, invoke any matched error handlers, and
   * return the final result.
   */
  readonly call: (...args: TArgs) => UnsafeResult<TReturn, THandlerReturn, TCleanerReturn, TRetry>;
}

const getError = (error: unknown): Error => {
  return error instanceof Error ? error : new TypeError('Invalid Error', { cause: error });
};

const getErrorMatcher = <TError extends Error>({
  type,
  props,
}: {
  type?: Function;
  props?: ObjectLiteral;
}): ((error: unknown) => error is TError) => {
  return (error: unknown): error is TError => {
    return (!type || error instanceof type) && (!props || deepMatch(error, props));
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
  TRetry extends boolean,
  TArgs extends unknown[],
>(
  callback: UnsafeCallback<TReturn, TArgs>,
  handlers: readonly ErrorHandler<THandlerReturn>[],
  cleaners: readonly (() => TCleanerReturn)[],
  maxRetries: number,
): Unsafe<TReturn, THandlerReturn, TCleanerReturn, TRetry, TArgs> => {
  return {
    maxRetries: (count) => {
      return createUnsafe(callback, handlers, cleaners, count);
    },
    retry: (...args: [type: Function] | [props: {}] | [type: Function, props: ObjectLiteral]) => {
      const [type, props] =
        args.length === 2 ? args : typeof args[0] === 'function' ? [args[0], undefined] : [undefined, args[0]];

      return createUnsafe(
        callback,
        [...handlers, { match: getErrorMatcher({ type, props }), handle: 'retry' }],
        cleaners,
        maxRetries,
      );
    },
    handle: <TNewHandlerReturn>(
      ...args:
        | [type: Function, errorCallback: ErrorCallback<TNewHandlerReturn, any, ObjectLiteral>]
        | [props: ObjectLiteral, errorCallback: ErrorCallback<TNewHandlerReturn, any, ObjectLiteral>]
        | [type: Function, props: ObjectLiteral, errorCallback: ErrorCallback<TNewHandlerReturn, any, ObjectLiteral>]
    ) => {
      const [type, props, errorCallback] =
        args.length === 3
          ? args
          : typeof args[0] === 'function'
          ? [args[0], undefined, args[1]]
          : [undefined, args[0], args[1]];

      return createUnsafe<TReturn, THandlerReturn | TNewHandlerReturn, TCleanerReturn, TRetry, TArgs>(
        callback,
        [...handlers, { match: getErrorMatcher({ type, props }), handle: errorCallback }],
        cleaners,
        maxRetries,
      );
    },
    cleanup: <TNewCleanerReturn extends void | PromiseLike<void>>(cleaner: () => TNewCleanerReturn) => {
      return createUnsafe<TReturn, THandlerReturn, TCleanerReturn | TNewCleanerReturn, TRetry, TArgs>(
        callback,
        handlers,
        [...cleaners, cleaner],
        maxRetries,
      );
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

          if (handler) {
            if (handler.handle === 'retry') {
              previousErrors = [...previousErrors, error];
              return next(remainingRetries - 1);
            }

            return handler.handle.call(context, error);
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
        const errorResult = chain(cleaners);

        if (isPromiseLike(errorResult)) {
          return errorResult.then(() => {
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
): Unsafe<TReturn, never, void, false, TArgs> => {
  return createUnsafe(callback, [], [], 1);
};
