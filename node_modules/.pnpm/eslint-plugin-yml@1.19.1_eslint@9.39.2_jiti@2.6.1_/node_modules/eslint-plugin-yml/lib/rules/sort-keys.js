"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const natural_compare_1 = __importDefault(require("natural-compare"));
const index_1 = require("../utils/index");
const ast_utils_1 = require("../utils/ast-utils");
const compat_1 = require("../utils/compat");
const calc_shortest_edit_script_1 = require("../utils/calc-shortest-edit-script");
function isNewLine(char) {
    return (char === "\n" || char === "\r" || char === "\u2028" || char === "\u2029");
}
function getPropertyName(node, sourceCode) {
    const prop = node.key;
    if (prop == null) {
        return "";
    }
    const target = prop.type === "YAMLWithMeta" ? prop.value : prop;
    if (target == null) {
        return "";
    }
    if (target.type === "YAMLScalar" && typeof target.value === "string") {
        return target.value;
    }
    return sourceCode.text.slice(...target.range);
}
class YAMLPairData {
    get reportLoc() {
        var _a, _b;
        return (_b = (_a = this.node.key) === null || _a === void 0 ? void 0 : _a.loc) !== null && _b !== void 0 ? _b : this.node.loc;
    }
    constructor(mapping, node, index, anchorAlias) {
        this.cachedName = null;
        this.mapping = mapping;
        this.node = node;
        this.index = index;
        this.anchorAlias = anchorAlias;
    }
    get name() {
        var _a;
        return ((_a = this.cachedName) !== null && _a !== void 0 ? _a : (this.cachedName = getPropertyName(this.node, this.mapping.sourceCode)));
    }
    getPrev() {
        const prevIndex = this.index - 1;
        return prevIndex >= 0 ? this.mapping.pairs[prevIndex] : null;
    }
}
class YAMLMappingData {
    constructor(node, sourceCode, anchorAliasMap) {
        this.cachedProperties = null;
        this.node = node;
        this.sourceCode = sourceCode;
        this.anchorAliasMap = anchorAliasMap;
    }
    get pairs() {
        var _a;
        return ((_a = this.cachedProperties) !== null && _a !== void 0 ? _a : (this.cachedProperties = this.node.pairs.map((e, index) => new YAMLPairData(this, e, index, this.anchorAliasMap.get(e)))));
    }
    getPath(sourceCode) {
        let path = "";
        let curr = this.node;
        let p = curr.parent;
        while (p) {
            if (p.type === "YAMLPair") {
                const name = getPropertyName(p, sourceCode);
                if (/^[$a-z_][\w$]*$/iu.test(name)) {
                    path = `.${name}${path}`;
                }
                else {
                    path = `[${JSON.stringify(name)}]${path}`;
                }
            }
            else if (p.type === "YAMLSequence") {
                const index = p.entries.indexOf(curr);
                path = `[${index}]${path}`;
            }
            curr = p;
            p = curr.parent;
        }
        if (path.startsWith(".")) {
            path = path.slice(1);
        }
        return path;
    }
}
function isCompatibleWithESLintOptions(options) {
    if (options.length === 0) {
        return true;
    }
    if (typeof options[0] === "string" || options[0] == null) {
        return true;
    }
    return false;
}
function buildValidatorFromType(order, insensitive, natural) {
    let compare = natural
        ? ([a, b]) => (0, natural_compare_1.default)(a, b) <= 0
        : ([a, b]) => a <= b;
    if (insensitive) {
        const baseCompare = compare;
        compare = ([a, b]) => baseCompare([a.toLowerCase(), b.toLowerCase()]);
    }
    if (order === "desc") {
        const baseCompare = compare;
        compare = (args) => baseCompare(args.reverse());
    }
    return (a, b) => compare([a.name, b.name]);
}
function parseOptions(options, sourceCode) {
    var _a, _b, _c;
    if (isCompatibleWithESLintOptions(options)) {
        const type = (_a = options[0]) !== null && _a !== void 0 ? _a : "asc";
        const obj = (_b = options[1]) !== null && _b !== void 0 ? _b : {};
        const insensitive = obj.caseSensitive === false;
        const natural = Boolean(obj.natural);
        const minKeys = (_c = obj.minKeys) !== null && _c !== void 0 ? _c : 2;
        const allowLineSeparatedGroups = obj.allowLineSeparatedGroups || false;
        return [
            {
                isTargetMapping: (data) => data.node.pairs.length >= minKeys,
                ignore: () => false,
                isValidOrder: buildValidatorFromType(type, insensitive, natural),
                orderText: `${natural ? "natural " : ""}${insensitive ? "insensitive " : ""}${type}ending`,
                allowLineSeparatedGroups,
            },
        ];
    }
    return options.map((opt) => {
        var _a, _b, _c, _d, _e;
        const order = opt.order;
        const pathPattern = new RegExp(opt.pathPattern);
        const hasProperties = (_a = opt.hasProperties) !== null && _a !== void 0 ? _a : [];
        const minKeys = (_b = opt.minKeys) !== null && _b !== void 0 ? _b : 2;
        const allowLineSeparatedGroups = opt.allowLineSeparatedGroups || false;
        if (!Array.isArray(order)) {
            const type = (_c = order.type) !== null && _c !== void 0 ? _c : "asc";
            const insensitive = order.caseSensitive === false;
            const natural = Boolean(order.natural);
            return {
                isTargetMapping,
                ignore: () => false,
                isValidOrder: buildValidatorFromType(type, insensitive, natural),
                orderText: `${natural ? "natural " : ""}${insensitive ? "insensitive " : ""}${type}ending`,
                allowLineSeparatedGroups,
            };
        }
        const parsedOrder = [];
        for (const o of order) {
            if (typeof o === "string") {
                parsedOrder.push({
                    test: (data) => data.name === o,
                    isValidNestOrder: () => true,
                });
            }
            else {
                const keyPattern = o.keyPattern ? new RegExp(o.keyPattern) : null;
                const nestOrder = (_d = o.order) !== null && _d !== void 0 ? _d : {};
                const type = (_e = nestOrder.type) !== null && _e !== void 0 ? _e : "asc";
                const insensitive = nestOrder.caseSensitive === false;
                const natural = Boolean(nestOrder.natural);
                parsedOrder.push({
                    test: (data) => (keyPattern ? keyPattern.test(data.name) : true),
                    isValidNestOrder: buildValidatorFromType(type, insensitive, natural),
                });
            }
        }
        return {
            isTargetMapping,
            ignore: (data) => parsedOrder.every((p) => !p.test(data)),
            isValidOrder(a, b) {
                for (const p of parsedOrder) {
                    const matchA = p.test(a);
                    const matchB = p.test(b);
                    if (!matchA || !matchB) {
                        if (matchA) {
                            return true;
                        }
                        if (matchB) {
                            return false;
                        }
                        continue;
                    }
                    return p.isValidNestOrder(a, b);
                }
                return false;
            },
            orderText: "specified",
            allowLineSeparatedGroups,
        };
        function isTargetMapping(data) {
            if (data.node.pairs.length < minKeys) {
                return false;
            }
            if (hasProperties.length > 0) {
                const names = new Set(data.pairs.map((p) => p.name));
                if (!hasProperties.every((name) => names.has(name))) {
                    return false;
                }
            }
            return pathPattern.test(data.getPath(sourceCode));
        }
    });
}
const ALLOW_ORDER_TYPES = ["asc", "desc"];
const ORDER_OBJECT_SCHEMA = {
    type: "object",
    properties: {
        type: {
            enum: ALLOW_ORDER_TYPES,
        },
        caseSensitive: {
            type: "boolean",
        },
        natural: {
            type: "boolean",
        },
    },
    additionalProperties: false,
};
exports.default = (0, index_1.createRule)("sort-keys", {
    meta: {
        docs: {
            description: "require mapping keys to be sorted",
            categories: null,
            extensionRule: false,
            layout: false,
        },
        fixable: "code",
        schema: {
            oneOf: [
                {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            pathPattern: { type: "string" },
                            hasProperties: {
                                type: "array",
                                items: { type: "string" },
                            },
                            order: {
                                oneOf: [
                                    {
                                        type: "array",
                                        items: {
                                            anyOf: [
                                                { type: "string" },
                                                {
                                                    type: "object",
                                                    properties: {
                                                        keyPattern: {
                                                            type: "string",
                                                        },
                                                        order: ORDER_OBJECT_SCHEMA,
                                                    },
                                                    additionalProperties: false,
                                                },
                                            ],
                                        },
                                        uniqueItems: true,
                                    },
                                    ORDER_OBJECT_SCHEMA,
                                ],
                            },
                            minKeys: {
                                type: "integer",
                                minimum: 2,
                            },
                            allowLineSeparatedGroups: {
                                type: "boolean",
                            },
                        },
                        required: ["pathPattern", "order"],
                        additionalProperties: false,
                    },
                    minItems: 1,
                },
                {
                    type: "array",
                    items: [
                        {
                            enum: ALLOW_ORDER_TYPES,
                        },
                        {
                            type: "object",
                            properties: {
                                caseSensitive: {
                                    type: "boolean",
                                },
                                natural: {
                                    type: "boolean",
                                },
                                minKeys: {
                                    type: "integer",
                                    minimum: 2,
                                },
                                allowLineSeparatedGroups: {
                                    type: "boolean",
                                },
                            },
                            additionalProperties: false,
                        },
                    ],
                    additionalItems: false,
                },
            ],
        },
        messages: {
            shouldBeBefore: "Expected mapping keys to be in {{orderText}} order. '{{thisName}}' should be before '{{targetName}}'.",
            shouldBeAfter: "Expected mapping keys to be in {{orderText}} order. '{{thisName}}' should be after '{{targetName}}'.",
        },
        type: "suggestion",
    },
    create(context) {
        var _a;
        const sourceCode = (0, compat_1.getSourceCode)(context);
        if (!((_a = sourceCode.parserServices) === null || _a === void 0 ? void 0 : _a.isYAML)) {
            return {};
        }
        const parsedOptions = parseOptions(context.options, sourceCode);
        function shouldKeepOrder(prevData, nextData) {
            if ((prevData.anchorAlias.aliases.size === 0 &&
                prevData.anchorAlias.anchors.size === 0) ||
                (nextData.anchorAlias.aliases.size === 0 &&
                    nextData.anchorAlias.anchors.size === 0))
                return false;
            for (const aliasName of nextData.anchorAlias.aliases) {
                if (prevData.anchorAlias.anchors.has(aliasName)) {
                    return true;
                }
            }
            for (const anchorName of nextData.anchorAlias.anchors) {
                if (prevData.anchorAlias.aliases.has(anchorName)) {
                    return true;
                }
            }
            return false;
        }
        function ignore(data, option) {
            if (!data.node.key && !data.node.value) {
                return true;
            }
            return option.ignore(data);
        }
        function groupingPairs(pairs, option) {
            const groups = [];
            let group = [];
            let prev = null;
            for (const pair of pairs) {
                if (ignore(pair, option)) {
                    prev = pair;
                    continue;
                }
                if (prev &&
                    option.allowLineSeparatedGroups &&
                    hasBlankLine(prev, pair)) {
                    if (group.length > 0) {
                        groups.push(group);
                        group = [];
                    }
                }
                group.push(pair);
                prev = pair;
            }
            if (group.length > 0) {
                groups.push(group);
            }
            return groups;
        }
        function bubbleSort(pairs, option) {
            const l = pairs.length;
            const result = [...pairs];
            let swapped;
            do {
                swapped = false;
                for (let nextIndex = 1; nextIndex < l; nextIndex++) {
                    const prevIndex = nextIndex - 1;
                    if (option.isValidOrder(result[prevIndex], result[nextIndex]) ||
                        shouldKeepOrder(result[prevIndex], result[nextIndex]))
                        continue;
                    [result[prevIndex], result[nextIndex]] = [
                        result[nextIndex],
                        result[prevIndex],
                    ];
                    swapped = true;
                }
            } while (swapped);
            return result;
        }
        function verifyPairs(pairs, option) {
            const sorted = bubbleSort(pairs, option);
            const editScript = (0, calc_shortest_edit_script_1.calcShortestEditScript)(pairs, sorted);
            for (let index = 0; index < editScript.length; index++) {
                const edit = editScript[index];
                if (edit.type !== "delete")
                    continue;
                const insertEditIndex = editScript.findIndex((e) => e.type === "insert" && e.b === edit.a);
                if (insertEditIndex === -1) {
                    continue;
                }
                if (index < insertEditIndex) {
                    const target = findInsertAfterTarget(edit.a, insertEditIndex);
                    if (!target) {
                        continue;
                    }
                    context.report({
                        loc: edit.a.reportLoc,
                        messageId: "shouldBeAfter",
                        data: {
                            thisName: edit.a.name,
                            targetName: target.name,
                            orderText: option.orderText,
                        },
                        *fix(fixer) {
                            if (edit.a.mapping.node.style === "flow") {
                                yield* fixToMoveDownForFlow(fixer, edit.a, target);
                            }
                            else {
                                yield* fixToMoveDownForBlock(fixer, edit.a, target);
                            }
                        },
                    });
                }
                else {
                    const target = findInsertBeforeTarget(edit.a, insertEditIndex);
                    if (!target) {
                        continue;
                    }
                    context.report({
                        loc: edit.a.reportLoc,
                        messageId: "shouldBeBefore",
                        data: {
                            thisName: edit.a.name,
                            targetName: target.name,
                            orderText: option.orderText,
                        },
                        *fix(fixer) {
                            if (edit.a.mapping.node.style === "flow") {
                                yield* fixToMoveUpForFlow(fixer, edit.a, target);
                            }
                            else {
                                yield* fixToMoveUpForBlock(fixer, edit.a, target);
                            }
                        },
                    });
                }
            }
            function findInsertAfterTarget(pair, insertEditIndex) {
                let candidate = null;
                for (let index = insertEditIndex - 1; index >= 0; index--) {
                    const edit = editScript[index];
                    if (edit.type === "delete" && edit.a === pair)
                        break;
                    if (edit.type !== "common")
                        continue;
                    candidate = edit.a;
                    break;
                }
                const pairIndex = pairs.indexOf(pair);
                if (candidate) {
                    for (let index = pairIndex + 1; index < pairs.length; index++) {
                        const element = pairs[index];
                        if (element === candidate)
                            return candidate;
                        if (shouldKeepOrder(pair, element)) {
                            break;
                        }
                    }
                }
                let lastTarget = null;
                for (let index = pairIndex + 1; index < pairs.length; index++) {
                    const element = pairs[index];
                    if (option.isValidOrder(element, pair) &&
                        !shouldKeepOrder(pair, element)) {
                        lastTarget = element;
                        continue;
                    }
                    return lastTarget;
                }
                return lastTarget;
            }
            function findInsertBeforeTarget(pair, insertEditIndex) {
                let candidate = null;
                for (let index = insertEditIndex + 1; index < editScript.length; index++) {
                    const edit = editScript[index];
                    if (edit.type === "delete" && edit.a === pair)
                        break;
                    if (edit.type !== "common")
                        continue;
                    candidate = edit.a;
                    break;
                }
                const pairIndex = pairs.indexOf(pair);
                if (candidate) {
                    for (let index = pairIndex - 1; index >= 0; index--) {
                        const element = pairs[index];
                        if (element === candidate)
                            return candidate;
                        if (shouldKeepOrder(element, pair)) {
                            break;
                        }
                    }
                }
                let lastTarget = null;
                for (let index = pairIndex - 1; index >= 0; index--) {
                    const element = pairs[index];
                    if (option.isValidOrder(pair, element) &&
                        !shouldKeepOrder(element, pair)) {
                        lastTarget = element;
                        continue;
                    }
                    return lastTarget;
                }
                return lastTarget;
            }
        }
        function hasBlankLine(prev, next) {
            const tokenOrNodes = [
                ...sourceCode.getTokensBetween(prev.node, next.node, {
                    includeComments: true,
                }),
                next.node,
            ];
            let prevLoc = prev.node.loc;
            for (const t of tokenOrNodes) {
                const loc = t.loc;
                if (loc.start.line - prevLoc.end.line > 1) {
                    return true;
                }
                prevLoc = loc;
            }
            return false;
        }
        let pairStack = {
            upper: null,
            anchors: new Set(),
            aliases: new Set(),
        };
        const anchorAliasMap = new Map();
        return {
            YAMLPair() {
                pairStack = {
                    upper: pairStack,
                    anchors: new Set(),
                    aliases: new Set(),
                };
            },
            YAMLAnchor(node) {
                if (pairStack) {
                    pairStack.anchors.add(node.name);
                }
            },
            YAMLAlias(node) {
                if (pairStack) {
                    pairStack.aliases.add(node.name);
                }
            },
            "YAMLPair:exit"(node) {
                anchorAliasMap.set(node, pairStack);
                const { anchors, aliases } = pairStack;
                pairStack = pairStack.upper;
                pairStack.anchors = new Set([...pairStack.anchors, ...anchors]);
                pairStack.aliases = new Set([...pairStack.aliases, ...aliases]);
            },
            "YAMLMapping:exit"(node) {
                const data = new YAMLMappingData(node, sourceCode, anchorAliasMap);
                const option = parsedOptions.find((o) => o.isTargetMapping(data));
                if (!option) {
                    return;
                }
                for (const pairs of groupingPairs(data.pairs, option)) {
                    verifyPairs(pairs, option);
                }
            },
        };
        function* fixToMoveDownForFlow(fixer, data, moveTarget) {
            const beforeToken = sourceCode.getTokenBefore(data.node);
            let insertCode, removeRange, insertTargetToken;
            const afterCommaToken = sourceCode.getTokenAfter(data.node);
            if ((0, ast_utils_1.isComma)(afterCommaToken)) {
                removeRange = [beforeToken.range[1], afterCommaToken.range[1]];
                const moveTargetAfterToken = sourceCode.getTokenAfter(moveTarget.node);
                if ((0, ast_utils_1.isComma)(moveTargetAfterToken)) {
                    insertTargetToken = moveTargetAfterToken;
                    insertCode = sourceCode.text.slice(...removeRange);
                }
                else {
                    insertTargetToken = sourceCode.getLastToken(moveTarget.node);
                    insertCode = sourceCode.text.slice(beforeToken.range[1], afterCommaToken.range[0]);
                    insertCode = `,${insertCode}`;
                }
            }
            else {
                if ((0, ast_utils_1.isComma)(beforeToken)) {
                    removeRange = [beforeToken.range[0], data.node.range[1]];
                    insertCode = sourceCode.text.slice(...removeRange);
                    insertTargetToken = sourceCode.getLastToken(moveTarget.node);
                }
                else {
                    removeRange = [beforeToken.range[1], data.node.range[1]];
                    insertCode = `,${sourceCode.text.slice(...removeRange)}`;
                    insertTargetToken = sourceCode.getLastToken(moveTarget.node);
                }
            }
            yield fixer.removeRange(removeRange);
            yield fixer.insertTextAfterRange(insertTargetToken.range, insertCode);
        }
        function* fixToMoveUpForFlow(fixer, data, moveTarget) {
            const beforeCommaToken = sourceCode.getTokenBefore(data.node);
            let insertCode, removeRange, insertTargetToken;
            const afterCommaToken = sourceCode.getTokenAfter(data.node);
            const moveTargetBeforeToken = sourceCode.getTokenBefore(moveTarget.node);
            if ((0, ast_utils_1.isComma)(afterCommaToken)) {
                removeRange = [beforeCommaToken.range[1], afterCommaToken.range[1]];
                insertCode = sourceCode.text.slice(...removeRange);
                insertTargetToken = moveTargetBeforeToken;
            }
            else {
                removeRange = [beforeCommaToken.range[0], data.node.range[1]];
                if ((0, ast_utils_1.isComma)(moveTargetBeforeToken)) {
                    insertCode = sourceCode.text.slice(...removeRange);
                    insertTargetToken = sourceCode.getTokenBefore(moveTargetBeforeToken);
                }
                else {
                    insertCode = `${sourceCode.text.slice(beforeCommaToken.range[1], data.node.range[1])},`;
                    insertTargetToken = moveTargetBeforeToken;
                }
            }
            yield fixer.insertTextAfterRange(insertTargetToken.range, insertCode);
            yield fixer.removeRange(removeRange);
        }
        function* fixToMoveDownForBlock(fixer, data, moveTarget) {
            const nodeLocs = getPairRangeForBlock(data.node);
            const moveTargetLocs = getPairRangeForBlock(moveTarget.node);
            if (nodeLocs.loc.start.column === 0) {
                const removeRange = [
                    getNewlineStartIndex(nodeLocs.range[0]),
                    nodeLocs.range[1],
                ];
                const moveTargetRange = [
                    getNewlineStartIndex(moveTargetLocs.range[0]),
                    moveTargetLocs.range[1],
                ];
                const insertCode = sourceCode.text.slice(...removeRange);
                const isAtFileStart = nodeLocs.loc.start.line === 1;
                if (isAtFileStart) {
                    const removeRangeEnd = nodeLocs.range[1];
                    const len = sourceCode.text.length;
                    if (removeRangeEnd < len) {
                        const ch = sourceCode.text[removeRangeEnd];
                        if (isNewLine(ch)) {
                            if (ch === "\r" &&
                                removeRangeEnd + 1 < len &&
                                sourceCode.text[removeRangeEnd + 1] === "\n") {
                                removeRange[1] += 2;
                            }
                            else {
                                removeRange[1] += 1;
                            }
                        }
                    }
                }
                yield fixer.removeRange(removeRange);
                yield fixer.insertTextAfterRange(moveTargetRange, `${isAtFileStart ? "\n" : ""}${insertCode}`);
            }
            else {
                const nextToken = sourceCode.getTokenAfter(data.node, {
                    includeComments: true,
                });
                const removeRange = [data.node.range[0], nextToken.range[0]];
                yield fixer.removeRange(removeRange);
                const indentCode = sourceCode.text
                    .slice(sourceCode.getIndexFromLoc({
                    line: nodeLocs.loc.start.line,
                    column: 0,
                }), data.node.range[0])
                    .replace(/\S/g, " ");
                const insertCode = `\n${indentCode}${sourceCode.text.slice(data.node.range[0], nodeLocs.range[1])}`;
                yield fixer.insertTextAfterRange(moveTargetLocs.range, insertCode);
            }
        }
        function* fixToMoveUpForBlock(fixer, data, moveTarget) {
            const nodeLocs = getPairRangeForBlock(data.node);
            const moveTargetLocs = getPairRangeForBlock(moveTarget.node);
            if (moveTargetLocs.loc.start.column === 0) {
                const removeRange = [
                    getNewlineStartIndex(nodeLocs.range[0]),
                    nodeLocs.range[1],
                ];
                const moveTargetRange = [
                    getNewlineStartIndex(moveTargetLocs.range[0]),
                    moveTargetLocs.range[1],
                ];
                const insertCode = sourceCode.text.slice(...removeRange);
                yield fixer.insertTextBeforeRange(moveTargetRange, `${insertCode}${moveTargetLocs.loc.start.line === 1 ? "\n" : ""}`);
                yield fixer.removeRange(removeRange);
            }
            else {
                const diffIndent = nodeLocs.indentColumn - moveTargetLocs.indentColumn;
                const insertCode = `${sourceCode.text.slice(nodeLocs.range[0] + diffIndent, nodeLocs.range[1])}\n${sourceCode.text.slice(nodeLocs.range[0], nodeLocs.range[0] + diffIndent)}`;
                yield fixer.insertTextBeforeRange(moveTargetLocs.range, insertCode);
                const removeRange = [
                    getNewlineStartIndex(nodeLocs.range[0]),
                    nodeLocs.range[1],
                ];
                yield fixer.removeRange(removeRange);
            }
        }
        function getNewlineStartIndex(nextIndex) {
            for (let index = nextIndex; index >= 0; index--) {
                const char = sourceCode.text[index];
                if (isNewLine(sourceCode.text[index])) {
                    const prev = sourceCode.text[index - 1];
                    if (prev === "\r" && char === "\n") {
                        return index - 1;
                    }
                    return index;
                }
            }
            return 0;
        }
        function getPairRangeForBlock(node) {
            let end;
            const afterToken = sourceCode.getTokenAfter(node, {
                includeComments: true,
                filter: (t) => !(0, ast_utils_1.isCommentToken)(t) || node.loc.end.line < t.loc.start.line,
            });
            if (!afterToken || node.loc.end.line < afterToken.loc.start.line) {
                const line = afterToken
                    ? afterToken.loc.start.line - 1
                    : node.loc.end.line;
                const lineText = sourceCode.lines[line - 1];
                end = {
                    loc: { line, column: lineText.length },
                    get index() {
                        return sourceCode.getIndexFromLoc(this.loc);
                    },
                };
            }
            else {
                end = {
                    index: node.range[1],
                    loc: node.loc.end,
                };
            }
            const beforeToken = sourceCode.getTokenBefore(node);
            if (beforeToken) {
                const next = sourceCode.getTokenAfter(beforeToken, {
                    includeComments: true,
                });
                if (beforeToken.loc.end.line < next.loc.start.line ||
                    beforeToken.loc.end.line < node.loc.start.line) {
                    const start = {
                        line: beforeToken.loc.end.line < next.loc.start.line
                            ? next.loc.start.line
                            : node.loc.start.line,
                        column: 0,
                    };
                    return {
                        range: [sourceCode.getIndexFromLoc(start), end.index],
                        loc: { start, end: end.loc },
                        indentColumn: next.loc.start.column,
                    };
                }
                return {
                    range: [beforeToken.range[1], end.index],
                    loc: { start: beforeToken.loc.end, end: end.loc },
                    indentColumn: node.range[0] - beforeToken.range[1],
                };
            }
            let next = node;
            for (const beforeComment of sourceCode
                .getTokensBefore(node, {
                includeComments: true,
            })
                .reverse()) {
                if (beforeComment.loc.end.line + 1 < next.loc.start.line) {
                    const start = {
                        line: next.loc.start.line,
                        column: 0,
                    };
                    const startOfRange = sourceCode.getIndexFromLoc(start);
                    return {
                        range: [startOfRange, end.index],
                        loc: { start, end: end.loc },
                        indentColumn: next.loc.start.column,
                    };
                }
                next = beforeComment;
            }
            const start = {
                line: node.loc.start.line,
                column: 0,
            };
            const startOfRange = sourceCode.getIndexFromLoc(start);
            return {
                range: [startOfRange, end.index],
                loc: { start, end: end.loc },
                indentColumn: node.loc.start.column,
            };
        }
    },
});
