"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../utils/index");
const ast_utils_1 = require("../utils/ast-utils");
const compat_1 = require("../utils/compat");
exports.default = (0, index_1.createRule)("block-mapping-question-indicator-newline", {
    meta: {
        docs: {
            description: "enforce consistent line breaks after `?` indicator",
            categories: ["standard"],
            extensionRule: false,
            layout: true,
        },
        fixable: "whitespace",
        schema: [
            {
                enum: ["always", "never"],
            },
        ],
        messages: {
            unexpectedLinebreakAfterIndicator: "Unexpected line break after this `?` indicator.",
            expectedLinebreakAfterIndicator: "Expected a line break after this `?` indicator.",
        },
        type: "layout",
    },
    create(context) {
        var _a;
        const sourceCode = (0, compat_1.getSourceCode)(context);
        if (!((_a = sourceCode.parserServices) === null || _a === void 0 ? void 0 : _a.isYAML)) {
            return {};
        }
        const option = context.options[0] || "never";
        return {
            YAMLMapping(node) {
                if (node.style !== "block") {
                    return;
                }
                for (const pair of node.pairs) {
                    const key = pair.key;
                    if (!key) {
                        continue;
                    }
                    const question = sourceCode.getFirstToken(pair);
                    if (!question || !(0, ast_utils_1.isQuestion)(question)) {
                        continue;
                    }
                    const hasNewline = question.loc.end.line < key.loc.start.line;
                    if (hasNewline) {
                        if (option === "never") {
                            context.report({
                                loc: question.loc,
                                messageId: "unexpectedLinebreakAfterIndicator",
                                fix(fixer) {
                                    const spaceCount = key.loc.start.column - question.loc.end.column;
                                    if (spaceCount < 1 && key.loc.start.line < key.loc.end.line) {
                                        return null;
                                    }
                                    const spaces = " ".repeat(Math.max(spaceCount, 1));
                                    return fixer.replaceTextRange([question.range[1], key.range[0]], spaces);
                                },
                            });
                        }
                    }
                    else {
                        if (option === "always") {
                            context.report({
                                loc: question.loc,
                                messageId: "expectedLinebreakAfterIndicator",
                                fix(fixer) {
                                    const spaces = `\n${" ".repeat(key.loc.start.column)}`;
                                    return fixer.replaceTextRange([question.range[1], key.range[0]], spaces);
                                },
                            });
                        }
                    }
                }
            },
        };
    },
});
