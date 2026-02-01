"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const eslint_ast_utils_1 = require("../utils/eslint-ast-utils");
function switchQuote(str) {
    const newQuote = this.quote;
    const oldQuote = str[0];
    if (newQuote === oldQuote)
        return str;
    return (newQuote +
        str
            .slice(1, -1)
            .replace(/\\(\$\{|\r\n?|\n|.)|["'`]|\$\{|(\r\n?|\n)/gu, (match, escaped, newline) => {
            if (escaped === oldQuote || (oldQuote === "`" && escaped === "${"))
                return escaped;
            if (match === newQuote || (newQuote === "`" && match === "${"))
                return `\\${match}`;
            if (newline && oldQuote === "`")
                return "\\n";
            return match;
        }) +
        newQuote);
}
const QUOTE_SETTINGS = {
    double: {
        quote: '"',
        alternateQuote: "'",
        description: "doublequote",
        convert: switchQuote,
    },
    single: {
        quote: "'",
        alternateQuote: '"',
        description: "singlequote",
        convert: switchQuote,
    },
    backtick: {
        quote: "`",
        alternateQuote: '"',
        description: "backtick",
        convert: switchQuote,
    },
};
const UNESCAPED_LINEBREAK_PATTERN = new RegExp(String.raw `(^|[^\\])(\\\\)*[${Array.from(eslint_ast_utils_1.LINEBREAKS).join("")}]`, "u");
const AVOID_ESCAPE = "avoid-escape";
exports.default = (0, utils_1.createRule)("quotes", {
    meta: {
        docs: {
            description: "enforce use of double or single quotes",
            recommended: ["json", "jsonc"],
            extensionRule: true,
            layout: true,
        },
        type: "layout",
        fixable: "code",
        schema: [
            {
                type: "string",
                enum: ["single", "double", "backtick"],
            },
            {
                anyOf: [
                    {
                        type: "string",
                        enum: ["avoid-escape"],
                    },
                    {
                        type: "object",
                        properties: {
                            avoidEscape: {
                                type: "boolean",
                            },
                            allowTemplateLiterals: {
                                type: "boolean",
                            },
                        },
                        additionalProperties: false,
                    },
                ],
            },
        ],
        messages: {
            wrongQuotes: "Strings must use {{description}}.",
        },
    },
    create(context) {
        const sourceCode = context.sourceCode;
        if (!sourceCode.parserServices.isJSON) {
            return {};
        }
        let quoteOption = context.options[0];
        if (quoteOption === "backtick") {
            quoteOption = "double";
        }
        const settings = QUOTE_SETTINGS[quoteOption || "double"];
        const options = context.options[1];
        const allowTemplateLiterals = options &&
            typeof options === "object" &&
            options.allowTemplateLiterals === true;
        let avoidEscape = options && typeof options === "object" && options.avoidEscape === true;
        if (options === AVOID_ESCAPE)
            avoidEscape = true;
        function isUsingFeatureOfTemplateLiteral(node) {
            const hasStringInterpolation = node.expressions.length > 0;
            if (hasStringInterpolation)
                return true;
            const isMultilineString = node.quasis.length >= 1 &&
                UNESCAPED_LINEBREAK_PATTERN.test(node.quasis[0].value.raw);
            if (isMultilineString)
                return true;
            return false;
        }
        return {
            JSONLiteral(node) {
                const val = node.value;
                const rawVal = node.raw;
                if (settings && typeof val === "string") {
                    let isValid = (0, eslint_ast_utils_1.isSurroundedBy)(rawVal, settings.quote);
                    if (!isValid && avoidEscape)
                        isValid =
                            (0, eslint_ast_utils_1.isSurroundedBy)(rawVal, settings.alternateQuote) &&
                                rawVal.includes(settings.quote);
                    if (!isValid) {
                        context.report({
                            node: node,
                            messageId: "wrongQuotes",
                            data: {
                                description: settings.description,
                            },
                            fix(fixer) {
                                return fixer.replaceText(node, settings.convert(node.raw));
                            },
                        });
                    }
                }
            },
            JSONTemplateLiteral(node) {
                if (allowTemplateLiterals || isUsingFeatureOfTemplateLiteral(node))
                    return;
                context.report({
                    node: node,
                    messageId: "wrongQuotes",
                    data: {
                        description: settings.description,
                    },
                    fix(fixer) {
                        return fixer.replaceText(node, settings.convert(sourceCode.getText(node)));
                    },
                });
            },
        };
    },
});
