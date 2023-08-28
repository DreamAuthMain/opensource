export interface ErrorOptions {
  cause?: unknown;
  context?: Record<string, any>;
}

export abstract class DreamAuthError<TCode extends string | number | symbol> extends Error {
  readonly name = this.constructor.name;
  readonly code: TCode;
  readonly context: Record<string, unknown>;

  constructor(message: string, code: TCode, { cause, context = {} }: ErrorOptions = {}) {
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
