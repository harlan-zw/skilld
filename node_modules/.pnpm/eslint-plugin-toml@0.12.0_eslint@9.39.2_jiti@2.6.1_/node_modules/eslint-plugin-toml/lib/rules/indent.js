"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const toml_eslint_parser_1 = require("toml-eslint-parser");
const utils_1 = require("../utils");
const ast_utils_1 = require("../utils/ast-utils");
const compat_1 = require("../utils/compat");
const ITERATION_OPTS = Object.freeze({
    includeComments: true,
});
function buildIndentUtility(optionValue) {
    const indent = optionValue ?? 2;
    const textIndent = typeof indent === "number" ? " ".repeat(indent) : "\t";
    return {
        getIndentText: (offset) => offset === 1 ? textIndent : textIndent.repeat(offset),
        outdent(indent) {
            return indent.slice(0, -textIndent.length);
        },
    };
}
exports.default = (0, utils_1.createRule)("indent", {
    meta: {
        docs: {
            description: "enforce consistent indentation",
            categories: ["standard"],
            extensionRule: false,
        },
        fixable: "whitespace",
        schema: [
            {
                oneOf: [
                    {
                        enum: ["tab"],
                    },
                    {
                        type: "integer",
                        minimum: 0,
                    },
                ],
            },
            {
                type: "object",
                properties: {
                    subTables: { type: "integer", minimum: 0 },
                    keyValuePairs: { type: "integer", minimum: 0 },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            wrongIndentation: "Expected indentation of {{expected}} but found {{actual}}.",
        },
        type: "layout",
    },
    create(context) {
        const sourceCode = (0, compat_1.getSourceCode)(context);
        if (!sourceCode.parserServices?.isTOML) {
            return {};
        }
        const { getIndentText, outdent } = buildIndentUtility(context.options[0]);
        const subTablesOffset = context.options[1]?.subTables ?? 0;
        const keyValuePairsOffset = context.options[1]?.keyValuePairs ?? 0;
        const offsets = new Map();
        function setOffset(token, offset, baseToken) {
            if (token == null) {
                return;
            }
            if (Array.isArray(token)) {
                for (const t of token) {
                    setOffset(t, offset, baseToken);
                }
            }
            else {
                offsets.set(token, {
                    baseToken,
                    offset,
                });
            }
        }
        function processNodeList(nodeList, left, right, offset) {
            let lastToken = left;
            const alignTokens = new Set();
            for (const node of nodeList) {
                if (node == null) {
                    continue;
                }
                const elementTokens = {
                    firstToken: sourceCode.getFirstToken(node),
                    lastToken: sourceCode.getLastToken(node),
                };
                let t = lastToken;
                while ((t = sourceCode.getTokenAfter(t, ITERATION_OPTS)) != null &&
                    t.range[1] <= elementTokens.firstToken.range[0]) {
                    alignTokens.add(t);
                }
                alignTokens.add(elementTokens.firstToken);
                lastToken = elementTokens.lastToken;
            }
            if (right != null) {
                let t = lastToken;
                while ((t = sourceCode.getTokenAfter(t, ITERATION_OPTS)) != null &&
                    t.range[1] <= right.range[0]) {
                    alignTokens.add(t);
                }
            }
            alignTokens.delete(left);
            setOffset([...alignTokens], offset, left);
            if (right != null) {
                setOffset(right, 0, left);
            }
        }
        return {
            TOMLTopLevelTable(node) {
                const first = sourceCode.getFirstToken(node, ITERATION_OPTS);
                if (!first) {
                    return;
                }
                const beforeTokens = sourceCode.getTokensBefore(first, ITERATION_OPTS);
                if (beforeTokens.length) {
                    const firstOfAllTokens = beforeTokens[0];
                    offsets.set(firstOfAllTokens, {
                        baseToken: null,
                        offset: 0,
                        expectedIndent: "",
                    });
                    setOffset(beforeTokens.slice(1), 0, firstOfAllTokens);
                    setOffset(first, 0, firstOfAllTokens);
                }
                else {
                    offsets.set(first, {
                        baseToken: null,
                        offset: 0,
                        expectedIndent: "",
                    });
                }
                let tableKeyStack = [];
                function getTableOffset(keys) {
                    let last = tableKeyStack.pop();
                    while (last) {
                        if (last.keys.length &&
                            last.keys.length <= keys.length &&
                            last.keys.every((k, i) => k === keys[i])) {
                            if (last.keys.length < keys.length) {
                                tableKeyStack.push(last);
                                return last.offset + subTablesOffset;
                            }
                            return last.offset;
                        }
                        last = tableKeyStack.pop();
                    }
                    return 0;
                }
                for (const body of node.body) {
                    const bodyFirstToken = sourceCode.getFirstToken(body);
                    if (body.type === "TOMLKeyValue") {
                        if (bodyFirstToken !== first) {
                            setOffset(bodyFirstToken, 0, first);
                        }
                    }
                    if (body.type === "TOMLTable") {
                        const keys = (0, toml_eslint_parser_1.getStaticTOMLValue)(body.key);
                        const offset = getTableOffset(keys);
                        tableKeyStack.push({ keys, offset });
                        if (bodyFirstToken !== first) {
                            setOffset(bodyFirstToken, offset, first);
                        }
                    }
                    else {
                        tableKeyStack = [];
                    }
                }
            },
            TOMLTable(node) {
                const openBracket = sourceCode.getFirstToken(node);
                if (node.kind === "array") {
                    const openBracketNext = sourceCode.getTokenAfter(openBracket);
                    setOffset(openBracketNext, 0, openBracket);
                }
                const key = sourceCode.getFirstToken(node.key);
                setOffset(key, 1, openBracket);
                const closeBracket = sourceCode.getTokenAfter(node.key);
                setOffset(closeBracket, 0, openBracket);
                if (node.kind === "array") {
                    const closeBracketNext = sourceCode.getTokenAfter(closeBracket);
                    setOffset(closeBracketNext, 0, closeBracket);
                }
                processNodeList(node.body, openBracket, null, keyValuePairsOffset);
            },
            TOMLKeyValue(node) {
                const keyToken = sourceCode.getFirstToken(node.key);
                const valueToken = sourceCode.getFirstToken(node.value);
                const eqToken = sourceCode.getTokenBefore(node.value, ast_utils_1.isEqualSign);
                setOffset(eqToken, 1, keyToken);
                setOffset(valueToken, 1, eqToken);
            },
            TOMLKey(node) {
                const first = sourceCode.getFirstToken(node, ITERATION_OPTS);
                processNodeList(node.keys, first, null, 1);
            },
            TOMLValue() {
            },
            TOMLBare() {
            },
            TOMLQuoted() {
            },
            TOMLArray(node) {
                const openBracket = sourceCode.getFirstToken(node);
                const closeBracket = sourceCode.getLastToken(node);
                processNodeList(node.elements, openBracket, closeBracket, 1);
            },
            TOMLInlineTable(node) {
                const openBrace = sourceCode.getFirstToken(node);
                const closeBrace = sourceCode.getLastToken(node);
                processNodeList(node.body, openBrace, closeBrace, 1);
            },
            "Program:exit"(node) {
                const lineIndentsStep1 = [];
                let tokensOnSameLine = [];
                for (const token of sourceCode.getTokens(node, ITERATION_OPTS)) {
                    if (tokensOnSameLine.length === 0 ||
                        tokensOnSameLine[0].loc.start.line === token.loc.start.line) {
                        tokensOnSameLine.push(token);
                    }
                    else {
                        const lineIndent = processExpectedIndent(tokensOnSameLine);
                        lineIndentsStep1[lineIndent.line] = lineIndent;
                        tokensOnSameLine = [token];
                    }
                }
                if (tokensOnSameLine.length >= 1) {
                    const lineIndent = processExpectedIndent(tokensOnSameLine);
                    lineIndentsStep1[lineIndent.line] = lineIndent;
                }
                const lineIndents = processMissingLines(lineIndentsStep1);
                validateLines(lineIndents);
            },
        };
        function processExpectedIndent(lineTokens) {
            const firstToken = lineTokens.shift();
            let token = firstToken;
            const expectedIndent = getExpectedIndent(token);
            let lineExpectedIndent = expectedIndent;
            if (lineExpectedIndent == null) {
                while ((token = lineTokens.shift()) != null) {
                    lineExpectedIndent = getExpectedIndent(token);
                    if (lineExpectedIndent != null) {
                        break;
                    }
                }
            }
            if (expectedIndent != null) {
                while ((token = lineTokens.shift()) != null) {
                    const offset = offsets.get(token);
                    if (offset) {
                        offset.expectedIndent = expectedIndent;
                    }
                }
            }
            const { line, column } = firstToken.loc.start;
            return {
                expectedIndent: lineExpectedIndent,
                actualIndent: sourceCode.lines[line - 1].slice(0, column),
                firstToken,
                line,
            };
        }
        function getExpectedIndent(token) {
            const offset = offsets.get(token);
            if (!offset) {
                return null;
            }
            if (offset.expectedIndent != null) {
                return offset.expectedIndent;
            }
            if (offset.baseToken == null) {
                return null;
            }
            const baseIndent = getExpectedIndent(offset.baseToken);
            if (baseIndent == null) {
                return null;
            }
            const offsetIndent = offset.offset;
            return (offset.expectedIndent = baseIndent + getIndentText(offsetIndent));
        }
        function processMissingLines(lineIndents) {
            const results = [];
            const commentLines = [];
            for (const lineIndent of lineIndents) {
                if (!lineIndent) {
                    continue;
                }
                const line = lineIndent.line;
                if ((0, ast_utils_1.isCommentToken)(lineIndent.firstToken)) {
                    const last = commentLines[commentLines.length - 1];
                    if (last && last.range[1] === line - 1) {
                        last.range[1] = line;
                        last.commentLineIndents.push(lineIndent);
                    }
                    else {
                        commentLines.push({
                            range: [line, line],
                            commentLineIndents: [lineIndent],
                        });
                    }
                }
                else if (lineIndent.expectedIndent != null) {
                    const indent = {
                        line,
                        expectedIndent: lineIndent.expectedIndent,
                        actualIndent: lineIndent.actualIndent,
                        firstToken: lineIndent.firstToken,
                    };
                    if (!results[line]) {
                        results[line] = indent;
                    }
                }
            }
            processComments(commentLines);
            return results;
            function processComments(commentLines) {
                for (const { range, commentLineIndents } of commentLines) {
                    const prev = results
                        .slice(0, range[0])
                        .filter((data) => data)
                        .pop();
                    const next = results
                        .slice(range[1] + 1)
                        .filter((data) => data)
                        .shift();
                    const expectedIndents = [];
                    let either;
                    if (prev && next) {
                        expectedIndents.unshift(next.expectedIndent);
                        if (next.expectedIndent < prev.expectedIndent) {
                            let indent = next.expectedIndent + getIndentText(1);
                            while (indent.length <= prev.expectedIndent.length) {
                                expectedIndents.unshift(indent);
                                indent += getIndentText(1);
                            }
                        }
                    }
                    else if ((either = prev || next)) {
                        expectedIndents.unshift(either.expectedIndent);
                        if (!next) {
                            let indent = outdent(either.expectedIndent);
                            while (indent.length > 0) {
                                expectedIndents.push(indent);
                                indent = outdent(indent);
                                if (indent.length <= 0) {
                                    expectedIndents.push(indent);
                                    break;
                                }
                            }
                        }
                    }
                    if (!expectedIndents.length) {
                        continue;
                    }
                    let expectedIndent = expectedIndents[0];
                    for (const commentLineIndent of commentLineIndents) {
                        if (results[commentLineIndent.line]) {
                            continue;
                        }
                        const indentCandidate = expectedIndents.find((indent, index) => {
                            if (indent.length <= commentLineIndent.actualIndent.length) {
                                return true;
                            }
                            const prev = expectedIndents[index + 1]?.length ?? -1;
                            return (prev < commentLineIndent.actualIndent.length &&
                                commentLineIndent.actualIndent.length < indent.length);
                        });
                        if (indentCandidate != null &&
                            indentCandidate.length < expectedIndent.length) {
                            expectedIndent = indentCandidate;
                        }
                        results[commentLineIndent.line] = {
                            line: commentLineIndent.line,
                            expectedIndent,
                            actualIndent: commentLineIndent.actualIndent,
                            firstToken: commentLineIndent.firstToken,
                        };
                    }
                }
            }
        }
        function validateLines(lineIndents) {
            for (const lineIndent of lineIndents) {
                if (!lineIndent) {
                    continue;
                }
                if (lineIndent.actualIndent !== lineIndent.expectedIndent) {
                    const startLoc = {
                        line: lineIndent.line,
                        column: 0,
                    };
                    context.report({
                        loc: {
                            start: startLoc,
                            end: lineIndent.firstToken.loc.start,
                        },
                        messageId: "wrongIndentation",
                        data: getIndentData(lineIndent),
                        fix(fixer) {
                            return fixer.replaceTextRange([
                                sourceCode.getIndexFromLoc(startLoc),
                                lineIndent.firstToken.range[0],
                            ], lineIndent.expectedIndent);
                        },
                    });
                }
            }
        }
        function getIndentData(lineIndent) {
            return {
                expected: toDisplayText(lineIndent.expectedIndent),
                actual: toDisplayText(lineIndent.actualIndent),
            };
            function toDisplayText(indent) {
                if (indent.length === 0) {
                    return "0 spaces";
                }
                const char = indent[0];
                if (char === " " || char === "\t") {
                    let uni = true;
                    for (const c of indent) {
                        if (c !== char) {
                            uni = false;
                        }
                    }
                    if (uni) {
                        const unit = char === " " ? "spaces" : "tabs";
                        return `${indent.length} ${unit}`;
                    }
                }
                return `"${replaceToDisplay(indent)}"`;
            }
            function replaceToDisplay(indent) {
                return indent.replace(/\s/gu, (c) => {
                    if (c === "\t")
                        return "\\t";
                    if (c === " ")
                        return " ";
                    const hex = c.codePointAt(0).toString(16);
                    return `\\u${`000${hex}`.slice(-4)}`;
                });
            }
        }
    },
});
