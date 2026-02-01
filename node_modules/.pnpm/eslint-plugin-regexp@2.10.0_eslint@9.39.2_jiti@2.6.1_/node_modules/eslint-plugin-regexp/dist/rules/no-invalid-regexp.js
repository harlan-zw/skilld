"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
function getErrorIndex(error) {
    const index = error.index;
    if (typeof index === "number") {
        return index;
    }
    return null;
}
exports.default = (0, utils_1.createRule)("no-invalid-regexp", {
    meta: {
        docs: {
            description: "disallow invalid regular expression strings in `RegExp` constructors",
            category: "Possible Errors",
            recommended: true,
        },
        schema: [],
        messages: {
            error: "{{message}}",
            duplicateFlag: "Duplicate {{flag}} flag.",
            uvFlag: "Regex 'u' and 'v' flags cannot be used together.",
        },
        type: "problem",
    },
    create(context) {
        function visitInvalid(regexpContext) {
            const { node, error, patternSource } = regexpContext;
            let loc = undefined;
            const index = getErrorIndex(error);
            if (index !== null &&
                index >= 0 &&
                index <= patternSource.value.length) {
                loc = patternSource.getAstLocation({
                    start: Math.max(index - 1, 0),
                    end: Math.min(index + 1, patternSource.value.length),
                });
            }
            context.report({
                node,
                loc: loc !== null && loc !== void 0 ? loc : undefined,
                messageId: "error",
                data: { message: error.message },
            });
        }
        function visitUnknown(regexpContext) {
            const { node, flags, flagsString, getFlagsLocation } = regexpContext;
            const flagSet = new Set();
            for (const flag of flagsString !== null && flagsString !== void 0 ? flagsString : "") {
                if (flagSet.has(flag)) {
                    context.report({
                        node,
                        loc: getFlagsLocation(),
                        messageId: "duplicateFlag",
                        data: { flag },
                    });
                    return;
                }
                flagSet.add(flag);
            }
            if (flags.unicode && flags.unicodeSets) {
                context.report({
                    node,
                    loc: getFlagsLocation(),
                    messageId: "uvFlag",
                });
            }
        }
        return (0, utils_1.defineRegexpVisitor)(context, { visitInvalid, visitUnknown });
    },
});
