"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const toml_eslint_parser_1 = require("toml-eslint-parser");
const lodash_1 = __importDefault(require("lodash"));
const utils_1 = require("../utils");
const compat_1 = require("../utils/compat");
exports.default = (0, utils_1.createRule)("keys-order", {
    meta: {
        docs: {
            description: "disallow defining pair keys out-of-order",
            categories: ["standard"],
            extensionRule: false,
        },
        fixable: "code",
        schema: [],
        messages: {
            outOfOrder: "'{{target}}' must be next to '{{before}}'.",
        },
        type: "suggestion",
    },
    create(context) {
        const sourceCode = (0, compat_1.getSourceCode)(context);
        if (!sourceCode.parserServices?.isTOML) {
            return {};
        }
        function applyKey(tableKeys, node) {
            const keyNames = (0, toml_eslint_parser_1.getStaticTOMLValue)(node.key);
            let before = null;
            let keys = tableKeys;
            while (keyNames.length) {
                const key = keyNames.shift();
                let next = keys.find((e) => e.key === key);
                if (!next) {
                    next = {
                        key,
                        node,
                        keys: [],
                    };
                    before = lodash_1.default.last(keys)?.node || null;
                    keys.push(next);
                }
                else {
                    next.node = node;
                }
                keys = next.keys;
            }
            return before;
        }
        function verify(node) {
            const keys = [];
            let prev = null;
            for (const body of node.body) {
                if (body.type !== "TOMLKeyValue") {
                    continue;
                }
                const before = applyKey(keys, body);
                if (before && before !== prev) {
                    context.report({
                        node: body.key,
                        messageId: "outOfOrder",
                        data: {
                            target: (0, toml_eslint_parser_1.getStaticTOMLValue)(body.key).join("."),
                            before: (0, toml_eslint_parser_1.getStaticTOMLValue)(before.key).join("."),
                        },
                        fix(fixer) {
                            const startToken = sourceCode.getTokenBefore(body);
                            const start = node.type === "TOMLInlineTable"
                                ? startToken.range[0]
                                : startToken.range[1];
                            const code = sourceCode.text.slice(start, body.range[1]);
                            return [
                                fixer.insertTextAfter(before, node.type === "TOMLInlineTable" ? code : `\n${code.trim()}`),
                                fixer.removeRange([start, body.range[1]]),
                            ];
                        },
                    });
                }
                prev = body;
            }
        }
        return {
            TOMLTopLevelTable: verify,
            TOMLTable: verify,
            TOMLInlineTable: verify,
        };
    },
});
