import { createErrors } from '@dreamauth/errors';

// Create an error() function and an errors object from a map of error
// codes and messages.
const [error, errors] = createErrors({
  'invalid-jwk': 'The JWK is invalid.',
});

// Error messages can be accessed by key from the errors object.
const message = errors['invalid-jwk'];
console.log(message); // The JWK is invalid.

try {
  error('invalid-jwk', new Error('cause'));
} catch (err) {
  if (err instanceof Error) {
    console.log(err.message); // The JWK is invalid.
    console.log(err.code); // invalid-jwk
    console.log(err.cause); // Error: cause
  }
}
