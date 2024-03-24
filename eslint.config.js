import { rational } from 'eslint-config-rational';

export default rational({
  customRestricted: [
    {
      message: 'Use a strongly typed `raise(code)` function instead of throwing new errors.',
      selector: 'ThrowStatement[argument.type!="Identifier"]',
    },
  ],
});
