"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
const mention_1 = require("../utils/mention");
function isDigits(element) {
    return ((element.type === "CharacterSet" &&
        element.kind === "digit" &&
        !element.negate) ||
        (element.type === "CharacterClassRange" &&
            element.min.value === utils_1.CP_DIGIT_ZERO &&
            element.max.value === utils_1.CP_DIGIT_NINE));
}
exports.default = (0, utils_1.createRule)("prefer-d", {
    meta: {
        docs: {
            description: "enforce using `\\d`",
            category: "Stylistic Issues",
            recommended: true,
        },
        fixable: "code",
        schema: [
            {
                type: "object",
                properties: {
                    insideCharacterClass: {
                        type: "string",
                        enum: ["ignore", "range", "d"],
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            unexpected: "Unexpected {{type}} {{expr}}. Use '{{instead}}' instead.",
        },
        type: "suggestion",
    },
    create(context) {
        var _a, _b;
        const insideCharacterClass = (_b = (_a = context.options[0]) === null || _a === void 0 ? void 0 : _a.insideCharacterClass) !== null && _b !== void 0 ? _b : "ignore";
        function createVisitor({ node, flags, getRegexpLocation, fixReplaceNode, }) {
            function verifyCharacterClass(ccNode) {
                const charSet = (0, regexp_ast_analysis_1.toUnicodeSet)(ccNode, flags);
                let predefined = undefined;
                if (charSet.equals(regexp_ast_analysis_1.Chars.digit(flags))) {
                    predefined = "\\d";
                }
                else if (charSet.equals(regexp_ast_analysis_1.Chars.digit(flags).negate())) {
                    predefined = "\\D";
                }
                if (predefined) {
                    context.report({
                        node,
                        loc: getRegexpLocation(ccNode),
                        messageId: "unexpected",
                        data: {
                            type: "character class",
                            expr: (0, mention_1.mention)(ccNode),
                            instead: predefined,
                        },
                        fix: fixReplaceNode(ccNode, predefined),
                    });
                    return;
                }
                if (insideCharacterClass === "ignore" ||
                    ccNode.type !== "CharacterClass") {
                    return;
                }
                const expected = insideCharacterClass === "d" ? "\\d" : "0-9";
                for (const e of ccNode.elements) {
                    if (isDigits(e) && e.raw !== expected) {
                        context.report({
                            node,
                            loc: getRegexpLocation(e),
                            messageId: "unexpected",
                            data: {
                                type: e.type === "CharacterSet"
                                    ? "character set"
                                    : "character class range",
                                expr: (0, mention_1.mention)(e),
                                instead: expected,
                            },
                            fix: fixReplaceNode(e, expected),
                        });
                    }
                }
            }
            return {
                onCharacterClassEnter: verifyCharacterClass,
                onExpressionCharacterClassEnter: verifyCharacterClass,
            };
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
