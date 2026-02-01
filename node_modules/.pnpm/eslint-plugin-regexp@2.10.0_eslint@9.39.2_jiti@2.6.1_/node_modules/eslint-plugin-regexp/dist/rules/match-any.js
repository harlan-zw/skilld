"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
const utils_2 = require("../utils/ast-utils/utils");
const mention_1 = require("../utils/mention");
const OPTION_SS1 = "[\\s\\S]";
const OPTION_SS2 = "[\\S\\s]";
const OPTION_CARET = "[^]";
const OPTION_DOTALL = "dotAll";
exports.default = (0, utils_1.createRule)("match-any", {
    meta: {
        docs: {
            description: "enforce match any character style",
            category: "Stylistic Issues",
            recommended: true,
        },
        fixable: "code",
        schema: [
            {
                type: "object",
                properties: {
                    allows: {
                        type: "array",
                        items: {
                            type: "string",
                            enum: [
                                OPTION_SS1,
                                OPTION_SS2,
                                OPTION_CARET,
                                OPTION_DOTALL,
                            ],
                        },
                        uniqueItems: true,
                        minItems: 1,
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            unexpected: "Unexpected using {{expr}} to match any character.",
        },
        type: "suggestion",
    },
    create(context) {
        var _a, _b;
        const sourceCode = context.sourceCode;
        const allowList = (_b = (_a = context.options[0]) === null || _a === void 0 ? void 0 : _a.allows) !== null && _b !== void 0 ? _b : [OPTION_SS1, OPTION_DOTALL];
        const allows = new Set(allowList);
        const preference = allowList[0] || null;
        function fix(fixer, { node, flags, patternSource }, regexpNode) {
            var _a, _b;
            if (!preference) {
                return null;
            }
            if (preference === OPTION_DOTALL) {
                if (!flags.dotAll) {
                    return null;
                }
                if (!(0, utils_2.isRegexpLiteral)(node)) {
                    return null;
                }
                const range = patternSource.getReplaceRange(regexpNode);
                if (range == null) {
                    return null;
                }
                const afterRange = [
                    range.range[1],
                    node.range[1],
                ];
                return [
                    range.replace(fixer, "."),
                    fixer.replaceTextRange(afterRange, sourceCode.text.slice(...afterRange)),
                ];
            }
            if (regexpNode.type === "CharacterClass" &&
                preference.startsWith("[") &&
                preference.endsWith("]")) {
                const range = patternSource.getReplaceRange({
                    start: regexpNode.start + 1,
                    end: regexpNode.end - 1,
                });
                return (_a = range === null || range === void 0 ? void 0 : range.replace(fixer, preference.slice(1, -1))) !== null && _a !== void 0 ? _a : null;
            }
            const range = patternSource.getReplaceRange(regexpNode);
            return (_b = range === null || range === void 0 ? void 0 : range.replace(fixer, preference)) !== null && _b !== void 0 ? _b : null;
        }
        function createVisitor(regexpContext) {
            const { node, flags, getRegexpLocation } = regexpContext;
            function onClass(ccNode) {
                if ((0, regexp_ast_analysis_1.matchesAllCharacters)(ccNode, flags) &&
                    !(0, regexp_ast_analysis_1.hasStrings)(ccNode, flags) &&
                    !allows.has(ccNode.raw)) {
                    context.report({
                        node,
                        loc: getRegexpLocation(ccNode),
                        messageId: "unexpected",
                        data: {
                            expr: (0, mention_1.mention)(ccNode),
                        },
                        fix(fixer) {
                            return fix(fixer, regexpContext, ccNode);
                        },
                    });
                }
            }
            return {
                onCharacterSetEnter(csNode) {
                    if (csNode.kind === "any" &&
                        flags.dotAll &&
                        !allows.has(OPTION_DOTALL)) {
                        context.report({
                            node,
                            loc: getRegexpLocation(csNode),
                            messageId: "unexpected",
                            data: {
                                expr: (0, mention_1.mention)(csNode),
                            },
                            fix(fixer) {
                                return fix(fixer, regexpContext, csNode);
                            },
                        });
                    }
                },
                onCharacterClassEnter: onClass,
                onExpressionCharacterClassEnter: onClass,
            };
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
