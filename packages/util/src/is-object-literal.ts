export const isObjectLiteral = (value: unknown): value is Readonly<Record<string, unknown>> => {
  if (typeof value !== 'object') return false;
  if (value === null) return false;

  const prototype = Object.getPrototypeOf(value);

  return prototype === null || prototype === Object.prototype;
};
