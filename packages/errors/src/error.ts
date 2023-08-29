export interface ErrorOptions<TContext extends Record<string, any> = {}> {
  cause?: unknown;
  context?: Partial<TContext> & Record<string, any>;
}

export abstract class DreamAuthError<
  TCode extends string | number | symbol,
  TContext extends Record<string, any> = {},
> extends Error {
  readonly name = this.constructor.name;
  readonly code: TCode;
  readonly context: Partial<TContext> & Record<string, unknown>;

  constructor(message: string, code: TCode, options: Error | ErrorOptions<TContext> = {}) {
    const { cause, context = {} } = options instanceof Error ? { cause: options } : options;
    super(message, { cause });

    this.code = code;
    this.context = context;

    Object.defineProperties(this, {
      message: { ...Object.getOwnPropertyDescriptor(this, 'message'), enumerable: true },
    });
  }

  /** @internal */
  toJSON(): unknown {
    return { code: this.code, name: this.name, message: this.message, context: this.context };
  }

  /** @internal */
  toString(): string {
    return JSON.stringify(this);
  }
}

Object.defineProperties(DreamAuthError.prototype, {
  toJSON: { ...Object.getOwnPropertyDescriptor(DreamAuthError.prototype, 'toJSON'), enumerable: false },
  toString: { ...Object.getOwnPropertyDescriptor(DreamAuthError.prototype, 'toString'), enumerable: false },
});
