"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../utils/index");
const yaml_1 = require("../utils/yaml");
const ast_utils_1 = require("../utils/ast-utils");
const compat_1 = require("../utils/compat");
const ITERATION_OPTS = Object.freeze({
    includeComments: true,
});
function parseOptions(context) {
    const [indentOption, objectOptions] = context.options;
    const numOfIndent = (0, yaml_1.getNumOfIndent)(context, indentOption);
    let indentBlockSequences = true;
    let indicatorValueIndent = numOfIndent;
    let alignMultilineFlowScalars = false;
    if (objectOptions) {
        if (objectOptions.indentBlockSequences === false) {
            indentBlockSequences = false;
        }
        if (objectOptions.indicatorValueIndent != null) {
            indicatorValueIndent = objectOptions.indicatorValueIndent;
        }
        if (objectOptions.alignMultilineFlowScalars != null) {
            alignMultilineFlowScalars = objectOptions.alignMultilineFlowScalars;
        }
    }
    return {
        numOfIndent,
        indentBlockSequences,
        indicatorValueIndent,
        alignMultilineFlowScalars,
    };
}
exports.default = (0, index_1.createRule)("indent", {
    meta: {
        docs: {
            description: "enforce consistent indentation",
            categories: ["standard"],
            extensionRule: false,
            layout: true,
        },
        fixable: "whitespace",
        schema: [
            {
                type: "integer",
                minimum: 2,
            },
            {
                type: "object",
                properties: {
                    indentBlockSequences: { type: "boolean" },
                    indicatorValueIndent: {
                        type: "integer",
                        minimum: 2,
                    },
                    alignMultilineFlowScalars: {
                        type: "boolean",
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            wrongIndentation: "Expected indentation of {{expected}} spaces but found {{actual}} spaces.",
        },
        type: "layout",
    },
    create(context) {
        var _a;
        const sourceCode = (0, compat_1.getSourceCode)(context);
        if (!((_a = sourceCode.parserServices) === null || _a === void 0 ? void 0 : _a.isYAML)) {
            return {};
        }
        if ((0, yaml_1.hasTabIndent)(context)) {
            return {};
        }
        const { numOfIndent, indentBlockSequences, indicatorValueIndent, alignMultilineFlowScalars, } = parseOptions(context);
        const indents = new Map();
        const indicators = new Set();
        const blockLiteralMarks = new Set();
        const scalars = new Map();
        function setOffset(token, offset, baseToken, options) {
            setIndent(token, offset * numOfIndent, baseToken, options && {
                indentWhenBaseIsNotFirst: options.offsetWhenBaseIsNotFirst &&
                    options.offsetWhenBaseIsNotFirst * numOfIndent,
            });
        }
        function setIndent(token, indent, baseToken, options) {
            var _a;
            if (token == null) {
                return;
            }
            if (Array.isArray(token)) {
                for (const t of token) {
                    setIndent(t, indent, baseToken, options);
                }
            }
            else {
                indents.set(token, {
                    baseToken,
                    indent,
                    indentWhenBaseIsNotFirst: (_a = options === null || options === void 0 ? void 0 : options.indentWhenBaseIsNotFirst) !== null && _a !== void 0 ? _a : null,
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
        function calcMappingPairValueIndent(node, indent) {
            if (indentBlockSequences) {
                return indent;
            }
            if (node.type === "YAMLSequence" && node.style === "block") {
                return 0;
            }
            return indent;
        }
        function calcIndicatorValueIndent(token) {
            return isBeginningToken(token) ? indicatorValueIndent : numOfIndent;
        }
        function isBeginningToken(token) {
            const before = sourceCode.getTokenBefore(token, (t) => !indicators.has(t));
            if (!before)
                return true;
            return before.loc.end.line < token.loc.start.line;
        }
        const documents = [];
        return {
            YAMLDocument(node) {
                documents.push(node);
                const first = sourceCode.getFirstToken(node, ITERATION_OPTS);
                if (!first) {
                    return;
                }
                indents.set(first, {
                    baseToken: null,
                    indentWhenBaseIsNotFirst: null,
                    indent: 0,
                    expectedIndent: 0,
                });
                processNodeList([...node.directives, node.content], first, null, 0);
            },
            YAMLMapping(node) {
                if (node.style === "flow") {
                    const open = sourceCode.getFirstToken(node);
                    const close = sourceCode.getLastToken(node);
                    processNodeList(node.pairs, open, close, 1);
                }
                else if (node.style === "block") {
                    const first = sourceCode.getFirstToken(node);
                    processNodeList(node.pairs, first, null, 0);
                }
            },
            YAMLSequence(node) {
                if (node.style === "flow") {
                    const open = sourceCode.getFirstToken(node);
                    const close = sourceCode.getLastToken(node);
                    processNodeList(node.entries, open, close, 1);
                }
                else if (node.style === "block") {
                    const first = sourceCode.getFirstToken(node);
                    processNodeList(node.entries, first, null, 0);
                    for (const entry of node.entries) {
                        if (!entry) {
                            continue;
                        }
                        const hyphen = sourceCode.getTokenBefore(entry, ast_utils_1.isHyphen);
                        indicators.add(hyphen);
                        const entryToken = sourceCode.getFirstToken(entry);
                        setIndent(entryToken, calcIndicatorValueIndent(hyphen), hyphen);
                    }
                }
            },
            YAMLPair(node) {
                const pairFirst = sourceCode.getFirstToken(node);
                const keyToken = node.key && sourceCode.getFirstToken(node.key);
                const colonToken = findColonToken();
                const questionToken = (0, ast_utils_1.isQuestion)(pairFirst) ? pairFirst : null;
                if (questionToken) {
                    indicators.add(questionToken);
                    if (node.key) {
                        setIndent(keyToken, calcMappingPairValueIndent(node.key, calcIndicatorValueIndent(questionToken)), questionToken);
                    }
                }
                if (colonToken) {
                    indicators.add(colonToken);
                    if (questionToken) {
                        setOffset(colonToken, 0, questionToken, {
                            offsetWhenBaseIsNotFirst: 1,
                        });
                    }
                    else if (keyToken) {
                        setOffset(colonToken, 1, keyToken);
                    }
                }
                if (node.value) {
                    const valueToken = sourceCode.getFirstToken(node.value);
                    if (colonToken) {
                        setIndent(valueToken, calcMappingPairValueIndent(node.value, calcIndicatorValueIndent(colonToken)), colonToken);
                    }
                    else if (keyToken) {
                        setOffset(valueToken, 1, keyToken);
                    }
                }
                function findColonToken() {
                    if (node.value) {
                        return sourceCode.getTokenBefore(node.value, ast_utils_1.isColon);
                    }
                    if (node.key) {
                        const token = sourceCode.getTokenAfter(node.key, ast_utils_1.isColon);
                        if (token && token.range[0] < node.range[1]) {
                            return token;
                        }
                    }
                    const tokens = sourceCode.getTokens(node, ast_utils_1.isColon);
                    if (tokens.length) {
                        return tokens[0];
                    }
                    return null;
                }
            },
            YAMLWithMeta(node) {
                const anchorToken = node.anchor && sourceCode.getFirstToken(node.anchor);
                const tagToken = node.tag && sourceCode.getFirstToken(node.tag);
                let baseToken;
                if (anchorToken && tagToken) {
                    if (anchorToken.range[0] < tagToken.range[0]) {
                        setOffset(tagToken, 0, anchorToken, {
                            offsetWhenBaseIsNotFirst: 1,
                        });
                        baseToken = anchorToken;
                    }
                    else {
                        setOffset(anchorToken, 0, tagToken, {
                            offsetWhenBaseIsNotFirst: 1,
                        });
                        baseToken = tagToken;
                    }
                }
                else {
                    baseToken = (anchorToken || tagToken);
                }
                if (node.value) {
                    const valueToken = sourceCode.getFirstToken(node.value);
                    setOffset(valueToken, 1, baseToken);
                }
            },
            YAMLScalar(node) {
                if (node.style === "folded" || node.style === "literal") {
                    if (!node.value.trim()) {
                        return;
                    }
                    const mark = sourceCode.getFirstToken(node);
                    const literal = sourceCode.getLastToken(node);
                    setOffset(literal, 1, mark);
                    scalars.set(literal, node);
                    blockLiteralMarks.add(mark);
                }
                else {
                    scalars.set(sourceCode.getFirstToken(node), node);
                }
            },
            "Program:exit"(node) {
                const lineIndentsWk = [];
                let tokensOnSameLine = [];
                for (const token of sourceCode.getTokens(node, ITERATION_OPTS)) {
                    if (tokensOnSameLine.length === 0 ||
                        tokensOnSameLine[0].loc.start.line === token.loc.start.line) {
                        tokensOnSameLine.push(token);
                    }
                    else {
                        const lineIndent = processExpectedIndent(tokensOnSameLine);
                        lineIndentsWk[lineIndent.line] = lineIndent;
                        tokensOnSameLine = [token];
                    }
                }
                if (tokensOnSameLine.length >= 1) {
                    const lineIndent = processExpectedIndent(tokensOnSameLine);
                    lineIndentsWk[lineIndent.line] = lineIndent;
                }
                const lineIndents = processMissingLines(lineIndentsWk);
                validateLines(lineIndents);
            },
        };
        function processExpectedIndent(lineTokens) {
            const lastToken = lineTokens[lineTokens.length - 1];
            let lineExpectedIndent = null;
            let cacheExpectedIndent = null;
            const indicatorData = [];
            const firstToken = lineTokens.shift();
            let token = firstToken;
            let expectedIndent = getExpectedIndent(token);
            if (expectedIndent != null) {
                lineExpectedIndent = expectedIndent;
                cacheExpectedIndent = expectedIndent;
            }
            while (token && indicators.has(token) && expectedIndent != null) {
                const nextToken = lineTokens.shift();
                if (!nextToken) {
                    break;
                }
                const nextExpectedIndent = getExpectedIndent(nextToken);
                if (nextExpectedIndent == null ||
                    expectedIndent >= nextExpectedIndent) {
                    lineTokens.unshift(nextToken);
                    break;
                }
                indicatorData.push({
                    indicator: token,
                    next: nextToken,
                    expectedOffset: nextExpectedIndent - expectedIndent - 1,
                    actualOffset: nextToken.range[0] - token.range[1],
                });
                if (blockLiteralMarks.has(nextToken)) {
                    lineTokens.unshift(nextToken);
                    break;
                }
                token = nextToken;
                expectedIndent = nextExpectedIndent;
                cacheExpectedIndent = expectedIndent;
            }
            if (lineExpectedIndent == null) {
                while ((token = lineTokens.shift()) != null) {
                    lineExpectedIndent = getExpectedIndent(token);
                    if (lineExpectedIndent != null) {
                        break;
                    }
                }
            }
            const scalarNode = scalars.get(lastToken);
            if (scalarNode) {
                lineTokens.pop();
            }
            if (cacheExpectedIndent != null) {
                while ((token = lineTokens.shift()) != null) {
                    const indent = indents.get(token);
                    if (indent) {
                        indent.expectedIndent = cacheExpectedIndent;
                    }
                }
            }
            let lastScalar = null;
            if (scalarNode) {
                const expectedScalarIndent = getExpectedIndent(lastToken);
                if (expectedScalarIndent != null) {
                    lastScalar = {
                        expectedIndent: expectedScalarIndent,
                        token: lastToken,
                        node: scalarNode,
                    };
                }
            }
            const { line, column } = firstToken.loc.start;
            return {
                expectedIndent: lineExpectedIndent,
                actualIndent: column,
                firstToken,
                line,
                indicatorData,
                lastScalar,
            };
        }
        function getExpectedIndent(token) {
            if (token.type === "Marker") {
                return 0;
            }
            const indent = indents.get(token);
            if (!indent) {
                return null;
            }
            if (indent.expectedIndent != null) {
                return indent.expectedIndent;
            }
            if (indent.baseToken == null) {
                return null;
            }
            const baseIndent = getExpectedIndent(indent.baseToken);
            if (baseIndent == null) {
                return null;
            }
            let offsetIndent = indent.indent;
            if (offsetIndent === 0 && indent.indentWhenBaseIsNotFirst != null) {
                let before = indent.baseToken;
                while ((before = sourceCode.getTokenBefore(before, ITERATION_OPTS)) != null) {
                    if (!indicators.has(before)) {
                        break;
                    }
                }
                if ((before === null || before === void 0 ? void 0 : before.loc.end.line) === indent.baseToken.loc.start.line) {
                    offsetIndent = indent.indentWhenBaseIsNotFirst;
                }
            }
            return (indent.expectedIndent = baseIndent + offsetIndent);
        }
        function processMissingLines(lineIndents) {
            const results = [];
            const commentLines = [];
            for (const lineIndent of lineIndents) {
                if (!lineIndent) {
                    continue;
                }
                const line = lineIndent.line;
                if (lineIndent.firstToken.type === "Block") {
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
                        indicatorData: lineIndent.indicatorData,
                    };
                    if (!results[line]) {
                        results[line] = indent;
                    }
                    if (lineIndent.lastScalar) {
                        const scalarNode = lineIndent.lastScalar.node;
                        if (scalarNode.style === "literal" ||
                            scalarNode.style === "folded") {
                            processBlockLiteral(indent, scalarNode, lineIndent.lastScalar.expectedIndent);
                        }
                        else {
                            let expectedIndent = lineIndent.lastScalar.expectedIndent;
                            if (alignMultilineFlowScalars) {
                                if (!isBeginningToken(lineIndent.lastScalar.token)) {
                                    expectedIndent = lineIndent.lastScalar.node.loc.start.column;
                                }
                            }
                            processMultilineScalar(indent, scalarNode, expectedIndent);
                        }
                    }
                }
            }
            processComments(commentLines, lineIndents);
            return results;
            function processComments(commentLines, lineIndents) {
                var _a;
                for (const { range, commentLineIndents } of commentLines) {
                    let prev = results
                        .slice(0, range[0])
                        .filter((data) => data)
                        .pop();
                    const next = results
                        .slice(range[1] + 1)
                        .filter((data) => data)
                        .shift();
                    if (isBlockLiteral(prev)) {
                        prev = undefined;
                    }
                    const expectedIndents = [];
                    let either;
                    if (prev && next) {
                        expectedIndents.unshift(next.expectedIndent);
                        if (next.expectedIndent < prev.expectedIndent) {
                            let indent = next.expectedIndent + numOfIndent;
                            while (indent <= prev.expectedIndent) {
                                expectedIndents.unshift(indent);
                                indent += numOfIndent;
                            }
                        }
                    }
                    else if ((either = prev || next)) {
                        expectedIndents.unshift(either.expectedIndent);
                        if (!next) {
                            let indent = either.expectedIndent - numOfIndent;
                            while (indent >= 0) {
                                expectedIndents.push(indent);
                                indent -= numOfIndent;
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
                        expectedIndent = Math.min((_a = expectedIndents.find((indent, index) => {
                            var _a;
                            if (indent <= commentLineIndent.actualIndent) {
                                return true;
                            }
                            const prev = (_a = expectedIndents[index + 1]) !== null && _a !== void 0 ? _a : -1;
                            return (prev < commentLineIndent.actualIndent &&
                                commentLineIndent.actualIndent < indent);
                        })) !== null && _a !== void 0 ? _a : expectedIndent, expectedIndent);
                        results[commentLineIndent.line] = {
                            line: commentLineIndent.line,
                            expectedIndent,
                            actualIndent: commentLineIndent.actualIndent,
                            indicatorData: commentLineIndent.indicatorData,
                        };
                    }
                }
                function isBlockLiteral(prev) {
                    if (!prev) {
                        return false;
                    }
                    for (let prevLine = prev.line; prevLine >= 0; prevLine--) {
                        const prevLineIndent = lineIndents[prev.line];
                        if (!prevLineIndent) {
                            continue;
                        }
                        if (prevLineIndent.lastScalar) {
                            const scalarNode = prevLineIndent.lastScalar.node;
                            if (scalarNode.style === "literal" ||
                                scalarNode.style === "folded") {
                                if (scalarNode.loc.start.line <= prev.line &&
                                    prev.line <= scalarNode.loc.end.line) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    }
                    return false;
                }
            }
            function processBlockLiteral(lineIndent, scalarNode, expectedIndent) {
                if (scalarNode.indent != null) {
                    if (lineIndent.expectedIndent < lineIndent.actualIndent) {
                        lineIndent.expectedIndent = lineIndent.actualIndent;
                        return;
                    }
                    lineIndent.indentBlockScalar = {
                        node: scalarNode,
                    };
                }
                const firstLineActualIndent = lineIndent.actualIndent;
                for (let scalarLine = lineIndent.line + 1; scalarLine <= scalarNode.loc.end.line; scalarLine++) {
                    const actualLineIndent = getActualLineIndent(scalarLine);
                    if (actualLineIndent == null) {
                        continue;
                    }
                    const scalarActualIndent = Math.min(firstLineActualIndent, actualLineIndent);
                    results[scalarLine] = {
                        line: scalarLine,
                        expectedIndent,
                        actualIndent: scalarActualIndent,
                        indicatorData: [],
                    };
                }
            }
            function processMultilineScalar(lineIndent, scalarNode, expectedIndent) {
                for (let scalarLine = lineIndent.line + 1; scalarLine <= scalarNode.loc.end.line; scalarLine++) {
                    const scalarActualIndent = getActualLineIndent(scalarLine);
                    if (scalarActualIndent == null) {
                        continue;
                    }
                    results[scalarLine] = {
                        line: scalarLine,
                        expectedIndent,
                        actualIndent: scalarActualIndent,
                        indicatorData: [],
                    };
                }
            }
        }
        function validateLines(lineIndents) {
            for (const lineIndent of lineIndents) {
                if (!lineIndent) {
                    continue;
                }
                if (lineIndent.actualIndent !== lineIndent.expectedIndent) {
                    context.report({
                        loc: {
                            start: {
                                line: lineIndent.line,
                                column: 0,
                            },
                            end: {
                                line: lineIndent.line,
                                column: lineIndent.actualIndent,
                            },
                        },
                        messageId: "wrongIndentation",
                        data: {
                            expected: String(lineIndent.expectedIndent),
                            actual: String(lineIndent.actualIndent),
                        },
                        fix: buildFix(lineIndent, lineIndents),
                    });
                }
                else if (lineIndent.indicatorData.length) {
                    for (const indicatorData of lineIndent.indicatorData) {
                        if (indicatorData.actualOffset !== indicatorData.expectedOffset) {
                            const indicatorLoc = indicatorData.indicator.loc.end;
                            const loc = indicatorData.next.loc.start;
                            context.report({
                                loc: {
                                    start: indicatorLoc,
                                    end: loc,
                                },
                                messageId: "wrongIndentation",
                                data: {
                                    expected: String(indicatorData.expectedOffset),
                                    actual: String(indicatorData.actualOffset),
                                },
                                fix: buildFix(lineIndent, lineIndents),
                            });
                        }
                    }
                }
            }
        }
        function buildFix(lineIndent, lineIndents) {
            var _a;
            const { line, expectedIndent } = lineIndent;
            const document = documents.find((doc) => doc.loc.start.line <= line && line <= doc.loc.end.line) || sourceCode.ast;
            let startLine = document.loc.start.line;
            let endLine = document.loc.end.line;
            for (let lineIndex = line - 1; lineIndex >= document.loc.start.line; lineIndex--) {
                const li = lineIndents[lineIndex];
                if (!li) {
                    continue;
                }
                if (li.expectedIndent < expectedIndent) {
                    if (expectedIndent <= li.actualIndent) {
                        return null;
                    }
                    for (const indicator of li.indicatorData) {
                        if (indicator.actualOffset !== indicator.expectedOffset) {
                            return null;
                        }
                    }
                    startLine = lineIndex + 1;
                    break;
                }
            }
            for (let lineIndex = line + 1; lineIndex <= document.loc.end.line; lineIndex++) {
                const li = lineIndents[lineIndex];
                if (!li) {
                    continue;
                }
                if (li && li.expectedIndent < expectedIndent) {
                    if (expectedIndent <= li.actualIndent) {
                        return null;
                    }
                    endLine = lineIndex - 1;
                    break;
                }
            }
            for (let lineIndex = startLine; lineIndex <= endLine; lineIndex++) {
                const li = lineIndents[lineIndex];
                if (li === null || li === void 0 ? void 0 : li.indentBlockScalar) {
                    const blockLiteral = li.indentBlockScalar.node;
                    const diff = li.expectedIndent - li.actualIndent;
                    const mark = sourceCode.getFirstToken(blockLiteral);
                    const num = (_a = /\d+/u.exec(mark.value)) === null || _a === void 0 ? void 0 : _a[0];
                    if (num != null) {
                        const newIndent = Number(num) + diff;
                        if (newIndent >= 10) {
                            return null;
                        }
                    }
                }
            }
            return function* (fixer) {
                let stacks = null;
                for (let lineIndex = startLine; lineIndex <= endLine; lineIndex++) {
                    const li = lineIndents[lineIndex];
                    if (!li) {
                        continue;
                    }
                    const lineExpectedIndent = li.expectedIndent;
                    if (stacks == null) {
                        if (li.expectedIndent !== li.actualIndent) {
                            yield* fixLine(fixer, li);
                        }
                    }
                    else {
                        if (stacks.indent < lineExpectedIndent) {
                            stacks = {
                                indent: lineExpectedIndent,
                                parentIndent: stacks.indent,
                                upper: stacks,
                            };
                        }
                        else if (lineExpectedIndent < stacks.indent) {
                            stacks = stacks.upper;
                        }
                        if (li.actualIndent <= stacks.parentIndent) {
                            yield* fixLine(fixer, li);
                        }
                    }
                    if (li.indicatorData) {
                        for (const indicatorData of li.indicatorData) {
                            yield fixer.replaceTextRange([indicatorData.indicator.range[1], indicatorData.next.range[0]], " ".repeat(indicatorData.expectedOffset));
                        }
                    }
                }
            };
        }
        function* fixLine(fixer, li) {
            if (li.indentBlockScalar) {
                const blockLiteral = li.indentBlockScalar.node;
                const diff = li.expectedIndent - li.actualIndent;
                const mark = sourceCode.getFirstToken(blockLiteral);
                yield fixer.replaceText(mark, mark.value.replace(/\d+/u, (num) => `${Number(num) + diff}`));
            }
            const expectedIndent = li.expectedIndent;
            yield fixer.replaceTextRange([
                sourceCode.getIndexFromLoc({
                    line: li.line,
                    column: 0,
                }),
                sourceCode.getIndexFromLoc({
                    line: li.line,
                    column: li.actualIndent,
                }),
            ], " ".repeat(expectedIndent));
        }
        function getActualLineIndent(line) {
            const lineText = sourceCode.lines[line - 1];
            if (!lineText.length) {
                return null;
            }
            return /^\s*/u.exec(lineText)[0].length;
        }
    },
});
