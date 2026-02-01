"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const espree_1 = require("espree");
const eslint_keywords_1 = require("../utils/eslint-keywords");
const eslint_ast_utils_1 = require("../utils/eslint-ast-utils");
exports.default = (0, utils_1.createRule)("quote-props", {
    meta: {
        docs: {
            description: "require quotes around object literal property names",
            recommended: ["json", "jsonc"],
            extensionRule: true,
            layout: true,
        },
        type: "layout",
        schema: {
            anyOf: [
                {
                    type: "array",
                    items: [
                        {
                            type: "string",
                            enum: [
                                "always",
                                "as-needed",
                                "consistent",
                                "consistent-as-needed",
                            ],
                        },
                    ],
                    minItems: 0,
                    maxItems: 1,
                },
                {
                    type: "array",
                    items: [
                        {
                            type: "string",
                            enum: [
                                "always",
                                "as-needed",
                                "consistent",
                                "consistent-as-needed",
                            ],
                        },
                        {
                            type: "object",
                            properties: {
                                keywords: {
                                    type: "boolean",
                                },
                                unnecessary: {
                                    type: "boolean",
                                },
                                numbers: {
                                    type: "boolean",
                                },
                            },
                            additionalProperties: false,
                        },
                    ],
                    minItems: 0,
                    maxItems: 2,
                },
            ],
        },
        fixable: "code",
        messages: {
            requireQuotesDueToReservedWord: "Properties should be quoted as '{{property}}' is a reserved word.",
            inconsistentlyQuotedProperty: "Inconsistently quoted property '{{key}}' found.",
            unnecessarilyQuotedProperty: "Unnecessarily quoted property '{{property}}' found.",
            unquotedReservedProperty: "Unquoted reserved word '{{property}}' used as key.",
            unquotedNumericProperty: "Unquoted number literal '{{property}}' used as key.",
            unquotedPropertyFound: "Unquoted property '{{property}}' found.",
            redundantQuoting: "Properties shouldn't be quoted as all quotes are redundant.",
        },
    },
    create(context) {
        const sourceCode = context.sourceCode;
        if (!sourceCode.parserServices.isJSON) {
            return {};
        }
        const MODE = context.options[0] || "always";
        const KEYWORDS = (context.options[1] && context.options[1].keywords);
        const CHECK_UNNECESSARY = !context.options[1] || context.options[1].unnecessary !== false;
        const NUMBERS = (context.options[1] && context.options[1].numbers);
        function isKeyword(tokenStr) {
            return eslint_keywords_1.keywords.includes(tokenStr);
        }
        function areQuotesRedundant(rawKey, tokens, skipNumberLiterals = false) {
            return (tokens.length === 1 &&
                tokens[0].start === 0 &&
                tokens[0].end === rawKey.length &&
                (["Identifier", "Keyword", "Null", "Boolean"].includes(tokens[0].type) ||
                    (tokens[0].type === "Numeric" &&
                        !skipNumberLiterals &&
                        String(Number(tokens[0].value)) === tokens[0].value)));
        }
        function getUnquotedKey(key) {
            return key.type === "JSONIdentifier" ? key.name : key.value;
        }
        function getQuotedKey(key) {
            if (key.type === "JSONLiteral" && typeof key.value === "string") {
                return sourceCode.getText(key);
            }
            return `"${key.type === "JSONIdentifier" ? key.name : key.value}"`;
        }
        function checkUnnecessaryQuotes(node) {
            const key = node.key;
            if (node.method || node.computed || node.shorthand)
                return;
            if (key.type === "JSONLiteral" && typeof key.value === "string") {
                let tokens;
                try {
                    tokens = (0, espree_1.tokenize)(key.value);
                }
                catch (_a) {
                    return;
                }
                if (tokens.length !== 1)
                    return;
                const isKeywordToken = isKeyword(tokens[0].value);
                if (isKeywordToken && KEYWORDS)
                    return;
                if (CHECK_UNNECESSARY &&
                    areQuotesRedundant(key.value, tokens, NUMBERS)) {
                    context.report({
                        node: node,
                        messageId: "unnecessarilyQuotedProperty",
                        data: { property: key.value },
                        fix: (fixer) => fixer.replaceText(key, getUnquotedKey(key)),
                    });
                }
            }
            else if (KEYWORDS &&
                key.type === "JSONIdentifier" &&
                isKeyword(key.name)) {
                context.report({
                    node: node,
                    messageId: "unquotedReservedProperty",
                    data: { property: key.name },
                    fix: (fixer) => fixer.replaceText(key, getQuotedKey(key)),
                });
            }
            else if (NUMBERS &&
                key.type === "JSONLiteral" &&
                (0, eslint_ast_utils_1.isNumericLiteral)(key)) {
                context.report({
                    node: node,
                    messageId: "unquotedNumericProperty",
                    data: { property: String(key.value) },
                    fix: (fixer) => fixer.replaceText(key, getQuotedKey(key)),
                });
            }
        }
        function checkOmittedQuotes(node) {
            const key = node.key;
            if (!node.method &&
                !node.computed &&
                !node.shorthand &&
                !(key.type === "JSONLiteral" && typeof key.value === "string")) {
                context.report({
                    node: node,
                    messageId: "unquotedPropertyFound",
                    data: {
                        property: key.name ||
                            key.value,
                    },
                    fix: (fixer) => fixer.replaceText(key, getQuotedKey(key)),
                });
            }
        }
        function checkConsistency(node, checkQuotesRedundancy) {
            const quotedProps = [];
            const unquotedProps = [];
            let keywordKeyName = null;
            let necessaryQuotes = false;
            node.properties.forEach((rawProperty) => {
                const property = rawProperty;
                const key = property.key;
                if (!key || property.method || property.computed || property.shorthand)
                    return;
                if (key.type === "JSONLiteral" && typeof key.value === "string") {
                    quotedProps.push(property);
                    if (checkQuotesRedundancy) {
                        let tokens;
                        try {
                            tokens = (0, espree_1.tokenize)(key.value);
                        }
                        catch (_a) {
                            necessaryQuotes = true;
                            return;
                        }
                        necessaryQuotes =
                            necessaryQuotes ||
                                !areQuotesRedundant(key.value, tokens) ||
                                (KEYWORDS && isKeyword(tokens[0].value));
                    }
                }
                else if (KEYWORDS &&
                    checkQuotesRedundancy &&
                    key.type === "JSONIdentifier" &&
                    isKeyword(key.name)) {
                    unquotedProps.push(property);
                    necessaryQuotes = true;
                    keywordKeyName = key.name;
                }
                else {
                    unquotedProps.push(property);
                }
            });
            if (checkQuotesRedundancy && quotedProps.length && !necessaryQuotes) {
                quotedProps.forEach((property) => {
                    const key = property.key;
                    context.report({
                        node: property,
                        messageId: "redundantQuoting",
                        fix: (fixer) => fixer.replaceText(key, getUnquotedKey(key)),
                    });
                });
            }
            else if (unquotedProps.length && keywordKeyName) {
                unquotedProps.forEach((property) => {
                    context.report({
                        node: property,
                        messageId: "requireQuotesDueToReservedWord",
                        data: { property: keywordKeyName },
                        fix: (fixer) => fixer.replaceText(property.key, getQuotedKey(property.key)),
                    });
                });
            }
            else if (quotedProps.length && unquotedProps.length) {
                unquotedProps.forEach((property) => {
                    context.report({
                        node: property,
                        messageId: "inconsistentlyQuotedProperty",
                        data: {
                            key: property.key.name ||
                                property.key.value,
                        },
                        fix: (fixer) => fixer.replaceText(property.key, getQuotedKey(property.key)),
                    });
                });
            }
        }
        return {
            JSONProperty(node) {
                if (MODE === "always" || !MODE)
                    checkOmittedQuotes(node);
                if (MODE === "as-needed")
                    checkUnnecessaryQuotes(node);
            },
            JSONObjectExpression(node) {
                if (MODE === "consistent")
                    checkConsistency(node, false);
                if (MODE === "consistent-as-needed")
                    checkConsistency(node, true);
            },
        };
    },
});
