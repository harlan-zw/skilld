"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const ast_utils_1 = require("../utils/ast-utils");
const type_tracker_1 = require("../utils/type-tracker");
exports.default = (0, utils_1.createRule)("prefer-regexp-exec", {
    meta: {
        docs: {
            description: "enforce that `RegExp#exec` is used instead of `String#match` if no global flag is provided",
            category: "Best Practices",
            recommended: false,
        },
        schema: [],
        messages: {
            disallow: "Use the `RegExp#exec()` method instead.",
        },
        type: "suggestion",
    },
    create(context) {
        const typeTracer = (0, type_tracker_1.createTypeTracker)(context);
        return {
            CallExpression(node) {
                if (!(0, ast_utils_1.isKnownMethodCall)(node, { match: 1 })) {
                    return;
                }
                const arg = node.arguments[0];
                const evaluated = (0, ast_utils_1.getStaticValue)(context, arg);
                if (evaluated &&
                    evaluated.value instanceof RegExp &&
                    evaluated.value.flags.includes("g")) {
                    return;
                }
                if (!typeTracer.isString(node.callee.object)) {
                    return;
                }
                context.report({
                    node,
                    messageId: "disallow",
                });
            },
        };
    },
});
