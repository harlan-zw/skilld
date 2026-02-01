"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRule = createRule;
exports.defineRegexpVisitor = defineRegexpVisitor;
exports.compositingVisitors = compositingVisitors;
exports.mightCreateNewElement = mightCreateNewElement;
exports.fixRemoveCharacterClassElement = fixRemoveCharacterClassElement;
exports.fixRemoveAlternative = fixRemoveAlternative;
exports.fixRemoveStringAlternative = fixRemoveStringAlternative;
exports.canUnwrapped = canUnwrapped;
const regexpp_1 = require("@eslint-community/regexpp");
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const ast_utils_1 = require("./ast-utils");
const pattern_source_1 = require("./ast-utils/pattern-source");
const utils_1 = require("./ast-utils/utils");
const extract_capturing_group_references_1 = require("./extract-capturing-group-references");
const get_usage_of_pattern_1 = require("./get-usage-of-pattern");
const regex_syntax_1 = require("./regex-syntax");
const regexp_ast_1 = require("./regexp-ast");
const type_tracker_1 = require("./type-tracker");
const util_1 = require("./util");
const eslint_utils_1 = require("@eslint-community/eslint-utils");
__exportStar(require("./unicode"), exports);
const regexpRules = new WeakMap();
function createRule(ruleName, rule) {
    return {
        meta: {
            ...rule.meta,
            docs: {
                ...rule.meta.docs,
                url: `https://ota-meshi.github.io/eslint-plugin-regexp/rules/${ruleName}.html`,
                ruleId: `regexp/${ruleName}`,
                ruleName,
            },
        },
        create: rule.create,
    };
}
function defineRegexpVisitor(context, rule) {
    const programNode = context.sourceCode.ast;
    let visitor;
    let rules = regexpRules.get(programNode);
    if (!rules) {
        rules = [];
        regexpRules.set(programNode, rules);
        visitor = buildRegexpVisitor(context, rules, () => {
            regexpRules.delete(programNode);
        });
    }
    else {
        visitor = {};
    }
    let createLiteralVisitor = undefined;
    let createSourceVisitor = undefined;
    if ("createVisitor" in rule) {
        createLiteralVisitor = rule.createVisitor;
        createSourceVisitor = rule.createVisitor;
    }
    else {
        createLiteralVisitor = rule.createLiteralVisitor;
        createSourceVisitor = rule.createSourceVisitor;
    }
    rules.push({
        createLiteralVisitor,
        createSourceVisitor,
        visitInvalid: rule.visitInvalid,
        visitUnknown: rule.visitUnknown,
    });
    return visitor;
}
function buildRegexpVisitor(context, rules, programExit) {
    const parser = new regexpp_1.RegExpParser();
    function verify(patternNode, flagsNode, regexpNode, patternSource, flagsString, ownsFlags, createVisitor) {
        const flags = (0, regex_syntax_1.parseFlags)(flagsString || "");
        if (!patternSource) {
            visitUnknownForRules(rules, {
                pattern: null,
                patternSource: null,
                ...buildUnparsableRegExpContextBase({
                    patternSource,
                    patternNode,
                    regexpNode,
                    context,
                    flags,
                    flagsString,
                    flagsNode,
                    ownsFlags,
                }),
            });
            return;
        }
        let parsedPattern;
        try {
            parsedPattern = parser.parsePattern(patternSource.value, 0, patternSource.value.length, flags);
        }
        catch (error) {
            if (error instanceof SyntaxError) {
                visitInvalidForRules(rules, {
                    pattern: patternSource.value,
                    patternSource,
                    error,
                    ...buildUnparsableRegExpContextBase({
                        patternSource,
                        patternNode,
                        regexpNode,
                        context,
                        flags,
                        flagsString,
                        flagsNode,
                        ownsFlags,
                    }),
                });
            }
            return;
        }
        const helpers = buildRegExpContextBase({
            patternSource,
            regexpNode,
            flagsNode,
            context,
            flags,
            parsedPattern,
        });
        (0, regexpp_1.visitRegExpAST)(parsedPattern, createVisitor(helpers));
    }
    const ownedRegExpLiterals = new Set();
    return {
        "Program:exit": programExit,
        Literal(node) {
            if (!(0, utils_1.isRegexpLiteral)(node) || ownedRegExpLiterals.has(node)) {
                return;
            }
            const flagsString = node.regex.flags;
            const patternSource = pattern_source_1.PatternSource.fromRegExpLiteral(context, node);
            verify(node, node, node, patternSource, flagsString, true, (base) => {
                return createLiteralVisitorFromRules(rules, {
                    node,
                    flagsString,
                    ownsFlags: true,
                    regexpNode: node,
                    ...base,
                });
            });
        },
        Program(program) {
            const tracker = new eslint_utils_1.ReferenceTracker(context.sourceCode.getScope(program));
            const regexpDataList = [];
            for (const { node } of tracker.iterateGlobalReferences({
                RegExp: { [eslint_utils_1.CALL]: true, [eslint_utils_1.CONSTRUCT]: true },
            })) {
                const newOrCall = node;
                const args = newOrCall.arguments;
                const [patternArg, flagsArg] = args;
                if (!patternArg || patternArg.type === "SpreadElement") {
                    continue;
                }
                const patternSource = pattern_source_1.PatternSource.fromExpression(context, patternArg);
                patternSource === null || patternSource === void 0 ? void 0 : patternSource.getOwnedRegExpLiterals().forEach((n) => ownedRegExpLiterals.add(n));
                let flagsNode = null;
                let flagsString = null;
                let ownsFlags = false;
                if (flagsArg) {
                    if (flagsArg.type !== "SpreadElement") {
                        flagsNode = (0, utils_1.dereferenceOwnedVariable)(context, flagsArg);
                        flagsString = (0, ast_utils_1.getStringIfConstant)(context, flagsNode);
                        ownsFlags = (0, utils_1.isStringLiteral)(flagsNode);
                    }
                }
                else {
                    if (patternSource && patternSource.regexpValue) {
                        flagsString = patternSource.regexpValue.flags;
                        ownsFlags = Boolean(patternSource.regexpValue.ownedNode);
                        flagsNode = patternSource.regexpValue.ownedNode;
                    }
                    else {
                        flagsString = "";
                        ownsFlags = true;
                    }
                }
                regexpDataList.push({
                    call: newOrCall,
                    patternNode: patternArg,
                    patternSource,
                    flagsNode,
                    flagsString,
                    ownsFlags,
                });
            }
            for (const { call, patternNode, patternSource, flagsNode, flagsString, ownsFlags, } of regexpDataList) {
                verify(patternNode, flagsNode, call, patternSource, flagsString, ownsFlags, (base) => {
                    return createSourceVisitorFromRules(rules, {
                        node: patternNode,
                        flagsString,
                        ownsFlags,
                        regexpNode: call,
                        ...base,
                    });
                });
            }
        },
    };
}
function createLiteralVisitorFromRules(rules, context) {
    const handlers = [];
    for (const rule of rules) {
        if (rule.createLiteralVisitor) {
            handlers.push(rule.createLiteralVisitor(context));
        }
    }
    return composeRegExpVisitors(handlers);
}
function createSourceVisitorFromRules(rules, context) {
    const handlers = [];
    for (const rule of rules) {
        if (rule.createSourceVisitor) {
            handlers.push(rule.createSourceVisitor(context));
        }
    }
    return composeRegExpVisitors(handlers);
}
function visitInvalidForRules(rules, context) {
    var _a;
    for (const rule of rules) {
        (_a = rule.visitInvalid) === null || _a === void 0 ? void 0 : _a.call(rule, context);
    }
}
function visitUnknownForRules(rules, context) {
    var _a;
    for (const rule of rules) {
        (_a = rule.visitUnknown) === null || _a === void 0 ? void 0 : _a.call(rule, context);
    }
}
function composeRegExpVisitors(handlers) {
    const handler = {};
    for (const visitor of handlers) {
        const entries = Object.entries(visitor);
        for (const [key, fn] of entries) {
            const orig = handler[key];
            if (orig) {
                handler[key] = (node) => {
                    orig(node);
                    fn(node);
                };
            }
            else {
                handler[key] = fn;
            }
        }
    }
    return handler;
}
function compositingVisitors(visitor, ...visitors) {
    for (const v of visitors) {
        for (const key in v) {
            const orig = visitor[key];
            if (orig) {
                visitor[key] = (...args) => {
                    orig(...args);
                    v[key](...args);
                };
            }
            else {
                visitor[key] = v[key];
            }
        }
    }
    return visitor;
}
function buildRegExpContextBase({ patternSource, regexpNode, flagsNode, context, flags, parsedPattern, }) {
    const sourceCode = context.sourceCode;
    let cacheUsageOfPattern = null;
    const cacheCapturingGroupReferenceMap = new Map();
    const getAllCapturingGroups = (0, util_1.lazy)(() => (0, regexp_ast_1.extractCaptures)(parsedPattern).groups);
    return {
        getRegexpLocation: (range, offsets) => {
            if (offsets) {
                return patternSource.getAstLocation({
                    start: range.start + offsets[0],
                    end: range.start + offsets[1],
                });
            }
            return patternSource.getAstLocation(range);
        },
        getFlagsLocation: () => (0, ast_utils_1.getFlagsLocation)(sourceCode, regexpNode, flagsNode),
        getFlagLocation: (flag) => (0, ast_utils_1.getFlagLocation)(sourceCode, regexpNode, flagsNode, flag),
        fixReplaceNode: (node, replacement) => {
            return fixReplaceNode(patternSource, node, replacement);
        },
        fixReplaceQuant: (qNode, replacement) => {
            return fixReplaceQuant(patternSource, qNode, replacement);
        },
        fixReplaceFlags: (newFlags, includePattern) => {
            return fixReplaceFlags(patternSource, regexpNode, flagsNode, newFlags, includePattern !== null && includePattern !== void 0 ? includePattern : true);
        },
        getUsageOfPattern: () => (cacheUsageOfPattern !== null && cacheUsageOfPattern !== void 0 ? cacheUsageOfPattern : (cacheUsageOfPattern = (0, get_usage_of_pattern_1.getUsageOfPattern)(regexpNode, context))),
        getCapturingGroupReferences: (options) => {
            var _a;
            const strictTypes = Boolean((_a = options === null || options === void 0 ? void 0 : options.strictTypes) !== null && _a !== void 0 ? _a : true);
            const cacheCapturingGroupReference = cacheCapturingGroupReferenceMap.get(strictTypes);
            if (cacheCapturingGroupReference) {
                return cacheCapturingGroupReference;
            }
            const countOfCapturingGroup = getAllCapturingGroups().length;
            const capturingGroupReferences = [
                ...(0, extract_capturing_group_references_1.extractCapturingGroupReferences)(regexpNode, flags, (0, type_tracker_1.createTypeTracker)(context), countOfCapturingGroup, context, { strictTypes }),
            ];
            cacheCapturingGroupReferenceMap.set(strictTypes, capturingGroupReferences);
            return capturingGroupReferences;
        },
        getAllCapturingGroups,
        pattern: parsedPattern.raw,
        patternAst: parsedPattern,
        patternSource,
        flags: (0, regexp_ast_analysis_1.toCache)(flags),
    };
}
function buildUnparsableRegExpContextBase({ patternSource, patternNode, regexpNode, context, flags: originalFlags, flagsString, flagsNode, ownsFlags, }) {
    const sourceCode = context.sourceCode;
    const flags = (0, regexp_ast_analysis_1.toCache)(originalFlags);
    return {
        regexpNode,
        node: patternNode,
        flags,
        flagsString,
        ownsFlags,
        getFlagsLocation: () => (0, ast_utils_1.getFlagsLocation)(sourceCode, regexpNode, flagsNode),
        getFlagLocation: (flag) => (0, ast_utils_1.getFlagLocation)(sourceCode, regexpNode, flagsNode, flag),
        fixReplaceFlags: (newFlags, includePattern) => {
            return fixReplaceFlags(patternSource, regexpNode, flagsNode, newFlags, includePattern !== null && includePattern !== void 0 ? includePattern : true);
        },
    };
}
function fixReplaceNode(patternSource, regexpNode, replacement) {
    return (fixer) => {
        const range = patternSource.getReplaceRange(regexpNode);
        if (range == null) {
            return null;
        }
        let text;
        if (typeof replacement === "string") {
            text = replacement;
        }
        else {
            text = replacement();
            if (text == null) {
                return null;
            }
        }
        return range.replace(fixer, text);
    };
}
function fixReplaceQuant(patternSource, quantifier, replacement) {
    return (fixer) => {
        let text;
        if (typeof replacement !== "function") {
            text = replacement;
        }
        else {
            text = replacement();
            if (text == null) {
                return null;
            }
        }
        const offset = (0, regexp_ast_1.getQuantifierOffsets)(quantifier);
        if (typeof text !== "string") {
            if (text.greedy !== undefined &&
                text.greedy !== quantifier.greedy) {
                offset[1] += 1;
            }
            text = (0, regexp_ast_1.quantToString)(text);
        }
        const range = patternSource.getReplaceRange({
            start: quantifier.start + offset[0],
            end: quantifier.start + offset[1],
        });
        if (range == null) {
            return null;
        }
        return range.replace(fixer, text);
    };
}
function fixReplaceFlags(patternSource, regexpNode, flagsNode, replacement, includePattern) {
    return (fixer) => {
        let newFlags;
        if (typeof replacement === "string") {
            newFlags = replacement;
        }
        else {
            newFlags = replacement();
            if (newFlags == null) {
                return null;
            }
        }
        if (!/^[a-z]*$/iu.test(newFlags)) {
            return null;
        }
        if (includePattern && (0, utils_1.isRegexpLiteral)(regexpNode)) {
            return fixer.replaceText(regexpNode, `/${regexpNode.regex.pattern}/${newFlags}`);
        }
        let flagsFix;
        if ((0, utils_1.isRegexpLiteral)(regexpNode)) {
            flagsFix = fixer.replaceTextRange((0, ast_utils_1.getFlagsRange)(regexpNode), newFlags);
        }
        else if (flagsNode) {
            const range = (0, ast_utils_1.getFlagsRange)(flagsNode);
            if (range == null) {
                return null;
            }
            flagsFix = fixer.replaceTextRange(range, newFlags);
        }
        else {
            if (regexpNode.arguments.length !== 1) {
                return null;
            }
            const end = regexpNode.range[1];
            flagsFix = fixer.replaceTextRange([end - 1, end], `, "${newFlags}")`);
        }
        if (!includePattern) {
            return flagsFix;
        }
        if (!patternSource) {
            return null;
        }
        const patternRange = patternSource.getReplaceRange({
            start: 0,
            end: patternSource.value.length,
        });
        if (patternRange == null) {
            return null;
        }
        const patternFix = patternRange.replace(fixer, patternSource.value);
        return [patternFix, flagsFix];
    };
}
function mightCreateNewElement(before, after) {
    if (before.endsWith("\\c") && /^[a-z]/iu.test(after)) {
        return true;
    }
    if (/(?:^|[^\\])(?:\\{2})*\\(?:x[\dA-Fa-f]?|u[\dA-Fa-f]{0,3})$/u.test(before) &&
        /^[\da-f]/iu.test(after)) {
        return true;
    }
    if ((/(?:^|[^\\])(?:\\{2})*\\u$/u.test(before) &&
        /^\{[\da-f]*(?:\}[\s\S]*)?$/iu.test(after)) ||
        (/(?:^|[^\\])(?:\\{2})*\\u\{[\da-f]*$/u.test(before) &&
            /^(?:[\da-f]+\}?|\})/iu.test(after))) {
        return true;
    }
    if ((/(?:^|[^\\])(?:\\{2})*\\0[0-7]?$/u.test(before) &&
        /^[0-7]/u.test(after)) ||
        (/(?:^|[^\\])(?:\\{2})*\\[1-7]$/u.test(before) && /^[0-7]/u.test(after))) {
        return true;
    }
    if ((/(?:^|[^\\])(?:\\{2})*\\[1-9]\d*$/u.test(before) &&
        /^\d/u.test(after)) ||
        (/(?:^|[^\\])(?:\\{2})*\\k$/u.test(before) && after.startsWith("<")) ||
        /(?:^|[^\\])(?:\\{2})*\\k<[^<>]*$/u.test(before)) {
        return true;
    }
    if ((/(?:^|[^\\])(?:\\{2})*\\p$/iu.test(before) &&
        /^\{[\w=]*(?:\}[\s\S]*)?$/u.test(after)) ||
        (/(?:^|[^\\])(?:\\{2})*\\p\{[\w=]*$/iu.test(before) &&
            /^[\w=]+(?:\}[\s\S]*)?$|^\}/u.test(after))) {
        return true;
    }
    if ((/(?:^|[^\\])(?:\\{2})*\{\d*$/u.test(before) &&
        /^[\d,}]/u.test(after)) ||
        (/(?:^|[^\\])(?:\\{2})*\{\d+,$/u.test(before) &&
            /^(?:\d+(?:\}|$)|\})/u.test(after)) ||
        (/(?:^|[^\\])(?:\\{2})*\{\d+,\d*$/u.test(before) &&
            after.startsWith("}"))) {
        return true;
    }
    return false;
}
function fixRemoveCharacterClassElement(context, element) {
    const cc = element.parent;
    if (cc.type !== "CharacterClass") {
        throw new Error("Only call this function for character class elements.");
    }
    return context.fixReplaceNode(element, () => {
        const textBefore = cc.raw.slice(0, element.start - cc.start);
        const textAfter = cc.raw.slice(element.end - cc.start);
        if (mightCreateNewElement(textBefore, textAfter)) {
            return null;
        }
        const elements = cc.elements;
        const elementIndex = elements.indexOf(element);
        const elementBefore = cc.elements[elementIndex - 1];
        const elementAfter = cc.elements[elementIndex + 1];
        if (elementBefore &&
            elementAfter &&
            elementBefore.type === "Character" &&
            elementBefore.raw === "-" &&
            elementAfter.type === "Character") {
            return null;
        }
        if ((textAfter.startsWith("-") &&
            elementBefore &&
            elementBefore.type === "Character") ||
            (textAfter.startsWith("^") && !cc.negate && !elementBefore)) {
            return "\\";
        }
        return "";
    });
}
function fixRemoveAlternative(context, alternative) {
    const { parent } = alternative;
    if (parent.alternatives.length === 1) {
        return context.fixReplaceNode(alternative, "[]");
    }
    return context.fixReplaceNode(parent, () => {
        let { start, end } = alternative;
        if (parent.alternatives[0] === alternative) {
            end++;
        }
        else {
            start--;
        }
        const before = parent.raw.slice(0, start - parent.start);
        const after = parent.raw.slice(end - parent.start);
        return before + after;
    });
}
function fixRemoveStringAlternative(context, alternative) {
    const { parent } = alternative;
    if (parent.alternatives.length === 1) {
        return context.fixReplaceNode(parent, "[]");
    }
    return context.fixReplaceNode(parent, () => {
        let { start, end } = alternative;
        if (parent.alternatives[0] === alternative) {
            end++;
        }
        else {
            start--;
        }
        const before = parent.raw.slice(0, start - parent.start);
        const after = parent.raw.slice(end - parent.start);
        return before + after;
    });
}
function canUnwrapped(node, text) {
    let textBefore, textAfter;
    const parent = node.parent;
    if (parent.type === "Alternative") {
        textBefore = parent.raw.slice(0, node.start - parent.start);
        textAfter = parent.raw.slice(node.end - parent.start);
    }
    else if (parent.type === "Quantifier") {
        const alt = parent.parent;
        textBefore = alt.raw.slice(0, node.start - alt.start);
        textAfter = alt.raw.slice(node.end - alt.start);
    }
    else {
        return true;
    }
    return (!mightCreateNewElement(textBefore, text) &&
        !mightCreateNewElement(text, textAfter));
}
