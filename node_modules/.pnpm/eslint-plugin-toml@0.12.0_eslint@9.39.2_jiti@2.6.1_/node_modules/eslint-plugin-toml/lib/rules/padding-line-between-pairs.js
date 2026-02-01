"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const toml_eslint_parser_1 = require("toml-eslint-parser");
const utils_1 = require("../utils");
const compat_1 = require("../utils/compat");
exports.default = (0, utils_1.createRule)("padding-line-between-pairs", {
    meta: {
        docs: {
            description: "require or disallow padding lines between pairs",
            categories: ["standard"],
            extensionRule: false,
        },
        fixable: "whitespace",
        schema: [],
        messages: {
            unexpectedBlankLine: "Unexpected blank line before this pair.",
            expectedBlankLine: "Expected blank line before this pair.",
        },
        type: "layout",
    },
    create(context) {
        const sourceCode = (0, compat_1.getSourceCode)(context);
        if (!sourceCode.parserServices?.isTOML) {
            return {};
        }
        function verifyPairs(prevNode, prevKeys, nextNode, nextKeys) {
            const needPadding = nextKeys.length !== prevKeys.length ||
                nextKeys.slice(0, -1).some((key, index) => key !== prevKeys[index]);
            const tokens = sourceCode.getTokensBetween(prevNode, nextNode, {
                includeComments: true,
            });
            if (needPadding) {
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
            else {
                const prevTarget = [prevNode, ...tokens].pop();
                if (prevTarget.loc.end.line + 1 >= nextNode.loc.start.line) {
                    return;
                }
                context.report({
                    node: nextNode.key,
                    messageId: "unexpectedBlankLine",
                    *fix(fixer) {
                        yield fixer.replaceTextRange([prevTarget.range[1], nextNode.range[0]], "\n");
                    },
                });
            }
        }
        function verify(node) {
            let prev = null;
            for (const body of node.body) {
                if (body.type !== "TOMLKeyValue") {
                    continue;
                }
                const keys = (0, toml_eslint_parser_1.getStaticTOMLValue)(body.key);
                if (prev) {
                    verifyPairs(prev.node, prev.keys, body, keys);
                }
                prev = { node: body, keys };
            }
        }
        return {
            TOMLTopLevelTable: verify,
            TOMLTable: verify,
        };
    },
});
