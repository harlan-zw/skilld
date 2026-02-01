"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const index_1 = require("../utils/index");
const compat_1 = require("../utils/compat");
exports.default = (0, index_1.createRule)("file-extension", {
    meta: {
        docs: {
            description: "enforce YAML file extension",
            categories: [],
            extensionRule: false,
            layout: false,
        },
        schema: [
            {
                type: "object",
                properties: {
                    extension: {
                        enum: ["yaml", "yml"],
                    },
                    caseSensitive: {
                        type: "boolean",
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            unexpected: `Expected extension '{{expected}}' but used extension '{{actual}}'.`,
        },
        type: "suggestion",
    },
    create(context) {
        var _a, _b, _c, _d;
        const sourceCode = (0, compat_1.getSourceCode)(context);
        if (!((_a = sourceCode.parserServices) === null || _a === void 0 ? void 0 : _a.isYAML)) {
            return {};
        }
        const expected = ((_b = context.options[0]) === null || _b === void 0 ? void 0 : _b.extension) || "yaml";
        const caseSensitive = (_d = (_c = context.options[0]) === null || _c === void 0 ? void 0 : _c.caseSensitive) !== null && _d !== void 0 ? _d : true;
        return {
            Program(node) {
                const filename = (0, compat_1.getFilename)(context);
                const actual = path_1.default.extname(filename);
                if ((caseSensitive ? actual : actual.toLocaleLowerCase()) ===
                    `.${expected}`) {
                    return;
                }
                context.report({
                    node,
                    loc: node.loc.start,
                    messageId: "unexpected",
                    data: {
                        expected: `.${expected}`,
                        actual,
                    },
                });
            },
        };
    },
});
