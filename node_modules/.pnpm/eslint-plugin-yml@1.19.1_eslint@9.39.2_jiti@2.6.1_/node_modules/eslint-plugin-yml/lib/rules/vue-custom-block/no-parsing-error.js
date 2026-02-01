"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../utils/index");
const compat_1 = require("../../utils/compat");
exports.default = (0, index_1.createRule)("vue-custom-block/no-parsing-error", {
    meta: {
        docs: {
            description: "disallow parsing errors in Vue custom blocks",
            categories: ["recommended", "standard"],
            extensionRule: false,
            layout: false,
        },
        schema: [],
        messages: {},
        type: "problem",
    },
    create(context, { customBlock }) {
        var _a;
        if (!customBlock) {
            return {};
        }
        const sourceCode = (0, compat_1.getSourceCode)(context);
        const parserServices = (_a = context.parserServices) !== null && _a !== void 0 ? _a : sourceCode.parserServices;
        const parseError = parserServices.parseError;
        if (parseError) {
            let loc = undefined;
            if ("column" in parseError && "lineNumber" in parseError) {
                loc = {
                    line: parseError.lineNumber,
                    column: parseError.column,
                };
            }
            return {
                Program(node) {
                    context.report({
                        node,
                        loc,
                        message: parseError.message,
                    });
                },
            };
        }
        return {};
    },
});
