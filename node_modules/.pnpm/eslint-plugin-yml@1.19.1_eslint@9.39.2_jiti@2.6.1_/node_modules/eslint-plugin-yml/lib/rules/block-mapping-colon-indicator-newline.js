"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../utils/index");
const ast_utils_1 = require("../utils/ast-utils");
const compat_1 = require("../utils/compat");
exports.default = (0, index_1.createRule)("block-mapping-colon-indicator-newline", {
    meta: {
        docs: {
            description: "enforce consistent line breaks after `:` indicator",
            categories: [],
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
            unexpectedLinebreakAfterIndicator: "Unexpected line break after this `:` indicator.",
            expectedLinebreakAfterIndicator: "Expected a line break after this `:` indicator.",
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
        function getColonToken(pair) {
            const limitIndex = pair.key ? pair.key.range[1] : pair.range[0];
            let candidateColon = sourceCode.getTokenBefore(pair.value);
            while (candidateColon && !(0, ast_utils_1.isColon)(candidateColon)) {
                candidateColon = sourceCode.getTokenBefore(candidateColon);
                if (candidateColon && candidateColon.range[1] <= limitIndex) {
                    return null;
                }
            }
            if (!candidateColon || !(0, ast_utils_1.isColon)(candidateColon)) {
                return null;
            }
            return candidateColon;
        }
        function canRemoveNewline(value) {
            const node = value.type === "YAMLWithMeta" ? value.value : value;
            if (node &&
                (node.type === "YAMLSequence" || node.type === "YAMLMapping") &&
                node.style === "block") {
                return false;
            }
            return true;
        }
        return {
            YAMLMapping(node) {
                if (node.style !== "block") {
                    return;
                }
                for (const pair of node.pairs) {
                    const value = pair.value;
                    if (!value) {
                        continue;
                    }
                    const colon = getColonToken(pair);
                    if (!colon) {
                        return;
                    }
                    const hasNewline = colon.loc.end.line < value.loc.start.line;
                    if (hasNewline) {
                        if (option === "never") {
                            if (!canRemoveNewline(value)) {
                                return;
                            }
                            context.report({
                                loc: colon.loc,
                                messageId: "unexpectedLinebreakAfterIndicator",
                                fix(fixer) {
                                    const spaceCount = value.loc.start.column - colon.loc.end.column;
                                    if (spaceCount < 1 &&
                                        value.loc.start.line < value.loc.end.line) {
                                        return null;
                                    }
                                    const spaces = " ".repeat(Math.max(spaceCount, 1));
                                    return fixer.replaceTextRange([colon.range[1], value.range[0]], spaces);
                                },
                            });
                        }
                    }
                    else {
                        if (option === "always") {
                            context.report({
                                loc: colon.loc,
                                messageId: "expectedLinebreakAfterIndicator",
                                fix(fixer) {
                                    const spaces = `\n${" ".repeat(value.loc.start.column)}`;
                                    return fixer.replaceTextRange([colon.range[1], value.range[0]], spaces);
                                },
                            });
                        }
                    }
                }
            },
        };
    },
});
