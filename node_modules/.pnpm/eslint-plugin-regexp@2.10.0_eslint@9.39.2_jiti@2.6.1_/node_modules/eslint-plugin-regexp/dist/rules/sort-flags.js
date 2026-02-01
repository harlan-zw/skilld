"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.default = (0, utils_1.createRule)("sort-flags", {
    meta: {
        docs: {
            description: "require regex flags to be sorted",
            category: "Stylistic Issues",
            recommended: true,
        },
        fixable: "code",
        schema: [],
        messages: {
            sortFlags: "The flags '{{flags}}' should be in the order '{{sortedFlags}}'.",
        },
        type: "suggestion",
    },
    create(context) {
        function sortFlags(flagsStr) {
            return [...flagsStr]
                .sort((a, b) => a.codePointAt(0) - b.codePointAt(0))
                .join("");
        }
        function visit({ regexpNode, flagsString, ownsFlags, getFlagsLocation, fixReplaceFlags, }) {
            if (flagsString && ownsFlags) {
                const sortedFlags = sortFlags(flagsString);
                if (flagsString !== sortedFlags) {
                    context.report({
                        node: regexpNode,
                        loc: getFlagsLocation(),
                        messageId: "sortFlags",
                        data: { flags: flagsString, sortedFlags },
                        fix: fixReplaceFlags(sortedFlags, false),
                    });
                }
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
