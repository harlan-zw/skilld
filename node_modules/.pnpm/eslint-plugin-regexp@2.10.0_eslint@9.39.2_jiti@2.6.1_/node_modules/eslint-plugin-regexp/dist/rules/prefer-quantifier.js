"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const regexp_ast_1 = require("../utils/regexp-ast");
class CharBuffer {
    constructor(target, allows) {
        this.target = target;
        this.elements = [target];
        this.allows = allows;
        this.times = 1;
        if (target.type === "CharacterSet") {
            if (target.kind === "any") {
                this.equalChar = (e) => e.type === "CharacterSet" && e.kind === "any";
            }
            else if (target.kind === "property") {
                this.equalChar = (e) => e.type === "CharacterSet" &&
                    e.kind === "property" &&
                    e.key === target.key &&
                    e.value === target.value &&
                    e.negate === target.negate;
            }
            else {
                this.equalChar = (e) => e.type === "CharacterSet" &&
                    e.kind === target.kind &&
                    e.negate === target.negate;
            }
        }
        else {
            this.equalChar = (e) => e.type === "Character" && e.value === target.value;
        }
    }
    addElement(element) {
        this.elements.push(element);
        this.times += 1;
    }
    get bufferRawContents() {
        return this.elements.reduce((acc, element) => acc + element.raw, "");
    }
    isValid() {
        if (this.elements.length < 2) {
            return true;
        }
        if (this.allows.includes(this.bufferRawContents)) {
            return true;
        }
        let charKind = null;
        for (const element of this.elements) {
            if (element.type === "Character") {
                if (charKind == null) {
                    if ((0, utils_1.isDigit)(element.value)) {
                        charKind = "digit";
                    }
                    else if ((0, utils_1.isLetter)(element.value)) {
                        charKind = "letter";
                    }
                    else if ((0, utils_1.isSymbol)(element.value)) {
                        charKind = "symbol";
                    }
                    else {
                        return false;
                    }
                }
            }
            else {
                return false;
            }
        }
        if (charKind === "digit" ||
            (charKind === "letter" && this.elements.length <= 2) ||
            (charKind === "symbol" && this.elements.length <= 3)) {
            return true;
        }
        return false;
    }
    getQuantifier() {
        return (0, regexp_ast_1.quantToString)({ min: this.times, max: this.times });
    }
}
exports.default = (0, utils_1.createRule)("prefer-quantifier", {
    meta: {
        docs: {
            description: "enforce using quantifier",
            category: "Best Practices",
            recommended: false,
        },
        fixable: "code",
        schema: [
            {
                type: "object",
                properties: {
                    allows: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            unexpected: "Unexpected consecutive same {{type}}. Use '{{quantifier}}' instead.",
        },
        type: "suggestion",
    },
    create(context) {
        var _a, _b;
        const allows = (_b = (_a = context.options[0]) === null || _a === void 0 ? void 0 : _a.allows) !== null && _b !== void 0 ? _b : [];
        function createVisitor({ node, patternSource, }) {
            return {
                onAlternativeEnter(aNode) {
                    let charBuffer = null;
                    for (const element of aNode.elements) {
                        if (element.type === "CharacterSet" ||
                            element.type === "Character") {
                            if (charBuffer && charBuffer.equalChar(element)) {
                                charBuffer.addElement(element);
                            }
                            else {
                                validateBuffer(charBuffer);
                                charBuffer = new CharBuffer(element, allows);
                            }
                        }
                        else {
                            validateBuffer(charBuffer);
                            charBuffer = null;
                        }
                    }
                    validateBuffer(charBuffer);
                    function validateBuffer(buffer) {
                        if (!buffer || buffer.isValid()) {
                            return;
                        }
                        const bufferRange = {
                            start: buffer.elements[0].start,
                            end: buffer.elements[buffer.elements.length - 1]
                                .end,
                        };
                        context.report({
                            node,
                            loc: patternSource.getAstLocation(bufferRange),
                            messageId: "unexpected",
                            data: {
                                type: buffer.target.type === "Character"
                                    ? "characters"
                                    : buffer.target.kind === "any"
                                        ? "any characters"
                                        : "character class escapes",
                                quantifier: buffer.getQuantifier(),
                            },
                            fix(fixer) {
                                const range = patternSource.getReplaceRange(bufferRange);
                                if (!range) {
                                    return null;
                                }
                                return range.replace(fixer, buffer.target.raw + buffer.getQuantifier());
                            },
                        });
                    }
                },
            };
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
