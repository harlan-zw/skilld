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
class JSONElementData {
    get reportLoc() {
        if (this.node) {
            return this.node.loc;
        }
        const around = this.around;
        return {
            start: around.before.loc.end,
            end: around.after.loc.start,
        };
    }
    get around() {
        if (this.cachedAround) {
            return this.cachedAround;
        }
        const sourceCode = this.array.sourceCode;
        if (this.node) {
            return (this.cachedAround = {
                node: this.node,
                before: sourceCode.getTokenBefore(this.node),
                after: sourceCode.getTokenAfter(this.node),
            });
        }
        const before = this.index > 0
            ? this.array.elements[this.index - 1].around.after
            : sourceCode.getFirstToken(this.array.node);
        const after = sourceCode.getTokenAfter(before);
        return (this.cachedAround = { before, after });
    }
    constructor(array, node, index) {
        this.cached = null;
        this.cachedAround = null;
        this.array = array;
        this.node = node;
        this.index = index;
    }
    get value() {
        var _a;
        return ((_a = this.cached) !== null && _a !== void 0 ? _a : (this.cached = {
            value: this.node == null ? null : (0, jsonc_eslint_parser_1.getStaticJSONValue)(this.node),
        })).value;
    }
}
class JSONArrayData {
    constructor(node, sourceCode) {
        this.cachedElements = null;
        this.node = node;
        this.sourceCode = sourceCode;
    }
    get elements() {
        var _a;
        return ((_a = this.cachedElements) !== null && _a !== void 0 ? _a : (this.cachedElements = this.node.elements.map((e, index) => new JSONElementData(this, e, index))));
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
        const type = getJSONPrimitiveType(a.value);
        if (type && type === getJSONPrimitiveType(b.value)) {
            return compareValue([a.value, b.value]);
        }
        return true;
    };
}
function parseOptions(options) {
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
                        ? Boolean(getJSONPrimitiveType(v.value)) &&
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
            if (data.node.elements.length < minValues) {
                return false;
            }
            let path = "";
            let curr = data.node;
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
                }
                else if (p.type === "JSONArrayExpression") {
                    const index = p.elements.indexOf(curr);
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
        if (prop.type === "JSONIdentifier") {
            return prop.name;
        }
        return String((0, jsonc_eslint_parser_1.getStaticJSONValue)(prop));
    }
}
function getJSONPrimitiveType(val) {
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
exports.default = (0, utils_1.createRule)("sort-array-values", {
    meta: {
        docs: {
            description: "require array values to be sorted",
            recommended: null,
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
            shouldBeBefore: "Expected array values to be in {{orderText}} order. '{{thisValue}}' should be before '{{targetValue}}'.",
            shouldBeAfter: "Expected array values to be in {{orderText}} order. '{{thisValue}}' should be after '{{targetValue}}'.",
        },
        type: "suggestion",
    },
    create(context) {
        const sourceCode = context.sourceCode;
        if (!sourceCode.parserServices.isJSON) {
            return {};
        }
        const parsedOptions = parseOptions(context.options);
        function bubbleSort(elements, option) {
            const l = elements.length;
            const result = [...elements];
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
        function verifyArrayElements(elements, option) {
            const sorted = bubbleSort(elements, option);
            const editScript = (0, calc_shortest_edit_script_1.calcShortestEditScript)(elements, sorted);
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
                            yield* (0, fix_sort_elements_1.fixToMoveDownForSorting)(fixer, sourceCode, edit.a.around, target.around);
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
                            yield* (0, fix_sort_elements_1.fixToMoveUpForSorting)(fixer, sourceCode, edit.a.around, target.around);
                        },
                    });
                }
            }
            function findInsertAfterTarget(element, insertEditIndex) {
                for (let index = insertEditIndex - 1; index >= 0; index--) {
                    const edit = editScript[index];
                    if (edit.type === "delete" && edit.a === element)
                        break;
                    if (edit.type !== "common")
                        continue;
                    return edit.a;
                }
                let lastTarget = null;
                for (let index = elements.indexOf(element) + 1; index < elements.length; index++) {
                    const el = elements[index];
                    if (option.isValidOrder(el, element)) {
                        lastTarget = el;
                        continue;
                    }
                    return lastTarget;
                }
                return lastTarget;
            }
            function findInsertBeforeTarget(element, insertEditIndex) {
                for (let index = insertEditIndex + 1; index < editScript.length; index++) {
                    const edit = editScript[index];
                    if (edit.type === "delete" && edit.a === element)
                        break;
                    if (edit.type !== "common")
                        continue;
                    return edit.a;
                }
                let lastTarget = null;
                for (let index = elements.indexOf(element) - 1; index >= 0; index--) {
                    const el = elements[index];
                    if (option.isValidOrder(element, el)) {
                        lastTarget = el;
                        continue;
                    }
                    return lastTarget;
                }
                return lastTarget;
            }
        }
        function toText(data) {
            if (getJSONPrimitiveType(data.value)) {
                return String(data.value);
            }
            return sourceCode.getText(data.node);
        }
        return {
            JSONArrayExpression(node) {
                const data = new JSONArrayData(node, sourceCode);
                const option = parsedOptions.find((o) => o.isTargetArray(data));
                if (!option) {
                    return;
                }
                verifyArrayElements(data.elements.filter((d) => !option.ignore(d)), option);
            },
        };
    },
});
