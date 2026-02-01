"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const segmenter = new Intl.Segmenter();
exports.default = (0, utils_1.createRule)("grapheme-string-literal", {
    meta: {
        docs: {
            description: "enforce single grapheme in string literal",
            category: "Stylistic Issues",
            recommended: false,
        },
        schema: [],
        messages: {
            onlySingleCharacters: "Only single characters and graphemes are allowed inside character classes. Use regular alternatives (e.g. `{{alternatives}}`) for strings instead.",
        },
        type: "suggestion",
    },
    create(context) {
        function createVisitor(regexpContext) {
            const { node, getRegexpLocation } = regexpContext;
            function isMultipleGraphemes(saNode) {
                if (saNode.elements.length <= 1)
                    return false;
                const string = String.fromCodePoint(...saNode.elements.map((element) => element.value));
                const segments = [...segmenter.segment(string)];
                return segments.length > 1;
            }
            function buildAlternativeExample(saNode) {
                const alternativeRaws = saNode.parent.alternatives
                    .filter(isMultipleGraphemes)
                    .map((alt) => alt.raw);
                return `(?:${alternativeRaws.join("|")}|[...])`;
            }
            return {
                onStringAlternativeEnter(saNode) {
                    if (!isMultipleGraphemes(saNode))
                        return;
                    context.report({
                        node,
                        loc: getRegexpLocation(saNode),
                        messageId: "onlySingleCharacters",
                        data: {
                            alternatives: buildAlternativeExample(saNode),
                        },
                    });
                },
            };
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
