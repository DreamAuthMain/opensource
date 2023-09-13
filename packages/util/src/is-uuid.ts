export type UuidLike = `${string}-${string}-${string}-${string}-${string}`;

export const isUUID = (value: unknown): value is UuidLike => {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu.test(value);
};
