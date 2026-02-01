"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yaml_eslint_parser_1 = require("yaml-eslint-parser");
const index_1 = require("../utils/index");
const casing_1 = require("../utils/casing");
const casing_2 = require("../utils/casing");
const compat_1 = require("../utils/compat");
exports.default = (0, index_1.createRule)("key-name-casing", {
    meta: {
        docs: {
            description: "enforce naming convention to key names",
            categories: null,
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
            doesNotMatchFormat: "Key name `{{name}}` must match one of the following formats: {{formats}}",
        },
        type: "suggestion",
    },
    create(context) {
        var _a;
        const sourceCode = (0, compat_1.getSourceCode)(context);
        if (!((_a = sourceCode.parserServices) === null || _a === void 0 ? void 0 : _a.isYAML)) {
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
            .filter((key) => casing_2.allowedCaseOptions.includes(key))
            .filter((key) => option[key]);
        const checkers = formats.map(casing_1.getChecker);
        function isValid(name) {
            if (ignores.some((regex) => regex.test(name))) {
                return true;
            }
            return checkers.length ? checkers.some((c) => c(name)) : true;
        }
        return {
            YAMLPair(node) {
                if (!node.key) {
                    return;
                }
                const name = String((0, yaml_eslint_parser_1.getStaticYAMLValue)(node.key));
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
