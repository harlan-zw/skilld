"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
const ast_utils_1 = require("../utils/ast-utils");
const mention_1 = require("../utils/mention");
const regexp_ast_1 = require("../utils/regexp-ast");
const type_tracker_1 = require("../utils/type-tracker");
class ReplaceReferencesList {
    constructor(list) {
        var _a, _b;
        this.list = list;
        this.startRefName = (_a = list[0].startRef) === null || _a === void 0 ? void 0 : _a.ref;
        this.endRefName = (_b = list[0].endRef) === null || _b === void 0 ? void 0 : _b.ref;
        const otherThanStartRefNames = new Set();
        const otherThanEndRefNames = new Set();
        for (const { startRef, endRef, allRefs } of this.list) {
            for (const ref of allRefs) {
                if (ref !== startRef) {
                    otherThanStartRefNames.add(ref.ref);
                }
                if (ref !== endRef) {
                    otherThanEndRefNames.add(ref.ref);
                }
            }
        }
        this.otherThanStartRefNames = otherThanStartRefNames;
        this.otherThanEndRefNames = otherThanEndRefNames;
    }
    *[Symbol.iterator]() {
        yield* this.list;
    }
}
function getSideEffectsWhenReplacingCapturingGroup(elements, start, end, { flags }) {
    const result = new Set();
    if (start) {
        const { chars } = (0, regexp_ast_analysis_1.getConsumedChars)(start, flags);
        if (!hasDisjoint(chars, elements.slice(1))) {
            result.add(0);
        }
        else {
            const last = elements[elements.length - 1];
            const lastChar = regexp_ast_analysis_1.FirstConsumedChars.toLook((0, regexp_ast_1.getFirstConsumedCharPlusAfter)(last, "rtl", flags));
            if (!lastChar.char.isDisjointWith(chars)) {
                result.add(0);
            }
        }
    }
    if (end && flags.global) {
        const first = elements[0];
        if (first) {
            const { chars } = (0, regexp_ast_analysis_1.getConsumedChars)(end, flags);
            const firstChar = regexp_ast_analysis_1.FirstConsumedChars.toLook((0, regexp_ast_1.getFirstConsumedCharPlusAfter)(first, "ltr", flags));
            if (!firstChar.char.isDisjointWith(chars)) {
                result.add(1);
            }
        }
    }
    return result;
    function hasDisjoint(target, targetElements) {
        for (const element of targetElements) {
            if (isConstantLength(element)) {
                const elementChars = (0, regexp_ast_analysis_1.getConsumedChars)(element, flags);
                if (elementChars.chars.isEmpty) {
                    continue;
                }
                if (elementChars.chars.isDisjointWith(target)) {
                    return true;
                }
            }
            else {
                const elementLook = regexp_ast_analysis_1.FirstConsumedChars.toLook((0, regexp_ast_1.getFirstConsumedCharPlusAfter)(element, "ltr", flags));
                return elementLook.char.isDisjointWith(target);
            }
        }
        return false;
    }
    function isConstantLength(target) {
        const range = (0, regexp_ast_analysis_1.getLengthRange)(target, flags);
        return range.min === range.max;
    }
}
function isCapturingGroupAndNotZeroLength(element, flags) {
    return element.type === "CapturingGroup" && !(0, regexp_ast_analysis_1.isZeroLength)(element, flags);
}
function parsePatternElements(node, flags) {
    if (node.alternatives.length > 1) {
        return null;
    }
    const elements = node.alternatives[0].elements;
    const leadingElements = [];
    let start = null;
    for (const element of elements) {
        if ((0, regexp_ast_analysis_1.isZeroLength)(element, flags)) {
            leadingElements.push(element);
            continue;
        }
        if (isCapturingGroupAndNotZeroLength(element, flags)) {
            const capturingGroup = element;
            start = {
                leadingElements,
                capturingGroup,
                replacedAssertion: startElementsToLookbehindAssertionText(leadingElements, capturingGroup),
                range: {
                    start: (leadingElements[0] || capturingGroup).start,
                    end: capturingGroup.end,
                },
            };
        }
        break;
    }
    let end = null;
    const trailingElements = [];
    for (const element of [...elements].reverse()) {
        if ((0, regexp_ast_analysis_1.isZeroLength)(element, flags)) {
            trailingElements.unshift(element);
            continue;
        }
        if (isCapturingGroupAndNotZeroLength(element, flags)) {
            const capturingGroup = element;
            end = {
                capturingGroup,
                trailingElements,
                replacedAssertion: endElementsToLookaheadAssertionText(capturingGroup, trailingElements),
                range: {
                    start: capturingGroup.start,
                    end: (trailingElements[trailingElements.length - 1] ||
                        capturingGroup).end,
                },
            };
        }
        break;
    }
    if (!start && !end) {
        return null;
    }
    if (start && end && start.capturingGroup === end.capturingGroup) {
        return null;
    }
    return {
        elements,
        start,
        end,
    };
}
function endElementsToLookaheadAssertionText(capturingGroup, trailingElements) {
    const groupPattern = capturingGroup.alternatives.map((a) => a.raw).join("|");
    const trailing = leadingTrailingElementsToLookaroundAssertionPatternText(trailingElements, "lookahead");
    if (trailing && capturingGroup.alternatives.length !== 1) {
        return `(?=(?:${groupPattern})${trailing})`;
    }
    return `(?=${groupPattern}${trailing})`;
}
function startElementsToLookbehindAssertionText(leadingElements, capturingGroup) {
    const leading = leadingTrailingElementsToLookaroundAssertionPatternText(leadingElements, "lookbehind");
    const groupPattern = capturingGroup.alternatives.map((a) => a.raw).join("|");
    if (leading && capturingGroup.alternatives.length !== 1) {
        return `(?<=${leading}(?:${groupPattern}))`;
    }
    return `(?<=${leading}${groupPattern})`;
}
function leadingTrailingElementsToLookaroundAssertionPatternText(leadingTrailingElements, lookaroundAssertionKind) {
    if (leadingTrailingElements.length === 1 &&
        leadingTrailingElements[0].type === "Assertion") {
        const assertion = leadingTrailingElements[0];
        if (assertion.kind === lookaroundAssertionKind &&
            !assertion.negate &&
            assertion.alternatives.length === 1) {
            return assertion.alternatives[0].raw;
        }
    }
    return leadingTrailingElements.map((e) => e.raw).join("");
}
function parseOption(userOption) {
    var _a, _b;
    return {
        lookbehind: (_a = userOption === null || userOption === void 0 ? void 0 : userOption.lookbehind) !== null && _a !== void 0 ? _a : true,
        strictTypes: (_b = userOption === null || userOption === void 0 ? void 0 : userOption.strictTypes) !== null && _b !== void 0 ? _b : true,
    };
}
exports.default = (0, utils_1.createRule)("prefer-lookaround", {
    meta: {
        docs: {
            description: "prefer lookarounds over capturing group that do not replace",
            category: "Stylistic Issues",
            recommended: false,
        },
        fixable: "code",
        schema: [
            {
                type: "object",
                properties: {
                    lookbehind: { type: "boolean" },
                    strictTypes: { type: "boolean" },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            preferLookarounds: "These capturing groups can be replaced with lookaround assertions ({{expr1}} and {{expr2}}).",
            prefer: "This capturing group can be replaced with a {{kind}} ({{expr}}).",
        },
        type: "suggestion",
    },
    create(context) {
        const { lookbehind, strictTypes } = parseOption(context.options[0]);
        const typeTracer = (0, type_tracker_1.createTypeTracker)(context);
        function createVisitor(regexpContext) {
            const { regexpNode, flags, patternAst } = regexpContext;
            const parsedElements = parsePatternElements(patternAst, flags);
            if (!parsedElements) {
                return {};
            }
            const replaceReferenceList = [];
            for (const ref of (0, ast_utils_1.extractExpressionReferences)(regexpNode, context)) {
                if (ref.type === "argument") {
                    if (!(0, ast_utils_1.isKnownMethodCall)(ref.callExpression, {
                        replace: 2,
                        replaceAll: 2,
                    })) {
                        return {};
                    }
                    const replaceReference = getReplaceReferenceFromCallExpression(ref.callExpression);
                    if (!replaceReference) {
                        return {};
                    }
                    replaceReferenceList.push(replaceReference);
                }
                else if (ref.type === "member") {
                    const parent = (0, ast_utils_1.getParent)(ref.memberExpression);
                    if ((parent === null || parent === void 0 ? void 0 : parent.type) === "CallExpression" &&
                        (0, ast_utils_1.isKnownMethodCall)(parent, {
                            test: 1,
                        }) &&
                        !regexpContext.flags.global) {
                        continue;
                    }
                    return {};
                }
                else {
                    return {};
                }
            }
            if (!replaceReferenceList.length) {
                return {};
            }
            const replaceReference = replaceReferenceList[0];
            if (replaceReferenceList.some((target) => {
                var _a, _b, _c, _d;
                return ((_a = target.startRef) === null || _a === void 0 ? void 0 : _a.ref) !==
                    ((_b = replaceReference.startRef) === null || _b === void 0 ? void 0 : _b.ref) ||
                    ((_c = target.endRef) === null || _c === void 0 ? void 0 : _c.ref) !== ((_d = replaceReference.endRef) === null || _d === void 0 ? void 0 : _d.ref);
            })) {
                return {};
            }
            return createVerifyVisitor(regexpContext, parsedElements, new ReplaceReferencesList(replaceReferenceList));
        }
        function getReplaceReferenceFromCallExpression(node) {
            if (strictTypes
                ? !typeTracer.isString(node.callee.object)
                : !typeTracer.maybeString(node.callee.object)) {
                return null;
            }
            const replacementNode = node.arguments[1];
            if (replacementNode.type === "Literal") {
                return getReplaceReferenceFromLiteralReplacementArgument(replacementNode);
            }
            return getReplaceReferenceFromNonLiteralReplacementArgument(replacementNode);
        }
        function getReplaceReferenceFromLiteralReplacementArgument(node) {
            if (typeof node.value !== "string") {
                return null;
            }
            const replacements = (0, ast_utils_1.parseReplacements)(context, node);
            let startRef = null;
            let endRef = null;
            const start = replacements[0];
            if ((start === null || start === void 0 ? void 0 : start.type) === "ReferenceElement") {
                startRef = start;
            }
            const end = replacements[replacements.length - 1];
            if ((end === null || end === void 0 ? void 0 : end.type) === "ReferenceElement") {
                endRef = end;
            }
            if (!startRef && !endRef) {
                return null;
            }
            return {
                startRef,
                endRef,
                allRefs: replacements.filter((e) => e.type === "ReferenceElement"),
            };
        }
        function getReplaceReferenceFromNonLiteralReplacementArgument(node) {
            const evaluated = (0, ast_utils_1.getStaticValue)(context, node);
            if (!evaluated || typeof evaluated.value !== "string") {
                return null;
            }
            const refRegex = /\$(?<ref>[1-9]\d*|<(?<named>[^>]+)>)/gu;
            const allRefs = [];
            let startRef = null;
            let endRef = null;
            let re;
            while ((re = refRegex.exec(evaluated.value))) {
                const ref = {
                    ref: re.groups.named
                        ? re.groups.named
                        : Number(re.groups.ref),
                };
                if (re.index === 0) {
                    startRef = ref;
                }
                if (refRegex.lastIndex === evaluated.value.length) {
                    endRef = ref;
                }
                allRefs.push(ref);
            }
            if (!startRef && !endRef) {
                return null;
            }
            return {
                startRef,
                endRef,
                allRefs,
            };
        }
        function createVerifyVisitor(regexpContext, parsedElements, replaceReferenceList) {
            const startRefState = {
                capturingGroups: [],
                capturingNum: -1,
            };
            const endRefState = {
                capturingGroups: [],
                capturingNum: -1,
            };
            let refNum = 0;
            return {
                onCapturingGroupEnter(cgNode) {
                    refNum++;
                    processForState(replaceReferenceList.startRefName, replaceReferenceList.otherThanStartRefNames, startRefState);
                    processForState(replaceReferenceList.endRefName, replaceReferenceList.otherThanEndRefNames, endRefState);
                    function processForState(refName, otherThanRefNames, state) {
                        if (refName === refNum || refName === cgNode.name) {
                            state.capturingGroups.push(cgNode);
                            state.capturingNum = refNum;
                            state.isUseOther || (state.isUseOther = Boolean(otherThanRefNames.has(refNum) ||
                                (cgNode.name &&
                                    otherThanRefNames.has(cgNode.name))));
                        }
                    }
                },
                onPatternLeave() {
                    var _a, _b;
                    let reportStart = null;
                    if (!startRefState.isUseOther &&
                        startRefState.capturingGroups.length === 1 &&
                        startRefState.capturingGroups[0] ===
                            ((_a = parsedElements.start) === null || _a === void 0 ? void 0 : _a.capturingGroup)) {
                        reportStart = parsedElements.start;
                    }
                    let reportEnd = null;
                    if (!endRefState.isUseOther &&
                        endRefState.capturingGroups.length === 1 &&
                        endRefState.capturingGroups[0] ===
                            ((_b = parsedElements.end) === null || _b === void 0 ? void 0 : _b.capturingGroup)) {
                        reportEnd = parsedElements.end;
                    }
                    const sideEffects = getSideEffectsWhenReplacingCapturingGroup(parsedElements.elements, reportStart === null || reportStart === void 0 ? void 0 : reportStart.capturingGroup, reportEnd === null || reportEnd === void 0 ? void 0 : reportEnd.capturingGroup, regexpContext);
                    if (sideEffects.has(0)) {
                        reportStart = null;
                    }
                    if (sideEffects.has(1)) {
                        reportEnd = null;
                    }
                    if (!lookbehind) {
                        reportStart = null;
                    }
                    if (reportStart && reportEnd) {
                        const fix = buildFixer(regexpContext, [reportStart, reportEnd], replaceReferenceList, (target) => {
                            var _a, _b;
                            if (target.allRefs.some((ref) => ref !== target.startRef &&
                                ref !== target.endRef)) {
                                return null;
                            }
                            return [
                                (_a = target.startRef) === null || _a === void 0 ? void 0 : _a.range,
                                (_b = target.endRef) === null || _b === void 0 ? void 0 : _b.range,
                            ];
                        });
                        for (const report of [reportStart, reportEnd]) {
                            context.report({
                                loc: regexpContext.getRegexpLocation(report.range),
                                messageId: "preferLookarounds",
                                data: {
                                    expr1: (0, mention_1.mention)(reportStart.replacedAssertion),
                                    expr2: (0, mention_1.mention)(reportEnd.replacedAssertion),
                                },
                                fix,
                            });
                        }
                    }
                    else if (reportStart) {
                        const fix = buildFixer(regexpContext, [reportStart], replaceReferenceList, (target) => {
                            var _a;
                            if (target.allRefs.some((ref) => ref !== target.startRef)) {
                                return null;
                            }
                            return [(_a = target.startRef) === null || _a === void 0 ? void 0 : _a.range];
                        });
                        context.report({
                            loc: regexpContext.getRegexpLocation(reportStart.range),
                            messageId: "prefer",
                            data: {
                                kind: "lookbehind assertion",
                                expr: (0, mention_1.mention)(reportStart.replacedAssertion),
                            },
                            fix,
                        });
                    }
                    else if (reportEnd) {
                        const fix = buildFixer(regexpContext, [reportEnd], replaceReferenceList, (target) => {
                            var _a;
                            if (target.allRefs.some((ref) => {
                                if (ref === target.endRef ||
                                    typeof ref.ref !== "number") {
                                    return false;
                                }
                                return (endRefState.capturingNum <= ref.ref);
                            })) {
                                return null;
                            }
                            return [(_a = target.endRef) === null || _a === void 0 ? void 0 : _a.range];
                        });
                        context.report({
                            loc: regexpContext.getRegexpLocation(reportEnd.range),
                            messageId: "prefer",
                            data: {
                                kind: "lookahead assertion",
                                expr: (0, mention_1.mention)(reportEnd.replacedAssertion),
                            },
                            fix,
                        });
                    }
                },
            };
        }
        function buildFixer(regexpContext, replaceCapturingGroups, replaceReferenceList, getRemoveRanges) {
            const removeRanges = [];
            for (const replaceReference of replaceReferenceList) {
                const targetRemoveRanges = getRemoveRanges(replaceReference);
                if (!targetRemoveRanges) {
                    return null;
                }
                for (const range of targetRemoveRanges) {
                    if (!range) {
                        return null;
                    }
                    removeRanges.push(range);
                }
            }
            const replaces = [];
            for (const { range, replacedAssertion } of replaceCapturingGroups) {
                const replaceRange = regexpContext.patternSource.getReplaceRange(range);
                if (!replaceRange) {
                    return null;
                }
                replaces.push({
                    replaceRange,
                    replacedAssertion,
                });
            }
            return (fixer) => {
                const list = [];
                for (const removeRange of removeRanges) {
                    list.push({
                        offset: removeRange[0],
                        fix: () => fixer.removeRange(removeRange),
                    });
                }
                for (const { replaceRange, replacedAssertion } of replaces) {
                    list.push({
                        offset: replaceRange.range[0],
                        fix: () => replaceRange.replace(fixer, replacedAssertion),
                    });
                }
                return list
                    .sort((a, b) => a.offset - b.offset)
                    .map((item) => item.fix());
            };
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
