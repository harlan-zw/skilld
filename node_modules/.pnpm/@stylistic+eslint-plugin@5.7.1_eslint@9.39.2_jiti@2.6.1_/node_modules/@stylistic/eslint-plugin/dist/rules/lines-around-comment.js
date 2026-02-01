import { I as isHashbangComment, _ as COMMENTS_IGNORE_PATTERN, d as createRule, h as ast_exports, m as AST_TOKEN_TYPES, p as AST_NODE_TYPES } from "../utils.js";
function getEmptyLineNums(lines) {
	const emptyLines = [];
	lines.forEach((line, i) => {
		if (!line.trim()) emptyLines.push(i + 1);
	});
	return emptyLines;
}
function getCommentLineNums(comments) {
	const lines = [];
	comments.forEach((token) => {
		const start = token.loc.start.line;
		const end = token.loc.end.line;
		lines.push(start, end);
	});
	return lines;
}
var lines_around_comment_default = createRule({
	name: "lines-around-comment",
	meta: {
		type: "layout",
		docs: { description: "Require empty lines around comments" },
		fixable: "whitespace",
		schema: [{
			type: "object",
			properties: {
				beforeBlockComment: { type: "boolean" },
				afterBlockComment: { type: "boolean" },
				beforeLineComment: { type: "boolean" },
				afterLineComment: { type: "boolean" },
				allowBlockStart: { type: "boolean" },
				allowBlockEnd: { type: "boolean" },
				allowClassStart: { type: "boolean" },
				allowClassEnd: { type: "boolean" },
				allowObjectStart: { type: "boolean" },
				allowObjectEnd: { type: "boolean" },
				allowArrayStart: { type: "boolean" },
				allowArrayEnd: { type: "boolean" },
				allowInterfaceStart: { type: "boolean" },
				allowInterfaceEnd: { type: "boolean" },
				allowTypeStart: { type: "boolean" },
				allowTypeEnd: { type: "boolean" },
				allowEnumStart: { type: "boolean" },
				allowEnumEnd: { type: "boolean" },
				allowModuleStart: { type: "boolean" },
				allowModuleEnd: { type: "boolean" },
				ignorePattern: { type: "string" },
				applyDefaultIgnorePatterns: { type: "boolean" },
				afterHashbangComment: { type: "boolean" }
			},
			additionalProperties: false
		}],
		defaultOptions: [{ beforeBlockComment: true }],
		messages: {
			after: "Expected line after comment.",
			before: "Expected line before comment."
		}
	},
	create(context, [options]) {
		const defaultIgnoreRegExp = COMMENTS_IGNORE_PATTERN;
		const { beforeBlockComment, afterBlockComment, beforeLineComment, afterLineComment, afterHashbangComment, allowBlockStart, allowBlockEnd, allowClassStart, allowClassEnd, allowObjectStart, allowObjectEnd, allowArrayStart, allowArrayEnd, allowInterfaceStart, allowInterfaceEnd, allowTypeStart, allowTypeEnd, allowEnumStart, allowEnumEnd, allowModuleStart, allowModuleEnd, applyDefaultIgnorePatterns, ignorePattern = "" } = options;
		const customIgnoreRegExp = ignorePattern ? new RegExp(ignorePattern, "u") : null;
		const sourceCode = context.sourceCode;
		const comments = sourceCode.getAllComments();
		const lines = sourceCode.lines;
		const numLines = lines.length + 1;
		const commentLines = getCommentLineNums(comments);
		const emptyLines = getEmptyLineNums(lines);
		const commentAndEmptyLines = new Set(commentLines.concat(emptyLines));
		function codeAroundComment(token) {
			let currentToken = token;
			do
				currentToken = sourceCode.getTokenBefore(currentToken, { includeComments: true });
			while (currentToken && (0, ast_exports.isCommentToken)(currentToken));
			if (currentToken && (0, ast_exports.isTokenOnSameLine)(currentToken, token)) return true;
			currentToken = token;
			do
				currentToken = sourceCode.getTokenAfter(currentToken, { includeComments: true });
			while (currentToken && (0, ast_exports.isCommentToken)(currentToken));
			if (currentToken && (0, ast_exports.isTokenOnSameLine)(token, currentToken)) return true;
			return false;
		}
		function isParentNodeType(parent, nodeType) {
			return parent.type === nodeType;
		}
		function getParentNodeOfToken(token) {
			const node = sourceCode.getNodeByRangeIndex(token.range[0]);
			if (node && node.type === "StaticBlock") {
				const openingBrace = sourceCode.getFirstToken(node, { skip: 1 });
				return openingBrace && token.range[0] >= openingBrace.range[0] ? node : null;
			}
			return node;
		}
		function isCommentAtParentStart(token, nodeType) {
			const parent = getParentNodeOfToken(token);
			if (parent && isParentNodeType(parent, nodeType)) {
				let parentStartNodeOrToken = parent;
				if (parent.type === "StaticBlock") parentStartNodeOrToken = sourceCode.getFirstToken(parent, { skip: 1 });
				else if (parent.type === "SwitchStatement") parentStartNodeOrToken = sourceCode.getTokenAfter(parent.discriminant, { filter: ast_exports.isOpeningBraceToken });
				return !!parentStartNodeOrToken && token.loc.start.line - parentStartNodeOrToken.loc.start.line === 1;
			}
			return false;
		}
		function isCommentAtParentEnd(token, nodeType) {
			const parent = getParentNodeOfToken(token);
			return !!parent && isParentNodeType(parent, nodeType) && parent.loc.end.line - token.loc.end.line === 1;
		}
		function isCommentAtBlockStart(token) {
			return isCommentAtParentStart(token, AST_NODE_TYPES.ClassBody) || isCommentAtParentStart(token, AST_NODE_TYPES.BlockStatement) || isCommentAtParentStart(token, AST_NODE_TYPES.StaticBlock) || isCommentAtParentStart(token, AST_NODE_TYPES.SwitchCase) || isCommentAtParentStart(token, AST_NODE_TYPES.SwitchStatement);
		}
		function isCommentAtBlockEnd(token) {
			return isCommentAtParentEnd(token, AST_NODE_TYPES.ClassBody) || isCommentAtParentEnd(token, AST_NODE_TYPES.BlockStatement) || isCommentAtParentEnd(token, AST_NODE_TYPES.StaticBlock) || isCommentAtParentEnd(token, AST_NODE_TYPES.SwitchCase) || isCommentAtParentEnd(token, AST_NODE_TYPES.SwitchStatement);
		}
		function isCommentAtClassStart(token) {
			return isCommentAtParentStart(token, AST_NODE_TYPES.ClassBody);
		}
		function isCommentAtClassEnd(token) {
			return isCommentAtParentEnd(token, AST_NODE_TYPES.ClassBody);
		}
		function isCommentAtObjectStart(token) {
			return isCommentAtParentStart(token, AST_NODE_TYPES.ObjectExpression) || isCommentAtParentStart(token, AST_NODE_TYPES.ObjectPattern);
		}
		function isCommentAtObjectEnd(token) {
			return isCommentAtParentEnd(token, AST_NODE_TYPES.ObjectExpression) || isCommentAtParentEnd(token, AST_NODE_TYPES.ObjectPattern);
		}
		function isCommentAtArrayStart(token) {
			return isCommentAtParentStart(token, AST_NODE_TYPES.ArrayExpression) || isCommentAtParentStart(token, AST_NODE_TYPES.ArrayPattern);
		}
		function isCommentAtArrayEnd(token) {
			return isCommentAtParentEnd(token, AST_NODE_TYPES.ArrayExpression) || isCommentAtParentEnd(token, AST_NODE_TYPES.ArrayPattern);
		}
		function isCommentAtInterfaceStart(token) {
			return isCommentAtParentStart(token, AST_NODE_TYPES.TSInterfaceBody);
		}
		function isCommentAtInterfaceEnd(token) {
			return isCommentAtParentEnd(token, AST_NODE_TYPES.TSInterfaceBody);
		}
		function isCommentAtTypeStart(token) {
			return isCommentAtParentStart(token, AST_NODE_TYPES.TSTypeLiteral);
		}
		function isCommentAtTypeEnd(token) {
			return isCommentAtParentEnd(token, AST_NODE_TYPES.TSTypeLiteral);
		}
		function isCommentAtEnumStart(token) {
			return isCommentAtParentStart(token, AST_NODE_TYPES.TSEnumBody) || isCommentAtParentStart(token, AST_NODE_TYPES.TSEnumDeclaration);
		}
		function isCommentAtEnumEnd(token) {
			return isCommentAtParentEnd(token, AST_NODE_TYPES.TSEnumBody) || isCommentAtParentEnd(token, AST_NODE_TYPES.TSEnumDeclaration);
		}
		function isCommentAtModuleStart(token) {
			return isCommentAtParentStart(token, AST_NODE_TYPES.TSModuleBlock);
		}
		function isCommentAtModuleEnd(token) {
			return isCommentAtParentEnd(token, AST_NODE_TYPES.TSModuleBlock);
		}
		function checkForEmptyLine(token, { before, after }) {
			if (applyDefaultIgnorePatterns !== false && defaultIgnoreRegExp.test(token.value)) return;
			if (customIgnoreRegExp?.test(token.value)) return;
			const prevLineNum = token.loc.start.line - 1;
			const nextLineNum = token.loc.end.line + 1;
			if (prevLineNum < 1) before = false;
			if (nextLineNum >= numLines) after = false;
			if (codeAroundComment(token)) return;
			const blockStartAllowed = Boolean(allowBlockStart) && isCommentAtBlockStart(token) && !(allowClassStart === false && isCommentAtClassStart(token));
			const blockEndAllowed = Boolean(allowBlockEnd) && isCommentAtBlockEnd(token) && !(allowClassEnd === false && isCommentAtClassEnd(token));
			const classStartAllowed = Boolean(allowClassStart) && isCommentAtClassStart(token);
			const classEndAllowed = Boolean(allowClassEnd) && isCommentAtClassEnd(token);
			const objectStartAllowed = Boolean(allowObjectStart) && isCommentAtObjectStart(token);
			const objectEndAllowed = Boolean(allowObjectEnd) && isCommentAtObjectEnd(token);
			const arrayStartAllowed = Boolean(allowArrayStart) && isCommentAtArrayStart(token);
			const arrayEndAllowed = Boolean(allowArrayEnd) && isCommentAtArrayEnd(token);
			const interfaceStartAllowed = Boolean(allowInterfaceStart) && isCommentAtInterfaceStart(token);
			const interfaceEndAllowed = Boolean(allowInterfaceEnd) && isCommentAtInterfaceEnd(token);
			const typeStartAllowed = Boolean(allowTypeStart) && isCommentAtTypeStart(token);
			const typeEndAllowed = Boolean(allowTypeEnd) && isCommentAtTypeEnd(token);
			const enumStartAllowed = Boolean(allowEnumStart) && isCommentAtEnumStart(token);
			const enumEndAllowed = Boolean(allowEnumEnd) && isCommentAtEnumEnd(token);
			const moduleStartAllowed = Boolean(allowModuleStart) && isCommentAtModuleStart(token);
			const moduleEndAllowed = Boolean(allowModuleEnd) && isCommentAtModuleEnd(token);
			const exceptionStartAllowed = blockStartAllowed || classStartAllowed || objectStartAllowed || arrayStartAllowed || interfaceStartAllowed || typeStartAllowed || enumStartAllowed || moduleStartAllowed;
			const exceptionEndAllowed = blockEndAllowed || classEndAllowed || objectEndAllowed || arrayEndAllowed || interfaceEndAllowed || typeEndAllowed || enumEndAllowed || moduleEndAllowed;
			const previousTokenOrComment = sourceCode.getTokenBefore(token, { includeComments: true });
			const nextTokenOrComment = sourceCode.getTokenAfter(token, { includeComments: true });
			if (!exceptionStartAllowed && before && !commentAndEmptyLines.has(prevLineNum) && !((0, ast_exports.isCommentToken)(previousTokenOrComment) && (0, ast_exports.isTokenOnSameLine)(previousTokenOrComment, token))) {
				const lineStart = token.range[0] - token.loc.start.column;
				const range = [lineStart, lineStart];
				context.report({
					node: token,
					messageId: "before",
					fix(fixer) {
						return fixer.insertTextBeforeRange(range, "\n");
					}
				});
			}
			if (!exceptionEndAllowed && after && !commentAndEmptyLines.has(nextLineNum) && !((0, ast_exports.isCommentToken)(nextTokenOrComment) && (0, ast_exports.isTokenOnSameLine)(token, nextTokenOrComment))) context.report({
				node: token,
				messageId: "after",
				fix(fixer) {
					return fixer.insertTextAfter(token, "\n");
				}
			});
		}
		return { Program() {
			comments.forEach((token) => {
				if (token.type === AST_TOKEN_TYPES.Line) {
					if (beforeLineComment || afterLineComment) checkForEmptyLine(token, {
						after: afterLineComment,
						before: beforeLineComment
					});
				} else if (token.type === AST_TOKEN_TYPES.Block) {
					if (beforeBlockComment || afterBlockComment) checkForEmptyLine(token, {
						after: afterBlockComment,
						before: beforeBlockComment
					});
				} else if (isHashbangComment(token)) {
					if (afterHashbangComment) checkForEmptyLine(token, {
						after: afterHashbangComment,
						before: false
					});
				}
			});
		} };
	}
});
export { lines_around_comment_default as t };
