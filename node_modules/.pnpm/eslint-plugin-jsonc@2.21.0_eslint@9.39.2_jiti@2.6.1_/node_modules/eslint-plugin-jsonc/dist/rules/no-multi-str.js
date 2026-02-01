"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const coreRule = (0, utils_1.getCoreRule)("no-multi-str");
exports.default = (0, utils_1.createRule)("no-multi-str", {
    meta: Object.assign(Object.assign({}, coreRule.meta), { docs: {
            description: "disallow multiline strings",
            recommended: ["json", "jsonc"],
            extensionRule: true,
            layout: false,
        }, fixable: (_a = coreRule.meta) === null || _a === void 0 ? void 0 : _a.fixable, hasSuggestions: coreRule.meta.hasSuggestions, schema: coreRule.meta.schema, messages: Object.assign(Object.assign({}, coreRule.meta.messages), { multilineString: "Multiline support is limited to JSON5 only." }), type: coreRule.meta.type, deprecated: false, replacedBy: [] }),
    create(context) {
        return (0, utils_1.defineWrapperListener)(coreRule, context, context.options);
    },
});
