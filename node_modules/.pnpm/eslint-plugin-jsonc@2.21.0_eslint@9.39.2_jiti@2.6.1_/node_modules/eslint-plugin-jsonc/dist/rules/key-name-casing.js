"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const casing_1 = require("../utils/casing");
exports.default = (0, utils_1.createRule)("key-name-casing", {
    meta: {
        docs: {
            description: "enforce naming convention to property key names",
            recommended: null,
            extensionRule: false,
            layout: false,
        },
        schema: [
            {
                type: "object",
                properties: {
                    camelCase: {
                        type: "boolean",
                        default: true,
                    },
                    PascalCase: {
                        type: "boolean",
                        default: false,
                    },
                    SCREAMING_SNAKE_CASE: {
                        type: "boolean",
                        default: false,
                    },
                    "kebab-case": {
                        type: "boolean",
                        default: false,
                    },
                    snake_case: {
                        type: "boolean",
                        default: false,
                    },
                    ignores: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                        uniqueItems: true,
                        additionalItems: false,
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            doesNotMatchFormat: "Property name `{{name}}` must match one of the following formats: {{formats}}",
        },
        type: "suggestion",
    },
    create(context) {
        const sourceCode = context.sourceCode;
        if (!sourceCode.parserServices.isJSON) {
            return {};
        }
        const option = Object.assign({}, context.options[0]);
        if (option.camelCase !== false) {
            option.camelCase = true;
        }
        const ignores = option.ignores
            ? option.ignores.map((ignore) => new RegExp(ignore))
            : [];
        const formats = Object.keys(option)
            .filter((key) => casing_1.allowedCaseOptions.includes(key))
            .filter((key) => option[key]);
        const checkers = formats.map(casing_1.getChecker);
        function isValid(name) {
            if (ignores.some((regex) => regex.test(name))) {
                return true;
            }
            return checkers.length ? checkers.some((c) => c(name)) : true;
        }
        return {
            JSONProperty(node) {
                const name = node.key.type === "JSONLiteral" && typeof node.key.value === "string"
                    ? node.key.value
                    : sourceCode.text.slice(...node.key.range);
                if (!isValid(name)) {
                    context.report({
                        loc: node.key.loc,
                        messageId: "doesNotMatchFormat",
                        data: {
                            name,
                            formats: formats.join(", "),
                        },
                    });
                }
            },
        };
    },
});
