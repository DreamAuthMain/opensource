type ArrayType<T extends ArrayLike<any>> = T extends ArrayLike<infer V> ? V : unknown;
type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer V) => any ? V : never;
type Simplify<T> = any extends any ? { [K in keyof T]: T[K] } : never;

type Predicate<T> = {
  <U>(u: U): u is unknown extends U ? T & unknown : T & U;
};

export const options = {
  maxBreadth: Number.POSITIVE_INFINITY,
  maxDepth: 100,
};

const predicate_ =
  <T>(test: ((value: unknown) => value is T) | ((value: unknown) => boolean)): Predicate<T> =>
  (u): u is any => {
    try {
      return ((predicate_ as any)._depth = ((predicate_ as any)._depth >>> 0) + 1) > options.maxDepth || test(u);
    } finally {
      (predicate_ as any)._depth = Math.max(0, (predicate_ as any)._depth - 1);
    }
  };
export { predicate_ as predicate };

type Infer<P extends (u: unknown) => boolean> = P extends (u: unknown) => u is infer T ? T : never;
type AnyPredicate = (u: unknown) => u is unknown;

export type Schema<T> = Predicate<T> & {
  optional(): Schema<T | undefined>;
  or<P extends AnyPredicate>(p: P): Schema<T | Infer<P>>;
  and<P extends AnyPredicate>(p: P): Schema<UnionToIntersection<T | Infer<P>>>;
};

export type SchemaType<S extends Schema<any>> = S extends Schema<infer T> ? T : never;

export const schema = <T>(test: ((value: unknown) => value is T) | ((value: unknown) => boolean)): Schema<T> => {
  const p = predicate_<T>(test);
  return Object.assign(p, {
    or: <P extends AnyPredicate>(p0: P) => union(p, p0),
    and: <P extends AnyPredicate>(p0: P) => intersection(p, p0),
    optional: () => notDefined().or(p),
  });
};

export const lazy = <P extends AnyPredicate>(factory: () => P) => predicate_<Infer<P>>((u) => factory()(u));

export const assert: <P extends AnyPredicate, T extends Infer<P>>(
  predicate: P,
  value: unknown,
  error?: string | Error | (() => string | Error),
) => asserts value is T = (predicate, value, error = 'value does not match schema') => {
  if (!predicate(value)) {
    error = typeof error === 'function' ? error() : error;
    throw typeof error === 'string' ? TypeError(error) : error;
  }
};

//
// Simple Schemas
//

export const string = () => schema<string>((u) => typeof u === 'string');
export const number = () => schema<number>((u) => typeof u === 'number');
export const boolean = () => schema<boolean>((u) => typeof u === 'boolean');
export const literal = <V extends (boolean | number | string)[]>(...primitives: V) =>
  schema<ArrayType<V>>((u) => primitives.some((v) => v === u));

export const array = (): Schema<unknown[]> => schema<unknown[]>((u) => Array.isArray(u));
export const record = (): Schema<Record<string, unknown>> =>
  schema<Record<string, unknown>>((u) => typeof u === 'object' && u !== null);

export const notDefined = <T extends undefined | void = undefined>() => schema<T>((u) => typeof u === 'undefined');
export const defined = () => schema<{} | null>((u) => typeof u !== 'undefined');
export const nul = () => schema<null>((u) => u === null);
export const notNul = () => schema<{} | undefined>((u) => u !== null);
export const nil = () => schema<null | undefined>((u) => u == null);
export const notNil = () => schema<{}>((u) => u != null);

//
// Composition Schemas
//

export const union = <P extends [AnyPredicate, AnyPredicate, ...AnyPredicate[]]>(...predicates: P) =>
  schema<Infer<ArrayType<P>>>((u) => predicates.some((p) => p(u)));
export const intersection = <P extends [AnyPredicate, AnyPredicate, ...AnyPredicate[]]>(...predicates: P) =>
  schema<UnionToIntersection<Infer<ArrayType<P>>>>((u) => predicates.every((p) => p(u)));

type SmartPartial<T> = UnionToIntersection<
  { [K in keyof T]: undefined extends T[K] ? { [K0 in K]?: T[K] } : { [K0 in K]: T[K] } }[keyof T]
>;
type InferObject<P extends Record<string, AnyPredicate>> = Simplify<SmartPartial<{ [K in keyof P]: Infer<P[K]> }>>;

export type ObjectSchema<T extends object> = Schema<T & Record<string, unknown>> & {
  partial(): ObjectSchema<Simplify<Partial<T>>>;
  required(): ObjectSchema<Simplify<Required<T>>>;
  extend<P extends Record<string, AnyPredicate>>(p: P): ObjectSchema<Simplify<T & InferObject<P>>>;
};

export const object = <P extends Record<string, AnyPredicate> = {}, T extends InferObject<P> = InferObject<P>>(
  shape: P = {} as P,
): ObjectSchema<T> => {
  return Object.assign(
    schema<T>(
      (u: any) =>
        typeof u === 'object' &&
        u !== null &&
        Object.entries(shape)
          .slice(0, options.maxBreadth)
          .every(([key, p]) => p(u[key])),
    ),
    {
      partial: () => object(Object.fromEntries(Object.entries(shape).map(([k, p]) => [k, notDefined().or(p)]))),
      required: () => object(Object.fromEntries(Object.entries(shape).map(([k, p]) => [k, defined().and(p)]))),
      extend: (ps0: Record<string, AnyPredicate>) =>
        object(
          [...Object.entries(shape), ...Object.entries(ps0)].reduce<Record<string, AnyPredicate>>(
            (r, [k, v]) => ({ ...r, [k]: k in r ? intersection(r[k] as AnyPredicate, v) : v }),
            {},
          ),
        ),
    },
  ) as ObjectSchema<T>;
};
