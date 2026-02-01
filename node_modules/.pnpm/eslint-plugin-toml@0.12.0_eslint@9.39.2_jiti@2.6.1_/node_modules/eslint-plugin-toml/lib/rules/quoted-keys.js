"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const compat_1 = require("../utils/compat");
exports.default = (0, utils_1.createRule)("quoted-keys", {
    meta: {
        docs: {
            description: "require or disallow quotes around keys",
            categories: ["standard"],
            extensionRule: false,
        },
        fixable: "code",
        schema: [
            {
                type: "object",
                properties: {
                    prefer: {
                        enum: ["as-needed", "always"],
                    },
                    numbers: {
                        type: "boolean",
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            unnecessarilyQuotedKey: "Unnecessarily quoted key '{{key}}' found.",
            unquotedNumericKey: "Unquoted number '{{key}}' used as key.",
            unquotedKeyFound: "Unquoted key '{{key}}' found.",
        },
        type: "layout",
    },
    create(context) {
        const sourceCode = (0, compat_1.getSourceCode)(context);
        if (!sourceCode.parserServices?.isTOML) {
            return {};
        }
        const prefer = context.options[0]?.prefer ?? "as-needed";
        const numbers = context.options[0]?.numbers !== false;
        return {
            TOMLBare(node) {
                if (prefer === "always") {
                    context.report({
                        node,
                        messageId: "unquotedKeyFound",
                        data: { key: node.name },
                        fix(fixer) {
                            return fixer.replaceText(node, `"${node.name}"`);
                        },
                    });
                    return;
                }
                if (numbers && /^[\d-]+$/u.test(node.name)) {
                    context.report({
                        node,
                        messageId: "unquotedNumericKey",
                        data: { key: node.name },
                        fix(fixer) {
                            return fixer.replaceText(node, `"${node.name}"`);
                        },
                    });
                }
            },
            TOMLQuoted(node) {
                if (prefer === "always") {
                    return;
                }
                if (/^[\w-]+$/u.test(node.value)) {
                    if (numbers && /^[\d-]+$/u.test(node.value)) {
                        return;
                    }
                    context.report({
                        node,
                        messageId: "unnecessarilyQuotedKey",
                        data: { key: node.value },
                        fix(fixer) {
                            return fixer.replaceText(node, node.value);
                        },
                    });
                }
            },
        };
    },
});
