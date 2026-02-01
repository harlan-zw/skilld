"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const ts_util_1 = require("../utils/ts-util");
const eslint_utils_1 = require("@eslint-community/eslint-utils");
exports.default = (0, utils_1.createRule)("prefer-result-array-groups", {
    meta: {
        docs: {
            description: "enforce using result array `groups`",
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
            unexpected: "Unexpected indexed access for the named capturing group '{{ name }}' from regexp result array.",
        },
        type: "suggestion",
    },
    create(context) {
        var _a, _b;
        const strictTypes = (_b = (_a = context.options[0]) === null || _a === void 0 ? void 0 : _a.strictTypes) !== null && _b !== void 0 ? _b : true;
        const sourceCode = context.sourceCode;
        function createVisitor(regexpContext) {
            const { getAllCapturingGroups, getCapturingGroupReferences } = regexpContext;
            const capturingGroups = getAllCapturingGroups();
            if (!capturingGroups.length) {
                return {};
            }
            for (const ref of getCapturingGroupReferences({ strictTypes })) {
                if (ref.type === "ArrayRef" &&
                    ref.kind === "index" &&
                    ref.ref != null) {
                    const cgNode = capturingGroups[ref.ref - 1];
                    if (cgNode && cgNode.name) {
                        const memberNode = ref.prop.type === "member" ? ref.prop.node : null;
                        context.report({
                            node: ref.prop.node,
                            messageId: "unexpected",
                            data: {
                                name: cgNode.name,
                            },
                            fix: memberNode && memberNode.computed
                                ? (fixer) => {
                                    const tokens = sourceCode.getTokensBetween(memberNode.object, memberNode.property);
                                    let openingBracket = tokens.pop();
                                    while (openingBracket &&
                                        !(0, eslint_utils_1.isOpeningBracketToken)(openingBracket)) {
                                        openingBracket = tokens.pop();
                                    }
                                    if (!openingBracket) {
                                        return null;
                                    }
                                    const kind = getRegExpArrayTypeKind(memberNode.object);
                                    if (kind === "unknown") {
                                        return null;
                                    }
                                    const needNonNull = kind === "RegExpXArray";
                                    return fixer.replaceTextRange([
                                        openingBracket.range[0],
                                        memberNode.range[1],
                                    ], `${memberNode.optional ? "" : "."}groups${needNonNull ? "!" : ""}.${cgNode.name}`);
                                }
                                : null,
                        });
                    }
                }
            }
            return {};
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
        function getRegExpArrayTypeKind(node) {
            const { tsNodeMap, checker, usedTS, hasFullTypeInformation } = (0, ts_util_1.getTypeScriptTools)(context);
            if (!usedTS) {
                return null;
            }
            if (!hasFullTypeInformation) {
                return "unknown";
            }
            const tsNode = tsNodeMap.get(node);
            const tsType = (tsNode && (checker === null || checker === void 0 ? void 0 : checker.getTypeAtLocation(tsNode))) || null;
            if (!tsType) {
                return "unknown";
            }
            if ((0, ts_util_1.isAny)(tsType)) {
                return "any";
            }
            if (isRegExpMatchArrayOrRegExpExecArray(tsType)) {
                return "RegExpXArray";
            }
            if ((0, ts_util_1.isUnionOrIntersection)(tsType)) {
                if (tsType.types.every((t) => isRegExpMatchArrayOrRegExpExecArray(t) || (0, ts_util_1.isNull)(t))) {
                    return "RegExpXArray";
                }
            }
            return "unknown";
        }
        function isRegExpMatchArrayOrRegExpExecArray(tsType) {
            if ((0, ts_util_1.isClassOrInterface)(tsType)) {
                const name = tsType.symbol.escapedName;
                return name === "RegExpMatchArray" || name === "RegExpExecArray";
            }
            return false;
        }
    },
});
