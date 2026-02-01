"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const compat_1 = require("../utils/compat");
exports.default = (0, utils_1.createRule)("precision-of-fractional-seconds", {
    meta: {
        docs: {
            description: "disallow precision of fractional seconds greater than the specified value.",
            categories: ["recommended", "standard"],
            extensionRule: false,
        },
        schema: [
            {
                type: "object",
                properties: {
                    max: {
                        type: "number",
                        minimum: 0,
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            over: "Precision of fractional seconds greater than {{max}} are forbidden.",
        },
        type: "problem",
    },
    create(context) {
        const sourceCode = (0, compat_1.getSourceCode)(context);
        if (!sourceCode.parserServices?.isTOML) {
            return {};
        }
        const max = context.options[0]?.max ?? 3;
        function verifyText(node) {
            const text = node.datetime;
            const fractional = /^\d{4}-\d{2}-\d{2}[ t]\d{2}:\d{2}:\d{2}.(\d+)/iu.exec(text)?.[1] ||
                /^\d{2}:\d{2}:\d{2}.(\d+)/u.exec(text)?.[1];
            if (!fractional) {
                return;
            }
            if (fractional.length > max) {
                context.report({
                    node,
                    messageId: "over",
                    data: { max },
                });
            }
        }
        return {
            TOMLValue(node) {
                if (node.kind === "offset-date-time" ||
                    node.kind === "local-date-time" ||
                    node.kind === "local-time") {
                    verifyText(node);
                }
            },
        };
    },
});
