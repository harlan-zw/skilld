"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const ast_utils_1 = require("../utils/ast-utils");
const type_tracker_1 = require("../utils/type-tracker");
exports.default = (0, utils_1.createRule)("prefer-escape-replacement-dollar-char", {
    meta: {
        docs: {
            description: "enforces escape of replacement `$` character (`$$`).",
            category: "Best Practices",
            recommended: false,
        },
        schema: [],
        messages: {
            unexpected: "Unexpected replacement `$` character without escaping. Use `$$` instead.",
        },
        type: "suggestion",
    },
    create(context) {
        const typeTracer = (0, type_tracker_1.createTypeTracker)(context);
        const sourceCode = context.sourceCode;
        function verify(replacement) {
            for (const element of (0, ast_utils_1.parseReplacements)(context, replacement)) {
                if (element.type === "CharacterElement" &&
                    element.value === "$") {
                    context.report({
                        node: replacement,
                        loc: {
                            start: sourceCode.getLocFromIndex(element.range[0]),
                            end: sourceCode.getLocFromIndex(element.range[1]),
                        },
                        messageId: "unexpected",
                    });
                }
            }
        }
        return {
            CallExpression(node) {
                if (!(0, ast_utils_1.isKnownMethodCall)(node, { replace: 2, replaceAll: 2 })) {
                    return;
                }
                const mem = node.callee;
                const replacementTextNode = node.arguments[1];
                if (replacementTextNode.type !== "Literal" ||
                    typeof replacementTextNode.value !== "string") {
                    return;
                }
                if (!typeTracer.isRegExp(node.arguments[0])) {
                    return;
                }
                if (!typeTracer.isString(mem.object)) {
                    return;
                }
                verify(replacementTextNode);
            },
        };
    },
});
