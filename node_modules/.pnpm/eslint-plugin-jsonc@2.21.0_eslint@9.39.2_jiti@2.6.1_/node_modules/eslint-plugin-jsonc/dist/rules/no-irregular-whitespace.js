"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const coreRule = (0, utils_1.getCoreRule)("no-irregular-whitespace");
exports.default = (0, utils_1.createRule)("no-irregular-whitespace", {
    meta: Object.assign(Object.assign({}, coreRule.meta), { docs: {
            description: "disallow irregular whitespace",
            recommended: null,
            extensionRule: true,
            layout: false,
        }, fixable: (_a = coreRule.meta) === null || _a === void 0 ? void 0 : _a.fixable, hasSuggestions: (_b = coreRule.meta) === null || _b === void 0 ? void 0 : _b.hasSuggestions, schema: coreRule.meta.schema, messages: coreRule.meta.messages, type: coreRule.meta.type, deprecated: false, replacedBy: [] }),
    create(context) {
        return (0, utils_1.defineWrapperListener)(coreRule, context, context.options);
    },
});
