"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const compat_1 = require("../utils/compat");
exports.default = (0, utils_1.createRule)("no-mixed-type-in-array", {
    meta: {
        docs: {
            description: "disallow mixed data types in array",
            categories: null,
            extensionRule: false,
        },
        schema: [
            {
                type: "object",
                properties: {
                    typeMap: {
                        type: "object",
                        properties: {
                            string: { type: "string" },
                            boolean: { type: "string" },
                            integer: { type: "string" },
                            float: { type: "string" },
                            offsetDateTime: { type: "string" },
                            localDateTime: { type: "string" },
                            localDate: { type: "string" },
                            localTime: { type: "string" },
                            array: { type: "string" },
                            inlineTable: { type: "string" },
                        },
                        additionalProperties: false,
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            mixedDataType: "Data types may not be mixed in an array.",
        },
        type: "suggestion",
    },
    create(context) {
        const sourceCode = (0, compat_1.getSourceCode)(context);
        if (!sourceCode.parserServices?.isTOML) {
            return {};
        }
        const typeMap = {
            string: "String",
            integer: "Integer",
            float: "Float",
            boolean: "Boolean",
            offsetDateTime: "Datetime",
            localDateTime: "Datetime",
            localDate: "Datetime",
            localTime: "Datetime",
            array: "Array",
            inlineTable: "Inline Table",
            ...(context.options[0]?.typeMap || {}),
        };
        function getDataType(node) {
            if (node.type === "TOMLArray") {
                return "array";
            }
            if (node.type === "TOMLInlineTable") {
                return "inlineTable";
            }
            if (node.type === "TOMLValue") {
                if (node.kind === "string" ||
                    node.kind === "integer" ||
                    node.kind === "float" ||
                    node.kind === "boolean") {
                    return node.kind;
                }
                if (node.kind === "offset-date-time") {
                    return "offsetDateTime";
                }
                if (node.kind === "local-date-time") {
                    return "localDateTime";
                }
                if (node.kind === "local-date") {
                    return "localDate";
                }
                if (node.kind === "local-time") {
                    return "localTime";
                }
            }
            return null;
        }
        return {
            TOMLArray(node) {
                let typeName = null;
                for (const element of node.elements) {
                    const type = getDataType(element);
                    if (typeName == null) {
                        if (type != null) {
                            typeName = typeMap[type];
                        }
                    }
                    else {
                        if (type == null || typeName !== typeMap[type]) {
                            context.report({
                                node: element,
                                messageId: "mixedDataType",
                            });
                        }
                    }
                }
            },
        };
    },
});
