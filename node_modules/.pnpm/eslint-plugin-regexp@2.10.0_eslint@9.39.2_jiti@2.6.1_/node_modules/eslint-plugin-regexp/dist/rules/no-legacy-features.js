"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const type_tracker_1 = require("../utils/type-tracker");
const eslint_utils_1 = require("@eslint-community/eslint-utils");
const STATIC_PROPERTIES = [
    "input",
    "$_",
    "lastMatch",
    "$&",
    "lastParen",
    "$+",
    "leftContext",
    "$`",
    "rightContext",
    "$'",
    "$1",
    "$2",
    "$3",
    "$4",
    "$5",
    "$6",
    "$7",
    "$8",
    "$9",
];
const PROTOTYPE_METHODS = ["compile"];
exports.default = (0, utils_1.createRule)("no-legacy-features", {
    meta: {
        docs: {
            description: "disallow legacy RegExp features",
            category: "Best Practices",
            recommended: true,
        },
        schema: [
            {
                type: "object",
                properties: {
                    staticProperties: {
                        type: "array",
                        items: { enum: STATIC_PROPERTIES },
                        uniqueItems: true,
                    },
                    prototypeMethods: {
                        type: "array",
                        items: { enum: PROTOTYPE_METHODS },
                        uniqueItems: true,
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            forbiddenStaticProperty: "'{{name}}' static property is forbidden.",
            forbiddenPrototypeMethods: "RegExp.prototype.{{name}} method is forbidden.",
        },
        type: "suggestion",
    },
    create(context) {
        var _a, _b, _c, _d;
        const staticProperties = (_b = (_a = context.options[0]) === null || _a === void 0 ? void 0 : _a.staticProperties) !== null && _b !== void 0 ? _b : STATIC_PROPERTIES;
        const prototypeMethods = (_d = (_c = context.options[0]) === null || _c === void 0 ? void 0 : _c.prototypeMethods) !== null && _d !== void 0 ? _d : PROTOTYPE_METHODS;
        const typeTracer = (0, type_tracker_1.createTypeTracker)(context);
        return {
            ...(staticProperties.length
                ? {
                    Program(program) {
                        const scope = context.sourceCode.getScope(program);
                        const tracker = new eslint_utils_1.ReferenceTracker(scope);
                        const regexpTraceMap = {};
                        for (const sp of staticProperties) {
                            regexpTraceMap[sp] = { [eslint_utils_1.READ]: true };
                        }
                        for (const { node, path, } of tracker.iterateGlobalReferences({
                            RegExp: regexpTraceMap,
                        })) {
                            context.report({
                                node,
                                messageId: "forbiddenStaticProperty",
                                data: { name: path.join(".") },
                            });
                        }
                    },
                }
                : {}),
            ...(prototypeMethods.length
                ? {
                    MemberExpression(node) {
                        if (node.computed ||
                            node.property.type !== "Identifier" ||
                            !prototypeMethods.includes(node.property.name) ||
                            node.object.type === "Super") {
                            return;
                        }
                        if (typeTracer.isRegExp(node.object)) {
                            context.report({
                                node,
                                messageId: "forbiddenPrototypeMethods",
                                data: { name: node.property.name },
                            });
                        }
                    },
                }
                : {}),
        };
    },
});
