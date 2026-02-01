"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const escape_string_regexp_1 = __importDefault(require("escape-string-regexp"));
const index_1 = require("../utils/index");
const compat_1 = require("../utils/compat");
function escapeText(s) {
    return `(?:${(0, escape_string_regexp_1.default)(s)})`;
}
function escapeAndRepeat(s) {
    return `${escapeText(s)}+`;
}
function createExceptionsPattern(exceptions) {
    let pattern = "";
    if (exceptions.length === 0) {
        pattern += "\\s";
    }
    else {
        pattern += "(?:\\s|";
        if (exceptions.length === 1) {
            pattern += escapeAndRepeat(exceptions[0]);
        }
        else {
            pattern += "(?:";
            pattern += exceptions.map(escapeAndRepeat).join("|");
            pattern += ")";
        }
        pattern += "$)";
    }
    return pattern;
}
function createAlwaysStylePattern(markers, exceptions) {
    let pattern = "^";
    if (markers.length === 1) {
        pattern += escapeText(markers[0]);
    }
    else {
        pattern += "(?:";
        pattern += markers.map(escapeText).join("|");
        pattern += ")";
    }
    pattern += "?";
    pattern += createExceptionsPattern(exceptions);
    return new RegExp(pattern, "u");
}
function createNeverStylePattern(markers) {
    const pattern = `^(${markers.map(escapeText).join("|")})?[ \t]+`;
    return new RegExp(pattern, "u");
}
exports.default = (0, index_1.createRule)("spaced-comment", {
    meta: {
        docs: {
            description: "enforce consistent spacing after the `#` in a comment",
            categories: ["standard"],
            extensionRule: "spaced-comment",
            layout: false,
        },
        fixable: "whitespace",
        schema: [
            {
                enum: ["always", "never"],
            },
            {
                type: "object",
                properties: {
                    exceptions: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                    },
                    markers: {
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
            unexpectedSpaceAfterMarker: "Unexpected space after marker ({{refChar}}) in comment.",
            expectedExceptionAfter: "Expected exception block, space after '{{refChar}}' in comment.",
            unexpectedSpaceAfter: "Unexpected space after '{{refChar}}' in comment.",
            expectedSpaceAfter: "Expected space after '{{refChar}}' in comment.",
        },
        type: "suggestion",
    },
    create(context) {
        var _a;
        const sourceCode = (0, compat_1.getSourceCode)(context);
        if (!((_a = sourceCode.parserServices) === null || _a === void 0 ? void 0 : _a.isYAML)) {
            return {};
        }
        const requireSpace = context.options[0] !== "never";
        const config = context.options[1] || {};
        const markers = config.markers || [];
        const exceptions = config.exceptions || [];
        const styleRules = {
            beginRegex: requireSpace
                ? createAlwaysStylePattern(markers, exceptions)
                : createNeverStylePattern(markers),
            hasExceptions: exceptions.length > 0,
            captureMarker: new RegExp(`^(${markers.map(escapeText).join("|")})`, "u"),
            markers: new Set(markers),
        };
        function reportBegin(node, messageId, match, refChar) {
            context.report({
                node,
                fix(fixer) {
                    const start = node.range[0];
                    let end = start + 1;
                    if (requireSpace) {
                        if (match) {
                            end += match[0].length;
                        }
                        return fixer.insertTextAfterRange([start, end], " ");
                    }
                    end += match[0].length;
                    return fixer.replaceTextRange([start, end], `#${(match === null || match === void 0 ? void 0 : match[1]) ? match[1] : ""}`);
                },
                messageId,
                data: { refChar },
            });
        }
        function checkCommentForSpace(node) {
            if (node.value.length === 0 || styleRules.markers.has(node.value)) {
                return;
            }
            const beginMatch = styleRules.beginRegex.exec(node.value);
            if (requireSpace) {
                if (!beginMatch) {
                    const hasMarker = styleRules.captureMarker.exec(node.value);
                    const marker = hasMarker ? `#${hasMarker[0]}` : "#";
                    if (styleRules.hasExceptions) {
                        reportBegin(node, "expectedExceptionAfter", hasMarker, marker);
                    }
                    else {
                        reportBegin(node, "expectedSpaceAfter", hasMarker, marker);
                    }
                }
            }
            else {
                if (beginMatch) {
                    if (!beginMatch[1]) {
                        reportBegin(node, "unexpectedSpaceAfter", beginMatch, "#");
                    }
                    else {
                        reportBegin(node, "unexpectedSpaceAfterMarker", beginMatch, beginMatch[1]);
                    }
                }
            }
        }
        return {
            Program() {
                const comments = sourceCode.getAllComments();
                comments.forEach(checkCommentForSpace);
            },
        };
    },
});
