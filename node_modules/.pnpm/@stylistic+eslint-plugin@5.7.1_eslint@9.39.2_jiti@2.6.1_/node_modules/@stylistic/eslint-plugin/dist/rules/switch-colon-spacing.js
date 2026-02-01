import { A as getSwitchCaseColonToken, d as createRule, h as ast_exports } from "../utils.js";
var switch_colon_spacing_default = createRule({
	name: "switch-colon-spacing",
	meta: {
		type: "layout",
		docs: { description: "Enforce spacing around colons of switch statements" },
		fixable: "whitespace",
		schema: [{
			type: "object",
			properties: {
				before: { type: "boolean" },
				after: { type: "boolean" }
			},
			additionalProperties: false
		}],
		defaultOptions: [{
			before: false,
			after: true
		}],
		messages: {
			expectedBefore: "Expected space(s) before this colon.",
			expectedAfter: "Expected space(s) after this colon.",
			unexpectedBefore: "Unexpected space(s) before this colon.",
			unexpectedAfter: "Unexpected space(s) after this colon."
		}
	},
	create(context, [options]) {
		const sourceCode = context.sourceCode;
		const beforeSpacing = options.before === true;
		const afterSpacing = options.after !== false;
		function isValidSpacing(left, right, expected) {
			return (0, ast_exports.isClosingBraceToken)(right) || !(0, ast_exports.isTokenOnSameLine)(left, right) || sourceCode.isSpaceBetween(left, right) === expected;
		}
		function fix(fixer, left, right, spacing) {
			if (sourceCode.commentsExistBetween(left, right)) return null;
			if (spacing) return fixer.insertTextAfter(left, " ");
			return fixer.removeRange([left.range[1], right.range[0]]);
		}
		return { SwitchCase(node) {
			const colonToken = getSwitchCaseColonToken(node, sourceCode);
			const beforeToken = sourceCode.getTokenBefore(colonToken);
			const afterToken = sourceCode.getTokenAfter(colonToken);
			if (!isValidSpacing(beforeToken, colonToken, beforeSpacing)) context.report({
				node,
				loc: colonToken.loc,
				messageId: beforeSpacing ? "expectedBefore" : "unexpectedBefore",
				fix: (fixer) => fix(fixer, beforeToken, colonToken, beforeSpacing)
			});
			if (!isValidSpacing(colonToken, afterToken, afterSpacing)) context.report({
				node,
				loc: colonToken.loc,
				messageId: afterSpacing ? "expectedAfter" : "unexpectedAfter",
				fix: (fixer) => fix(fixer, colonToken, afterToken, afterSpacing)
			});
		} };
	}
});
export { switch_colon_spacing_default as t };
