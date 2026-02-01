"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const ast_utils_1 = require("../utils/ast-utils");
const regexp_ast_1 = require("../utils/regexp-ast");
const type_tracker_1 = require("../utils/type-tracker");
class RegExpReference {
    get defineNode() {
        return this.regExpContext.regexpNode;
    }
    constructor(regExpContext) {
        this.readNodes = new Map();
        this.state = {
            usedNodes: new Map(),
            track: true,
        };
        this.regExpContext = regExpContext;
    }
    addReadNode(node) {
        this.readNodes.set(node, {});
    }
    setDefineId(codePathId, loopNode) {
        this.defineId = { codePathId, loopNode };
    }
    markAsUsedInSearch(node) {
        const exprState = this.readNodes.get(node);
        if (exprState) {
            exprState.marked = true;
        }
        this.addUsedNode("search", node);
    }
    markAsUsedInSplit(node) {
        const exprState = this.readNodes.get(node);
        if (exprState) {
            exprState.marked = true;
        }
        this.addUsedNode("split", node);
    }
    markAsUsedInExec(node, codePathId, loopNode) {
        const exprState = this.readNodes.get(node);
        if (exprState) {
            exprState.marked = true;
            exprState.usedInExec = { id: { codePathId, loopNode } };
        }
        this.addUsedNode("exec", node);
    }
    markAsUsedInTest(node, codePathId, loopNode) {
        const exprState = this.readNodes.get(node);
        if (exprState) {
            exprState.marked = true;
            exprState.usedInTest = { id: { codePathId, loopNode } };
        }
        this.addUsedNode("test", node);
    }
    isUsed(kinds) {
        for (const kind of kinds) {
            if (this.state.usedNodes.has(kind)) {
                return true;
            }
        }
        return false;
    }
    isCannotTrack() {
        return !this.state.track;
    }
    markAsUsed(kind, exprNode) {
        this.addUsedNode(kind, exprNode);
    }
    markAsCannotTrack() {
        this.state.track = false;
    }
    getUsedNodes() {
        return this.state.usedNodes;
    }
    addUsedNode(kind, exprNode) {
        const list = this.state.usedNodes.get(kind);
        if (list) {
            list.push(exprNode);
        }
        else {
            this.state.usedNodes.set(kind, [exprNode]);
        }
    }
}
function fixRemoveFlag({ flagsString, fixReplaceFlags }, flag) {
    if (flagsString) {
        return fixReplaceFlags(flagsString.replace(flag, ""));
    }
    return null;
}
function createUselessIgnoreCaseFlagVisitor(context) {
    return (0, utils_1.defineRegexpVisitor)(context, {
        createVisitor(regExpContext) {
            const { flags, regexpNode, ownsFlags, getFlagLocation } = regExpContext;
            if (!flags.ignoreCase || !ownsFlags) {
                return {};
            }
            return {
                onPatternLeave(pattern) {
                    if (!(0, regexp_ast_1.isCaseVariant)(pattern, flags, false)) {
                        context.report({
                            node: regexpNode,
                            loc: getFlagLocation("i"),
                            messageId: "uselessIgnoreCaseFlag",
                            fix: fixRemoveFlag(regExpContext, "i"),
                        });
                    }
                },
            };
        },
    });
}
function createUselessMultilineFlagVisitor(context) {
    return (0, utils_1.defineRegexpVisitor)(context, {
        createVisitor(regExpContext) {
            const { flags, regexpNode, ownsFlags, getFlagLocation } = regExpContext;
            if (!flags.multiline || !ownsFlags) {
                return {};
            }
            let unnecessary = true;
            return {
                onAssertionEnter(node) {
                    if (node.kind === "start" || node.kind === "end") {
                        unnecessary = false;
                    }
                },
                onPatternLeave() {
                    if (unnecessary) {
                        context.report({
                            node: regexpNode,
                            loc: getFlagLocation("m"),
                            messageId: "uselessMultilineFlag",
                            fix: fixRemoveFlag(regExpContext, "m"),
                        });
                    }
                },
            };
        },
    });
}
function createUselessDotAllFlagVisitor(context) {
    return (0, utils_1.defineRegexpVisitor)(context, {
        createVisitor(regExpContext) {
            const { flags, regexpNode, ownsFlags, getFlagLocation } = regExpContext;
            if (!flags.dotAll || !ownsFlags) {
                return {};
            }
            let unnecessary = true;
            return {
                onCharacterSetEnter(node) {
                    if (node.kind === "any") {
                        unnecessary = false;
                    }
                },
                onPatternLeave() {
                    if (unnecessary) {
                        context.report({
                            node: regexpNode,
                            loc: getFlagLocation("s"),
                            messageId: "uselessDotAllFlag",
                            fix: fixRemoveFlag(regExpContext, "s"),
                        });
                    }
                },
            };
        },
    });
}
function createUselessGlobalFlagVisitor(context, strictTypes) {
    function reportUselessGlobalFlag(regExpReference, data) {
        const { getFlagLocation } = regExpReference.regExpContext;
        const node = regExpReference.defineNode;
        context.report({
            node,
            loc: getFlagLocation("g"),
            messageId: data.kind === 0
                ? "uselessGlobalFlagForSplit"
                : data.kind === 1
                    ? "uselessGlobalFlagForSearch"
                    : data.kind === 3
                        ? "uselessGlobalFlagForTest"
                        : data.kind === 2
                            ? "uselessGlobalFlagForExec"
                            : "uselessGlobalFlag",
            fix: data.fixable
                ? fixRemoveFlag(regExpReference.regExpContext, "g")
                : null,
        });
    }
    function getReportData(regExpReference) {
        let countOfUsedInExecOrTest = 0;
        for (const readData of regExpReference.readNodes.values()) {
            if (!readData.marked) {
                return null;
            }
            const usedInExecOrTest = readData.usedInExec || readData.usedInTest;
            if (usedInExecOrTest) {
                if (!regExpReference.defineId) {
                    return null;
                }
                if (regExpReference.defineId.codePathId ===
                    usedInExecOrTest.id.codePathId &&
                    regExpReference.defineId.loopNode ===
                        usedInExecOrTest.id.loopNode) {
                    countOfUsedInExecOrTest++;
                    if (countOfUsedInExecOrTest > 1) {
                        return null;
                    }
                    continue;
                }
                else {
                    return null;
                }
            }
        }
        return buildReportData(regExpReference);
    }
    function buildReportData(regExpReference) {
        const usedNodes = regExpReference.getUsedNodes();
        if (usedNodes.size === 1) {
            const [[method, nodes]] = usedNodes;
            const fixable = nodes.length === 1 && nodes.includes(regExpReference.defineNode);
            if (method === "split") {
                return {
                    kind: 0,
                    fixable,
                };
            }
            if (method === "search") {
                return { kind: 1, fixable };
            }
            if (method === "exec" && nodes.length === 1)
                return { kind: 2, fixable };
            if (method === "test" && nodes.length === 1)
                return { kind: 3, fixable };
        }
        return { kind: 4 };
    }
    return createRegExpReferenceExtractVisitor(context, {
        flag: "global",
        exit(regExpReferenceList) {
            for (const regExpReference of regExpReferenceList) {
                const report = getReportData(regExpReference);
                if (report != null) {
                    reportUselessGlobalFlag(regExpReference, report);
                }
            }
        },
        isUsedShortCircuit(regExpReference) {
            return regExpReference.isUsed([
                "match",
                "matchAll",
                "replace",
                "replaceAll",
            ]);
        },
        strictTypes,
    });
}
function createUselessStickyFlagVisitor(context, strictTypes) {
    function reportUselessStickyFlag(regExpReference, data) {
        const { getFlagLocation } = regExpReference.regExpContext;
        const node = regExpReference.defineNode;
        context.report({
            node,
            loc: getFlagLocation("y"),
            messageId: "uselessStickyFlag",
            fix: data.fixable
                ? fixRemoveFlag(regExpReference.regExpContext, "y")
                : null,
        });
    }
    function getReportData(regExpReference) {
        for (const readData of regExpReference.readNodes.values()) {
            if (!readData.marked) {
                return null;
            }
        }
        return buildReportData(regExpReference);
    }
    function buildReportData(regExpReference) {
        const usedNodes = regExpReference.getUsedNodes();
        if (usedNodes.size === 1) {
            const [[method, nodes]] = usedNodes;
            const fixable = nodes.length === 1 && nodes.includes(regExpReference.defineNode);
            if (method === "split") {
                return {
                    fixable,
                };
            }
        }
        return {};
    }
    return createRegExpReferenceExtractVisitor(context, {
        flag: "sticky",
        exit(regExpReferenceList) {
            for (const regExpReference of regExpReferenceList) {
                const report = getReportData(regExpReference);
                if (report != null) {
                    reportUselessStickyFlag(regExpReference, report);
                }
            }
        },
        isUsedShortCircuit(regExpReference) {
            return regExpReference.isUsed([
                "search",
                "exec",
                "test",
                "match",
                "matchAll",
                "replace",
                "replaceAll",
            ]);
        },
        strictTypes,
    });
}
function createRegExpReferenceExtractVisitor(context, { flag, exit, isUsedShortCircuit, strictTypes, }) {
    const typeTracer = (0, type_tracker_1.createTypeTracker)(context);
    let stack = null;
    const regExpReferenceMap = new Map();
    const regExpReferenceList = [];
    function verifyForSearchOrSplit(node, kind) {
        const regExpReference = regExpReferenceMap.get(node.arguments[0]);
        if (regExpReference == null || isUsedShortCircuit(regExpReference)) {
            return;
        }
        if (strictTypes
            ? !typeTracer.isString(node.callee.object)
            : !typeTracer.maybeString(node.callee.object)) {
            regExpReference.markAsCannotTrack();
            return;
        }
        if (kind === "search") {
            regExpReference.markAsUsedInSearch(node.arguments[0]);
        }
        else {
            regExpReference.markAsUsedInSplit(node.arguments[0]);
        }
    }
    function verifyForExecOrTest(node, kind) {
        const regExpReference = regExpReferenceMap.get(node.callee.object);
        if (regExpReference == null || isUsedShortCircuit(regExpReference)) {
            return;
        }
        if (kind === "exec") {
            regExpReference.markAsUsedInExec(node.callee.object, stack.codePathId, stack.loopStack[0]);
        }
        else {
            regExpReference.markAsUsedInTest(node.callee.object, stack.codePathId, stack.loopStack[0]);
        }
    }
    return (0, utils_1.compositingVisitors)((0, utils_1.defineRegexpVisitor)(context, {
        createVisitor(regExpContext) {
            const { flags, regexpNode } = regExpContext;
            if (flags[flag]) {
                const regExpReference = new RegExpReference(regExpContext);
                regExpReferenceList.push(regExpReference);
                regExpReferenceMap.set(regexpNode, regExpReference);
                for (const ref of (0, ast_utils_1.extractExpressionReferences)(regexpNode, context)) {
                    if (ref.type === "argument" || ref.type === "member") {
                        regExpReferenceMap.set(ref.node, regExpReference);
                        regExpReference.addReadNode(ref.node);
                    }
                    else {
                        regExpReference.markAsCannotTrack();
                    }
                }
            }
            return {};
        },
    }), {
        "Program:exit"() {
            exit(regExpReferenceList.filter((regExpReference) => {
                if (!regExpReference.readNodes.size) {
                    return false;
                }
                if (regExpReference.isCannotTrack()) {
                    return false;
                }
                if (isUsedShortCircuit(regExpReference)) {
                    return false;
                }
                return true;
            }));
        },
        onCodePathStart(codePath) {
            stack = {
                codePathId: codePath.id,
                upper: stack,
                loopStack: [],
            };
        },
        onCodePathEnd() {
            var _a;
            stack = (_a = stack === null || stack === void 0 ? void 0 : stack.upper) !== null && _a !== void 0 ? _a : null;
        },
        ["WhileStatement, DoWhileStatement, ForStatement, ForInStatement, ForOfStatement, " +
            ":matches(WhileStatement, DoWhileStatement, ForStatement, ForInStatement, ForOfStatement) > :statement"](node) {
            stack === null || stack === void 0 ? void 0 : stack.loopStack.unshift(node);
        },
        ["WhileStatement, DoWhileStatement, ForStatement, ForInStatement, ForOfStatement, " +
            ":matches(WhileStatement, DoWhileStatement, ForStatement, ForInStatement, ForOfStatement) > :statement" +
            ":exit"]() {
            stack === null || stack === void 0 ? void 0 : stack.loopStack.shift();
        },
        "Literal, NewExpression, CallExpression:exit"(node) {
            if (!stack) {
                return;
            }
            const regExpReference = regExpReferenceMap.get(node);
            if (!regExpReference || regExpReference.defineNode !== node) {
                return;
            }
            regExpReference.setDefineId(stack.codePathId, stack.loopStack[0]);
        },
        "CallExpression:exit"(node) {
            if (!stack) {
                return;
            }
            if (!(0, ast_utils_1.isKnownMethodCall)(node, {
                search: 1,
                split: 1,
                test: 1,
                exec: 1,
                match: 1,
                matchAll: 1,
                replace: 2,
                replaceAll: 2,
            })) {
                return;
            }
            if (node.callee.property.name === "search" ||
                node.callee.property.name === "split") {
                verifyForSearchOrSplit(node, node.callee.property.name);
            }
            else if (node.callee.property.name === "test" ||
                node.callee.property.name === "exec") {
                verifyForExecOrTest(node, node.callee.property.name);
            }
            else if (node.callee.property.name === "match" ||
                node.callee.property.name === "matchAll" ||
                node.callee.property.name === "replace" ||
                node.callee.property.name === "replaceAll") {
                const regExpReference = regExpReferenceMap.get(node.arguments[0]);
                regExpReference === null || regExpReference === void 0 ? void 0 : regExpReference.markAsUsed(node.callee.property.name, node.arguments[0]);
            }
        },
    });
}
function createOwnedRegExpFlagsVisitor(context) {
    const sourceCode = context.sourceCode;
    function removeFlags(node) {
        const newFlags = node.regex.flags.replace(/[^u]+/gu, "");
        if (newFlags === node.regex.flags) {
            return;
        }
        context.report({
            node,
            loc: (0, ast_utils_1.getFlagsLocation)(sourceCode, node, node),
            messageId: "uselessFlagsOwned",
            fix(fixer) {
                const range = (0, ast_utils_1.getFlagsRange)(node);
                return fixer.replaceTextRange(range, newFlags);
            },
        });
    }
    return (0, utils_1.defineRegexpVisitor)(context, {
        createSourceVisitor(regExpContext) {
            var _a;
            const { patternSource, regexpNode } = regExpContext;
            if (patternSource.isStringValue()) {
                patternSource.getOwnedRegExpLiterals().forEach(removeFlags);
            }
            else {
                if (regexpNode.arguments.length >= 2) {
                    const ownedNode = (_a = patternSource.regexpValue) === null || _a === void 0 ? void 0 : _a.ownedNode;
                    if (ownedNode) {
                        removeFlags(ownedNode);
                    }
                }
            }
            return {};
        },
    });
}
function parseOption(userOption) {
    var _a;
    const ignore = new Set();
    let strictTypes = true;
    if (userOption) {
        for (const i of (_a = userOption.ignore) !== null && _a !== void 0 ? _a : []) {
            ignore.add(i);
        }
        if (userOption.strictTypes != null) {
            strictTypes = userOption.strictTypes;
        }
    }
    return {
        ignore,
        strictTypes,
    };
}
exports.default = (0, utils_1.createRule)("no-useless-flag", {
    meta: {
        docs: {
            description: "disallow unnecessary regex flags",
            category: "Best Practices",
            recommended: true,
            default: "warn",
        },
        fixable: "code",
        schema: [
            {
                type: "object",
                properties: {
                    ignore: {
                        type: "array",
                        items: {
                            enum: ["i", "m", "s", "g", "y"],
                        },
                        uniqueItems: true,
                    },
                    strictTypes: { type: "boolean" },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            uselessIgnoreCaseFlag: "The 'i' flag is unnecessary because the pattern only contains case-invariant characters.",
            uselessMultilineFlag: "The 'm' flag is unnecessary because the pattern does not contain start (^) or end ($) assertions.",
            uselessDotAllFlag: "The 's' flag is unnecessary because the pattern does not contain dots (.).",
            uselessGlobalFlag: "The 'g' flag is unnecessary because the regex does not use global search.",
            uselessGlobalFlagForTest: "The 'g' flag is unnecessary because the regex is used only once in 'RegExp.prototype.test'.",
            uselessGlobalFlagForExec: "The 'g' flag is unnecessary because the regex is used only once in 'RegExp.prototype.exec'.",
            uselessGlobalFlagForSplit: "The 'g' flag is unnecessary because 'String.prototype.split' ignores the 'g' flag.",
            uselessGlobalFlagForSearch: "The 'g' flag is unnecessary because 'String.prototype.search' ignores the 'g' flag.",
            uselessStickyFlag: "The 'y' flag is unnecessary because 'String.prototype.split' ignores the 'y' flag.",
            uselessFlagsOwned: "The flags of this RegExp literal are useless because only the source of the regex is used.",
        },
        type: "suggestion",
    },
    create(context) {
        const { ignore, strictTypes } = parseOption(context.options[0]);
        let visitor = {};
        if (!ignore.has("i")) {
            visitor = (0, utils_1.compositingVisitors)(visitor, createUselessIgnoreCaseFlagVisitor(context));
        }
        if (!ignore.has("m")) {
            visitor = (0, utils_1.compositingVisitors)(visitor, createUselessMultilineFlagVisitor(context));
        }
        if (!ignore.has("s")) {
            visitor = (0, utils_1.compositingVisitors)(visitor, createUselessDotAllFlagVisitor(context));
        }
        if (!ignore.has("g")) {
            visitor = (0, utils_1.compositingVisitors)(visitor, createUselessGlobalFlagVisitor(context, strictTypes));
        }
        if (!ignore.has("y")) {
            visitor = (0, utils_1.compositingVisitors)(visitor, createUselessStickyFlagVisitor(context, strictTypes));
        }
        visitor = (0, utils_1.compositingVisitors)(visitor, createOwnedRegExpFlagsVisitor(context));
        return visitor;
    },
});
