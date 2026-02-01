"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const eslint_ast_utils_1 = require("../utils/eslint-ast-utils");
const eslint_utils_1 = require("@eslint-community/eslint-utils");
const KNOWN_NODES = new Set([
    "JSONArrayExpression",
    "JSONBinaryExpression",
    "JSONExpressionStatement",
    "JSONIdentifier",
    "JSONLiteral",
    "JSONObjectExpression",
    "Program",
    "JSONProperty",
    "JSONTemplateElement",
    "JSONTemplateLiteral",
    "JSONUnaryExpression",
]);
class IndexMap {
    constructor(maxKey) {
        this._values = Array(maxKey + 1);
    }
    insert(key, value) {
        this._values[key] = value;
    }
    findLastNotAfter(key) {
        const values = this._values;
        for (let index = key; index >= 0; index--) {
            const value = values[index];
            if (value)
                return value;
        }
        return undefined;
    }
    deleteRange(start, end) {
        this._values.fill(undefined, start, end);
    }
}
class TokenInfo {
    constructor(sourceCode) {
        this.sourceCode = sourceCode;
        this.firstTokensByLineNumber = new Map();
        const tokens = sourceCode.getTokens(sourceCode.ast, {
            includeComments: true,
        });
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (!this.firstTokensByLineNumber.has(token.loc.start.line))
                this.firstTokensByLineNumber.set(token.loc.start.line, token);
            if (!this.firstTokensByLineNumber.has(token.loc.end.line) &&
                sourceCode.text
                    .slice(token.range[1] - token.loc.end.column, token.range[1])
                    .trim())
                this.firstTokensByLineNumber.set(token.loc.end.line, token);
        }
    }
    getFirstTokenOfLine(token) {
        return this.firstTokensByLineNumber.get(token.loc.start.line);
    }
    isFirstTokenOfLine(token) {
        return this.getFirstTokenOfLine(token) === token;
    }
    getTokenIndent(token) {
        return this.sourceCode.text.slice(token.range[0] - token.loc.start.column, token.range[0]);
    }
}
class OffsetStorage {
    constructor(tokenInfo, indentSize, indentType, maxIndex) {
        this._lockedFirstTokens = new WeakMap();
        this._desiredIndentCache = new WeakMap();
        this._ignoredTokens = new WeakSet();
        this._tokenInfo = tokenInfo;
        this._indentSize = indentSize;
        this._indentType = indentType;
        this._indexMap = new IndexMap(maxIndex);
        this._indexMap.insert(0, { offset: 0, from: null, force: false });
    }
    _getOffsetDescriptor(token) {
        return this._indexMap.findLastNotAfter(token.range[0]);
    }
    matchOffsetOf(baseToken, offsetToken) {
        this._lockedFirstTokens.set(offsetToken, baseToken);
    }
    setDesiredOffset(token, fromToken, offset) {
        if (token)
            this.setDesiredOffsets(token.range, fromToken, offset);
    }
    setDesiredOffsets(range, fromToken, offset, force = false) {
        const descriptorToInsert = { offset, from: fromToken, force };
        const descriptorAfterRange = this._indexMap.findLastNotAfter(range[1]);
        const fromTokenIsInRange = fromToken &&
            fromToken.range[0] >= range[0] &&
            fromToken.range[1] <= range[1];
        const fromTokenDescriptor = fromTokenIsInRange && this._getOffsetDescriptor(fromToken);
        this._indexMap.deleteRange(range[0] + 1, range[1]);
        this._indexMap.insert(range[0], descriptorToInsert);
        if (fromTokenIsInRange) {
            this._indexMap.insert(fromToken.range[0], fromTokenDescriptor);
            this._indexMap.insert(fromToken.range[1], descriptorToInsert);
        }
        this._indexMap.insert(range[1], descriptorAfterRange);
    }
    getDesiredIndent(token) {
        if (!this._desiredIndentCache.has(token)) {
            if (this._ignoredTokens.has(token)) {
                this._desiredIndentCache.set(token, this._tokenInfo.getTokenIndent(token));
            }
            else if (this._lockedFirstTokens.has(token)) {
                const firstToken = this._lockedFirstTokens.get(token);
                this._desiredIndentCache.set(token, this.getDesiredIndent(this._tokenInfo.getFirstTokenOfLine(firstToken)) +
                    this._indentType.repeat(firstToken.loc.start.column -
                        this._tokenInfo.getFirstTokenOfLine(firstToken).loc.start
                            .column));
            }
            else {
                const offsetInfo = this._getOffsetDescriptor(token);
                const offset = offsetInfo.from &&
                    offsetInfo.from.loc.start.line === token.loc.start.line &&
                    !/^\s*?\n/u.test(token.value) &&
                    !offsetInfo.force
                    ? 0
                    : offsetInfo.offset * this._indentSize;
                this._desiredIndentCache.set(token, (offsetInfo.from ? this.getDesiredIndent(offsetInfo.from) : "") +
                    this._indentType.repeat(offset));
            }
        }
        return this._desiredIndentCache.get(token);
    }
    ignoreToken(token) {
        if (this._tokenInfo.isFirstTokenOfLine(token))
            this._ignoredTokens.add(token);
    }
    getFirstDependency(token) {
        return this._getOffsetDescriptor(token).from;
    }
}
const ELEMENT_LIST_SCHEMA = {
    oneOf: [
        {
            type: "integer",
            minimum: 0,
        },
        {
            type: "string",
            enum: ["first", "off"],
        },
    ],
};
exports.default = (0, utils_1.createRule)("indent", {
    meta: {
        docs: {
            description: "enforce consistent indentation",
            recommended: null,
            extensionRule: true,
            layout: true,
        },
        type: "layout",
        fixable: "whitespace",
        schema: [
            {
                oneOf: [
                    {
                        type: "string",
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
                    SwitchCase: {
                        type: "integer",
                        minimum: 0,
                        default: 0,
                    },
                    VariableDeclarator: {
                        oneOf: [
                            ELEMENT_LIST_SCHEMA,
                            {
                                type: "object",
                                properties: {
                                    var: ELEMENT_LIST_SCHEMA,
                                    let: ELEMENT_LIST_SCHEMA,
                                    const: ELEMENT_LIST_SCHEMA,
                                },
                                additionalProperties: false,
                            },
                        ],
                    },
                    outerIIFEBody: {
                        oneOf: [
                            {
                                type: "integer",
                                minimum: 0,
                            },
                            {
                                type: "string",
                                enum: ["off"],
                            },
                        ],
                    },
                    MemberExpression: {
                        oneOf: [
                            {
                                type: "integer",
                                minimum: 0,
                            },
                            {
                                type: "string",
                                enum: ["off"],
                            },
                        ],
                    },
                    FunctionDeclaration: {
                        type: "object",
                        properties: {
                            parameters: ELEMENT_LIST_SCHEMA,
                            body: {
                                type: "integer",
                                minimum: 0,
                            },
                        },
                        additionalProperties: false,
                    },
                    FunctionExpression: {
                        type: "object",
                        properties: {
                            parameters: ELEMENT_LIST_SCHEMA,
                            body: {
                                type: "integer",
                                minimum: 0,
                            },
                        },
                        additionalProperties: false,
                    },
                    StaticBlock: {
                        type: "object",
                        properties: {
                            body: {
                                type: "integer",
                                minimum: 0,
                            },
                        },
                        additionalProperties: false,
                    },
                    CallExpression: {
                        type: "object",
                        properties: {
                            arguments: ELEMENT_LIST_SCHEMA,
                        },
                        additionalProperties: false,
                    },
                    ArrayExpression: ELEMENT_LIST_SCHEMA,
                    ObjectExpression: ELEMENT_LIST_SCHEMA,
                    ImportDeclaration: ELEMENT_LIST_SCHEMA,
                    flatTernaryExpressions: {
                        type: "boolean",
                        default: false,
                    },
                    offsetTernaryExpressions: {
                        type: "boolean",
                        default: false,
                    },
                    ignoredNodes: {
                        type: "array",
                        items: {
                            type: "string",
                            not: {
                                pattern: ":exit$",
                            },
                        },
                    },
                    ignoreComments: {
                        type: "boolean",
                        default: false,
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            wrongIndentation: "Expected indentation of {{expected}} but found {{actual}}.",
        },
    },
    create(context) {
        var _a;
        const sourceCode = context.sourceCode;
        if (!sourceCode.parserServices.isJSON) {
            return {};
        }
        const DEFAULT_VARIABLE_INDENT = 1;
        const DEFAULT_PARAMETER_INDENT = 1;
        const DEFAULT_FUNCTION_BODY_INDENT = 1;
        let indentType = "space";
        let indentSize = 4;
        const options = {
            SwitchCase: 0,
            VariableDeclarator: {
                var: DEFAULT_VARIABLE_INDENT,
                let: DEFAULT_VARIABLE_INDENT,
                const: DEFAULT_VARIABLE_INDENT,
            },
            outerIIFEBody: 1,
            FunctionDeclaration: {
                parameters: DEFAULT_PARAMETER_INDENT,
                body: DEFAULT_FUNCTION_BODY_INDENT,
            },
            FunctionExpression: {
                parameters: DEFAULT_PARAMETER_INDENT,
                body: DEFAULT_FUNCTION_BODY_INDENT,
            },
            StaticBlock: {
                body: DEFAULT_FUNCTION_BODY_INDENT,
            },
            CallExpression: {
                arguments: DEFAULT_PARAMETER_INDENT,
            },
            MemberExpression: 1,
            ArrayExpression: 1,
            ObjectExpression: 1,
            ImportDeclaration: 1,
            flatTernaryExpressions: false,
            ignoredNodes: [],
            ignoreComments: false,
            offsetTernaryExpressions: false,
        };
        if (context.options.length) {
            if (context.options[0] === "tab") {
                indentSize = 1;
                indentType = "tab";
            }
            else {
                indentSize = (_a = context.options[0]) !== null && _a !== void 0 ? _a : indentSize;
                indentType = "space";
            }
            const userOptions = context.options[1];
            if (userOptions) {
                Object.assign(options, userOptions);
                if (typeof userOptions.VariableDeclarator === "number" ||
                    userOptions.VariableDeclarator === "first") {
                    options.VariableDeclarator = {
                        var: userOptions.VariableDeclarator,
                        let: userOptions.VariableDeclarator,
                        const: userOptions.VariableDeclarator,
                    };
                }
            }
        }
        const tokenInfo = new TokenInfo(sourceCode);
        const offsets = new OffsetStorage(tokenInfo, indentSize, indentType === "space" ? " " : "\t", sourceCode.text.length);
        const parameterParens = new WeakSet();
        function createErrorMessageData(expectedAmount, actualSpaces, actualTabs) {
            const expectedStatement = `${expectedAmount} ${indentType}${expectedAmount === 1 ? "" : "s"}`;
            const foundSpacesWord = `space${actualSpaces === 1 ? "" : "s"}`;
            const foundTabsWord = `tab${actualTabs === 1 ? "" : "s"}`;
            let foundStatement;
            if (actualSpaces > 0) {
                foundStatement =
                    indentType === "space"
                        ? actualSpaces
                        : `${actualSpaces} ${foundSpacesWord}`;
            }
            else if (actualTabs > 0) {
                foundStatement =
                    indentType === "tab" ? actualTabs : `${actualTabs} ${foundTabsWord}`;
            }
            else {
                foundStatement = "0";
            }
            return {
                expected: expectedStatement,
                actual: String(foundStatement),
            };
        }
        function report(token, neededIndent) {
            const actualIndent = Array.from(tokenInfo.getTokenIndent(token));
            const numSpaces = actualIndent.filter((char) => char === " ").length;
            const numTabs = actualIndent.filter((char) => char === "\t").length;
            context.report({
                node: token,
                messageId: "wrongIndentation",
                data: createErrorMessageData(neededIndent.length, numSpaces, numTabs),
                loc: {
                    start: { line: token.loc.start.line, column: 0 },
                    end: { line: token.loc.start.line, column: token.loc.start.column },
                },
                fix(fixer) {
                    const range = [
                        token.range[0] - token.loc.start.column,
                        token.range[0],
                    ];
                    const newText = neededIndent;
                    return fixer.replaceTextRange(range, newText);
                },
            });
        }
        function validateTokenIndent(token, desiredIndent) {
            const indentation = tokenInfo.getTokenIndent(token);
            return (indentation === desiredIndent ||
                (indentation.includes(" ") && indentation.includes("\t")));
        }
        function countTrailingLinebreaks(string) {
            const trailingWhitespace = /\s*$/u.exec(string)[0];
            const linebreakMatches = (0, eslint_ast_utils_1.createGlobalLinebreakMatcher)().exec(trailingWhitespace);
            return linebreakMatches === null ? 0 : linebreakMatches.length;
        }
        function addElementListIndent(elements, startToken, endToken, offset) {
            function getFirstToken(element) {
                let token = sourceCode.getTokenBefore(element);
                while ((0, eslint_utils_1.isOpeningParenToken)(token) && token !== startToken)
                    token = sourceCode.getTokenBefore(token);
                return sourceCode.getTokenAfter(token);
            }
            offsets.setDesiredOffsets([startToken.range[1], endToken.range[0]], startToken, typeof offset === "number" ? offset : 1);
            offsets.setDesiredOffset(endToken, startToken, 0);
            if (offset === "first" && elements.length && !elements[0])
                return;
            elements.forEach((element, index) => {
                if (!element) {
                    return;
                }
                if (offset === "off") {
                    offsets.ignoreToken(getFirstToken(element));
                }
                if (index === 0)
                    return;
                if (offset === "first" &&
                    tokenInfo.isFirstTokenOfLine(getFirstToken(element))) {
                    offsets.matchOffsetOf(getFirstToken(elements[0]), getFirstToken(element));
                }
                else {
                    const previousElement = elements[index - 1];
                    const firstTokenOfPreviousElement = previousElement && getFirstToken(previousElement);
                    const previousElementLastToken = previousElement && sourceCode.getLastToken(previousElement);
                    if (previousElement &&
                        previousElementLastToken.loc.end.line -
                            countTrailingLinebreaks(previousElementLastToken.value) >
                            startToken.loc.end.line) {
                        offsets.setDesiredOffsets([previousElement.range[1], element.range[1]], firstTokenOfPreviousElement, 0);
                    }
                }
            });
        }
        function addParensIndent(tokens) {
            const parenStack = [];
            const parenPairs = [];
            for (let i = 0; i < tokens.length; i++) {
                const nextToken = tokens[i];
                if ((0, eslint_utils_1.isOpeningParenToken)(nextToken))
                    parenStack.push(nextToken);
                else if ((0, eslint_utils_1.isClosingParenToken)(nextToken))
                    parenPairs.push({ left: parenStack.pop(), right: nextToken });
            }
            for (let i = parenPairs.length - 1; i >= 0; i--) {
                const leftParen = parenPairs[i].left;
                const rightParen = parenPairs[i].right;
                if (!parameterParens.has(leftParen) &&
                    !parameterParens.has(rightParen)) {
                    const parenthesizedTokens = new Set(sourceCode.getTokensBetween(leftParen, rightParen));
                    parenthesizedTokens.forEach((token) => {
                        if (!parenthesizedTokens.has(offsets.getFirstDependency(token)))
                            offsets.setDesiredOffset(token, leftParen, 1);
                    });
                }
                offsets.setDesiredOffset(rightParen, leftParen, 0);
            }
        }
        function ignoreNode(node) {
            const unknownNodeTokens = new Set(sourceCode.getTokens(node, { includeComments: true }));
            unknownNodeTokens.forEach((token) => {
                if (!unknownNodeTokens.has(offsets.getFirstDependency(token))) {
                    const firstTokenOfLine = tokenInfo.getFirstTokenOfLine(token);
                    if (token === firstTokenOfLine)
                        offsets.ignoreToken(token);
                    else
                        offsets.setDesiredOffset(token, firstTokenOfLine, 0);
                }
            });
        }
        function hasBlankLinesBetween(firstToken, secondToken) {
            const firstTokenLine = firstToken.loc.end.line;
            const secondTokenLine = secondToken.loc.start.line;
            if (firstTokenLine === secondTokenLine ||
                firstTokenLine === secondTokenLine - 1)
                return false;
            for (let line = firstTokenLine + 1; line < secondTokenLine; ++line) {
                if (!tokenInfo.firstTokensByLineNumber.has(line))
                    return true;
            }
            return false;
        }
        const ignoredNodeFirstTokens = new Set();
        const baseOffsetListeners = {
            JSONArrayExpression(node) {
                const openingBracket = sourceCode.getFirstToken(node);
                const closingBracket = sourceCode.getTokenAfter([...node.elements].reverse().find((_) => _) ||
                    openingBracket, eslint_utils_1.isClosingBracketToken);
                addElementListIndent(node.elements, openingBracket, closingBracket, options.ArrayExpression);
            },
            JSONObjectExpression(node) {
                const openingCurly = sourceCode.getFirstToken(node);
                const closingCurly = sourceCode.getTokenAfter(node.properties.length
                    ? node.properties[node.properties.length - 1]
                    : openingCurly, eslint_utils_1.isClosingBraceToken);
                addElementListIndent(node.properties, openingCurly, closingCurly, options.ObjectExpression);
            },
            JSONBinaryExpression(node) {
                const operator = sourceCode.getFirstTokenBetween(node.left, node.right, (token) => token.value === node.operator);
                const tokenAfterOperator = sourceCode.getTokenAfter(operator);
                offsets.ignoreToken(operator);
                offsets.ignoreToken(tokenAfterOperator);
                offsets.setDesiredOffset(tokenAfterOperator, operator, 0);
            },
            JSONProperty(node) {
                if (!node.shorthand && !node.method && node.kind === "init") {
                    const colon = sourceCode.getFirstTokenBetween(node.key, node.value, eslint_utils_1.isColonToken);
                    offsets.ignoreToken(sourceCode.getTokenAfter(colon));
                }
            },
            JSONTemplateLiteral(node) {
                node.expressions.forEach((_expression, index) => {
                    const previousQuasi = node.quasis[index];
                    const nextQuasi = node.quasis[index + 1];
                    const tokenToAlignFrom = previousQuasi.loc.start.line === previousQuasi.loc.end.line
                        ? sourceCode.getFirstToken(previousQuasi)
                        : null;
                    offsets.setDesiredOffsets([previousQuasi.range[1], nextQuasi.range[0]], tokenToAlignFrom, 1);
                    offsets.setDesiredOffset(sourceCode.getFirstToken(nextQuasi), tokenToAlignFrom, 0);
                });
            },
            "*"(node) {
                const firstToken = sourceCode.getFirstToken(node);
                if (firstToken && !ignoredNodeFirstTokens.has(firstToken))
                    offsets.setDesiredOffsets(node.range, firstToken, 0);
            },
        };
        const listenerCallQueue = [];
        const offsetListeners = {};
        for (const [selector, listener] of Object.entries(baseOffsetListeners)) {
            offsetListeners[selector] = (node) => listenerCallQueue.push({
                listener: listener,
                node,
            });
        }
        const ignoredNodes = new Set();
        function addToIgnoredNodes(node) {
            ignoredNodes.add(node);
            ignoredNodeFirstTokens.add(sourceCode.getFirstToken(node));
        }
        const ignoredNodeListeners = options.ignoredNodes.reduce((listeners, ignoredSelector) => Object.assign(listeners, { [ignoredSelector]: addToIgnoredNodes }), {});
        return Object.assign(offsetListeners, ignoredNodeListeners, {
            "*:exit"(node) {
                if (!KNOWN_NODES.has(node.type))
                    addToIgnoredNodes(node);
            },
            "Program:exit"() {
                var _a;
                if (options.ignoreComments) {
                    sourceCode
                        .getAllComments()
                        .forEach((comment) => offsets.ignoreToken(comment));
                }
                for (let i = 0; i < listenerCallQueue.length; i++) {
                    const nodeInfo = listenerCallQueue[i];
                    if (!ignoredNodes.has(nodeInfo.node))
                        (_a = nodeInfo.listener) === null || _a === void 0 ? void 0 : _a.call(nodeInfo, nodeInfo.node);
                }
                ignoredNodes.forEach(ignoreNode);
                addParensIndent(sourceCode.ast.tokens);
                const precedingTokens = new WeakMap();
                for (let i = 0; i < sourceCode.ast.comments.length; i++) {
                    const comment = sourceCode.ast.comments[i];
                    const tokenOrCommentBefore = sourceCode.getTokenBefore(comment, {
                        includeComments: true,
                    });
                    const hasToken = precedingTokens.has(tokenOrCommentBefore)
                        ? precedingTokens.get(tokenOrCommentBefore)
                        : tokenOrCommentBefore;
                    precedingTokens.set(comment, hasToken);
                }
                for (let i = 1; i < sourceCode.lines.length + 1; i++) {
                    if (!tokenInfo.firstTokensByLineNumber.has(i)) {
                        continue;
                    }
                    const firstTokenOfLine = tokenInfo.firstTokensByLineNumber.get(i);
                    if (firstTokenOfLine.loc.start.line !== i) {
                        continue;
                    }
                    if ((0, eslint_utils_1.isCommentToken)(firstTokenOfLine)) {
                        const tokenBefore = precedingTokens.get(firstTokenOfLine);
                        const tokenAfter = tokenBefore
                            ? sourceCode.getTokenAfter(tokenBefore)
                            : sourceCode.ast.tokens[0];
                        const mayAlignWithBefore = tokenBefore &&
                            !hasBlankLinesBetween(tokenBefore, firstTokenOfLine);
                        const mayAlignWithAfter = tokenAfter && !hasBlankLinesBetween(firstTokenOfLine, tokenAfter);
                        if (tokenAfter &&
                            (0, eslint_utils_1.isSemicolonToken)(tokenAfter) &&
                            !(0, eslint_ast_utils_1.isTokenOnSameLine)(firstTokenOfLine, tokenAfter))
                            offsets.setDesiredOffset(firstTokenOfLine, tokenAfter, 0);
                        if ((mayAlignWithBefore &&
                            validateTokenIndent(firstTokenOfLine, offsets.getDesiredIndent(tokenBefore))) ||
                            (mayAlignWithAfter &&
                                validateTokenIndent(firstTokenOfLine, offsets.getDesiredIndent(tokenAfter))))
                            continue;
                    }
                    if (validateTokenIndent(firstTokenOfLine, offsets.getDesiredIndent(firstTokenOfLine)))
                        continue;
                    report(firstTokenOfLine, offsets.getDesiredIndent(firstTokenOfLine));
                }
            },
        });
    },
});
