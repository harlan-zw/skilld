"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasTabIndent = hasTabIndent;
exports.calcExpectIndentForPairs = calcExpectIndentForPairs;
exports.calcExpectIndentForEntries = calcExpectIndentForEntries;
exports.getActualIndent = getActualIndent;
exports.getActualIndentFromLine = getActualIndentFromLine;
exports.incIndent = incIndent;
exports.decIndent = decIndent;
exports.getNumOfIndent = getNumOfIndent;
exports.compareIndent = compareIndent;
exports.isKeyNode = isKeyNode;
exports.unwrapMeta = unwrapMeta;
exports.processIndentFix = processIndentFix;
exports.fixIndent = fixIndent;
const ast_utils_1 = require("./ast-utils");
const compat_1 = require("./compat");
function hasTabIndent(context) {
    for (const line of (0, compat_1.getSourceCode)(context).getLines()) {
        if (/^\s*\t/u.test(line)) {
            return true;
        }
        if (/^\s*-\s*\t/u.test(line)) {
            return true;
        }
    }
    return false;
}
function calcExpectIndentForPairs(mapping, context) {
    const sourceCode = (0, compat_1.getSourceCode)(context);
    let parentNode = mapping.parent;
    if (parentNode.type === "YAMLWithMeta") {
        const before = sourceCode.getTokenBefore(parentNode);
        if (before == null || before.loc.end.line < parentNode.loc.start.line) {
            return calcExpectIndentFromBaseNode(parentNode, mapping.pairs[0], context);
        }
        parentNode = parentNode.parent;
    }
    if (parentNode.type === "YAMLDocument") {
        const mappingIndent = getActualIndent(mapping, context);
        const firstPairIndent = getActualIndent(mapping.pairs[0], context);
        if (mappingIndent == null) {
            return firstPairIndent;
        }
        if (firstPairIndent != null &&
            compareIndent(mappingIndent, firstPairIndent) < 0) {
            return firstPairIndent;
        }
        return mappingIndent;
    }
    if (parentNode.type === "YAMLSequence") {
        const hyphen = sourceCode.getTokenBefore(mapping);
        if (!(0, ast_utils_1.isHyphen)(hyphen)) {
            return null;
        }
        if (hyphen.loc.start.line === mapping.loc.start.line) {
            const hyphenIndent = getActualIndent(hyphen, context);
            if (hyphenIndent == null) {
                return null;
            }
            const offsetIndent = sourceCode.text.slice(hyphen.range[1], mapping.range[0]);
            return `${hyphenIndent} ${offsetIndent}`;
        }
        return getActualIndent(mapping, context);
    }
    if (parentNode.type !== "YAMLPair") {
        return null;
    }
    return calcExpectIndentFromBaseNode(parentNode, mapping.pairs[0], context);
}
function calcExpectIndentForEntries(sequence, context) {
    const sourceCode = (0, compat_1.getSourceCode)(context);
    let parentNode = sequence.parent;
    if (parentNode.type === "YAMLWithMeta") {
        const before = sourceCode.getTokenBefore(parentNode);
        if (before == null || before.loc.end.line < parentNode.loc.start.line) {
            return calcExpectIndentFromBaseNode(parentNode, sequence.entries[0], context);
        }
        parentNode = parentNode.parent;
    }
    if (parentNode.type === "YAMLDocument") {
        const sequenceIndent = getActualIndent(sequence, context);
        const firstPairIndent = getActualIndent(sequence.entries[0], context);
        if (sequenceIndent == null) {
            return firstPairIndent;
        }
        if (firstPairIndent != null &&
            compareIndent(sequenceIndent, firstPairIndent) < 0) {
            return firstPairIndent;
        }
        return sequenceIndent;
    }
    if (parentNode.type === "YAMLSequence") {
        const hyphen = sourceCode.getTokenBefore(sequence);
        if (!(0, ast_utils_1.isHyphen)(hyphen)) {
            return null;
        }
        if (hyphen.loc.start.line === sequence.loc.start.line) {
            const hyphenIndent = getActualIndent(hyphen, context);
            if (hyphenIndent == null) {
                return null;
            }
            const offsetIndent = sourceCode.text.slice(hyphen.range[1], sequence.range[0]);
            return `${hyphenIndent} ${offsetIndent}`;
        }
        return getActualIndent(sequence, context);
    }
    if (parentNode.type !== "YAMLPair") {
        return null;
    }
    return calcExpectIndentFromBaseNode(parentNode, sequence.entries[0], context);
}
function calcExpectIndentFromBaseNode(baseNode, node, context) {
    const baseIndent = getActualIndent(baseNode, context);
    if (baseIndent == null) {
        return null;
    }
    const indent = getActualIndent(node, context);
    if (indent != null && compareIndent(baseIndent, indent) < 0) {
        return indent;
    }
    return incIndent(baseIndent, context);
}
function getActualIndent(node, context) {
    const sourceCode = (0, compat_1.getSourceCode)(context);
    const before = sourceCode.getTokenBefore(node, { includeComments: true });
    if (!before || before.loc.end.line < node.loc.start.line) {
        return getActualIndentFromLine(node.loc.start.line, context);
    }
    return null;
}
function getActualIndentFromLine(line, context) {
    const sourceCode = (0, compat_1.getSourceCode)(context);
    const lineText = sourceCode.getLines()[line - 1];
    return /^[^\S\n\r\u2028\u2029]*/u.exec(lineText)[0];
}
function incIndent(indent, context) {
    const numOfIndent = getNumOfIndent(context);
    const add = numOfIndent === 2
        ? "  "
        : numOfIndent === 4
            ? "    "
            : " ".repeat(numOfIndent);
    return `${indent}${add}`;
}
function decIndent(indent, context) {
    const numOfIndent = getNumOfIndent(context);
    return " ".repeat(indent.length - numOfIndent);
}
function getNumOfIndent(context, optionValue) {
    var _a, _b;
    const num = optionValue !== null && optionValue !== void 0 ? optionValue : (_b = (_a = context.settings) === null || _a === void 0 ? void 0 : _a.yml) === null || _b === void 0 ? void 0 : _b.indent;
    return num == null || num < 2 ? 2 : num;
}
function compareIndent(a, b) {
    const minLen = Math.min(a.length, b.length);
    for (let index = 0; index < minLen; index++) {
        if (a[index] !== b[index]) {
            return NaN;
        }
    }
    return a.length > b.length ? 1 : a.length < b.length ? -1 : 0;
}
function isKeyNode(node) {
    if (node.parent.type === "YAMLWithMeta") {
        return isKeyNode(node.parent);
    }
    return node.parent.type === "YAMLPair" && node.parent.key === node;
}
function unwrapMeta(node) {
    if (!node) {
        return node;
    }
    if (node.type === "YAMLWithMeta") {
        return node.value;
    }
    return node;
}
function* processIndentFix(fixer, baseIndent, targetNode, context) {
    const sourceCode = (0, compat_1.getSourceCode)(context);
    if (targetNode.type === "YAMLWithMeta") {
        yield* metaIndent(targetNode);
        return;
    }
    if (targetNode.type === "YAMLPair") {
        yield* pairIndent(targetNode);
        return;
    }
    yield* contentIndent(targetNode);
    function* contentIndent(contentNode) {
        const actualIndent = getActualIndent(contentNode, context);
        if (actualIndent != null && compareIndent(baseIndent, actualIndent) < 0) {
            return;
        }
        let nextBaseIndent = baseIndent;
        const expectValueIndent = incIndent(baseIndent, context);
        if (actualIndent != null) {
            yield fixIndent(fixer, sourceCode, expectValueIndent, contentNode);
            nextBaseIndent = expectValueIndent;
        }
        if (contentNode.type === "YAMLMapping") {
            for (const p of contentNode.pairs) {
                yield* processIndentFix(fixer, nextBaseIndent, p, context);
            }
            if (contentNode.style === "flow") {
                const close = sourceCode.getLastToken(contentNode);
                if (close.value === "}") {
                    const closeActualIndent = getActualIndent(close, context);
                    if (closeActualIndent != null &&
                        compareIndent(closeActualIndent, nextBaseIndent) < 0) {
                        yield fixIndent(fixer, sourceCode, nextBaseIndent, close);
                    }
                }
            }
        }
        else if (contentNode.type === "YAMLSequence") {
            for (const e of contentNode.entries) {
                if (!e) {
                    continue;
                }
                yield* processIndentFix(fixer, nextBaseIndent, e, context);
            }
        }
    }
    function* metaIndent(metaNode) {
        let nextBaseIndent = baseIndent;
        const actualIndent = getActualIndent(metaNode, context);
        if (actualIndent != null) {
            if (compareIndent(baseIndent, actualIndent) < 0) {
                nextBaseIndent = actualIndent;
            }
            else {
                const expectMetaIndent = incIndent(baseIndent, context);
                yield fixIndent(fixer, sourceCode, expectMetaIndent, metaNode);
                nextBaseIndent = expectMetaIndent;
            }
        }
        if (metaNode.value) {
            yield* processIndentFix(fixer, nextBaseIndent, metaNode.value, context);
        }
    }
    function* pairIndent(pairNode) {
        let nextBaseIndent = baseIndent;
        const actualIndent = getActualIndent(pairNode, context);
        if (actualIndent != null) {
            if (compareIndent(baseIndent, actualIndent) < 0) {
                nextBaseIndent = actualIndent;
            }
            else {
                const expectKeyIndent = incIndent(baseIndent, context);
                yield fixIndent(fixer, sourceCode, expectKeyIndent, pairNode);
                nextBaseIndent = expectKeyIndent;
            }
        }
        if (pairNode.value) {
            yield* processIndentFix(fixer, nextBaseIndent, pairNode.value, context);
        }
    }
}
function fixIndent(fixer, sourceCode, indent, node) {
    const prevToken = sourceCode.getTokenBefore(node, {
        includeComments: true,
    });
    return fixer.replaceTextRange([prevToken.range[1], node.range[0]], `\n${indent}`);
}
