"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yaml_eslint_parser_1 = require("yaml-eslint-parser");
const index_1 = require("../utils/index");
const compat_1 = require("../utils/compat");
const SYMBOLS = new Set([
    ":",
    "{",
    "}",
    "[",
    "]",
    ",",
    "&",
    "*",
    "#",
    "|",
    "+",
    "%",
    '"',
    "'",
    "\\",
]);
function toRegExps(patterns) {
    return patterns.map((p) => new RegExp(p, "u"));
}
function isStringScalar(node) {
    return typeof node.value === "string";
}
exports.default = (0, index_1.createRule)("plain-scalar", {
    meta: {
        docs: {
            description: "require or disallow plain style scalar.",
            categories: ["standard"],
            extensionRule: false,
            layout: false,
        },
        fixable: "code",
        schema: [
            { enum: ["always", "never"] },
            {
                type: "object",
                properties: {
                    ignorePatterns: {
                        type: "array",
                        items: { type: "string" },
                    },
                    overrides: {
                        type: "object",
                        properties: {
                            mappingKey: { enum: ["always", "never", null] },
                        },
                        additionalProperties: false,
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            required: "Must use plain style scalar.",
            disallow: "Must use quoted style scalar.",
        },
        type: "layout",
    },
    create(context) {
        var _a, _b, _c, _d, _e;
        const sourceCode = (0, compat_1.getSourceCode)(context);
        if (!((_a = sourceCode.parserServices) === null || _a === void 0 ? void 0 : _a.isYAML)) {
            return {};
        }
        const valueOption = {
            prefer: context.options[0] || "always",
            ignorePatterns: [],
        };
        const overridesMappingKey = (_c = (_b = context.options[1]) === null || _b === void 0 ? void 0 : _b.overrides) === null || _c === void 0 ? void 0 : _c.mappingKey;
        const keyOption = overridesMappingKey
            ? {
                prefer: overridesMappingKey,
                ignorePatterns: [],
            }
            : valueOption;
        if ((_d = context.options[1]) === null || _d === void 0 ? void 0 : _d.ignorePatterns) {
            valueOption.ignorePatterns = toRegExps((_e = context.options[1]) === null || _e === void 0 ? void 0 : _e.ignorePatterns);
        }
        else {
            if (valueOption.prefer === "always") {
                valueOption.ignorePatterns = toRegExps([
                    String.raw `[\v\f\u0085\u00a0\u1680\u180e\u2000-\u200b\u2028\u2029\u202f\u205f\u3000\ufeff]`,
                ]);
            }
            if (overridesMappingKey && keyOption.prefer === "always") {
                keyOption.ignorePatterns = toRegExps([
                    String.raw `[\v\f\u0085\u00a0\u1680\u180e\u2000-\u200b\u2028\u2029\u202f\u205f\u3000\ufeff]`,
                ]);
            }
        }
        let currentDocument;
        function canToPlain(node) {
            if (node.value !== node.value.trim()) {
                return false;
            }
            for (let index = 0; index < node.value.length; index++) {
                const char = node.value[index];
                if (SYMBOLS.has(char)) {
                    return false;
                }
                if (index === 0) {
                    if (char === "-" || char === "?") {
                        const next = node.value[index + 1];
                        if (next && !next.trim()) {
                            return false;
                        }
                    }
                    else if (char === "!") {
                        const next = node.value[index + 1];
                        if (next && (!next.trim() || next === "!" || next === "<")) {
                            return false;
                        }
                    }
                }
            }
            const parent = node.parent.type === "YAMLWithMeta" ? node.parent.parent : node.parent;
            if (parent.type === "YAMLPair") {
                if (parent.key === node) {
                    const colon = sourceCode.getTokenAfter(node);
                    if (colon && colon.value === ":") {
                        const next = sourceCode.getTokenAfter(colon);
                        if (colon.range[1] === (next === null || next === void 0 ? void 0 : next.range[0])) {
                            return false;
                        }
                    }
                }
            }
            return true;
        }
        function verifyAlways(node) {
            if (node.style !== "double-quoted" && node.style !== "single-quoted") {
                return;
            }
            if (!canToPlain(node)) {
                return;
            }
            try {
                const result = (0, yaml_eslint_parser_1.parseForESLint)(node.value, {
                    defaultYAMLVersion: currentDocument === null || currentDocument === void 0 ? void 0 : currentDocument.version,
                });
                if ((0, yaml_eslint_parser_1.getStaticYAMLValue)(result.ast) !== node.value) {
                    return;
                }
            }
            catch (_a) {
                return;
            }
            context.report({
                node,
                messageId: "required",
                fix(fixer) {
                    return fixer.replaceText(node, node.value);
                },
            });
        }
        function verifyNever(node) {
            if (node.style !== "plain") {
                return;
            }
            const text = node.value;
            context.report({
                node,
                messageId: "disallow",
                fix(fixer) {
                    return fixer.replaceText(node, `"${text
                        .replace(/(["\\])/gu, "\\$1")
                        .replace(/\r?\n|[\u2028\u2029]/gu, "\\n")}"`);
                },
            });
        }
        function withinKey(node) {
            const parent = node.parent;
            if (parent.type === "YAMLPair" && parent.key === node) {
                return true;
            }
            const grandParent = parent.parent;
            if (grandParent.type === "YAMLWithMeta") {
                return withinKey(grandParent);
            }
            return false;
        }
        return {
            YAMLDocument(node) {
                currentDocument = node;
            },
            YAMLScalar(node) {
                if (!isStringScalar(node)) {
                    return;
                }
                const option = withinKey(node) ? keyOption : valueOption;
                if (option.ignorePatterns.some((p) => p.test(node.value))) {
                    return;
                }
                if (option.prefer === "always") {
                    verifyAlways(node);
                }
                else {
                    verifyNever(node);
                }
            },
        };
    },
});
