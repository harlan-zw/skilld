"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
const util_1 = require("../utils/util");
function isNegatableCharacterClassElement(node) {
    return (node.type === "CharacterClass" ||
        node.type === "ExpressionCharacterClass" ||
        (node.type === "CharacterSet" &&
            (node.kind !== "property" || !node.strings)));
}
exports.default = (0, utils_1.createRule)("negation", {
    meta: {
        docs: {
            description: "enforce use of escapes on negation",
            category: "Best Practices",
            recommended: true,
        },
        fixable: "code",
        schema: [],
        messages: {
            unexpected: "Unexpected negated character class. Use '{{negatedCharSet}}' instead.",
        },
        type: "suggestion",
    },
    create(context) {
        function createVisitor({ node, getRegexpLocation, fixReplaceNode, flags, }) {
            return {
                onCharacterClassEnter(ccNode) {
                    if (!ccNode.negate || ccNode.elements.length !== 1) {
                        return;
                    }
                    const element = ccNode.elements[0];
                    if (!isNegatableCharacterClassElement(element)) {
                        return;
                    }
                    if (element.type !== "CharacterSet" && !element.negate) {
                        return;
                    }
                    if (flags.ignoreCase &&
                        !flags.unicodeSets &&
                        element.type === "CharacterSet" &&
                        element.kind === "property") {
                        const ccSet = (0, regexp_ast_analysis_1.toUnicodeSet)(ccNode, flags);
                        const negatedElementSet = (0, regexp_ast_analysis_1.toUnicodeSet)({
                            ...element,
                            negate: !element.negate,
                        }, flags);
                        if (!ccSet.equals(negatedElementSet)) {
                            return;
                        }
                    }
                    const negatedCharSet = getNegationText(element);
                    context.report({
                        node,
                        loc: getRegexpLocation(ccNode),
                        messageId: "unexpected",
                        data: { negatedCharSet },
                        fix: fixReplaceNode(ccNode, negatedCharSet),
                    });
                },
            };
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
function getNegationText(node) {
    if (node.type === "CharacterSet") {
        let kind = node.raw[1];
        if (kind.toLowerCase() === kind) {
            kind = kind.toUpperCase();
        }
        else {
            kind = kind.toLowerCase();
        }
        return `\\${kind}${node.raw.slice(2)}`;
    }
    if (node.type === "CharacterClass") {
        return `[${node.elements.map((e) => e.raw).join("")}]`;
    }
    if (node.type === "ExpressionCharacterClass") {
        return `[${node.raw.slice(2, -1)}]`;
    }
    return (0, util_1.assertNever)(node);
}
