"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexpp_1 = require("@eslint-community/regexpp");
const utils_1 = require("../utils");
const mention_1 = require("../utils/mention");
const regex_syntax_1 = require("../utils/regex-syntax");
const validator = new regexpp_1.RegExpValidator({ strict: true, ecmaVersion: 2020 });
function validateRegExpPattern(pattern, flags) {
    try {
        validator.validatePattern(pattern, undefined, undefined, flags);
        return null;
    }
    catch (err) {
        return err instanceof Error ? err.message : null;
    }
}
const CHARACTER_CLASS_SYNTAX_CHARACTERS = new Set("\\/()[]{}^$.|-+*?".split(""));
const SYNTAX_CHARACTERS = new Set("\\/()[]{}^$.|+*?".split(""));
exports.default = (0, utils_1.createRule)("strict", {
    meta: {
        docs: {
            description: "disallow not strictly valid regular expressions",
            category: "Possible Errors",
            recommended: true,
        },
        fixable: "code",
        schema: [],
        messages: {
            invalidControlEscape: "Invalid or incomplete control escape sequence. Either use a valid control escape sequence or escaping the standalone backslash.",
            incompleteEscapeSequence: "Incomplete escape sequence {{expr}}. Either use a valid escape sequence or remove the useless escaping.",
            invalidPropertyEscape: "Invalid property escape sequence {{expr}}. Either use a valid property escape sequence or remove the useless escaping.",
            incompleteBackreference: "Incomplete backreference {{expr}}. Either use a valid backreference or remove the useless escaping.",
            unescapedSourceCharacter: "Unescaped source character {{expr}}.",
            octalEscape: "Invalid legacy octal escape sequence {{expr}}. Use a hexadecimal escape instead.",
            uselessEscape: "Useless identity escapes with non-syntax characters are forbidden.",
            invalidRange: "Invalid character class range. A character set cannot be the minimum or maximum of a character class range. Either escape the `-` or fix the character class range.",
            quantifiedAssertion: "Assertion are not allowed to be quantified directly.",
            regexMessage: "{{message}}.",
            hexEscapeSuggestion: "Replace the octal escape with a hexadecimal escape.",
        },
        type: "suggestion",
        hasSuggestions: true,
    },
    create(context) {
        function createVisitor(regexpContext) {
            const { node, flags, pattern, getRegexpLocation, fixReplaceNode } = regexpContext;
            if (flags.unicode || flags.unicodeSets) {
                return {};
            }
            let reported = false;
            let hasNamedBackreference = false;
            function report(messageId, element, fix) {
                reported = true;
                if (fix && typeof fix === "object") {
                    context.report({
                        node,
                        loc: getRegexpLocation(element),
                        messageId,
                        data: {
                            expr: (0, mention_1.mention)(element),
                        },
                        suggest: [
                            {
                                messageId: fix.messageId,
                                fix: fixReplaceNode(element, fix.fix),
                            },
                        ],
                    });
                }
                else {
                    context.report({
                        node,
                        loc: getRegexpLocation(element),
                        messageId,
                        data: {
                            expr: (0, mention_1.mention)(element),
                        },
                        fix: fix ? fixReplaceNode(element, fix) : null,
                    });
                }
            }
            return {
                onCharacterEnter(cNode) {
                    if (cNode.raw === "\\") {
                        report("invalidControlEscape", cNode);
                        return;
                    }
                    if (cNode.raw === "\\u" || cNode.raw === "\\x") {
                        report("incompleteEscapeSequence", cNode);
                        return;
                    }
                    if (cNode.raw === "\\p" || cNode.raw === "\\P") {
                        report("invalidPropertyEscape", cNode);
                        return;
                    }
                    if (cNode.value !== 0 && (0, regex_syntax_1.isOctalEscape)(cNode.raw)) {
                        report("octalEscape", cNode, {
                            fix: `\\x${cNode.value
                                .toString(16)
                                .padStart(2, "0")}`,
                            messageId: "hexEscapeSuggestion",
                        });
                        return;
                    }
                    const insideCharClass = cNode.parent.type === "CharacterClass" ||
                        cNode.parent.type === "CharacterClassRange";
                    if (!insideCharClass) {
                        if (cNode.raw === "\\k") {
                            report("incompleteBackreference", cNode);
                            return;
                        }
                        if (cNode.raw === "{" ||
                            cNode.raw === "}" ||
                            cNode.raw === "]") {
                            report("unescapedSourceCharacter", cNode, `\\${cNode.raw}`);
                            return;
                        }
                    }
                    if ((0, regex_syntax_1.isEscapeSequence)(cNode.raw)) {
                        return;
                    }
                    if (cNode.raw.startsWith("\\")) {
                        const identity = cNode.raw.slice(1);
                        const syntaxChars = insideCharClass
                            ? CHARACTER_CLASS_SYNTAX_CHARACTERS
                            : SYNTAX_CHARACTERS;
                        if (cNode.value === identity.charCodeAt(0) &&
                            !syntaxChars.has(identity)) {
                            report("uselessEscape", cNode, identity);
                        }
                    }
                },
                onCharacterClassEnter(ccNode) {
                    for (let i = 0; i < ccNode.elements.length; i++) {
                        const current = ccNode.elements[i];
                        if (current.type === "CharacterSet") {
                            const next = ccNode.elements[i + 1];
                            const nextNext = ccNode.elements[i + 2];
                            if (next && next.raw === "-" && nextNext) {
                                report("invalidRange", current);
                                return;
                            }
                            const prev = ccNode.elements[i - 1];
                            const prevPrev = ccNode.elements[i - 2];
                            if (prev &&
                                prev.raw === "-" &&
                                prevPrev &&
                                prevPrev.type !== "CharacterClassRange") {
                                report("invalidRange", current);
                                return;
                            }
                        }
                    }
                },
                onQuantifierEnter(qNode) {
                    if (qNode.element.type === "Assertion") {
                        report("quantifiedAssertion", qNode, `(?:${qNode.element.raw})${qNode.raw.slice(qNode.element.end - qNode.start)}`);
                    }
                },
                onBackreferenceEnter(bNode) {
                    if (typeof bNode.ref === "string") {
                        hasNamedBackreference = true;
                    }
                },
                onPatternLeave() {
                    if (hasNamedBackreference) {
                        return;
                    }
                    if (!reported) {
                        const message = validateRegExpPattern(pattern, flags);
                        if (message) {
                            context.report({
                                node,
                                messageId: "regexMessage",
                                data: {
                                    message,
                                },
                            });
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
