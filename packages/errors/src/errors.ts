type RaiseError<K extends keyof any> = (code: K | null, cause?: unknown) => never;
type Errors<T extends Record<string, string>> = {
  readonly [K in keyof T]: {
    readonly code: K;
    readonly message: T[K];
  };
};

export const createErrors = <T extends Record<string, string>>(
  errorMessages: T,
): [raise: RaiseError<keyof T>, errors: Errors<T>] => {
  const raise: RaiseError<keyof T> = (code, cause) => {
    const throwable: Error & { code?: unknown } = new Error(code == null ? 'unknown error' : errorMessages[code]);
    throwable.code = code;
    throwable.cause = cause;
    throw throwable;
  };

  const errors = Object.fromEntries(
    Object.entries(errorMessages).map(([code, message]) => [code, { code, message }]),
  ) as Errors<T>;

  return [raise, errors];
};
