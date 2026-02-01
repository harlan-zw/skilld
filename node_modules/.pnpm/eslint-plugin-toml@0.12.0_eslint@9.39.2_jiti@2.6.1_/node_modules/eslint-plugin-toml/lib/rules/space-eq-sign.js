"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const compat_1 = require("../utils/compat");
exports.default = (0, utils_1.createRule)("space-eq-sign", {
    meta: {
        docs: {
            description: "require spacing around equals sign",
            categories: ["standard"],
            extensionRule: false,
        },
        deprecated: true,
        replacedBy: ["key-spacing"],
        fixable: "whitespace",
        schema: [],
        messages: {
            missingSpace: "Equals sign '=' must be spaced.",
        },
        type: "layout",
    },
    create(context) {
        const sourceCode = (0, compat_1.getSourceCode)(context);
        if (!sourceCode.parserServices?.isTOML) {
            return {};
        }
        function report(equalToken) {
            context.report({
                loc: equalToken.loc,
                messageId: "missingSpace",
                *fix(fixer) {
                    const previousToken = sourceCode.getTokenBefore(equalToken);
                    const afterToken = sourceCode.getTokenAfter(equalToken);
                    if (previousToken.range[1] === equalToken.range[0]) {
                        yield fixer.insertTextBefore(equalToken, " ");
                    }
                    if (equalToken.range[1] === afterToken.range[0]) {
                        yield fixer.insertTextAfter(equalToken, " ");
                    }
                },
            });
        }
        return {
            TOMLKeyValue(node) {
                const equalToken = sourceCode.getTokenBefore(node.value);
                if (node.key.range[1] === equalToken.range[0] ||
                    equalToken.range[1] === node.value.range[0]) {
                    report(equalToken);
                }
            },
        };
    },
});
