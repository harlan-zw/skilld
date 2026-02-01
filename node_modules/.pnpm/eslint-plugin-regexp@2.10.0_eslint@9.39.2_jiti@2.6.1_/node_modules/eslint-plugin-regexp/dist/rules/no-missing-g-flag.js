"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const ast_utils_1 = require("../utils/ast-utils");
const type_tracker_1 = require("../utils/type-tracker");
function parseOption(userOption) {
    let strictTypes = true;
    if (userOption) {
        if (userOption.strictTypes != null) {
            strictTypes = userOption.strictTypes;
        }
    }
    return {
        strictTypes,
    };
}
exports.default = (0, utils_1.createRule)("no-missing-g-flag", {
    meta: {
        docs: {
            description: "disallow missing `g` flag in patterns used in `String#matchAll` and `String#replaceAll`",
            category: "Possible Errors",
            recommended: true,
        },
        fixable: "code",
        schema: [
            {
                type: "object",
                properties: {
                    strictTypes: { type: "boolean" },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            missingGlobalFlag: "The pattern given to the argument of `String#{{method}}()` requires the `g` flag, but is missing it.",
        },
        type: "problem",
    },
    create(context) {
        const { strictTypes } = parseOption(context.options[0]);
        const typeTracer = (0, type_tracker_1.createTypeTracker)(context);
        function visit(regexpContext) {
            const { regexpNode, flags, flagsString } = regexpContext;
            if (flags.global ||
                flagsString == null) {
                return;
            }
            for (const ref of (0, ast_utils_1.extractExpressionReferences)(regexpNode, context)) {
                verifyExpressionReference(ref, regexpContext);
            }
        }
        function verifyExpressionReference(ref, { regexpNode, fixReplaceFlags, flagsString, }) {
            if (ref.type !== "argument") {
                return;
            }
            const node = ref.callExpression;
            if (node.arguments[0] !== ref.node ||
                !(0, ast_utils_1.isKnownMethodCall)(node, {
                    matchAll: 1,
                    replaceAll: 2,
                })) {
                return;
            }
            if (strictTypes
                ? !typeTracer.isString(node.callee.object)
                : !typeTracer.maybeString(node.callee.object)) {
                return;
            }
            context.report({
                node: ref.node,
                messageId: "missingGlobalFlag",
                data: {
                    method: node.callee.property.name,
                },
                fix: buildFixer(),
            });
            function buildFixer() {
                if (node.arguments[0] !== regexpNode ||
                    ((regexpNode.type === "NewExpression" ||
                        regexpNode.type === "CallExpression") &&
                        regexpNode.arguments[1] &&
                        regexpNode.arguments[1].type !== "Literal")) {
                    return null;
                }
                return fixReplaceFlags(`${flagsString}g`, false);
            }
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor(regexpContext) {
                visit(regexpContext);
                return {};
            },
            visitInvalid: visit,
            visitUnknown: visit,
        });
    },
});
