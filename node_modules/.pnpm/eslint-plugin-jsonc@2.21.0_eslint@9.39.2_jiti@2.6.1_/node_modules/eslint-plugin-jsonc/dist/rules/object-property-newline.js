"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.default = (0, utils_1.createRule)("object-property-newline", {
    meta: {
        docs: {
            description: "enforce placing object properties on separate lines",
            recommended: null,
            extensionRule: true,
            layout: true,
        },
        type: "layout",
        schema: [
            {
                type: "object",
                properties: {
                    allowAllPropertiesOnSameLine: {
                        type: "boolean",
                        default: false,
                    },
                    allowMultiplePropertiesPerLine: {
                        type: "boolean",
                        default: false,
                    },
                },
                additionalProperties: false,
            },
        ],
        fixable: "whitespace",
        messages: {
            propertiesOnNewlineAll: "Object properties must go on a new line if they aren't all on the same line.",
            propertiesOnNewline: "Object properties must go on a new line.",
        },
    },
    create(context) {
        const sourceCode = context.sourceCode;
        if (!sourceCode.parserServices.isJSON) {
            return {};
        }
        const allowSameLine = context.options[0] &&
            (context.options[0].allowAllPropertiesOnSameLine ||
                context.options[0].allowMultiplePropertiesPerLine);
        const messageId = allowSameLine
            ? "propertiesOnNewlineAll"
            : "propertiesOnNewline";
        return {
            JSONObjectExpression(node) {
                if (allowSameLine) {
                    if (node.properties.length > 1) {
                        const firstTokenOfFirstProperty = sourceCode.getFirstToken(node.properties[0]);
                        const lastTokenOfLastProperty = sourceCode.getLastToken(node.properties[node.properties.length - 1]);
                        if (firstTokenOfFirstProperty.loc.end.line ===
                            lastTokenOfLastProperty.loc.start.line) {
                            return;
                        }
                    }
                }
                for (let i = 1; i < node.properties.length; i++) {
                    const lastTokenOfPreviousProperty = sourceCode.getLastToken(node.properties[i - 1]);
                    const firstTokenOfCurrentProperty = sourceCode.getFirstToken(node.properties[i]);
                    if (lastTokenOfPreviousProperty.loc.end.line ===
                        firstTokenOfCurrentProperty.loc.start.line) {
                        context.report({
                            node: node,
                            loc: firstTokenOfCurrentProperty.loc,
                            messageId,
                            fix(fixer) {
                                const comma = sourceCode.getTokenBefore(firstTokenOfCurrentProperty);
                                const rangeAfterComma = [
                                    comma.range[1],
                                    firstTokenOfCurrentProperty.range[0],
                                ];
                                if (sourceCode.text
                                    .slice(rangeAfterComma[0], rangeAfterComma[1])
                                    .trim())
                                    return null;
                                return fixer.replaceTextRange(rangeAfterComma, "\n");
                            },
                        });
                    }
                }
            },
        };
    },
});
