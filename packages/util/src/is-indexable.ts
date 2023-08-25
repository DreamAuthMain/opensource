export const isIndexable = (value: unknown): value is Record<string | number, unknown> => {
  return typeof value === 'object' && value !== null;
};
