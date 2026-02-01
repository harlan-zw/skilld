"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const compat_1 = require("../utils/compat");
exports.default = (0, utils_1.createRule)("table-bracket-spacing", {
    meta: {
        docs: {
            description: "enforce consistent spacing inside table brackets",
            categories: ["standard"],
            extensionRule: "array-bracket-spacing",
        },
        fixable: "whitespace",
        schema: [
            {
                enum: ["always", "never"],
            },
        ],
        messages: {
            unexpectedSpaceAfter: "There should be no space after '{{tokenValue}}'.",
            unexpectedSpaceBefore: "There should be no space before '{{tokenValue}}'.",
            missingSpaceAfter: "A space is required after '{{tokenValue}}'.",
            missingSpaceBefore: "A space is required before '{{tokenValue}}'.",
        },
        type: "layout",
    },
    create(context) {
        const sourceCode = (0, compat_1.getSourceCode)(context);
        if (!sourceCode.parserServices?.isTOML) {
            return {};
        }
        const prefer = context.options[0] || "never";
        function reportRequiredBeginningSpace(node, token) {
            context.report({
                node,
                loc: token.loc,
                messageId: "missingSpaceAfter",
                data: {
                    tokenValue: token.value,
                },
                fix(fixer) {
                    return fixer.insertTextAfter(token, " ");
                },
            });
        }
        function reportNoBeginningSpace(node, token) {
            const nextToken = sourceCode.getTokenAfter(token);
            context.report({
                node,
                loc: { start: token.loc.end, end: nextToken.loc.start },
                messageId: "unexpectedSpaceAfter",
                data: {
                    tokenValue: token.value,
                },
                fix(fixer) {
                    return fixer.removeRange([token.range[1], nextToken.range[0]]);
                },
            });
        }
        function reportRequiredEndingSpace(node, token) {
            context.report({
                node,
                loc: token.loc,
                messageId: "missingSpaceBefore",
                data: {
                    tokenValue: token.value,
                },
                fix(fixer) {
                    return fixer.insertTextBefore(token, " ");
                },
            });
        }
        function reportNoEndingSpace(node, token) {
            const previousToken = sourceCode.getTokenBefore(token);
            context.report({
                node,
                loc: { start: previousToken.loc.end, end: token.loc.start },
                messageId: "unexpectedSpaceBefore",
                data: {
                    tokenValue: token.value,
                },
                fix(fixer) {
                    return fixer.removeRange([previousToken.range[1], token.range[0]]);
                },
            });
        }
        function validateArraySpacing(node) {
            const key = node.key;
            const first = sourceCode.getTokenBefore(key);
            const last = sourceCode.getTokenAfter(key);
            if (prefer === "always" && first.range[1] === key.range[0]) {
                reportRequiredBeginningSpace(node, first);
            }
            if (prefer === "never" && first.range[1] < key.range[0]) {
                reportNoBeginningSpace(node, first);
            }
            if (prefer === "always" && key.range[1] === last.range[0]) {
                reportRequiredEndingSpace(node, last);
            }
            if (prefer === "never" && key.range[1] < last.range[0]) {
                reportNoEndingSpace(node, last);
            }
        }
        return {
            TOMLTable: validateArraySpacing,
        };
    },
});
