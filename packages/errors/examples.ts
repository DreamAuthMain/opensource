import { createRaise, DreamAuthError, type ErrorOptions } from '@dreamauth/errors';

export const CustomErrorCodes = {
  NotFound: 'Thing not found',
  Invalid: 'Thing is invalid',
};

export class CustomError extends DreamAuthError<keyof typeof CustomErrorCodes> {
  constructor(code: keyof typeof CustomErrorCodes, options?: ErrorOptions) {
    super(CustomErrorCodes[code], code, options);
  }
}

export const raise = createRaise(CustomError);

raise('NotFound', {
  cause: new Error('Some other error'),
  context: { foo: 'bar' },
});
