export const isError: {
  (value: unknown): value is Error & { readonly code?: unknown; readonly cause?: unknown };
  <TCode extends string>(
    value: unknown,
    code: TCode | { readonly code: TCode },
  ): value is Error & { readonly code: TCode; readonly cause?: unknown };
} = (
  value: unknown,
  code?: string | { readonly code: string },
): value is Error & { readonly code: unknown; readonly cause?: unknown } => {
  code = typeof code === 'string' ? code : code?.code;
  return value instanceof Error && (code == null || value.code === code);
};
