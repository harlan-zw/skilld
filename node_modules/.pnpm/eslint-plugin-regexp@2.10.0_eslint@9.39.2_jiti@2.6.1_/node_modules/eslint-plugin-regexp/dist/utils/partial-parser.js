"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartialParser = void 0;
const refa_1 = require("refa");
const util_1 = require("./util");
class Context {
    constructor(alternative) {
        this.alternative = alternative;
        const ancestors = new Set();
        for (let n = alternative; n; n = n.parent) {
            ancestors.add(n);
        }
        this.ancestors = ancestors;
    }
}
class PartialParser {
    constructor(parser, options = {}) {
        this.nativeCache = new WeakMap();
        this.parser = parser;
        this.options = options;
    }
    parse(node, alternative) {
        switch (node.type) {
            case "Pattern":
                return {
                    type: "Expression",
                    alternatives: this.parseAlternatives(node.alternatives, new Context(alternative)),
                };
            case "Alternative":
                return {
                    type: "Expression",
                    alternatives: [
                        this.parseAlternative(node, new Context(alternative)),
                    ],
                };
            default:
                return {
                    type: "Expression",
                    alternatives: [
                        {
                            type: "Concatenation",
                            elements: [
                                this.parseElement(node, new Context(alternative)),
                            ],
                        },
                    ],
                };
        }
    }
    parseAlternatives(alternatives, context) {
        const ancestor = alternatives.find((a) => context.ancestors.has(a));
        if (ancestor) {
            return [this.parseAlternative(ancestor, context)];
        }
        const result = [];
        for (const a of alternatives) {
            result.push(...this.parser.parseElement(a, this.options).expression
                .alternatives);
        }
        return result;
    }
    parseAlternative(alternative, context) {
        return {
            type: "Concatenation",
            elements: alternative.elements.map((e) => this.parseElement(e, context)),
        };
    }
    parseStringAlternatives(alternatives, context) {
        const ancestor = alternatives.find((a) => context.ancestors.has(a));
        if (ancestor) {
            return [this.parseStringAlternative(ancestor)];
        }
        return alternatives.map((a) => this.parseStringAlternative(a));
    }
    parseStringAlternative(alternative) {
        return {
            type: "Concatenation",
            elements: alternative.elements.map((e) => this.nativeParseElement(e)),
        };
    }
    parseElement(element, context) {
        if (!context.ancestors.has(element)) {
            return this.nativeParseElement(element);
        }
        switch (element.type) {
            case "Assertion":
            case "Backreference":
            case "Character":
            case "CharacterSet":
            case "ExpressionCharacterClass":
                return this.nativeParseElement(element);
            case "CharacterClassRange":
                if (context.alternative === element.min) {
                    return this.nativeParseElement(context.alternative);
                }
                else if (context.alternative === element.max) {
                    return this.nativeParseElement(context.alternative);
                }
                return this.nativeParseElement(element);
            case "CharacterClass":
                return this.parseCharacterClass(element, context);
            case "ClassStringDisjunction":
                return {
                    type: "Alternation",
                    alternatives: this.parseStringAlternatives(element.alternatives, context),
                };
            case "Group":
            case "CapturingGroup":
                return {
                    type: "Alternation",
                    alternatives: this.parseAlternatives(element.alternatives, context),
                };
            case "Quantifier": {
                const alternatives = element.element.type === "Group" ||
                    element.element.type === "CapturingGroup"
                    ? this.parseAlternatives(element.element.alternatives, context)
                    : [
                        {
                            type: "Concatenation",
                            elements: [
                                this.parseElement(element.element, context),
                            ],
                        },
                    ];
                return {
                    type: "Quantifier",
                    min: element.min,
                    max: element.max,
                    lazy: !element.greedy,
                    alternatives,
                };
            }
            default:
                throw (0, util_1.assertNever)(element);
        }
    }
    parseCharacterClass(cc, context) {
        if (cc.negate ||
            !context.ancestors.has(cc) ||
            context.alternative.type === "Alternative") {
            return this.nativeParseElement(cc);
        }
        for (const e of cc.elements) {
            if (context.ancestors.has(e)) {
                return this.parseElement(e, context);
            }
        }
        return this.nativeParseElement(cc);
    }
    nativeParseElement(element) {
        let cached = this.nativeCache.get(element);
        if (!cached) {
            cached = this.nativeParseElementUncached(element);
            this.nativeCache.set(element, cached);
        }
        return cached;
    }
    nativeParseElementUncached(element) {
        if (element.type === "CharacterClassRange") {
            const range = {
                min: element.min.value,
                max: element.max.value,
            };
            return {
                type: "CharacterClass",
                characters: refa_1.JS.createCharSet([range], this.parser.flags),
            };
        }
        else if (element.type === "ClassStringDisjunction") {
            return {
                type: "Alternation",
                alternatives: element.alternatives.map((a) => this.parseStringAlternative(a)),
            };
        }
        const { expression } = this.parser.parseElement(element, this.options);
        if (expression.alternatives.length === 1) {
            const elements = expression.alternatives[0].elements;
            if (elements.length === 1) {
                return elements[0];
            }
        }
        return {
            type: "Alternation",
            alternatives: expression.alternatives,
        };
    }
}
exports.PartialParser = PartialParser;
