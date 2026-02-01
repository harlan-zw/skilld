"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const get_usage_of_pattern_1 = require("../utils/get-usage-of-pattern");
function isTopLevel(group) {
    const parent = group.parent;
    if (parent.type === "Alternative" && parent.elements.length === 1) {
        const parentParent = parent.parent;
        if (parentParent.type === "Pattern" &&
            parentParent.alternatives.length === 1) {
            return true;
        }
    }
    return false;
}
exports.default = (0, utils_1.createRule)("no-useless-non-capturing-group", {
    meta: {
        docs: {
            description: "disallow unnecessary non-capturing group",
            category: "Stylistic Issues",
            recommended: true,
        },
        fixable: "code",
        schema: [
            {
                type: "object",
                properties: {
                    allowTop: {
                        anyOf: [
                            {
                                type: "boolean",
                            },
                            { enum: ["always", "never", "partial"] },
                        ],
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            unexpected: "Unexpected unnecessary non-capturing group. This group can be removed without changing the behaviour of the regex.",
        },
        type: "suggestion",
    },
    create(context) {
        var _a, _b, _c, _d;
        const allowTop = ((_a = context.options[0]) === null || _a === void 0 ? void 0 : _a.allowTop) === true
            ? "always"
            : ((_b = context.options[0]) === null || _b === void 0 ? void 0 : _b.allowTop) === false
                ? "never"
                : ((_d = (_c = context.options[0]) === null || _c === void 0 ? void 0 : _c.allowTop) !== null && _d !== void 0 ? _d : "partial");
        function createVisitor({ node, getRegexpLocation, fixReplaceNode, getUsageOfPattern, }) {
            let isIgnored;
            if (allowTop === "always") {
                isIgnored = isTopLevel;
            }
            else if (allowTop === "partial") {
                if (getUsageOfPattern() !== get_usage_of_pattern_1.UsageOfPattern.whole) {
                    isIgnored = isTopLevel;
                }
                else {
                    isIgnored = () => false;
                }
            }
            else {
                isIgnored = () => false;
            }
            return {
                onGroupEnter(gNode) {
                    if (isIgnored(gNode)) {
                        return;
                    }
                    if (gNode.alternatives.length === 1) {
                        const alt = gNode.alternatives[0];
                        if (alt.elements.length === 0) {
                            return;
                        }
                        const parent = gNode.parent;
                        if (parent.type === "Quantifier" &&
                            (alt.elements.length > 1 ||
                                alt.elements[0].type === "Quantifier")) {
                            return;
                        }
                        if (!(0, utils_1.canUnwrapped)(gNode, alt.raw)) {
                            return;
                        }
                    }
                    else {
                        const parent = gNode.parent;
                        if (parent.type !== "Alternative") {
                            return;
                        }
                        if (parent.elements.length !== 1) {
                            return;
                        }
                    }
                    context.report({
                        node,
                        loc: getRegexpLocation(gNode, [0, 3]),
                        messageId: "unexpected",
                        fix: fixReplaceNode(gNode, () => {
                            if (allowTop === "never" &&
                                isTopLevel(gNode) &&
                                getUsageOfPattern() !== get_usage_of_pattern_1.UsageOfPattern.whole) {
                                return null;
                            }
                            return gNode.raw.slice(3, -1);
                        }),
                    });
                },
            };
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
