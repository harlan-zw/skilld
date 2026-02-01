"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../utils/index");
const ast_utils_1 = require("../utils/ast-utils");
const compat_1 = require("../utils/compat");
function containsLineTerminator(str) {
    return /[\n\r\u2028\u2029]/u.test(str);
}
function last(arr) {
    return arr[arr.length - 1];
}
function isSingleLine(node) {
    return node.loc.end.line === node.loc.start.line;
}
function isSingleLineProperties(properties) {
    const [firstProp] = properties;
    const lastProp = last(properties);
    return firstProp.loc.start.line === lastProp.loc.end.line;
}
function initOptionProperty(fromOptions) {
    const mode = fromOptions.mode || "strict";
    let beforeColon, afterColon;
    if (typeof fromOptions.beforeColon !== "undefined") {
        beforeColon = fromOptions.beforeColon;
    }
    else {
        beforeColon = false;
    }
    if (typeof fromOptions.afterColon !== "undefined") {
        afterColon = fromOptions.afterColon;
    }
    else {
        afterColon = true;
    }
    let align = undefined;
    if (typeof fromOptions.align !== "undefined") {
        if (typeof fromOptions.align === "object") {
            align = fromOptions.align;
        }
        else {
            align = {
                on: fromOptions.align,
                mode,
                beforeColon,
                afterColon,
            };
        }
    }
    return {
        mode,
        beforeColon,
        afterColon,
        align,
    };
}
function initOptions(fromOptions) {
    let align, multiLine, singleLine;
    if (typeof fromOptions.align === "object") {
        align = Object.assign(Object.assign({}, initOptionProperty(fromOptions.align)), { on: fromOptions.align.on || "colon", mode: fromOptions.align.mode || "strict" });
        multiLine = initOptionProperty(fromOptions.multiLine || fromOptions);
        singleLine = initOptionProperty(fromOptions.singleLine || fromOptions);
    }
    else {
        multiLine = initOptionProperty(fromOptions.multiLine || fromOptions);
        singleLine = initOptionProperty(fromOptions.singleLine || fromOptions);
        if (multiLine.align) {
            align = {
                on: multiLine.align.on,
                mode: multiLine.align.mode || multiLine.mode,
                beforeColon: multiLine.align.beforeColon,
                afterColon: multiLine.align.afterColon,
            };
        }
    }
    return {
        align,
        multiLine,
        singleLine,
    };
}
const ON_SCHEMA = {
    enum: ["colon", "value"],
};
const OBJECT_WITHOUT_ON_SCHEMA = {
    type: "object",
    properties: {
        mode: {
            enum: ["strict", "minimum"],
        },
        beforeColon: {
            type: "boolean",
        },
        afterColon: {
            type: "boolean",
        },
    },
    additionalProperties: false,
};
const ALIGN_OBJECT_SCHEMA = {
    type: "object",
    properties: Object.assign({ on: ON_SCHEMA }, OBJECT_WITHOUT_ON_SCHEMA.properties),
    additionalProperties: false,
};
exports.default = (0, index_1.createRule)("key-spacing", {
    meta: {
        docs: {
            description: "enforce consistent spacing between keys and values in mapping pairs",
            categories: ["standard"],
            extensionRule: "key-spacing",
            layout: true,
        },
        fixable: "whitespace",
        schema: [
            {
                anyOf: [
                    {
                        type: "object",
                        properties: Object.assign({ align: {
                                anyOf: [ON_SCHEMA, ALIGN_OBJECT_SCHEMA],
                            } }, OBJECT_WITHOUT_ON_SCHEMA.properties),
                        additionalProperties: false,
                    },
                    {
                        type: "object",
                        properties: {
                            singleLine: OBJECT_WITHOUT_ON_SCHEMA,
                            multiLine: {
                                type: "object",
                                properties: Object.assign({ align: {
                                        anyOf: [ON_SCHEMA, ALIGN_OBJECT_SCHEMA],
                                    } }, OBJECT_WITHOUT_ON_SCHEMA.properties),
                                additionalProperties: false,
                            },
                        },
                        additionalProperties: false,
                    },
                    {
                        type: "object",
                        properties: {
                            singleLine: OBJECT_WITHOUT_ON_SCHEMA,
                            multiLine: OBJECT_WITHOUT_ON_SCHEMA,
                            align: ALIGN_OBJECT_SCHEMA,
                        },
                        additionalProperties: false,
                    },
                ],
            },
        ],
        messages: {
            extraKey: "Extra space after key '{{key}}'.",
            extraValue: "Extra space before value for key '{{key}}'.",
            missingKey: "Missing space after key '{{key}}'.",
            missingValue: "Missing space before value for key '{{key}}'.",
        },
        type: "layout",
    },
    create,
});
function create(context) {
    var _a;
    const sourceCode = (0, compat_1.getSourceCode)(context);
    if (!((_a = sourceCode.parserServices) === null || _a === void 0 ? void 0 : _a.isYAML)) {
        return {};
    }
    const options = context.options[0] || {};
    const { multiLine: multiLineOptions, singleLine: singleLineOptions, align: alignmentOptions, } = initOptions(options);
    function isKeyValueProperty(property) {
        return property.key != null && property.value != null;
    }
    function getLastTokenBeforeColon(node) {
        const colonToken = sourceCode.getTokenAfter(node, ast_utils_1.isColon);
        return sourceCode.getTokenBefore(colonToken);
    }
    function getNextColon(node) {
        return sourceCode.getTokenAfter(node, ast_utils_1.isColon);
    }
    function getKey(property) {
        const key = property.key;
        if (key.type !== "YAMLScalar") {
            return sourceCode.getText().slice(key.range[0], key.range[1]);
        }
        return String(key.value);
    }
    function canChangeSpaces(property, side) {
        if (side === "value") {
            const before = sourceCode.getTokenBefore(property.key);
            if ((0, ast_utils_1.isQuestion)(before) &&
                property.key.loc.end.line < property.value.loc.start.line) {
                return false;
            }
        }
        return true;
    }
    function canRemoveSpaces(property, side, whitespace) {
        if (side === "key") {
            if (property.key.type === "YAMLAlias") {
                return false;
            }
            if (property.key.type === "YAMLWithMeta" && property.key.value == null) {
                return false;
            }
            if (property.parent.style === "block") {
                if (containsLineTerminator(whitespace)) {
                    const before = sourceCode.getTokenBefore(property.key);
                    if ((0, ast_utils_1.isQuestion)(before)) {
                        return false;
                    }
                }
            }
        }
        else {
            if (property.parent.style === "block") {
                if (property.parent.parent.type !== "YAMLSequence" ||
                    property.parent.parent.style !== "flow") {
                    return false;
                }
            }
            const keyValue = property.key.type === "YAMLWithMeta"
                ? property.key.value
                : property.key;
            if (!keyValue) {
                return false;
            }
            if (keyValue.type === "YAMLScalar") {
                if (keyValue.style === "plain") {
                    return false;
                }
            }
            if (keyValue.type === "YAMLAlias") {
                return false;
            }
            if (property.value.type === "YAMLSequence" &&
                property.value.style === "block") {
                return false;
            }
            if (containsLineTerminator(whitespace)) {
                if (property.value.type === "YAMLMapping" &&
                    property.value.style === "block") {
                    return false;
                }
            }
        }
        return true;
    }
    function canInsertSpaces(property, side) {
        if (side === "key") {
            if (property.key.type === "YAMLScalar") {
                if (property.key.style === "plain" &&
                    typeof property.key.value === "string" &&
                    property.key.value.endsWith(":")) {
                    return false;
                }
                if (property.key.style === "folded" ||
                    property.key.style === "literal") {
                    return false;
                }
            }
        }
        return true;
    }
    function report(property, side, whitespace, expected, mode) {
        const diff = whitespace.length - expected;
        const nextColon = getNextColon(property.key);
        const tokenBeforeColon = sourceCode.getTokenBefore(nextColon, {
            includeComments: true,
        });
        const tokenAfterColon = sourceCode.getTokenAfter(nextColon, {
            includeComments: true,
        });
        const invalid = (mode === "strict"
            ? diff !== 0
            :
                diff < 0 || (diff > 0 && expected === 0)) &&
            !(expected && containsLineTerminator(whitespace));
        if (!invalid) {
            return;
        }
        if (!canChangeSpaces(property, side) ||
            (expected === 0 && !canRemoveSpaces(property, side, whitespace)) ||
            (whitespace.length === 0 && !canInsertSpaces(property, side))) {
            return;
        }
        const { locStart, locEnd, missingLoc } = side === "key"
            ? {
                locStart: tokenBeforeColon.loc.end,
                locEnd: nextColon.loc.start,
                missingLoc: tokenBeforeColon.loc,
            }
            : {
                locStart: nextColon.loc.start,
                locEnd: tokenAfterColon.loc.start,
                missingLoc: tokenAfterColon.loc,
            };
        const { loc, messageId } = diff > 0
            ? {
                loc: { start: locStart, end: locEnd },
                messageId: side === "key" ? "extraKey" : "extraValue",
            }
            : {
                loc: missingLoc,
                messageId: side === "key" ? "missingKey" : "missingValue",
            };
        context.report({
            node: property[side],
            loc,
            messageId,
            data: {
                key: getKey(property),
            },
            fix(fixer) {
                if (diff > 0) {
                    if (side === "key") {
                        return fixer.removeRange([
                            tokenBeforeColon.range[1],
                            tokenBeforeColon.range[1] + diff,
                        ]);
                    }
                    return fixer.removeRange([
                        tokenAfterColon.range[0] - diff,
                        tokenAfterColon.range[0],
                    ]);
                }
                const spaces = " ".repeat(-diff);
                if (side === "key") {
                    return fixer.insertTextAfter(tokenBeforeColon, spaces);
                }
                return fixer.insertTextBefore(tokenAfterColon, spaces);
            },
        });
    }
    function getKeyWidth(pair) {
        const startToken = sourceCode.getFirstToken(pair);
        const endToken = getLastTokenBeforeColon(pair.key);
        return endToken.range[1] - startToken.range[0];
    }
    function getPropertyWhitespace(pair) {
        const whitespace = /(\s*):(\s*)/u.exec(sourceCode.getText().slice(pair.key.range[1], pair.value.range[0]));
        if (whitespace) {
            return {
                beforeColon: whitespace[1],
                afterColon: whitespace[2],
            };
        }
        return null;
    }
    function verifySpacing(node, lineOptions) {
        const actual = getPropertyWhitespace(node);
        if (actual) {
            report(node, "key", actual.beforeColon, lineOptions.beforeColon ? 1 : 0, lineOptions.mode);
            report(node, "value", actual.afterColon, lineOptions.afterColon ? 1 : 0, lineOptions.mode);
        }
    }
    function verifyListSpacing(properties, lineOptions) {
        const length = properties.length;
        for (let i = 0; i < length; i++) {
            verifySpacing(properties[i], lineOptions);
        }
    }
    if (alignmentOptions) {
        return defineAlignmentVisitor(alignmentOptions);
    }
    return defineSpacingVisitor();
    function defineAlignmentVisitor(alignmentOptions) {
        return {
            YAMLMapping(node) {
                if (isSingleLine(node)) {
                    verifyListSpacing(node.pairs.filter(isKeyValueProperty), singleLineOptions);
                }
                else {
                    verifyAlignment(node);
                }
            },
        };
        function verifyGroupAlignment(properties) {
            const length = properties.length;
            const widths = properties.map(getKeyWidth);
            const align = alignmentOptions.on;
            let targetWidth = Math.max(...widths);
            let beforeColon, afterColon, mode;
            if (alignmentOptions && length > 1) {
                beforeColon = alignmentOptions.beforeColon ? 1 : 0;
                afterColon = alignmentOptions.afterColon ? 1 : 0;
                mode = alignmentOptions.mode;
            }
            else {
                beforeColon = multiLineOptions.beforeColon ? 1 : 0;
                afterColon = multiLineOptions.afterColon ? 1 : 0;
                mode = alignmentOptions.mode;
            }
            targetWidth += align === "colon" ? beforeColon : afterColon;
            for (let i = 0; i < length; i++) {
                const property = properties[i];
                const whitespace = getPropertyWhitespace(property);
                if (whitespace) {
                    const width = widths[i];
                    if (align === "value") {
                        report(property, "key", whitespace.beforeColon, beforeColon, mode);
                        report(property, "value", whitespace.afterColon, targetWidth - width, mode);
                    }
                    else {
                        report(property, "key", whitespace.beforeColon, targetWidth - width, mode);
                        report(property, "value", whitespace.afterColon, afterColon, mode);
                    }
                }
            }
        }
        function continuesPropertyGroup(lastMember, candidate) {
            const groupEndLine = lastMember.loc.start.line;
            const candidateStartLine = candidate.loc.start.line;
            if (candidateStartLine - groupEndLine <= 1) {
                return true;
            }
            const leadingComments = sourceCode.getCommentsBefore(candidate);
            if (leadingComments.length &&
                leadingComments[0].loc.start.line - groupEndLine <= 1 &&
                candidateStartLine - last(leadingComments).loc.end.line <= 1) {
                for (let i = 1; i < leadingComments.length; i++) {
                    if (leadingComments[i].loc.start.line -
                        leadingComments[i - 1].loc.end.line >
                        1) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }
        function createGroups(node) {
            if (node.pairs.length === 1) {
                return [node.pairs];
            }
            return node.pairs.reduce((groups, property) => {
                const currentGroup = last(groups);
                const prev = last(currentGroup);
                if (!prev || continuesPropertyGroup(prev, property)) {
                    currentGroup.push(property);
                }
                else {
                    groups.push([property]);
                }
                return groups;
            }, [[]]);
        }
        function verifyAlignment(node) {
            createGroups(node).forEach((group) => {
                const properties = group.filter(isKeyValueProperty);
                if (properties.length > 0 && isSingleLineProperties(properties)) {
                    verifyListSpacing(properties, multiLineOptions);
                }
                else {
                    verifyGroupAlignment(properties);
                }
            });
        }
    }
    function defineSpacingVisitor() {
        return {
            YAMLPair(node) {
                if (!isKeyValueProperty(node))
                    return;
                verifySpacing(node, isSingleLine(node.parent) ? singleLineOptions : multiLineOptions);
            },
        };
    }
}
