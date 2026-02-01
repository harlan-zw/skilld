"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../utils/index");
const yaml_1 = require("../utils/yaml");
const ast_utils_1 = require("../utils/ast-utils");
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
exports.default = (0, index_1.createRule)("block-sequence", {
    meta: {
        docs: {
            description: "require or disallow block style sequences.",
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
            required: "Must use block style sequences.",
            disallow: "Must use flow style sequences.",
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
            YAMLMapping: downStack,
            YAMLSequence: downStack,
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
            "YAMLMapping:exit": upStack,
            "YAMLSequence:exit"(node) {
                const sequenceInfo = styleStack;
                upStack();
                if (node.entries.length === 0) {
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
                    const canFix = canFixToBlock(sequenceInfo, node, sourceCode) &&
                        !(0, yaml_1.hasTabIndent)(context);
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
                    const canFix = canFixToFlow(sequenceInfo, node, context) && !(0, yaml_1.hasTabIndent)(context);
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
function canFixToBlock(sequenceInfo, node, sourceCode) {
    if (sequenceInfo.hasNullPair || sequenceInfo.hasBlockLiteralOrFolded) {
        return false;
    }
    if (sequenceInfo.withinFlowStyle) {
        return false;
    }
    for (const entry of node.entries) {
        if (entry.type === "YAMLMapping" && entry.style === "block") {
            for (const pair of entry.pairs) {
                if (pair.key) {
                    if (pair.key.loc.start.line < pair.key.loc.end.line) {
                        return false;
                    }
                    if (pair.key.type === "YAMLMapping") {
                        return false;
                    }
                }
                if (pair.value) {
                    const colon = sourceCode.getTokenBefore(pair.value);
                    if ((colon === null || colon === void 0 ? void 0 : colon.value) === ":") {
                        if (colon.range[1] === pair.value.range[0]) {
                            return false;
                        }
                    }
                }
            }
        }
    }
    return true;
}
function canFixToFlow(sequenceInfo, node, context) {
    if (sequenceInfo.hasNullPair || sequenceInfo.hasBlockLiteralOrFolded) {
        return false;
    }
    if (sequenceInfo.hasBlockStyle) {
        return false;
    }
    if (node.parent.type === "YAMLWithMeta") {
        const metaIndent = (0, yaml_1.getActualIndent)(node.parent, context);
        if (metaIndent != null) {
            for (let line = node.loc.start.line; line <= node.loc.end.line; line++) {
                if ((0, yaml_1.compareIndent)(metaIndent, (0, yaml_1.getActualIndentFromLine)(line, context)) > 0) {
                    return false;
                }
            }
        }
    }
    for (const entry of node.entries) {
        const value = (0, yaml_1.unwrapMeta)(entry);
        if (value && value.type === "YAMLScalar" && value.style === "plain") {
            if (value.strValue.includes(",")) {
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
        if ((open === null || open === void 0 ? void 0 : open.value) !== "[" || (close === null || close === void 0 ? void 0 : close.value) !== "]") {
            return;
        }
        const expectIndent = (0, yaml_1.calcExpectIndentForEntries)(node, context);
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
        for (const entry of node.entries) {
            const prevToken = sourceCode.getTokenBefore(entry, {
                includeComments: true,
                filter: (token) => !(0, ast_utils_1.isComma)(token),
            });
            yield* removeComma(prev, prevToken);
            yield fixer.replaceTextRange([prevToken.range[1], entry.range[0]], `\n${expectIndent}- `);
            yield* processEntryIndent(`${expectIndent}  `, entry);
            prev = entry;
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
        function* processEntryIndent(baseIndent, entry) {
            if (entry.type === "YAMLWithMeta" && entry.value) {
                yield* (0, yaml_1.processIndentFix)(fixer, baseIndent, entry.value, context);
            }
            else if (entry.type === "YAMLMapping") {
                for (const p of entry.pairs) {
                    if (p.range[0] === entry.range[0]) {
                        if (p.value) {
                            yield* (0, yaml_1.processIndentFix)(fixer, baseIndent, p.value, context);
                        }
                    }
                    else {
                        yield* (0, yaml_1.processIndentFix)(fixer, baseIndent, p, context);
                    }
                }
                if (entry.style === "flow") {
                    const close = sourceCode.getLastToken(entry);
                    if (close.value === "}") {
                        const actualIndent = (0, yaml_1.getActualIndent)(close, context);
                        if (actualIndent != null &&
                            (0, yaml_1.compareIndent)(actualIndent, baseIndent) < 0) {
                            yield (0, yaml_1.fixIndent)(fixer, sourceCode, baseIndent, close);
                        }
                    }
                }
            }
            else if (entry.type === "YAMLSequence") {
                for (const e of entry.entries) {
                    if (!e) {
                        continue;
                    }
                    yield* (0, yaml_1.processIndentFix)(fixer, baseIndent, e, context);
                }
            }
        }
    };
}
function buildFixBlockToFlow(node, context) {
    const sourceCode = (0, compat_1.getSourceCode)(context);
    return function* (fixer) {
        const entries = node.entries.filter((e) => e != null);
        if (entries.length !== node.entries.length) {
            return;
        }
        const firstEntry = entries.shift();
        const lastEntry = entries.pop();
        const firstHyphen = sourceCode.getTokenBefore(firstEntry);
        yield fixer.replaceText(firstHyphen, " ");
        yield fixer.insertTextBefore(firstEntry, "[");
        if (lastEntry) {
            yield fixer.insertTextAfter(firstEntry, ",");
        }
        for (const entry of entries) {
            const hyphen = sourceCode.getTokenBefore(entry);
            yield fixer.replaceText(hyphen, " ");
            yield fixer.insertTextAfter(entry, ",");
        }
        if (lastEntry) {
            const lastHyphen = sourceCode.getTokenBefore(lastEntry);
            yield fixer.replaceText(lastHyphen, " ");
        }
        yield fixer.insertTextAfter(lastEntry || firstEntry || node, "]");
    };
}
