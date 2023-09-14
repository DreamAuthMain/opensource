export type UuidLike = `${string}-${string}-${string}-${string}-${string}`;

export const isUUID = (value: unknown): value is UuidLike => {
  return typeof value === 'string' && /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu.test(value);
};
