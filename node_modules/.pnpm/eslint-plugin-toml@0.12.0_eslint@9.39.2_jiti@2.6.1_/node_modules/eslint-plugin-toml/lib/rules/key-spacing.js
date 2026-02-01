"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
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
    let beforeEqual, afterEqual;
    if (typeof fromOptions.beforeEqual !== "undefined") {
        beforeEqual = fromOptions.beforeEqual;
    }
    else {
        beforeEqual = true;
    }
    if (typeof fromOptions.afterEqual !== "undefined") {
        afterEqual = fromOptions.afterEqual;
    }
    else {
        afterEqual = true;
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
                beforeEqual,
                afterEqual,
            };
        }
    }
    return {
        mode,
        beforeEqual,
        afterEqual,
        align,
    };
}
function initOptions(fromOptions) {
    let align, multiLine, singleLine;
    if (typeof fromOptions.align === "object") {
        align = {
            ...initOptionProperty(fromOptions.align),
            on: fromOptions.align.on || "equal",
            mode: fromOptions.align.mode || "strict",
        };
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
                beforeEqual: multiLine.align.beforeEqual,
                afterEqual: multiLine.align.afterEqual,
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
    enum: ["equal", "value"],
};
const OBJECT_WITHOUT_ON_SCHEMA = {
    type: "object",
    properties: {
        mode: {
            enum: ["strict", "minimum"],
        },
        beforeEqual: {
            type: "boolean",
        },
        afterEqual: {
            type: "boolean",
        },
    },
    additionalProperties: false,
};
const ALIGN_OBJECT_SCHEMA = {
    type: "object",
    properties: {
        on: ON_SCHEMA,
        ...OBJECT_WITHOUT_ON_SCHEMA.properties,
    },
    additionalProperties: false,
};
exports.default = (0, utils_1.createRule)("key-spacing", {
    meta: {
        docs: {
            description: "enforce consistent spacing between keys and values in key/value pairs",
            categories: ["standard"],
            extensionRule: "key-spacing",
        },
        fixable: "whitespace",
        schema: [
            {
                anyOf: [
                    {
                        type: "object",
                        properties: {
                            align: {
                                anyOf: [ON_SCHEMA, ALIGN_OBJECT_SCHEMA],
                            },
                            ...OBJECT_WITHOUT_ON_SCHEMA.properties,
                        },
                        additionalProperties: false,
                    },
                    {
                        type: "object",
                        properties: {
                            singleLine: OBJECT_WITHOUT_ON_SCHEMA,
                            multiLine: {
                                type: "object",
                                properties: {
                                    align: {
                                        anyOf: [ON_SCHEMA, ALIGN_OBJECT_SCHEMA],
                                    },
                                    ...OBJECT_WITHOUT_ON_SCHEMA.properties,
                                },
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
    const sourceCode = (0, compat_1.getSourceCode)(context);
    if (!sourceCode.parserServices?.isTOML) {
        return {};
    }
    const options = context.options[0] || {};
    const { multiLine: multiLineOptions, singleLine: singleLineOptions, align: alignmentOptions, } = initOptions(options);
    function isKeyValueProperty(property) {
        return property.type === "TOMLKeyValue";
    }
    function getLastTokenBeforeEqual(node) {
        const equalToken = sourceCode.getTokenAfter(node, ast_utils_1.isEqualSign);
        return sourceCode.getTokenBefore(equalToken);
    }
    function getNextEqual(node) {
        return sourceCode.getTokenAfter(node, ast_utils_1.isEqualSign);
    }
    function getKey(property) {
        const keys = property.key.keys;
        return keys
            .map((key) => sourceCode.getText().slice(key.range[0], key.range[1]))
            .join(".");
    }
    function report(property, side, whitespace, expected, mode) {
        const diff = whitespace.length - expected;
        const nextEqual = getNextEqual(property.key);
        const tokenBeforeEqual = sourceCode.getTokenBefore(nextEqual, {
            includeComments: true,
        });
        const tokenAfterEqual = sourceCode.getTokenAfter(nextEqual, {
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
        const { locStart, locEnd, missingLoc } = side === "key"
            ? {
                locStart: tokenBeforeEqual.loc.end,
                locEnd: nextEqual.loc.start,
                missingLoc: tokenBeforeEqual.loc,
            }
            : {
                locStart: nextEqual.loc.start,
                locEnd: tokenAfterEqual.loc.start,
                missingLoc: tokenAfterEqual.loc,
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
                            tokenBeforeEqual.range[1],
                            tokenBeforeEqual.range[1] + diff,
                        ]);
                    }
                    return fixer.removeRange([
                        tokenAfterEqual.range[0] - diff,
                        tokenAfterEqual.range[0],
                    ]);
                }
                const spaces = " ".repeat(-diff);
                if (side === "key") {
                    return fixer.insertTextAfter(tokenBeforeEqual, spaces);
                }
                return fixer.insertTextBefore(tokenAfterEqual, spaces);
            },
        });
    }
    function getKeyWidth(pair) {
        const startToken = sourceCode.getFirstToken(pair);
        const endToken = getLastTokenBeforeEqual(pair.key);
        return endToken.range[1] - startToken.range[0];
    }
    function getPropertyWhitespace(pair) {
        const whitespace = /(\s*)=(\s*)/u.exec(sourceCode.getText().slice(pair.key.range[1], pair.value.range[0]));
        if (whitespace) {
            return {
                beforeEqual: whitespace[1],
                afterEqual: whitespace[2],
            };
        }
        return null;
    }
    function verifySpacing(node, lineOptions) {
        const actual = getPropertyWhitespace(node);
        if (actual) {
            report(node, "key", actual.beforeEqual, lineOptions.beforeEqual ? 1 : 0, lineOptions.mode);
            report(node, "value", actual.afterEqual, lineOptions.afterEqual ? 1 : 0, lineOptions.mode);
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
            "TOMLTopLevelTable, TOMLTable, TOMLInlineTable"(node) {
                if (isSingleLine(node)) {
                    const body = node.body;
                    verifyListSpacing(body.filter(isKeyValueProperty), singleLineOptions);
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
            let beforeEqual, afterEqual, mode;
            if (alignmentOptions && length > 1) {
                beforeEqual = alignmentOptions.beforeEqual ? 1 : 0;
                afterEqual = alignmentOptions.afterEqual ? 1 : 0;
                mode = alignmentOptions.mode;
            }
            else {
                beforeEqual = multiLineOptions.beforeEqual ? 1 : 0;
                afterEqual = multiLineOptions.afterEqual ? 1 : 0;
                mode = alignmentOptions.mode;
            }
            targetWidth += align === "equal" ? beforeEqual : afterEqual;
            for (let i = 0; i < length; i++) {
                const property = properties[i];
                const whitespace = getPropertyWhitespace(property);
                if (whitespace) {
                    const width = widths[i];
                    if (align === "value") {
                        report(property, "key", whitespace.beforeEqual, beforeEqual, mode);
                        report(property, "value", whitespace.afterEqual, targetWidth - width, mode);
                    }
                    else {
                        report(property, "key", whitespace.beforeEqual, targetWidth - width, mode);
                        report(property, "value", whitespace.afterEqual, afterEqual, mode);
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
            const body = node.body;
            const pairs = body.filter(isKeyValueProperty);
            if (pairs.length === 1) {
                return [pairs];
            }
            return pairs.reduce((groups, property) => {
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
                const properties = group;
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
            TOMLKeyValue(node) {
                if (!isKeyValueProperty(node))
                    return;
                verifySpacing(node, isSingleLine(node.parent) ? singleLineOptions : multiLineOptions);
            },
        };
    }
}
