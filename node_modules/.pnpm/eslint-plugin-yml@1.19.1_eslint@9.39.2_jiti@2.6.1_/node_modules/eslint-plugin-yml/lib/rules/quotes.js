"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../utils/index");
const compat_1 = require("../utils/compat");
exports.default = (0, index_1.createRule)("quotes", {
    meta: {
        docs: {
            description: "enforce the consistent use of either double, or single quotes",
            categories: ["standard"],
            extensionRule: false,
            layout: true,
        },
        fixable: "code",
        schema: [
            {
                type: "object",
                properties: {
                    prefer: { enum: ["double", "single"] },
                    avoidEscape: { type: "boolean" },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            wrongQuotes: "Strings must use {{description}}.",
        },
        type: "layout",
    },
    create(context) {
        var _a;
        const sourceCode = (0, compat_1.getSourceCode)(context);
        if (!((_a = sourceCode.parserServices) === null || _a === void 0 ? void 0 : _a.isYAML)) {
            return {};
        }
        const objectOption = context.options[0] || {};
        const prefer = objectOption.prefer || "double";
        const avoidEscape = objectOption.avoidEscape !== false;
        return {
            YAMLScalar(node) {
                let description;
                if (node.style === "double-quoted" && prefer === "single") {
                    if (avoidEscape && node.strValue.includes("'")) {
                        return;
                    }
                    let preChar = "";
                    for (const char of node.raw) {
                        if (preChar === "\\") {
                            if (char === "\\" || char === '"') {
                                preChar = "";
                                continue;
                            }
                            return;
                        }
                        preChar = char;
                    }
                    description = "singlequote";
                }
                else if (node.style === "single-quoted" && prefer === "double") {
                    if (avoidEscape &&
                        (node.strValue.includes('"') || node.strValue.includes("\\"))) {
                        return;
                    }
                    description = "doublequote";
                }
                else {
                    return;
                }
                context.report({
                    node,
                    messageId: "wrongQuotes",
                    data: {
                        description,
                    },
                    fix(fixer) {
                        const text = node.raw.slice(1, -1);
                        if (prefer === "double") {
                            return fixer.replaceText(node, `"${text
                                .replace(/''/gu, "'")
                                .replace(/(["\\])/gu, "\\$1")}"`);
                        }
                        return fixer.replaceText(node, `'${text
                            .replace(/\\(["\\])/gu, "$1")
                            .replace(/'/gu, "''")}'`);
                    },
                });
            },
        };
    },
});
