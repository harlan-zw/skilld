"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatternSource = exports.PatternReplaceRange = void 0;
const utils_1 = require("./utils");
class PatternReplaceRange {
    constructor(range, type) {
        if (!range || range[0] < 0 || range[0] > range[1]) {
            throw new Error(`Invalid range: ${JSON.stringify(range)}`);
        }
        this.range = range;
        this.type = type;
    }
    static fromLiteral(node, sourceCode, nodeRange, range) {
        if (!node.range) {
            return null;
        }
        const start = range.start - nodeRange.start;
        const end = range.end - nodeRange.start;
        if ((0, utils_1.isRegexpLiteral)(node)) {
            const nodeStart = node.range[0] + "/".length;
            return new PatternReplaceRange([nodeStart + start, nodeStart + end], "RegExp");
        }
        if ((0, utils_1.isStringLiteral)(node)) {
            const astRange = (0, utils_1.getStringValueRange)(sourceCode, node, start, end);
            if (astRange) {
                const quote = sourceCode.text[node.range[0]];
                return new PatternReplaceRange(astRange, quote === "'" ? "SingleQuotedString" : "DoubleQuotedString");
            }
        }
        return null;
    }
    getAstLocation(sourceCode) {
        return (0, utils_1.astRangeToLocation)(sourceCode, this.range);
    }
    escape(text) {
        if (this.type === "DoubleQuotedString" ||
            this.type === "SingleQuotedString") {
            const base = text
                .replace(/\\/gu, "\\\\")
                .replace(/\n/gu, "\\n")
                .replace(/\r/gu, "\\r")
                .replace(/\t/gu, "\\t");
            if (this.type === "DoubleQuotedString") {
                return base.replace(/"/gu, '\\"');
            }
            return base.replace(/'/gu, "\\'");
        }
        return text.replace(/\n/gu, "\\n").replace(/\r/gu, "\\r");
    }
    replace(fixer, text) {
        return fixer.replaceTextRange(this.range, this.escape(text));
    }
    remove(fixer) {
        return fixer.removeRange(this.range);
    }
    insertAfter(fixer, text) {
        return fixer.insertTextAfterRange(this.range, this.escape(text));
    }
    insertBefore(fixer, text) {
        return fixer.insertTextBeforeRange(this.range, this.escape(text));
    }
}
exports.PatternReplaceRange = PatternReplaceRange;
class PatternSegment {
    constructor(sourceCode, node, value, start) {
        this.sourceCode = sourceCode;
        this.node = node;
        this.value = value;
        this.start = start;
        this.end = start + value.length;
    }
    contains(range) {
        return this.start <= range.start && range.end <= this.end;
    }
    getOwnedRegExpLiteral() {
        if ((0, utils_1.isRegexpLiteral)(this.node)) {
            return this.node;
        }
        if (this.node.type === "MemberExpression" &&
            this.node.object.type !== "Super" &&
            (0, utils_1.isRegexpLiteral)(this.node.object) &&
            (0, utils_1.getPropertyName)(this.node) === "source") {
            return this.node.object;
        }
        return null;
    }
    getReplaceRange(range) {
        if (!this.contains(range)) {
            return null;
        }
        const regexp = this.getOwnedRegExpLiteral();
        if (regexp) {
            return PatternReplaceRange.fromLiteral(regexp, this.sourceCode, this, range);
        }
        if (this.node.type === "Literal") {
            return PatternReplaceRange.fromLiteral(this.node, this.sourceCode, this, range);
        }
        return null;
    }
    getAstRange(range) {
        const replaceRange = this.getReplaceRange(range);
        if (replaceRange) {
            return replaceRange.range;
        }
        return this.node.range;
    }
}
class PatternSource {
    isStringValue() {
        return this.regexpValue === null;
    }
    constructor(sourceCode, node, value, segments, regexpValue) {
        this.sourceCode = sourceCode;
        this.node = node;
        this.value = value;
        this.segments = segments;
        this.regexpValue = regexpValue;
    }
    static fromExpression(context, expression) {
        expression = (0, utils_1.dereferenceOwnedVariable)(context, expression);
        if ((0, utils_1.isRegexpLiteral)(expression)) {
            return PatternSource.fromRegExpLiteral(context, expression);
        }
        const sourceCode = context.sourceCode;
        const flat = flattenPlus(context, expression);
        const items = [];
        let value = "";
        for (const e of flat) {
            if (e.type === "PrivateIdentifier")
                return null;
            const staticValue = (0, utils_1.getStaticValue)(context, e);
            if (!staticValue) {
                return null;
            }
            if (flat.length === 1 && staticValue.value instanceof RegExp) {
                return PatternSource.fromRegExpObject(context, e, staticValue.value.source, staticValue.value.flags);
            }
            if (typeof staticValue.value !== "string") {
                return null;
            }
            items.push(new PatternSegment(sourceCode, e, staticValue.value, value.length));
            value += staticValue.value;
        }
        return new PatternSource(sourceCode, expression, value, items, null);
    }
    static fromRegExpObject(context, expression, source, flags) {
        const sourceCode = context.sourceCode;
        return new PatternSource(sourceCode, expression, source, [new PatternSegment(sourceCode, expression, source, 0)], {
            source,
            flags,
            ownedNode: null,
        });
    }
    static fromRegExpLiteral(context, expression) {
        const sourceCode = context.sourceCode;
        return new PatternSource(sourceCode, expression, expression.regex.pattern, [
            new PatternSegment(sourceCode, expression, expression.regex.pattern, 0),
        ], {
            source: expression.regex.pattern,
            flags: expression.regex.flags,
            ownedNode: expression,
        });
    }
    getSegment(range) {
        const segments = this.getSegments(range);
        if (segments.length === 1) {
            return segments[0];
        }
        return null;
    }
    getSegments(range) {
        return this.segments.filter((item) => item.start < range.end && range.start < item.end);
    }
    getReplaceRange(range) {
        const segment = this.getSegment(range);
        if (segment) {
            return segment.getReplaceRange(range);
        }
        return null;
    }
    getAstRange(range) {
        const overlapping = this.getSegments(range);
        if (overlapping.length === 1) {
            return overlapping[0].getAstRange(range);
        }
        let min = Infinity;
        let max = -Infinity;
        for (const item of overlapping) {
            min = Math.min(min, item.node.range[0]);
            max = Math.max(max, item.node.range[1]);
        }
        if (min > max) {
            return this.node.range;
        }
        return [min, max];
    }
    getAstLocation(range) {
        return (0, utils_1.astRangeToLocation)(this.sourceCode, this.getAstRange(range));
    }
    getOwnedRegExpLiterals() {
        const literals = [];
        for (const segment of this.segments) {
            const regexp = segment.getOwnedRegExpLiteral();
            if (regexp) {
                literals.push(regexp);
            }
        }
        return literals;
    }
}
exports.PatternSource = PatternSource;
function flattenPlus(context, e) {
    if (e.type === "BinaryExpression" && e.operator === "+") {
        return [
            ...(e.left.type !== "PrivateIdentifier"
                ? flattenPlus(context, e.left)
                : [e.left]),
            ...flattenPlus(context, e.right),
        ];
    }
    const deRef = (0, utils_1.dereferenceOwnedVariable)(context, e);
    if (deRef !== e) {
        return flattenPlus(context, deRef);
    }
    return [e];
}
