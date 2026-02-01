"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.default = (0, utils_1.createRule)("prefer-named-replacement", {
    meta: {
        docs: {
            description: "enforce using named replacement",
            category: "Stylistic Issues",
            recommended: false,
        },
        fixable: "code",
        schema: [
            {
                type: "object",
                properties: {
                    strictTypes: { type: "boolean" },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            unexpected: "Unexpected indexed reference in replacement string.",
        },
        type: "suggestion",
    },
    create(context) {
        var _a, _b;
        const strictTypes = (_b = (_a = context.options[0]) === null || _a === void 0 ? void 0 : _a.strictTypes) !== null && _b !== void 0 ? _b : true;
        const sourceCode = context.sourceCode;
        function createVisitor(regexpContext) {
            const { node, getAllCapturingGroups, getCapturingGroupReferences } = regexpContext;
            const capturingGroups = getAllCapturingGroups();
            if (!capturingGroups.length) {
                return {};
            }
            for (const ref of getCapturingGroupReferences({ strictTypes })) {
                if (ref.type === "ReplacementRef" &&
                    ref.kind === "index" &&
                    ref.range) {
                    const cgNode = capturingGroups[ref.ref - 1];
                    if (cgNode && cgNode.name) {
                        context.report({
                            node,
                            loc: {
                                start: sourceCode.getLocFromIndex(ref.range[0]),
                                end: sourceCode.getLocFromIndex(ref.range[1]),
                            },
                            messageId: "unexpected",
                            fix(fixer) {
                                return fixer.replaceTextRange(ref.range, `$<${cgNode.name}>`);
                            },
                        });
                    }
                }
            }
            return {};
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
