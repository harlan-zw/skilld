"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexpp_1 = require("@eslint-community/regexpp");
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
const regex_syntax_1 = require("../utils/regex-syntax");
function isCompatible(regexpContext) {
    const INCOMPATIBLE = {};
    const { flags, patternAst, pattern } = regexpContext;
    try {
        const flagsWithV = { ...flags, unicodeSets: true, unicode: false };
        (0, regexpp_1.visitRegExpAST)(patternAst, {
            onCharacterClassEnter(node) {
                const us = (0, regexp_ast_analysis_1.toUnicodeSet)(node, flags);
                const vus = (0, regexp_ast_analysis_1.toUnicodeSet)({ ...node, unicodeSets: true }, flagsWithV);
                if (!us.equals(vus)) {
                    throw INCOMPATIBLE;
                }
                if (regex_syntax_1.RESERVED_DOUBLE_PUNCTUATOR_PATTERN.test(node.raw)) {
                    throw INCOMPATIBLE;
                }
            },
        });
    }
    catch (error) {
        if (error === INCOMPATIBLE) {
            return false;
        }
        throw error;
    }
    try {
        new regexpp_1.RegExpParser().parsePattern(pattern, undefined, undefined, {
            unicodeSets: true,
        });
    }
    catch (_a) {
        return false;
    }
    return true;
}
exports.default = (0, utils_1.createRule)("require-unicode-sets-regexp", {
    meta: {
        docs: {
            description: "enforce the use of the `v` flag",
            category: "Best Practices",
            recommended: false,
        },
        schema: [],
        fixable: "code",
        messages: {
            require: "Use the 'v' flag.",
        },
        type: "suggestion",
    },
    create(context) {
        function createVisitor(regexpContext) {
            const { node, flags, flagsString, getFlagsLocation, fixReplaceFlags, } = regexpContext;
            if (flagsString === null) {
                return {};
            }
            if (!flags.unicodeSets) {
                context.report({
                    node,
                    loc: getFlagsLocation(),
                    messageId: "require",
                    fix: fixReplaceFlags(() => {
                        if (!flags.unicode ||
                            !isCompatible(regexpContext)) {
                            return null;
                        }
                        return `${flagsString.replace(/u/gu, "")}v`;
                    }),
                });
            }
            return {};
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
