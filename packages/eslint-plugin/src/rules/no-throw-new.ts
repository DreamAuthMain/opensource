import { AST_NODE_TYPES, type TSESLint } from '@typescript-eslint/utils';

import { messages } from '../messages.js';

const rule: TSESLint.RuleModule<keyof typeof messages> = {
  meta: { type: 'suggestion', messages, schema: [] },
  defaultOptions: [],
  create: (context) => {
    return {
      ThrowStatement(node) {
        if ((node.argument?.type as any) !== AST_NODE_TYPES.Identifier) {
          context.report({ node, messageId: 'noThrowNew' });
        }
      },
    };
  },
};

export default rule;
