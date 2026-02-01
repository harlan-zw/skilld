"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllowedCharRanges = getAllowedCharRanges;
exports.getAllowedCharValueSchema = getAllowedCharValueSchema;
exports.inRange = inRange;
const unicode_1 = require("./unicode");
const ALL_RANGES = [{ min: 0, max: 0x10ffff }];
const ALPHANUMERIC_RANGES = [
    { min: unicode_1.CP_DIGIT_ZERO, max: unicode_1.CP_DIGIT_NINE },
    { min: unicode_1.CP_CAPITAL_A, max: unicode_1.CP_CAPITAL_Z },
    { min: unicode_1.CP_SMALL_A, max: unicode_1.CP_SMALL_Z },
];
function getAllowedCharRanges(allowedByRuleOption, context) {
    var _a;
    let target = allowedByRuleOption ||
        ((_a = context.settings.regexp) === null || _a === void 0 ? void 0 : _a.allowedCharacterRanges);
    if (!target) {
        return ALPHANUMERIC_RANGES;
    }
    if (typeof target === "string") {
        target = [target];
    }
    const allowed = [];
    for (const range of target) {
        if (range === "all") {
            return ALL_RANGES;
        }
        else if (range === "alphanumeric") {
            if (target.length === 1) {
                return ALPHANUMERIC_RANGES;
            }
            allowed.push(...ALPHANUMERIC_RANGES);
        }
        else {
            const chars = [...range];
            if (chars.length !== 3 || chars[1] !== "-") {
                throw new Error(`Invalid format: The range ${JSON.stringify(range)} is not of the form \`<char>-<char>\`.`);
            }
            const min = chars[0].codePointAt(0);
            const max = chars[2].codePointAt(0);
            allowed.push({ min, max });
        }
    }
    return allowed;
}
function getAllowedCharValueSchema() {
    return {
        anyOf: [
            { enum: ["all", "alphanumeric"] },
            {
                type: "array",
                items: [{ enum: ["all", "alphanumeric"] }],
                minItems: 1,
                additionalItems: false,
            },
            {
                type: "array",
                items: {
                    anyOf: [
                        { const: "alphanumeric" },
                        {
                            type: "string",
                            pattern: /^(?:[\ud800-\udbff][\udc00-\udfff]|[^\ud800-\udfff])-(?:[\ud800-\udbff][\udc00-\udfff]|[^\ud800-\udfff])$/
                                .source,
                        },
                    ],
                },
                uniqueItems: true,
                minItems: 1,
                additionalItems: false,
            },
        ],
    };
}
function inRange(ranges, min, max = min) {
    for (const range of ranges) {
        if (range.min <= min && max <= range.max) {
            return true;
        }
    }
    return false;
}
