"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const compat_1 = require("../utils/compat");
exports.default = (0, utils_1.createRule)("padding-line-between-tables", {
    meta: {
        docs: {
            description: "require or disallow padding lines between tables",
            categories: ["standard"],
            extensionRule: false,
        },
        fixable: "whitespace",
        schema: [],
        messages: {
            unexpectedBlankLine: "Unexpected blank line before this table.",
            expectedBlankLine: "Expected blank line before this table.",
        },
        type: "layout",
    },
    create(context) {
        const sourceCode = (0, compat_1.getSourceCode)(context);
        if (!sourceCode.parserServices?.isTOML) {
            return {};
        }
        function verifyTables(prevNode, nextNode) {
            const tokens = sourceCode.getTokensBetween(prevNode, nextNode, {
                includeComments: true,
            });
            let prevTarget = prevNode;
            for (const token of [...tokens, nextNode]) {
                if (prevTarget.loc.end.line + 1 < token.loc.start.line) {
                    return;
                }
                prevTarget = token;
            }
            context.report({
                node: nextNode.key,
                messageId: "expectedBlankLine",
                fix(fixer) {
                    return fixer.insertTextAfter(prevNode, "\n");
                },
            });
        }
        function verify(node) {
            let prev = null;
            for (const body of node.body) {
                if (prev && body.type === "TOMLTable") {
                    verifyTables(prev, body);
                }
                prev = body;
            }
        }
        return {
            TOMLTopLevelTable: verify,
        };
    },
});
