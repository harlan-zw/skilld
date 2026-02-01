"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const natural_compare_1 = __importDefault(require("natural-compare"));
const index_1 = require("../utils/index");
const ast_utils_1 = require("../utils/ast-utils");
const yaml_eslint_parser_1 = require("yaml-eslint-parser");
const compat_1 = require("../utils/compat");
const calc_shortest_edit_script_1 = require("../utils/calc-shortest-edit-script");
class YAMLEntryData {
    get reportLoc() {
        if (this.node) {
            return this.node.loc;
        }
        const aroundTokens = this.aroundTokens;
        return {
            start: aroundTokens.before.loc.end,
            end: aroundTokens.after.loc.start,
        };
    }
    get range() {
        if (this.node) {
            return this.node.range;
        }
        if (this.cachedRange) {
            return this.cachedRange;
        }
        const aroundTokens = this.aroundTokens;
        return (this.cachedRange = [
            aroundTokens.before.range[1],
            aroundTokens.after.range[0],
        ]);
    }
    get aroundTokens() {
        if (this.cachedAroundTokens) {
            return this.cachedAroundTokens;
        }
        const sourceCode = this.sequence.sourceCode;
        if (this.node) {
            return (this.cachedAroundTokens = {
                before: sourceCode.getTokenBefore(this.node),
                after: sourceCode.getTokenAfter(this.node),
            });
        }
        const before = this.index > 0
            ? this.sequence.entries[this.index - 1].aroundTokens.after
            : sourceCode.getFirstToken(this.sequence.node);
        const after = sourceCode.getTokenAfter(before);
        return (this.cachedAroundTokens = { before, after });
    }
    constructor(sequence, node, index, anchorAlias) {
        this.cached = null;
        this.cachedRange = null;
        this.cachedAroundTokens = null;
        this.sequence = sequence;
        this.node = node;
        this.index = index;
        this.anchorAlias = anchorAlias;
    }
    get value() {
        var _a;
        return ((_a = this.cached) !== null && _a !== void 0 ? _a : (this.cached = {
            value: this.node == null ? null : (0, yaml_eslint_parser_1.getStaticYAMLValue)(this.node),
        })).value;
    }
}
class YAMLSequenceData {
    constructor(node, sourceCode, anchorAliasMap) {
        this.cachedEntries = null;
        this.node = node;
        this.sourceCode = sourceCode;
        this.anchorAliasMap = anchorAliasMap;
    }
    get entries() {
        var _a;
        return ((_a = this.cachedEntries) !== null && _a !== void 0 ? _a : (this.cachedEntries = this.node.entries.map((e, index) => new YAMLEntryData(this, e, index, this.anchorAliasMap.get(e)))));
    }
}
function buildValidatorFromType(order, insensitive, natural) {
    let compareValue = ([a, b]) => a <= b;
    let compareText = compareValue;
    if (natural) {
        compareText = ([a, b]) => (0, natural_compare_1.default)(a, b) <= 0;
    }
    if (insensitive) {
        const baseCompareText = compareText;
        compareText = ([a, b]) => baseCompareText([a.toLowerCase(), b.toLowerCase()]);
    }
    if (order === "desc") {
        const baseCompareText = compareText;
        compareText = (args) => baseCompareText(args.reverse());
        const baseCompareValue = compareValue;
        compareValue = (args) => baseCompareValue(args.reverse());
    }
    return (a, b) => {
        if (typeof a.value === "string" && typeof b.value === "string") {
            return compareText([a.value, b.value]);
        }
        const type = getYAMLPrimitiveType(a.value);
        if (type && type === getYAMLPrimitiveType(b.value)) {
            return compareValue([a.value, b.value]);
        }
        return true;
    };
}
function parseOptions(options, sourceCode) {
    return options.map((opt) => {
        var _a, _b, _c, _d;
        const order = opt.order;
        const pathPattern = new RegExp(opt.pathPattern);
        const minValues = (_a = opt.minValues) !== null && _a !== void 0 ? _a : 2;
        if (!Array.isArray(order)) {
            const type = (_b = order.type) !== null && _b !== void 0 ? _b : "asc";
            const insensitive = order.caseSensitive === false;
            const natural = Boolean(order.natural);
            return {
                isTargetArray,
                ignore: () => false,
                isValidOrder: buildValidatorFromType(type, insensitive, natural),
                orderText(data) {
                    if (typeof data.value === "string") {
                        return `${natural ? "natural " : ""}${insensitive ? "insensitive " : ""}${type}ending`;
                    }
                    return `${type}ending`;
                },
            };
        }
        const parsedOrder = [];
        for (const o of order) {
            if (typeof o === "string") {
                parsedOrder.push({
                    test: (v) => v.value === o,
                    isValidNestOrder: () => true,
                });
            }
            else {
                const valuePattern = o.valuePattern ? new RegExp(o.valuePattern) : null;
                const nestOrder = (_c = o.order) !== null && _c !== void 0 ? _c : {};
                const type = (_d = nestOrder.type) !== null && _d !== void 0 ? _d : "asc";
                const insensitive = nestOrder.caseSensitive === false;
                const natural = Boolean(nestOrder.natural);
                parsedOrder.push({
                    test: (v) => valuePattern
                        ? Boolean(getYAMLPrimitiveType(v.value)) &&
                            valuePattern.test(String(v.value))
                        : true,
                    isValidNestOrder: buildValidatorFromType(type, insensitive, natural),
                });
            }
        }
        return {
            isTargetArray,
            ignore: (v) => parsedOrder.every((p) => !p.test(v)),
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
            orderText: () => "specified",
        };
        function isTargetArray(data) {
            if (data.node.entries.length < minValues) {
                return false;
            }
            let path = "";
            let curr = data.node;
            let p = curr.parent;
            while (p) {
                if (p.type === "YAMLPair") {
                    const name = getPropertyName(p);
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
            return pathPattern.test(path);
        }
    });
    function getPropertyName(node) {
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
}
function getYAMLPrimitiveType(val) {
    const t = typeof val;
    if (t === "string" || t === "number" || t === "boolean" || t === "bigint") {
        return t;
    }
    if (val === null) {
        return "null";
    }
    if (val === undefined) {
        return "undefined";
    }
    if (val instanceof RegExp) {
        return "regexp";
    }
    return null;
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
exports.default = (0, index_1.createRule)("sort-sequence-values", {
    meta: {
        docs: {
            description: "require sequence values to be sorted",
            categories: null,
            extensionRule: false,
            layout: false,
        },
        fixable: "code",
        schema: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    pathPattern: { type: "string" },
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
                                                valuePattern: {
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
                    minValues: {
                        type: "integer",
                        minimum: 2,
                    },
                },
                required: ["pathPattern", "order"],
                additionalProperties: false,
            },
            minItems: 1,
        },
        messages: {
            shouldBeBefore: "Expected sequence values to be in {{orderText}} order. '{{thisValue}}' should be before '{{targetValue}}'.",
            shouldBeAfter: "Expected sequence values to be in {{orderText}} order. '{{thisValue}}' should be after '{{targetValue}}'.",
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
        function bubbleSort(entries, option) {
            const l = entries.length;
            const result = [...entries];
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
        function verifyArrayElements(entries, option) {
            const sorted = bubbleSort(entries, option);
            const editScript = (0, calc_shortest_edit_script_1.calcShortestEditScript)(entries, sorted);
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
                            thisValue: toText(edit.a),
                            targetValue: toText(target),
                            orderText: option.orderText(edit.a),
                        },
                        *fix(fixer) {
                            if (edit.a.sequence.node.style === "flow") {
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
                            thisValue: toText(edit.a),
                            targetValue: toText(target),
                            orderText: option.orderText(edit.a),
                        },
                        *fix(fixer) {
                            if (edit.a.sequence.node.style === "flow") {
                                yield* fixToMoveUpForFlow(fixer, edit.a, target);
                            }
                            else {
                                yield* fixToMoveUpForBlock(fixer, edit.a, target);
                            }
                        },
                    });
                }
            }
            function findInsertAfterTarget(entry, insertEditIndex) {
                let candidate = null;
                for (let index = insertEditIndex - 1; index >= 0; index--) {
                    const edit = editScript[index];
                    if (edit.type === "delete" && edit.a === entry)
                        break;
                    if (edit.type !== "common")
                        continue;
                    candidate = edit.a;
                    break;
                }
                const entryIndex = entries.indexOf(entry);
                if (candidate) {
                    for (let index = entryIndex + 1; index < entries.length; index++) {
                        const element = entries[index];
                        if (element === candidate)
                            return candidate;
                        if (shouldKeepOrder(entry, element)) {
                            break;
                        }
                    }
                }
                let lastTarget = null;
                for (let index = entryIndex + 1; index < entries.length; index++) {
                    const element = entries[index];
                    if (option.isValidOrder(element, entry) &&
                        !shouldKeepOrder(entry, element)) {
                        lastTarget = element;
                        continue;
                    }
                    return lastTarget;
                }
                return lastTarget;
            }
            function findInsertBeforeTarget(entry, insertEditIndex) {
                let candidate = null;
                for (let index = insertEditIndex + 1; index < editScript.length; index++) {
                    const edit = editScript[index];
                    if (edit.type === "delete" && edit.a === entry)
                        break;
                    if (edit.type !== "common")
                        continue;
                    candidate = edit.a;
                    break;
                }
                const entryIndex = entries.indexOf(entry);
                if (candidate) {
                    for (let index = entryIndex - 1; index >= 0; index--) {
                        const element = entries[index];
                        if (element === candidate)
                            return candidate;
                        if (shouldKeepOrder(element, entry)) {
                            break;
                        }
                    }
                }
                let lastTarget = null;
                for (let index = entryIndex - 1; index >= 0; index--) {
                    const element = entries[index];
                    if (option.isValidOrder(entry, element) &&
                        !shouldKeepOrder(element, entry)) {
                        lastTarget = element;
                        continue;
                    }
                    return lastTarget;
                }
                return lastTarget;
            }
        }
        function toText(data) {
            if (getYAMLPrimitiveType(data.value)) {
                return String(data.value);
            }
            return sourceCode.getText(data.node);
        }
        let entryStack = {
            upper: null,
            anchors: new Set(),
            aliases: new Set(),
        };
        const anchorAliasMap = new Map();
        return {
            "YAMLSequence > *"(node) {
                if (!node.parent.entries.includes(node)) {
                    return;
                }
                entryStack = {
                    upper: entryStack,
                    anchors: new Set(),
                    aliases: new Set(),
                };
                if (node.type === "YAMLAlias") {
                    entryStack.aliases.add(node.name);
                }
            },
            YAMLAnchor(node) {
                if (entryStack) {
                    entryStack.anchors.add(node.name);
                }
            },
            YAMLAlias(node) {
                if (entryStack) {
                    entryStack.aliases.add(node.name);
                }
            },
            "YAMLSequence > *:exit"(node) {
                if (!node.parent.entries.includes(node)) {
                    return;
                }
                anchorAliasMap.set(node, entryStack);
                const { anchors, aliases } = entryStack;
                entryStack = entryStack.upper;
                entryStack.anchors = new Set([...entryStack.anchors, ...anchors]);
                entryStack.aliases = new Set([...entryStack.aliases, ...aliases]);
            },
            "YAMLSequence:exit"(node) {
                const data = new YAMLSequenceData(node, sourceCode, anchorAliasMap);
                const option = parsedOptions.find((o) => o.isTargetArray(data));
                if (!option) {
                    return;
                }
                verifyArrayElements(data.entries.filter((d) => !option.ignore(d)), option);
            },
        };
        function* fixToMoveDownForFlow(fixer, data, moveTarget) {
            const beforeToken = data.aroundTokens.before;
            const afterToken = data.aroundTokens.after;
            let insertCode, removeRange, insertTargetToken;
            if ((0, ast_utils_1.isComma)(afterToken)) {
                removeRange = [beforeToken.range[1], afterToken.range[1]];
                const moveTargetAfterToken = moveTarget.aroundTokens.after;
                if ((0, ast_utils_1.isComma)(moveTargetAfterToken)) {
                    insertTargetToken = moveTargetAfterToken;
                    insertCode = sourceCode.text.slice(...removeRange);
                }
                else {
                    insertTargetToken = moveTarget.node
                        ? sourceCode.getLastToken(moveTarget.node)
                        : moveTarget.aroundTokens.before;
                    insertCode = sourceCode.text.slice(beforeToken.range[1], afterToken.range[0]);
                    insertCode = `,${insertCode}`;
                }
            }
            else {
                if ((0, ast_utils_1.isComma)(beforeToken)) {
                    removeRange = [beforeToken.range[0], data.range[1]];
                    insertCode = sourceCode.text.slice(...removeRange);
                    insertTargetToken = moveTarget.node
                        ? sourceCode.getLastToken(moveTarget.node)
                        : moveTarget.aroundTokens.before;
                }
                else {
                    removeRange = [beforeToken.range[1], data.range[1]];
                    insertCode = `,${sourceCode.text.slice(...removeRange)}`;
                    insertTargetToken = moveTarget.node
                        ? sourceCode.getLastToken(moveTarget.node)
                        : moveTarget.aroundTokens.before;
                }
            }
            yield fixer.removeRange(removeRange);
            yield fixer.insertTextAfterRange(insertTargetToken.range, insertCode);
        }
        function* fixToMoveUpForFlow(fixer, data, moveTarget) {
            const beforeToken = data.aroundTokens.before;
            const afterToken = data.aroundTokens.after;
            let insertCode, removeRange, insertTargetToken;
            if ((0, ast_utils_1.isComma)(afterToken)) {
                removeRange = [beforeToken.range[1], afterToken.range[1]];
                insertCode = sourceCode.text.slice(...removeRange);
                insertTargetToken = moveTarget.aroundTokens.before;
            }
            else {
                removeRange = [beforeToken.range[0], data.range[1]];
                if ((0, ast_utils_1.isComma)(moveTarget.aroundTokens.before)) {
                    insertCode = sourceCode.text.slice(...removeRange);
                    insertTargetToken = sourceCode.getTokenBefore(moveTarget.aroundTokens.before);
                }
                else {
                    insertCode = `${sourceCode.text.slice(beforeToken.range[1], data.range[1])},`;
                    insertTargetToken = moveTarget.aroundTokens.before;
                }
            }
            yield fixer.insertTextAfterRange(insertTargetToken.range, insertCode);
            yield fixer.removeRange(removeRange);
        }
        function* fixToMoveDownForBlock(fixer, data, moveTarget) {
            const moveDataList = data.sequence.entries.slice(data.index, moveTarget.index + 1);
            let replacementCodeRange = getBlockEntryRange(data);
            for (const target of moveDataList.reverse()) {
                const range = getBlockEntryRange(target);
                yield fixer.replaceTextRange(range, sourceCode.text.slice(...replacementCodeRange));
                replacementCodeRange = range;
            }
        }
        function* fixToMoveUpForBlock(fixer, data, moveTarget) {
            const moveDataList = data.sequence.entries.slice(moveTarget.index, data.index + 1);
            let replacementCodeRange = getBlockEntryRange(data);
            for (const target of moveDataList) {
                const range = getBlockEntryRange(target);
                yield fixer.replaceTextRange(range, sourceCode.text.slice(...replacementCodeRange));
                replacementCodeRange = range;
            }
        }
        function getBlockEntryRange(data) {
            return [getBlockEntryStartOffset(data), getBlockEntryEndOffset(data)];
        }
        function getBlockEntryStartOffset(data) {
            const beforeHyphenToken = sourceCode.getTokenBefore(data.aroundTokens.before);
            if (!beforeHyphenToken) {
                const comment = sourceCode.getTokenBefore(data.aroundTokens.before, {
                    includeComments: true,
                });
                if (comment &&
                    data.aroundTokens.before.loc.start.column <= comment.loc.start.column) {
                    return comment.range[0];
                }
                return data.aroundTokens.before.range[0];
            }
            let next = sourceCode.getTokenAfter(beforeHyphenToken, {
                includeComments: true,
            });
            while (beforeHyphenToken.loc.end.line === next.loc.start.line &&
                next.range[1] < data.aroundTokens.before.range[0]) {
                next = sourceCode.getTokenAfter(next, {
                    includeComments: true,
                });
            }
            return next.range[0];
        }
        function getBlockEntryEndOffset(data) {
            var _a;
            const valueEndToken = (_a = data.node) !== null && _a !== void 0 ? _a : data.aroundTokens.before;
            let last = valueEndToken;
            let afterToken = sourceCode.getTokenAfter(last, {
                includeComments: true,
            });
            while (afterToken &&
                valueEndToken.loc.end.line === afterToken.loc.start.line) {
                last = afterToken;
                afterToken = sourceCode.getTokenAfter(last, {
                    includeComments: true,
                });
            }
            return last.range[1];
        }
    },
});
