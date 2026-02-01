"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../utils/index");
const ast_utils_1 = require("../utils/ast-utils");
const compat_1 = require("../utils/compat");
exports.default = (0, index_1.createRule)("block-sequence-hyphen-indicator-newline", {
    meta: {
        docs: {
            description: "enforce consistent line breaks after `-` indicator",
            categories: ["standard"],
            extensionRule: false,
            layout: true,
        },
        fixable: "whitespace",
        schema: [
            { enum: ["always", "never"] },
            {
                type: "object",
                properties: {
                    nestedHyphen: { enum: ["always", "never"] },
                    blockMapping: { enum: ["always", "never"] },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            unexpectedLinebreakAfterIndicator: "Unexpected line break after this `-` indicator.",
            expectedLinebreakAfterIndicator: "Expected a line break after this `-` indicator.",
        },
        type: "layout",
    },
    create(context) {
        var _a, _b, _c;
        const sourceCode = (0, compat_1.getSourceCode)(context);
        if (!((_a = sourceCode.parserServices) === null || _a === void 0 ? void 0 : _a.isYAML)) {
            return {};
        }
        const style = context.options[0] || "never";
        const nestedHyphenStyle = ((_b = context.options[1]) === null || _b === void 0 ? void 0 : _b.nestedHyphen) || "always";
        const blockMappingStyle = ((_c = context.options[1]) === null || _c === void 0 ? void 0 : _c.blockMapping) || style;
        function getStyleOption(hyphen, entry) {
            const next = sourceCode.getTokenAfter(hyphen);
            if (next && (0, ast_utils_1.isHyphen)(next)) {
                return nestedHyphenStyle;
            }
            if (entry.type === "YAMLMapping" && entry.style === "block") {
                return blockMappingStyle;
            }
            return style;
        }
        return {
            YAMLSequence(node) {
                if (node.style !== "block") {
                    return;
                }
                for (const entry of node.entries) {
                    if (!entry) {
                        continue;
                    }
                    const hyphen = sourceCode.getTokenBefore(entry);
                    if (!hyphen) {
                        continue;
                    }
                    const hasNewline = hyphen.loc.end.line < entry.loc.start.line;
                    if (hasNewline) {
                        if (getStyleOption(hyphen, entry) === "never") {
                            context.report({
                                loc: hyphen.loc,
                                messageId: "unexpectedLinebreakAfterIndicator",
                                fix(fixer) {
                                    const spaceCount = entry.loc.start.column - hyphen.loc.end.column;
                                    if (spaceCount < 1 &&
                                        entry.loc.start.line < entry.loc.end.line) {
                                        return null;
                                    }
                                    const spaces = " ".repeat(Math.max(spaceCount, 1));
                                    return fixer.replaceTextRange([hyphen.range[1], entry.range[0]], spaces);
                                },
                            });
                        }
                    }
                    else {
                        if (getStyleOption(hyphen, entry) === "always") {
                            context.report({
                                loc: hyphen.loc,
                                messageId: "expectedLinebreakAfterIndicator",
                                fix(fixer) {
                                    const spaces = `\n${" ".repeat(entry.loc.start.column)}`;
                                    return fixer.replaceTextRange([hyphen.range[1], entry.range[0]], spaces);
                                },
                            });
                        }
                    }
                }
            },
        };
    },
});
