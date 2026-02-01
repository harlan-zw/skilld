"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const eslint_utils_1 = require("@eslint-community/eslint-utils");
const eslint_ast_utils_1 = require("../utils/eslint-ast-utils");
const DEFAULT_OPTIONS = Object.freeze({
    arrays: "never",
    objects: "never",
});
const closeBraces = ["}", "]", ")", ">"];
function normalizeOptions(optionValue) {
    if (typeof optionValue === "string") {
        return {
            arrays: optionValue,
            objects: optionValue,
        };
    }
    if (typeof optionValue === "object" && optionValue !== null) {
        return {
            arrays: optionValue.arrays || DEFAULT_OPTIONS.arrays,
            objects: optionValue.objects || DEFAULT_OPTIONS.objects,
        };
    }
    return DEFAULT_OPTIONS;
}
exports.default = (0, utils_1.createRule)("comma-dangle", {
    meta: {
        docs: {
            description: "require or disallow trailing commas",
            recommended: ["json"],
            extensionRule: true,
            layout: true,
        },
        type: "layout",
        fixable: "code",
        schema: {
            definitions: {
                value: {
                    type: "string",
                    enum: ["always-multiline", "always", "never", "only-multiline"],
                },
                valueWithIgnore: {
                    type: "string",
                    enum: [
                        "always-multiline",
                        "always",
                        "ignore",
                        "never",
                        "only-multiline",
                    ],
                },
            },
            type: "array",
            items: [
                {
                    oneOf: [
                        {
                            $ref: "#/definitions/value",
                        },
                        {
                            type: "object",
                            properties: {
                                arrays: { $ref: "#/definitions/valueWithIgnore" },
                                objects: { $ref: "#/definitions/valueWithIgnore" },
                                imports: { $ref: "#/definitions/valueWithIgnore" },
                                exports: { $ref: "#/definitions/valueWithIgnore" },
                                functions: { $ref: "#/definitions/valueWithIgnore" },
                            },
                            additionalProperties: false,
                        },
                    ],
                },
            ],
            additionalItems: false,
        },
        messages: {
            unexpected: "Unexpected trailing comma.",
            missing: "Missing trailing comma.",
        },
    },
    create(context) {
        const sourceCode = context.sourceCode;
        if (!sourceCode.parserServices.isJSON) {
            return {};
        }
        const options = normalizeOptions(context.options[0] || "never");
        function getLastItem(node) {
            function last(array) {
                return array[array.length - 1];
            }
            switch (node.type) {
                case "JSONObjectExpression":
                    return last(node.properties);
                case "JSONArrayExpression":
                    return last(node.elements);
                default:
                    return null;
            }
        }
        function getTrailingToken(node, lastItem) {
            switch (node.type) {
                case "JSONObjectExpression":
                case "JSONArrayExpression":
                    return sourceCode.getLastToken(node, 1);
                default: {
                    const nextToken = sourceCode.getTokenAfter(lastItem);
                    if ((0, eslint_utils_1.isCommaToken)(nextToken))
                        return nextToken;
                    return sourceCode.getLastToken(lastItem);
                }
            }
        }
        function isMultiline(node) {
            const lastItem = getLastItem(node);
            if (!lastItem)
                return false;
            const penultimateToken = getTrailingToken(node, lastItem);
            if (!penultimateToken)
                return false;
            const lastToken = sourceCode.getTokenAfter(penultimateToken);
            if (!lastToken)
                return false;
            return lastToken.loc.end.line !== penultimateToken.loc.end.line;
        }
        function forbidTrailingComma(node) {
            const lastItem = getLastItem(node);
            if (!lastItem)
                return;
            const trailingToken = getTrailingToken(node, lastItem);
            if (trailingToken && (0, eslint_utils_1.isCommaToken)(trailingToken)) {
                context.report({
                    node: lastItem,
                    loc: trailingToken.loc,
                    messageId: "unexpected",
                    *fix(fixer) {
                        yield fixer.remove(trailingToken);
                        yield fixer.insertTextBefore(sourceCode.getTokenBefore(trailingToken), "");
                        yield fixer.insertTextAfter(sourceCode.getTokenAfter(trailingToken), "");
                    },
                });
            }
        }
        function forceTrailingComma(node) {
            const lastItem = getLastItem(node);
            if (!lastItem)
                return;
            const trailingToken = getTrailingToken(node, lastItem);
            if (!trailingToken || trailingToken.value === ",")
                return;
            const nextToken = sourceCode.getTokenAfter(trailingToken);
            if (!nextToken || !closeBraces.includes(nextToken.value))
                return;
            context.report({
                node: lastItem,
                loc: {
                    start: trailingToken.loc.end,
                    end: (0, eslint_ast_utils_1.getNextLocation)(sourceCode, trailingToken.loc.end),
                },
                messageId: "missing",
                *fix(fixer) {
                    yield fixer.insertTextAfter(trailingToken, ",");
                    yield fixer.insertTextBefore(trailingToken, "");
                    yield fixer.insertTextAfter(sourceCode.getTokenAfter(trailingToken), "");
                },
            });
        }
        function forceTrailingCommaIfMultiline(node) {
            if (isMultiline(node))
                forceTrailingComma(node);
            else
                forbidTrailingComma(node);
        }
        function allowTrailingCommaIfMultiline(node) {
            if (!isMultiline(node))
                forbidTrailingComma(node);
        }
        const predicate = {
            always: forceTrailingComma,
            "always-multiline": forceTrailingCommaIfMultiline,
            "only-multiline": allowTrailingCommaIfMultiline,
            never: forbidTrailingComma,
            ignore() {
            },
        };
        return {
            JSONObjectExpression: predicate[options.objects],
            JSONArrayExpression: predicate[options.arrays],
        };
    },
});
