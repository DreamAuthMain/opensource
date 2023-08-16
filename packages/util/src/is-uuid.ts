export const isUUID = (value: unknown): value is `${string}-${string}-${string}-${string}-${string}` => {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value);
};
