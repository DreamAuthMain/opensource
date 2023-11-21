import { createRaise, DreamAuthError, type DreamAuthErrorOptions } from './src/index.js';

export const CustomErrorCodes = {
  NotFound: 'Thing not found',
  Invalid: 'Thing is invalid',
};

export interface CustomContext {
  /**
   * A predefined context key.
   */
  key: string;
}

export class CustomError extends DreamAuthError<keyof typeof CustomErrorCodes, CustomContext> {
  constructor(code: keyof typeof CustomErrorCodes, options?: DreamAuthErrorOptions<CustomContext>) {
    super(CustomErrorCodes[code], code, options);
  }
}

export const raise = createRaise(CustomError);

raise('NotFound', {
  cause: new Error('Some other error'),
  context: { key: 'value' },
});
