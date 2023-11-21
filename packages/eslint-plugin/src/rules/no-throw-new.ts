import { type Rule } from 'eslint';

import { type MessageId, messages } from '../messages.js';

const rule: Rule.RuleModule = {
  meta: { type: 'suggestion', messages, schema: [] },
  create: (context) => {
    return {
      ThrowStatement(node) {
        if (node.argument?.type !== 'Identifier') {
          context.report({ node, messageId: 'noThrowNew' satisfies MessageId });
        }
      },
    };
  },
};

export default rule;
