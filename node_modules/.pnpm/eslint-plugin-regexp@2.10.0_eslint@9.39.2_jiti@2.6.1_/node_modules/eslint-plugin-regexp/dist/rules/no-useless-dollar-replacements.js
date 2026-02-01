"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const ast_utils_1 = require("../utils/ast-utils");
const regexp_ast_1 = require("../utils/regexp-ast");
const type_tracker_1 = require("../utils/type-tracker");
function extractDollarReplacements(context, node) {
    return (0, ast_utils_1.parseReplacements)(context, node).filter((e) => e.type === "ReferenceElement");
}
exports.default = (0, utils_1.createRule)("no-useless-dollar-replacements", {
    meta: {
        docs: {
            description: "disallow useless `$` replacements in replacement string",
            category: "Possible Errors",
            recommended: true,
        },
        schema: [],
        messages: {
            numberRef: "'${{ refText }}' replacement will insert '${{ refText }}' because there are less than {{ num }} capturing groups. Use '$$' if you want to escape '$'.",
            numberRefCapturingNotFound: "'${{ refText }}' replacement will insert '${{ refText }}' because capturing group is not found. Use '$$' if you want to escape '$'.",
            namedRef: "'$<{{ refText }}>' replacement will be ignored because the named capturing group is not found. Use '$$' if you want to escape '$'.",
            namedRefNamedCapturingNotFound: "'$<{{ refText }}>' replacement will insert '$<{{ refText }}>' because named capturing group is not found. Use '$$' if you want to escape '$'.",
        },
        type: "suggestion",
    },
    create(context) {
        const typeTracer = (0, type_tracker_1.createTypeTracker)(context);
        const sourceCode = context.sourceCode;
        function verify(patternNode, replacement) {
            const captures = (0, regexp_ast_1.extractCaptures)(patternNode);
            for (const dollarReplacement of extractDollarReplacements(context, replacement)) {
                if (typeof dollarReplacement.ref === "number") {
                    if (captures.count < dollarReplacement.ref) {
                        context.report({
                            node: replacement,
                            loc: {
                                start: sourceCode.getLocFromIndex(dollarReplacement.range[0]),
                                end: sourceCode.getLocFromIndex(dollarReplacement.range[1]),
                            },
                            messageId: captures.count > 0
                                ? "numberRef"
                                : "numberRefCapturingNotFound",
                            data: {
                                refText: dollarReplacement.refText,
                                num: String(dollarReplacement.ref),
                            },
                        });
                    }
                }
                else {
                    if (!captures.names.has(dollarReplacement.ref)) {
                        context.report({
                            node: replacement,
                            loc: {
                                start: sourceCode.getLocFromIndex(dollarReplacement.range[0]),
                                end: sourceCode.getLocFromIndex(dollarReplacement.range[1]),
                            },
                            messageId: captures.names.size > 0
                                ? "namedRef"
                                : "namedRefNamedCapturingNotFound",
                            data: {
                                refText: dollarReplacement.refText,
                            },
                        });
                    }
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
                const patternNode = (0, regexp_ast_1.getRegExpNodeFromExpression)(node.arguments[0], context);
                if (!patternNode) {
                    return;
                }
                if (!typeTracer.isString(mem.object)) {
                    return;
                }
                verify(patternNode, replacementTextNode);
            },
        };
    },
});
