"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const toml_eslint_parser_1 = require("toml-eslint-parser");
const lodash_1 = __importDefault(require("lodash"));
const utils_1 = require("../utils");
const compat_1 = require("../utils/compat");
function getFirst(keys) {
    const first = keys[0];
    if (first) {
        return getFirst(first.keys) || first.node;
    }
    return null;
}
function getLast(keys) {
    const last = lodash_1.default.last(keys);
    if (last) {
        return getLast(last.keys) || last.node;
    }
    return null;
}
exports.default = (0, utils_1.createRule)("tables-order", {
    meta: {
        docs: {
            description: "disallow defining tables out-of-order",
            categories: ["standard"],
            extensionRule: false,
        },
        fixable: "code",
        schema: [],
        messages: {
            outOfOrder: "'{{target}}' must be next to '{{before}}'.",
            outOfOrderToBefore: "'{{target}}' must be previous to '{{after}}'.",
        },
        type: "suggestion",
    },
    create(context) {
        const sourceCode = (0, compat_1.getSourceCode)(context);
        if (!sourceCode.parserServices?.isTOML) {
            return {};
        }
        function applyKey(rootKeys, node) {
            const keyNames = [...node.resolvedKey];
            let before = null;
            let keys = rootKeys;
            while (keyNames.length) {
                const key = keyNames.shift();
                const isLast = !keyNames.length;
                let next = keys.find((e) => e.key === key);
                if (!next) {
                    next = {
                        key,
                        node,
                        keys: [],
                    };
                    if (isLast) {
                        before = getLast(keys);
                    }
                    keys.push(next);
                }
                else {
                    if (isLast) {
                        if (next.keys.length > 0) {
                            const after = getFirst(next.keys);
                            return {
                                before: null,
                                after,
                            };
                        }
                        before = getLast(keys);
                    }
                }
                keys = next.keys;
            }
            return {
                before,
                after: null,
            };
        }
        function verify(node) {
            const keys = [];
            let prev = null;
            for (const body of node.body) {
                if (body.type !== "TOMLTable") {
                    continue;
                }
                const { before, after } = applyKey(keys, body);
                if (after) {
                    context.report({
                        node: body.key,
                        messageId: "outOfOrderToBefore",
                        data: {
                            target: (0, toml_eslint_parser_1.getStaticTOMLValue)(body.key).join("."),
                            after: (0, toml_eslint_parser_1.getStaticTOMLValue)(after.key).join("."),
                        },
                        fix(fixer) {
                            const startToken = sourceCode.getTokenBefore(body);
                            const code = sourceCode.text.slice(startToken.range[1], body.range[1]);
                            return [
                                fixer.insertTextBefore(after, `${code.trim()}\n`),
                                fixer.removeRange([startToken.range[1], body.range[1]]),
                            ];
                        },
                    });
                }
                else if (before && before !== prev) {
                    context.report({
                        node: body.key,
                        messageId: "outOfOrder",
                        data: {
                            target: (0, toml_eslint_parser_1.getStaticTOMLValue)(body.key).join("."),
                            before: (0, toml_eslint_parser_1.getStaticTOMLValue)(before.key).join("."),
                        },
                        fix(fixer) {
                            const startToken = sourceCode.getTokenBefore(body);
                            const code = sourceCode.text.slice(startToken.range[1], body.range[1]);
                            return [
                                fixer.insertTextAfter(before, `\n${code.trim()}`),
                                fixer.removeRange([startToken.range[1], body.range[1]]),
                            ];
                        },
                    });
                }
                prev = body;
            }
        }
        return {
            TOMLTopLevelTable: verify,
        };
    },
});
