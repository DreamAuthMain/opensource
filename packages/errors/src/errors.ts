type ErrorFn<K extends keyof any> = (code: K | null, cause?: unknown) => never;

declare global {
  interface Error {
    code?: unknown;
    cause?: unknown;
  }
}

export const createErrors = <T extends Record<string, string>>(errors: T): [error: ErrorFn<keyof T>, errors: T] => {
  const error: ErrorFn<keyof T> = (code, cause) => {
    const throwable = new Error(code == null ? 'unknown error' : errors[code]);
    throwable.code = code;
    throwable.cause = cause;
    throw throwable;
  };

  return [error, { ...errors }];
};
