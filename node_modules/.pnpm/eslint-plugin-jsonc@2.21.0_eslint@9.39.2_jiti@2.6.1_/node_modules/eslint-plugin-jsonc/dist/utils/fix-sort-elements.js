"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixToMoveDownForSorting = fixToMoveDownForSorting;
exports.fixToMoveUpForSorting = fixToMoveUpForSorting;
const eslint_utils_1 = require("@eslint-community/eslint-utils");
function* fixToMoveDownForSorting(fixer, sourceCode, target, to) {
    const targetInfo = calcTargetMoveDownInfo(sourceCode, target);
    const toEndInfo = getElementEndInfo(sourceCode, to);
    let { insertCode, removeRanges, hasLeadingComma } = targetInfo;
    if (toEndInfo.trailingComma) {
        if (hasLeadingComma &&
            toEndInfo.last.range[1] <= toEndInfo.trailingComma.range[0]) {
            yield fixer.removeRange(toEndInfo.trailingComma.range);
        }
        hasLeadingComma = true;
        insertCode = targetInfo.withTrailingComma.insertCode;
        removeRanges = targetInfo.withTrailingComma.removeRanges;
    }
    let insertRange = [
        toEndInfo.last.range[1],
        toEndInfo.last.range[1],
    ];
    const toNextToken = sourceCode.getTokenAfter(toEndInfo.last, {
        includeComments: true,
    });
    if (toNextToken.loc.start.line - toEndInfo.last.loc.end.line > 1) {
        const offset = sourceCode.getIndexFromLoc({
            line: toNextToken.loc.start.line - 1,
            column: 0,
        });
        insertRange = [offset, offset];
    }
    if (!hasLeadingComma) {
        if (to.node) {
            yield fixer.insertTextAfterRange(getLastTokenOfNode(sourceCode, to.node).range, ",");
        }
        else {
            yield fixer.insertTextBeforeRange(to.after.range, ",");
        }
    }
    yield fixer.insertTextAfterRange(insertRange, insertCode);
    for (const removeRange of removeRanges) {
        yield fixer.removeRange(removeRange);
    }
}
function* fixToMoveUpForSorting(fixer, sourceCode, target, to) {
    const targetInfo = calcTargetMoveUpInfo(sourceCode, target);
    const toPrevInfo = getPrevElementInfo(sourceCode, to);
    if (toPrevInfo.leadingComma &&
        toPrevInfo.prevLast.range[1] <= toPrevInfo.leadingComma.range[0]) {
        yield fixer.removeRange(toPrevInfo.leadingComma.range);
    }
    let insertRange = [
        toPrevInfo.prevLast.range[1],
        toPrevInfo.prevLast.range[1],
    ];
    const toBeforeNextToken = sourceCode.getTokenAfter(toPrevInfo.prevLast, {
        includeComments: true,
    });
    if (toBeforeNextToken.loc.start.line - toPrevInfo.prevLast.loc.end.line >
        1) {
        const offset = sourceCode.getIndexFromLoc({
            line: toBeforeNextToken.loc.start.line - 1,
            column: 0,
        });
        insertRange = [offset, offset];
    }
    yield fixer.insertTextAfterRange(insertRange, targetInfo.insertCode);
    for (const removeRange of targetInfo.removeRanges) {
        yield fixer.removeRange(removeRange);
    }
}
function calcTargetMoveDownInfo(sourceCode, target) {
    const nodeStartIndex = target.node
        ? getFirstTokenOfNode(sourceCode, target.node).range[0]
        : target.before.range[1];
    const endInfo = getElementEndInfo(sourceCode, target);
    const prevInfo = getPrevElementInfo(sourceCode, target);
    let insertCode = sourceCode.text.slice(prevInfo.prevLast.range[1], nodeStartIndex);
    const removeRanges = [
        [prevInfo.prevLast.range[1], nodeStartIndex],
    ];
    const hasLeadingComma = prevInfo.leadingComma &&
        prevInfo.prevLast.range[1] <= prevInfo.leadingComma.range[0];
    let withTrailingComma;
    const suffixRange = [nodeStartIndex, endInfo.last.range[1]];
    const suffix = sourceCode.text.slice(...suffixRange);
    if (endInfo.trailingComma &&
        endInfo.trailingComma.range[1] <= endInfo.last.range[1]) {
        withTrailingComma = {
            insertCode: `${insertCode}${suffix}`,
            removeRanges: [...removeRanges, suffixRange],
        };
        insertCode += `${sourceCode.text.slice(nodeStartIndex, endInfo.trailingComma.range[0])}${sourceCode.text.slice(endInfo.trailingComma.range[1], endInfo.last.range[1])}`;
        if (!hasLeadingComma) {
            if (endInfo.trailingComma) {
                removeRanges.push(endInfo.trailingComma.range);
            }
        }
        removeRanges.push([nodeStartIndex, endInfo.trailingComma.range[0]], [endInfo.trailingComma.range[1], endInfo.last.range[1]]);
    }
    else {
        if (!hasLeadingComma) {
            if (endInfo.trailingComma) {
                removeRanges.push(endInfo.trailingComma.range);
            }
        }
        withTrailingComma = {
            insertCode: `${insertCode},${suffix}`,
            removeRanges: [...removeRanges, suffixRange],
        };
        insertCode += suffix;
        removeRanges.push(suffixRange);
    }
    return {
        insertCode,
        removeRanges,
        hasLeadingComma: Boolean(hasLeadingComma),
        withTrailingComma,
    };
}
function calcTargetMoveUpInfo(sourceCode, target) {
    const nodeEndIndex = target.node
        ? getLastTokenOfNode(sourceCode, target.node).range[1]
        : target.after.range[0];
    const endInfo = getElementEndInfo(sourceCode, target);
    const prevInfo = getPrevElementInfo(sourceCode, target);
    let insertCode;
    const removeRanges = [];
    if (prevInfo.leadingComma &&
        prevInfo.prevLast.range[1] <= prevInfo.leadingComma.range[0]) {
        insertCode = `${sourceCode.text.slice(prevInfo.prevLast.range[1], prevInfo.leadingComma.range[0])}${sourceCode.text.slice(prevInfo.leadingComma.range[1], nodeEndIndex)}`;
        removeRanges.push([prevInfo.prevLast.range[1], prevInfo.leadingComma.range[0]], [prevInfo.leadingComma.range[1], nodeEndIndex]);
    }
    else {
        insertCode = sourceCode.text.slice(prevInfo.prevLast.range[1], nodeEndIndex);
        removeRanges.push([prevInfo.prevLast.range[1], nodeEndIndex]);
    }
    const hasTrailingComma = endInfo.trailingComma &&
        endInfo.trailingComma.range[1] <= endInfo.last.range[1];
    if (!hasTrailingComma) {
        insertCode += ",";
        if (prevInfo.leadingComma) {
            removeRanges.push(prevInfo.leadingComma.range);
        }
    }
    insertCode += sourceCode.text.slice(nodeEndIndex, endInfo.last.range[1]);
    removeRanges.push([nodeEndIndex, endInfo.last.range[1]]);
    return {
        insertCode,
        removeRanges,
    };
}
function getFirstTokenOfNode(sourceCode, node) {
    let token = sourceCode.getFirstToken(node);
    let target = token;
    while ((target = sourceCode.getTokenBefore(token)) &&
        (0, eslint_utils_1.isOpeningParenToken)(target)) {
        token = target;
    }
    return token;
}
function getLastTokenOfNode(sourceCode, node) {
    let token = sourceCode.getLastToken(node);
    let target = token;
    while ((target = sourceCode.getTokenAfter(token)) &&
        (0, eslint_utils_1.isClosingParenToken)(target)) {
        token = target;
    }
    return token;
}
function getElementEndInfo(sourceCode, target) {
    const afterToken = target.node
        ? sourceCode.getTokenAfter(getLastTokenOfNode(sourceCode, target.node))
        : target.after;
    if ((0, eslint_utils_1.isNotCommaToken)(afterToken)) {
        return {
            trailingComma: null,
            nextElement: null,
            last: getLastTokenWithTrailingComments(sourceCode, target),
        };
    }
    const comma = afterToken;
    const nextElement = sourceCode.getTokenAfter(afterToken);
    if ((0, eslint_utils_1.isCommaToken)(nextElement)) {
        return {
            trailingComma: comma,
            nextElement: null,
            last: comma,
        };
    }
    if ((0, eslint_utils_1.isClosingBraceToken)(nextElement) || (0, eslint_utils_1.isClosingBracketToken)(nextElement)) {
        return {
            trailingComma: comma,
            nextElement: null,
            last: getLastTokenWithTrailingComments(sourceCode, target),
        };
    }
    const node = target.node;
    if (node && node.loc.end.line === nextElement.loc.start.line) {
        return {
            trailingComma: comma,
            nextElement,
            last: comma,
        };
    }
    if (node &&
        node.loc.end.line < comma.loc.start.line &&
        comma.loc.end.line < nextElement.loc.start.line) {
        return {
            trailingComma: comma,
            nextElement,
            last: comma,
        };
    }
    return {
        trailingComma: comma,
        nextElement,
        last: getLastTokenWithTrailingComments(sourceCode, target),
    };
}
function getLastTokenWithTrailingComments(sourceCode, target) {
    if (!target.node) {
        return sourceCode.getTokenBefore(target.after, {
            includeComments: true,
        });
    }
    const node = target.node;
    let last = getLastTokenOfNode(sourceCode, node);
    let after;
    while ((after = sourceCode.getTokenAfter(last, {
        includeComments: true,
    })) &&
        ((0, eslint_utils_1.isCommentToken)(after) || (0, eslint_utils_1.isCommaToken)(after)) &&
        node.loc.end.line === after.loc.end.line) {
        last = after;
    }
    return last;
}
function getPrevElementInfo(sourceCode, target) {
    const beforeToken = target.node
        ? sourceCode.getTokenBefore(getFirstTokenOfNode(sourceCode, target.node))
        : target.before;
    if ((0, eslint_utils_1.isNotCommaToken)(beforeToken)) {
        return {
            prevElement: null,
            leadingComma: null,
            prevLast: beforeToken,
        };
    }
    const comma = beforeToken;
    const prevElement = sourceCode.getTokenBefore(beforeToken);
    if ((0, eslint_utils_1.isCommaToken)(prevElement)) {
        return {
            prevElement: null,
            leadingComma: comma,
            prevLast: comma,
        };
    }
    const endInfo = getElementEndInfo(sourceCode, { node: prevElement });
    return {
        prevElement,
        leadingComma: endInfo.trailingComma,
        prevLast: endInfo.last,
    };
}
