"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const coreRule = (0, utils_1.getCoreRule)("no-dupe-keys");
exports.default = (0, utils_1.createRule)("no-dupe-keys", {
    meta: Object.assign(Object.assign({}, coreRule.meta), { docs: {
            description: "disallow duplicate keys in object literals",
            recommended: ["json", "jsonc", "json5"],
            extensionRule: true,
            layout: false,
        }, fixable: (_a = coreRule.meta) === null || _a === void 0 ? void 0 : _a.fixable, hasSuggestions: coreRule.meta.hasSuggestions, schema: coreRule.meta.schema, messages: coreRule.meta.messages, type: coreRule.meta.type, deprecated: false, replacedBy: [] }),
    create(context) {
        return (0, utils_1.defineWrapperListener)(coreRule, context, context.options);
    },
});
