"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../utils/index");
const ast_utils_1 = require("../utils/ast-utils");
const yaml_1 = require("../utils/yaml");
const compat_1 = require("../utils/compat");
const OPTIONS_ENUM = ["always", "never", "ignore"];
function parseOptions(option) {
    const opt = {
        singleline: "ignore",
        multiline: "always",
    };
    if (option) {
        if (typeof option === "string") {
            opt.singleline = option;
            opt.multiline = option;
        }
        else {
            if (typeof option.singleline === "string") {
                opt.singleline = option.singleline;
            }
            if (typeof option.multiline === "string") {
                opt.multiline = option.multiline;
            }
        }
    }
    return opt;
}
exports.default = (0, index_1.createRule)("block-mapping", {
    meta: {
        docs: {
            description: "require or disallow block style mappings.",
            categories: ["standard"],
            extensionRule: false,
            layout: false,
        },
        fixable: "code",
        schema: [
            {
                anyOf: [
                    { enum: ["always", "never"] },
                    {
                        type: "object",
                        properties: {
                            singleline: { enum: OPTIONS_ENUM },
                            multiline: { enum: OPTIONS_ENUM },
                        },
                        additionalProperties: false,
                    },
                ],
            },
        ],
        messages: {
            required: "Must use block style mappings.",
            disallow: "Must use flow style mappings.",
        },
        type: "layout",
    },
    create(context) {
        var _a;
        const sourceCode = (0, compat_1.getSourceCode)(context);
        if (!((_a = sourceCode.parserServices) === null || _a === void 0 ? void 0 : _a.isYAML)) {
            return {};
        }
        const options = parseOptions(context.options[0]);
        let styleStack = null;
        function downStack(node) {
            if (styleStack) {
                if (node.style === "flow") {
                    styleStack.hasFlowStyle = true;
                }
                else if (node.style === "block") {
                    styleStack.hasBlockStyle = true;
                }
            }
            styleStack = {
                upper: styleStack,
                node,
                flowStyle: node.style === "flow",
                blockStyle: node.style === "block",
                withinFlowStyle: (styleStack &&
                    (styleStack.withinFlowStyle || styleStack.flowStyle)) ||
                    false,
                withinBlockStyle: (styleStack &&
                    (styleStack.withinBlockStyle || styleStack.blockStyle)) ||
                    false,
            };
        }
        function upStack() {
            if (styleStack && styleStack.upper) {
                styleStack.upper.hasNullPair =
                    styleStack.upper.hasNullPair || styleStack.hasNullPair;
                styleStack.upper.hasBlockLiteralOrFolded =
                    styleStack.upper.hasBlockLiteralOrFolded ||
                        styleStack.hasBlockLiteralOrFolded;
                styleStack.upper.hasBlockStyle =
                    styleStack.upper.hasBlockStyle || styleStack.hasBlockStyle;
                styleStack.upper.hasFlowStyle =
                    styleStack.upper.hasFlowStyle || styleStack.hasFlowStyle;
            }
            styleStack = styleStack && styleStack.upper;
        }
        return {
            YAMLSequence: downStack,
            YAMLMapping: downStack,
            YAMLPair(node) {
                if (node.key == null || node.value == null) {
                    styleStack.hasNullPair = true;
                }
            },
            YAMLScalar(node) {
                if (styleStack &&
                    (node.style === "folded" || node.style === "literal")) {
                    styleStack.hasBlockLiteralOrFolded = true;
                }
            },
            "YAMLSequence:exit": upStack,
            "YAMLMapping:exit"(node) {
                const mappingInfo = styleStack;
                upStack();
                if (node.pairs.length === 0) {
                    return;
                }
                const multiline = node.loc.start.line < node.loc.end.line;
                const optionType = multiline ? options.multiline : options.singleline;
                if (optionType === "ignore") {
                    return;
                }
                if (node.style === "flow") {
                    if (optionType === "never") {
                        return;
                    }
                    if ((0, yaml_1.isKeyNode)(node)) {
                        return;
                    }
                    const canFix = canFixToBlock(mappingInfo, node) && !(0, yaml_1.hasTabIndent)(context);
                    context.report({
                        loc: node.loc,
                        messageId: "required",
                        fix: (canFix && buildFixFlowToBlock(node, context)) || null,
                    });
                }
                else if (node.style === "block") {
                    if (optionType === "always") {
                        return;
                    }
                    const canFix = canFixToFlow(mappingInfo, node) && !(0, yaml_1.hasTabIndent)(context);
                    context.report({
                        loc: node.loc,
                        messageId: "disallow",
                        fix: (canFix && buildFixBlockToFlow(node, context)) || null,
                    });
                }
            },
        };
    },
});
function canFixToBlock(mappingInfo, node) {
    if (mappingInfo.hasNullPair || mappingInfo.hasBlockLiteralOrFolded) {
        return false;
    }
    if (mappingInfo.withinFlowStyle) {
        return false;
    }
    for (const pair of node.pairs) {
        const key = pair.key;
        if (key.loc.start.line < key.loc.end.line) {
            return false;
        }
    }
    return true;
}
function canFixToFlow(mappingInfo, node) {
    if (mappingInfo.hasNullPair || mappingInfo.hasBlockLiteralOrFolded) {
        return false;
    }
    if (mappingInfo.hasBlockStyle) {
        return false;
    }
    for (const pair of node.pairs) {
        const value = (0, yaml_1.unwrapMeta)(pair.value);
        const key = (0, yaml_1.unwrapMeta)(pair.key);
        if (value && value.type === "YAMLScalar" && value.style === "plain") {
            if (value.loc.start.line < value.loc.end.line) {
                return false;
            }
            if (/[[\]{}]/u.test(value.strValue)) {
                return false;
            }
            if (value.strValue.includes(",")) {
                return false;
            }
        }
        if (key && key.type === "YAMLScalar" && key.style === "plain") {
            if (/[[\]{]/u.test(key.strValue)) {
                return false;
            }
            if (/[,}]/u.test(key.strValue)) {
                return false;
            }
        }
    }
    return true;
}
function buildFixFlowToBlock(node, context) {
    return function* (fixer) {
        const sourceCode = (0, compat_1.getSourceCode)(context);
        const open = sourceCode.getFirstToken(node);
        const close = sourceCode.getLastToken(node);
        if ((open === null || open === void 0 ? void 0 : open.value) !== "{" || (close === null || close === void 0 ? void 0 : close.value) !== "}") {
            return;
        }
        const expectIndent = (0, yaml_1.calcExpectIndentForPairs)(node, context);
        if (expectIndent == null) {
            return;
        }
        const openPrevToken = sourceCode.getTokenBefore(open, {
            includeComments: true,
        });
        if (!openPrevToken) {
            yield fixer.removeRange([sourceCode.ast.range[0], open.range[1]]);
        }
        else if (openPrevToken.loc.end.line < open.loc.start.line) {
            yield fixer.removeRange([openPrevToken.range[1], open.range[1]]);
        }
        else {
            yield fixer.remove(open);
        }
        let prev = open;
        for (const pair of node.pairs) {
            const prevToken = sourceCode.getTokenBefore(pair, {
                includeComments: true,
                filter: (token) => !(0, ast_utils_1.isComma)(token),
            });
            yield* removeComma(prev, prevToken);
            yield fixer.replaceTextRange([prevToken.range[1], pair.range[0]], `\n${expectIndent}`);
            const colonToken = sourceCode.getTokenAfter(pair.key, ast_utils_1.isColon);
            if (colonToken.range[1] ===
                sourceCode.getTokenAfter(colonToken, {
                    includeComments: true,
                }).range[0]) {
                yield fixer.insertTextAfter(colonToken, " ");
            }
            yield* (0, yaml_1.processIndentFix)(fixer, expectIndent, pair.value, context);
            prev = pair;
        }
        yield* removeComma(prev, close);
        yield fixer.remove(close);
        function* removeComma(a, b) {
            for (const token of sourceCode.getTokensBetween(a, b, {
                includeComments: true,
            })) {
                if ((0, ast_utils_1.isComma)(token)) {
                    yield fixer.remove(token);
                }
            }
        }
    };
}
function buildFixBlockToFlow(node, _context) {
    return function* (fixer) {
        yield fixer.insertTextBefore(node, "{");
        const pairs = [...node.pairs];
        const lastPair = pairs.pop();
        for (const pair of pairs) {
            yield fixer.insertTextAfter(pair, ",");
        }
        yield fixer.insertTextAfter(lastPair || node, "}");
    };
}
