"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const STANDARD_FLAGS = "dgimsuvy";
exports.default = (0, utils_1.createRule)("no-non-standard-flag", {
    meta: {
        docs: {
            description: "disallow non-standard flags",
            category: "Best Practices",
            recommended: true,
        },
        schema: [],
        messages: {
            unexpected: "Unexpected non-standard flag '{{flag}}'.",
        },
        type: "suggestion",
    },
    create(context) {
        function visit({ regexpNode, getFlagsLocation, flagsString, }) {
            if (flagsString) {
                const nonStandard = [...flagsString].filter((f) => !STANDARD_FLAGS.includes(f));
                if (nonStandard.length > 0) {
                    context.report({
                        node: regexpNode,
                        loc: getFlagsLocation(),
                        messageId: "unexpected",
                        data: { flag: nonStandard[0] },
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
