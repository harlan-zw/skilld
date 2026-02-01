"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../utils/index");
const compat_1 = require("../utils/compat");
exports.default = (0, index_1.createRule)("no-trailing-zeros", {
    meta: {
        docs: {
            description: "disallow trailing zeros for floats",
            categories: null,
            extensionRule: false,
            layout: true,
        },
        fixable: "code",
        schema: [],
        messages: {
            wrongZeros: "Trailing zeros are not allowed, fix to `{{fixed}}`.",
        },
        type: "layout",
    },
    create(context) {
        var _a;
        const sourceCode = (0, compat_1.getSourceCode)(context);
        if (!((_a = sourceCode.parserServices) === null || _a === void 0 ? void 0 : _a.isYAML)) {
            return {};
        }
        return {
            YAMLScalar(node) {
                if (node.style !== "plain") {
                    return;
                }
                else if (typeof node.value !== "number") {
                    return;
                }
                const floating = parseFloatingPoint(node.strValue);
                if (!floating) {
                    return;
                }
                let { decimalPart } = floating;
                while (decimalPart.endsWith("_")) {
                    decimalPart = decimalPart.slice(0, -1);
                }
                if (!decimalPart.endsWith("0")) {
                    return;
                }
                while (decimalPart.endsWith("0")) {
                    decimalPart = decimalPart.slice(0, -1);
                    while (decimalPart.endsWith("_")) {
                        decimalPart = decimalPart.slice(0, -1);
                    }
                }
                const fixed = decimalPart
                    ? `${floating.sign}${floating.intPart}.${decimalPart}${floating.expPart}`
                    : `${floating.sign}${floating.intPart || "0"}${floating.expPart}`;
                context.report({
                    node,
                    messageId: "wrongZeros",
                    data: {
                        fixed,
                    },
                    fix(fixer) {
                        return fixer.replaceText(node, fixed);
                    },
                });
            },
        };
    },
});
function parseFloatingPoint(str) {
    const parts = str.split(".");
    if (parts.length !== 2) {
        return null;
    }
    let decimalPart, expPart, intPart, sign;
    const expIndex = parts[1].search(/e/iu);
    if (expIndex >= 0) {
        decimalPart = parts[1].slice(0, expIndex);
        expPart = parts[1].slice(expIndex);
    }
    else {
        decimalPart = parts[1];
        expPart = "";
    }
    if (parts[0].startsWith("-") || parts[0].startsWith("+")) {
        sign = parts[0][0];
        intPart = parts[0].slice(1);
    }
    else {
        sign = "";
        intPart = parts[0];
    }
    return {
        sign,
        intPart,
        decimalPart,
        expPart,
    };
}
