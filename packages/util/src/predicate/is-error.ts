/**
 * Error type predicate which allows for checking the error code.
 */
export const isError: {
  (value: unknown): value is Error & { readonly code?: unknown; readonly cause?: unknown };
  <TCode extends string>(
    value: unknown,
    ...codes: readonly (TCode | { readonly code: TCode })[]
  ): value is Error & { readonly code: TCode; readonly cause?: unknown };
} = (
  value: unknown,
  ...codes: readonly (string | { readonly code: string })[]
): value is Error & { readonly code: unknown; readonly cause?: unknown } => {
  return (
    value instanceof Error
    && (codes.length === 0
    || ('code' in value
    && codes.some((code) => {
      return typeof code === 'string' ? value.code === code : value.code === code.code;
    })))
  );
};
