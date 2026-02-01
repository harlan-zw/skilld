"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const char_ranges_1 = require("../utils/char-ranges");
const mention_1 = require("../utils/mention");
exports.default = (0, utils_1.createRule)("prefer-range", {
    meta: {
        docs: {
            description: "enforce using character class range",
            category: "Best Practices",
            recommended: true,
        },
        fixable: "code",
        schema: [
            {
                type: "object",
                properties: {
                    target: (0, char_ranges_1.getAllowedCharValueSchema)(),
                },
                additionalProperties: false,
            },
        ],
        messages: {
            unexpected: "Unexpected multiple adjacent characters. Use {{range}} instead.",
        },
        type: "suggestion",
    },
    create(context) {
        var _a;
        const allowedRanges = (0, char_ranges_1.getAllowedCharRanges)((_a = context.options[0]) === null || _a === void 0 ? void 0 : _a.target, context);
        const sourceCode = context.sourceCode;
        function createVisitor(regexpContext) {
            const { node, patternSource } = regexpContext;
            function getReportRanges(nodes) {
                const ranges = [];
                for (const reportNode of nodes) {
                    const reportRange = patternSource.getReplaceRange(reportNode);
                    if (!reportRange) {
                        return null;
                    }
                    const range = ranges.find((r) => r.range[0] <= reportRange.range[1] &&
                        reportRange.range[0] <= r.range[1]);
                    if (range) {
                        range.range[0] = Math.min(range.range[0], reportRange.range[0]);
                        range.range[1] = Math.max(range.range[1], reportRange.range[1]);
                    }
                    else {
                        ranges.push(reportRange);
                    }
                }
                return ranges;
            }
            return {
                onCharacterClassEnter(ccNode) {
                    const groups = [];
                    for (const element of ccNode.elements) {
                        let data;
                        if (element.type === "Character") {
                            if ((0, char_ranges_1.inRange)(allowedRanges, element.value)) {
                                data = { min: element, max: element };
                            }
                            else {
                                continue;
                            }
                        }
                        else if (element.type === "CharacterClassRange") {
                            if ((0, char_ranges_1.inRange)(allowedRanges, element.min.value, element.max.value)) {
                                data = { min: element.min, max: element.max };
                            }
                            else {
                                continue;
                            }
                        }
                        else {
                            continue;
                        }
                        const group = groups.find((gp) => {
                            const adjacent = gp.min.value - 1 <= data.max.value &&
                                data.min.value <= gp.max.value + 1;
                            if (!adjacent) {
                                return false;
                            }
                            const min = Math.min(gp.min.value, data.min.value);
                            const max = Math.max(gp.max.value, data.max.value);
                            return (0, char_ranges_1.inRange)(allowedRanges, min, max);
                        });
                        if (group) {
                            if (data.min.value < group.min.value) {
                                group.min = data.min;
                            }
                            if (group.max.value < data.max.value) {
                                group.max = data.max;
                            }
                            group.nodes.push(element);
                        }
                        else {
                            groups.push({
                                ...data,
                                nodes: [element],
                            });
                        }
                    }
                    for (const group of groups) {
                        const charCount = group.max.value - group.min.value + 1;
                        if (charCount >= 4 && group.nodes.length > 1) {
                            const newText = `${group.min.raw}-${group.max.raw}`;
                            const ranges = getReportRanges(group.nodes);
                            if (!ranges) {
                                context.report({
                                    node,
                                    loc: node.loc,
                                    messageId: "unexpected",
                                    data: { range: (0, mention_1.mention)(newText) },
                                });
                                continue;
                            }
                            for (const range of ranges) {
                                context.report({
                                    node,
                                    loc: range.getAstLocation(sourceCode),
                                    messageId: "unexpected",
                                    data: { range: (0, mention_1.mention)(newText) },
                                    fix: (fixer) => {
                                        return ranges.map((r, index) => {
                                            if (index === 0) {
                                                return r.replace(fixer, newText);
                                            }
                                            return r.remove(fixer);
                                        });
                                    },
                                });
                            }
                        }
                    }
                },
            };
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
