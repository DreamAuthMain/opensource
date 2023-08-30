export interface DreamAuthErrorOptions<TContext extends Record<string, any> = {}> {
  /**
   * The cause of the error, if any.
   */
  cause?: unknown;
  /**
   * Additional context to be included in the error which may be useful
   * for debugging.
   */
  context?: Partial<TContext> & Record<string, any>;
}

export abstract class DreamAuthError<
  TCode extends string | number | symbol,
  TContext extends Record<string, any> = {},
> extends Error {
  /**
   * Class name of the error.
   */
  readonly name = this.constructor.name;

  /**
   * Code which can be used for programmatic handling, choosing
   * user-friendly error messages, or debugging.
   */
  readonly code: TCode;

  /**
   * Additional context to be included in the error which may be useful
   * for debugging.
   */
  readonly context: Partial<TContext> & Record<string, unknown>;

  constructor(message: string, code: TCode, options: Error | DreamAuthErrorOptions<TContext> = {}) {
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
