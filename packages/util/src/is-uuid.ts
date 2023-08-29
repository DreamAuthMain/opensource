export type Uuid = `${string}-${string}-${string}-${string}-${string}`;

export const isUUID = (value: unknown): value is Uuid => {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value);
};
