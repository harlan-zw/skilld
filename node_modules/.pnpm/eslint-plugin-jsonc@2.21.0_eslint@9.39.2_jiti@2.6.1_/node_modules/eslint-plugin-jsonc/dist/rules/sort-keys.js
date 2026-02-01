"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const natural_compare_1 = __importDefault(require("natural-compare"));
const utils_1 = require("../utils");
const jsonc_eslint_parser_1 = require("jsonc-eslint-parser");
const fix_sort_elements_1 = require("../utils/fix-sort-elements");
const calc_shortest_edit_script_1 = require("../utils/calc-shortest-edit-script");
function getPropertyName(node) {
    const prop = node.key;
    if (prop.type === "JSONIdentifier") {
        return prop.name;
    }
    return String((0, jsonc_eslint_parser_1.getStaticJSONValue)(prop));
}
class JSONPropertyData {
    get reportLoc() {
        return this.node.key.loc;
    }
    constructor(object, node, index) {
        this.cachedName = null;
        this.object = object;
        this.node = node;
        this.index = index;
    }
    get name() {
        var _a;
        return ((_a = this.cachedName) !== null && _a !== void 0 ? _a : (this.cachedName = getPropertyName(this.node)));
    }
    getPrev() {
        const prevIndex = this.index - 1;
        return prevIndex >= 0 ? this.object.properties[prevIndex] : null;
    }
}
class JSONObjectData {
    constructor(node) {
        this.cachedProperties = null;
        this.node = node;
    }
    get properties() {
        var _a;
        return ((_a = this.cachedProperties) !== null && _a !== void 0 ? _a : (this.cachedProperties = this.node.properties.map((e, index) => new JSONPropertyData(this, e, index))));
    }
    getPath() {
        let path = "";
        let curr = this.node;
        let p = curr.parent;
        while (p) {
            if (p.type === "JSONProperty") {
                const name = getPropertyName(p);
                if (/^[$a-z_][\w$]*$/iu.test(name)) {
                    path = `.${name}${path}`;
                }
                else {
                    path = `[${JSON.stringify(name)}]${path}`;
                }
                curr = p.parent;
            }
            else if (p.type === "JSONArrayExpression") {
                const index = p.elements.indexOf(curr);
                path = `[${index}]${path}`;
                curr = p;
            }
            else if (p.type === "JSONExpressionStatement") {
                break;
            }
            else {
                curr = p;
            }
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
function parseOptions(options) {
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
                isTargetObject: (node) => node.properties.length >= minKeys,
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
                isTargetObject,
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
            isTargetObject,
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
        function isTargetObject(data) {
            if (data.node.properties.length < minKeys) {
                return false;
            }
            if (hasProperties.length > 0) {
                const names = new Set(data.properties.map((p) => p.name));
                if (!hasProperties.every((name) => names.has(name))) {
                    return false;
                }
            }
            return pathPattern.test(data.getPath());
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
exports.default = (0, utils_1.createRule)("sort-keys", {
    meta: {
        docs: {
            description: "require object keys to be sorted",
            recommended: null,
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
            shouldBeBefore: "Expected object keys to be in {{orderText}} order. '{{thisName}}' should be before '{{targetName}}'.",
            shouldBeAfter: "Expected object keys to be in {{orderText}} order. '{{thisName}}' should be after '{{targetName}}'.",
        },
        type: "suggestion",
    },
    create(context) {
        const sourceCode = context.sourceCode;
        if (!sourceCode.parserServices.isJSON) {
            return {};
        }
        const parsedOptions = parseOptions(context.options);
        function groupingProperties(properties, option) {
            const groups = [];
            let group = [];
            let prev = null;
            for (const property of properties) {
                if (option.ignore(property)) {
                    prev = property;
                    continue;
                }
                if (prev &&
                    option.allowLineSeparatedGroups &&
                    hasBlankLine(prev, property)) {
                    if (group.length > 0) {
                        groups.push(group);
                        group = [];
                    }
                }
                group.push(property);
                prev = property;
            }
            if (group.length > 0) {
                groups.push(group);
            }
            return groups;
        }
        function bubbleSort(properties, option) {
            const l = properties.length;
            const result = [...properties];
            let swapped;
            do {
                swapped = false;
                for (let nextIndex = 1; nextIndex < l; nextIndex++) {
                    const prevIndex = nextIndex - 1;
                    if (option.isValidOrder(result[prevIndex], result[nextIndex]))
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
        function verifyProperties(properties, option) {
            const sorted = bubbleSort(properties, option);
            const editScript = (0, calc_shortest_edit_script_1.calcShortestEditScript)(properties, sorted);
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
                            yield* (0, fix_sort_elements_1.fixToMoveDownForSorting)(fixer, sourceCode, edit.a, target);
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
                            yield* (0, fix_sort_elements_1.fixToMoveUpForSorting)(fixer, sourceCode, edit.a, target);
                        },
                    });
                }
            }
            function findInsertAfterTarget(property, insertEditIndex) {
                for (let index = insertEditIndex - 1; index >= 0; index--) {
                    const edit = editScript[index];
                    if (edit.type === "delete" && edit.a === property)
                        break;
                    if (edit.type !== "common")
                        continue;
                    return edit.a;
                }
                let lastTarget = null;
                for (let index = properties.indexOf(property) + 1; index < properties.length; index++) {
                    const element = properties[index];
                    if (option.isValidOrder(element, property)) {
                        lastTarget = element;
                        continue;
                    }
                    return lastTarget;
                }
                return lastTarget;
            }
            function findInsertBeforeTarget(property, insertEditIndex) {
                for (let index = insertEditIndex + 1; index < editScript.length; index++) {
                    const edit = editScript[index];
                    if (edit.type === "delete" && edit.a === property)
                        break;
                    if (edit.type !== "common")
                        continue;
                    return edit.a;
                }
                let lastTarget = null;
                for (let index = properties.indexOf(property) - 1; index >= 0; index--) {
                    const element = properties[index];
                    if (option.isValidOrder(property, element)) {
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
        return {
            JSONObjectExpression(node) {
                const data = new JSONObjectData(node);
                const option = parsedOptions.find((o) => o.isTargetObject(data));
                if (!option) {
                    return;
                }
                for (const properties of groupingProperties(data.properties, option)) {
                    verifyProperties(properties, option);
                }
            },
        };
    },
});
