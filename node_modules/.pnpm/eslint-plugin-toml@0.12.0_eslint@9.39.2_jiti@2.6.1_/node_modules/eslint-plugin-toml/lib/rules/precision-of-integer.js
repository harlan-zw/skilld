"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const compat_1 = require("../utils/compat");
const bit_1 = require("../utils/bit");
const cacheMaxValues = {};
function getMaxValues(bit) {
    if (cacheMaxValues[bit]) {
        return cacheMaxValues[bit];
    }
    return (cacheMaxValues[bit] = (0, bit_1.maxBitToMaxValues)(bit));
}
exports.default = (0, utils_1.createRule)("precision-of-integer", {
    meta: {
        docs: {
            description: "disallow precision of integer greater than the specified value.",
            categories: ["recommended", "standard"],
            extensionRule: false,
        },
        schema: [
            {
                type: "object",
                properties: {
                    maxBit: {
                        type: "number",
                        minimum: 1,
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            over: "Integers with precision greater than {{maxBit}}-bit are forbidden.",
        },
        type: "problem",
    },
    create(context) {
        const sourceCode = (0, compat_1.getSourceCode)(context);
        if (!sourceCode.parserServices?.isTOML) {
            return {};
        }
        const maxBit = context.options[0]?.maxBit ?? 64;
        const maxValues = getMaxValues(maxBit);
        function verifyMaxValue(node, numText, max) {
            const num = numText.replace(/^0+/, "").toLowerCase();
            if (num.length < max.length) {
                return;
            }
            if (num.length === max.length && num <= max) {
                return;
            }
            context.report({
                node,
                messageId: "over",
                data: {
                    maxBit,
                },
            });
        }
        function verifyText(node) {
            const text = node.number;
            if (text.startsWith("0")) {
                const maybeMark = text[1];
                if (maybeMark === "x") {
                    verifyMaxValue(node, text.slice(2), maxValues["0x"]);
                    return;
                }
                else if (maybeMark === "o") {
                    verifyMaxValue(node, text.slice(2), maxValues["0o"]);
                    return;
                }
                else if (maybeMark === "b") {
                    verifyMaxValue(node, text.slice(2), maxValues["0b"]);
                    return;
                }
            }
            else if (text.startsWith("-")) {
                verifyMaxValue(node, text.slice(1), maxValues["-"]);
                return;
            }
            else if (text.startsWith("+")) {
                verifyMaxValue(node, text.slice(1), maxValues["+"]);
                return;
            }
            verifyMaxValue(node, text, maxValues["+"]);
        }
        return {
            TOMLValue(node) {
                if (node.kind === "integer") {
                    verifyText(node);
                }
            },
        };
    },
});
