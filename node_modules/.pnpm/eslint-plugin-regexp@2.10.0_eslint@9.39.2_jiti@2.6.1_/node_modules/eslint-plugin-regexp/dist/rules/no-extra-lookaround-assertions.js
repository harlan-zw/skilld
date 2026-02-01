"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.default = (0, utils_1.createRule)("no-extra-lookaround-assertions", {
    meta: {
        docs: {
            description: "disallow unnecessary nested lookaround assertions",
            category: "Best Practices",
            recommended: true,
        },
        fixable: "code",
        schema: [],
        messages: {
            canBeInlined: "This {{kind}} assertion is useless and can be inlined.",
            canBeConvertedIntoGroup: "This {{kind}} assertion is useless and can be converted into a group.",
        },
        type: "suggestion",
    },
    create(context) {
        function createVisitor(regexpContext) {
            return {
                onAssertionEnter(aNode) {
                    if (aNode.kind === "lookahead" ||
                        aNode.kind === "lookbehind") {
                        verify(regexpContext, aNode);
                    }
                },
            };
        }
        function verify(regexpContext, assertion) {
            for (const alternative of assertion.alternatives) {
                const nested = alternative.elements.at(assertion.kind === "lookahead"
                    ?
                        -1
                    :
                        0);
                if ((nested === null || nested === void 0 ? void 0 : nested.type) === "Assertion" &&
                    nested.kind === assertion.kind &&
                    !nested.negate) {
                    reportLookaroundAssertion(regexpContext, nested);
                }
            }
        }
        function reportLookaroundAssertion({ node, getRegexpLocation, fixReplaceNode }, assertion) {
            let messageId, replaceText;
            if (assertion.alternatives.length === 1) {
                messageId = "canBeInlined";
                replaceText = assertion.alternatives[0].raw;
            }
            else {
                messageId = "canBeConvertedIntoGroup";
                replaceText = `(?:${assertion.alternatives
                    .map((alt) => alt.raw)
                    .join("|")})`;
            }
            context.report({
                node,
                loc: getRegexpLocation(assertion),
                messageId,
                data: {
                    kind: assertion.kind,
                },
                fix: fixReplaceNode(assertion, replaceText),
            });
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
