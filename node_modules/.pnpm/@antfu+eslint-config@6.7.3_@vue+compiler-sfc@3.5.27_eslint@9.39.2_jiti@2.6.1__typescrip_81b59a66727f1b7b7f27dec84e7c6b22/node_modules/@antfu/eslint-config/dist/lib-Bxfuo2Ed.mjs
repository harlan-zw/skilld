import Module, { createRequire } from "node:module";

//#region rolldown:runtime
var __commonJSMin = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __require = /* @__PURE__ */ createRequire(import.meta.url);

//#endregion
//#region node_modules/.pnpm/eslint-visitor-keys@3.4.3/node_modules/eslint-visitor-keys/dist/eslint-visitor-keys.cjs
var require_eslint_visitor_keys$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	/**
	* @typedef {{ readonly [type: string]: ReadonlyArray<string> }} VisitorKeys
	*/
	/**
	* @type {VisitorKeys}
	*/
	const KEYS = {
		ArrayExpression: ["elements"],
		ArrayPattern: ["elements"],
		ArrowFunctionExpression: ["params", "body"],
		AssignmentExpression: ["left", "right"],
		AssignmentPattern: ["left", "right"],
		AwaitExpression: ["argument"],
		BinaryExpression: ["left", "right"],
		BlockStatement: ["body"],
		BreakStatement: ["label"],
		CallExpression: ["callee", "arguments"],
		CatchClause: ["param", "body"],
		ChainExpression: ["expression"],
		ClassBody: ["body"],
		ClassDeclaration: [
			"id",
			"superClass",
			"body"
		],
		ClassExpression: [
			"id",
			"superClass",
			"body"
		],
		ConditionalExpression: [
			"test",
			"consequent",
			"alternate"
		],
		ContinueStatement: ["label"],
		DebuggerStatement: [],
		DoWhileStatement: ["body", "test"],
		EmptyStatement: [],
		ExperimentalRestProperty: ["argument"],
		ExperimentalSpreadProperty: ["argument"],
		ExportAllDeclaration: ["exported", "source"],
		ExportDefaultDeclaration: ["declaration"],
		ExportNamedDeclaration: [
			"declaration",
			"specifiers",
			"source"
		],
		ExportSpecifier: ["exported", "local"],
		ExpressionStatement: ["expression"],
		ForInStatement: [
			"left",
			"right",
			"body"
		],
		ForOfStatement: [
			"left",
			"right",
			"body"
		],
		ForStatement: [
			"init",
			"test",
			"update",
			"body"
		],
		FunctionDeclaration: [
			"id",
			"params",
			"body"
		],
		FunctionExpression: [
			"id",
			"params",
			"body"
		],
		Identifier: [],
		IfStatement: [
			"test",
			"consequent",
			"alternate"
		],
		ImportDeclaration: ["specifiers", "source"],
		ImportDefaultSpecifier: ["local"],
		ImportExpression: ["source"],
		ImportNamespaceSpecifier: ["local"],
		ImportSpecifier: ["imported", "local"],
		JSXAttribute: ["name", "value"],
		JSXClosingElement: ["name"],
		JSXClosingFragment: [],
		JSXElement: [
			"openingElement",
			"children",
			"closingElement"
		],
		JSXEmptyExpression: [],
		JSXExpressionContainer: ["expression"],
		JSXFragment: [
			"openingFragment",
			"children",
			"closingFragment"
		],
		JSXIdentifier: [],
		JSXMemberExpression: ["object", "property"],
		JSXNamespacedName: ["namespace", "name"],
		JSXOpeningElement: ["name", "attributes"],
		JSXOpeningFragment: [],
		JSXSpreadAttribute: ["argument"],
		JSXSpreadChild: ["expression"],
		JSXText: [],
		LabeledStatement: ["label", "body"],
		Literal: [],
		LogicalExpression: ["left", "right"],
		MemberExpression: ["object", "property"],
		MetaProperty: ["meta", "property"],
		MethodDefinition: ["key", "value"],
		NewExpression: ["callee", "arguments"],
		ObjectExpression: ["properties"],
		ObjectPattern: ["properties"],
		PrivateIdentifier: [],
		Program: ["body"],
		Property: ["key", "value"],
		PropertyDefinition: ["key", "value"],
		RestElement: ["argument"],
		ReturnStatement: ["argument"],
		SequenceExpression: ["expressions"],
		SpreadElement: ["argument"],
		StaticBlock: ["body"],
		Super: [],
		SwitchCase: ["test", "consequent"],
		SwitchStatement: ["discriminant", "cases"],
		TaggedTemplateExpression: ["tag", "quasi"],
		TemplateElement: [],
		TemplateLiteral: ["quasis", "expressions"],
		ThisExpression: [],
		ThrowStatement: ["argument"],
		TryStatement: [
			"block",
			"handler",
			"finalizer"
		],
		UnaryExpression: ["argument"],
		UpdateExpression: ["argument"],
		VariableDeclaration: ["declarations"],
		VariableDeclarator: ["id", "init"],
		WhileStatement: ["test", "body"],
		WithStatement: ["object", "body"],
		YieldExpression: ["argument"]
	};
	const NODE_TYPES = Object.keys(KEYS);
	for (const type of NODE_TYPES) Object.freeze(KEYS[type]);
	Object.freeze(KEYS);
	/**
	* @author Toru Nagashima <https://github.com/mysticatea>
	* See LICENSE file in root directory for full license.
	*/
	/**
	* @typedef {import('./visitor-keys.js').VisitorKeys} VisitorKeys
	*/
	const KEY_BLACKLIST = new Set([
		"parent",
		"leadingComments",
		"trailingComments"
	]);
	/**
	* Check whether a given key should be used or not.
	* @param {string} key The key to check.
	* @returns {boolean} `true` if the key should be used.
	*/
	function filterKey(key) {
		return !KEY_BLACKLIST.has(key) && key[0] !== "_";
	}
	/**
	* Get visitor keys of a given node.
	* @param {object} node The AST node to get keys.
	* @returns {readonly string[]} Visitor keys of the node.
	*/
	function getKeys(node) {
		return Object.keys(node).filter(filterKey);
	}
	/**
	* Make the union set with `KEYS` and given keys.
	* @param {VisitorKeys} additionalKeys The additional keys.
	* @returns {VisitorKeys} The union set.
	*/
	function unionWith(additionalKeys) {
		const retv = Object.assign({}, KEYS);
		for (const type of Object.keys(additionalKeys)) if (Object.prototype.hasOwnProperty.call(retv, type)) {
			const keys = new Set(additionalKeys[type]);
			for (const key of retv[type]) keys.add(key);
			retv[type] = Object.freeze(Array.from(keys));
		} else retv[type] = Object.freeze(Array.from(additionalKeys[type]));
		return Object.freeze(retv);
	}
	exports.KEYS = KEYS;
	exports.getKeys = getKeys;
	exports.unionWith = unionWith;
}));

//#endregion
//#region node_modules/.pnpm/@eslint-community+eslint-utils@4.9.0_eslint@9.39.2_jiti@2.6.1_/node_modules/@eslint-community/eslint-utils/index.js
var require_eslint_utils$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var eslintVisitorKeys = require_eslint_visitor_keys$1();
	/** @typedef {import("eslint").Scope.Scope} Scope */
	/** @typedef {import("estree").Node} Node */
	/**
	* Get the innermost scope which contains a given location.
	* @param {Scope} initialScope The initial scope to search.
	* @param {Node} node The location to search.
	* @returns {Scope} The innermost scope.
	*/
	function getInnermostScope(initialScope, node) {
		const location = node.range[0];
		let scope = initialScope;
		let found = false;
		do {
			found = false;
			for (const childScope of scope.childScopes) {
				const range = childScope.block.range;
				if (range[0] <= location && location < range[1]) {
					scope = childScope;
					found = true;
					break;
				}
			}
		} while (found);
		return scope;
	}
	/** @typedef {import("eslint").Scope.Scope} Scope */
	/** @typedef {import("eslint").Scope.Variable} Variable */
	/** @typedef {import("estree").Identifier} Identifier */
	/**
	* Find the variable of a given name.
	* @param {Scope} initialScope The scope to start finding.
	* @param {string|Identifier} nameOrNode The variable name to find. If this is a Node object then it should be an Identifier node.
	* @returns {Variable|null} The found variable or null.
	*/
	function findVariable(initialScope, nameOrNode) {
		let name$1 = "";
		/** @type {Scope|null} */
		let scope = initialScope;
		if (typeof nameOrNode === "string") name$1 = nameOrNode;
		else {
			name$1 = nameOrNode.name;
			scope = getInnermostScope(scope, nameOrNode);
		}
		while (scope != null) {
			const variable = scope.set.get(name$1);
			if (variable != null) return variable;
			scope = scope.upper;
		}
		return null;
	}
	/** @typedef {import("eslint").AST.Token} Token */
	/** @typedef {import("estree").Comment} Comment */
	/** @typedef {import("./types.mjs").ArrowToken} ArrowToken */
	/** @typedef {import("./types.mjs").CommaToken} CommaToken */
	/** @typedef {import("./types.mjs").SemicolonToken} SemicolonToken */
	/** @typedef {import("./types.mjs").ColonToken} ColonToken */
	/** @typedef {import("./types.mjs").OpeningParenToken} OpeningParenToken */
	/** @typedef {import("./types.mjs").ClosingParenToken} ClosingParenToken */
	/** @typedef {import("./types.mjs").OpeningBracketToken} OpeningBracketToken */
	/** @typedef {import("./types.mjs").ClosingBracketToken} ClosingBracketToken */
	/** @typedef {import("./types.mjs").OpeningBraceToken} OpeningBraceToken */
	/** @typedef {import("./types.mjs").ClosingBraceToken} ClosingBraceToken */
	/**
	* @template {string} Value
	* @typedef {import("./types.mjs").PunctuatorToken<Value>} PunctuatorToken
	*/
	/** @typedef {Comment | Token} CommentOrToken */
	/**
	* Creates the negate function of the given function.
	* @param {function(CommentOrToken):boolean} f - The function to negate.
	* @returns {function(CommentOrToken):boolean} Negated function.
	*/
	function negate(f) {
		return (token) => !f(token);
	}
	/**
	* Checks if the given token is a PunctuatorToken with the given value
	* @template {string} Value
	* @param {CommentOrToken} token - The token to check.
	* @param {Value} value - The value to check.
	* @returns {token is PunctuatorToken<Value>} `true` if the token is a PunctuatorToken with the given value.
	*/
	function isPunctuatorTokenWithValue(token, value) {
		return token.type === "Punctuator" && token.value === value;
	}
	/**
	* Checks if the given token is an arrow token or not.
	* @param {CommentOrToken} token - The token to check.
	* @returns {token is ArrowToken} `true` if the token is an arrow token.
	*/
	function isArrowToken(token) {
		return isPunctuatorTokenWithValue(token, "=>");
	}
	/**
	* Checks if the given token is a comma token or not.
	* @param {CommentOrToken} token - The token to check.
	* @returns {token is CommaToken} `true` if the token is a comma token.
	*/
	function isCommaToken(token) {
		return isPunctuatorTokenWithValue(token, ",");
	}
	/**
	* Checks if the given token is a semicolon token or not.
	* @param {CommentOrToken} token - The token to check.
	* @returns {token is SemicolonToken} `true` if the token is a semicolon token.
	*/
	function isSemicolonToken(token) {
		return isPunctuatorTokenWithValue(token, ";");
	}
	/**
	* Checks if the given token is a colon token or not.
	* @param {CommentOrToken} token - The token to check.
	* @returns {token is ColonToken} `true` if the token is a colon token.
	*/
	function isColonToken(token) {
		return isPunctuatorTokenWithValue(token, ":");
	}
	/**
	* Checks if the given token is an opening parenthesis token or not.
	* @param {CommentOrToken} token - The token to check.
	* @returns {token is OpeningParenToken} `true` if the token is an opening parenthesis token.
	*/
	function isOpeningParenToken(token) {
		return isPunctuatorTokenWithValue(token, "(");
	}
	/**
	* Checks if the given token is a closing parenthesis token or not.
	* @param {CommentOrToken} token - The token to check.
	* @returns {token is ClosingParenToken} `true` if the token is a closing parenthesis token.
	*/
	function isClosingParenToken(token) {
		return isPunctuatorTokenWithValue(token, ")");
	}
	/**
	* Checks if the given token is an opening square bracket token or not.
	* @param {CommentOrToken} token - The token to check.
	* @returns {token is OpeningBracketToken} `true` if the token is an opening square bracket token.
	*/
	function isOpeningBracketToken(token) {
		return isPunctuatorTokenWithValue(token, "[");
	}
	/**
	* Checks if the given token is a closing square bracket token or not.
	* @param {CommentOrToken} token - The token to check.
	* @returns {token is ClosingBracketToken} `true` if the token is a closing square bracket token.
	*/
	function isClosingBracketToken(token) {
		return isPunctuatorTokenWithValue(token, "]");
	}
	/**
	* Checks if the given token is an opening brace token or not.
	* @param {CommentOrToken} token - The token to check.
	* @returns {token is OpeningBraceToken} `true` if the token is an opening brace token.
	*/
	function isOpeningBraceToken(token) {
		return isPunctuatorTokenWithValue(token, "{");
	}
	/**
	* Checks if the given token is a closing brace token or not.
	* @param {CommentOrToken} token - The token to check.
	* @returns {token is ClosingBraceToken} `true` if the token is a closing brace token.
	*/
	function isClosingBraceToken(token) {
		return isPunctuatorTokenWithValue(token, "}");
	}
	/**
	* Checks if the given token is a comment token or not.
	* @param {CommentOrToken} token - The token to check.
	* @returns {token is Comment} `true` if the token is a comment token.
	*/
	function isCommentToken(token) {
		return [
			"Block",
			"Line",
			"Shebang"
		].includes(token.type);
	}
	const isNotArrowToken = negate(isArrowToken);
	const isNotCommaToken = negate(isCommaToken);
	const isNotSemicolonToken = negate(isSemicolonToken);
	const isNotColonToken = negate(isColonToken);
	const isNotOpeningParenToken = negate(isOpeningParenToken);
	const isNotClosingParenToken = negate(isClosingParenToken);
	const isNotOpeningBracketToken = negate(isOpeningBracketToken);
	const isNotClosingBracketToken = negate(isClosingBracketToken);
	const isNotOpeningBraceToken = negate(isOpeningBraceToken);
	const isNotClosingBraceToken = negate(isClosingBraceToken);
	const isNotCommentToken = negate(isCommentToken);
	/** @typedef {import("eslint").Rule.Node} RuleNode */
	/** @typedef {import("eslint").SourceCode} SourceCode */
	/** @typedef {import("eslint").AST.Token} Token */
	/** @typedef {import("estree").Function} FunctionNode */
	/** @typedef {import("estree").FunctionDeclaration} FunctionDeclaration */
	/** @typedef {import("estree").FunctionExpression} FunctionExpression */
	/** @typedef {import("estree").SourceLocation} SourceLocation */
	/** @typedef {import("estree").Position} Position */
	/**
	* Get the `(` token of the given function node.
	* @param {FunctionExpression | FunctionDeclaration} node - The function node to get.
	* @param {SourceCode} sourceCode - The source code object to get tokens.
	* @returns {Token} `(` token.
	*/
	function getOpeningParenOfParams(node, sourceCode) {
		return node.id ? sourceCode.getTokenAfter(node.id, isOpeningParenToken) : sourceCode.getFirstToken(node, isOpeningParenToken);
	}
	/**
	* Get the location of the given function node for reporting.
	* @param {FunctionNode} node - The function node to get.
	* @param {SourceCode} sourceCode - The source code object to get tokens.
	* @returns {SourceLocation|null} The location of the function node for reporting.
	*/
	function getFunctionHeadLocation(node, sourceCode) {
		const parent = node.parent;
		/** @type {Position|null} */
		let start = null;
		/** @type {Position|null} */
		let end = null;
		if (node.type === "ArrowFunctionExpression") {
			const arrowToken = sourceCode.getTokenBefore(node.body, isArrowToken);
			start = arrowToken.loc.start;
			end = arrowToken.loc.end;
		} else if (parent.type === "Property" || parent.type === "MethodDefinition" || parent.type === "PropertyDefinition") {
			start = parent.loc.start;
			end = getOpeningParenOfParams(node, sourceCode).loc.start;
		} else {
			start = node.loc.start;
			end = getOpeningParenOfParams(node, sourceCode).loc.start;
		}
		return {
			start: { ...start },
			end: { ...end }
		};
	}
	/** @typedef {import("./types.mjs").StaticValue} StaticValue */
	/** @typedef {import("eslint").Scope.Scope} Scope */
	/** @typedef {import("eslint").Scope.Variable} Variable */
	/** @typedef {import("estree").Node} Node */
	/** @typedef {import("@typescript-eslint/types").TSESTree.Node} TSESTreeNode */
	/** @typedef {import("@typescript-eslint/types").TSESTree.AST_NODE_TYPES} TSESTreeNodeTypes */
	/** @typedef {import("@typescript-eslint/types").TSESTree.MemberExpression} MemberExpression */
	/** @typedef {import("@typescript-eslint/types").TSESTree.Property} Property */
	/** @typedef {import("@typescript-eslint/types").TSESTree.RegExpLiteral} RegExpLiteral */
	/** @typedef {import("@typescript-eslint/types").TSESTree.BigIntLiteral} BigIntLiteral */
	/** @typedef {import("@typescript-eslint/types").TSESTree.Literal} Literal */
	const globalObject = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
	const builtinNames = Object.freeze(new Set([
		"Array",
		"ArrayBuffer",
		"BigInt",
		"BigInt64Array",
		"BigUint64Array",
		"Boolean",
		"DataView",
		"Date",
		"decodeURI",
		"decodeURIComponent",
		"encodeURI",
		"encodeURIComponent",
		"escape",
		"Float32Array",
		"Float64Array",
		"Function",
		"Infinity",
		"Int16Array",
		"Int32Array",
		"Int8Array",
		"isFinite",
		"isNaN",
		"isPrototypeOf",
		"JSON",
		"Map",
		"Math",
		"NaN",
		"Number",
		"Object",
		"parseFloat",
		"parseInt",
		"Promise",
		"Proxy",
		"Reflect",
		"RegExp",
		"Set",
		"String",
		"Symbol",
		"Uint16Array",
		"Uint32Array",
		"Uint8Array",
		"Uint8ClampedArray",
		"undefined",
		"unescape",
		"WeakMap",
		"WeakSet"
	]));
	const callAllowed = new Set([
		Array.isArray,
		Array.of,
		Array.prototype.at,
		Array.prototype.concat,
		Array.prototype.entries,
		Array.prototype.every,
		Array.prototype.filter,
		Array.prototype.find,
		Array.prototype.findIndex,
		Array.prototype.flat,
		Array.prototype.includes,
		Array.prototype.indexOf,
		Array.prototype.join,
		Array.prototype.keys,
		Array.prototype.lastIndexOf,
		Array.prototype.slice,
		Array.prototype.some,
		Array.prototype.toString,
		Array.prototype.values,
		typeof BigInt === "function" ? BigInt : void 0,
		Boolean,
		Date,
		Date.parse,
		decodeURI,
		decodeURIComponent,
		encodeURI,
		encodeURIComponent,
		escape,
		isFinite,
		isNaN,
		isPrototypeOf,
		Map,
		Map.prototype.entries,
		Map.prototype.get,
		Map.prototype.has,
		Map.prototype.keys,
		Map.prototype.values,
		...Object.getOwnPropertyNames(Math).filter((k) => k !== "random").map((k) => Math[k]).filter((f) => typeof f === "function"),
		Number,
		Number.isFinite,
		Number.isNaN,
		Number.parseFloat,
		Number.parseInt,
		Number.prototype.toExponential,
		Number.prototype.toFixed,
		Number.prototype.toPrecision,
		Number.prototype.toString,
		Object,
		Object.entries,
		Object.is,
		Object.isExtensible,
		Object.isFrozen,
		Object.isSealed,
		Object.keys,
		Object.values,
		parseFloat,
		parseInt,
		RegExp,
		Set,
		Set.prototype.entries,
		Set.prototype.has,
		Set.prototype.keys,
		Set.prototype.values,
		String,
		String.fromCharCode,
		String.fromCodePoint,
		String.raw,
		String.prototype.at,
		String.prototype.charAt,
		String.prototype.charCodeAt,
		String.prototype.codePointAt,
		String.prototype.concat,
		String.prototype.endsWith,
		String.prototype.includes,
		String.prototype.indexOf,
		String.prototype.lastIndexOf,
		String.prototype.normalize,
		String.prototype.padEnd,
		String.prototype.padStart,
		String.prototype.slice,
		String.prototype.startsWith,
		String.prototype.substr,
		String.prototype.substring,
		String.prototype.toLowerCase,
		String.prototype.toString,
		String.prototype.toUpperCase,
		String.prototype.trim,
		String.prototype.trimEnd,
		String.prototype.trimLeft,
		String.prototype.trimRight,
		String.prototype.trimStart,
		Symbol.for,
		Symbol.keyFor,
		unescape
	].filter((f) => typeof f === "function"));
	const callPassThrough = new Set([
		Object.freeze,
		Object.preventExtensions,
		Object.seal
	]);
	/** @type {ReadonlyArray<readonly [Function, ReadonlySet<string>]>} */
	const getterAllowed = [
		[Map, new Set(["size"])],
		[RegExp, new Set([
			"dotAll",
			"flags",
			"global",
			"hasIndices",
			"ignoreCase",
			"multiline",
			"source",
			"sticky",
			"unicode"
		])],
		[Set, new Set(["size"])]
	];
	/**
	* Get the property descriptor.
	* @param {object} object The object to get.
	* @param {string|number|symbol} name The property name to get.
	*/
	function getPropertyDescriptor(object, name$1) {
		let x = object;
		while ((typeof x === "object" || typeof x === "function") && x !== null) {
			const d = Object.getOwnPropertyDescriptor(x, name$1);
			if (d) return d;
			x = Object.getPrototypeOf(x);
		}
		return null;
	}
	/**
	* Check if a property is getter or not.
	* @param {object} object The object to check.
	* @param {string|number|symbol} name The property name to check.
	*/
	function isGetter(object, name$1) {
		const d = getPropertyDescriptor(object, name$1);
		return d != null && d.get != null;
	}
	/**
	* Get the element values of a given node list.
	* @param {(Node|TSESTreeNode|null)[]} nodeList The node list to get values.
	* @param {Scope|undefined|null} initialScope The initial scope to find variables.
	* @returns {any[]|null} The value list if all nodes are constant. Otherwise, null.
	*/
	function getElementValues(nodeList, initialScope) {
		const valueList = [];
		for (let i = 0; i < nodeList.length; ++i) {
			const elementNode = nodeList[i];
			if (elementNode == null) valueList.length = i + 1;
			else if (elementNode.type === "SpreadElement") {
				const argument = getStaticValueR(elementNode.argument, initialScope);
				if (argument == null) return null;
				valueList.push(...argument.value);
			} else {
				const element = getStaticValueR(elementNode, initialScope);
				if (element == null) return null;
				valueList.push(element.value);
			}
		}
		return valueList;
	}
	/**
	* Checks if a variable is a built-in global.
	* @param {Variable|null} variable The variable to check.
	* @returns {variable is Variable & {defs:[]}}
	*/
	function isBuiltinGlobal(variable) {
		return variable != null && variable.defs.length === 0 && builtinNames.has(variable.name) && variable.name in globalObject;
	}
	/**
	* Checks if a variable can be considered as a constant.
	* @param {Variable} variable
	* @returns {variable is Variable & {defs: [import("eslint").Scope.Definition & { type: "Variable" }]}} True if the variable can be considered as a constant.
	*/
	function canBeConsideredConst(variable) {
		if (variable.defs.length !== 1) return false;
		const def = variable.defs[0];
		return Boolean(def.parent && def.type === "Variable" && (def.parent.kind === "const" || isEffectivelyConst(variable)));
	}
	/**
	* Returns whether the given variable is never written to after initialization.
	* @param {Variable} variable
	* @returns {boolean}
	*/
	function isEffectivelyConst(variable) {
		const refs = variable.references;
		const inits = refs.filter((r) => r.init).length;
		const reads = refs.filter((r) => r.isReadOnly()).length;
		if (inits === 1 && reads + inits === refs.length) return true;
		return false;
	}
	/**
	* Checks if a variable has mutation in its property.
	* @param {Variable} variable The variable to check.
	* @param {Scope|null} initialScope The scope to start finding variable. Optional. If the node is a computed property node and this scope was given, this checks the computed property name by the `getStringIfConstant` function with the scope, and returns the value of it.
	* @returns {boolean} True if the variable has mutation in its property.
	*/
	function hasMutationInProperty(variable, initialScope) {
		for (const ref of variable.references) {
			let node = ref.identifier;
			while (node && node.parent && node.parent.type === "MemberExpression") node = node.parent;
			if (!node || !node.parent) continue;
			if (node.parent.type === "AssignmentExpression" && node.parent.left === node || node.parent.type === "UpdateExpression" && node.parent.argument === node) return true;
			if (node.parent.type === "CallExpression" && node.parent.callee === node && node.type === "MemberExpression") {
				if (isNameOfMutationArrayMethod(getStaticPropertyNameValue(node, initialScope))) return true;
			}
		}
		return false;
		/**
		* Checks if a method name is one of the mutation array methods.
		* @param {StaticValue|null} methodName The method name to check.
		* @returns {boolean} True if the method name is a mutation array method.
		*/
		function isNameOfMutationArrayMethod(methodName) {
			if (methodName == null || methodName.value == null) return false;
			const name$1 = methodName.value;
			return name$1 === "copyWithin" || name$1 === "fill" || name$1 === "pop" || name$1 === "push" || name$1 === "reverse" || name$1 === "shift" || name$1 === "sort" || name$1 === "splice" || name$1 === "unshift";
		}
	}
	/**
	* @template {TSESTreeNodeTypes} T
	* @callback VisitorCallback
	* @param {TSESTreeNode & { type: T }} node
	* @param {Scope|undefined|null} initialScope
	* @returns {StaticValue | null}
	*/
	/**
	* @typedef { { [K in TSESTreeNodeTypes]?: VisitorCallback<K> } } Operations
	*/
	/**
	* @type {Operations}
	*/
	const operations = Object.freeze({
		ArrayExpression(node, initialScope) {
			const elements = getElementValues(node.elements, initialScope);
			return elements != null ? { value: elements } : null;
		},
		AssignmentExpression(node, initialScope) {
			if (node.operator === "=") return getStaticValueR(node.right, initialScope);
			return null;
		},
		BinaryExpression(node, initialScope) {
			if (node.operator === "in" || node.operator === "instanceof") return null;
			const left = getStaticValueR(node.left, initialScope);
			const right = getStaticValueR(node.right, initialScope);
			if (left != null && right != null) switch (node.operator) {
				case "==": return { value: left.value == right.value };
				case "!=": return { value: left.value != right.value };
				case "===": return { value: left.value === right.value };
				case "!==": return { value: left.value !== right.value };
				case "<": return { value: left.value < right.value };
				case "<=": return { value: left.value <= right.value };
				case ">": return { value: left.value > right.value };
				case ">=": return { value: left.value >= right.value };
				case "<<": return { value: left.value << right.value };
				case ">>": return { value: left.value >> right.value };
				case ">>>": return { value: left.value >>> right.value };
				case "+": return { value: left.value + right.value };
				case "-": return { value: left.value - right.value };
				case "*": return { value: left.value * right.value };
				case "/": return { value: left.value / right.value };
				case "%": return { value: left.value % right.value };
				case "**": return { value: left.value ** right.value };
				case "|": return { value: left.value | right.value };
				case "^": return { value: left.value ^ right.value };
				case "&": return { value: left.value & right.value };
			}
			return null;
		},
		CallExpression(node, initialScope) {
			const calleeNode = node.callee;
			const args = getElementValues(node.arguments, initialScope);
			if (args != null) if (calleeNode.type === "MemberExpression") {
				if (calleeNode.property.type === "PrivateIdentifier") return null;
				const object = getStaticValueR(calleeNode.object, initialScope);
				if (object != null) {
					if (object.value == null && (object.optional || node.optional)) return {
						value: void 0,
						optional: true
					};
					const property = getStaticPropertyNameValue(calleeNode, initialScope);
					if (property != null) {
						const receiver = object.value;
						const methodName = property.value;
						if (callAllowed.has(receiver[methodName])) return { value: receiver[methodName](...args) };
						if (callPassThrough.has(receiver[methodName])) return { value: args[0] };
					}
				}
			} else {
				const callee = getStaticValueR(calleeNode, initialScope);
				if (callee != null) {
					if (callee.value == null && node.optional) return {
						value: void 0,
						optional: true
					};
					const func = callee.value;
					if (callAllowed.has(func)) return { value: func(...args) };
					if (callPassThrough.has(func)) return { value: args[0] };
				}
			}
			return null;
		},
		ConditionalExpression(node, initialScope) {
			const test = getStaticValueR(node.test, initialScope);
			if (test != null) return test.value ? getStaticValueR(node.consequent, initialScope) : getStaticValueR(node.alternate, initialScope);
			return null;
		},
		ExpressionStatement(node, initialScope) {
			return getStaticValueR(node.expression, initialScope);
		},
		Identifier(node, initialScope) {
			if (initialScope != null) {
				const variable = findVariable(initialScope, node);
				if (variable != null) {
					if (isBuiltinGlobal(variable)) return { value: globalObject[variable.name] };
					if (canBeConsideredConst(variable)) {
						const def = variable.defs[0];
						if (def.node.id.type === "Identifier") {
							const init = getStaticValueR(def.node.init, initialScope);
							if (init && typeof init.value === "object" && init.value !== null) {
								if (hasMutationInProperty(variable, initialScope)) return null;
							}
							return init;
						}
					}
				}
			}
			return null;
		},
		Literal(node) {
			const literal = node;
			//istanbul ignore if : this is implementation-specific behavior.
			if ((literal.regex != null || literal.bigint != null) && literal.value == null) return null;
			return { value: literal.value };
		},
		LogicalExpression(node, initialScope) {
			const left = getStaticValueR(node.left, initialScope);
			if (left != null) {
				if (node.operator === "||" && Boolean(left.value) === true || node.operator === "&&" && Boolean(left.value) === false || node.operator === "??" && left.value != null) return left;
				const right = getStaticValueR(node.right, initialScope);
				if (right != null) return right;
			}
			return null;
		},
		MemberExpression(node, initialScope) {
			if (node.property.type === "PrivateIdentifier") return null;
			const object = getStaticValueR(node.object, initialScope);
			if (object != null) {
				if (object.value == null && (object.optional || node.optional)) return {
					value: void 0,
					optional: true
				};
				const property = getStaticPropertyNameValue(node, initialScope);
				if (property != null) {
					if (!isGetter(object.value, property.value)) return { value: object.value[property.value] };
					for (const [classFn, allowed] of getterAllowed) if (object.value instanceof classFn && allowed.has(property.value)) return { value: object.value[property.value] };
				}
			}
			return null;
		},
		ChainExpression(node, initialScope) {
			const expression = getStaticValueR(node.expression, initialScope);
			if (expression != null) return { value: expression.value };
			return null;
		},
		NewExpression(node, initialScope) {
			const callee = getStaticValueR(node.callee, initialScope);
			const args = getElementValues(node.arguments, initialScope);
			if (callee != null && args != null) {
				const Func = callee.value;
				if (callAllowed.has(Func)) return { value: new Func(...args) };
			}
			return null;
		},
		ObjectExpression(node, initialScope) {
			/** @type {Record<PropertyKey, unknown>} */
			const object = {};
			for (const propertyNode of node.properties) if (propertyNode.type === "Property") {
				if (propertyNode.kind !== "init") return null;
				const key = getStaticPropertyNameValue(propertyNode, initialScope);
				const value = getStaticValueR(propertyNode.value, initialScope);
				if (key == null || value == null) return null;
				object[key.value] = value.value;
			} else if (propertyNode.type === "SpreadElement" || propertyNode.type === "ExperimentalSpreadProperty") {
				const argument = getStaticValueR(propertyNode.argument, initialScope);
				if (argument == null) return null;
				Object.assign(object, argument.value);
			} else return null;
			return { value: object };
		},
		SequenceExpression(node, initialScope) {
			const last = node.expressions[node.expressions.length - 1];
			return getStaticValueR(last, initialScope);
		},
		TaggedTemplateExpression(node, initialScope) {
			const tag = getStaticValueR(node.tag, initialScope);
			const expressions = getElementValues(node.quasi.expressions, initialScope);
			if (tag != null && expressions != null) {
				const func = tag.value;
				/** @type {any[] & { raw?: string[] }} */
				const strings = node.quasi.quasis.map((q) => q.value.cooked);
				strings.raw = node.quasi.quasis.map((q) => q.value.raw);
				if (func === String.raw) return { value: func(strings, ...expressions) };
			}
			return null;
		},
		TemplateLiteral(node, initialScope) {
			const expressions = getElementValues(node.expressions, initialScope);
			if (expressions != null) {
				let value = node.quasis[0].value.cooked;
				for (let i = 0; i < expressions.length; ++i) {
					value += expressions[i];
					value += node.quasis[i + 1].value.cooked;
				}
				return { value };
			}
			return null;
		},
		UnaryExpression(node, initialScope) {
			if (node.operator === "delete") return null;
			if (node.operator === "void") return { value: void 0 };
			const arg = getStaticValueR(node.argument, initialScope);
			if (arg != null) switch (node.operator) {
				case "-": return { value: -arg.value };
				case "+": return { value: +arg.value };
				case "!": return { value: !arg.value };
				case "~": return { value: ~arg.value };
				case "typeof": return { value: typeof arg.value };
			}
			return null;
		},
		TSAsExpression(node, initialScope) {
			return getStaticValueR(node.expression, initialScope);
		},
		TSSatisfiesExpression(node, initialScope) {
			return getStaticValueR(node.expression, initialScope);
		},
		TSTypeAssertion(node, initialScope) {
			return getStaticValueR(node.expression, initialScope);
		},
		TSNonNullExpression(node, initialScope) {
			return getStaticValueR(node.expression, initialScope);
		},
		TSInstantiationExpression(node, initialScope) {
			return getStaticValueR(node.expression, initialScope);
		}
	});
	/**
	* Get the value of a given node if it's a static value.
	* @param {Node|TSESTreeNode|null|undefined} node The node to get.
	* @param {Scope|undefined|null} initialScope The scope to start finding variable.
	* @returns {StaticValue|null} The static value of the node, or `null`.
	*/
	function getStaticValueR(node, initialScope) {
		if (node != null && Object.hasOwnProperty.call(operations, node.type)) return operations[node.type](node, initialScope);
		return null;
	}
	/**
	* Get the static value of property name from a MemberExpression node or a Property node.
	* @param {MemberExpression|Property} node The node to get.
	* @param {Scope|null} [initialScope] The scope to start finding variable. Optional. If the node is a computed property node and this scope was given, this checks the computed property name by the `getStringIfConstant` function with the scope, and returns the value of it.
	* @returns {StaticValue|null} The static value of the property name of the node, or `null`.
	*/
	function getStaticPropertyNameValue(node, initialScope) {
		const nameNode = node.type === "Property" ? node.key : node.property;
		if (node.computed) return getStaticValueR(nameNode, initialScope);
		if (nameNode.type === "Identifier") return { value: nameNode.name };
		if (nameNode.type === "Literal") {
			if (nameNode.bigint) return { value: nameNode.bigint };
			return { value: String(nameNode.value) };
		}
		return null;
	}
	/**
	* Get the value of a given node if it's a static value.
	* @param {Node} node The node to get.
	* @param {Scope|null} [initialScope] The scope to start finding variable. Optional. If this scope was given, this tries to resolve identifier references which are in the given node as much as possible.
	* @returns {StaticValue | null} The static value of the node, or `null`.
	*/
	function getStaticValue(node, initialScope = null) {
		try {
			return getStaticValueR(node, initialScope);
		} catch (_error) {
			return null;
		}
	}
	/** @typedef {import("eslint").Scope.Scope} Scope */
	/** @typedef {import("estree").Node} Node */
	/** @typedef {import("estree").RegExpLiteral} RegExpLiteral */
	/** @typedef {import("estree").BigIntLiteral} BigIntLiteral */
	/** @typedef {import("estree").SimpleLiteral} SimpleLiteral */
	/**
	* Get the value of a given node if it's a literal or a template literal.
	* @param {Node} node The node to get.
	* @param {Scope|null} [initialScope] The scope to start finding variable. Optional. If the node is an Identifier node and this scope was given, this checks the variable of the identifier, and returns the value of it if the variable is a constant.
	* @returns {string|null} The value of the node, or `null`.
	*/
	function getStringIfConstant(node, initialScope = null) {
		if (node && node.type === "Literal" && node.value === null) {
			const literal = node;
			if (literal.regex) return `/${literal.regex.pattern}/${literal.regex.flags}`;
			if (literal.bigint) return literal.bigint;
		}
		const evaluated = getStaticValue(node, initialScope);
		if (evaluated) try {
			return String(evaluated.value);
		} catch {}
		return null;
	}
	/** @typedef {import("eslint").Scope.Scope} Scope */
	/** @typedef {import("estree").MemberExpression} MemberExpression */
	/** @typedef {import("estree").MethodDefinition} MethodDefinition */
	/** @typedef {import("estree").Property} Property */
	/** @typedef {import("estree").PropertyDefinition} PropertyDefinition */
	/** @typedef {import("estree").Identifier} Identifier */
	/**
	* Get the property name from a MemberExpression node or a Property node.
	* @param {MemberExpression | MethodDefinition | Property | PropertyDefinition} node The node to get.
	* @param {Scope} [initialScope] The scope to start finding variable. Optional. If the node is a computed property node and this scope was given, this checks the computed property name by the `getStringIfConstant` function with the scope, and returns the value of it.
	* @returns {string|null|undefined} The property name of the node.
	*/
	function getPropertyName(node, initialScope) {
		switch (node.type) {
			case "MemberExpression":
				if (node.computed) return getStringIfConstant(node.property, initialScope);
				if (node.property.type === "PrivateIdentifier") return null;
				return node.property.name;
			case "Property":
			case "MethodDefinition":
			case "PropertyDefinition":
				if (node.computed) return getStringIfConstant(node.key, initialScope);
				if (node.key.type === "Literal") return String(node.key.value);
				if (node.key.type === "PrivateIdentifier") return null;
				return node.key.name;
		}
		return null;
	}
	/** @typedef {import("eslint").Rule.Node} RuleNode */
	/** @typedef {import("eslint").SourceCode} SourceCode */
	/** @typedef {import("estree").Function} FunctionNode */
	/** @typedef {import("estree").FunctionDeclaration} FunctionDeclaration */
	/** @typedef {import("estree").FunctionExpression} FunctionExpression */
	/** @typedef {import("estree").Identifier} Identifier */
	/**
	* Get the name and kind of the given function node.
	* @param {FunctionNode} node - The function node to get.
	* @param {SourceCode} [sourceCode] The source code object to get the code of computed property keys.
	* @returns {string} The name and kind of the function node.
	*/
	function getFunctionNameWithKind(node, sourceCode) {
		const parent = node.parent;
		const tokens = [];
		const isObjectMethod = parent.type === "Property" && parent.value === node;
		const isClassMethod = parent.type === "MethodDefinition" && parent.value === node;
		const isClassFieldMethod = parent.type === "PropertyDefinition" && parent.value === node;
		if (isClassMethod || isClassFieldMethod) {
			if (parent.static) tokens.push("static");
			if (parent.key.type === "PrivateIdentifier") tokens.push("private");
		}
		if (node.async) tokens.push("async");
		if (node.generator) tokens.push("generator");
		if (isObjectMethod || isClassMethod) {
			if (parent.kind === "constructor") return "constructor";
			if (parent.kind === "get") tokens.push("getter");
			else if (parent.kind === "set") tokens.push("setter");
			else tokens.push("method");
		} else if (isClassFieldMethod) tokens.push("method");
		else {
			if (node.type === "ArrowFunctionExpression") tokens.push("arrow");
			tokens.push("function");
		}
		if (isObjectMethod || isClassMethod || isClassFieldMethod) if (parent.key.type === "PrivateIdentifier") tokens.push(`#${parent.key.name}`);
		else {
			const name$1 = getPropertyName(parent);
			if (name$1) tokens.push(`'${name$1}'`);
			else if (sourceCode) {
				const keyText = sourceCode.getText(parent.key);
				if (!keyText.includes("\n")) tokens.push(`[${keyText}]`);
			}
		}
		else if (hasId(node)) tokens.push(`'${node.id.name}'`);
		else if (parent.type === "VariableDeclarator" && parent.id && parent.id.type === "Identifier") tokens.push(`'${parent.id.name}'`);
		else if ((parent.type === "AssignmentExpression" || parent.type === "AssignmentPattern") && parent.left && parent.left.type === "Identifier") tokens.push(`'${parent.left.name}'`);
		else if (parent.type === "ExportDefaultDeclaration" && parent.declaration === node) tokens.push("'default'");
		return tokens.join(" ");
	}
	/**
	* @param {FunctionNode} node
	* @returns {node is FunctionDeclaration | FunctionExpression & { id: Identifier }}
	*/
	function hasId(node) {
		return Boolean(
			/** @type {Partial<FunctionDeclaration | FunctionExpression>} */
			node.id
		);
	}
	/** @typedef {import("estree").Node} Node */
	/** @typedef {import("eslint").SourceCode} SourceCode */
	/** @typedef {import("./types.mjs").HasSideEffectOptions} HasSideEffectOptions */
	/** @typedef {import("estree").BinaryExpression} BinaryExpression */
	/** @typedef {import("estree").MemberExpression} MemberExpression */
	/** @typedef {import("estree").MethodDefinition} MethodDefinition */
	/** @typedef {import("estree").Property} Property */
	/** @typedef {import("estree").PropertyDefinition} PropertyDefinition */
	/** @typedef {import("estree").UnaryExpression} UnaryExpression */
	const typeConversionBinaryOps = Object.freeze(new Set([
		"==",
		"!=",
		"<",
		"<=",
		">",
		">=",
		"<<",
		">>",
		">>>",
		"+",
		"-",
		"*",
		"/",
		"%",
		"|",
		"^",
		"&",
		"in"
	]));
	const typeConversionUnaryOps = Object.freeze(new Set([
		"-",
		"+",
		"!",
		"~"
	]));
	/**
	* Check whether the given value is an ASTNode or not.
	* @param {any} x The value to check.
	* @returns {x is Node} `true` if the value is an ASTNode.
	*/
	function isNode(x) {
		return x !== null && typeof x === "object" && typeof x.type === "string";
	}
	const visitor = Object.freeze(Object.assign(Object.create(null), {
		$visit(node, options, visitorKeys) {
			const { type } = node;
			if (typeof this[type] === "function") return this[type](node, options, visitorKeys);
			return this.$visitChildren(node, options, visitorKeys);
		},
		$visitChildren(node, options, visitorKeys) {
			const { type } = node;
			for (const key of visitorKeys[type] || eslintVisitorKeys.getKeys(node)) {
				const value = node[key];
				if (Array.isArray(value)) {
					for (const element of value) if (isNode(element) && this.$visit(element, options, visitorKeys)) return true;
				} else if (isNode(value) && this.$visit(value, options, visitorKeys)) return true;
			}
			return false;
		},
		ArrowFunctionExpression() {
			return false;
		},
		AssignmentExpression() {
			return true;
		},
		AwaitExpression() {
			return true;
		},
		BinaryExpression(node, options, visitorKeys) {
			if (options.considerImplicitTypeConversion && typeConversionBinaryOps.has(node.operator) && (node.left.type !== "Literal" || node.right.type !== "Literal")) return true;
			return this.$visitChildren(node, options, visitorKeys);
		},
		CallExpression() {
			return true;
		},
		FunctionExpression() {
			return false;
		},
		ImportExpression() {
			return true;
		},
		MemberExpression(node, options, visitorKeys) {
			if (options.considerGetters) return true;
			if (options.considerImplicitTypeConversion && node.computed && node.property.type !== "Literal") return true;
			return this.$visitChildren(node, options, visitorKeys);
		},
		MethodDefinition(node, options, visitorKeys) {
			if (options.considerImplicitTypeConversion && node.computed && node.key.type !== "Literal") return true;
			return this.$visitChildren(node, options, visitorKeys);
		},
		NewExpression() {
			return true;
		},
		Property(node, options, visitorKeys) {
			if (options.considerImplicitTypeConversion && node.computed && node.key.type !== "Literal") return true;
			return this.$visitChildren(node, options, visitorKeys);
		},
		PropertyDefinition(node, options, visitorKeys) {
			if (options.considerImplicitTypeConversion && node.computed && node.key.type !== "Literal") return true;
			return this.$visitChildren(node, options, visitorKeys);
		},
		UnaryExpression(node, options, visitorKeys) {
			if (node.operator === "delete") return true;
			if (options.considerImplicitTypeConversion && typeConversionUnaryOps.has(node.operator) && node.argument.type !== "Literal") return true;
			return this.$visitChildren(node, options, visitorKeys);
		},
		UpdateExpression() {
			return true;
		},
		YieldExpression() {
			return true;
		}
	}));
	/**
	* Check whether a given node has any side effect or not.
	* @param {Node} node The node to get.
	* @param {SourceCode} sourceCode The source code object.
	* @param {HasSideEffectOptions} [options] The option object.
	* @returns {boolean} `true` if the node has a certain side effect.
	*/
	function hasSideEffect(node, sourceCode, options = {}) {
		const { considerGetters = false, considerImplicitTypeConversion = false } = options;
		return visitor.$visit(node, {
			considerGetters,
			considerImplicitTypeConversion
		}, sourceCode.visitorKeys || eslintVisitorKeys.KEYS);
	}
	/** @typedef {import("estree").Node} Node */
	/** @typedef {import("@typescript-eslint/types").TSESTree.NewExpression} TSNewExpression */
	/** @typedef {import("@typescript-eslint/types").TSESTree.CallExpression} TSCallExpression */
	/** @typedef {import("eslint").SourceCode} SourceCode */
	/** @typedef {import("eslint").AST.Token} Token */
	/** @typedef {import("eslint").Rule.Node} RuleNode */
	/**
	* Get the left parenthesis of the parent node syntax if it exists.
	* E.g., `if (a) {}` then the `(`.
	* @param {Node} node The AST node to check.
	* @param {SourceCode} sourceCode The source code object to get tokens.
	* @returns {Token|null} The left parenthesis of the parent node syntax
	*/
	function getParentSyntaxParen(node, sourceCode) {
		const parent = node.parent;
		switch (parent.type) {
			case "CallExpression":
			case "NewExpression":
				if (parent.arguments.length === 1 && parent.arguments[0] === node) return sourceCode.getTokenAfter(parent.typeArguments || parent.typeParameters || parent.callee, isOpeningParenToken);
				return null;
			case "DoWhileStatement":
				if (parent.test === node) return sourceCode.getTokenAfter(parent.body, isOpeningParenToken);
				return null;
			case "IfStatement":
			case "WhileStatement":
				if (parent.test === node) return sourceCode.getFirstToken(parent, 1);
				return null;
			case "ImportExpression":
				if (parent.source === node) return sourceCode.getFirstToken(parent, 1);
				return null;
			case "SwitchStatement":
				if (parent.discriminant === node) return sourceCode.getFirstToken(parent, 1);
				return null;
			case "WithStatement":
				if (parent.object === node) return sourceCode.getFirstToken(parent, 1);
				return null;
			default: return null;
		}
	}
	/**
	* Check whether a given node is parenthesized or not.
	* @param {number} times The number of parantheses.
	* @param {Node} node The AST node to check.
	* @param {SourceCode} sourceCode The source code object to get tokens.
	* @returns {boolean} `true` if the node is parenthesized the given times.
	*/
	/**
	* Check whether a given node is parenthesized or not.
	* @param {Node} node The AST node to check.
	* @param {SourceCode} sourceCode The source code object to get tokens.
	* @returns {boolean} `true` if the node is parenthesized.
	*/
	/**
	* Check whether a given node is parenthesized or not.
	* @param {Node|number} timesOrNode The first parameter.
	* @param {Node|SourceCode} nodeOrSourceCode The second parameter.
	* @param {SourceCode} [optionalSourceCode] The third parameter.
	* @returns {boolean} `true` if the node is parenthesized.
	*/
	function isParenthesized(timesOrNode, nodeOrSourceCode, optionalSourceCode) {
		/** @type {number} */
		let times, node, sourceCode, maybeLeftParen, maybeRightParen;
		if (typeof timesOrNode === "number") {
			times = timesOrNode | 0;
			node = nodeOrSourceCode;
			sourceCode = optionalSourceCode;
			if (!(times >= 1)) throw new TypeError("'times' should be a positive integer.");
		} else {
			times = 1;
			node = timesOrNode;
			sourceCode = nodeOrSourceCode;
		}
		if (node == null || node.parent == null || node.parent.type === "CatchClause" && node.parent.param === node) return false;
		maybeLeftParen = maybeRightParen = node;
		do {
			maybeLeftParen = sourceCode.getTokenBefore(maybeLeftParen);
			maybeRightParen = sourceCode.getTokenAfter(maybeRightParen);
		} while (maybeLeftParen != null && maybeRightParen != null && isOpeningParenToken(maybeLeftParen) && isClosingParenToken(maybeRightParen) && maybeLeftParen !== getParentSyntaxParen(node, sourceCode) && --times > 0);
		return times === 0;
	}
	/**
	* @author Toru Nagashima <https://github.com/mysticatea>
	* See LICENSE file in root directory for full license.
	*/
	const placeholder = /\$(?:[$&`']|[1-9][0-9]?)/gu;
	/** @type {WeakMap<PatternMatcher, {pattern:RegExp,escaped:boolean}>} */
	const internal = /* @__PURE__ */ new WeakMap();
	/**
	* Check whether a given character is escaped or not.
	* @param {string} str The string to check.
	* @param {number} index The location of the character to check.
	* @returns {boolean} `true` if the character is escaped.
	*/
	function isEscaped(str, index) {
		let escaped = false;
		for (let i = index - 1; i >= 0 && str.charCodeAt(i) === 92; --i) escaped = !escaped;
		return escaped;
	}
	/**
	* Replace a given string by a given matcher.
	* @param {PatternMatcher} matcher The pattern matcher.
	* @param {string} str The string to be replaced.
	* @param {string} replacement The new substring to replace each matched part.
	* @returns {string} The replaced string.
	*/
	function replaceS(matcher, str, replacement) {
		const chunks = [];
		let index = 0;
		/**
		* @param {string} key The placeholder.
		* @param {RegExpExecArray} match The matched information.
		* @returns {string} The replaced string.
		*/
		function replacer(key, match) {
			switch (key) {
				case "$$": return "$";
				case "$&": return match[0];
				case "$`": return str.slice(0, match.index);
				case "$'": return str.slice(match.index + match[0].length);
				default: {
					const i = key.slice(1);
					if (i in match) return match[i];
					return key;
				}
			}
		}
		for (const match of matcher.execAll(str)) {
			chunks.push(str.slice(index, match.index));
			chunks.push(replacement.replace(placeholder, (key) => replacer(key, match)));
			index = match.index + match[0].length;
		}
		chunks.push(str.slice(index));
		return chunks.join("");
	}
	/**
	* Replace a given string by a given matcher.
	* @param {PatternMatcher} matcher The pattern matcher.
	* @param {string} str The string to be replaced.
	* @param {(substring: string, ...args: any[]) => string} replace The function to replace each matched part.
	* @returns {string} The replaced string.
	*/
	function replaceF(matcher, str, replace) {
		const chunks = [];
		let index = 0;
		for (const match of matcher.execAll(str)) {
			chunks.push(str.slice(index, match.index));
			chunks.push(String(replace(...match, match.index, match.input)));
			index = match.index + match[0].length;
		}
		chunks.push(str.slice(index));
		return chunks.join("");
	}
	/**
	* The class to find patterns as considering escape sequences.
	*/
	var PatternMatcher = class {
		/**
		* Initialize this matcher.
		* @param {RegExp} pattern The pattern to match.
		* @param {{escaped?:boolean}} [options] The options.
		*/
		constructor(pattern, options = {}) {
			const { escaped = false } = options;
			if (!(pattern instanceof RegExp)) throw new TypeError("'pattern' should be a RegExp instance.");
			if (!pattern.flags.includes("g")) throw new Error("'pattern' should contains 'g' flag.");
			internal.set(this, {
				pattern: new RegExp(pattern.source, pattern.flags),
				escaped: Boolean(escaped)
			});
		}
		/**
		* Find the pattern in a given string.
		* @param {string} str The string to find.
		* @returns {IterableIterator<RegExpExecArray>} The iterator which iterate the matched information.
		*/
		*execAll(str) {
			const { pattern, escaped } = internal.get(this);
			let match = null;
			let lastIndex = 0;
			pattern.lastIndex = 0;
			while ((match = pattern.exec(str)) != null) if (escaped || !isEscaped(str, match.index)) {
				lastIndex = pattern.lastIndex;
				yield match;
				pattern.lastIndex = lastIndex;
			}
		}
		/**
		* Check whether the pattern is found in a given string.
		* @param {string} str The string to check.
		* @returns {boolean} `true` if the pattern was found in the string.
		*/
		test(str) {
			return !this.execAll(str).next().done;
		}
		/**
		* Replace a given string.
		* @param {string} str The string to be replaced.
		* @param {(string|((...strs:string[])=>string))} replacer The string or function to replace. This is the same as the 2nd argument of `String.prototype.replace`.
		* @returns {string} The replaced string.
		*/
		[Symbol.replace](str, replacer) {
			return typeof replacer === "function" ? replaceF(this, String(str), replacer) : replaceS(this, String(str), String(replacer));
		}
	};
	/** @typedef {import("eslint").Scope.Scope} Scope */
	/** @typedef {import("eslint").Scope.Variable} Variable */
	/** @typedef {import("eslint").Rule.Node} RuleNode */
	/** @typedef {import("estree").Node} Node */
	/** @typedef {import("estree").Expression} Expression */
	/** @typedef {import("estree").Pattern} Pattern */
	/** @typedef {import("estree").Identifier} Identifier */
	/** @typedef {import("estree").SimpleCallExpression} CallExpression */
	/** @typedef {import("estree").Program} Program */
	/** @typedef {import("estree").ImportDeclaration} ImportDeclaration */
	/** @typedef {import("estree").ExportAllDeclaration} ExportAllDeclaration */
	/** @typedef {import("estree").ExportDefaultDeclaration} ExportDefaultDeclaration */
	/** @typedef {import("estree").ExportNamedDeclaration} ExportNamedDeclaration */
	/** @typedef {import("estree").ImportSpecifier} ImportSpecifier */
	/** @typedef {import("estree").ImportDefaultSpecifier} ImportDefaultSpecifier */
	/** @typedef {import("estree").ImportNamespaceSpecifier} ImportNamespaceSpecifier */
	/** @typedef {import("estree").ExportSpecifier} ExportSpecifier */
	/** @typedef {import("estree").Property} Property */
	/** @typedef {import("estree").AssignmentProperty} AssignmentProperty */
	/** @typedef {import("estree").Literal} Literal */
	/** @typedef {import("@typescript-eslint/types").TSESTree.Node} TSESTreeNode */
	/** @typedef {import("./types.mjs").ReferenceTrackerOptions} ReferenceTrackerOptions */
	/**
	* @template T
	* @typedef {import("./types.mjs").TraceMap<T>} TraceMap
	*/
	/**
	* @template T
	* @typedef {import("./types.mjs").TraceMapObject<T>} TraceMapObject
	*/
	/**
	* @template T
	* @typedef {import("./types.mjs").TrackedReferences<T>} TrackedReferences
	*/
	const IMPORT_TYPE = /^(?:Import|Export(?:All|Default|Named))Declaration$/u;
	/**
	* Check whether a given node is an import node or not.
	* @param {Node} node
	* @returns {node is ImportDeclaration|ExportAllDeclaration|ExportNamedDeclaration&{source: Literal}} `true` if the node is an import node.
	*/
	function isHasSource(node) {
		return IMPORT_TYPE.test(node.type) && node.source != null;
	}
	const has = Function.call.bind(Object.hasOwnProperty);
	const READ = Symbol("read");
	const CALL = Symbol("call");
	const CONSTRUCT = Symbol("construct");
	const ESM = Symbol("esm");
	const requireCall = { require: { [CALL]: true } };
	/**
	* Check whether a given variable is modified or not.
	* @param {Variable|undefined} variable The variable to check.
	* @returns {boolean} `true` if the variable is modified.
	*/
	function isModifiedGlobal(variable) {
		return variable == null || variable.defs.length !== 0 || variable.references.some((r) => r.isWrite());
	}
	/**
	* Check if the value of a given node is passed through to the parent syntax as-is.
	* For example, `a` and `b` in (`a || b` and `c ? a : b`) are passed through.
	* @param {Node} node A node to check.
	* @returns {node is RuleNode & {parent: Expression}} `true` if the node is passed through.
	*/
	function isPassThrough(node) {
		const parent = node.parent;
		if (parent) switch (parent.type) {
			case "ConditionalExpression": return parent.consequent === node || parent.alternate === node;
			case "LogicalExpression": return true;
			case "SequenceExpression": return parent.expressions[parent.expressions.length - 1] === node;
			case "ChainExpression": return true;
			case "TSAsExpression":
			case "TSSatisfiesExpression":
			case "TSTypeAssertion":
			case "TSNonNullExpression":
			case "TSInstantiationExpression": return true;
			default: return false;
		}
		return false;
	}
	/**
	* The reference tracker.
	*/
	var ReferenceTracker = class {
		/**
		* Initialize this tracker.
		* @param {Scope} globalScope The global scope.
		* @param {object} [options] The options.
		* @param {"legacy"|"strict"} [options.mode="strict"] The mode to determine the ImportDeclaration's behavior for CJS modules.
		* @param {string[]} [options.globalObjectNames=["global","globalThis","self","window"]] The variable names for Global Object.
		*/
		constructor(globalScope, options = {}) {
			const { mode = "strict", globalObjectNames = [
				"global",
				"globalThis",
				"self",
				"window"
			] } = options;
			/** @private @type {Variable[]} */
			this.variableStack = [];
			/** @private */
			this.globalScope = globalScope;
			/** @private */
			this.mode = mode;
			/** @private */
			this.globalObjectNames = globalObjectNames.slice(0);
		}
		/**
		* Iterate the references of global variables.
		* @template T
		* @param {TraceMap<T>} traceMap The trace map.
		* @returns {IterableIterator<TrackedReferences<T>>} The iterator to iterate references.
		*/
		*iterateGlobalReferences(traceMap) {
			for (const key of Object.keys(traceMap)) {
				const nextTraceMap = traceMap[key];
				const path = [key];
				const variable = this.globalScope.set.get(key);
				if (isModifiedGlobal(variable)) continue;
				yield* this._iterateVariableReferences(variable, path, nextTraceMap, true);
			}
			for (const key of this.globalObjectNames) {
				/** @type {string[]} */
				const path = [];
				const variable = this.globalScope.set.get(key);
				if (isModifiedGlobal(variable)) continue;
				yield* this._iterateVariableReferences(variable, path, traceMap, false);
			}
		}
		/**
		* Iterate the references of CommonJS modules.
		* @template T
		* @param {TraceMap<T>} traceMap The trace map.
		* @returns {IterableIterator<TrackedReferences<T>>} The iterator to iterate references.
		*/
		*iterateCjsReferences(traceMap) {
			for (const { node } of this.iterateGlobalReferences(requireCall)) {
				const key = getStringIfConstant(
					/** @type {CallExpression} */
					node.arguments[0]
				);
				if (key == null || !has(traceMap, key)) continue;
				const nextTraceMap = traceMap[key];
				const path = [key];
				if (nextTraceMap[READ]) yield {
					node,
					path,
					type: READ,
					info: nextTraceMap[READ]
				};
				yield* this._iteratePropertyReferences(node, path, nextTraceMap);
			}
		}
		/**
		* Iterate the references of ES modules.
		* @template T
		* @param {TraceMap<T>} traceMap The trace map.
		* @returns {IterableIterator<TrackedReferences<T>>} The iterator to iterate references.
		*/
		*iterateEsmReferences(traceMap) {
			const programNode = this.globalScope.block;
			for (const node of programNode.body) {
				if (!isHasSource(node)) continue;
				const moduleId = node.source.value;
				if (!has(traceMap, moduleId)) continue;
				const nextTraceMap = traceMap[moduleId];
				const path = [moduleId];
				if (nextTraceMap[READ]) yield {
					node,
					path,
					type: READ,
					info: nextTraceMap[READ]
				};
				if (node.type === "ExportAllDeclaration") for (const key of Object.keys(nextTraceMap)) {
					const exportTraceMap = nextTraceMap[key];
					if (exportTraceMap[READ]) yield {
						node,
						path: path.concat(key),
						type: READ,
						info: exportTraceMap[READ]
					};
				}
				else for (const specifier of node.specifiers) {
					const esm = has(nextTraceMap, ESM);
					const it = this._iterateImportReferences(specifier, path, esm ? nextTraceMap : this.mode === "legacy" ? {
						default: nextTraceMap,
						...nextTraceMap
					} : { default: nextTraceMap });
					if (esm) yield* it;
					else for (const report of it) {
						report.path = report.path.filter(exceptDefault);
						if (report.path.length >= 2 || report.type !== READ) yield report;
					}
				}
			}
		}
		/**
		* Iterate the property references for a given expression AST node.
		* @template T
		* @param {Expression} node The expression AST node to iterate property references.
		* @param {TraceMap<T>} traceMap The trace map.
		* @returns {IterableIterator<TrackedReferences<T>>} The iterator to iterate property references.
		*/
		*iteratePropertyReferences(node, traceMap) {
			yield* this._iteratePropertyReferences(node, [], traceMap);
		}
		/**
		* Iterate the references for a given variable.
		* @private
		* @template T
		* @param {Variable} variable The variable to iterate that references.
		* @param {string[]} path The current path.
		* @param {TraceMapObject<T>} traceMap The trace map.
		* @param {boolean} shouldReport = The flag to report those references.
		* @returns {IterableIterator<TrackedReferences<T>>} The iterator to iterate references.
		*/
		*_iterateVariableReferences(variable, path, traceMap, shouldReport) {
			if (this.variableStack.includes(variable)) return;
			this.variableStack.push(variable);
			try {
				for (const reference of variable.references) {
					if (!reference.isRead()) continue;
					const node = reference.identifier;
					if (shouldReport && traceMap[READ]) yield {
						node,
						path,
						type: READ,
						info: traceMap[READ]
					};
					yield* this._iteratePropertyReferences(node, path, traceMap);
				}
			} finally {
				this.variableStack.pop();
			}
		}
		/**
		* Iterate the references for a given AST node.
		* @private
		* @template T
		* @param {Expression} rootNode The AST node to iterate references.
		* @param {string[]} path The current path.
		* @param {TraceMapObject<T>} traceMap The trace map.
		* @returns {IterableIterator<TrackedReferences<T>>} The iterator to iterate references.
		*/
		*_iteratePropertyReferences(rootNode, path, traceMap) {
			let node = rootNode;
			while (isPassThrough(node)) node = node.parent;
			const parent = node.parent;
			if (parent.type === "MemberExpression") {
				if (parent.object === node) {
					const key = getPropertyName(parent);
					if (key == null || !has(traceMap, key)) return;
					path = path.concat(key);
					const nextTraceMap = traceMap[key];
					if (nextTraceMap[READ]) yield {
						node: parent,
						path,
						type: READ,
						info: nextTraceMap[READ]
					};
					yield* this._iteratePropertyReferences(parent, path, nextTraceMap);
				}
				return;
			}
			if (parent.type === "CallExpression") {
				if (parent.callee === node && traceMap[CALL]) yield {
					node: parent,
					path,
					type: CALL,
					info: traceMap[CALL]
				};
				return;
			}
			if (parent.type === "NewExpression") {
				if (parent.callee === node && traceMap[CONSTRUCT]) yield {
					node: parent,
					path,
					type: CONSTRUCT,
					info: traceMap[CONSTRUCT]
				};
				return;
			}
			if (parent.type === "AssignmentExpression") {
				if (parent.right === node) {
					yield* this._iterateLhsReferences(parent.left, path, traceMap);
					yield* this._iteratePropertyReferences(parent, path, traceMap);
				}
				return;
			}
			if (parent.type === "AssignmentPattern") {
				if (parent.right === node) yield* this._iterateLhsReferences(parent.left, path, traceMap);
				return;
			}
			if (parent.type === "VariableDeclarator") {
				if (parent.init === node) yield* this._iterateLhsReferences(parent.id, path, traceMap);
			}
		}
		/**
		* Iterate the references for a given Pattern node.
		* @private
		* @template T
		* @param {Pattern} patternNode The Pattern node to iterate references.
		* @param {string[]} path The current path.
		* @param {TraceMapObject<T>} traceMap The trace map.
		* @returns {IterableIterator<TrackedReferences<T>>} The iterator to iterate references.
		*/
		*_iterateLhsReferences(patternNode, path, traceMap) {
			if (patternNode.type === "Identifier") {
				const variable = findVariable(this.globalScope, patternNode);
				if (variable != null) yield* this._iterateVariableReferences(variable, path, traceMap, false);
				return;
			}
			if (patternNode.type === "ObjectPattern") {
				for (const property of patternNode.properties) {
					const key = getPropertyName(property);
					if (key == null || !has(traceMap, key)) continue;
					const nextPath = path.concat(key);
					const nextTraceMap = traceMap[key];
					if (nextTraceMap[READ]) yield {
						node: property,
						path: nextPath,
						type: READ,
						info: nextTraceMap[READ]
					};
					yield* this._iterateLhsReferences(
						/** @type {AssignmentProperty} */
						property.value,
						nextPath,
						nextTraceMap
					);
				}
				return;
			}
			if (patternNode.type === "AssignmentPattern") yield* this._iterateLhsReferences(patternNode.left, path, traceMap);
		}
		/**
		* Iterate the references for a given ModuleSpecifier node.
		* @private
		* @template T
		* @param {ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier | ExportSpecifier} specifierNode The ModuleSpecifier node to iterate references.
		* @param {string[]} path The current path.
		* @param {TraceMapObject<T>} traceMap The trace map.
		* @returns {IterableIterator<TrackedReferences<T>>} The iterator to iterate references.
		*/
		*_iterateImportReferences(specifierNode, path, traceMap) {
			const type = specifierNode.type;
			if (type === "ImportSpecifier" || type === "ImportDefaultSpecifier") {
				const key = type === "ImportDefaultSpecifier" ? "default" : specifierNode.imported.type === "Identifier" ? specifierNode.imported.name : specifierNode.imported.value;
				if (!has(traceMap, key)) return;
				path = path.concat(key);
				const nextTraceMap = traceMap[key];
				if (nextTraceMap[READ]) yield {
					node: specifierNode,
					path,
					type: READ,
					info: nextTraceMap[READ]
				};
				yield* this._iterateVariableReferences(findVariable(this.globalScope, specifierNode.local), path, nextTraceMap, false);
				return;
			}
			if (type === "ImportNamespaceSpecifier") {
				yield* this._iterateVariableReferences(findVariable(this.globalScope, specifierNode.local), path, traceMap, false);
				return;
			}
			if (type === "ExportSpecifier") {
				const key = specifierNode.local.type === "Identifier" ? specifierNode.local.name : specifierNode.local.value;
				if (!has(traceMap, key)) return;
				path = path.concat(key);
				const nextTraceMap = traceMap[key];
				if (nextTraceMap[READ]) yield {
					node: specifierNode,
					path,
					type: READ,
					info: nextTraceMap[READ]
				};
			}
		}
	};
	ReferenceTracker.READ = READ;
	ReferenceTracker.CALL = CALL;
	ReferenceTracker.CONSTRUCT = CONSTRUCT;
	ReferenceTracker.ESM = ESM;
	/**
	* This is a predicate function for Array#filter.
	* @param {string} name A name part.
	* @param {number} index The index of the name.
	* @returns {boolean} `false` if it's default.
	*/
	function exceptDefault(name$1, index) {
		return !(index === 1 && name$1 === "default");
	}
	/** @typedef {import("./types.mjs").StaticValue} StaticValue */
	var index = {
		CALL,
		CONSTRUCT,
		ESM,
		findVariable,
		getFunctionHeadLocation,
		getFunctionNameWithKind,
		getInnermostScope,
		getPropertyName,
		getStaticValue,
		getStringIfConstant,
		hasSideEffect,
		isArrowToken,
		isClosingBraceToken,
		isClosingBracketToken,
		isClosingParenToken,
		isColonToken,
		isCommaToken,
		isCommentToken,
		isNotArrowToken,
		isNotClosingBraceToken,
		isNotClosingBracketToken,
		isNotClosingParenToken,
		isNotColonToken,
		isNotCommaToken,
		isNotCommentToken,
		isNotOpeningBraceToken,
		isNotOpeningBracketToken,
		isNotOpeningParenToken,
		isNotSemicolonToken,
		isOpeningBraceToken,
		isOpeningBracketToken,
		isOpeningParenToken,
		isParenthesized,
		isSemicolonToken,
		PatternMatcher,
		READ,
		ReferenceTracker
	};
	exports.CALL = CALL;
	exports.CONSTRUCT = CONSTRUCT;
	exports.ESM = ESM;
	exports.PatternMatcher = PatternMatcher;
	exports.READ = READ;
	exports.ReferenceTracker = ReferenceTracker;
	exports["default"] = index;
	exports.findVariable = findVariable;
	exports.getFunctionHeadLocation = getFunctionHeadLocation;
	exports.getFunctionNameWithKind = getFunctionNameWithKind;
	exports.getInnermostScope = getInnermostScope;
	exports.getPropertyName = getPropertyName;
	exports.getStaticValue = getStaticValue;
	exports.getStringIfConstant = getStringIfConstant;
	exports.hasSideEffect = hasSideEffect;
	exports.isArrowToken = isArrowToken;
	exports.isClosingBraceToken = isClosingBraceToken;
	exports.isClosingBracketToken = isClosingBracketToken;
	exports.isClosingParenToken = isClosingParenToken;
	exports.isColonToken = isColonToken;
	exports.isCommaToken = isCommaToken;
	exports.isCommentToken = isCommentToken;
	exports.isNotArrowToken = isNotArrowToken;
	exports.isNotClosingBraceToken = isNotClosingBraceToken;
	exports.isNotClosingBracketToken = isNotClosingBracketToken;
	exports.isNotClosingParenToken = isNotClosingParenToken;
	exports.isNotColonToken = isNotColonToken;
	exports.isNotCommaToken = isNotCommaToken;
	exports.isNotCommentToken = isNotCommentToken;
	exports.isNotOpeningBraceToken = isNotOpeningBraceToken;
	exports.isNotOpeningBracketToken = isNotOpeningBracketToken;
	exports.isNotOpeningParenToken = isNotOpeningParenToken;
	exports.isNotSemicolonToken = isNotSemicolonToken;
	exports.isOpeningBraceToken = isOpeningBraceToken;
	exports.isOpeningBracketToken = isOpeningBracketToken;
	exports.isOpeningParenToken = isOpeningParenToken;
	exports.isParenthesized = isParenthesized;
	exports.isSemicolonToken = isSemicolonToken;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/ast-utils/eslint-utils/astUtilities.js
var require_astUtilities = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar = exports && exports.__importStar || (function() {
		var ownKeys = function(o) {
			ownKeys = Object.getOwnPropertyNames || function(o$1) {
				var ar = [];
				for (var k in o$1) if (Object.prototype.hasOwnProperty.call(o$1, k)) ar[ar.length] = k;
				return ar;
			};
			return ownKeys(o);
		};
		return function(mod) {
			if (mod && mod.__esModule) return mod;
			var result = {};
			if (mod != null) {
				for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
			}
			__setModuleDefault(result, mod);
			return result;
		};
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isParenthesized = exports.hasSideEffect = exports.getStringIfConstant = exports.getStaticValue = exports.getPropertyName = exports.getFunctionNameWithKind = exports.getFunctionHeadLocation = void 0;
	const eslintUtils = __importStar(require_eslint_utils$2());
	/**
	* Get the proper location of a given function node to report.
	*
	* @see {@link https://eslint-community.github.io/eslint-utils/api/ast-utils.html#getfunctionheadlocation}
	*/
	exports.getFunctionHeadLocation = eslintUtils.getFunctionHeadLocation;
	/**
	* Get the name and kind of a given function node.
	*
	* @see {@link https://eslint-community.github.io/eslint-utils/api/ast-utils.html#getfunctionnamewithkind}
	*/
	exports.getFunctionNameWithKind = eslintUtils.getFunctionNameWithKind;
	/**
	* Get the property name of a given property node.
	* If the node is a computed property, this tries to compute the property name by the getStringIfConstant function.
	*
	* @see {@link https://eslint-community.github.io/eslint-utils/api/ast-utils.html#getpropertyname}
	* @returns The property name of the node. If the property name is not constant then it returns `null`.
	*/
	exports.getPropertyName = eslintUtils.getPropertyName;
	/**
	* Get the value of a given node if it can decide the value statically.
	* If the 2nd parameter `initialScope` was given, this function tries to resolve identifier references which are in the
	* given node as much as possible. In the resolving way, it does on the assumption that built-in global objects have
	* not been modified.
	* For example, it considers `Symbol.iterator`, `Symbol.for('k')`, ` String.raw``hello`` `, and `Object.freeze({a: 1}).a` as static, but `Symbol('k')` is not static.
	*
	* @see {@link https://eslint-community.github.io/eslint-utils/api/ast-utils.html#getstaticvalue}
	* @returns The `{ value: any }` shaped object. The `value` property is the static value. If it couldn't compute the
	* static value of the node, it returns `null`.
	*/
	exports.getStaticValue = eslintUtils.getStaticValue;
	/**
	* Get the string value of a given node.
	* This function is a tiny wrapper of the getStaticValue function.
	*
	* @see {@link https://eslint-community.github.io/eslint-utils/api/ast-utils.html#getstringifconstant}
	*/
	exports.getStringIfConstant = eslintUtils.getStringIfConstant;
	/**
	* Check whether a given node has any side effect or not.
	* The side effect means that it may modify a certain variable or object member. This function considers the node which
	* contains the following types as the node which has side effects:
	* - `AssignmentExpression`
	* - `AwaitExpression`
	* - `CallExpression`
	* - `ImportExpression`
	* - `NewExpression`
	* - `UnaryExpression([operator = "delete"])`
	* - `UpdateExpression`
	* - `YieldExpression`
	* - When `options.considerGetters` is `true`:
	*   - `MemberExpression`
	* - When `options.considerImplicitTypeConversion` is `true`:
	*   - `BinaryExpression([operator = "==" | "!=" | "<" | "<=" | ">" | ">=" | "<<" | ">>" | ">>>" | "+" | "-" | "*" | "/" | "%" | "|" | "^" | "&" | "in"])`
	*   - `MemberExpression([computed = true])`
	*   - `MethodDefinition([computed = true])`
	*   - `Property([computed = true])`
	*   - `UnaryExpression([operator = "-" | "+" | "!" | "~"])`
	*
	* @see {@link https://eslint-community.github.io/eslint-utils/api/ast-utils.html#hassideeffect}
	*/
	exports.hasSideEffect = eslintUtils.hasSideEffect;
	exports.isParenthesized = eslintUtils.isParenthesized;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/ast-utils/eslint-utils/PatternMatcher.js
var require_PatternMatcher = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar = exports && exports.__importStar || (function() {
		var ownKeys = function(o) {
			ownKeys = Object.getOwnPropertyNames || function(o$1) {
				var ar = [];
				for (var k in o$1) if (Object.prototype.hasOwnProperty.call(o$1, k)) ar[ar.length] = k;
				return ar;
			};
			return ownKeys(o);
		};
		return function(mod) {
			if (mod && mod.__esModule) return mod;
			var result = {};
			if (mod != null) {
				for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
			}
			__setModuleDefault(result, mod);
			return result;
		};
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PatternMatcher = void 0;
	const eslintUtils = __importStar(require_eslint_utils$2());
	/**
	* The class to find a pattern in strings as handling escape sequences.
	* It ignores the found pattern if it's escaped with `\`.
	*
	* @see {@link https://eslint-community.github.io/eslint-utils/api/ast-utils.html#patternmatcher-class}
	*/
	exports.PatternMatcher = eslintUtils.PatternMatcher;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/ast-utils/eslint-utils/predicates.js
var require_predicates$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar = exports && exports.__importStar || (function() {
		var ownKeys = function(o) {
			ownKeys = Object.getOwnPropertyNames || function(o$1) {
				var ar = [];
				for (var k in o$1) if (Object.prototype.hasOwnProperty.call(o$1, k)) ar[ar.length] = k;
				return ar;
			};
			return ownKeys(o);
		};
		return function(mod) {
			if (mod && mod.__esModule) return mod;
			var result = {};
			if (mod != null) {
				for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
			}
			__setModuleDefault(result, mod);
			return result;
		};
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isNotSemicolonToken = exports.isSemicolonToken = exports.isNotOpeningParenToken = exports.isOpeningParenToken = exports.isNotOpeningBracketToken = exports.isOpeningBracketToken = exports.isNotOpeningBraceToken = exports.isOpeningBraceToken = exports.isNotCommentToken = exports.isCommentToken = exports.isNotCommaToken = exports.isCommaToken = exports.isNotColonToken = exports.isColonToken = exports.isNotClosingParenToken = exports.isClosingParenToken = exports.isNotClosingBracketToken = exports.isClosingBracketToken = exports.isNotClosingBraceToken = exports.isClosingBraceToken = exports.isNotArrowToken = exports.isArrowToken = void 0;
	const eslintUtils = __importStar(require_eslint_utils$2());
	exports.isArrowToken = eslintUtils.isArrowToken;
	exports.isNotArrowToken = eslintUtils.isNotArrowToken;
	exports.isClosingBraceToken = eslintUtils.isClosingBraceToken;
	exports.isNotClosingBraceToken = eslintUtils.isNotClosingBraceToken;
	exports.isClosingBracketToken = eslintUtils.isClosingBracketToken;
	exports.isNotClosingBracketToken = eslintUtils.isNotClosingBracketToken;
	exports.isClosingParenToken = eslintUtils.isClosingParenToken;
	exports.isNotClosingParenToken = eslintUtils.isNotClosingParenToken;
	exports.isColonToken = eslintUtils.isColonToken;
	exports.isNotColonToken = eslintUtils.isNotColonToken;
	exports.isCommaToken = eslintUtils.isCommaToken;
	exports.isNotCommaToken = eslintUtils.isNotCommaToken;
	exports.isCommentToken = eslintUtils.isCommentToken;
	exports.isNotCommentToken = eslintUtils.isNotCommentToken;
	exports.isOpeningBraceToken = eslintUtils.isOpeningBraceToken;
	exports.isNotOpeningBraceToken = eslintUtils.isNotOpeningBraceToken;
	exports.isOpeningBracketToken = eslintUtils.isOpeningBracketToken;
	exports.isNotOpeningBracketToken = eslintUtils.isNotOpeningBracketToken;
	exports.isOpeningParenToken = eslintUtils.isOpeningParenToken;
	exports.isNotOpeningParenToken = eslintUtils.isNotOpeningParenToken;
	exports.isSemicolonToken = eslintUtils.isSemicolonToken;
	exports.isNotSemicolonToken = eslintUtils.isNotSemicolonToken;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/ast-utils/eslint-utils/ReferenceTracker.js
var require_ReferenceTracker = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar = exports && exports.__importStar || (function() {
		var ownKeys = function(o) {
			ownKeys = Object.getOwnPropertyNames || function(o$1) {
				var ar = [];
				for (var k in o$1) if (Object.prototype.hasOwnProperty.call(o$1, k)) ar[ar.length] = k;
				return ar;
			};
			return ownKeys(o);
		};
		return function(mod) {
			if (mod && mod.__esModule) return mod;
			var result = {};
			if (mod != null) {
				for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
			}
			__setModuleDefault(result, mod);
			return result;
		};
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ReferenceTracker = void 0;
	const eslintUtils = __importStar(require_eslint_utils$2());
	eslintUtils.ReferenceTracker.READ;
	eslintUtils.ReferenceTracker.CALL;
	eslintUtils.ReferenceTracker.CONSTRUCT;
	eslintUtils.ReferenceTracker.ESM;
	/**
	* The tracker for references. This provides reference tracking for global variables, CommonJS modules, and ES modules.
	*
	* @see {@link https://eslint-community.github.io/eslint-utils/api/scope-utils.html#referencetracker-class}
	*/
	exports.ReferenceTracker = eslintUtils.ReferenceTracker;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/ast-utils/eslint-utils/scopeAnalysis.js
var require_scopeAnalysis = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar = exports && exports.__importStar || (function() {
		var ownKeys = function(o) {
			ownKeys = Object.getOwnPropertyNames || function(o$1) {
				var ar = [];
				for (var k in o$1) if (Object.prototype.hasOwnProperty.call(o$1, k)) ar[ar.length] = k;
				return ar;
			};
			return ownKeys(o);
		};
		return function(mod) {
			if (mod && mod.__esModule) return mod;
			var result = {};
			if (mod != null) {
				for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
			}
			__setModuleDefault(result, mod);
			return result;
		};
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getInnermostScope = exports.findVariable = void 0;
	const eslintUtils = __importStar(require_eslint_utils$2());
	/**
	* Get the variable of a given name.
	*
	* @see {@link https://eslint-community.github.io/eslint-utils/api/scope-utils.html#findvariable}
	*/
	exports.findVariable = eslintUtils.findVariable;
	/**
	* Get the innermost scope which contains a given node.
	*
	* @see {@link https://eslint-community.github.io/eslint-utils/api/scope-utils.html#getinnermostscope}
	* @returns The innermost scope which contains the given node.
	* If such scope doesn't exist then it returns the 1st argument `initialScope`.
	*/
	exports.getInnermostScope = eslintUtils.getInnermostScope;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/ast-utils/eslint-utils/index.js
var require_eslint_utils$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$1) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$1, p)) __createBinding(exports$1, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_astUtilities(), exports);
	__exportStar(require_PatternMatcher(), exports);
	__exportStar(require_predicates$1(), exports);
	__exportStar(require_ReferenceTracker(), exports);
	__exportStar(require_scopeAnalysis(), exports);
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/ast-utils/helpers.js
var require_helpers = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isNotTokenOfTypeWithConditions = exports.isTokenOfTypeWithConditions = exports.isNodeOfTypeWithConditions = exports.isNodeOfTypes = exports.isNodeOfType = void 0;
	const isNodeOfType = (nodeType) => (node) => node?.type === nodeType;
	exports.isNodeOfType = isNodeOfType;
	const isNodeOfTypes = (nodeTypes) => (node) => !!node && nodeTypes.includes(node.type);
	exports.isNodeOfTypes = isNodeOfTypes;
	const isNodeOfTypeWithConditions = (nodeType, conditions) => {
		const entries = Object.entries(conditions);
		return (node) => node?.type === nodeType && entries.every(([key, value]) => node[key] === value);
	};
	exports.isNodeOfTypeWithConditions = isNodeOfTypeWithConditions;
	const isTokenOfTypeWithConditions = (tokenType, conditions) => {
		const entries = Object.entries(conditions);
		return (token) => token?.type === tokenType && entries.every(([key, value]) => token[key] === value);
	};
	exports.isTokenOfTypeWithConditions = isTokenOfTypeWithConditions;
	const isNotTokenOfTypeWithConditions = (tokenType, conditions) => (token) => !(0, exports.isTokenOfTypeWithConditions)(tokenType, conditions)(token);
	exports.isNotTokenOfTypeWithConditions = isNotTokenOfTypeWithConditions;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/ast-utils/misc.js
var require_misc = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.LINEBREAK_MATCHER = void 0;
	exports.isTokenOnSameLine = isTokenOnSameLine;
	exports.LINEBREAK_MATCHER = /\r\n|[\r\n\u2028\u2029]/;
	/**
	* Determines whether two adjacent tokens are on the same line
	*/
	function isTokenOnSameLine(left, right) {
		return left.loc.end.line === right.loc.start.line;
	}
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+types@8.50.0/node_modules/@typescript-eslint/types/dist/generated/ast-spec.js
var require_ast_spec = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**********************************************
	*      DO NOT MODIFY THIS FILE MANUALLY      *
	*                                            *
	*  THIS FILE HAS BEEN COPIED FROM ast-spec.  *
	* ANY CHANGES WILL BE LOST ON THE NEXT BUILD *
	*                                            *
	*   MAKE CHANGES TO ast-spec AND THEN RUN    *
	*                 yarn build                 *
	**********************************************/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.AST_TOKEN_TYPES = exports.AST_NODE_TYPES = void 0;
	var AST_NODE_TYPES;
	(function(AST_NODE_TYPES$3) {
		AST_NODE_TYPES$3["AccessorProperty"] = "AccessorProperty";
		AST_NODE_TYPES$3["ArrayExpression"] = "ArrayExpression";
		AST_NODE_TYPES$3["ArrayPattern"] = "ArrayPattern";
		AST_NODE_TYPES$3["ArrowFunctionExpression"] = "ArrowFunctionExpression";
		AST_NODE_TYPES$3["AssignmentExpression"] = "AssignmentExpression";
		AST_NODE_TYPES$3["AssignmentPattern"] = "AssignmentPattern";
		AST_NODE_TYPES$3["AwaitExpression"] = "AwaitExpression";
		AST_NODE_TYPES$3["BinaryExpression"] = "BinaryExpression";
		AST_NODE_TYPES$3["BlockStatement"] = "BlockStatement";
		AST_NODE_TYPES$3["BreakStatement"] = "BreakStatement";
		AST_NODE_TYPES$3["CallExpression"] = "CallExpression";
		AST_NODE_TYPES$3["CatchClause"] = "CatchClause";
		AST_NODE_TYPES$3["ChainExpression"] = "ChainExpression";
		AST_NODE_TYPES$3["ClassBody"] = "ClassBody";
		AST_NODE_TYPES$3["ClassDeclaration"] = "ClassDeclaration";
		AST_NODE_TYPES$3["ClassExpression"] = "ClassExpression";
		AST_NODE_TYPES$3["ConditionalExpression"] = "ConditionalExpression";
		AST_NODE_TYPES$3["ContinueStatement"] = "ContinueStatement";
		AST_NODE_TYPES$3["DebuggerStatement"] = "DebuggerStatement";
		AST_NODE_TYPES$3["Decorator"] = "Decorator";
		AST_NODE_TYPES$3["DoWhileStatement"] = "DoWhileStatement";
		AST_NODE_TYPES$3["EmptyStatement"] = "EmptyStatement";
		AST_NODE_TYPES$3["ExportAllDeclaration"] = "ExportAllDeclaration";
		AST_NODE_TYPES$3["ExportDefaultDeclaration"] = "ExportDefaultDeclaration";
		AST_NODE_TYPES$3["ExportNamedDeclaration"] = "ExportNamedDeclaration";
		AST_NODE_TYPES$3["ExportSpecifier"] = "ExportSpecifier";
		AST_NODE_TYPES$3["ExpressionStatement"] = "ExpressionStatement";
		AST_NODE_TYPES$3["ForInStatement"] = "ForInStatement";
		AST_NODE_TYPES$3["ForOfStatement"] = "ForOfStatement";
		AST_NODE_TYPES$3["ForStatement"] = "ForStatement";
		AST_NODE_TYPES$3["FunctionDeclaration"] = "FunctionDeclaration";
		AST_NODE_TYPES$3["FunctionExpression"] = "FunctionExpression";
		AST_NODE_TYPES$3["Identifier"] = "Identifier";
		AST_NODE_TYPES$3["IfStatement"] = "IfStatement";
		AST_NODE_TYPES$3["ImportAttribute"] = "ImportAttribute";
		AST_NODE_TYPES$3["ImportDeclaration"] = "ImportDeclaration";
		AST_NODE_TYPES$3["ImportDefaultSpecifier"] = "ImportDefaultSpecifier";
		AST_NODE_TYPES$3["ImportExpression"] = "ImportExpression";
		AST_NODE_TYPES$3["ImportNamespaceSpecifier"] = "ImportNamespaceSpecifier";
		AST_NODE_TYPES$3["ImportSpecifier"] = "ImportSpecifier";
		AST_NODE_TYPES$3["JSXAttribute"] = "JSXAttribute";
		AST_NODE_TYPES$3["JSXClosingElement"] = "JSXClosingElement";
		AST_NODE_TYPES$3["JSXClosingFragment"] = "JSXClosingFragment";
		AST_NODE_TYPES$3["JSXElement"] = "JSXElement";
		AST_NODE_TYPES$3["JSXEmptyExpression"] = "JSXEmptyExpression";
		AST_NODE_TYPES$3["JSXExpressionContainer"] = "JSXExpressionContainer";
		AST_NODE_TYPES$3["JSXFragment"] = "JSXFragment";
		AST_NODE_TYPES$3["JSXIdentifier"] = "JSXIdentifier";
		AST_NODE_TYPES$3["JSXMemberExpression"] = "JSXMemberExpression";
		AST_NODE_TYPES$3["JSXNamespacedName"] = "JSXNamespacedName";
		AST_NODE_TYPES$3["JSXOpeningElement"] = "JSXOpeningElement";
		AST_NODE_TYPES$3["JSXOpeningFragment"] = "JSXOpeningFragment";
		AST_NODE_TYPES$3["JSXSpreadAttribute"] = "JSXSpreadAttribute";
		AST_NODE_TYPES$3["JSXSpreadChild"] = "JSXSpreadChild";
		AST_NODE_TYPES$3["JSXText"] = "JSXText";
		AST_NODE_TYPES$3["LabeledStatement"] = "LabeledStatement";
		AST_NODE_TYPES$3["Literal"] = "Literal";
		AST_NODE_TYPES$3["LogicalExpression"] = "LogicalExpression";
		AST_NODE_TYPES$3["MemberExpression"] = "MemberExpression";
		AST_NODE_TYPES$3["MetaProperty"] = "MetaProperty";
		AST_NODE_TYPES$3["MethodDefinition"] = "MethodDefinition";
		AST_NODE_TYPES$3["NewExpression"] = "NewExpression";
		AST_NODE_TYPES$3["ObjectExpression"] = "ObjectExpression";
		AST_NODE_TYPES$3["ObjectPattern"] = "ObjectPattern";
		AST_NODE_TYPES$3["PrivateIdentifier"] = "PrivateIdentifier";
		AST_NODE_TYPES$3["Program"] = "Program";
		AST_NODE_TYPES$3["Property"] = "Property";
		AST_NODE_TYPES$3["PropertyDefinition"] = "PropertyDefinition";
		AST_NODE_TYPES$3["RestElement"] = "RestElement";
		AST_NODE_TYPES$3["ReturnStatement"] = "ReturnStatement";
		AST_NODE_TYPES$3["SequenceExpression"] = "SequenceExpression";
		AST_NODE_TYPES$3["SpreadElement"] = "SpreadElement";
		AST_NODE_TYPES$3["StaticBlock"] = "StaticBlock";
		AST_NODE_TYPES$3["Super"] = "Super";
		AST_NODE_TYPES$3["SwitchCase"] = "SwitchCase";
		AST_NODE_TYPES$3["SwitchStatement"] = "SwitchStatement";
		AST_NODE_TYPES$3["TaggedTemplateExpression"] = "TaggedTemplateExpression";
		AST_NODE_TYPES$3["TemplateElement"] = "TemplateElement";
		AST_NODE_TYPES$3["TemplateLiteral"] = "TemplateLiteral";
		AST_NODE_TYPES$3["ThisExpression"] = "ThisExpression";
		AST_NODE_TYPES$3["ThrowStatement"] = "ThrowStatement";
		AST_NODE_TYPES$3["TryStatement"] = "TryStatement";
		AST_NODE_TYPES$3["UnaryExpression"] = "UnaryExpression";
		AST_NODE_TYPES$3["UpdateExpression"] = "UpdateExpression";
		AST_NODE_TYPES$3["VariableDeclaration"] = "VariableDeclaration";
		AST_NODE_TYPES$3["VariableDeclarator"] = "VariableDeclarator";
		AST_NODE_TYPES$3["WhileStatement"] = "WhileStatement";
		AST_NODE_TYPES$3["WithStatement"] = "WithStatement";
		AST_NODE_TYPES$3["YieldExpression"] = "YieldExpression";
		AST_NODE_TYPES$3["TSAbstractAccessorProperty"] = "TSAbstractAccessorProperty";
		AST_NODE_TYPES$3["TSAbstractKeyword"] = "TSAbstractKeyword";
		AST_NODE_TYPES$3["TSAbstractMethodDefinition"] = "TSAbstractMethodDefinition";
		AST_NODE_TYPES$3["TSAbstractPropertyDefinition"] = "TSAbstractPropertyDefinition";
		AST_NODE_TYPES$3["TSAnyKeyword"] = "TSAnyKeyword";
		AST_NODE_TYPES$3["TSArrayType"] = "TSArrayType";
		AST_NODE_TYPES$3["TSAsExpression"] = "TSAsExpression";
		AST_NODE_TYPES$3["TSAsyncKeyword"] = "TSAsyncKeyword";
		AST_NODE_TYPES$3["TSBigIntKeyword"] = "TSBigIntKeyword";
		AST_NODE_TYPES$3["TSBooleanKeyword"] = "TSBooleanKeyword";
		AST_NODE_TYPES$3["TSCallSignatureDeclaration"] = "TSCallSignatureDeclaration";
		AST_NODE_TYPES$3["TSClassImplements"] = "TSClassImplements";
		AST_NODE_TYPES$3["TSConditionalType"] = "TSConditionalType";
		AST_NODE_TYPES$3["TSConstructorType"] = "TSConstructorType";
		AST_NODE_TYPES$3["TSConstructSignatureDeclaration"] = "TSConstructSignatureDeclaration";
		AST_NODE_TYPES$3["TSDeclareFunction"] = "TSDeclareFunction";
		AST_NODE_TYPES$3["TSDeclareKeyword"] = "TSDeclareKeyword";
		AST_NODE_TYPES$3["TSEmptyBodyFunctionExpression"] = "TSEmptyBodyFunctionExpression";
		AST_NODE_TYPES$3["TSEnumBody"] = "TSEnumBody";
		AST_NODE_TYPES$3["TSEnumDeclaration"] = "TSEnumDeclaration";
		AST_NODE_TYPES$3["TSEnumMember"] = "TSEnumMember";
		AST_NODE_TYPES$3["TSExportAssignment"] = "TSExportAssignment";
		AST_NODE_TYPES$3["TSExportKeyword"] = "TSExportKeyword";
		AST_NODE_TYPES$3["TSExternalModuleReference"] = "TSExternalModuleReference";
		AST_NODE_TYPES$3["TSFunctionType"] = "TSFunctionType";
		AST_NODE_TYPES$3["TSImportEqualsDeclaration"] = "TSImportEqualsDeclaration";
		AST_NODE_TYPES$3["TSImportType"] = "TSImportType";
		AST_NODE_TYPES$3["TSIndexedAccessType"] = "TSIndexedAccessType";
		AST_NODE_TYPES$3["TSIndexSignature"] = "TSIndexSignature";
		AST_NODE_TYPES$3["TSInferType"] = "TSInferType";
		AST_NODE_TYPES$3["TSInstantiationExpression"] = "TSInstantiationExpression";
		AST_NODE_TYPES$3["TSInterfaceBody"] = "TSInterfaceBody";
		AST_NODE_TYPES$3["TSInterfaceDeclaration"] = "TSInterfaceDeclaration";
		AST_NODE_TYPES$3["TSInterfaceHeritage"] = "TSInterfaceHeritage";
		AST_NODE_TYPES$3["TSIntersectionType"] = "TSIntersectionType";
		AST_NODE_TYPES$3["TSIntrinsicKeyword"] = "TSIntrinsicKeyword";
		AST_NODE_TYPES$3["TSLiteralType"] = "TSLiteralType";
		AST_NODE_TYPES$3["TSMappedType"] = "TSMappedType";
		AST_NODE_TYPES$3["TSMethodSignature"] = "TSMethodSignature";
		AST_NODE_TYPES$3["TSModuleBlock"] = "TSModuleBlock";
		AST_NODE_TYPES$3["TSModuleDeclaration"] = "TSModuleDeclaration";
		AST_NODE_TYPES$3["TSNamedTupleMember"] = "TSNamedTupleMember";
		AST_NODE_TYPES$3["TSNamespaceExportDeclaration"] = "TSNamespaceExportDeclaration";
		AST_NODE_TYPES$3["TSNeverKeyword"] = "TSNeverKeyword";
		AST_NODE_TYPES$3["TSNonNullExpression"] = "TSNonNullExpression";
		AST_NODE_TYPES$3["TSNullKeyword"] = "TSNullKeyword";
		AST_NODE_TYPES$3["TSNumberKeyword"] = "TSNumberKeyword";
		AST_NODE_TYPES$3["TSObjectKeyword"] = "TSObjectKeyword";
		AST_NODE_TYPES$3["TSOptionalType"] = "TSOptionalType";
		AST_NODE_TYPES$3["TSParameterProperty"] = "TSParameterProperty";
		AST_NODE_TYPES$3["TSPrivateKeyword"] = "TSPrivateKeyword";
		AST_NODE_TYPES$3["TSPropertySignature"] = "TSPropertySignature";
		AST_NODE_TYPES$3["TSProtectedKeyword"] = "TSProtectedKeyword";
		AST_NODE_TYPES$3["TSPublicKeyword"] = "TSPublicKeyword";
		AST_NODE_TYPES$3["TSQualifiedName"] = "TSQualifiedName";
		AST_NODE_TYPES$3["TSReadonlyKeyword"] = "TSReadonlyKeyword";
		AST_NODE_TYPES$3["TSRestType"] = "TSRestType";
		AST_NODE_TYPES$3["TSSatisfiesExpression"] = "TSSatisfiesExpression";
		AST_NODE_TYPES$3["TSStaticKeyword"] = "TSStaticKeyword";
		AST_NODE_TYPES$3["TSStringKeyword"] = "TSStringKeyword";
		AST_NODE_TYPES$3["TSSymbolKeyword"] = "TSSymbolKeyword";
		AST_NODE_TYPES$3["TSTemplateLiteralType"] = "TSTemplateLiteralType";
		AST_NODE_TYPES$3["TSThisType"] = "TSThisType";
		AST_NODE_TYPES$3["TSTupleType"] = "TSTupleType";
		AST_NODE_TYPES$3["TSTypeAliasDeclaration"] = "TSTypeAliasDeclaration";
		AST_NODE_TYPES$3["TSTypeAnnotation"] = "TSTypeAnnotation";
		AST_NODE_TYPES$3["TSTypeAssertion"] = "TSTypeAssertion";
		AST_NODE_TYPES$3["TSTypeLiteral"] = "TSTypeLiteral";
		AST_NODE_TYPES$3["TSTypeOperator"] = "TSTypeOperator";
		AST_NODE_TYPES$3["TSTypeParameter"] = "TSTypeParameter";
		AST_NODE_TYPES$3["TSTypeParameterDeclaration"] = "TSTypeParameterDeclaration";
		AST_NODE_TYPES$3["TSTypeParameterInstantiation"] = "TSTypeParameterInstantiation";
		AST_NODE_TYPES$3["TSTypePredicate"] = "TSTypePredicate";
		AST_NODE_TYPES$3["TSTypeQuery"] = "TSTypeQuery";
		AST_NODE_TYPES$3["TSTypeReference"] = "TSTypeReference";
		AST_NODE_TYPES$3["TSUndefinedKeyword"] = "TSUndefinedKeyword";
		AST_NODE_TYPES$3["TSUnionType"] = "TSUnionType";
		AST_NODE_TYPES$3["TSUnknownKeyword"] = "TSUnknownKeyword";
		AST_NODE_TYPES$3["TSVoidKeyword"] = "TSVoidKeyword";
	})(AST_NODE_TYPES || (exports.AST_NODE_TYPES = AST_NODE_TYPES = {}));
	var AST_TOKEN_TYPES;
	(function(AST_TOKEN_TYPES) {
		AST_TOKEN_TYPES["Boolean"] = "Boolean";
		AST_TOKEN_TYPES["Identifier"] = "Identifier";
		AST_TOKEN_TYPES["JSXIdentifier"] = "JSXIdentifier";
		AST_TOKEN_TYPES["PrivateIdentifier"] = "PrivateIdentifier";
		AST_TOKEN_TYPES["JSXText"] = "JSXText";
		AST_TOKEN_TYPES["Keyword"] = "Keyword";
		AST_TOKEN_TYPES["Null"] = "Null";
		AST_TOKEN_TYPES["Numeric"] = "Numeric";
		AST_TOKEN_TYPES["Punctuator"] = "Punctuator";
		AST_TOKEN_TYPES["RegularExpression"] = "RegularExpression";
		AST_TOKEN_TYPES["String"] = "String";
		AST_TOKEN_TYPES["Template"] = "Template";
		AST_TOKEN_TYPES["Block"] = "Block";
		AST_TOKEN_TYPES["Line"] = "Line";
	})(AST_TOKEN_TYPES || (exports.AST_TOKEN_TYPES = AST_TOKEN_TYPES = {}));
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+types@8.50.0/node_modules/@typescript-eslint/types/dist/lib.js
var require_lib$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+types@8.50.0/node_modules/@typescript-eslint/types/dist/parser-options.js
var require_parser_options = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+types@8.50.0/node_modules/@typescript-eslint/types/dist/ts-estree.js
var require_ts_estree$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar = exports && exports.__importStar || (function() {
		var ownKeys = function(o) {
			ownKeys = Object.getOwnPropertyNames || function(o$1) {
				var ar = [];
				for (var k in o$1) if (Object.prototype.hasOwnProperty.call(o$1, k)) ar[ar.length] = k;
				return ar;
			};
			return ownKeys(o);
		};
		return function(mod) {
			if (mod && mod.__esModule) return mod;
			var result = {};
			if (mod != null) {
				for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
			}
			__setModuleDefault(result, mod);
			return result;
		};
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.TSESTree = void 0;
	exports.TSESTree = __importStar(require_ast_spec());
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+types@8.50.0/node_modules/@typescript-eslint/types/dist/index.js
var require_dist$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$1) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$1, p)) __createBinding(exports$1, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.AST_TOKEN_TYPES = exports.AST_NODE_TYPES = void 0;
	var ast_spec_1 = require_ast_spec();
	Object.defineProperty(exports, "AST_NODE_TYPES", {
		enumerable: true,
		get: function() {
			return ast_spec_1.AST_NODE_TYPES;
		}
	});
	Object.defineProperty(exports, "AST_TOKEN_TYPES", {
		enumerable: true,
		get: function() {
			return ast_spec_1.AST_TOKEN_TYPES;
		}
	});
	__exportStar(require_lib$2(), exports);
	__exportStar(require_parser_options(), exports);
	__exportStar(require_ts_estree$1(), exports);
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/ts-estree.js
var require_ts_estree = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.TSESTree = exports.AST_TOKEN_TYPES = exports.AST_NODE_TYPES = void 0;
	var types_1 = require_dist$3();
	Object.defineProperty(exports, "AST_NODE_TYPES", {
		enumerable: true,
		get: function() {
			return types_1.AST_NODE_TYPES;
		}
	});
	Object.defineProperty(exports, "AST_TOKEN_TYPES", {
		enumerable: true,
		get: function() {
			return types_1.AST_TOKEN_TYPES;
		}
	});
	Object.defineProperty(exports, "TSESTree", {
		enumerable: true,
		get: function() {
			return types_1.TSESTree;
		}
	});
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/ast-utils/predicates.js
var require_predicates = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isLoop = exports.isImportKeyword = exports.isTypeKeyword = exports.isAwaitKeyword = exports.isAwaitExpression = exports.isIdentifier = exports.isConstructor = exports.isClassOrTypeElement = exports.isTSConstructorType = exports.isTSFunctionType = exports.isFunctionOrFunctionType = exports.isFunctionType = exports.isFunction = exports.isVariableDeclarator = exports.isTypeAssertion = exports.isLogicalOrOperator = exports.isOptionalCallExpression = exports.isNotNonNullAssertionPunctuator = exports.isNonNullAssertionPunctuator = exports.isNotOptionalChainPunctuator = exports.isOptionalChainPunctuator = void 0;
	exports.isSetter = isSetter;
	const ts_estree_1 = require_ts_estree();
	const helpers_1 = require_helpers();
	exports.isOptionalChainPunctuator = (0, helpers_1.isTokenOfTypeWithConditions)(ts_estree_1.AST_TOKEN_TYPES.Punctuator, { value: "?." });
	exports.isNotOptionalChainPunctuator = (0, helpers_1.isNotTokenOfTypeWithConditions)(ts_estree_1.AST_TOKEN_TYPES.Punctuator, { value: "?." });
	exports.isNonNullAssertionPunctuator = (0, helpers_1.isTokenOfTypeWithConditions)(ts_estree_1.AST_TOKEN_TYPES.Punctuator, { value: "!" });
	exports.isNotNonNullAssertionPunctuator = (0, helpers_1.isNotTokenOfTypeWithConditions)(ts_estree_1.AST_TOKEN_TYPES.Punctuator, { value: "!" });
	/**
	* Returns true if and only if the node represents: foo?.() or foo.bar?.()
	*/
	exports.isOptionalCallExpression = (0, helpers_1.isNodeOfTypeWithConditions)(ts_estree_1.AST_NODE_TYPES.CallExpression, { optional: true });
	/**
	* Returns true if and only if the node represents logical OR
	*/
	exports.isLogicalOrOperator = (0, helpers_1.isNodeOfTypeWithConditions)(ts_estree_1.AST_NODE_TYPES.LogicalExpression, { operator: "||" });
	/**
	* Checks if a node is a type assertion:
	* ```
	* x as foo
	* <foo>x
	* ```
	*/
	exports.isTypeAssertion = (0, helpers_1.isNodeOfTypes)([ts_estree_1.AST_NODE_TYPES.TSAsExpression, ts_estree_1.AST_NODE_TYPES.TSTypeAssertion]);
	exports.isVariableDeclarator = (0, helpers_1.isNodeOfType)(ts_estree_1.AST_NODE_TYPES.VariableDeclarator);
	const functionTypes = [
		ts_estree_1.AST_NODE_TYPES.ArrowFunctionExpression,
		ts_estree_1.AST_NODE_TYPES.FunctionDeclaration,
		ts_estree_1.AST_NODE_TYPES.FunctionExpression
	];
	exports.isFunction = (0, helpers_1.isNodeOfTypes)(functionTypes);
	const functionTypeTypes = [
		ts_estree_1.AST_NODE_TYPES.TSCallSignatureDeclaration,
		ts_estree_1.AST_NODE_TYPES.TSConstructorType,
		ts_estree_1.AST_NODE_TYPES.TSConstructSignatureDeclaration,
		ts_estree_1.AST_NODE_TYPES.TSDeclareFunction,
		ts_estree_1.AST_NODE_TYPES.TSEmptyBodyFunctionExpression,
		ts_estree_1.AST_NODE_TYPES.TSFunctionType,
		ts_estree_1.AST_NODE_TYPES.TSMethodSignature
	];
	exports.isFunctionType = (0, helpers_1.isNodeOfTypes)(functionTypeTypes);
	exports.isFunctionOrFunctionType = (0, helpers_1.isNodeOfTypes)([...functionTypes, ...functionTypeTypes]);
	exports.isTSFunctionType = (0, helpers_1.isNodeOfType)(ts_estree_1.AST_NODE_TYPES.TSFunctionType);
	exports.isTSConstructorType = (0, helpers_1.isNodeOfType)(ts_estree_1.AST_NODE_TYPES.TSConstructorType);
	exports.isClassOrTypeElement = (0, helpers_1.isNodeOfTypes)([
		ts_estree_1.AST_NODE_TYPES.PropertyDefinition,
		ts_estree_1.AST_NODE_TYPES.FunctionExpression,
		ts_estree_1.AST_NODE_TYPES.MethodDefinition,
		ts_estree_1.AST_NODE_TYPES.TSAbstractPropertyDefinition,
		ts_estree_1.AST_NODE_TYPES.TSAbstractMethodDefinition,
		ts_estree_1.AST_NODE_TYPES.TSEmptyBodyFunctionExpression,
		ts_estree_1.AST_NODE_TYPES.TSIndexSignature,
		ts_estree_1.AST_NODE_TYPES.TSCallSignatureDeclaration,
		ts_estree_1.AST_NODE_TYPES.TSConstructSignatureDeclaration,
		ts_estree_1.AST_NODE_TYPES.TSMethodSignature,
		ts_estree_1.AST_NODE_TYPES.TSPropertySignature
	]);
	/**
	* Checks if a node is a constructor method.
	*/
	exports.isConstructor = (0, helpers_1.isNodeOfTypeWithConditions)(ts_estree_1.AST_NODE_TYPES.MethodDefinition, { kind: "constructor" });
	/**
	* Checks if a node is a setter method.
	*/
	function isSetter(node) {
		return !!node && (node.type === ts_estree_1.AST_NODE_TYPES.MethodDefinition || node.type === ts_estree_1.AST_NODE_TYPES.Property) && node.kind === "set";
	}
	exports.isIdentifier = (0, helpers_1.isNodeOfType)(ts_estree_1.AST_NODE_TYPES.Identifier);
	/**
	* Checks if a node represents an `await …` expression.
	*/
	exports.isAwaitExpression = (0, helpers_1.isNodeOfType)(ts_estree_1.AST_NODE_TYPES.AwaitExpression);
	/**
	* Checks if a possible token is the `await` keyword.
	*/
	exports.isAwaitKeyword = (0, helpers_1.isTokenOfTypeWithConditions)(ts_estree_1.AST_TOKEN_TYPES.Identifier, { value: "await" });
	/**
	* Checks if a possible token is the `type` keyword.
	*/
	exports.isTypeKeyword = (0, helpers_1.isTokenOfTypeWithConditions)(ts_estree_1.AST_TOKEN_TYPES.Identifier, { value: "type" });
	/**
	* Checks if a possible token is the `import` keyword.
	*/
	exports.isImportKeyword = (0, helpers_1.isTokenOfTypeWithConditions)(ts_estree_1.AST_TOKEN_TYPES.Keyword, { value: "import" });
	exports.isLoop = (0, helpers_1.isNodeOfTypes)([
		ts_estree_1.AST_NODE_TYPES.DoWhileStatement,
		ts_estree_1.AST_NODE_TYPES.ForStatement,
		ts_estree_1.AST_NODE_TYPES.ForInStatement,
		ts_estree_1.AST_NODE_TYPES.ForOfStatement,
		ts_estree_1.AST_NODE_TYPES.WhileStatement
	]);
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/ast-utils/index.js
var require_ast_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$1) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$1, p)) __createBinding(exports$1, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_eslint_utils$1(), exports);
	__exportStar(require_helpers(), exports);
	__exportStar(require_misc(), exports);
	__exportStar(require_predicates(), exports);
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/eslint-utils/deepMerge.js
var require_deepMerge = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isObjectNotArray = isObjectNotArray;
	exports.deepMerge = deepMerge;
	/**
	* Check if the variable contains an object strictly rejecting arrays
	* @returns `true` if obj is an object
	*/
	function isObjectNotArray(obj) {
		return typeof obj === "object" && obj != null && !Array.isArray(obj);
	}
	/**
	* Pure function - doesn't mutate either parameter!
	* Merges two objects together deeply, overwriting the properties in first with the properties in second
	* @param first The first object
	* @param second The second object
	* @returns a new object
	*/
	function deepMerge(first = {}, second = {}) {
		const keys = new Set([...Object.keys(first), ...Object.keys(second)]);
		return Object.fromEntries([...keys].map((key) => {
			const firstHasKey = key in first;
			const secondHasKey = key in second;
			const firstValue = first[key];
			const secondValue = second[key];
			let value;
			if (firstHasKey && secondHasKey) if (isObjectNotArray(firstValue) && isObjectNotArray(secondValue)) value = deepMerge(firstValue, secondValue);
			else value = secondValue;
			else if (firstHasKey) value = firstValue;
			else value = secondValue;
			return [key, value];
		}));
	}
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/eslint-utils/applyDefault.js
var require_applyDefault = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.applyDefault = applyDefault;
	const deepMerge_1 = require_deepMerge();
	/**
	* Pure function - doesn't mutate either parameter!
	* Uses the default options and overrides with the options provided by the user
	* @param defaultOptions the defaults
	* @param userOptions the user opts
	* @returns the options with defaults
	*/
	function applyDefault(defaultOptions, userOptions) {
		const options = structuredClone(defaultOptions);
		if (userOptions == null) return options;
		options.forEach((opt, i) => {
			if (userOptions[i] !== void 0) {
				const userOpt = userOptions[i];
				if ((0, deepMerge_1.isObjectNotArray)(userOpt) && (0, deepMerge_1.isObjectNotArray)(opt)) options[i] = (0, deepMerge_1.deepMerge)(opt, userOpt);
				else options[i] = userOpt;
			}
		});
		return options;
	}
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/eslint-utils/parserSeemsToBeTSESLint.js
var require_parserSeemsToBeTSESLint = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.parserSeemsToBeTSESLint = parserSeemsToBeTSESLint;
	function parserSeemsToBeTSESLint(parser) {
		return !!parser && /(?:typescript-eslint|\.\.)[\w/\\]*parser/.test(parser);
	}
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/eslint-utils/getParserServices.js
var require_getParserServices = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getParserServices = getParserServices;
	const parserSeemsToBeTSESLint_1 = require_parserSeemsToBeTSESLint();
	const ERROR_MESSAGE_REQUIRES_PARSER_SERVICES = "You have used a rule which requires type information, but don't have parserOptions set to generate type information for this file. See https://typescript-eslint.io/getting-started/typed-linting for enabling linting with type information.";
	const ERROR_MESSAGE_UNKNOWN_PARSER = "Note: detected a parser other than @typescript-eslint/parser. Make sure the parser is configured to forward \"parserOptions.project\" to @typescript-eslint/parser.";
	function getParserServices(context, allowWithoutFullTypeInformation = false) {
		const parser = context.parserPath || context.languageOptions.parser?.meta?.name;
		if (context.sourceCode.parserServices?.esTreeNodeToTSNodeMap == null || context.sourceCode.parserServices.tsNodeToESTreeNodeMap == null) throwError(parser);
		if (context.sourceCode.parserServices.program == null && !allowWithoutFullTypeInformation) throwError(parser);
		return context.sourceCode.parserServices;
	}
	function throwError(parser) {
		const messages = [
			ERROR_MESSAGE_REQUIRES_PARSER_SERVICES,
			`Parser: ${parser || "(unknown)"}`,
			!(0, parserSeemsToBeTSESLint_1.parserSeemsToBeTSESLint)(parser) && ERROR_MESSAGE_UNKNOWN_PARSER
		].filter(Boolean);
		throw new Error(messages.join("\n"));
	}
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/eslint-utils/InferTypesFromRule.js
var require_InferTypesFromRule = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/eslint-utils/nullThrows.js
var require_nullThrows = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.NullThrowsReasons = void 0;
	exports.nullThrows = nullThrows;
	/**
	* A set of common reasons for calling nullThrows
	*/
	exports.NullThrowsReasons = {
		MissingParent: "Expected node to have a parent.",
		MissingToken: (token, thing) => `Expected to find a ${token} for the ${thing}.`
	};
	/**
	* Assert that a value must not be null or undefined.
	* This is a nice explicit alternative to the non-null assertion operator.
	*/
	function nullThrows(value, message) {
		if (value == null) throw new Error(`Non-null Assertion Failed: ${message}`);
		return value;
	}
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/eslint-utils/RuleCreator.js
var require_RuleCreator = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.RuleCreator = RuleCreator;
	const applyDefault_1 = require_applyDefault();
	/**
	* Creates reusable function to create rules with default options and docs URLs.
	*
	* @param urlCreator Creates a documentation URL for a given rule name.
	* @returns Function to create a rule with the docs URL format.
	*/
	function RuleCreator(urlCreator) {
		return function createNamedRule({ meta, name: name$1, ...rule$4 }) {
			return createRule({
				meta: {
					...meta,
					docs: {
						...meta.docs,
						url: urlCreator(name$1)
					}
				},
				...rule$4
			});
		};
	}
	function createRule({ create, defaultOptions, meta }) {
		return {
			create(context) {
				return create(context, (0, applyDefault_1.applyDefault)(defaultOptions, context.options));
			},
			defaultOptions,
			meta
		};
	}
	/**
	* Creates a well-typed TSESLint custom ESLint rule without a docs URL.
	*
	* @returns Well-typed TSESLint custom ESLint rule.
	* @remarks It is generally better to provide a docs URL function to RuleCreator.
	*/
	RuleCreator.withoutDocs = function withoutDocs(args) {
		return createRule(args);
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/eslint-utils/index.js
var require_eslint_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$1) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$1, p)) __createBinding(exports$1, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_applyDefault(), exports);
	__exportStar(require_deepMerge(), exports);
	__exportStar(require_getParserServices(), exports);
	__exportStar(require_InferTypesFromRule(), exports);
	__exportStar(require_nullThrows(), exports);
	__exportStar(require_RuleCreator(), exports);
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/json-schema.js
var require_json_schema = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* This is a fork of https://github.com/DefinitelyTyped/DefinitelyTyped/blob/13f63c2eb8d7479caf01ab8d72f9e3683368a8f5/types/json-schema/index.d.ts
	* We intentionally fork this because:
	* - ESLint ***ONLY*** supports JSONSchema v4
	* - We want to provide stricter types
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/ts-eslint/AST.js
var require_AST = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/ts-eslint/Config.js
var require_Config = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/ts-eslint/eslint/FlatESLint.js
var require_FlatESLint = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.FlatESLint = void 0;
	const use_at_your_own_risk_1$1 = __require("eslint/use-at-your-own-risk");
	/**
	* The ESLint class is the primary class to use in Node.js applications.
	* This class depends on the Node.js fs module and the file system, so you cannot use it in browsers.
	*
	* If you want to lint code on browsers, use the Linter class instead.
	*/
	var FlatESLint = class extends use_at_your_own_risk_1$1.FlatESLint {};
	exports.FlatESLint = FlatESLint;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/ts-eslint/eslint/LegacyESLint.js
var require_LegacyESLint = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.LegacyESLint = void 0;
	const use_at_your_own_risk_1 = __require("eslint/use-at-your-own-risk");
	/**
	* The ESLint class is the primary class to use in Node.js applications.
	* This class depends on the Node.js fs module and the file system, so you cannot use it in browsers.
	*
	* If you want to lint code on browsers, use the Linter class instead.
	*/
	var LegacyESLint = class extends use_at_your_own_risk_1.LegacyESLint {};
	exports.LegacyESLint = LegacyESLint;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/ts-eslint/ESLint.js
var require_ESLint = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.LegacyESLint = exports.ESLint = exports.FlatESLint = void 0;
	var FlatESLint_1 = require_FlatESLint();
	Object.defineProperty(exports, "FlatESLint", {
		enumerable: true,
		get: function() {
			return FlatESLint_1.FlatESLint;
		}
	});
	var FlatESLint_2 = require_FlatESLint();
	Object.defineProperty(exports, "ESLint", {
		enumerable: true,
		get: function() {
			return FlatESLint_2.FlatESLint;
		}
	});
	var LegacyESLint_1 = require_LegacyESLint();
	/**
	* @deprecated - use ESLint instead
	*/
	Object.defineProperty(exports, "LegacyESLint", {
		enumerable: true,
		get: function() {
			return LegacyESLint_1.LegacyESLint;
		}
	});
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/ts-eslint/Linter.js
var require_Linter = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Linter = void 0;
	const eslint_1$2 = __require("eslint");
	/**
	* The Linter object does the actual evaluation of the JavaScript code. It doesn't do any filesystem operations, it
	* simply parses and reports on the code. In particular, the Linter object does not process configuration objects
	* or files.
	*/
	var Linter = class extends eslint_1$2.Linter {};
	exports.Linter = Linter;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/ts-eslint/Parser.js
var require_Parser = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/ts-eslint/ParserOptions.js
var require_ParserOptions = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/ts-eslint/Processor.js
var require_Processor = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/ts-eslint/Rule.js
var require_Rule = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/ts-eslint/RuleTester.js
var require_RuleTester = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.RuleTester = void 0;
	const eslint_1$1 = __require("eslint");
	/**
	* @deprecated Use `@typescript-eslint/rule-tester` instead.
	*/
	var RuleTester = class extends eslint_1$1.RuleTester {};
	exports.RuleTester = RuleTester;
}));

//#endregion
//#region node_modules/.pnpm/eslint-visitor-keys@4.2.1/node_modules/eslint-visitor-keys/dist/eslint-visitor-keys.cjs
var require_eslint_visitor_keys = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* @typedef {{ readonly [type: string]: ReadonlyArray<string> }} VisitorKeys
	*/
	/**
	* @type {VisitorKeys}
	*/
	const KEYS = {
		ArrayExpression: ["elements"],
		ArrayPattern: ["elements"],
		ArrowFunctionExpression: ["params", "body"],
		AssignmentExpression: ["left", "right"],
		AssignmentPattern: ["left", "right"],
		AwaitExpression: ["argument"],
		BinaryExpression: ["left", "right"],
		BlockStatement: ["body"],
		BreakStatement: ["label"],
		CallExpression: ["callee", "arguments"],
		CatchClause: ["param", "body"],
		ChainExpression: ["expression"],
		ClassBody: ["body"],
		ClassDeclaration: [
			"id",
			"superClass",
			"body"
		],
		ClassExpression: [
			"id",
			"superClass",
			"body"
		],
		ConditionalExpression: [
			"test",
			"consequent",
			"alternate"
		],
		ContinueStatement: ["label"],
		DebuggerStatement: [],
		DoWhileStatement: ["body", "test"],
		EmptyStatement: [],
		ExperimentalRestProperty: ["argument"],
		ExperimentalSpreadProperty: ["argument"],
		ExportAllDeclaration: [
			"exported",
			"source",
			"attributes"
		],
		ExportDefaultDeclaration: ["declaration"],
		ExportNamedDeclaration: [
			"declaration",
			"specifiers",
			"source",
			"attributes"
		],
		ExportSpecifier: ["local", "exported"],
		ExpressionStatement: ["expression"],
		ForInStatement: [
			"left",
			"right",
			"body"
		],
		ForOfStatement: [
			"left",
			"right",
			"body"
		],
		ForStatement: [
			"init",
			"test",
			"update",
			"body"
		],
		FunctionDeclaration: [
			"id",
			"params",
			"body"
		],
		FunctionExpression: [
			"id",
			"params",
			"body"
		],
		Identifier: [],
		IfStatement: [
			"test",
			"consequent",
			"alternate"
		],
		ImportAttribute: ["key", "value"],
		ImportDeclaration: [
			"specifiers",
			"source",
			"attributes"
		],
		ImportDefaultSpecifier: ["local"],
		ImportExpression: ["source", "options"],
		ImportNamespaceSpecifier: ["local"],
		ImportSpecifier: ["imported", "local"],
		JSXAttribute: ["name", "value"],
		JSXClosingElement: ["name"],
		JSXClosingFragment: [],
		JSXElement: [
			"openingElement",
			"children",
			"closingElement"
		],
		JSXEmptyExpression: [],
		JSXExpressionContainer: ["expression"],
		JSXFragment: [
			"openingFragment",
			"children",
			"closingFragment"
		],
		JSXIdentifier: [],
		JSXMemberExpression: ["object", "property"],
		JSXNamespacedName: ["namespace", "name"],
		JSXOpeningElement: ["name", "attributes"],
		JSXOpeningFragment: [],
		JSXSpreadAttribute: ["argument"],
		JSXSpreadChild: ["expression"],
		JSXText: [],
		LabeledStatement: ["label", "body"],
		Literal: [],
		LogicalExpression: ["left", "right"],
		MemberExpression: ["object", "property"],
		MetaProperty: ["meta", "property"],
		MethodDefinition: ["key", "value"],
		NewExpression: ["callee", "arguments"],
		ObjectExpression: ["properties"],
		ObjectPattern: ["properties"],
		PrivateIdentifier: [],
		Program: ["body"],
		Property: ["key", "value"],
		PropertyDefinition: ["key", "value"],
		RestElement: ["argument"],
		ReturnStatement: ["argument"],
		SequenceExpression: ["expressions"],
		SpreadElement: ["argument"],
		StaticBlock: ["body"],
		Super: [],
		SwitchCase: ["test", "consequent"],
		SwitchStatement: ["discriminant", "cases"],
		TaggedTemplateExpression: ["tag", "quasi"],
		TemplateElement: [],
		TemplateLiteral: ["quasis", "expressions"],
		ThisExpression: [],
		ThrowStatement: ["argument"],
		TryStatement: [
			"block",
			"handler",
			"finalizer"
		],
		UnaryExpression: ["argument"],
		UpdateExpression: ["argument"],
		VariableDeclaration: ["declarations"],
		VariableDeclarator: ["id", "init"],
		WhileStatement: ["test", "body"],
		WithStatement: ["object", "body"],
		YieldExpression: ["argument"]
	};
	const NODE_TYPES = Object.keys(KEYS);
	for (const type of NODE_TYPES) Object.freeze(KEYS[type]);
	Object.freeze(KEYS);
	/**
	* @author Toru Nagashima <https://github.com/mysticatea>
	* See LICENSE file in root directory for full license.
	*/
	/**
	* @typedef {import('./visitor-keys.js').VisitorKeys} VisitorKeys
	*/
	const KEY_BLACKLIST = new Set([
		"parent",
		"leadingComments",
		"trailingComments"
	]);
	/**
	* Check whether a given key should be used or not.
	* @param {string} key The key to check.
	* @returns {boolean} `true` if the key should be used.
	*/
	function filterKey(key) {
		return !KEY_BLACKLIST.has(key) && key[0] !== "_";
	}
	/**
	* Get visitor keys of a given node.
	* @param {Object} node The AST node to get keys.
	* @returns {readonly string[]} Visitor keys of the node.
	*/
	function getKeys(node) {
		return Object.keys(node).filter(filterKey);
	}
	/**
	* Make the union set with `KEYS` and given keys.
	* @param {VisitorKeys} additionalKeys The additional keys.
	* @returns {VisitorKeys} The union set.
	*/
	function unionWith(additionalKeys) {
		const retv = Object.assign({}, KEYS);
		for (const type of Object.keys(additionalKeys)) if (Object.hasOwn(retv, type)) {
			const keys = new Set(additionalKeys[type]);
			for (const key of retv[type]) keys.add(key);
			retv[type] = Object.freeze(Array.from(keys));
		} else retv[type] = Object.freeze(Array.from(additionalKeys[type]));
		return Object.freeze(retv);
	}
	exports.KEYS = KEYS;
	exports.getKeys = getKeys;
	exports.unionWith = unionWith;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+visitor-keys@8.50.0/node_modules/@typescript-eslint/visitor-keys/dist/get-keys.js
var require_get_keys = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getKeys = void 0;
	const eslint_visitor_keys_1 = require_eslint_visitor_keys();
	exports.getKeys = eslint_visitor_keys_1.getKeys;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+visitor-keys@8.50.0/node_modules/@typescript-eslint/visitor-keys/dist/visitor-keys.js
var require_visitor_keys = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar = exports && exports.__importStar || (function() {
		var ownKeys = function(o) {
			ownKeys = Object.getOwnPropertyNames || function(o$1) {
				var ar = [];
				for (var k in o$1) if (Object.prototype.hasOwnProperty.call(o$1, k)) ar[ar.length] = k;
				return ar;
			};
			return ownKeys(o);
		};
		return function(mod) {
			if (mod && mod.__esModule) return mod;
			var result = {};
			if (mod != null) {
				for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
			}
			__setModuleDefault(result, mod);
			return result;
		};
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.visitorKeys = void 0;
	const eslintVisitorKeys = __importStar(require_eslint_visitor_keys());
	const SharedVisitorKeys = (() => {
		const FunctionType = [
			"typeParameters",
			"params",
			"returnType"
		];
		const AnonymousFunction = [...FunctionType, "body"];
		const AbstractPropertyDefinition = [
			"decorators",
			"key",
			"typeAnnotation"
		];
		return {
			AbstractPropertyDefinition: [
				"decorators",
				"key",
				"typeAnnotation"
			],
			AnonymousFunction,
			AsExpression: ["expression", "typeAnnotation"],
			ClassDeclaration: [
				"decorators",
				"id",
				"typeParameters",
				"superClass",
				"superTypeArguments",
				"implements",
				"body"
			],
			Function: ["id", ...AnonymousFunction],
			FunctionType,
			PropertyDefinition: [...AbstractPropertyDefinition, "value"]
		};
	})();
	const additionalKeys = {
		AccessorProperty: SharedVisitorKeys.PropertyDefinition,
		ArrayPattern: [
			"decorators",
			"elements",
			"typeAnnotation"
		],
		ArrowFunctionExpression: SharedVisitorKeys.AnonymousFunction,
		AssignmentPattern: [
			"decorators",
			"left",
			"right",
			"typeAnnotation"
		],
		CallExpression: [
			"callee",
			"typeArguments",
			"arguments"
		],
		ClassDeclaration: SharedVisitorKeys.ClassDeclaration,
		ClassExpression: SharedVisitorKeys.ClassDeclaration,
		Decorator: ["expression"],
		ExportAllDeclaration: [
			"exported",
			"source",
			"attributes"
		],
		ExportNamedDeclaration: [
			"declaration",
			"specifiers",
			"source",
			"attributes"
		],
		FunctionDeclaration: SharedVisitorKeys.Function,
		FunctionExpression: SharedVisitorKeys.Function,
		Identifier: ["decorators", "typeAnnotation"],
		ImportAttribute: ["key", "value"],
		ImportDeclaration: [
			"specifiers",
			"source",
			"attributes"
		],
		ImportExpression: ["source", "options"],
		JSXClosingFragment: [],
		JSXOpeningElement: [
			"name",
			"typeArguments",
			"attributes"
		],
		JSXOpeningFragment: [],
		JSXSpreadChild: ["expression"],
		MethodDefinition: [
			"decorators",
			"key",
			"value"
		],
		NewExpression: [
			"callee",
			"typeArguments",
			"arguments"
		],
		ObjectPattern: [
			"decorators",
			"properties",
			"typeAnnotation"
		],
		PropertyDefinition: SharedVisitorKeys.PropertyDefinition,
		RestElement: [
			"decorators",
			"argument",
			"typeAnnotation"
		],
		StaticBlock: ["body"],
		TaggedTemplateExpression: [
			"tag",
			"typeArguments",
			"quasi"
		],
		TSAbstractAccessorProperty: SharedVisitorKeys.AbstractPropertyDefinition,
		TSAbstractKeyword: [],
		TSAbstractMethodDefinition: ["key", "value"],
		TSAbstractPropertyDefinition: SharedVisitorKeys.AbstractPropertyDefinition,
		TSAnyKeyword: [],
		TSArrayType: ["elementType"],
		TSAsExpression: SharedVisitorKeys.AsExpression,
		TSAsyncKeyword: [],
		TSBigIntKeyword: [],
		TSBooleanKeyword: [],
		TSCallSignatureDeclaration: SharedVisitorKeys.FunctionType,
		TSClassImplements: ["expression", "typeArguments"],
		TSConditionalType: [
			"checkType",
			"extendsType",
			"trueType",
			"falseType"
		],
		TSConstructorType: SharedVisitorKeys.FunctionType,
		TSConstructSignatureDeclaration: SharedVisitorKeys.FunctionType,
		TSDeclareFunction: SharedVisitorKeys.Function,
		TSDeclareKeyword: [],
		TSEmptyBodyFunctionExpression: ["id", ...SharedVisitorKeys.FunctionType],
		TSEnumBody: ["members"],
		TSEnumDeclaration: ["id", "body"],
		TSEnumMember: ["id", "initializer"],
		TSExportAssignment: ["expression"],
		TSExportKeyword: [],
		TSExternalModuleReference: ["expression"],
		TSFunctionType: SharedVisitorKeys.FunctionType,
		TSImportEqualsDeclaration: ["id", "moduleReference"],
		TSImportType: [
			"source",
			"options",
			"qualifier",
			"typeArguments"
		],
		TSIndexedAccessType: ["objectType", "indexType"],
		TSIndexSignature: ["parameters", "typeAnnotation"],
		TSInferType: ["typeParameter"],
		TSInstantiationExpression: ["expression", "typeArguments"],
		TSInterfaceBody: ["body"],
		TSInterfaceDeclaration: [
			"id",
			"typeParameters",
			"extends",
			"body"
		],
		TSInterfaceHeritage: ["expression", "typeArguments"],
		TSIntersectionType: ["types"],
		TSIntrinsicKeyword: [],
		TSLiteralType: ["literal"],
		TSMappedType: [
			"key",
			"constraint",
			"nameType",
			"typeAnnotation"
		],
		TSMethodSignature: [
			"key",
			"typeParameters",
			"params",
			"returnType"
		],
		TSModuleBlock: ["body"],
		TSModuleDeclaration: ["id", "body"],
		TSNamedTupleMember: ["label", "elementType"],
		TSNamespaceExportDeclaration: ["id"],
		TSNeverKeyword: [],
		TSNonNullExpression: ["expression"],
		TSNullKeyword: [],
		TSNumberKeyword: [],
		TSObjectKeyword: [],
		TSOptionalType: ["typeAnnotation"],
		TSParameterProperty: ["decorators", "parameter"],
		TSPrivateKeyword: [],
		TSPropertySignature: ["key", "typeAnnotation"],
		TSProtectedKeyword: [],
		TSPublicKeyword: [],
		TSQualifiedName: ["left", "right"],
		TSReadonlyKeyword: [],
		TSRestType: ["typeAnnotation"],
		TSSatisfiesExpression: SharedVisitorKeys.AsExpression,
		TSStaticKeyword: [],
		TSStringKeyword: [],
		TSSymbolKeyword: [],
		TSTemplateLiteralType: ["quasis", "types"],
		TSThisType: [],
		TSTupleType: ["elementTypes"],
		TSTypeAliasDeclaration: [
			"id",
			"typeParameters",
			"typeAnnotation"
		],
		TSTypeAnnotation: ["typeAnnotation"],
		TSTypeAssertion: ["typeAnnotation", "expression"],
		TSTypeLiteral: ["members"],
		TSTypeOperator: ["typeAnnotation"],
		TSTypeParameter: [
			"name",
			"constraint",
			"default"
		],
		TSTypeParameterDeclaration: ["params"],
		TSTypeParameterInstantiation: ["params"],
		TSTypePredicate: ["parameterName", "typeAnnotation"],
		TSTypeQuery: ["exprName", "typeArguments"],
		TSTypeReference: ["typeName", "typeArguments"],
		TSUndefinedKeyword: [],
		TSUnionType: ["types"],
		TSUnknownKeyword: [],
		TSVoidKeyword: []
	};
	exports.visitorKeys = eslintVisitorKeys.unionWith(additionalKeys);
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+visitor-keys@8.50.0/node_modules/@typescript-eslint/visitor-keys/dist/index.js
var require_dist$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.visitorKeys = exports.getKeys = void 0;
	var get_keys_1 = require_get_keys();
	Object.defineProperty(exports, "getKeys", {
		enumerable: true,
		get: function() {
			return get_keys_1.getKeys;
		}
	});
	var visitor_keys_1 = require_visitor_keys();
	Object.defineProperty(exports, "visitorKeys", {
		enumerable: true,
		get: function() {
			return visitor_keys_1.visitorKeys;
		}
	});
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/assert.js
var require_assert = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.assert = assert;
	function assert(value, message) {
		if (value == null) throw new Error(message);
	}
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/ID.js
var require_ID = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createIdGenerator = createIdGenerator;
	exports.resetIds = resetIds;
	const ID_CACHE = /* @__PURE__ */ new Map();
	let NEXT_KEY = 0;
	function createIdGenerator() {
		const key = NEXT_KEY += 1;
		ID_CACHE.set(key, 0);
		return () => {
			const next = (ID_CACHE.get(key) ?? 0) + 1;
			ID_CACHE.set(key, next);
			return next;
		};
	}
	function resetIds() {
		ID_CACHE.clear();
	}
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/definition/DefinitionBase.js
var require_DefinitionBase = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DefinitionBase = void 0;
	const generator = (0, require_ID().createIdGenerator)();
	var DefinitionBase = class {
		/**
		* A unique ID for this instance - primarily used to help debugging and testing
		*/
		$id = generator();
		type;
		/**
		* The `Identifier` node of this definition
		* @public
		*/
		name;
		/**
		* The enclosing node of the name.
		* @public
		*/
		node;
		/**
		* the enclosing statement node of the identifier.
		* @public
		*/
		parent;
		constructor(type, name$1, node, parent) {
			this.type = type;
			this.name = name$1;
			this.node = node;
			this.parent = parent;
		}
	};
	exports.DefinitionBase = DefinitionBase;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/definition/DefinitionType.js
var require_DefinitionType = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DefinitionType = void 0;
	var DefinitionType;
	(function(DefinitionType) {
		DefinitionType["CatchClause"] = "CatchClause";
		DefinitionType["ClassName"] = "ClassName";
		DefinitionType["FunctionName"] = "FunctionName";
		DefinitionType["ImplicitGlobalVariable"] = "ImplicitGlobalVariable";
		DefinitionType["ImportBinding"] = "ImportBinding";
		DefinitionType["Parameter"] = "Parameter";
		DefinitionType["TSEnumName"] = "TSEnumName";
		DefinitionType["TSEnumMember"] = "TSEnumMemberName";
		DefinitionType["TSModuleName"] = "TSModuleName";
		DefinitionType["Type"] = "Type";
		DefinitionType["Variable"] = "Variable";
	})(DefinitionType || (exports.DefinitionType = DefinitionType = {}));
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/definition/CatchClauseDefinition.js
var require_CatchClauseDefinition = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.CatchClauseDefinition = void 0;
	const DefinitionBase_1 = require_DefinitionBase();
	const DefinitionType_1 = require_DefinitionType();
	var CatchClauseDefinition = class extends DefinitionBase_1.DefinitionBase {
		isTypeDefinition = false;
		isVariableDefinition = true;
		constructor(name$1, node) {
			super(DefinitionType_1.DefinitionType.CatchClause, name$1, node, null);
		}
	};
	exports.CatchClauseDefinition = CatchClauseDefinition;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/definition/ClassNameDefinition.js
var require_ClassNameDefinition = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ClassNameDefinition = void 0;
	const DefinitionBase_1 = require_DefinitionBase();
	const DefinitionType_1 = require_DefinitionType();
	var ClassNameDefinition = class extends DefinitionBase_1.DefinitionBase {
		isTypeDefinition = true;
		isVariableDefinition = true;
		constructor(name$1, node) {
			super(DefinitionType_1.DefinitionType.ClassName, name$1, node, null);
		}
	};
	exports.ClassNameDefinition = ClassNameDefinition;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/definition/Definition.js
var require_Definition = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/definition/FunctionNameDefinition.js
var require_FunctionNameDefinition = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.FunctionNameDefinition = void 0;
	const DefinitionBase_1 = require_DefinitionBase();
	const DefinitionType_1 = require_DefinitionType();
	var FunctionNameDefinition = class extends DefinitionBase_1.DefinitionBase {
		isTypeDefinition = false;
		isVariableDefinition = true;
		constructor(name$1, node) {
			super(DefinitionType_1.DefinitionType.FunctionName, name$1, node, null);
		}
	};
	exports.FunctionNameDefinition = FunctionNameDefinition;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/definition/ImplicitGlobalVariableDefinition.js
var require_ImplicitGlobalVariableDefinition = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ImplicitGlobalVariableDefinition = void 0;
	const DefinitionBase_1 = require_DefinitionBase();
	const DefinitionType_1 = require_DefinitionType();
	var ImplicitGlobalVariableDefinition = class extends DefinitionBase_1.DefinitionBase {
		isTypeDefinition = false;
		isVariableDefinition = true;
		constructor(name$1, node) {
			super(DefinitionType_1.DefinitionType.ImplicitGlobalVariable, name$1, node, null);
		}
	};
	exports.ImplicitGlobalVariableDefinition = ImplicitGlobalVariableDefinition;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/definition/ImportBindingDefinition.js
var require_ImportBindingDefinition = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ImportBindingDefinition = void 0;
	const DefinitionBase_1 = require_DefinitionBase();
	const DefinitionType_1 = require_DefinitionType();
	var ImportBindingDefinition = class extends DefinitionBase_1.DefinitionBase {
		isTypeDefinition = true;
		isVariableDefinition = true;
		constructor(name$1, node, decl) {
			super(DefinitionType_1.DefinitionType.ImportBinding, name$1, node, decl);
		}
	};
	exports.ImportBindingDefinition = ImportBindingDefinition;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/definition/ParameterDefinition.js
var require_ParameterDefinition = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ParameterDefinition = void 0;
	const DefinitionBase_1 = require_DefinitionBase();
	const DefinitionType_1 = require_DefinitionType();
	var ParameterDefinition = class extends DefinitionBase_1.DefinitionBase {
		/**
		* Whether the parameter definition is a part of a rest parameter.
		*/
		isTypeDefinition = false;
		isVariableDefinition = true;
		rest;
		constructor(name$1, node, rest) {
			super(DefinitionType_1.DefinitionType.Parameter, name$1, node, null);
			this.rest = rest;
		}
	};
	exports.ParameterDefinition = ParameterDefinition;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/definition/TSEnumMemberDefinition.js
var require_TSEnumMemberDefinition = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.TSEnumMemberDefinition = void 0;
	const DefinitionBase_1 = require_DefinitionBase();
	const DefinitionType_1 = require_DefinitionType();
	var TSEnumMemberDefinition = class extends DefinitionBase_1.DefinitionBase {
		isTypeDefinition = true;
		isVariableDefinition = true;
		constructor(name$1, node) {
			super(DefinitionType_1.DefinitionType.TSEnumMember, name$1, node, null);
		}
	};
	exports.TSEnumMemberDefinition = TSEnumMemberDefinition;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/definition/TSEnumNameDefinition.js
var require_TSEnumNameDefinition = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.TSEnumNameDefinition = void 0;
	const DefinitionBase_1 = require_DefinitionBase();
	const DefinitionType_1 = require_DefinitionType();
	var TSEnumNameDefinition = class extends DefinitionBase_1.DefinitionBase {
		isTypeDefinition = true;
		isVariableDefinition = true;
		constructor(name$1, node) {
			super(DefinitionType_1.DefinitionType.TSEnumName, name$1, node, null);
		}
	};
	exports.TSEnumNameDefinition = TSEnumNameDefinition;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/definition/TSModuleNameDefinition.js
var require_TSModuleNameDefinition = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.TSModuleNameDefinition = void 0;
	const DefinitionBase_1 = require_DefinitionBase();
	const DefinitionType_1 = require_DefinitionType();
	var TSModuleNameDefinition = class extends DefinitionBase_1.DefinitionBase {
		isTypeDefinition = true;
		isVariableDefinition = true;
		constructor(name$1, node) {
			super(DefinitionType_1.DefinitionType.TSModuleName, name$1, node, null);
		}
	};
	exports.TSModuleNameDefinition = TSModuleNameDefinition;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/definition/TypeDefinition.js
var require_TypeDefinition = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.TypeDefinition = void 0;
	const DefinitionBase_1 = require_DefinitionBase();
	const DefinitionType_1 = require_DefinitionType();
	var TypeDefinition = class extends DefinitionBase_1.DefinitionBase {
		isTypeDefinition = true;
		isVariableDefinition = false;
		constructor(name$1, node) {
			super(DefinitionType_1.DefinitionType.Type, name$1, node, null);
		}
	};
	exports.TypeDefinition = TypeDefinition;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/definition/VariableDefinition.js
var require_VariableDefinition = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.VariableDefinition = void 0;
	const DefinitionBase_1 = require_DefinitionBase();
	const DefinitionType_1 = require_DefinitionType();
	var VariableDefinition = class extends DefinitionBase_1.DefinitionBase {
		isTypeDefinition = false;
		isVariableDefinition = true;
		constructor(name$1, node, decl) {
			super(DefinitionType_1.DefinitionType.Variable, name$1, node, decl);
		}
	};
	exports.VariableDefinition = VariableDefinition;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/definition/index.js
var require_definition = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$1) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$1, p)) __createBinding(exports$1, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_CatchClauseDefinition(), exports);
	__exportStar(require_ClassNameDefinition(), exports);
	__exportStar(require_Definition(), exports);
	__exportStar(require_DefinitionType(), exports);
	__exportStar(require_FunctionNameDefinition(), exports);
	__exportStar(require_ImplicitGlobalVariableDefinition(), exports);
	__exportStar(require_ImportBindingDefinition(), exports);
	__exportStar(require_ParameterDefinition(), exports);
	__exportStar(require_TSEnumMemberDefinition(), exports);
	__exportStar(require_TSEnumNameDefinition(), exports);
	__exportStar(require_TSModuleNameDefinition(), exports);
	__exportStar(require_TypeDefinition(), exports);
	__exportStar(require_VariableDefinition(), exports);
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/base-config.js
var require_base_config = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.TYPE_VALUE = exports.VALUE = exports.TYPE = void 0;
	exports.TYPE = Object.freeze({
		eslintImplicitGlobalSetting: "readonly",
		isTypeVariable: true,
		isValueVariable: false
	});
	exports.VALUE = Object.freeze({
		eslintImplicitGlobalSetting: "readonly",
		isTypeVariable: false,
		isValueVariable: true
	});
	exports.TYPE_VALUE = Object.freeze({
		eslintImplicitGlobalSetting: "readonly",
		isTypeVariable: true,
		isValueVariable: true
	});
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/decorators.js
var require_decorators = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.decorators = void 0;
	const base_config_1 = require_base_config();
	exports.decorators = {
		libs: [],
		variables: [
			["ClassMemberDecoratorContext", base_config_1.TYPE],
			["DecoratorContext", base_config_1.TYPE],
			["DecoratorMetadataObject", base_config_1.TYPE],
			["DecoratorMetadata", base_config_1.TYPE],
			["ClassDecoratorContext", base_config_1.TYPE],
			["ClassMethodDecoratorContext", base_config_1.TYPE],
			["ClassGetterDecoratorContext", base_config_1.TYPE],
			["ClassSetterDecoratorContext", base_config_1.TYPE],
			["ClassAccessorDecoratorContext", base_config_1.TYPE],
			["ClassAccessorDecoratorTarget", base_config_1.TYPE],
			["ClassAccessorDecoratorResult", base_config_1.TYPE],
			["ClassFieldDecoratorContext", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/decorators.legacy.js
var require_decorators_legacy = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.decorators_legacy = void 0;
	const base_config_1 = require_base_config();
	exports.decorators_legacy = {
		libs: [],
		variables: [
			["ClassDecorator", base_config_1.TYPE],
			["PropertyDecorator", base_config_1.TYPE],
			["MethodDecorator", base_config_1.TYPE],
			["ParameterDecorator", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/dom.js
var require_dom = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.dom = void 0;
	const base_config_1 = require_base_config();
	exports.dom = {
		libs: [],
		variables: [
			["AddEventListenerOptions", base_config_1.TYPE],
			["AddressErrors", base_config_1.TYPE],
			["AesCbcParams", base_config_1.TYPE],
			["AesCtrParams", base_config_1.TYPE],
			["AesDerivedKeyParams", base_config_1.TYPE],
			["AesGcmParams", base_config_1.TYPE],
			["AesKeyAlgorithm", base_config_1.TYPE],
			["AesKeyGenParams", base_config_1.TYPE],
			["Algorithm", base_config_1.TYPE],
			["AnalyserOptions", base_config_1.TYPE],
			["AnimationEventInit", base_config_1.TYPE],
			["AnimationPlaybackEventInit", base_config_1.TYPE],
			["AssignedNodesOptions", base_config_1.TYPE],
			["AudioBufferOptions", base_config_1.TYPE],
			["AudioBufferSourceOptions", base_config_1.TYPE],
			["AudioConfiguration", base_config_1.TYPE],
			["AudioContextOptions", base_config_1.TYPE],
			["AudioDataCopyToOptions", base_config_1.TYPE],
			["AudioDataInit", base_config_1.TYPE],
			["AudioDecoderConfig", base_config_1.TYPE],
			["AudioDecoderInit", base_config_1.TYPE],
			["AudioDecoderSupport", base_config_1.TYPE],
			["AudioEncoderConfig", base_config_1.TYPE],
			["AudioEncoderInit", base_config_1.TYPE],
			["AudioEncoderSupport", base_config_1.TYPE],
			["AudioNodeOptions", base_config_1.TYPE],
			["AudioProcessingEventInit", base_config_1.TYPE],
			["AudioTimestamp", base_config_1.TYPE],
			["AudioWorkletNodeOptions", base_config_1.TYPE],
			["AuthenticationExtensionsClientInputs", base_config_1.TYPE],
			["AuthenticationExtensionsClientInputsJSON", base_config_1.TYPE],
			["AuthenticationExtensionsClientOutputs", base_config_1.TYPE],
			["AuthenticationExtensionsLargeBlobInputs", base_config_1.TYPE],
			["AuthenticationExtensionsLargeBlobInputsJSON", base_config_1.TYPE],
			["AuthenticationExtensionsLargeBlobOutputs", base_config_1.TYPE],
			["AuthenticationExtensionsPRFInputs", base_config_1.TYPE],
			["AuthenticationExtensionsPRFInputsJSON", base_config_1.TYPE],
			["AuthenticationExtensionsPRFOutputs", base_config_1.TYPE],
			["AuthenticationExtensionsPRFValues", base_config_1.TYPE],
			["AuthenticationExtensionsPRFValuesJSON", base_config_1.TYPE],
			["AuthenticatorSelectionCriteria", base_config_1.TYPE],
			["AvcEncoderConfig", base_config_1.TYPE],
			["BiquadFilterOptions", base_config_1.TYPE],
			["BlobEventInit", base_config_1.TYPE],
			["BlobPropertyBag", base_config_1.TYPE],
			["CSSMatrixComponentOptions", base_config_1.TYPE],
			["CSSNumericType", base_config_1.TYPE],
			["CSSStyleSheetInit", base_config_1.TYPE],
			["CacheQueryOptions", base_config_1.TYPE],
			["CanvasRenderingContext2DSettings", base_config_1.TYPE],
			["CaretPositionFromPointOptions", base_config_1.TYPE],
			["ChannelMergerOptions", base_config_1.TYPE],
			["ChannelSplitterOptions", base_config_1.TYPE],
			["CheckVisibilityOptions", base_config_1.TYPE],
			["ClientQueryOptions", base_config_1.TYPE],
			["ClipboardEventInit", base_config_1.TYPE],
			["ClipboardItemOptions", base_config_1.TYPE],
			["CloseEventInit", base_config_1.TYPE],
			["CompositionEventInit", base_config_1.TYPE],
			["ComputedEffectTiming", base_config_1.TYPE],
			["ComputedKeyframe", base_config_1.TYPE],
			["ConstantSourceOptions", base_config_1.TYPE],
			["ConstrainBooleanParameters", base_config_1.TYPE],
			["ConstrainDOMStringParameters", base_config_1.TYPE],
			["ConstrainDoubleRange", base_config_1.TYPE],
			["ConstrainULongRange", base_config_1.TYPE],
			["ContentVisibilityAutoStateChangeEventInit", base_config_1.TYPE],
			["ConvolverOptions", base_config_1.TYPE],
			["CookieChangeEventInit", base_config_1.TYPE],
			["CookieInit", base_config_1.TYPE],
			["CookieListItem", base_config_1.TYPE],
			["CookieStoreDeleteOptions", base_config_1.TYPE],
			["CookieStoreGetOptions", base_config_1.TYPE],
			["CredentialCreationOptions", base_config_1.TYPE],
			["CredentialPropertiesOutput", base_config_1.TYPE],
			["CredentialRequestOptions", base_config_1.TYPE],
			["CryptoKeyPair", base_config_1.TYPE],
			["CustomEventInit", base_config_1.TYPE],
			["DOMMatrix2DInit", base_config_1.TYPE],
			["DOMMatrixInit", base_config_1.TYPE],
			["DOMPointInit", base_config_1.TYPE],
			["DOMQuadInit", base_config_1.TYPE],
			["DOMRectInit", base_config_1.TYPE],
			["DelayOptions", base_config_1.TYPE],
			["DeviceMotionEventAccelerationInit", base_config_1.TYPE],
			["DeviceMotionEventInit", base_config_1.TYPE],
			["DeviceMotionEventRotationRateInit", base_config_1.TYPE],
			["DeviceOrientationEventInit", base_config_1.TYPE],
			["DisplayMediaStreamOptions", base_config_1.TYPE],
			["DocumentTimelineOptions", base_config_1.TYPE],
			["DoubleRange", base_config_1.TYPE],
			["DragEventInit", base_config_1.TYPE],
			["DynamicsCompressorOptions", base_config_1.TYPE],
			["EcKeyAlgorithm", base_config_1.TYPE],
			["EcKeyGenParams", base_config_1.TYPE],
			["EcKeyImportParams", base_config_1.TYPE],
			["EcdhKeyDeriveParams", base_config_1.TYPE],
			["EcdsaParams", base_config_1.TYPE],
			["EffectTiming", base_config_1.TYPE],
			["ElementCreationOptions", base_config_1.TYPE],
			["ElementDefinitionOptions", base_config_1.TYPE],
			["EncodedAudioChunkInit", base_config_1.TYPE],
			["EncodedAudioChunkMetadata", base_config_1.TYPE],
			["EncodedVideoChunkInit", base_config_1.TYPE],
			["EncodedVideoChunkMetadata", base_config_1.TYPE],
			["ErrorEventInit", base_config_1.TYPE],
			["EventInit", base_config_1.TYPE],
			["EventListenerOptions", base_config_1.TYPE],
			["EventModifierInit", base_config_1.TYPE],
			["EventSourceInit", base_config_1.TYPE],
			["FilePropertyBag", base_config_1.TYPE],
			["FileSystemCreateWritableOptions", base_config_1.TYPE],
			["FileSystemFlags", base_config_1.TYPE],
			["FileSystemGetDirectoryOptions", base_config_1.TYPE],
			["FileSystemGetFileOptions", base_config_1.TYPE],
			["FileSystemRemoveOptions", base_config_1.TYPE],
			["FocusEventInit", base_config_1.TYPE],
			["FocusOptions", base_config_1.TYPE],
			["FontFaceDescriptors", base_config_1.TYPE],
			["FontFaceSetLoadEventInit", base_config_1.TYPE],
			["FormDataEventInit", base_config_1.TYPE],
			["FullscreenOptions", base_config_1.TYPE],
			["GainOptions", base_config_1.TYPE],
			["GamepadEffectParameters", base_config_1.TYPE],
			["GamepadEventInit", base_config_1.TYPE],
			["GetAnimationsOptions", base_config_1.TYPE],
			["GetComposedRangesOptions", base_config_1.TYPE],
			["GetHTMLOptions", base_config_1.TYPE],
			["GetNotificationOptions", base_config_1.TYPE],
			["GetRootNodeOptions", base_config_1.TYPE],
			["HashChangeEventInit", base_config_1.TYPE],
			["HkdfParams", base_config_1.TYPE],
			["HmacImportParams", base_config_1.TYPE],
			["HmacKeyAlgorithm", base_config_1.TYPE],
			["HmacKeyGenParams", base_config_1.TYPE],
			["IDBDatabaseInfo", base_config_1.TYPE],
			["IDBIndexParameters", base_config_1.TYPE],
			["IDBObjectStoreParameters", base_config_1.TYPE],
			["IDBTransactionOptions", base_config_1.TYPE],
			["IDBVersionChangeEventInit", base_config_1.TYPE],
			["IIRFilterOptions", base_config_1.TYPE],
			["IdleRequestOptions", base_config_1.TYPE],
			["ImageBitmapOptions", base_config_1.TYPE],
			["ImageBitmapRenderingContextSettings", base_config_1.TYPE],
			["ImageDataSettings", base_config_1.TYPE],
			["ImageDecodeOptions", base_config_1.TYPE],
			["ImageDecodeResult", base_config_1.TYPE],
			["ImageDecoderInit", base_config_1.TYPE],
			["ImageEncodeOptions", base_config_1.TYPE],
			["ImportNodeOptions", base_config_1.TYPE],
			["InputEventInit", base_config_1.TYPE],
			["IntersectionObserverInit", base_config_1.TYPE],
			["JsonWebKey", base_config_1.TYPE],
			["KeyAlgorithm", base_config_1.TYPE],
			["KeySystemTrackConfiguration", base_config_1.TYPE],
			["KeyboardEventInit", base_config_1.TYPE],
			["Keyframe", base_config_1.TYPE],
			["KeyframeAnimationOptions", base_config_1.TYPE],
			["KeyframeEffectOptions", base_config_1.TYPE],
			["LockInfo", base_config_1.TYPE],
			["LockManagerSnapshot", base_config_1.TYPE],
			["LockOptions", base_config_1.TYPE],
			["MIDIConnectionEventInit", base_config_1.TYPE],
			["MIDIMessageEventInit", base_config_1.TYPE],
			["MIDIOptions", base_config_1.TYPE],
			["MediaCapabilitiesDecodingInfo", base_config_1.TYPE],
			["MediaCapabilitiesEncodingInfo", base_config_1.TYPE],
			["MediaCapabilitiesInfo", base_config_1.TYPE],
			["MediaCapabilitiesKeySystemConfiguration", base_config_1.TYPE],
			["MediaConfiguration", base_config_1.TYPE],
			["MediaDecodingConfiguration", base_config_1.TYPE],
			["MediaElementAudioSourceOptions", base_config_1.TYPE],
			["MediaEncodingConfiguration", base_config_1.TYPE],
			["MediaEncryptedEventInit", base_config_1.TYPE],
			["MediaImage", base_config_1.TYPE],
			["MediaKeyMessageEventInit", base_config_1.TYPE],
			["MediaKeySystemConfiguration", base_config_1.TYPE],
			["MediaKeySystemMediaCapability", base_config_1.TYPE],
			["MediaKeysPolicy", base_config_1.TYPE],
			["MediaMetadataInit", base_config_1.TYPE],
			["MediaPositionState", base_config_1.TYPE],
			["MediaQueryListEventInit", base_config_1.TYPE],
			["MediaRecorderOptions", base_config_1.TYPE],
			["MediaSessionActionDetails", base_config_1.TYPE],
			["MediaSettingsRange", base_config_1.TYPE],
			["MediaStreamAudioSourceOptions", base_config_1.TYPE],
			["MediaStreamConstraints", base_config_1.TYPE],
			["MediaStreamTrackEventInit", base_config_1.TYPE],
			["MediaTrackCapabilities", base_config_1.TYPE],
			["MediaTrackConstraintSet", base_config_1.TYPE],
			["MediaTrackConstraints", base_config_1.TYPE],
			["MediaTrackSettings", base_config_1.TYPE],
			["MediaTrackSupportedConstraints", base_config_1.TYPE],
			["MessageEventInit", base_config_1.TYPE],
			["MouseEventInit", base_config_1.TYPE],
			["MultiCacheQueryOptions", base_config_1.TYPE],
			["MutationObserverInit", base_config_1.TYPE],
			["NavigationPreloadState", base_config_1.TYPE],
			["NotificationOptions", base_config_1.TYPE],
			["OfflineAudioCompletionEventInit", base_config_1.TYPE],
			["OfflineAudioContextOptions", base_config_1.TYPE],
			["OptionalEffectTiming", base_config_1.TYPE],
			["OpusEncoderConfig", base_config_1.TYPE],
			["OscillatorOptions", base_config_1.TYPE],
			["PageRevealEventInit", base_config_1.TYPE],
			["PageSwapEventInit", base_config_1.TYPE],
			["PageTransitionEventInit", base_config_1.TYPE],
			["PannerOptions", base_config_1.TYPE],
			["PayerErrors", base_config_1.TYPE],
			["PaymentCurrencyAmount", base_config_1.TYPE],
			["PaymentDetailsBase", base_config_1.TYPE],
			["PaymentDetailsInit", base_config_1.TYPE],
			["PaymentDetailsModifier", base_config_1.TYPE],
			["PaymentDetailsUpdate", base_config_1.TYPE],
			["PaymentItem", base_config_1.TYPE],
			["PaymentMethodChangeEventInit", base_config_1.TYPE],
			["PaymentMethodData", base_config_1.TYPE],
			["PaymentOptions", base_config_1.TYPE],
			["PaymentRequestUpdateEventInit", base_config_1.TYPE],
			["PaymentShippingOption", base_config_1.TYPE],
			["PaymentValidationErrors", base_config_1.TYPE],
			["Pbkdf2Params", base_config_1.TYPE],
			["PerformanceMarkOptions", base_config_1.TYPE],
			["PerformanceMeasureOptions", base_config_1.TYPE],
			["PerformanceObserverInit", base_config_1.TYPE],
			["PeriodicWaveConstraints", base_config_1.TYPE],
			["PeriodicWaveOptions", base_config_1.TYPE],
			["PermissionDescriptor", base_config_1.TYPE],
			["PhotoCapabilities", base_config_1.TYPE],
			["PhotoSettings", base_config_1.TYPE],
			["PictureInPictureEventInit", base_config_1.TYPE],
			["PlaneLayout", base_config_1.TYPE],
			["PointerEventInit", base_config_1.TYPE],
			["PointerLockOptions", base_config_1.TYPE],
			["PopStateEventInit", base_config_1.TYPE],
			["PositionOptions", base_config_1.TYPE],
			["ProgressEventInit", base_config_1.TYPE],
			["PromiseRejectionEventInit", base_config_1.TYPE],
			["PropertyDefinition", base_config_1.TYPE],
			["PropertyIndexedKeyframes", base_config_1.TYPE],
			["PublicKeyCredentialCreationOptions", base_config_1.TYPE],
			["PublicKeyCredentialCreationOptionsJSON", base_config_1.TYPE],
			["PublicKeyCredentialDescriptor", base_config_1.TYPE],
			["PublicKeyCredentialDescriptorJSON", base_config_1.TYPE],
			["PublicKeyCredentialEntity", base_config_1.TYPE],
			["PublicKeyCredentialParameters", base_config_1.TYPE],
			["PublicKeyCredentialRequestOptions", base_config_1.TYPE],
			["PublicKeyCredentialRequestOptionsJSON", base_config_1.TYPE],
			["PublicKeyCredentialRpEntity", base_config_1.TYPE],
			["PublicKeyCredentialUserEntity", base_config_1.TYPE],
			["PublicKeyCredentialUserEntityJSON", base_config_1.TYPE],
			["PushSubscriptionJSON", base_config_1.TYPE],
			["PushSubscriptionOptionsInit", base_config_1.TYPE],
			["QueuingStrategy", base_config_1.TYPE],
			["QueuingStrategyInit", base_config_1.TYPE],
			["RTCAnswerOptions", base_config_1.TYPE],
			["RTCCertificateExpiration", base_config_1.TYPE],
			["RTCConfiguration", base_config_1.TYPE],
			["RTCDTMFToneChangeEventInit", base_config_1.TYPE],
			["RTCDataChannelEventInit", base_config_1.TYPE],
			["RTCDataChannelInit", base_config_1.TYPE],
			["RTCDtlsFingerprint", base_config_1.TYPE],
			["RTCEncodedAudioFrameMetadata", base_config_1.TYPE],
			["RTCEncodedFrameMetadata", base_config_1.TYPE],
			["RTCEncodedVideoFrameMetadata", base_config_1.TYPE],
			["RTCErrorEventInit", base_config_1.TYPE],
			["RTCErrorInit", base_config_1.TYPE],
			["RTCIceCandidateInit", base_config_1.TYPE],
			["RTCIceCandidatePairStats", base_config_1.TYPE],
			["RTCIceServer", base_config_1.TYPE],
			["RTCInboundRtpStreamStats", base_config_1.TYPE],
			["RTCLocalIceCandidateInit", base_config_1.TYPE],
			["RTCLocalSessionDescriptionInit", base_config_1.TYPE],
			["RTCOfferAnswerOptions", base_config_1.TYPE],
			["RTCOfferOptions", base_config_1.TYPE],
			["RTCOutboundRtpStreamStats", base_config_1.TYPE],
			["RTCPeerConnectionIceErrorEventInit", base_config_1.TYPE],
			["RTCPeerConnectionIceEventInit", base_config_1.TYPE],
			["RTCReceivedRtpStreamStats", base_config_1.TYPE],
			["RTCRtcpParameters", base_config_1.TYPE],
			["RTCRtpCapabilities", base_config_1.TYPE],
			["RTCRtpCodec", base_config_1.TYPE],
			["RTCRtpCodecParameters", base_config_1.TYPE],
			["RTCRtpCodingParameters", base_config_1.TYPE],
			["RTCRtpContributingSource", base_config_1.TYPE],
			["RTCRtpEncodingParameters", base_config_1.TYPE],
			["RTCRtpHeaderExtensionCapability", base_config_1.TYPE],
			["RTCRtpHeaderExtensionParameters", base_config_1.TYPE],
			["RTCRtpParameters", base_config_1.TYPE],
			["RTCRtpReceiveParameters", base_config_1.TYPE],
			["RTCRtpSendParameters", base_config_1.TYPE],
			["RTCRtpStreamStats", base_config_1.TYPE],
			["RTCRtpSynchronizationSource", base_config_1.TYPE],
			["RTCRtpTransceiverInit", base_config_1.TYPE],
			["RTCSentRtpStreamStats", base_config_1.TYPE],
			["RTCSessionDescriptionInit", base_config_1.TYPE],
			["RTCSetParameterOptions", base_config_1.TYPE],
			["RTCStats", base_config_1.TYPE],
			["RTCTrackEventInit", base_config_1.TYPE],
			["RTCTransportStats", base_config_1.TYPE],
			["ReadableStreamGetReaderOptions", base_config_1.TYPE],
			["ReadableStreamIteratorOptions", base_config_1.TYPE],
			["ReadableStreamReadDoneResult", base_config_1.TYPE],
			["ReadableStreamReadValueResult", base_config_1.TYPE],
			["ReadableWritablePair", base_config_1.TYPE],
			["RegistrationOptions", base_config_1.TYPE],
			["ReportingObserverOptions", base_config_1.TYPE],
			["RequestInit", base_config_1.TYPE],
			["ResizeObserverOptions", base_config_1.TYPE],
			["ResponseInit", base_config_1.TYPE],
			["RsaHashedImportParams", base_config_1.TYPE],
			["RsaHashedKeyAlgorithm", base_config_1.TYPE],
			["RsaHashedKeyGenParams", base_config_1.TYPE],
			["RsaKeyAlgorithm", base_config_1.TYPE],
			["RsaKeyGenParams", base_config_1.TYPE],
			["RsaOaepParams", base_config_1.TYPE],
			["RsaOtherPrimesInfo", base_config_1.TYPE],
			["RsaPssParams", base_config_1.TYPE],
			["SVGBoundingBoxOptions", base_config_1.TYPE],
			["ScrollIntoViewOptions", base_config_1.TYPE],
			["ScrollOptions", base_config_1.TYPE],
			["ScrollToOptions", base_config_1.TYPE],
			["SecurityPolicyViolationEventInit", base_config_1.TYPE],
			["ShadowRootInit", base_config_1.TYPE],
			["ShareData", base_config_1.TYPE],
			["SpeechSynthesisErrorEventInit", base_config_1.TYPE],
			["SpeechSynthesisEventInit", base_config_1.TYPE],
			["StartViewTransitionOptions", base_config_1.TYPE],
			["StaticRangeInit", base_config_1.TYPE],
			["StereoPannerOptions", base_config_1.TYPE],
			["StorageEstimate", base_config_1.TYPE],
			["StorageEventInit", base_config_1.TYPE],
			["StreamPipeOptions", base_config_1.TYPE],
			["StructuredSerializeOptions", base_config_1.TYPE],
			["SubmitEventInit", base_config_1.TYPE],
			["TextDecodeOptions", base_config_1.TYPE],
			["TextDecoderOptions", base_config_1.TYPE],
			["TextEncoderEncodeIntoResult", base_config_1.TYPE],
			["ToggleEventInit", base_config_1.TYPE],
			["TouchEventInit", base_config_1.TYPE],
			["TouchInit", base_config_1.TYPE],
			["TrackEventInit", base_config_1.TYPE],
			["Transformer", base_config_1.TYPE],
			["TransitionEventInit", base_config_1.TYPE],
			["UIEventInit", base_config_1.TYPE],
			["ULongRange", base_config_1.TYPE],
			["UnderlyingByteSource", base_config_1.TYPE],
			["UnderlyingDefaultSource", base_config_1.TYPE],
			["UnderlyingSink", base_config_1.TYPE],
			["UnderlyingSource", base_config_1.TYPE],
			["ValidityStateFlags", base_config_1.TYPE],
			["VideoColorSpaceInit", base_config_1.TYPE],
			["VideoConfiguration", base_config_1.TYPE],
			["VideoDecoderConfig", base_config_1.TYPE],
			["VideoDecoderInit", base_config_1.TYPE],
			["VideoDecoderSupport", base_config_1.TYPE],
			["VideoEncoderConfig", base_config_1.TYPE],
			["VideoEncoderEncodeOptions", base_config_1.TYPE],
			["VideoEncoderEncodeOptionsForAvc", base_config_1.TYPE],
			["VideoEncoderInit", base_config_1.TYPE],
			["VideoEncoderSupport", base_config_1.TYPE],
			["VideoFrameBufferInit", base_config_1.TYPE],
			["VideoFrameCallbackMetadata", base_config_1.TYPE],
			["VideoFrameCopyToOptions", base_config_1.TYPE],
			["VideoFrameInit", base_config_1.TYPE],
			["WaveShaperOptions", base_config_1.TYPE],
			["WebGLContextAttributes", base_config_1.TYPE],
			["WebGLContextEventInit", base_config_1.TYPE],
			["WebTransportCloseInfo", base_config_1.TYPE],
			["WebTransportErrorOptions", base_config_1.TYPE],
			["WebTransportHash", base_config_1.TYPE],
			["WebTransportOptions", base_config_1.TYPE],
			["WebTransportSendOptions", base_config_1.TYPE],
			["WebTransportSendStreamOptions", base_config_1.TYPE],
			["WheelEventInit", base_config_1.TYPE],
			["WindowPostMessageOptions", base_config_1.TYPE],
			["WorkerOptions", base_config_1.TYPE],
			["WorkletOptions", base_config_1.TYPE],
			["WriteParams", base_config_1.TYPE],
			["NodeFilter", base_config_1.TYPE_VALUE],
			["XPathNSResolver", base_config_1.TYPE],
			["ANGLE_instanced_arrays", base_config_1.TYPE],
			["ARIAMixin", base_config_1.TYPE],
			["AbortController", base_config_1.TYPE_VALUE],
			["AbortSignalEventMap", base_config_1.TYPE],
			["AbortSignal", base_config_1.TYPE_VALUE],
			["AbstractRange", base_config_1.TYPE_VALUE],
			["AbstractWorkerEventMap", base_config_1.TYPE],
			["AbstractWorker", base_config_1.TYPE],
			["AnalyserNode", base_config_1.TYPE_VALUE],
			["Animatable", base_config_1.TYPE],
			["AnimationEventMap", base_config_1.TYPE],
			["Animation", base_config_1.TYPE_VALUE],
			["AnimationEffect", base_config_1.TYPE_VALUE],
			["AnimationEvent", base_config_1.TYPE_VALUE],
			["AnimationFrameProvider", base_config_1.TYPE],
			["AnimationPlaybackEvent", base_config_1.TYPE_VALUE],
			["AnimationTimeline", base_config_1.TYPE_VALUE],
			["Attr", base_config_1.TYPE_VALUE],
			["AudioBuffer", base_config_1.TYPE_VALUE],
			["AudioBufferSourceNode", base_config_1.TYPE_VALUE],
			["AudioContext", base_config_1.TYPE_VALUE],
			["AudioData", base_config_1.TYPE_VALUE],
			["AudioDecoderEventMap", base_config_1.TYPE],
			["AudioDecoder", base_config_1.TYPE_VALUE],
			["AudioDestinationNode", base_config_1.TYPE_VALUE],
			["AudioEncoderEventMap", base_config_1.TYPE],
			["AudioEncoder", base_config_1.TYPE_VALUE],
			["AudioListener", base_config_1.TYPE_VALUE],
			["AudioNode", base_config_1.TYPE_VALUE],
			["AudioParam", base_config_1.TYPE_VALUE],
			["AudioParamMap", base_config_1.TYPE_VALUE],
			["AudioProcessingEvent", base_config_1.TYPE_VALUE],
			["AudioScheduledSourceNodeEventMap", base_config_1.TYPE],
			["AudioScheduledSourceNode", base_config_1.TYPE_VALUE],
			["AudioWorklet", base_config_1.TYPE_VALUE],
			["AudioWorkletNodeEventMap", base_config_1.TYPE],
			["AudioWorkletNode", base_config_1.TYPE_VALUE],
			["AuthenticatorAssertionResponse", base_config_1.TYPE_VALUE],
			["AuthenticatorAttestationResponse", base_config_1.TYPE_VALUE],
			["AuthenticatorResponse", base_config_1.TYPE_VALUE],
			["BarProp", base_config_1.TYPE_VALUE],
			["BaseAudioContextEventMap", base_config_1.TYPE],
			["BaseAudioContext", base_config_1.TYPE_VALUE],
			["BeforeUnloadEvent", base_config_1.TYPE_VALUE],
			["BiquadFilterNode", base_config_1.TYPE_VALUE],
			["Blob", base_config_1.TYPE_VALUE],
			["BlobEvent", base_config_1.TYPE_VALUE],
			["Body", base_config_1.TYPE],
			["BroadcastChannelEventMap", base_config_1.TYPE],
			["BroadcastChannel", base_config_1.TYPE_VALUE],
			["ByteLengthQueuingStrategy", base_config_1.TYPE_VALUE],
			["CDATASection", base_config_1.TYPE_VALUE],
			["CSPViolationReportBody", base_config_1.TYPE_VALUE],
			["CSSAnimation", base_config_1.TYPE_VALUE],
			["CSSConditionRule", base_config_1.TYPE_VALUE],
			["CSSContainerRule", base_config_1.TYPE_VALUE],
			["CSSCounterStyleRule", base_config_1.TYPE_VALUE],
			["CSSFontFaceRule", base_config_1.TYPE_VALUE],
			["CSSFontFeatureValuesRule", base_config_1.TYPE_VALUE],
			["CSSFontPaletteValuesRule", base_config_1.TYPE_VALUE],
			["CSSGroupingRule", base_config_1.TYPE_VALUE],
			["CSSImageValue", base_config_1.TYPE_VALUE],
			["CSSImportRule", base_config_1.TYPE_VALUE],
			["CSSKeyframeRule", base_config_1.TYPE_VALUE],
			["CSSKeyframesRule", base_config_1.TYPE_VALUE],
			["CSSKeywordValue", base_config_1.TYPE_VALUE],
			["CSSLayerBlockRule", base_config_1.TYPE_VALUE],
			["CSSLayerStatementRule", base_config_1.TYPE_VALUE],
			["CSSMathClamp", base_config_1.TYPE_VALUE],
			["CSSMathInvert", base_config_1.TYPE_VALUE],
			["CSSMathMax", base_config_1.TYPE_VALUE],
			["CSSMathMin", base_config_1.TYPE_VALUE],
			["CSSMathNegate", base_config_1.TYPE_VALUE],
			["CSSMathProduct", base_config_1.TYPE_VALUE],
			["CSSMathSum", base_config_1.TYPE_VALUE],
			["CSSMathValue", base_config_1.TYPE_VALUE],
			["CSSMatrixComponent", base_config_1.TYPE_VALUE],
			["CSSMediaRule", base_config_1.TYPE_VALUE],
			["CSSNamespaceRule", base_config_1.TYPE_VALUE],
			["CSSNestedDeclarations", base_config_1.TYPE_VALUE],
			["CSSNumericArray", base_config_1.TYPE_VALUE],
			["CSSNumericValue", base_config_1.TYPE_VALUE],
			["CSSPageRule", base_config_1.TYPE_VALUE],
			["CSSPerspective", base_config_1.TYPE_VALUE],
			["CSSPropertyRule", base_config_1.TYPE_VALUE],
			["CSSRotate", base_config_1.TYPE_VALUE],
			["CSSRule", base_config_1.TYPE_VALUE],
			["CSSRuleList", base_config_1.TYPE_VALUE],
			["CSSScale", base_config_1.TYPE_VALUE],
			["CSSScopeRule", base_config_1.TYPE_VALUE],
			["CSSSkew", base_config_1.TYPE_VALUE],
			["CSSSkewX", base_config_1.TYPE_VALUE],
			["CSSSkewY", base_config_1.TYPE_VALUE],
			["CSSStartingStyleRule", base_config_1.TYPE_VALUE],
			["CSSStyleDeclaration", base_config_1.TYPE_VALUE],
			["CSSStyleRule", base_config_1.TYPE_VALUE],
			["CSSStyleSheet", base_config_1.TYPE_VALUE],
			["CSSStyleValue", base_config_1.TYPE_VALUE],
			["CSSSupportsRule", base_config_1.TYPE_VALUE],
			["CSSTransformComponent", base_config_1.TYPE_VALUE],
			["CSSTransformValue", base_config_1.TYPE_VALUE],
			["CSSTransition", base_config_1.TYPE_VALUE],
			["CSSTranslate", base_config_1.TYPE_VALUE],
			["CSSUnitValue", base_config_1.TYPE_VALUE],
			["CSSUnparsedValue", base_config_1.TYPE_VALUE],
			["CSSVariableReferenceValue", base_config_1.TYPE_VALUE],
			["CSSViewTransitionRule", base_config_1.TYPE_VALUE],
			["Cache", base_config_1.TYPE_VALUE],
			["CacheStorage", base_config_1.TYPE_VALUE],
			["CanvasCaptureMediaStreamTrack", base_config_1.TYPE_VALUE],
			["CanvasCompositing", base_config_1.TYPE],
			["CanvasDrawImage", base_config_1.TYPE],
			["CanvasDrawPath", base_config_1.TYPE],
			["CanvasFillStrokeStyles", base_config_1.TYPE],
			["CanvasFilters", base_config_1.TYPE],
			["CanvasGradient", base_config_1.TYPE_VALUE],
			["CanvasImageData", base_config_1.TYPE],
			["CanvasImageSmoothing", base_config_1.TYPE],
			["CanvasPath", base_config_1.TYPE],
			["CanvasPathDrawingStyles", base_config_1.TYPE],
			["CanvasPattern", base_config_1.TYPE_VALUE],
			["CanvasRect", base_config_1.TYPE],
			["CanvasRenderingContext2D", base_config_1.TYPE_VALUE],
			["CanvasSettings", base_config_1.TYPE],
			["CanvasShadowStyles", base_config_1.TYPE],
			["CanvasState", base_config_1.TYPE],
			["CanvasText", base_config_1.TYPE],
			["CanvasTextDrawingStyles", base_config_1.TYPE],
			["CanvasTransform", base_config_1.TYPE],
			["CanvasUserInterface", base_config_1.TYPE],
			["CaretPosition", base_config_1.TYPE_VALUE],
			["ChannelMergerNode", base_config_1.TYPE_VALUE],
			["ChannelSplitterNode", base_config_1.TYPE_VALUE],
			["CharacterData", base_config_1.TYPE_VALUE],
			["ChildNode", base_config_1.TYPE],
			["ClientRect", base_config_1.TYPE],
			["Clipboard", base_config_1.TYPE_VALUE],
			["ClipboardEvent", base_config_1.TYPE_VALUE],
			["ClipboardItem", base_config_1.TYPE_VALUE],
			["CloseEvent", base_config_1.TYPE_VALUE],
			["Comment", base_config_1.TYPE_VALUE],
			["CompositionEvent", base_config_1.TYPE_VALUE],
			["CompressionStream", base_config_1.TYPE_VALUE],
			["ConstantSourceNode", base_config_1.TYPE_VALUE],
			["ContentVisibilityAutoStateChangeEvent", base_config_1.TYPE_VALUE],
			["ConvolverNode", base_config_1.TYPE_VALUE],
			["CookieChangeEvent", base_config_1.TYPE_VALUE],
			["CookieStoreEventMap", base_config_1.TYPE],
			["CookieStore", base_config_1.TYPE_VALUE],
			["CookieStoreManager", base_config_1.TYPE_VALUE],
			["CountQueuingStrategy", base_config_1.TYPE_VALUE],
			["Credential", base_config_1.TYPE_VALUE],
			["CredentialsContainer", base_config_1.TYPE_VALUE],
			["Crypto", base_config_1.TYPE_VALUE],
			["CryptoKey", base_config_1.TYPE_VALUE],
			["CustomElementRegistry", base_config_1.TYPE_VALUE],
			["CustomEvent", base_config_1.TYPE_VALUE],
			["CustomStateSet", base_config_1.TYPE_VALUE],
			["DOMException", base_config_1.TYPE_VALUE],
			["DOMImplementation", base_config_1.TYPE_VALUE],
			["DOMMatrix", base_config_1.TYPE_VALUE],
			["SVGMatrix", base_config_1.TYPE_VALUE],
			["WebKitCSSMatrix", base_config_1.TYPE_VALUE],
			["DOMMatrixReadOnly", base_config_1.TYPE_VALUE],
			["DOMParser", base_config_1.TYPE_VALUE],
			["DOMPoint", base_config_1.TYPE_VALUE],
			["SVGPoint", base_config_1.TYPE_VALUE],
			["DOMPointReadOnly", base_config_1.TYPE_VALUE],
			["DOMQuad", base_config_1.TYPE_VALUE],
			["DOMRect", base_config_1.TYPE_VALUE],
			["SVGRect", base_config_1.TYPE_VALUE],
			["DOMRectList", base_config_1.TYPE_VALUE],
			["DOMRectReadOnly", base_config_1.TYPE_VALUE],
			["DOMStringList", base_config_1.TYPE_VALUE],
			["DOMStringMap", base_config_1.TYPE_VALUE],
			["DOMTokenList", base_config_1.TYPE_VALUE],
			["DataTransfer", base_config_1.TYPE_VALUE],
			["DataTransferItem", base_config_1.TYPE_VALUE],
			["DataTransferItemList", base_config_1.TYPE_VALUE],
			["DecompressionStream", base_config_1.TYPE_VALUE],
			["DelayNode", base_config_1.TYPE_VALUE],
			["DeviceMotionEvent", base_config_1.TYPE_VALUE],
			["DeviceMotionEventAcceleration", base_config_1.TYPE],
			["DeviceMotionEventRotationRate", base_config_1.TYPE],
			["DeviceOrientationEvent", base_config_1.TYPE_VALUE],
			["DocumentEventMap", base_config_1.TYPE],
			["Document", base_config_1.TYPE_VALUE],
			["DocumentFragment", base_config_1.TYPE_VALUE],
			["DocumentOrShadowRoot", base_config_1.TYPE],
			["DocumentTimeline", base_config_1.TYPE_VALUE],
			["DocumentType", base_config_1.TYPE_VALUE],
			["DragEvent", base_config_1.TYPE_VALUE],
			["DynamicsCompressorNode", base_config_1.TYPE_VALUE],
			["EXT_blend_minmax", base_config_1.TYPE],
			["EXT_color_buffer_float", base_config_1.TYPE],
			["EXT_color_buffer_half_float", base_config_1.TYPE],
			["EXT_float_blend", base_config_1.TYPE],
			["EXT_frag_depth", base_config_1.TYPE],
			["EXT_sRGB", base_config_1.TYPE],
			["EXT_shader_texture_lod", base_config_1.TYPE],
			["EXT_texture_compression_bptc", base_config_1.TYPE],
			["EXT_texture_compression_rgtc", base_config_1.TYPE],
			["EXT_texture_filter_anisotropic", base_config_1.TYPE],
			["EXT_texture_norm16", base_config_1.TYPE],
			["ElementEventMap", base_config_1.TYPE],
			["Element", base_config_1.TYPE_VALUE],
			["ElementCSSInlineStyle", base_config_1.TYPE],
			["ElementContentEditable", base_config_1.TYPE],
			["ElementInternals", base_config_1.TYPE_VALUE],
			["EncodedAudioChunk", base_config_1.TYPE_VALUE],
			["EncodedVideoChunk", base_config_1.TYPE_VALUE],
			["ErrorEvent", base_config_1.TYPE_VALUE],
			["Event", base_config_1.TYPE_VALUE],
			["EventCounts", base_config_1.TYPE_VALUE],
			["EventListener", base_config_1.TYPE],
			["EventListenerObject", base_config_1.TYPE],
			["EventSourceEventMap", base_config_1.TYPE],
			["EventSource", base_config_1.TYPE_VALUE],
			["EventTarget", base_config_1.TYPE_VALUE],
			["External", base_config_1.TYPE_VALUE],
			["File", base_config_1.TYPE_VALUE],
			["FileList", base_config_1.TYPE_VALUE],
			["FileReaderEventMap", base_config_1.TYPE],
			["FileReader", base_config_1.TYPE_VALUE],
			["FileSystem", base_config_1.TYPE_VALUE],
			["FileSystemDirectoryEntry", base_config_1.TYPE_VALUE],
			["FileSystemDirectoryHandle", base_config_1.TYPE_VALUE],
			["FileSystemDirectoryReader", base_config_1.TYPE_VALUE],
			["FileSystemEntry", base_config_1.TYPE_VALUE],
			["FileSystemFileEntry", base_config_1.TYPE_VALUE],
			["FileSystemFileHandle", base_config_1.TYPE_VALUE],
			["FileSystemHandle", base_config_1.TYPE_VALUE],
			["FileSystemWritableFileStream", base_config_1.TYPE_VALUE],
			["FocusEvent", base_config_1.TYPE_VALUE],
			["FontFace", base_config_1.TYPE_VALUE],
			["FontFaceSetEventMap", base_config_1.TYPE],
			["FontFaceSet", base_config_1.TYPE_VALUE],
			["FontFaceSetLoadEvent", base_config_1.TYPE_VALUE],
			["FontFaceSource", base_config_1.TYPE],
			["FormData", base_config_1.TYPE_VALUE],
			["FormDataEvent", base_config_1.TYPE_VALUE],
			["FragmentDirective", base_config_1.TYPE_VALUE],
			["GPUError", base_config_1.TYPE],
			["GainNode", base_config_1.TYPE_VALUE],
			["Gamepad", base_config_1.TYPE_VALUE],
			["GamepadButton", base_config_1.TYPE_VALUE],
			["GamepadEvent", base_config_1.TYPE_VALUE],
			["GamepadHapticActuator", base_config_1.TYPE_VALUE],
			["GenericTransformStream", base_config_1.TYPE],
			["Geolocation", base_config_1.TYPE_VALUE],
			["GeolocationCoordinates", base_config_1.TYPE_VALUE],
			["GeolocationPosition", base_config_1.TYPE_VALUE],
			["GeolocationPositionError", base_config_1.TYPE_VALUE],
			["GlobalEventHandlersEventMap", base_config_1.TYPE],
			["GlobalEventHandlers", base_config_1.TYPE],
			["HTMLAllCollection", base_config_1.TYPE_VALUE],
			["HTMLAnchorElement", base_config_1.TYPE_VALUE],
			["HTMLAreaElement", base_config_1.TYPE_VALUE],
			["HTMLAudioElement", base_config_1.TYPE_VALUE],
			["HTMLBRElement", base_config_1.TYPE_VALUE],
			["HTMLBaseElement", base_config_1.TYPE_VALUE],
			["HTMLBodyElementEventMap", base_config_1.TYPE],
			["HTMLBodyElement", base_config_1.TYPE_VALUE],
			["HTMLButtonElement", base_config_1.TYPE_VALUE],
			["HTMLCanvasElement", base_config_1.TYPE_VALUE],
			["HTMLCollectionBase", base_config_1.TYPE],
			["HTMLCollection", base_config_1.TYPE_VALUE],
			["HTMLCollectionOf", base_config_1.TYPE],
			["HTMLDListElement", base_config_1.TYPE_VALUE],
			["HTMLDataElement", base_config_1.TYPE_VALUE],
			["HTMLDataListElement", base_config_1.TYPE_VALUE],
			["HTMLDetailsElement", base_config_1.TYPE_VALUE],
			["HTMLDialogElement", base_config_1.TYPE_VALUE],
			["HTMLDirectoryElement", base_config_1.TYPE_VALUE],
			["HTMLDivElement", base_config_1.TYPE_VALUE],
			["HTMLDocument", base_config_1.TYPE_VALUE],
			["HTMLElementEventMap", base_config_1.TYPE],
			["HTMLElement", base_config_1.TYPE_VALUE],
			["HTMLEmbedElement", base_config_1.TYPE_VALUE],
			["HTMLFieldSetElement", base_config_1.TYPE_VALUE],
			["HTMLFontElement", base_config_1.TYPE_VALUE],
			["HTMLFormControlsCollection", base_config_1.TYPE_VALUE],
			["HTMLFormElement", base_config_1.TYPE_VALUE],
			["HTMLFrameElement", base_config_1.TYPE_VALUE],
			["HTMLFrameSetElementEventMap", base_config_1.TYPE],
			["HTMLFrameSetElement", base_config_1.TYPE_VALUE],
			["HTMLHRElement", base_config_1.TYPE_VALUE],
			["HTMLHeadElement", base_config_1.TYPE_VALUE],
			["HTMLHeadingElement", base_config_1.TYPE_VALUE],
			["HTMLHtmlElement", base_config_1.TYPE_VALUE],
			["HTMLHyperlinkElementUtils", base_config_1.TYPE],
			["HTMLIFrameElement", base_config_1.TYPE_VALUE],
			["HTMLImageElement", base_config_1.TYPE_VALUE],
			["HTMLInputElement", base_config_1.TYPE_VALUE],
			["HTMLLIElement", base_config_1.TYPE_VALUE],
			["HTMLLabelElement", base_config_1.TYPE_VALUE],
			["HTMLLegendElement", base_config_1.TYPE_VALUE],
			["HTMLLinkElement", base_config_1.TYPE_VALUE],
			["HTMLMapElement", base_config_1.TYPE_VALUE],
			["HTMLMarqueeElement", base_config_1.TYPE_VALUE],
			["HTMLMediaElementEventMap", base_config_1.TYPE],
			["HTMLMediaElement", base_config_1.TYPE_VALUE],
			["HTMLMenuElement", base_config_1.TYPE_VALUE],
			["HTMLMetaElement", base_config_1.TYPE_VALUE],
			["HTMLMeterElement", base_config_1.TYPE_VALUE],
			["HTMLModElement", base_config_1.TYPE_VALUE],
			["HTMLOListElement", base_config_1.TYPE_VALUE],
			["HTMLObjectElement", base_config_1.TYPE_VALUE],
			["HTMLOptGroupElement", base_config_1.TYPE_VALUE],
			["HTMLOptionElement", base_config_1.TYPE_VALUE],
			["HTMLOptionsCollection", base_config_1.TYPE_VALUE],
			["HTMLOrSVGElement", base_config_1.TYPE],
			["HTMLOutputElement", base_config_1.TYPE_VALUE],
			["HTMLParagraphElement", base_config_1.TYPE_VALUE],
			["HTMLParamElement", base_config_1.TYPE_VALUE],
			["HTMLPictureElement", base_config_1.TYPE_VALUE],
			["HTMLPreElement", base_config_1.TYPE_VALUE],
			["HTMLProgressElement", base_config_1.TYPE_VALUE],
			["HTMLQuoteElement", base_config_1.TYPE_VALUE],
			["HTMLScriptElement", base_config_1.TYPE_VALUE],
			["HTMLSelectElement", base_config_1.TYPE_VALUE],
			["HTMLSlotElement", base_config_1.TYPE_VALUE],
			["HTMLSourceElement", base_config_1.TYPE_VALUE],
			["HTMLSpanElement", base_config_1.TYPE_VALUE],
			["HTMLStyleElement", base_config_1.TYPE_VALUE],
			["HTMLTableCaptionElement", base_config_1.TYPE_VALUE],
			["HTMLTableCellElement", base_config_1.TYPE_VALUE],
			["HTMLTableColElement", base_config_1.TYPE_VALUE],
			["HTMLTableDataCellElement", base_config_1.TYPE],
			["HTMLTableElement", base_config_1.TYPE_VALUE],
			["HTMLTableHeaderCellElement", base_config_1.TYPE],
			["HTMLTableRowElement", base_config_1.TYPE_VALUE],
			["HTMLTableSectionElement", base_config_1.TYPE_VALUE],
			["HTMLTemplateElement", base_config_1.TYPE_VALUE],
			["HTMLTextAreaElement", base_config_1.TYPE_VALUE],
			["HTMLTimeElement", base_config_1.TYPE_VALUE],
			["HTMLTitleElement", base_config_1.TYPE_VALUE],
			["HTMLTrackElement", base_config_1.TYPE_VALUE],
			["HTMLUListElement", base_config_1.TYPE_VALUE],
			["HTMLUnknownElement", base_config_1.TYPE_VALUE],
			["HTMLVideoElementEventMap", base_config_1.TYPE],
			["HTMLVideoElement", base_config_1.TYPE_VALUE],
			["HashChangeEvent", base_config_1.TYPE_VALUE],
			["Headers", base_config_1.TYPE_VALUE],
			["Highlight", base_config_1.TYPE_VALUE],
			["HighlightRegistry", base_config_1.TYPE_VALUE],
			["History", base_config_1.TYPE_VALUE],
			["IDBCursor", base_config_1.TYPE_VALUE],
			["IDBCursorWithValue", base_config_1.TYPE_VALUE],
			["IDBDatabaseEventMap", base_config_1.TYPE],
			["IDBDatabase", base_config_1.TYPE_VALUE],
			["IDBFactory", base_config_1.TYPE_VALUE],
			["IDBIndex", base_config_1.TYPE_VALUE],
			["IDBKeyRange", base_config_1.TYPE_VALUE],
			["IDBObjectStore", base_config_1.TYPE_VALUE],
			["IDBOpenDBRequestEventMap", base_config_1.TYPE],
			["IDBOpenDBRequest", base_config_1.TYPE_VALUE],
			["IDBRequestEventMap", base_config_1.TYPE],
			["IDBRequest", base_config_1.TYPE_VALUE],
			["IDBTransactionEventMap", base_config_1.TYPE],
			["IDBTransaction", base_config_1.TYPE_VALUE],
			["IDBVersionChangeEvent", base_config_1.TYPE_VALUE],
			["IIRFilterNode", base_config_1.TYPE_VALUE],
			["IdleDeadline", base_config_1.TYPE_VALUE],
			["ImageBitmap", base_config_1.TYPE_VALUE],
			["ImageBitmapRenderingContext", base_config_1.TYPE_VALUE],
			["ImageCapture", base_config_1.TYPE_VALUE],
			["ImageData", base_config_1.TYPE_VALUE],
			["ImageDecoder", base_config_1.TYPE_VALUE],
			["ImageTrack", base_config_1.TYPE_VALUE],
			["ImageTrackList", base_config_1.TYPE_VALUE],
			["ImportMeta", base_config_1.TYPE],
			["InputDeviceInfo", base_config_1.TYPE_VALUE],
			["InputEvent", base_config_1.TYPE_VALUE],
			["IntersectionObserver", base_config_1.TYPE_VALUE],
			["IntersectionObserverEntry", base_config_1.TYPE_VALUE],
			["KHR_parallel_shader_compile", base_config_1.TYPE],
			["KeyboardEvent", base_config_1.TYPE_VALUE],
			["KeyframeEffect", base_config_1.TYPE_VALUE],
			["LargestContentfulPaint", base_config_1.TYPE_VALUE],
			["LinkStyle", base_config_1.TYPE],
			["Location", base_config_1.TYPE_VALUE],
			["Lock", base_config_1.TYPE_VALUE],
			["LockManager", base_config_1.TYPE_VALUE],
			["MIDIAccessEventMap", base_config_1.TYPE],
			["MIDIAccess", base_config_1.TYPE_VALUE],
			["MIDIConnectionEvent", base_config_1.TYPE_VALUE],
			["MIDIInputEventMap", base_config_1.TYPE],
			["MIDIInput", base_config_1.TYPE_VALUE],
			["MIDIInputMap", base_config_1.TYPE_VALUE],
			["MIDIMessageEvent", base_config_1.TYPE_VALUE],
			["MIDIOutput", base_config_1.TYPE_VALUE],
			["MIDIOutputMap", base_config_1.TYPE_VALUE],
			["MIDIPortEventMap", base_config_1.TYPE],
			["MIDIPort", base_config_1.TYPE_VALUE],
			["MathMLElementEventMap", base_config_1.TYPE],
			["MathMLElement", base_config_1.TYPE_VALUE],
			["MediaCapabilities", base_config_1.TYPE_VALUE],
			["MediaDeviceInfo", base_config_1.TYPE_VALUE],
			["MediaDevicesEventMap", base_config_1.TYPE],
			["MediaDevices", base_config_1.TYPE_VALUE],
			["MediaElementAudioSourceNode", base_config_1.TYPE_VALUE],
			["MediaEncryptedEvent", base_config_1.TYPE_VALUE],
			["MediaError", base_config_1.TYPE_VALUE],
			["MediaKeyMessageEvent", base_config_1.TYPE_VALUE],
			["MediaKeySessionEventMap", base_config_1.TYPE],
			["MediaKeySession", base_config_1.TYPE_VALUE],
			["MediaKeyStatusMap", base_config_1.TYPE_VALUE],
			["MediaKeySystemAccess", base_config_1.TYPE_VALUE],
			["MediaKeys", base_config_1.TYPE_VALUE],
			["MediaList", base_config_1.TYPE_VALUE],
			["MediaMetadata", base_config_1.TYPE_VALUE],
			["MediaQueryListEventMap", base_config_1.TYPE],
			["MediaQueryList", base_config_1.TYPE_VALUE],
			["MediaQueryListEvent", base_config_1.TYPE_VALUE],
			["MediaRecorderEventMap", base_config_1.TYPE],
			["MediaRecorder", base_config_1.TYPE_VALUE],
			["MediaSession", base_config_1.TYPE_VALUE],
			["MediaSourceEventMap", base_config_1.TYPE],
			["MediaSource", base_config_1.TYPE_VALUE],
			["MediaSourceHandle", base_config_1.TYPE_VALUE],
			["MediaStreamEventMap", base_config_1.TYPE],
			["MediaStream", base_config_1.TYPE_VALUE],
			["MediaStreamAudioDestinationNode", base_config_1.TYPE_VALUE],
			["MediaStreamAudioSourceNode", base_config_1.TYPE_VALUE],
			["MediaStreamTrackEventMap", base_config_1.TYPE],
			["MediaStreamTrack", base_config_1.TYPE_VALUE],
			["MediaStreamTrackEvent", base_config_1.TYPE_VALUE],
			["MessageChannel", base_config_1.TYPE_VALUE],
			["MessageEvent", base_config_1.TYPE_VALUE],
			["MessageEventTargetEventMap", base_config_1.TYPE],
			["MessageEventTarget", base_config_1.TYPE],
			["MessagePortEventMap", base_config_1.TYPE],
			["MessagePort", base_config_1.TYPE_VALUE],
			["MimeType", base_config_1.TYPE_VALUE],
			["MimeTypeArray", base_config_1.TYPE_VALUE],
			["MouseEvent", base_config_1.TYPE_VALUE],
			["MutationObserver", base_config_1.TYPE_VALUE],
			["MutationRecord", base_config_1.TYPE_VALUE],
			["NamedNodeMap", base_config_1.TYPE_VALUE],
			["NavigationActivation", base_config_1.TYPE_VALUE],
			["NavigationHistoryEntryEventMap", base_config_1.TYPE],
			["NavigationHistoryEntry", base_config_1.TYPE_VALUE],
			["NavigationPreloadManager", base_config_1.TYPE_VALUE],
			["Navigator", base_config_1.TYPE_VALUE],
			["NavigatorAutomationInformation", base_config_1.TYPE],
			["NavigatorBadge", base_config_1.TYPE],
			["NavigatorConcurrentHardware", base_config_1.TYPE],
			["NavigatorContentUtils", base_config_1.TYPE],
			["NavigatorCookies", base_config_1.TYPE],
			["NavigatorID", base_config_1.TYPE],
			["NavigatorLanguage", base_config_1.TYPE],
			["NavigatorLocks", base_config_1.TYPE],
			["NavigatorLogin", base_config_1.TYPE_VALUE],
			["NavigatorOnLine", base_config_1.TYPE],
			["NavigatorPlugins", base_config_1.TYPE],
			["NavigatorStorage", base_config_1.TYPE],
			["Node", base_config_1.TYPE_VALUE],
			["NodeIterator", base_config_1.TYPE_VALUE],
			["NodeList", base_config_1.TYPE_VALUE],
			["NodeListOf", base_config_1.TYPE],
			["NonDocumentTypeChildNode", base_config_1.TYPE],
			["NonElementParentNode", base_config_1.TYPE],
			["NotificationEventMap", base_config_1.TYPE],
			["Notification", base_config_1.TYPE_VALUE],
			["OES_draw_buffers_indexed", base_config_1.TYPE],
			["OES_element_index_uint", base_config_1.TYPE],
			["OES_fbo_render_mipmap", base_config_1.TYPE],
			["OES_standard_derivatives", base_config_1.TYPE],
			["OES_texture_float", base_config_1.TYPE],
			["OES_texture_float_linear", base_config_1.TYPE],
			["OES_texture_half_float", base_config_1.TYPE],
			["OES_texture_half_float_linear", base_config_1.TYPE],
			["OES_vertex_array_object", base_config_1.TYPE],
			["OVR_multiview2", base_config_1.TYPE],
			["OfflineAudioCompletionEvent", base_config_1.TYPE_VALUE],
			["OfflineAudioContextEventMap", base_config_1.TYPE],
			["OfflineAudioContext", base_config_1.TYPE_VALUE],
			["OffscreenCanvasEventMap", base_config_1.TYPE],
			["OffscreenCanvas", base_config_1.TYPE_VALUE],
			["OffscreenCanvasRenderingContext2D", base_config_1.TYPE_VALUE],
			["OscillatorNode", base_config_1.TYPE_VALUE],
			["OverconstrainedError", base_config_1.TYPE_VALUE],
			["PageRevealEvent", base_config_1.TYPE_VALUE],
			["PageSwapEvent", base_config_1.TYPE_VALUE],
			["PageTransitionEvent", base_config_1.TYPE_VALUE],
			["PannerNode", base_config_1.TYPE_VALUE],
			["ParentNode", base_config_1.TYPE],
			["Path2D", base_config_1.TYPE_VALUE],
			["PaymentAddress", base_config_1.TYPE_VALUE],
			["PaymentMethodChangeEvent", base_config_1.TYPE_VALUE],
			["PaymentRequestEventMap", base_config_1.TYPE],
			["PaymentRequest", base_config_1.TYPE_VALUE],
			["PaymentRequestUpdateEvent", base_config_1.TYPE_VALUE],
			["PaymentResponseEventMap", base_config_1.TYPE],
			["PaymentResponse", base_config_1.TYPE_VALUE],
			["PerformanceEventMap", base_config_1.TYPE],
			["Performance", base_config_1.TYPE_VALUE],
			["PerformanceEntry", base_config_1.TYPE_VALUE],
			["PerformanceEventTiming", base_config_1.TYPE_VALUE],
			["PerformanceMark", base_config_1.TYPE_VALUE],
			["PerformanceMeasure", base_config_1.TYPE_VALUE],
			["PerformanceNavigation", base_config_1.TYPE_VALUE],
			["PerformanceNavigationTiming", base_config_1.TYPE_VALUE],
			["PerformanceObserver", base_config_1.TYPE_VALUE],
			["PerformanceObserverEntryList", base_config_1.TYPE_VALUE],
			["PerformancePaintTiming", base_config_1.TYPE_VALUE],
			["PerformanceResourceTiming", base_config_1.TYPE_VALUE],
			["PerformanceServerTiming", base_config_1.TYPE_VALUE],
			["PerformanceTiming", base_config_1.TYPE_VALUE],
			["PeriodicWave", base_config_1.TYPE_VALUE],
			["PermissionStatusEventMap", base_config_1.TYPE],
			["PermissionStatus", base_config_1.TYPE_VALUE],
			["Permissions", base_config_1.TYPE_VALUE],
			["PictureInPictureEvent", base_config_1.TYPE_VALUE],
			["PictureInPictureWindowEventMap", base_config_1.TYPE],
			["PictureInPictureWindow", base_config_1.TYPE_VALUE],
			["Plugin", base_config_1.TYPE_VALUE],
			["PluginArray", base_config_1.TYPE_VALUE],
			["PointerEvent", base_config_1.TYPE_VALUE],
			["PopStateEvent", base_config_1.TYPE_VALUE],
			["PopoverInvokerElement", base_config_1.TYPE],
			["ProcessingInstruction", base_config_1.TYPE_VALUE],
			["ProgressEvent", base_config_1.TYPE_VALUE],
			["PromiseRejectionEvent", base_config_1.TYPE_VALUE],
			["PublicKeyCredential", base_config_1.TYPE_VALUE],
			["PushManager", base_config_1.TYPE_VALUE],
			["PushSubscription", base_config_1.TYPE_VALUE],
			["PushSubscriptionOptions", base_config_1.TYPE_VALUE],
			["RTCCertificate", base_config_1.TYPE_VALUE],
			["RTCDTMFSenderEventMap", base_config_1.TYPE],
			["RTCDTMFSender", base_config_1.TYPE_VALUE],
			["RTCDTMFToneChangeEvent", base_config_1.TYPE_VALUE],
			["RTCDataChannelEventMap", base_config_1.TYPE],
			["RTCDataChannel", base_config_1.TYPE_VALUE],
			["RTCDataChannelEvent", base_config_1.TYPE_VALUE],
			["RTCDtlsTransportEventMap", base_config_1.TYPE],
			["RTCDtlsTransport", base_config_1.TYPE_VALUE],
			["RTCEncodedAudioFrame", base_config_1.TYPE_VALUE],
			["RTCEncodedVideoFrame", base_config_1.TYPE_VALUE],
			["RTCError", base_config_1.TYPE_VALUE],
			["RTCErrorEvent", base_config_1.TYPE_VALUE],
			["RTCIceCandidate", base_config_1.TYPE_VALUE],
			["RTCIceCandidatePair", base_config_1.TYPE],
			["RTCIceTransportEventMap", base_config_1.TYPE],
			["RTCIceTransport", base_config_1.TYPE_VALUE],
			["RTCPeerConnectionEventMap", base_config_1.TYPE],
			["RTCPeerConnection", base_config_1.TYPE_VALUE],
			["RTCPeerConnectionIceErrorEvent", base_config_1.TYPE_VALUE],
			["RTCPeerConnectionIceEvent", base_config_1.TYPE_VALUE],
			["RTCRtpReceiver", base_config_1.TYPE_VALUE],
			["RTCRtpScriptTransform", base_config_1.TYPE_VALUE],
			["RTCRtpSender", base_config_1.TYPE_VALUE],
			["RTCRtpTransceiver", base_config_1.TYPE_VALUE],
			["RTCSctpTransportEventMap", base_config_1.TYPE],
			["RTCSctpTransport", base_config_1.TYPE_VALUE],
			["RTCSessionDescription", base_config_1.TYPE_VALUE],
			["RTCStatsReport", base_config_1.TYPE_VALUE],
			["RTCTrackEvent", base_config_1.TYPE_VALUE],
			["RadioNodeList", base_config_1.TYPE_VALUE],
			["Range", base_config_1.TYPE_VALUE],
			["ReadableByteStreamController", base_config_1.TYPE_VALUE],
			["ReadableStream", base_config_1.TYPE_VALUE],
			["ReadableStreamBYOBReader", base_config_1.TYPE_VALUE],
			["ReadableStreamBYOBRequest", base_config_1.TYPE_VALUE],
			["ReadableStreamDefaultController", base_config_1.TYPE_VALUE],
			["ReadableStreamDefaultReader", base_config_1.TYPE_VALUE],
			["ReadableStreamGenericReader", base_config_1.TYPE],
			["RemotePlaybackEventMap", base_config_1.TYPE],
			["RemotePlayback", base_config_1.TYPE_VALUE],
			["Report", base_config_1.TYPE_VALUE],
			["ReportBody", base_config_1.TYPE_VALUE],
			["ReportingObserver", base_config_1.TYPE_VALUE],
			["Request", base_config_1.TYPE_VALUE],
			["ResizeObserver", base_config_1.TYPE_VALUE],
			["ResizeObserverEntry", base_config_1.TYPE_VALUE],
			["ResizeObserverSize", base_config_1.TYPE_VALUE],
			["Response", base_config_1.TYPE_VALUE],
			["SVGAElement", base_config_1.TYPE_VALUE],
			["SVGAngle", base_config_1.TYPE_VALUE],
			["SVGAnimateElement", base_config_1.TYPE_VALUE],
			["SVGAnimateMotionElement", base_config_1.TYPE_VALUE],
			["SVGAnimateTransformElement", base_config_1.TYPE_VALUE],
			["SVGAnimatedAngle", base_config_1.TYPE_VALUE],
			["SVGAnimatedBoolean", base_config_1.TYPE_VALUE],
			["SVGAnimatedEnumeration", base_config_1.TYPE_VALUE],
			["SVGAnimatedInteger", base_config_1.TYPE_VALUE],
			["SVGAnimatedLength", base_config_1.TYPE_VALUE],
			["SVGAnimatedLengthList", base_config_1.TYPE_VALUE],
			["SVGAnimatedNumber", base_config_1.TYPE_VALUE],
			["SVGAnimatedNumberList", base_config_1.TYPE_VALUE],
			["SVGAnimatedPoints", base_config_1.TYPE],
			["SVGAnimatedPreserveAspectRatio", base_config_1.TYPE_VALUE],
			["SVGAnimatedRect", base_config_1.TYPE_VALUE],
			["SVGAnimatedString", base_config_1.TYPE_VALUE],
			["SVGAnimatedTransformList", base_config_1.TYPE_VALUE],
			["SVGAnimationElement", base_config_1.TYPE_VALUE],
			["SVGCircleElement", base_config_1.TYPE_VALUE],
			["SVGClipPathElement", base_config_1.TYPE_VALUE],
			["SVGComponentTransferFunctionElement", base_config_1.TYPE_VALUE],
			["SVGDefsElement", base_config_1.TYPE_VALUE],
			["SVGDescElement", base_config_1.TYPE_VALUE],
			["SVGElementEventMap", base_config_1.TYPE],
			["SVGElement", base_config_1.TYPE_VALUE],
			["SVGEllipseElement", base_config_1.TYPE_VALUE],
			["SVGFEBlendElement", base_config_1.TYPE_VALUE],
			["SVGFEColorMatrixElement", base_config_1.TYPE_VALUE],
			["SVGFEComponentTransferElement", base_config_1.TYPE_VALUE],
			["SVGFECompositeElement", base_config_1.TYPE_VALUE],
			["SVGFEConvolveMatrixElement", base_config_1.TYPE_VALUE],
			["SVGFEDiffuseLightingElement", base_config_1.TYPE_VALUE],
			["SVGFEDisplacementMapElement", base_config_1.TYPE_VALUE],
			["SVGFEDistantLightElement", base_config_1.TYPE_VALUE],
			["SVGFEDropShadowElement", base_config_1.TYPE_VALUE],
			["SVGFEFloodElement", base_config_1.TYPE_VALUE],
			["SVGFEFuncAElement", base_config_1.TYPE_VALUE],
			["SVGFEFuncBElement", base_config_1.TYPE_VALUE],
			["SVGFEFuncGElement", base_config_1.TYPE_VALUE],
			["SVGFEFuncRElement", base_config_1.TYPE_VALUE],
			["SVGFEGaussianBlurElement", base_config_1.TYPE_VALUE],
			["SVGFEImageElement", base_config_1.TYPE_VALUE],
			["SVGFEMergeElement", base_config_1.TYPE_VALUE],
			["SVGFEMergeNodeElement", base_config_1.TYPE_VALUE],
			["SVGFEMorphologyElement", base_config_1.TYPE_VALUE],
			["SVGFEOffsetElement", base_config_1.TYPE_VALUE],
			["SVGFEPointLightElement", base_config_1.TYPE_VALUE],
			["SVGFESpecularLightingElement", base_config_1.TYPE_VALUE],
			["SVGFESpotLightElement", base_config_1.TYPE_VALUE],
			["SVGFETileElement", base_config_1.TYPE_VALUE],
			["SVGFETurbulenceElement", base_config_1.TYPE_VALUE],
			["SVGFilterElement", base_config_1.TYPE_VALUE],
			["SVGFilterPrimitiveStandardAttributes", base_config_1.TYPE],
			["SVGFitToViewBox", base_config_1.TYPE],
			["SVGForeignObjectElement", base_config_1.TYPE_VALUE],
			["SVGGElement", base_config_1.TYPE_VALUE],
			["SVGGeometryElement", base_config_1.TYPE_VALUE],
			["SVGGradientElement", base_config_1.TYPE_VALUE],
			["SVGGraphicsElement", base_config_1.TYPE_VALUE],
			["SVGImageElement", base_config_1.TYPE_VALUE],
			["SVGLength", base_config_1.TYPE_VALUE],
			["SVGLengthList", base_config_1.TYPE_VALUE],
			["SVGLineElement", base_config_1.TYPE_VALUE],
			["SVGLinearGradientElement", base_config_1.TYPE_VALUE],
			["SVGMPathElement", base_config_1.TYPE_VALUE],
			["SVGMarkerElement", base_config_1.TYPE_VALUE],
			["SVGMaskElement", base_config_1.TYPE_VALUE],
			["SVGMetadataElement", base_config_1.TYPE_VALUE],
			["SVGNumber", base_config_1.TYPE_VALUE],
			["SVGNumberList", base_config_1.TYPE_VALUE],
			["SVGPathElement", base_config_1.TYPE_VALUE],
			["SVGPatternElement", base_config_1.TYPE_VALUE],
			["SVGPointList", base_config_1.TYPE_VALUE],
			["SVGPolygonElement", base_config_1.TYPE_VALUE],
			["SVGPolylineElement", base_config_1.TYPE_VALUE],
			["SVGPreserveAspectRatio", base_config_1.TYPE_VALUE],
			["SVGRadialGradientElement", base_config_1.TYPE_VALUE],
			["SVGRectElement", base_config_1.TYPE_VALUE],
			["SVGSVGElementEventMap", base_config_1.TYPE],
			["SVGSVGElement", base_config_1.TYPE_VALUE],
			["SVGScriptElement", base_config_1.TYPE_VALUE],
			["SVGSetElement", base_config_1.TYPE_VALUE],
			["SVGStopElement", base_config_1.TYPE_VALUE],
			["SVGStringList", base_config_1.TYPE_VALUE],
			["SVGStyleElement", base_config_1.TYPE_VALUE],
			["SVGSwitchElement", base_config_1.TYPE_VALUE],
			["SVGSymbolElement", base_config_1.TYPE_VALUE],
			["SVGTSpanElement", base_config_1.TYPE_VALUE],
			["SVGTests", base_config_1.TYPE],
			["SVGTextContentElement", base_config_1.TYPE_VALUE],
			["SVGTextElement", base_config_1.TYPE_VALUE],
			["SVGTextPathElement", base_config_1.TYPE_VALUE],
			["SVGTextPositioningElement", base_config_1.TYPE_VALUE],
			["SVGTitleElement", base_config_1.TYPE_VALUE],
			["SVGTransform", base_config_1.TYPE_VALUE],
			["SVGTransformList", base_config_1.TYPE_VALUE],
			["SVGURIReference", base_config_1.TYPE],
			["SVGUnitTypes", base_config_1.TYPE_VALUE],
			["SVGUseElement", base_config_1.TYPE_VALUE],
			["SVGViewElement", base_config_1.TYPE_VALUE],
			["Screen", base_config_1.TYPE_VALUE],
			["ScreenOrientationEventMap", base_config_1.TYPE],
			["ScreenOrientation", base_config_1.TYPE_VALUE],
			["ScriptProcessorNodeEventMap", base_config_1.TYPE],
			["ScriptProcessorNode", base_config_1.TYPE_VALUE],
			["SecurityPolicyViolationEvent", base_config_1.TYPE_VALUE],
			["Selection", base_config_1.TYPE_VALUE],
			["ServiceWorkerEventMap", base_config_1.TYPE],
			["ServiceWorker", base_config_1.TYPE_VALUE],
			["ServiceWorkerContainerEventMap", base_config_1.TYPE],
			["ServiceWorkerContainer", base_config_1.TYPE_VALUE],
			["ServiceWorkerRegistrationEventMap", base_config_1.TYPE],
			["ServiceWorkerRegistration", base_config_1.TYPE_VALUE],
			["ShadowRootEventMap", base_config_1.TYPE],
			["ShadowRoot", base_config_1.TYPE_VALUE],
			["SharedWorker", base_config_1.TYPE_VALUE],
			["Slottable", base_config_1.TYPE],
			["SourceBufferEventMap", base_config_1.TYPE],
			["SourceBuffer", base_config_1.TYPE_VALUE],
			["SourceBufferListEventMap", base_config_1.TYPE],
			["SourceBufferList", base_config_1.TYPE_VALUE],
			["SpeechRecognitionAlternative", base_config_1.TYPE_VALUE],
			["SpeechRecognitionResult", base_config_1.TYPE_VALUE],
			["SpeechRecognitionResultList", base_config_1.TYPE_VALUE],
			["SpeechSynthesisEventMap", base_config_1.TYPE],
			["SpeechSynthesis", base_config_1.TYPE_VALUE],
			["SpeechSynthesisErrorEvent", base_config_1.TYPE_VALUE],
			["SpeechSynthesisEvent", base_config_1.TYPE_VALUE],
			["SpeechSynthesisUtteranceEventMap", base_config_1.TYPE],
			["SpeechSynthesisUtterance", base_config_1.TYPE_VALUE],
			["SpeechSynthesisVoice", base_config_1.TYPE_VALUE],
			["StaticRange", base_config_1.TYPE_VALUE],
			["StereoPannerNode", base_config_1.TYPE_VALUE],
			["Storage", base_config_1.TYPE_VALUE],
			["StorageEvent", base_config_1.TYPE_VALUE],
			["StorageManager", base_config_1.TYPE_VALUE],
			["StyleMedia", base_config_1.TYPE],
			["StylePropertyMap", base_config_1.TYPE_VALUE],
			["StylePropertyMapReadOnly", base_config_1.TYPE_VALUE],
			["StyleSheet", base_config_1.TYPE_VALUE],
			["StyleSheetList", base_config_1.TYPE_VALUE],
			["SubmitEvent", base_config_1.TYPE_VALUE],
			["SubtleCrypto", base_config_1.TYPE_VALUE],
			["Text", base_config_1.TYPE_VALUE],
			["TextDecoder", base_config_1.TYPE_VALUE],
			["TextDecoderCommon", base_config_1.TYPE],
			["TextDecoderStream", base_config_1.TYPE_VALUE],
			["TextEncoder", base_config_1.TYPE_VALUE],
			["TextEncoderCommon", base_config_1.TYPE],
			["TextEncoderStream", base_config_1.TYPE_VALUE],
			["TextEvent", base_config_1.TYPE_VALUE],
			["TextMetrics", base_config_1.TYPE_VALUE],
			["TextTrackEventMap", base_config_1.TYPE],
			["TextTrack", base_config_1.TYPE_VALUE],
			["TextTrackCueEventMap", base_config_1.TYPE],
			["TextTrackCue", base_config_1.TYPE_VALUE],
			["TextTrackCueList", base_config_1.TYPE_VALUE],
			["TextTrackListEventMap", base_config_1.TYPE],
			["TextTrackList", base_config_1.TYPE_VALUE],
			["TimeRanges", base_config_1.TYPE_VALUE],
			["ToggleEvent", base_config_1.TYPE_VALUE],
			["Touch", base_config_1.TYPE_VALUE],
			["TouchEvent", base_config_1.TYPE_VALUE],
			["TouchList", base_config_1.TYPE_VALUE],
			["TrackEvent", base_config_1.TYPE_VALUE],
			["TransformStream", base_config_1.TYPE_VALUE],
			["TransformStreamDefaultController", base_config_1.TYPE_VALUE],
			["TransitionEvent", base_config_1.TYPE_VALUE],
			["TreeWalker", base_config_1.TYPE_VALUE],
			["UIEvent", base_config_1.TYPE_VALUE],
			["URL", base_config_1.TYPE_VALUE],
			["webkitURL", base_config_1.TYPE_VALUE],
			["URLSearchParams", base_config_1.TYPE_VALUE],
			["UserActivation", base_config_1.TYPE_VALUE],
			["VTTCue", base_config_1.TYPE_VALUE],
			["VTTRegion", base_config_1.TYPE_VALUE],
			["ValidityState", base_config_1.TYPE_VALUE],
			["VideoColorSpace", base_config_1.TYPE_VALUE],
			["VideoDecoderEventMap", base_config_1.TYPE],
			["VideoDecoder", base_config_1.TYPE_VALUE],
			["VideoEncoderEventMap", base_config_1.TYPE],
			["VideoEncoder", base_config_1.TYPE_VALUE],
			["VideoFrame", base_config_1.TYPE_VALUE],
			["VideoPlaybackQuality", base_config_1.TYPE_VALUE],
			["ViewTransition", base_config_1.TYPE_VALUE],
			["ViewTransitionTypeSet", base_config_1.TYPE_VALUE],
			["VisualViewportEventMap", base_config_1.TYPE],
			["VisualViewport", base_config_1.TYPE_VALUE],
			["WEBGL_color_buffer_float", base_config_1.TYPE],
			["WEBGL_compressed_texture_astc", base_config_1.TYPE],
			["WEBGL_compressed_texture_etc", base_config_1.TYPE],
			["WEBGL_compressed_texture_etc1", base_config_1.TYPE],
			["WEBGL_compressed_texture_pvrtc", base_config_1.TYPE],
			["WEBGL_compressed_texture_s3tc", base_config_1.TYPE],
			["WEBGL_compressed_texture_s3tc_srgb", base_config_1.TYPE],
			["WEBGL_debug_renderer_info", base_config_1.TYPE],
			["WEBGL_debug_shaders", base_config_1.TYPE],
			["WEBGL_depth_texture", base_config_1.TYPE],
			["WEBGL_draw_buffers", base_config_1.TYPE],
			["WEBGL_lose_context", base_config_1.TYPE],
			["WEBGL_multi_draw", base_config_1.TYPE],
			["WakeLock", base_config_1.TYPE_VALUE],
			["WakeLockSentinelEventMap", base_config_1.TYPE],
			["WakeLockSentinel", base_config_1.TYPE_VALUE],
			["WaveShaperNode", base_config_1.TYPE_VALUE],
			["WebGL2RenderingContext", base_config_1.TYPE_VALUE],
			["WebGL2RenderingContextBase", base_config_1.TYPE],
			["WebGL2RenderingContextOverloads", base_config_1.TYPE],
			["WebGLActiveInfo", base_config_1.TYPE_VALUE],
			["WebGLBuffer", base_config_1.TYPE_VALUE],
			["WebGLContextEvent", base_config_1.TYPE_VALUE],
			["WebGLFramebuffer", base_config_1.TYPE_VALUE],
			["WebGLProgram", base_config_1.TYPE_VALUE],
			["WebGLQuery", base_config_1.TYPE_VALUE],
			["WebGLRenderbuffer", base_config_1.TYPE_VALUE],
			["WebGLRenderingContext", base_config_1.TYPE_VALUE],
			["WebGLRenderingContextBase", base_config_1.TYPE],
			["WebGLRenderingContextOverloads", base_config_1.TYPE],
			["WebGLSampler", base_config_1.TYPE_VALUE],
			["WebGLShader", base_config_1.TYPE_VALUE],
			["WebGLShaderPrecisionFormat", base_config_1.TYPE_VALUE],
			["WebGLSync", base_config_1.TYPE_VALUE],
			["WebGLTexture", base_config_1.TYPE_VALUE],
			["WebGLTransformFeedback", base_config_1.TYPE_VALUE],
			["WebGLUniformLocation", base_config_1.TYPE_VALUE],
			["WebGLVertexArrayObject", base_config_1.TYPE_VALUE],
			["WebGLVertexArrayObjectOES", base_config_1.TYPE],
			["WebSocketEventMap", base_config_1.TYPE],
			["WebSocket", base_config_1.TYPE_VALUE],
			["WebTransport", base_config_1.TYPE_VALUE],
			["WebTransportBidirectionalStream", base_config_1.TYPE_VALUE],
			["WebTransportDatagramDuplexStream", base_config_1.TYPE_VALUE],
			["WebTransportError", base_config_1.TYPE_VALUE],
			["WheelEvent", base_config_1.TYPE_VALUE],
			["WindowEventMap", base_config_1.TYPE],
			["Window", base_config_1.TYPE_VALUE],
			["WindowEventHandlersEventMap", base_config_1.TYPE],
			["WindowEventHandlers", base_config_1.TYPE],
			["WindowLocalStorage", base_config_1.TYPE],
			["WindowOrWorkerGlobalScope", base_config_1.TYPE],
			["WindowSessionStorage", base_config_1.TYPE],
			["WorkerEventMap", base_config_1.TYPE],
			["Worker", base_config_1.TYPE_VALUE],
			["Worklet", base_config_1.TYPE_VALUE],
			["WritableStream", base_config_1.TYPE_VALUE],
			["WritableStreamDefaultController", base_config_1.TYPE_VALUE],
			["WritableStreamDefaultWriter", base_config_1.TYPE_VALUE],
			["XMLDocument", base_config_1.TYPE_VALUE],
			["XMLHttpRequestEventMap", base_config_1.TYPE],
			["XMLHttpRequest", base_config_1.TYPE_VALUE],
			["XMLHttpRequestEventTargetEventMap", base_config_1.TYPE],
			["XMLHttpRequestEventTarget", base_config_1.TYPE_VALUE],
			["XMLHttpRequestUpload", base_config_1.TYPE_VALUE],
			["XMLSerializer", base_config_1.TYPE_VALUE],
			["XPathEvaluator", base_config_1.TYPE_VALUE],
			["XPathEvaluatorBase", base_config_1.TYPE],
			["XPathExpression", base_config_1.TYPE_VALUE],
			["XPathResult", base_config_1.TYPE_VALUE],
			["XSLTProcessor", base_config_1.TYPE_VALUE],
			["CSS", base_config_1.TYPE_VALUE],
			["WebAssembly", base_config_1.TYPE_VALUE],
			["Console", base_config_1.TYPE],
			["AudioDataOutputCallback", base_config_1.TYPE],
			["BlobCallback", base_config_1.TYPE],
			["CustomElementConstructor", base_config_1.TYPE],
			["DecodeErrorCallback", base_config_1.TYPE],
			["DecodeSuccessCallback", base_config_1.TYPE],
			["EncodedAudioChunkOutputCallback", base_config_1.TYPE],
			["EncodedVideoChunkOutputCallback", base_config_1.TYPE],
			["ErrorCallback", base_config_1.TYPE],
			["FileCallback", base_config_1.TYPE],
			["FileSystemEntriesCallback", base_config_1.TYPE],
			["FileSystemEntryCallback", base_config_1.TYPE],
			["FrameRequestCallback", base_config_1.TYPE],
			["FunctionStringCallback", base_config_1.TYPE],
			["IdleRequestCallback", base_config_1.TYPE],
			["IntersectionObserverCallback", base_config_1.TYPE],
			["LockGrantedCallback", base_config_1.TYPE],
			["MediaSessionActionHandler", base_config_1.TYPE],
			["MutationCallback", base_config_1.TYPE],
			["NotificationPermissionCallback", base_config_1.TYPE],
			["OnBeforeUnloadEventHandlerNonNull", base_config_1.TYPE],
			["OnErrorEventHandlerNonNull", base_config_1.TYPE],
			["PerformanceObserverCallback", base_config_1.TYPE],
			["PositionCallback", base_config_1.TYPE],
			["PositionErrorCallback", base_config_1.TYPE],
			["QueuingStrategySize", base_config_1.TYPE],
			["RTCPeerConnectionErrorCallback", base_config_1.TYPE],
			["RTCSessionDescriptionCallback", base_config_1.TYPE],
			["RemotePlaybackAvailabilityCallback", base_config_1.TYPE],
			["ReportingObserverCallback", base_config_1.TYPE],
			["ResizeObserverCallback", base_config_1.TYPE],
			["TransformerFlushCallback", base_config_1.TYPE],
			["TransformerStartCallback", base_config_1.TYPE],
			["TransformerTransformCallback", base_config_1.TYPE],
			["UnderlyingSinkAbortCallback", base_config_1.TYPE],
			["UnderlyingSinkCloseCallback", base_config_1.TYPE],
			["UnderlyingSinkStartCallback", base_config_1.TYPE],
			["UnderlyingSinkWriteCallback", base_config_1.TYPE],
			["UnderlyingSourceCancelCallback", base_config_1.TYPE],
			["UnderlyingSourcePullCallback", base_config_1.TYPE],
			["UnderlyingSourceStartCallback", base_config_1.TYPE],
			["VideoFrameOutputCallback", base_config_1.TYPE],
			["VideoFrameRequestCallback", base_config_1.TYPE],
			["ViewTransitionUpdateCallback", base_config_1.TYPE],
			["VoidFunction", base_config_1.TYPE],
			["WebCodecsErrorCallback", base_config_1.TYPE],
			["HTMLElementTagNameMap", base_config_1.TYPE],
			["HTMLElementDeprecatedTagNameMap", base_config_1.TYPE],
			["SVGElementTagNameMap", base_config_1.TYPE],
			["MathMLElementTagNameMap", base_config_1.TYPE],
			["ElementTagNameMap", base_config_1.TYPE],
			["AlgorithmIdentifier", base_config_1.TYPE],
			["AllowSharedBufferSource", base_config_1.TYPE],
			["AutoFill", base_config_1.TYPE],
			["AutoFillField", base_config_1.TYPE],
			["AutoFillSection", base_config_1.TYPE],
			["Base64URLString", base_config_1.TYPE],
			["BigInteger", base_config_1.TYPE],
			["BlobPart", base_config_1.TYPE],
			["BodyInit", base_config_1.TYPE],
			["BufferSource", base_config_1.TYPE],
			["COSEAlgorithmIdentifier", base_config_1.TYPE],
			["CSSKeywordish", base_config_1.TYPE],
			["CSSNumberish", base_config_1.TYPE],
			["CSSPerspectiveValue", base_config_1.TYPE],
			["CSSUnparsedSegment", base_config_1.TYPE],
			["CanvasImageSource", base_config_1.TYPE],
			["ClipboardItemData", base_config_1.TYPE],
			["ClipboardItems", base_config_1.TYPE],
			["ConstrainBoolean", base_config_1.TYPE],
			["ConstrainDOMString", base_config_1.TYPE],
			["ConstrainDouble", base_config_1.TYPE],
			["ConstrainULong", base_config_1.TYPE],
			["CookieList", base_config_1.TYPE],
			["DOMHighResTimeStamp", base_config_1.TYPE],
			["EpochTimeStamp", base_config_1.TYPE],
			["EventListenerOrEventListenerObject", base_config_1.TYPE],
			["FileSystemWriteChunkType", base_config_1.TYPE],
			["Float32List", base_config_1.TYPE],
			["FormDataEntryValue", base_config_1.TYPE],
			["GLbitfield", base_config_1.TYPE],
			["GLboolean", base_config_1.TYPE],
			["GLclampf", base_config_1.TYPE],
			["GLenum", base_config_1.TYPE],
			["GLfloat", base_config_1.TYPE],
			["GLint", base_config_1.TYPE],
			["GLint64", base_config_1.TYPE],
			["GLintptr", base_config_1.TYPE],
			["GLsizei", base_config_1.TYPE],
			["GLsizeiptr", base_config_1.TYPE],
			["GLuint", base_config_1.TYPE],
			["GLuint64", base_config_1.TYPE],
			["HTMLOrSVGImageElement", base_config_1.TYPE],
			["HTMLOrSVGScriptElement", base_config_1.TYPE],
			["HashAlgorithmIdentifier", base_config_1.TYPE],
			["HeadersInit", base_config_1.TYPE],
			["IDBValidKey", base_config_1.TYPE],
			["ImageBitmapSource", base_config_1.TYPE],
			["ImageBufferSource", base_config_1.TYPE],
			["ImageDataArray", base_config_1.TYPE],
			["Int32List", base_config_1.TYPE],
			["LineAndPositionSetting", base_config_1.TYPE],
			["MediaProvider", base_config_1.TYPE],
			["MessageEventSource", base_config_1.TYPE],
			["MutationRecordType", base_config_1.TYPE],
			["NamedCurve", base_config_1.TYPE],
			["OffscreenRenderingContext", base_config_1.TYPE],
			["OnBeforeUnloadEventHandler", base_config_1.TYPE],
			["OnErrorEventHandler", base_config_1.TYPE],
			["OptionalPostfixToken", base_config_1.TYPE],
			["OptionalPrefixToken", base_config_1.TYPE],
			["PerformanceEntryList", base_config_1.TYPE],
			["PublicKeyCredentialClientCapabilities", base_config_1.TYPE],
			["PublicKeyCredentialJSON", base_config_1.TYPE],
			["RTCRtpTransform", base_config_1.TYPE],
			["ReadableStreamController", base_config_1.TYPE],
			["ReadableStreamReadResult", base_config_1.TYPE],
			["ReadableStreamReader", base_config_1.TYPE],
			["RenderingContext", base_config_1.TYPE],
			["ReportList", base_config_1.TYPE],
			["RequestInfo", base_config_1.TYPE],
			["TexImageSource", base_config_1.TYPE],
			["TimerHandler", base_config_1.TYPE],
			["Transferable", base_config_1.TYPE],
			["Uint32List", base_config_1.TYPE],
			["VibratePattern", base_config_1.TYPE],
			["WindowProxy", base_config_1.TYPE],
			["XMLHttpRequestBodyInit", base_config_1.TYPE],
			["AlignSetting", base_config_1.TYPE],
			["AlphaOption", base_config_1.TYPE],
			["AnimationPlayState", base_config_1.TYPE],
			["AnimationReplaceState", base_config_1.TYPE],
			["AppendMode", base_config_1.TYPE],
			["AttestationConveyancePreference", base_config_1.TYPE],
			["AudioContextLatencyCategory", base_config_1.TYPE],
			["AudioContextState", base_config_1.TYPE],
			["AudioSampleFormat", base_config_1.TYPE],
			["AuthenticatorAttachment", base_config_1.TYPE],
			["AuthenticatorTransport", base_config_1.TYPE],
			["AutoFillAddressKind", base_config_1.TYPE],
			["AutoFillBase", base_config_1.TYPE],
			["AutoFillContactField", base_config_1.TYPE],
			["AutoFillContactKind", base_config_1.TYPE],
			["AutoFillCredentialField", base_config_1.TYPE],
			["AutoFillNormalField", base_config_1.TYPE],
			["AutoKeyword", base_config_1.TYPE],
			["AutomationRate", base_config_1.TYPE],
			["AvcBitstreamFormat", base_config_1.TYPE],
			["BinaryType", base_config_1.TYPE],
			["BiquadFilterType", base_config_1.TYPE],
			["BitrateMode", base_config_1.TYPE],
			["CSSMathOperator", base_config_1.TYPE],
			["CSSNumericBaseType", base_config_1.TYPE],
			["CanPlayTypeResult", base_config_1.TYPE],
			["CanvasDirection", base_config_1.TYPE],
			["CanvasFillRule", base_config_1.TYPE],
			["CanvasFontKerning", base_config_1.TYPE],
			["CanvasFontStretch", base_config_1.TYPE],
			["CanvasFontVariantCaps", base_config_1.TYPE],
			["CanvasLineCap", base_config_1.TYPE],
			["CanvasLineJoin", base_config_1.TYPE],
			["CanvasTextAlign", base_config_1.TYPE],
			["CanvasTextBaseline", base_config_1.TYPE],
			["CanvasTextRendering", base_config_1.TYPE],
			["ChannelCountMode", base_config_1.TYPE],
			["ChannelInterpretation", base_config_1.TYPE],
			["ClientTypes", base_config_1.TYPE],
			["CodecState", base_config_1.TYPE],
			["ColorGamut", base_config_1.TYPE],
			["ColorSpaceConversion", base_config_1.TYPE],
			["CompositeOperation", base_config_1.TYPE],
			["CompositeOperationOrAuto", base_config_1.TYPE],
			["CompressionFormat", base_config_1.TYPE],
			["CookieSameSite", base_config_1.TYPE],
			["CredentialMediationRequirement", base_config_1.TYPE],
			["DOMParserSupportedType", base_config_1.TYPE],
			["DirectionSetting", base_config_1.TYPE],
			["DisplayCaptureSurfaceType", base_config_1.TYPE],
			["DistanceModelType", base_config_1.TYPE],
			["DocumentReadyState", base_config_1.TYPE],
			["DocumentVisibilityState", base_config_1.TYPE],
			["EncodedAudioChunkType", base_config_1.TYPE],
			["EncodedVideoChunkType", base_config_1.TYPE],
			["EndOfStreamError", base_config_1.TYPE],
			["EndingType", base_config_1.TYPE],
			["FileSystemHandleKind", base_config_1.TYPE],
			["FillLightMode", base_config_1.TYPE],
			["FillMode", base_config_1.TYPE],
			["FontDisplay", base_config_1.TYPE],
			["FontFaceLoadStatus", base_config_1.TYPE],
			["FontFaceSetLoadStatus", base_config_1.TYPE],
			["FullscreenNavigationUI", base_config_1.TYPE],
			["GamepadHapticEffectType", base_config_1.TYPE],
			["GamepadHapticsResult", base_config_1.TYPE],
			["GamepadMappingType", base_config_1.TYPE],
			["GlobalCompositeOperation", base_config_1.TYPE],
			["HardwareAcceleration", base_config_1.TYPE],
			["HdrMetadataType", base_config_1.TYPE],
			["HighlightType", base_config_1.TYPE],
			["IDBCursorDirection", base_config_1.TYPE],
			["IDBRequestReadyState", base_config_1.TYPE],
			["IDBTransactionDurability", base_config_1.TYPE],
			["IDBTransactionMode", base_config_1.TYPE],
			["ImageOrientation", base_config_1.TYPE],
			["ImageSmoothingQuality", base_config_1.TYPE],
			["InsertPosition", base_config_1.TYPE],
			["IterationCompositeOperation", base_config_1.TYPE],
			["KeyFormat", base_config_1.TYPE],
			["KeyType", base_config_1.TYPE],
			["KeyUsage", base_config_1.TYPE],
			["LatencyMode", base_config_1.TYPE],
			["LineAlignSetting", base_config_1.TYPE],
			["LockMode", base_config_1.TYPE],
			["LoginStatus", base_config_1.TYPE],
			["MIDIPortConnectionState", base_config_1.TYPE],
			["MIDIPortDeviceState", base_config_1.TYPE],
			["MIDIPortType", base_config_1.TYPE],
			["MediaDecodingType", base_config_1.TYPE],
			["MediaDeviceKind", base_config_1.TYPE],
			["MediaEncodingType", base_config_1.TYPE],
			["MediaKeyMessageType", base_config_1.TYPE],
			["MediaKeySessionClosedReason", base_config_1.TYPE],
			["MediaKeySessionType", base_config_1.TYPE],
			["MediaKeyStatus", base_config_1.TYPE],
			["MediaKeysRequirement", base_config_1.TYPE],
			["MediaSessionAction", base_config_1.TYPE],
			["MediaSessionPlaybackState", base_config_1.TYPE],
			["MediaStreamTrackState", base_config_1.TYPE],
			["NavigationTimingType", base_config_1.TYPE],
			["NavigationType", base_config_1.TYPE],
			["NotificationDirection", base_config_1.TYPE],
			["NotificationPermission", base_config_1.TYPE],
			["OffscreenRenderingContextId", base_config_1.TYPE],
			["OpusBitstreamFormat", base_config_1.TYPE],
			["OrientationType", base_config_1.TYPE],
			["OscillatorType", base_config_1.TYPE],
			["OverSampleType", base_config_1.TYPE],
			["PanningModelType", base_config_1.TYPE],
			["PaymentComplete", base_config_1.TYPE],
			["PaymentShippingType", base_config_1.TYPE],
			["PermissionName", base_config_1.TYPE],
			["PermissionState", base_config_1.TYPE],
			["PlaybackDirection", base_config_1.TYPE],
			["PositionAlignSetting", base_config_1.TYPE],
			["PredefinedColorSpace", base_config_1.TYPE],
			["PremultiplyAlpha", base_config_1.TYPE],
			["PresentationStyle", base_config_1.TYPE],
			["PublicKeyCredentialType", base_config_1.TYPE],
			["PushEncryptionKeyName", base_config_1.TYPE],
			["RTCBundlePolicy", base_config_1.TYPE],
			["RTCDataChannelState", base_config_1.TYPE],
			["RTCDegradationPreference", base_config_1.TYPE],
			["RTCDtlsRole", base_config_1.TYPE],
			["RTCDtlsTransportState", base_config_1.TYPE],
			["RTCEncodedVideoFrameType", base_config_1.TYPE],
			["RTCErrorDetailType", base_config_1.TYPE],
			["RTCIceCandidateType", base_config_1.TYPE],
			["RTCIceComponent", base_config_1.TYPE],
			["RTCIceConnectionState", base_config_1.TYPE],
			["RTCIceGathererState", base_config_1.TYPE],
			["RTCIceGatheringState", base_config_1.TYPE],
			["RTCIceProtocol", base_config_1.TYPE],
			["RTCIceRole", base_config_1.TYPE],
			["RTCIceTcpCandidateType", base_config_1.TYPE],
			["RTCIceTransportPolicy", base_config_1.TYPE],
			["RTCIceTransportState", base_config_1.TYPE],
			["RTCPeerConnectionState", base_config_1.TYPE],
			["RTCPriorityType", base_config_1.TYPE],
			["RTCQualityLimitationReason", base_config_1.TYPE],
			["RTCRtcpMuxPolicy", base_config_1.TYPE],
			["RTCRtpTransceiverDirection", base_config_1.TYPE],
			["RTCSctpTransportState", base_config_1.TYPE],
			["RTCSdpType", base_config_1.TYPE],
			["RTCSignalingState", base_config_1.TYPE],
			["RTCStatsIceCandidatePairState", base_config_1.TYPE],
			["RTCStatsType", base_config_1.TYPE],
			["ReadableStreamReaderMode", base_config_1.TYPE],
			["ReadableStreamType", base_config_1.TYPE],
			["ReadyState", base_config_1.TYPE],
			["RecordingState", base_config_1.TYPE],
			["RedEyeReduction", base_config_1.TYPE],
			["ReferrerPolicy", base_config_1.TYPE],
			["RemotePlaybackState", base_config_1.TYPE],
			["RequestCache", base_config_1.TYPE],
			["RequestCredentials", base_config_1.TYPE],
			["RequestDestination", base_config_1.TYPE],
			["RequestMode", base_config_1.TYPE],
			["RequestPriority", base_config_1.TYPE],
			["RequestRedirect", base_config_1.TYPE],
			["ResidentKeyRequirement", base_config_1.TYPE],
			["ResizeObserverBoxOptions", base_config_1.TYPE],
			["ResizeQuality", base_config_1.TYPE],
			["ResponseType", base_config_1.TYPE],
			["ScrollBehavior", base_config_1.TYPE],
			["ScrollLogicalPosition", base_config_1.TYPE],
			["ScrollRestoration", base_config_1.TYPE],
			["ScrollSetting", base_config_1.TYPE],
			["SecurityPolicyViolationEventDisposition", base_config_1.TYPE],
			["SelectionMode", base_config_1.TYPE],
			["ServiceWorkerState", base_config_1.TYPE],
			["ServiceWorkerUpdateViaCache", base_config_1.TYPE],
			["ShadowRootMode", base_config_1.TYPE],
			["SlotAssignmentMode", base_config_1.TYPE],
			["SpeechSynthesisErrorCode", base_config_1.TYPE],
			["TextTrackKind", base_config_1.TYPE],
			["TextTrackMode", base_config_1.TYPE],
			["TouchType", base_config_1.TYPE],
			["TransferFunction", base_config_1.TYPE],
			["UserVerificationRequirement", base_config_1.TYPE],
			["VideoColorPrimaries", base_config_1.TYPE],
			["VideoEncoderBitrateMode", base_config_1.TYPE],
			["VideoFacingModeEnum", base_config_1.TYPE],
			["VideoMatrixCoefficients", base_config_1.TYPE],
			["VideoPixelFormat", base_config_1.TYPE],
			["VideoTransferCharacteristics", base_config_1.TYPE],
			["WakeLockType", base_config_1.TYPE],
			["WebGLPowerPreference", base_config_1.TYPE],
			["WebTransportCongestionControl", base_config_1.TYPE],
			["WebTransportErrorSource", base_config_1.TYPE],
			["WorkerType", base_config_1.TYPE],
			["WriteCommandType", base_config_1.TYPE],
			["XMLHttpRequestResponseType", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/dom.asynciterable.js
var require_dom_asynciterable = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.dom_asynciterable = void 0;
	const base_config_1 = require_base_config();
	exports.dom_asynciterable = {
		libs: [],
		variables: [
			["FileSystemDirectoryHandleAsyncIterator", base_config_1.TYPE],
			["FileSystemDirectoryHandle", base_config_1.TYPE],
			["ReadableStreamAsyncIterator", base_config_1.TYPE],
			["ReadableStream", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/dom.iterable.js
var require_dom_iterable = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.dom_iterable = void 0;
	const base_config_1 = require_base_config();
	exports.dom_iterable = {
		libs: [],
		variables: [
			["AudioParam", base_config_1.TYPE],
			["AudioParamMap", base_config_1.TYPE],
			["BaseAudioContext", base_config_1.TYPE],
			["CSSKeyframesRule", base_config_1.TYPE],
			["CSSNumericArray", base_config_1.TYPE],
			["CSSRuleList", base_config_1.TYPE],
			["CSSStyleDeclaration", base_config_1.TYPE],
			["CSSTransformValue", base_config_1.TYPE],
			["CSSUnparsedValue", base_config_1.TYPE],
			["Cache", base_config_1.TYPE],
			["CanvasPath", base_config_1.TYPE],
			["CanvasPathDrawingStyles", base_config_1.TYPE],
			["CookieStoreManager", base_config_1.TYPE],
			["CustomStateSet", base_config_1.TYPE],
			["DOMRectList", base_config_1.TYPE],
			["DOMStringList", base_config_1.TYPE],
			["DOMTokenList", base_config_1.TYPE],
			["DataTransferItemList", base_config_1.TYPE],
			["EventCounts", base_config_1.TYPE],
			["FileList", base_config_1.TYPE],
			["FontFaceSet", base_config_1.TYPE],
			["FormDataIterator", base_config_1.TYPE],
			["FormData", base_config_1.TYPE],
			["HTMLAllCollection", base_config_1.TYPE],
			["HTMLCollectionBase", base_config_1.TYPE],
			["HTMLCollectionOf", base_config_1.TYPE],
			["HTMLFormElement", base_config_1.TYPE],
			["HTMLSelectElement", base_config_1.TYPE],
			["HeadersIterator", base_config_1.TYPE],
			["Headers", base_config_1.TYPE],
			["Highlight", base_config_1.TYPE],
			["HighlightRegistry", base_config_1.TYPE],
			["IDBDatabase", base_config_1.TYPE],
			["IDBObjectStore", base_config_1.TYPE],
			["ImageTrackList", base_config_1.TYPE],
			["MIDIInputMap", base_config_1.TYPE],
			["MIDIOutput", base_config_1.TYPE],
			["MIDIOutputMap", base_config_1.TYPE],
			["MediaKeyStatusMapIterator", base_config_1.TYPE],
			["MediaKeyStatusMap", base_config_1.TYPE],
			["MediaList", base_config_1.TYPE],
			["MessageEvent", base_config_1.TYPE],
			["MimeTypeArray", base_config_1.TYPE],
			["NamedNodeMap", base_config_1.TYPE],
			["Navigator", base_config_1.TYPE],
			["NodeList", base_config_1.TYPE],
			["NodeListOf", base_config_1.TYPE],
			["Plugin", base_config_1.TYPE],
			["PluginArray", base_config_1.TYPE],
			["RTCRtpTransceiver", base_config_1.TYPE],
			["RTCStatsReport", base_config_1.TYPE],
			["SVGLengthList", base_config_1.TYPE],
			["SVGNumberList", base_config_1.TYPE],
			["SVGPointList", base_config_1.TYPE],
			["SVGStringList", base_config_1.TYPE],
			["SVGTransformList", base_config_1.TYPE],
			["SourceBufferList", base_config_1.TYPE],
			["SpeechRecognitionResult", base_config_1.TYPE],
			["SpeechRecognitionResultList", base_config_1.TYPE],
			["StylePropertyMapReadOnlyIterator", base_config_1.TYPE],
			["StylePropertyMapReadOnly", base_config_1.TYPE],
			["StyleSheetList", base_config_1.TYPE],
			["SubtleCrypto", base_config_1.TYPE],
			["TextTrackCueList", base_config_1.TYPE],
			["TextTrackList", base_config_1.TYPE],
			["TouchList", base_config_1.TYPE],
			["URLSearchParamsIterator", base_config_1.TYPE],
			["URLSearchParams", base_config_1.TYPE],
			["ViewTransitionTypeSet", base_config_1.TYPE],
			["WEBGL_draw_buffers", base_config_1.TYPE],
			["WEBGL_multi_draw", base_config_1.TYPE],
			["WebGL2RenderingContextBase", base_config_1.TYPE],
			["WebGL2RenderingContextOverloads", base_config_1.TYPE],
			["WebGLRenderingContextBase", base_config_1.TYPE],
			["WebGLRenderingContextOverloads", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es5.js
var require_es5 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es5 = void 0;
	const base_config_1 = require_base_config();
	const decorators_1 = require_decorators();
	const decorators_legacy_1 = require_decorators_legacy();
	exports.es5 = {
		libs: [decorators_1.decorators, decorators_legacy_1.decorators_legacy],
		variables: [
			["Symbol", base_config_1.TYPE],
			["PropertyKey", base_config_1.TYPE],
			["PropertyDescriptor", base_config_1.TYPE],
			["PropertyDescriptorMap", base_config_1.TYPE],
			["Object", base_config_1.TYPE_VALUE],
			["ObjectConstructor", base_config_1.TYPE],
			["Function", base_config_1.TYPE_VALUE],
			["FunctionConstructor", base_config_1.TYPE],
			["ThisParameterType", base_config_1.TYPE],
			["OmitThisParameter", base_config_1.TYPE],
			["CallableFunction", base_config_1.TYPE],
			["NewableFunction", base_config_1.TYPE],
			["IArguments", base_config_1.TYPE],
			["String", base_config_1.TYPE_VALUE],
			["StringConstructor", base_config_1.TYPE],
			["Boolean", base_config_1.TYPE_VALUE],
			["BooleanConstructor", base_config_1.TYPE],
			["Number", base_config_1.TYPE_VALUE],
			["NumberConstructor", base_config_1.TYPE],
			["TemplateStringsArray", base_config_1.TYPE],
			["ImportMeta", base_config_1.TYPE],
			["ImportCallOptions", base_config_1.TYPE],
			["ImportAssertions", base_config_1.TYPE],
			["ImportAttributes", base_config_1.TYPE],
			["Math", base_config_1.TYPE_VALUE],
			["Date", base_config_1.TYPE_VALUE],
			["DateConstructor", base_config_1.TYPE],
			["RegExpMatchArray", base_config_1.TYPE],
			["RegExpExecArray", base_config_1.TYPE],
			["RegExp", base_config_1.TYPE_VALUE],
			["RegExpConstructor", base_config_1.TYPE],
			["Error", base_config_1.TYPE_VALUE],
			["ErrorConstructor", base_config_1.TYPE],
			["EvalError", base_config_1.TYPE_VALUE],
			["EvalErrorConstructor", base_config_1.TYPE],
			["RangeError", base_config_1.TYPE_VALUE],
			["RangeErrorConstructor", base_config_1.TYPE],
			["ReferenceError", base_config_1.TYPE_VALUE],
			["ReferenceErrorConstructor", base_config_1.TYPE],
			["SyntaxError", base_config_1.TYPE_VALUE],
			["SyntaxErrorConstructor", base_config_1.TYPE],
			["TypeError", base_config_1.TYPE_VALUE],
			["TypeErrorConstructor", base_config_1.TYPE],
			["URIError", base_config_1.TYPE_VALUE],
			["URIErrorConstructor", base_config_1.TYPE],
			["JSON", base_config_1.TYPE_VALUE],
			["ReadonlyArray", base_config_1.TYPE],
			["ConcatArray", base_config_1.TYPE],
			["Array", base_config_1.TYPE_VALUE],
			["ArrayConstructor", base_config_1.TYPE],
			["TypedPropertyDescriptor", base_config_1.TYPE],
			["PromiseConstructorLike", base_config_1.TYPE],
			["PromiseLike", base_config_1.TYPE],
			["Promise", base_config_1.TYPE],
			["Awaited", base_config_1.TYPE],
			["ArrayLike", base_config_1.TYPE],
			["Partial", base_config_1.TYPE],
			["Required", base_config_1.TYPE],
			["Readonly", base_config_1.TYPE],
			["Pick", base_config_1.TYPE],
			["Record", base_config_1.TYPE],
			["Exclude", base_config_1.TYPE],
			["Extract", base_config_1.TYPE],
			["Omit", base_config_1.TYPE],
			["NonNullable", base_config_1.TYPE],
			["Parameters", base_config_1.TYPE],
			["ConstructorParameters", base_config_1.TYPE],
			["ReturnType", base_config_1.TYPE],
			["InstanceType", base_config_1.TYPE],
			["Uppercase", base_config_1.TYPE],
			["Lowercase", base_config_1.TYPE],
			["Capitalize", base_config_1.TYPE],
			["Uncapitalize", base_config_1.TYPE],
			["NoInfer", base_config_1.TYPE],
			["ThisType", base_config_1.TYPE],
			["WeakKeyTypes", base_config_1.TYPE],
			["WeakKey", base_config_1.TYPE],
			["ArrayBuffer", base_config_1.TYPE_VALUE],
			["ArrayBufferTypes", base_config_1.TYPE],
			["ArrayBufferLike", base_config_1.TYPE],
			["ArrayBufferConstructor", base_config_1.TYPE],
			["ArrayBufferView", base_config_1.TYPE],
			["DataView", base_config_1.TYPE_VALUE],
			["DataViewConstructor", base_config_1.TYPE],
			["Int8Array", base_config_1.TYPE_VALUE],
			["Int8ArrayConstructor", base_config_1.TYPE],
			["Uint8Array", base_config_1.TYPE_VALUE],
			["Uint8ArrayConstructor", base_config_1.TYPE],
			["Uint8ClampedArray", base_config_1.TYPE_VALUE],
			["Uint8ClampedArrayConstructor", base_config_1.TYPE],
			["Int16Array", base_config_1.TYPE_VALUE],
			["Int16ArrayConstructor", base_config_1.TYPE],
			["Uint16Array", base_config_1.TYPE_VALUE],
			["Uint16ArrayConstructor", base_config_1.TYPE],
			["Int32Array", base_config_1.TYPE_VALUE],
			["Int32ArrayConstructor", base_config_1.TYPE],
			["Uint32Array", base_config_1.TYPE_VALUE],
			["Uint32ArrayConstructor", base_config_1.TYPE],
			["Float32Array", base_config_1.TYPE_VALUE],
			["Float32ArrayConstructor", base_config_1.TYPE],
			["Float64Array", base_config_1.TYPE_VALUE],
			["Float64ArrayConstructor", base_config_1.TYPE],
			["Intl", base_config_1.TYPE_VALUE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2015.collection.js
var require_es2015_collection = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2015_collection = void 0;
	const base_config_1 = require_base_config();
	exports.es2015_collection = {
		libs: [],
		variables: [
			["Map", base_config_1.TYPE_VALUE],
			["MapConstructor", base_config_1.TYPE],
			["ReadonlyMap", base_config_1.TYPE],
			["WeakMap", base_config_1.TYPE_VALUE],
			["WeakMapConstructor", base_config_1.TYPE],
			["Set", base_config_1.TYPE_VALUE],
			["SetConstructor", base_config_1.TYPE],
			["ReadonlySet", base_config_1.TYPE],
			["WeakSet", base_config_1.TYPE_VALUE],
			["WeakSetConstructor", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2015.core.js
var require_es2015_core = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2015_core = void 0;
	const base_config_1 = require_base_config();
	exports.es2015_core = {
		libs: [],
		variables: [
			["Array", base_config_1.TYPE],
			["ArrayConstructor", base_config_1.TYPE],
			["DateConstructor", base_config_1.TYPE],
			["Function", base_config_1.TYPE],
			["Math", base_config_1.TYPE],
			["NumberConstructor", base_config_1.TYPE],
			["ObjectConstructor", base_config_1.TYPE],
			["ReadonlyArray", base_config_1.TYPE],
			["RegExp", base_config_1.TYPE],
			["RegExpConstructor", base_config_1.TYPE],
			["String", base_config_1.TYPE],
			["StringConstructor", base_config_1.TYPE],
			["Int8Array", base_config_1.TYPE],
			["Uint8Array", base_config_1.TYPE],
			["Uint8ClampedArray", base_config_1.TYPE],
			["Int16Array", base_config_1.TYPE],
			["Uint16Array", base_config_1.TYPE],
			["Int32Array", base_config_1.TYPE],
			["Uint32Array", base_config_1.TYPE],
			["Float32Array", base_config_1.TYPE],
			["Float64Array", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2015.symbol.js
var require_es2015_symbol = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2015_symbol = void 0;
	const base_config_1 = require_base_config();
	exports.es2015_symbol = {
		libs: [],
		variables: [["SymbolConstructor", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2015.iterable.js
var require_es2015_iterable = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2015_iterable = void 0;
	const base_config_1 = require_base_config();
	const es2015_symbol_1 = require_es2015_symbol();
	exports.es2015_iterable = {
		libs: [es2015_symbol_1.es2015_symbol],
		variables: [
			["SymbolConstructor", base_config_1.TYPE],
			["IteratorYieldResult", base_config_1.TYPE],
			["IteratorReturnResult", base_config_1.TYPE],
			["IteratorResult", base_config_1.TYPE],
			["Iterator", base_config_1.TYPE],
			["Iterable", base_config_1.TYPE],
			["IterableIterator", base_config_1.TYPE],
			["IteratorObject", base_config_1.TYPE],
			["BuiltinIteratorReturn", base_config_1.TYPE],
			["ArrayIterator", base_config_1.TYPE],
			["Array", base_config_1.TYPE],
			["ArrayConstructor", base_config_1.TYPE],
			["ReadonlyArray", base_config_1.TYPE],
			["IArguments", base_config_1.TYPE],
			["MapIterator", base_config_1.TYPE],
			["Map", base_config_1.TYPE],
			["ReadonlyMap", base_config_1.TYPE],
			["MapConstructor", base_config_1.TYPE],
			["WeakMap", base_config_1.TYPE],
			["WeakMapConstructor", base_config_1.TYPE],
			["SetIterator", base_config_1.TYPE],
			["Set", base_config_1.TYPE],
			["ReadonlySet", base_config_1.TYPE],
			["SetConstructor", base_config_1.TYPE],
			["WeakSet", base_config_1.TYPE],
			["WeakSetConstructor", base_config_1.TYPE],
			["Promise", base_config_1.TYPE],
			["PromiseConstructor", base_config_1.TYPE],
			["StringIterator", base_config_1.TYPE],
			["String", base_config_1.TYPE],
			["Int8Array", base_config_1.TYPE],
			["Int8ArrayConstructor", base_config_1.TYPE],
			["Uint8Array", base_config_1.TYPE],
			["Uint8ArrayConstructor", base_config_1.TYPE],
			["Uint8ClampedArray", base_config_1.TYPE],
			["Uint8ClampedArrayConstructor", base_config_1.TYPE],
			["Int16Array", base_config_1.TYPE],
			["Int16ArrayConstructor", base_config_1.TYPE],
			["Uint16Array", base_config_1.TYPE],
			["Uint16ArrayConstructor", base_config_1.TYPE],
			["Int32Array", base_config_1.TYPE],
			["Int32ArrayConstructor", base_config_1.TYPE],
			["Uint32Array", base_config_1.TYPE],
			["Uint32ArrayConstructor", base_config_1.TYPE],
			["Float32Array", base_config_1.TYPE],
			["Float32ArrayConstructor", base_config_1.TYPE],
			["Float64Array", base_config_1.TYPE],
			["Float64ArrayConstructor", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2015.generator.js
var require_es2015_generator = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2015_generator = void 0;
	const base_config_1 = require_base_config();
	const es2015_iterable_1 = require_es2015_iterable();
	exports.es2015_generator = {
		libs: [es2015_iterable_1.es2015_iterable],
		variables: [
			["Generator", base_config_1.TYPE],
			["GeneratorFunction", base_config_1.TYPE],
			["GeneratorFunctionConstructor", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2015.promise.js
var require_es2015_promise = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2015_promise = void 0;
	const base_config_1 = require_base_config();
	exports.es2015_promise = {
		libs: [],
		variables: [["PromiseConstructor", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2015.proxy.js
var require_es2015_proxy = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2015_proxy = void 0;
	const base_config_1 = require_base_config();
	exports.es2015_proxy = {
		libs: [],
		variables: [["ProxyHandler", base_config_1.TYPE], ["ProxyConstructor", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2015.reflect.js
var require_es2015_reflect = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2015_reflect = void 0;
	const base_config_1 = require_base_config();
	exports.es2015_reflect = {
		libs: [],
		variables: [["Reflect", base_config_1.TYPE_VALUE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2015.symbol.wellknown.js
var require_es2015_symbol_wellknown = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2015_symbol_wellknown = void 0;
	const base_config_1 = require_base_config();
	const es2015_symbol_1 = require_es2015_symbol();
	exports.es2015_symbol_wellknown = {
		libs: [es2015_symbol_1.es2015_symbol],
		variables: [
			["SymbolConstructor", base_config_1.TYPE],
			["Symbol", base_config_1.TYPE],
			["Array", base_config_1.TYPE],
			["ReadonlyArray", base_config_1.TYPE],
			["Date", base_config_1.TYPE],
			["Map", base_config_1.TYPE],
			["WeakMap", base_config_1.TYPE],
			["Set", base_config_1.TYPE],
			["WeakSet", base_config_1.TYPE],
			["JSON", base_config_1.TYPE],
			["Function", base_config_1.TYPE],
			["GeneratorFunction", base_config_1.TYPE],
			["Math", base_config_1.TYPE],
			["Promise", base_config_1.TYPE],
			["PromiseConstructor", base_config_1.TYPE],
			["RegExp", base_config_1.TYPE],
			["RegExpConstructor", base_config_1.TYPE],
			["String", base_config_1.TYPE],
			["ArrayBuffer", base_config_1.TYPE],
			["DataView", base_config_1.TYPE],
			["Int8Array", base_config_1.TYPE],
			["Uint8Array", base_config_1.TYPE],
			["Uint8ClampedArray", base_config_1.TYPE],
			["Int16Array", base_config_1.TYPE],
			["Uint16Array", base_config_1.TYPE],
			["Int32Array", base_config_1.TYPE],
			["Uint32Array", base_config_1.TYPE],
			["Float32Array", base_config_1.TYPE],
			["Float64Array", base_config_1.TYPE],
			["ArrayConstructor", base_config_1.TYPE],
			["MapConstructor", base_config_1.TYPE],
			["SetConstructor", base_config_1.TYPE],
			["ArrayBufferConstructor", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es6.js
var require_es6 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es6 = void 0;
	const es5_1 = require_es5();
	const es2015_collection_1 = require_es2015_collection();
	const es2015_core_1 = require_es2015_core();
	const es2015_generator_1 = require_es2015_generator();
	const es2015_iterable_1 = require_es2015_iterable();
	const es2015_promise_1 = require_es2015_promise();
	const es2015_proxy_1 = require_es2015_proxy();
	const es2015_reflect_1 = require_es2015_reflect();
	const es2015_symbol_1 = require_es2015_symbol();
	const es2015_symbol_wellknown_1 = require_es2015_symbol_wellknown();
	exports.es6 = {
		libs: [
			es5_1.es5,
			es2015_core_1.es2015_core,
			es2015_collection_1.es2015_collection,
			es2015_iterable_1.es2015_iterable,
			es2015_generator_1.es2015_generator,
			es2015_promise_1.es2015_promise,
			es2015_proxy_1.es2015_proxy,
			es2015_reflect_1.es2015_reflect,
			es2015_symbol_1.es2015_symbol,
			es2015_symbol_wellknown_1.es2015_symbol_wellknown
		],
		variables: []
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2015.js
var require_es2015 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2015 = void 0;
	const es5_1 = require_es5();
	const es2015_collection_1 = require_es2015_collection();
	const es2015_core_1 = require_es2015_core();
	const es2015_generator_1 = require_es2015_generator();
	const es2015_iterable_1 = require_es2015_iterable();
	const es2015_promise_1 = require_es2015_promise();
	const es2015_proxy_1 = require_es2015_proxy();
	const es2015_reflect_1 = require_es2015_reflect();
	const es2015_symbol_1 = require_es2015_symbol();
	const es2015_symbol_wellknown_1 = require_es2015_symbol_wellknown();
	exports.es2015 = {
		libs: [
			es5_1.es5,
			es2015_core_1.es2015_core,
			es2015_collection_1.es2015_collection,
			es2015_iterable_1.es2015_iterable,
			es2015_generator_1.es2015_generator,
			es2015_promise_1.es2015_promise,
			es2015_proxy_1.es2015_proxy,
			es2015_reflect_1.es2015_reflect,
			es2015_symbol_1.es2015_symbol,
			es2015_symbol_wellknown_1.es2015_symbol_wellknown
		],
		variables: []
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2016.array.include.js
var require_es2016_array_include = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2016_array_include = void 0;
	const base_config_1 = require_base_config();
	exports.es2016_array_include = {
		libs: [],
		variables: [
			["Array", base_config_1.TYPE],
			["ReadonlyArray", base_config_1.TYPE],
			["Int8Array", base_config_1.TYPE],
			["Uint8Array", base_config_1.TYPE],
			["Uint8ClampedArray", base_config_1.TYPE],
			["Int16Array", base_config_1.TYPE],
			["Uint16Array", base_config_1.TYPE],
			["Int32Array", base_config_1.TYPE],
			["Uint32Array", base_config_1.TYPE],
			["Float32Array", base_config_1.TYPE],
			["Float64Array", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2016.intl.js
var require_es2016_intl = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2016_intl = void 0;
	const base_config_1 = require_base_config();
	exports.es2016_intl = {
		libs: [],
		variables: [["Intl", base_config_1.TYPE_VALUE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es7.js
var require_es7 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es7 = void 0;
	const es2015_1 = require_es2015();
	const es2016_array_include_1 = require_es2016_array_include();
	const es2016_intl_1 = require_es2016_intl();
	exports.es7 = {
		libs: [
			es2015_1.es2015,
			es2016_array_include_1.es2016_array_include,
			es2016_intl_1.es2016_intl
		],
		variables: []
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2016.js
var require_es2016 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2016 = void 0;
	const es2015_1 = require_es2015();
	const es2016_array_include_1 = require_es2016_array_include();
	const es2016_intl_1 = require_es2016_intl();
	exports.es2016 = {
		libs: [
			es2015_1.es2015,
			es2016_array_include_1.es2016_array_include,
			es2016_intl_1.es2016_intl
		],
		variables: []
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/scripthost.js
var require_scripthost = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.scripthost = void 0;
	const base_config_1 = require_base_config();
	exports.scripthost = {
		libs: [],
		variables: [
			["ActiveXObject", base_config_1.TYPE_VALUE],
			["ITextWriter", base_config_1.TYPE],
			["TextStreamBase", base_config_1.TYPE],
			["TextStreamWriter", base_config_1.TYPE],
			["TextStreamReader", base_config_1.TYPE],
			["SafeArray", base_config_1.TYPE_VALUE],
			["Enumerator", base_config_1.TYPE_VALUE],
			["EnumeratorConstructor", base_config_1.TYPE],
			["VBArray", base_config_1.TYPE_VALUE],
			["VBArrayConstructor", base_config_1.TYPE],
			["VarDate", base_config_1.TYPE_VALUE],
			["DateConstructor", base_config_1.TYPE],
			["Date", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/webworker.importscripts.js
var require_webworker_importscripts = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.webworker_importscripts = void 0;
	exports.webworker_importscripts = {
		libs: [],
		variables: []
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2016.full.js
var require_es2016_full = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2016_full = void 0;
	const dom_1 = require_dom();
	const dom_iterable_1 = require_dom_iterable();
	const es2016_1 = require_es2016();
	const scripthost_1 = require_scripthost();
	const webworker_importscripts_1 = require_webworker_importscripts();
	exports.es2016_full = {
		libs: [
			es2016_1.es2016,
			dom_1.dom,
			webworker_importscripts_1.webworker_importscripts,
			scripthost_1.scripthost,
			dom_iterable_1.dom_iterable
		],
		variables: []
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2017.arraybuffer.js
var require_es2017_arraybuffer = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2017_arraybuffer = void 0;
	const base_config_1 = require_base_config();
	exports.es2017_arraybuffer = {
		libs: [],
		variables: [["ArrayBufferConstructor", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2017.date.js
var require_es2017_date = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2017_date = void 0;
	const base_config_1 = require_base_config();
	exports.es2017_date = {
		libs: [],
		variables: [["DateConstructor", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2017.intl.js
var require_es2017_intl = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2017_intl = void 0;
	const base_config_1 = require_base_config();
	exports.es2017_intl = {
		libs: [],
		variables: [["Intl", base_config_1.TYPE_VALUE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2017.object.js
var require_es2017_object = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2017_object = void 0;
	const base_config_1 = require_base_config();
	exports.es2017_object = {
		libs: [],
		variables: [["ObjectConstructor", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2017.sharedmemory.js
var require_es2017_sharedmemory = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2017_sharedmemory = void 0;
	const base_config_1 = require_base_config();
	const es2015_symbol_1 = require_es2015_symbol();
	const es2015_symbol_wellknown_1 = require_es2015_symbol_wellknown();
	exports.es2017_sharedmemory = {
		libs: [es2015_symbol_1.es2015_symbol, es2015_symbol_wellknown_1.es2015_symbol_wellknown],
		variables: [
			["SharedArrayBuffer", base_config_1.TYPE_VALUE],
			["SharedArrayBufferConstructor", base_config_1.TYPE],
			["ArrayBufferTypes", base_config_1.TYPE],
			["Atomics", base_config_1.TYPE_VALUE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2017.string.js
var require_es2017_string = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2017_string = void 0;
	const base_config_1 = require_base_config();
	exports.es2017_string = {
		libs: [],
		variables: [["String", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2017.typedarrays.js
var require_es2017_typedarrays = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2017_typedarrays = void 0;
	const base_config_1 = require_base_config();
	exports.es2017_typedarrays = {
		libs: [],
		variables: [
			["Int8ArrayConstructor", base_config_1.TYPE],
			["Uint8ArrayConstructor", base_config_1.TYPE],
			["Uint8ClampedArrayConstructor", base_config_1.TYPE],
			["Int16ArrayConstructor", base_config_1.TYPE],
			["Uint16ArrayConstructor", base_config_1.TYPE],
			["Int32ArrayConstructor", base_config_1.TYPE],
			["Uint32ArrayConstructor", base_config_1.TYPE],
			["Float32ArrayConstructor", base_config_1.TYPE],
			["Float64ArrayConstructor", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2017.js
var require_es2017 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2017 = void 0;
	const es2016_1 = require_es2016();
	const es2017_arraybuffer_1 = require_es2017_arraybuffer();
	const es2017_date_1 = require_es2017_date();
	const es2017_intl_1 = require_es2017_intl();
	const es2017_object_1 = require_es2017_object();
	const es2017_sharedmemory_1 = require_es2017_sharedmemory();
	const es2017_string_1 = require_es2017_string();
	const es2017_typedarrays_1 = require_es2017_typedarrays();
	exports.es2017 = {
		libs: [
			es2016_1.es2016,
			es2017_arraybuffer_1.es2017_arraybuffer,
			es2017_date_1.es2017_date,
			es2017_intl_1.es2017_intl,
			es2017_object_1.es2017_object,
			es2017_sharedmemory_1.es2017_sharedmemory,
			es2017_string_1.es2017_string,
			es2017_typedarrays_1.es2017_typedarrays
		],
		variables: []
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2017.full.js
var require_es2017_full = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2017_full = void 0;
	const dom_1 = require_dom();
	const dom_iterable_1 = require_dom_iterable();
	const es2017_1 = require_es2017();
	const scripthost_1 = require_scripthost();
	const webworker_importscripts_1 = require_webworker_importscripts();
	exports.es2017_full = {
		libs: [
			es2017_1.es2017,
			dom_1.dom,
			webworker_importscripts_1.webworker_importscripts,
			scripthost_1.scripthost,
			dom_iterable_1.dom_iterable
		],
		variables: []
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2018.asynciterable.js
var require_es2018_asynciterable = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2018_asynciterable = void 0;
	const base_config_1 = require_base_config();
	const es2015_iterable_1 = require_es2015_iterable();
	const es2015_symbol_1 = require_es2015_symbol();
	exports.es2018_asynciterable = {
		libs: [es2015_symbol_1.es2015_symbol, es2015_iterable_1.es2015_iterable],
		variables: [
			["SymbolConstructor", base_config_1.TYPE],
			["AsyncIterator", base_config_1.TYPE],
			["AsyncIterable", base_config_1.TYPE],
			["AsyncIterableIterator", base_config_1.TYPE],
			["AsyncIteratorObject", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2018.asyncgenerator.js
var require_es2018_asyncgenerator = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2018_asyncgenerator = void 0;
	const base_config_1 = require_base_config();
	const es2018_asynciterable_1 = require_es2018_asynciterable();
	exports.es2018_asyncgenerator = {
		libs: [es2018_asynciterable_1.es2018_asynciterable],
		variables: [
			["AsyncGenerator", base_config_1.TYPE],
			["AsyncGeneratorFunction", base_config_1.TYPE],
			["AsyncGeneratorFunctionConstructor", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2018.intl.js
var require_es2018_intl = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2018_intl = void 0;
	const base_config_1 = require_base_config();
	exports.es2018_intl = {
		libs: [],
		variables: [["Intl", base_config_1.TYPE_VALUE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2018.promise.js
var require_es2018_promise = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2018_promise = void 0;
	const base_config_1 = require_base_config();
	exports.es2018_promise = {
		libs: [],
		variables: [["Promise", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2018.regexp.js
var require_es2018_regexp = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2018_regexp = void 0;
	const base_config_1 = require_base_config();
	exports.es2018_regexp = {
		libs: [],
		variables: [
			["RegExpMatchArray", base_config_1.TYPE],
			["RegExpExecArray", base_config_1.TYPE],
			["RegExp", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2018.js
var require_es2018 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2018 = void 0;
	const es2017_1 = require_es2017();
	const es2018_asyncgenerator_1 = require_es2018_asyncgenerator();
	const es2018_asynciterable_1 = require_es2018_asynciterable();
	const es2018_intl_1 = require_es2018_intl();
	const es2018_promise_1 = require_es2018_promise();
	const es2018_regexp_1 = require_es2018_regexp();
	exports.es2018 = {
		libs: [
			es2017_1.es2017,
			es2018_asynciterable_1.es2018_asynciterable,
			es2018_asyncgenerator_1.es2018_asyncgenerator,
			es2018_promise_1.es2018_promise,
			es2018_regexp_1.es2018_regexp,
			es2018_intl_1.es2018_intl
		],
		variables: []
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2018.full.js
var require_es2018_full = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2018_full = void 0;
	const dom_1 = require_dom();
	const dom_asynciterable_1 = require_dom_asynciterable();
	const dom_iterable_1 = require_dom_iterable();
	const es2018_1 = require_es2018();
	const scripthost_1 = require_scripthost();
	const webworker_importscripts_1 = require_webworker_importscripts();
	exports.es2018_full = {
		libs: [
			es2018_1.es2018,
			dom_1.dom,
			webworker_importscripts_1.webworker_importscripts,
			scripthost_1.scripthost,
			dom_iterable_1.dom_iterable,
			dom_asynciterable_1.dom_asynciterable
		],
		variables: []
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2019.array.js
var require_es2019_array = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2019_array = void 0;
	const base_config_1 = require_base_config();
	exports.es2019_array = {
		libs: [],
		variables: [
			["FlatArray", base_config_1.TYPE],
			["ReadonlyArray", base_config_1.TYPE],
			["Array", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2019.intl.js
var require_es2019_intl = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2019_intl = void 0;
	const base_config_1 = require_base_config();
	exports.es2019_intl = {
		libs: [],
		variables: [["Intl", base_config_1.TYPE_VALUE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2019.object.js
var require_es2019_object = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2019_object = void 0;
	const base_config_1 = require_base_config();
	const es2015_iterable_1 = require_es2015_iterable();
	exports.es2019_object = {
		libs: [es2015_iterable_1.es2015_iterable],
		variables: [["ObjectConstructor", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2019.string.js
var require_es2019_string = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2019_string = void 0;
	const base_config_1 = require_base_config();
	exports.es2019_string = {
		libs: [],
		variables: [["String", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2019.symbol.js
var require_es2019_symbol = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2019_symbol = void 0;
	const base_config_1 = require_base_config();
	exports.es2019_symbol = {
		libs: [],
		variables: [["Symbol", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2019.js
var require_es2019 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2019 = void 0;
	const es2018_1 = require_es2018();
	const es2019_array_1 = require_es2019_array();
	const es2019_intl_1 = require_es2019_intl();
	const es2019_object_1 = require_es2019_object();
	const es2019_string_1 = require_es2019_string();
	const es2019_symbol_1 = require_es2019_symbol();
	exports.es2019 = {
		libs: [
			es2018_1.es2018,
			es2019_array_1.es2019_array,
			es2019_object_1.es2019_object,
			es2019_string_1.es2019_string,
			es2019_symbol_1.es2019_symbol,
			es2019_intl_1.es2019_intl
		],
		variables: []
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2019.full.js
var require_es2019_full = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2019_full = void 0;
	const dom_1 = require_dom();
	const dom_asynciterable_1 = require_dom_asynciterable();
	const dom_iterable_1 = require_dom_iterable();
	const es2019_1 = require_es2019();
	const scripthost_1 = require_scripthost();
	const webworker_importscripts_1 = require_webworker_importscripts();
	exports.es2019_full = {
		libs: [
			es2019_1.es2019,
			dom_1.dom,
			webworker_importscripts_1.webworker_importscripts,
			scripthost_1.scripthost,
			dom_iterable_1.dom_iterable,
			dom_asynciterable_1.dom_asynciterable
		],
		variables: []
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2020.intl.js
var require_es2020_intl = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2020_intl = void 0;
	const base_config_1 = require_base_config();
	const es2018_intl_1 = require_es2018_intl();
	exports.es2020_intl = {
		libs: [es2018_intl_1.es2018_intl],
		variables: [["Intl", base_config_1.TYPE_VALUE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2020.bigint.js
var require_es2020_bigint = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2020_bigint = void 0;
	const base_config_1 = require_base_config();
	const es2020_intl_1 = require_es2020_intl();
	exports.es2020_bigint = {
		libs: [es2020_intl_1.es2020_intl],
		variables: [
			["BigIntToLocaleStringOptions", base_config_1.TYPE],
			["BigInt", base_config_1.TYPE_VALUE],
			["BigIntConstructor", base_config_1.TYPE],
			["BigInt64Array", base_config_1.TYPE_VALUE],
			["BigInt64ArrayConstructor", base_config_1.TYPE],
			["BigUint64Array", base_config_1.TYPE_VALUE],
			["BigUint64ArrayConstructor", base_config_1.TYPE],
			["DataView", base_config_1.TYPE],
			["Intl", base_config_1.TYPE_VALUE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2020.date.js
var require_es2020_date = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2020_date = void 0;
	const base_config_1 = require_base_config();
	const es2020_intl_1 = require_es2020_intl();
	exports.es2020_date = {
		libs: [es2020_intl_1.es2020_intl],
		variables: [["Date", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2020.number.js
var require_es2020_number = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2020_number = void 0;
	const base_config_1 = require_base_config();
	const es2020_intl_1 = require_es2020_intl();
	exports.es2020_number = {
		libs: [es2020_intl_1.es2020_intl],
		variables: [["Number", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2020.promise.js
var require_es2020_promise = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2020_promise = void 0;
	const base_config_1 = require_base_config();
	exports.es2020_promise = {
		libs: [],
		variables: [
			["PromiseFulfilledResult", base_config_1.TYPE],
			["PromiseRejectedResult", base_config_1.TYPE],
			["PromiseSettledResult", base_config_1.TYPE],
			["PromiseConstructor", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2020.sharedmemory.js
var require_es2020_sharedmemory = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2020_sharedmemory = void 0;
	const base_config_1 = require_base_config();
	const es2020_bigint_1 = require_es2020_bigint();
	exports.es2020_sharedmemory = {
		libs: [es2020_bigint_1.es2020_bigint],
		variables: [["Atomics", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2020.symbol.wellknown.js
var require_es2020_symbol_wellknown = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2020_symbol_wellknown = void 0;
	const base_config_1 = require_base_config();
	const es2015_iterable_1 = require_es2015_iterable();
	const es2015_symbol_1 = require_es2015_symbol();
	exports.es2020_symbol_wellknown = {
		libs: [es2015_iterable_1.es2015_iterable, es2015_symbol_1.es2015_symbol],
		variables: [
			["SymbolConstructor", base_config_1.TYPE],
			["RegExpStringIterator", base_config_1.TYPE],
			["RegExp", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2020.string.js
var require_es2020_string = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2020_string = void 0;
	const base_config_1 = require_base_config();
	const es2015_iterable_1 = require_es2015_iterable();
	const es2020_intl_1 = require_es2020_intl();
	const es2020_symbol_wellknown_1 = require_es2020_symbol_wellknown();
	exports.es2020_string = {
		libs: [
			es2015_iterable_1.es2015_iterable,
			es2020_intl_1.es2020_intl,
			es2020_symbol_wellknown_1.es2020_symbol_wellknown
		],
		variables: [["String", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2020.js
var require_es2020 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2020 = void 0;
	const es2019_1 = require_es2019();
	const es2020_bigint_1 = require_es2020_bigint();
	const es2020_date_1 = require_es2020_date();
	const es2020_intl_1 = require_es2020_intl();
	const es2020_number_1 = require_es2020_number();
	const es2020_promise_1 = require_es2020_promise();
	const es2020_sharedmemory_1 = require_es2020_sharedmemory();
	const es2020_string_1 = require_es2020_string();
	const es2020_symbol_wellknown_1 = require_es2020_symbol_wellknown();
	exports.es2020 = {
		libs: [
			es2019_1.es2019,
			es2020_bigint_1.es2020_bigint,
			es2020_date_1.es2020_date,
			es2020_number_1.es2020_number,
			es2020_promise_1.es2020_promise,
			es2020_sharedmemory_1.es2020_sharedmemory,
			es2020_string_1.es2020_string,
			es2020_symbol_wellknown_1.es2020_symbol_wellknown,
			es2020_intl_1.es2020_intl
		],
		variables: []
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2020.full.js
var require_es2020_full = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2020_full = void 0;
	const dom_1 = require_dom();
	const dom_asynciterable_1 = require_dom_asynciterable();
	const dom_iterable_1 = require_dom_iterable();
	const es2020_1 = require_es2020();
	const scripthost_1 = require_scripthost();
	const webworker_importscripts_1 = require_webworker_importscripts();
	exports.es2020_full = {
		libs: [
			es2020_1.es2020,
			dom_1.dom,
			webworker_importscripts_1.webworker_importscripts,
			scripthost_1.scripthost,
			dom_iterable_1.dom_iterable,
			dom_asynciterable_1.dom_asynciterable
		],
		variables: []
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2021.intl.js
var require_es2021_intl = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2021_intl = void 0;
	const base_config_1 = require_base_config();
	exports.es2021_intl = {
		libs: [],
		variables: [["Intl", base_config_1.TYPE_VALUE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2021.promise.js
var require_es2021_promise = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2021_promise = void 0;
	const base_config_1 = require_base_config();
	exports.es2021_promise = {
		libs: [],
		variables: [
			["AggregateError", base_config_1.TYPE_VALUE],
			["AggregateErrorConstructor", base_config_1.TYPE],
			["PromiseConstructor", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2021.string.js
var require_es2021_string = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2021_string = void 0;
	const base_config_1 = require_base_config();
	exports.es2021_string = {
		libs: [],
		variables: [["String", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2021.weakref.js
var require_es2021_weakref = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2021_weakref = void 0;
	const base_config_1 = require_base_config();
	const es2015_symbol_wellknown_1 = require_es2015_symbol_wellknown();
	exports.es2021_weakref = {
		libs: [es2015_symbol_wellknown_1.es2015_symbol_wellknown],
		variables: [
			["WeakRef", base_config_1.TYPE_VALUE],
			["WeakRefConstructor", base_config_1.TYPE],
			["FinalizationRegistry", base_config_1.TYPE_VALUE],
			["FinalizationRegistryConstructor", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2021.js
var require_es2021 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2021 = void 0;
	const es2020_1 = require_es2020();
	const es2021_intl_1 = require_es2021_intl();
	const es2021_promise_1 = require_es2021_promise();
	const es2021_string_1 = require_es2021_string();
	const es2021_weakref_1 = require_es2021_weakref();
	exports.es2021 = {
		libs: [
			es2020_1.es2020,
			es2021_promise_1.es2021_promise,
			es2021_string_1.es2021_string,
			es2021_weakref_1.es2021_weakref,
			es2021_intl_1.es2021_intl
		],
		variables: []
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2021.full.js
var require_es2021_full = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2021_full = void 0;
	const dom_1 = require_dom();
	const dom_asynciterable_1 = require_dom_asynciterable();
	const dom_iterable_1 = require_dom_iterable();
	const es2021_1 = require_es2021();
	const scripthost_1 = require_scripthost();
	const webworker_importscripts_1 = require_webworker_importscripts();
	exports.es2021_full = {
		libs: [
			es2021_1.es2021,
			dom_1.dom,
			webworker_importscripts_1.webworker_importscripts,
			scripthost_1.scripthost,
			dom_iterable_1.dom_iterable,
			dom_asynciterable_1.dom_asynciterable
		],
		variables: []
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2022.array.js
var require_es2022_array = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2022_array = void 0;
	const base_config_1 = require_base_config();
	exports.es2022_array = {
		libs: [],
		variables: [
			["Array", base_config_1.TYPE],
			["ReadonlyArray", base_config_1.TYPE],
			["Int8Array", base_config_1.TYPE],
			["Uint8Array", base_config_1.TYPE],
			["Uint8ClampedArray", base_config_1.TYPE],
			["Int16Array", base_config_1.TYPE],
			["Uint16Array", base_config_1.TYPE],
			["Int32Array", base_config_1.TYPE],
			["Uint32Array", base_config_1.TYPE],
			["Float32Array", base_config_1.TYPE],
			["Float64Array", base_config_1.TYPE],
			["BigInt64Array", base_config_1.TYPE],
			["BigUint64Array", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2022.error.js
var require_es2022_error = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2022_error = void 0;
	const base_config_1 = require_base_config();
	const es2021_promise_1 = require_es2021_promise();
	exports.es2022_error = {
		libs: [es2021_promise_1.es2021_promise],
		variables: [
			["ErrorOptions", base_config_1.TYPE],
			["Error", base_config_1.TYPE],
			["ErrorConstructor", base_config_1.TYPE],
			["EvalErrorConstructor", base_config_1.TYPE],
			["RangeErrorConstructor", base_config_1.TYPE],
			["ReferenceErrorConstructor", base_config_1.TYPE],
			["SyntaxErrorConstructor", base_config_1.TYPE],
			["TypeErrorConstructor", base_config_1.TYPE],
			["URIErrorConstructor", base_config_1.TYPE],
			["AggregateErrorConstructor", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2022.intl.js
var require_es2022_intl = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2022_intl = void 0;
	const base_config_1 = require_base_config();
	exports.es2022_intl = {
		libs: [],
		variables: [["Intl", base_config_1.TYPE_VALUE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2022.object.js
var require_es2022_object = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2022_object = void 0;
	const base_config_1 = require_base_config();
	exports.es2022_object = {
		libs: [],
		variables: [["ObjectConstructor", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2022.regexp.js
var require_es2022_regexp = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2022_regexp = void 0;
	const base_config_1 = require_base_config();
	exports.es2022_regexp = {
		libs: [],
		variables: [
			["RegExpMatchArray", base_config_1.TYPE],
			["RegExpExecArray", base_config_1.TYPE],
			["RegExpIndicesArray", base_config_1.TYPE],
			["RegExp", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2022.string.js
var require_es2022_string = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2022_string = void 0;
	const base_config_1 = require_base_config();
	exports.es2022_string = {
		libs: [],
		variables: [["String", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2022.js
var require_es2022 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2022 = void 0;
	const es2021_1 = require_es2021();
	const es2022_array_1 = require_es2022_array();
	const es2022_error_1 = require_es2022_error();
	const es2022_intl_1 = require_es2022_intl();
	const es2022_object_1 = require_es2022_object();
	const es2022_regexp_1 = require_es2022_regexp();
	const es2022_string_1 = require_es2022_string();
	exports.es2022 = {
		libs: [
			es2021_1.es2021,
			es2022_array_1.es2022_array,
			es2022_error_1.es2022_error,
			es2022_intl_1.es2022_intl,
			es2022_object_1.es2022_object,
			es2022_regexp_1.es2022_regexp,
			es2022_string_1.es2022_string
		],
		variables: []
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2022.full.js
var require_es2022_full = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2022_full = void 0;
	const dom_1 = require_dom();
	const dom_asynciterable_1 = require_dom_asynciterable();
	const dom_iterable_1 = require_dom_iterable();
	const es2022_1 = require_es2022();
	const scripthost_1 = require_scripthost();
	const webworker_importscripts_1 = require_webworker_importscripts();
	exports.es2022_full = {
		libs: [
			es2022_1.es2022,
			dom_1.dom,
			webworker_importscripts_1.webworker_importscripts,
			scripthost_1.scripthost,
			dom_iterable_1.dom_iterable,
			dom_asynciterable_1.dom_asynciterable
		],
		variables: []
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2023.array.js
var require_es2023_array = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2023_array = void 0;
	const base_config_1 = require_base_config();
	exports.es2023_array = {
		libs: [],
		variables: [
			["Array", base_config_1.TYPE],
			["ReadonlyArray", base_config_1.TYPE],
			["Int8Array", base_config_1.TYPE],
			["Uint8Array", base_config_1.TYPE],
			["Uint8ClampedArray", base_config_1.TYPE],
			["Int16Array", base_config_1.TYPE],
			["Uint16Array", base_config_1.TYPE],
			["Int32Array", base_config_1.TYPE],
			["Uint32Array", base_config_1.TYPE],
			["Float32Array", base_config_1.TYPE],
			["Float64Array", base_config_1.TYPE],
			["BigInt64Array", base_config_1.TYPE],
			["BigUint64Array", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2023.collection.js
var require_es2023_collection = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2023_collection = void 0;
	const base_config_1 = require_base_config();
	exports.es2023_collection = {
		libs: [],
		variables: [["WeakKeyTypes", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2023.intl.js
var require_es2023_intl = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2023_intl = void 0;
	const base_config_1 = require_base_config();
	exports.es2023_intl = {
		libs: [],
		variables: [["Intl", base_config_1.TYPE_VALUE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2023.js
var require_es2023 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2023 = void 0;
	const es2022_1 = require_es2022();
	const es2023_array_1 = require_es2023_array();
	const es2023_collection_1 = require_es2023_collection();
	const es2023_intl_1 = require_es2023_intl();
	exports.es2023 = {
		libs: [
			es2022_1.es2022,
			es2023_array_1.es2023_array,
			es2023_collection_1.es2023_collection,
			es2023_intl_1.es2023_intl
		],
		variables: []
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2023.full.js
var require_es2023_full = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2023_full = void 0;
	const dom_1 = require_dom();
	const dom_asynciterable_1 = require_dom_asynciterable();
	const dom_iterable_1 = require_dom_iterable();
	const es2023_1 = require_es2023();
	const scripthost_1 = require_scripthost();
	const webworker_importscripts_1 = require_webworker_importscripts();
	exports.es2023_full = {
		libs: [
			es2023_1.es2023,
			dom_1.dom,
			webworker_importscripts_1.webworker_importscripts,
			scripthost_1.scripthost,
			dom_iterable_1.dom_iterable,
			dom_asynciterable_1.dom_asynciterable
		],
		variables: []
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2024.arraybuffer.js
var require_es2024_arraybuffer = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2024_arraybuffer = void 0;
	const base_config_1 = require_base_config();
	exports.es2024_arraybuffer = {
		libs: [],
		variables: [["ArrayBuffer", base_config_1.TYPE], ["ArrayBufferConstructor", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2024.collection.js
var require_es2024_collection = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2024_collection = void 0;
	const base_config_1 = require_base_config();
	exports.es2024_collection = {
		libs: [],
		variables: [["MapConstructor", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2024.object.js
var require_es2024_object = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2024_object = void 0;
	const base_config_1 = require_base_config();
	exports.es2024_object = {
		libs: [],
		variables: [["ObjectConstructor", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2024.promise.js
var require_es2024_promise = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2024_promise = void 0;
	const base_config_1 = require_base_config();
	exports.es2024_promise = {
		libs: [],
		variables: [["PromiseWithResolvers", base_config_1.TYPE], ["PromiseConstructor", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2024.regexp.js
var require_es2024_regexp = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2024_regexp = void 0;
	const base_config_1 = require_base_config();
	exports.es2024_regexp = {
		libs: [],
		variables: [["RegExp", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2024.sharedmemory.js
var require_es2024_sharedmemory = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2024_sharedmemory = void 0;
	const base_config_1 = require_base_config();
	const es2020_bigint_1 = require_es2020_bigint();
	exports.es2024_sharedmemory = {
		libs: [es2020_bigint_1.es2020_bigint],
		variables: [
			["Atomics", base_config_1.TYPE],
			["SharedArrayBuffer", base_config_1.TYPE],
			["SharedArrayBufferConstructor", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2024.string.js
var require_es2024_string = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2024_string = void 0;
	const base_config_1 = require_base_config();
	exports.es2024_string = {
		libs: [],
		variables: [["String", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2024.js
var require_es2024 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2024 = void 0;
	const es2023_1 = require_es2023();
	const es2024_arraybuffer_1 = require_es2024_arraybuffer();
	const es2024_collection_1 = require_es2024_collection();
	const es2024_object_1 = require_es2024_object();
	const es2024_promise_1 = require_es2024_promise();
	const es2024_regexp_1 = require_es2024_regexp();
	const es2024_sharedmemory_1 = require_es2024_sharedmemory();
	const es2024_string_1 = require_es2024_string();
	exports.es2024 = {
		libs: [
			es2023_1.es2023,
			es2024_arraybuffer_1.es2024_arraybuffer,
			es2024_collection_1.es2024_collection,
			es2024_object_1.es2024_object,
			es2024_promise_1.es2024_promise,
			es2024_regexp_1.es2024_regexp,
			es2024_sharedmemory_1.es2024_sharedmemory,
			es2024_string_1.es2024_string
		],
		variables: []
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/es2024.full.js
var require_es2024_full = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.es2024_full = void 0;
	const dom_1 = require_dom();
	const dom_asynciterable_1 = require_dom_asynciterable();
	const dom_iterable_1 = require_dom_iterable();
	const es2024_1 = require_es2024();
	const scripthost_1 = require_scripthost();
	const webworker_importscripts_1 = require_webworker_importscripts();
	exports.es2024_full = {
		libs: [
			es2024_1.es2024,
			dom_1.dom,
			webworker_importscripts_1.webworker_importscripts,
			scripthost_1.scripthost,
			dom_iterable_1.dom_iterable,
			dom_asynciterable_1.dom_asynciterable
		],
		variables: []
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.array.js
var require_esnext_array = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.esnext_array = void 0;
	const base_config_1 = require_base_config();
	exports.esnext_array = {
		libs: [],
		variables: [["ArrayConstructor", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.collection.js
var require_esnext_collection = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.esnext_collection = void 0;
	const base_config_1 = require_base_config();
	const es2024_collection_1 = require_es2024_collection();
	exports.esnext_collection = {
		libs: [es2024_collection_1.es2024_collection],
		variables: [
			["ReadonlySetLike", base_config_1.TYPE],
			["Set", base_config_1.TYPE],
			["ReadonlySet", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.decorators.js
var require_esnext_decorators = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.esnext_decorators = void 0;
	const base_config_1 = require_base_config();
	const decorators_1 = require_decorators();
	const es2015_symbol_1 = require_es2015_symbol();
	exports.esnext_decorators = {
		libs: [es2015_symbol_1.es2015_symbol, decorators_1.decorators],
		variables: [["SymbolConstructor", base_config_1.TYPE], ["Function", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.disposable.js
var require_esnext_disposable = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.esnext_disposable = void 0;
	const base_config_1 = require_base_config();
	const es2015_iterable_1 = require_es2015_iterable();
	const es2015_symbol_1 = require_es2015_symbol();
	const es2018_asynciterable_1 = require_es2018_asynciterable();
	exports.esnext_disposable = {
		libs: [
			es2015_symbol_1.es2015_symbol,
			es2015_iterable_1.es2015_iterable,
			es2018_asynciterable_1.es2018_asynciterable
		],
		variables: [
			["SymbolConstructor", base_config_1.TYPE],
			["Disposable", base_config_1.TYPE],
			["AsyncDisposable", base_config_1.TYPE],
			["SuppressedError", base_config_1.TYPE_VALUE],
			["SuppressedErrorConstructor", base_config_1.TYPE],
			["DisposableStack", base_config_1.TYPE_VALUE],
			["DisposableStackConstructor", base_config_1.TYPE],
			["AsyncDisposableStack", base_config_1.TYPE_VALUE],
			["AsyncDisposableStackConstructor", base_config_1.TYPE],
			["IteratorObject", base_config_1.TYPE],
			["AsyncIteratorObject", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.error.js
var require_esnext_error = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.esnext_error = void 0;
	const base_config_1 = require_base_config();
	exports.esnext_error = {
		libs: [],
		variables: [["ErrorConstructor", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.float16.js
var require_esnext_float16 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.esnext_float16 = void 0;
	const base_config_1 = require_base_config();
	const es2015_iterable_1 = require_es2015_iterable();
	const es2015_symbol_1 = require_es2015_symbol();
	exports.esnext_float16 = {
		libs: [es2015_symbol_1.es2015_symbol, es2015_iterable_1.es2015_iterable],
		variables: [
			["Float16Array", base_config_1.TYPE_VALUE],
			["Float16ArrayConstructor", base_config_1.TYPE],
			["Math", base_config_1.TYPE],
			["DataView", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.intl.js
var require_esnext_intl = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.esnext_intl = void 0;
	const base_config_1 = require_base_config();
	exports.esnext_intl = {
		libs: [],
		variables: [["Intl", base_config_1.TYPE_VALUE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.iterator.js
var require_esnext_iterator = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.esnext_iterator = void 0;
	const base_config_1 = require_base_config();
	const es2015_iterable_1 = require_es2015_iterable();
	exports.esnext_iterator = {
		libs: [es2015_iterable_1.es2015_iterable],
		variables: [["Iterator", base_config_1.TYPE_VALUE], ["IteratorObjectConstructor", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.promise.js
var require_esnext_promise = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.esnext_promise = void 0;
	const base_config_1 = require_base_config();
	exports.esnext_promise = {
		libs: [],
		variables: [["PromiseConstructor", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.sharedmemory.js
var require_esnext_sharedmemory = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.esnext_sharedmemory = void 0;
	const base_config_1 = require_base_config();
	exports.esnext_sharedmemory = {
		libs: [],
		variables: [["Atomics", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.js
var require_esnext = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.esnext = void 0;
	const es2024_1 = require_es2024();
	const esnext_array_1 = require_esnext_array();
	const esnext_collection_1 = require_esnext_collection();
	const esnext_decorators_1 = require_esnext_decorators();
	const esnext_disposable_1 = require_esnext_disposable();
	const esnext_error_1 = require_esnext_error();
	const esnext_float16_1 = require_esnext_float16();
	const esnext_intl_1 = require_esnext_intl();
	const esnext_iterator_1 = require_esnext_iterator();
	const esnext_promise_1 = require_esnext_promise();
	const esnext_sharedmemory_1 = require_esnext_sharedmemory();
	exports.esnext = {
		libs: [
			es2024_1.es2024,
			esnext_intl_1.esnext_intl,
			esnext_decorators_1.esnext_decorators,
			esnext_disposable_1.esnext_disposable,
			esnext_collection_1.esnext_collection,
			esnext_array_1.esnext_array,
			esnext_iterator_1.esnext_iterator,
			esnext_promise_1.esnext_promise,
			esnext_float16_1.esnext_float16,
			esnext_error_1.esnext_error,
			esnext_sharedmemory_1.esnext_sharedmemory
		],
		variables: []
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.asynciterable.js
var require_esnext_asynciterable = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.esnext_asynciterable = void 0;
	const base_config_1 = require_base_config();
	const es2015_iterable_1 = require_es2015_iterable();
	const es2015_symbol_1 = require_es2015_symbol();
	exports.esnext_asynciterable = {
		libs: [es2015_symbol_1.es2015_symbol, es2015_iterable_1.es2015_iterable],
		variables: [
			["SymbolConstructor", base_config_1.TYPE],
			["AsyncIterator", base_config_1.TYPE],
			["AsyncIterable", base_config_1.TYPE],
			["AsyncIterableIterator", base_config_1.TYPE],
			["AsyncIteratorObject", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.bigint.js
var require_esnext_bigint = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.esnext_bigint = void 0;
	const base_config_1 = require_base_config();
	const es2020_intl_1 = require_es2020_intl();
	exports.esnext_bigint = {
		libs: [es2020_intl_1.es2020_intl],
		variables: [
			["BigIntToLocaleStringOptions", base_config_1.TYPE],
			["BigInt", base_config_1.TYPE_VALUE],
			["BigIntConstructor", base_config_1.TYPE],
			["BigInt64Array", base_config_1.TYPE_VALUE],
			["BigInt64ArrayConstructor", base_config_1.TYPE],
			["BigUint64Array", base_config_1.TYPE_VALUE],
			["BigUint64ArrayConstructor", base_config_1.TYPE],
			["DataView", base_config_1.TYPE],
			["Intl", base_config_1.TYPE_VALUE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.full.js
var require_esnext_full = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.esnext_full = void 0;
	const dom_1 = require_dom();
	const dom_asynciterable_1 = require_dom_asynciterable();
	const dom_iterable_1 = require_dom_iterable();
	const esnext_1 = require_esnext();
	const scripthost_1 = require_scripthost();
	const webworker_importscripts_1 = require_webworker_importscripts();
	exports.esnext_full = {
		libs: [
			esnext_1.esnext,
			dom_1.dom,
			webworker_importscripts_1.webworker_importscripts,
			scripthost_1.scripthost,
			dom_iterable_1.dom_iterable,
			dom_asynciterable_1.dom_asynciterable
		],
		variables: []
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.object.js
var require_esnext_object = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.esnext_object = void 0;
	const base_config_1 = require_base_config();
	exports.esnext_object = {
		libs: [],
		variables: [["ObjectConstructor", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.regexp.js
var require_esnext_regexp = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.esnext_regexp = void 0;
	const base_config_1 = require_base_config();
	exports.esnext_regexp = {
		libs: [],
		variables: [["RegExp", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.string.js
var require_esnext_string = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.esnext_string = void 0;
	const base_config_1 = require_base_config();
	exports.esnext_string = {
		libs: [],
		variables: [["String", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.symbol.js
var require_esnext_symbol = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.esnext_symbol = void 0;
	const base_config_1 = require_base_config();
	exports.esnext_symbol = {
		libs: [],
		variables: [["Symbol", base_config_1.TYPE]]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/esnext.weakref.js
var require_esnext_weakref = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.esnext_weakref = void 0;
	const base_config_1 = require_base_config();
	const es2015_symbol_wellknown_1 = require_es2015_symbol_wellknown();
	exports.esnext_weakref = {
		libs: [es2015_symbol_wellknown_1.es2015_symbol_wellknown],
		variables: [
			["WeakRef", base_config_1.TYPE_VALUE],
			["WeakRefConstructor", base_config_1.TYPE],
			["FinalizationRegistry", base_config_1.TYPE_VALUE],
			["FinalizationRegistryConstructor", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/lib.js
var require_lib$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.lib = void 0;
	const dom_1 = require_dom();
	const es5_1 = require_es5();
	const scripthost_1 = require_scripthost();
	const webworker_importscripts_1 = require_webworker_importscripts();
	exports.lib = {
		libs: [
			es5_1.es5,
			dom_1.dom,
			webworker_importscripts_1.webworker_importscripts,
			scripthost_1.scripthost
		],
		variables: []
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/webworker.js
var require_webworker = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.webworker = void 0;
	const base_config_1 = require_base_config();
	exports.webworker = {
		libs: [],
		variables: [
			["AddEventListenerOptions", base_config_1.TYPE],
			["AesCbcParams", base_config_1.TYPE],
			["AesCtrParams", base_config_1.TYPE],
			["AesDerivedKeyParams", base_config_1.TYPE],
			["AesGcmParams", base_config_1.TYPE],
			["AesKeyAlgorithm", base_config_1.TYPE],
			["AesKeyGenParams", base_config_1.TYPE],
			["Algorithm", base_config_1.TYPE],
			["AudioConfiguration", base_config_1.TYPE],
			["AudioDataCopyToOptions", base_config_1.TYPE],
			["AudioDataInit", base_config_1.TYPE],
			["AudioDecoderConfig", base_config_1.TYPE],
			["AudioDecoderInit", base_config_1.TYPE],
			["AudioDecoderSupport", base_config_1.TYPE],
			["AudioEncoderConfig", base_config_1.TYPE],
			["AudioEncoderInit", base_config_1.TYPE],
			["AudioEncoderSupport", base_config_1.TYPE],
			["AvcEncoderConfig", base_config_1.TYPE],
			["BlobPropertyBag", base_config_1.TYPE],
			["CSSMatrixComponentOptions", base_config_1.TYPE],
			["CSSNumericType", base_config_1.TYPE],
			["CacheQueryOptions", base_config_1.TYPE],
			["ClientQueryOptions", base_config_1.TYPE],
			["CloseEventInit", base_config_1.TYPE],
			["CookieInit", base_config_1.TYPE],
			["CookieListItem", base_config_1.TYPE],
			["CookieStoreDeleteOptions", base_config_1.TYPE],
			["CookieStoreGetOptions", base_config_1.TYPE],
			["CryptoKeyPair", base_config_1.TYPE],
			["CustomEventInit", base_config_1.TYPE],
			["DOMMatrix2DInit", base_config_1.TYPE],
			["DOMMatrixInit", base_config_1.TYPE],
			["DOMPointInit", base_config_1.TYPE],
			["DOMQuadInit", base_config_1.TYPE],
			["DOMRectInit", base_config_1.TYPE],
			["EcKeyGenParams", base_config_1.TYPE],
			["EcKeyImportParams", base_config_1.TYPE],
			["EcdhKeyDeriveParams", base_config_1.TYPE],
			["EcdsaParams", base_config_1.TYPE],
			["EncodedAudioChunkInit", base_config_1.TYPE],
			["EncodedAudioChunkMetadata", base_config_1.TYPE],
			["EncodedVideoChunkInit", base_config_1.TYPE],
			["EncodedVideoChunkMetadata", base_config_1.TYPE],
			["ErrorEventInit", base_config_1.TYPE],
			["EventInit", base_config_1.TYPE],
			["EventListenerOptions", base_config_1.TYPE],
			["EventSourceInit", base_config_1.TYPE],
			["ExtendableCookieChangeEventInit", base_config_1.TYPE],
			["ExtendableEventInit", base_config_1.TYPE],
			["ExtendableMessageEventInit", base_config_1.TYPE],
			["FetchEventInit", base_config_1.TYPE],
			["FilePropertyBag", base_config_1.TYPE],
			["FileSystemCreateWritableOptions", base_config_1.TYPE],
			["FileSystemGetDirectoryOptions", base_config_1.TYPE],
			["FileSystemGetFileOptions", base_config_1.TYPE],
			["FileSystemReadWriteOptions", base_config_1.TYPE],
			["FileSystemRemoveOptions", base_config_1.TYPE],
			["FontFaceDescriptors", base_config_1.TYPE],
			["FontFaceSetLoadEventInit", base_config_1.TYPE],
			["GetNotificationOptions", base_config_1.TYPE],
			["HkdfParams", base_config_1.TYPE],
			["HmacImportParams", base_config_1.TYPE],
			["HmacKeyGenParams", base_config_1.TYPE],
			["IDBDatabaseInfo", base_config_1.TYPE],
			["IDBIndexParameters", base_config_1.TYPE],
			["IDBObjectStoreParameters", base_config_1.TYPE],
			["IDBTransactionOptions", base_config_1.TYPE],
			["IDBVersionChangeEventInit", base_config_1.TYPE],
			["ImageBitmapOptions", base_config_1.TYPE],
			["ImageBitmapRenderingContextSettings", base_config_1.TYPE],
			["ImageDataSettings", base_config_1.TYPE],
			["ImageDecodeOptions", base_config_1.TYPE],
			["ImageDecodeResult", base_config_1.TYPE],
			["ImageDecoderInit", base_config_1.TYPE],
			["ImageEncodeOptions", base_config_1.TYPE],
			["JsonWebKey", base_config_1.TYPE],
			["KeyAlgorithm", base_config_1.TYPE],
			["KeySystemTrackConfiguration", base_config_1.TYPE],
			["LockInfo", base_config_1.TYPE],
			["LockManagerSnapshot", base_config_1.TYPE],
			["LockOptions", base_config_1.TYPE],
			["MediaCapabilitiesDecodingInfo", base_config_1.TYPE],
			["MediaCapabilitiesEncodingInfo", base_config_1.TYPE],
			["MediaCapabilitiesInfo", base_config_1.TYPE],
			["MediaCapabilitiesKeySystemConfiguration", base_config_1.TYPE],
			["MediaConfiguration", base_config_1.TYPE],
			["MediaDecodingConfiguration", base_config_1.TYPE],
			["MediaEncodingConfiguration", base_config_1.TYPE],
			["MediaStreamTrackProcessorInit", base_config_1.TYPE],
			["MessageEventInit", base_config_1.TYPE],
			["MultiCacheQueryOptions", base_config_1.TYPE],
			["NavigationPreloadState", base_config_1.TYPE],
			["NotificationEventInit", base_config_1.TYPE],
			["NotificationOptions", base_config_1.TYPE],
			["OpusEncoderConfig", base_config_1.TYPE],
			["Pbkdf2Params", base_config_1.TYPE],
			["PerformanceMarkOptions", base_config_1.TYPE],
			["PerformanceMeasureOptions", base_config_1.TYPE],
			["PerformanceObserverInit", base_config_1.TYPE],
			["PermissionDescriptor", base_config_1.TYPE],
			["PlaneLayout", base_config_1.TYPE],
			["ProgressEventInit", base_config_1.TYPE],
			["PromiseRejectionEventInit", base_config_1.TYPE],
			["PushEventInit", base_config_1.TYPE],
			["PushSubscriptionChangeEventInit", base_config_1.TYPE],
			["PushSubscriptionJSON", base_config_1.TYPE],
			["PushSubscriptionOptionsInit", base_config_1.TYPE],
			["QueuingStrategy", base_config_1.TYPE],
			["QueuingStrategyInit", base_config_1.TYPE],
			["RTCEncodedAudioFrameMetadata", base_config_1.TYPE],
			["RTCEncodedFrameMetadata", base_config_1.TYPE],
			["RTCEncodedVideoFrameMetadata", base_config_1.TYPE],
			["ReadableStreamGetReaderOptions", base_config_1.TYPE],
			["ReadableStreamIteratorOptions", base_config_1.TYPE],
			["ReadableStreamReadDoneResult", base_config_1.TYPE],
			["ReadableStreamReadValueResult", base_config_1.TYPE],
			["ReadableWritablePair", base_config_1.TYPE],
			["RegistrationOptions", base_config_1.TYPE],
			["ReportingObserverOptions", base_config_1.TYPE],
			["RequestInit", base_config_1.TYPE],
			["ResponseInit", base_config_1.TYPE],
			["RsaHashedImportParams", base_config_1.TYPE],
			["RsaHashedKeyGenParams", base_config_1.TYPE],
			["RsaKeyGenParams", base_config_1.TYPE],
			["RsaOaepParams", base_config_1.TYPE],
			["RsaOtherPrimesInfo", base_config_1.TYPE],
			["RsaPssParams", base_config_1.TYPE],
			["SecurityPolicyViolationEventInit", base_config_1.TYPE],
			["StorageEstimate", base_config_1.TYPE],
			["StreamPipeOptions", base_config_1.TYPE],
			["StructuredSerializeOptions", base_config_1.TYPE],
			["TextDecodeOptions", base_config_1.TYPE],
			["TextDecoderOptions", base_config_1.TYPE],
			["TextEncoderEncodeIntoResult", base_config_1.TYPE],
			["Transformer", base_config_1.TYPE],
			["UnderlyingByteSource", base_config_1.TYPE],
			["UnderlyingDefaultSource", base_config_1.TYPE],
			["UnderlyingSink", base_config_1.TYPE],
			["UnderlyingSource", base_config_1.TYPE],
			["VideoColorSpaceInit", base_config_1.TYPE],
			["VideoConfiguration", base_config_1.TYPE],
			["VideoDecoderConfig", base_config_1.TYPE],
			["VideoDecoderInit", base_config_1.TYPE],
			["VideoDecoderSupport", base_config_1.TYPE],
			["VideoEncoderConfig", base_config_1.TYPE],
			["VideoEncoderEncodeOptions", base_config_1.TYPE],
			["VideoEncoderEncodeOptionsForAvc", base_config_1.TYPE],
			["VideoEncoderInit", base_config_1.TYPE],
			["VideoEncoderSupport", base_config_1.TYPE],
			["VideoFrameBufferInit", base_config_1.TYPE],
			["VideoFrameCopyToOptions", base_config_1.TYPE],
			["VideoFrameInit", base_config_1.TYPE],
			["WebGLContextAttributes", base_config_1.TYPE],
			["WebGLContextEventInit", base_config_1.TYPE],
			["WebTransportCloseInfo", base_config_1.TYPE],
			["WebTransportErrorOptions", base_config_1.TYPE],
			["WebTransportHash", base_config_1.TYPE],
			["WebTransportOptions", base_config_1.TYPE],
			["WebTransportSendOptions", base_config_1.TYPE],
			["WebTransportSendStreamOptions", base_config_1.TYPE],
			["WorkerOptions", base_config_1.TYPE],
			["WriteParams", base_config_1.TYPE],
			["ANGLE_instanced_arrays", base_config_1.TYPE],
			["AbortController", base_config_1.TYPE_VALUE],
			["AbortSignalEventMap", base_config_1.TYPE],
			["AbortSignal", base_config_1.TYPE_VALUE],
			["AbstractWorkerEventMap", base_config_1.TYPE],
			["AbstractWorker", base_config_1.TYPE],
			["AnimationFrameProvider", base_config_1.TYPE],
			["AudioData", base_config_1.TYPE_VALUE],
			["AudioDecoderEventMap", base_config_1.TYPE],
			["AudioDecoder", base_config_1.TYPE_VALUE],
			["AudioEncoderEventMap", base_config_1.TYPE],
			["AudioEncoder", base_config_1.TYPE_VALUE],
			["Blob", base_config_1.TYPE_VALUE],
			["Body", base_config_1.TYPE],
			["BroadcastChannelEventMap", base_config_1.TYPE],
			["BroadcastChannel", base_config_1.TYPE_VALUE],
			["ByteLengthQueuingStrategy", base_config_1.TYPE_VALUE],
			["CSSImageValue", base_config_1.TYPE_VALUE],
			["CSSKeywordValue", base_config_1.TYPE_VALUE],
			["CSSMathClamp", base_config_1.TYPE_VALUE],
			["CSSMathInvert", base_config_1.TYPE_VALUE],
			["CSSMathMax", base_config_1.TYPE_VALUE],
			["CSSMathMin", base_config_1.TYPE_VALUE],
			["CSSMathNegate", base_config_1.TYPE_VALUE],
			["CSSMathProduct", base_config_1.TYPE_VALUE],
			["CSSMathSum", base_config_1.TYPE_VALUE],
			["CSSMathValue", base_config_1.TYPE_VALUE],
			["CSSMatrixComponent", base_config_1.TYPE_VALUE],
			["CSSNumericArray", base_config_1.TYPE_VALUE],
			["CSSNumericValue", base_config_1.TYPE_VALUE],
			["CSSPerspective", base_config_1.TYPE_VALUE],
			["CSSRotate", base_config_1.TYPE_VALUE],
			["CSSScale", base_config_1.TYPE_VALUE],
			["CSSSkew", base_config_1.TYPE_VALUE],
			["CSSSkewX", base_config_1.TYPE_VALUE],
			["CSSSkewY", base_config_1.TYPE_VALUE],
			["CSSStyleValue", base_config_1.TYPE_VALUE],
			["CSSTransformComponent", base_config_1.TYPE_VALUE],
			["CSSTransformValue", base_config_1.TYPE_VALUE],
			["CSSTranslate", base_config_1.TYPE_VALUE],
			["CSSUnitValue", base_config_1.TYPE_VALUE],
			["CSSUnparsedValue", base_config_1.TYPE_VALUE],
			["CSSVariableReferenceValue", base_config_1.TYPE_VALUE],
			["Cache", base_config_1.TYPE_VALUE],
			["CacheStorage", base_config_1.TYPE_VALUE],
			["CanvasCompositing", base_config_1.TYPE],
			["CanvasDrawImage", base_config_1.TYPE],
			["CanvasDrawPath", base_config_1.TYPE],
			["CanvasFillStrokeStyles", base_config_1.TYPE],
			["CanvasFilters", base_config_1.TYPE],
			["CanvasGradient", base_config_1.TYPE_VALUE],
			["CanvasImageData", base_config_1.TYPE],
			["CanvasImageSmoothing", base_config_1.TYPE],
			["CanvasPath", base_config_1.TYPE],
			["CanvasPathDrawingStyles", base_config_1.TYPE],
			["CanvasPattern", base_config_1.TYPE_VALUE],
			["CanvasRect", base_config_1.TYPE],
			["CanvasShadowStyles", base_config_1.TYPE],
			["CanvasState", base_config_1.TYPE],
			["CanvasText", base_config_1.TYPE],
			["CanvasTextDrawingStyles", base_config_1.TYPE],
			["CanvasTransform", base_config_1.TYPE],
			["Client", base_config_1.TYPE_VALUE],
			["Clients", base_config_1.TYPE_VALUE],
			["CloseEvent", base_config_1.TYPE_VALUE],
			["CompressionStream", base_config_1.TYPE_VALUE],
			["CookieStore", base_config_1.TYPE_VALUE],
			["CookieStoreManager", base_config_1.TYPE_VALUE],
			["CountQueuingStrategy", base_config_1.TYPE_VALUE],
			["Crypto", base_config_1.TYPE_VALUE],
			["CryptoKey", base_config_1.TYPE_VALUE],
			["CustomEvent", base_config_1.TYPE_VALUE],
			["DOMException", base_config_1.TYPE_VALUE],
			["DOMMatrix", base_config_1.TYPE_VALUE],
			["DOMMatrixReadOnly", base_config_1.TYPE_VALUE],
			["DOMPoint", base_config_1.TYPE_VALUE],
			["DOMPointReadOnly", base_config_1.TYPE_VALUE],
			["DOMQuad", base_config_1.TYPE_VALUE],
			["DOMRect", base_config_1.TYPE_VALUE],
			["DOMRectReadOnly", base_config_1.TYPE_VALUE],
			["DOMStringList", base_config_1.TYPE_VALUE],
			["DecompressionStream", base_config_1.TYPE_VALUE],
			["DedicatedWorkerGlobalScopeEventMap", base_config_1.TYPE],
			["DedicatedWorkerGlobalScope", base_config_1.TYPE_VALUE],
			["EXT_blend_minmax", base_config_1.TYPE],
			["EXT_color_buffer_float", base_config_1.TYPE],
			["EXT_color_buffer_half_float", base_config_1.TYPE],
			["EXT_float_blend", base_config_1.TYPE],
			["EXT_frag_depth", base_config_1.TYPE],
			["EXT_sRGB", base_config_1.TYPE],
			["EXT_shader_texture_lod", base_config_1.TYPE],
			["EXT_texture_compression_bptc", base_config_1.TYPE],
			["EXT_texture_compression_rgtc", base_config_1.TYPE],
			["EXT_texture_filter_anisotropic", base_config_1.TYPE],
			["EXT_texture_norm16", base_config_1.TYPE],
			["EncodedAudioChunk", base_config_1.TYPE_VALUE],
			["EncodedVideoChunk", base_config_1.TYPE_VALUE],
			["ErrorEvent", base_config_1.TYPE_VALUE],
			["Event", base_config_1.TYPE_VALUE],
			["EventListener", base_config_1.TYPE],
			["EventListenerObject", base_config_1.TYPE],
			["EventSourceEventMap", base_config_1.TYPE],
			["EventSource", base_config_1.TYPE_VALUE],
			["EventTarget", base_config_1.TYPE_VALUE],
			["ExtendableCookieChangeEvent", base_config_1.TYPE_VALUE],
			["ExtendableEvent", base_config_1.TYPE_VALUE],
			["ExtendableMessageEvent", base_config_1.TYPE_VALUE],
			["FetchEvent", base_config_1.TYPE_VALUE],
			["File", base_config_1.TYPE_VALUE],
			["FileList", base_config_1.TYPE_VALUE],
			["FileReaderEventMap", base_config_1.TYPE],
			["FileReader", base_config_1.TYPE_VALUE],
			["FileReaderSync", base_config_1.TYPE_VALUE],
			["FileSystemDirectoryHandle", base_config_1.TYPE_VALUE],
			["FileSystemFileHandle", base_config_1.TYPE_VALUE],
			["FileSystemHandle", base_config_1.TYPE_VALUE],
			["FileSystemSyncAccessHandle", base_config_1.TYPE_VALUE],
			["FileSystemWritableFileStream", base_config_1.TYPE_VALUE],
			["FontFace", base_config_1.TYPE_VALUE],
			["FontFaceSetEventMap", base_config_1.TYPE],
			["FontFaceSet", base_config_1.TYPE_VALUE],
			["FontFaceSetLoadEvent", base_config_1.TYPE_VALUE],
			["FontFaceSource", base_config_1.TYPE],
			["FormData", base_config_1.TYPE_VALUE],
			["GPUError", base_config_1.TYPE],
			["GenericTransformStream", base_config_1.TYPE],
			["Headers", base_config_1.TYPE_VALUE],
			["IDBCursor", base_config_1.TYPE_VALUE],
			["IDBCursorWithValue", base_config_1.TYPE_VALUE],
			["IDBDatabaseEventMap", base_config_1.TYPE],
			["IDBDatabase", base_config_1.TYPE_VALUE],
			["IDBFactory", base_config_1.TYPE_VALUE],
			["IDBIndex", base_config_1.TYPE_VALUE],
			["IDBKeyRange", base_config_1.TYPE_VALUE],
			["IDBObjectStore", base_config_1.TYPE_VALUE],
			["IDBOpenDBRequestEventMap", base_config_1.TYPE],
			["IDBOpenDBRequest", base_config_1.TYPE_VALUE],
			["IDBRequestEventMap", base_config_1.TYPE],
			["IDBRequest", base_config_1.TYPE_VALUE],
			["IDBTransactionEventMap", base_config_1.TYPE],
			["IDBTransaction", base_config_1.TYPE_VALUE],
			["IDBVersionChangeEvent", base_config_1.TYPE_VALUE],
			["ImageBitmap", base_config_1.TYPE_VALUE],
			["ImageBitmapRenderingContext", base_config_1.TYPE_VALUE],
			["ImageData", base_config_1.TYPE_VALUE],
			["ImageDecoder", base_config_1.TYPE_VALUE],
			["ImageTrack", base_config_1.TYPE_VALUE],
			["ImageTrackList", base_config_1.TYPE_VALUE],
			["ImportMeta", base_config_1.TYPE],
			["KHR_parallel_shader_compile", base_config_1.TYPE],
			["Lock", base_config_1.TYPE_VALUE],
			["LockManager", base_config_1.TYPE_VALUE],
			["MediaCapabilities", base_config_1.TYPE_VALUE],
			["MediaSourceHandle", base_config_1.TYPE_VALUE],
			["MediaStreamTrackProcessor", base_config_1.TYPE_VALUE],
			["MessageChannel", base_config_1.TYPE_VALUE],
			["MessageEvent", base_config_1.TYPE_VALUE],
			["MessageEventTargetEventMap", base_config_1.TYPE],
			["MessageEventTarget", base_config_1.TYPE],
			["MessagePortEventMap", base_config_1.TYPE],
			["MessagePort", base_config_1.TYPE_VALUE],
			["NavigationPreloadManager", base_config_1.TYPE_VALUE],
			["NavigatorBadge", base_config_1.TYPE],
			["NavigatorConcurrentHardware", base_config_1.TYPE],
			["NavigatorID", base_config_1.TYPE],
			["NavigatorLanguage", base_config_1.TYPE],
			["NavigatorLocks", base_config_1.TYPE],
			["NavigatorOnLine", base_config_1.TYPE],
			["NavigatorStorage", base_config_1.TYPE],
			["NotificationEventMap", base_config_1.TYPE],
			["Notification", base_config_1.TYPE_VALUE],
			["NotificationEvent", base_config_1.TYPE_VALUE],
			["OES_draw_buffers_indexed", base_config_1.TYPE],
			["OES_element_index_uint", base_config_1.TYPE],
			["OES_fbo_render_mipmap", base_config_1.TYPE],
			["OES_standard_derivatives", base_config_1.TYPE],
			["OES_texture_float", base_config_1.TYPE],
			["OES_texture_float_linear", base_config_1.TYPE],
			["OES_texture_half_float", base_config_1.TYPE],
			["OES_texture_half_float_linear", base_config_1.TYPE],
			["OES_vertex_array_object", base_config_1.TYPE],
			["OVR_multiview2", base_config_1.TYPE],
			["OffscreenCanvasEventMap", base_config_1.TYPE],
			["OffscreenCanvas", base_config_1.TYPE_VALUE],
			["OffscreenCanvasRenderingContext2D", base_config_1.TYPE_VALUE],
			["Path2D", base_config_1.TYPE_VALUE],
			["PerformanceEventMap", base_config_1.TYPE],
			["Performance", base_config_1.TYPE_VALUE],
			["PerformanceEntry", base_config_1.TYPE_VALUE],
			["PerformanceMark", base_config_1.TYPE_VALUE],
			["PerformanceMeasure", base_config_1.TYPE_VALUE],
			["PerformanceObserver", base_config_1.TYPE_VALUE],
			["PerformanceObserverEntryList", base_config_1.TYPE_VALUE],
			["PerformanceResourceTiming", base_config_1.TYPE_VALUE],
			["PerformanceServerTiming", base_config_1.TYPE_VALUE],
			["PermissionStatusEventMap", base_config_1.TYPE],
			["PermissionStatus", base_config_1.TYPE_VALUE],
			["Permissions", base_config_1.TYPE_VALUE],
			["ProgressEvent", base_config_1.TYPE_VALUE],
			["PromiseRejectionEvent", base_config_1.TYPE_VALUE],
			["PushEvent", base_config_1.TYPE_VALUE],
			["PushManager", base_config_1.TYPE_VALUE],
			["PushMessageData", base_config_1.TYPE_VALUE],
			["PushSubscription", base_config_1.TYPE_VALUE],
			["PushSubscriptionChangeEvent", base_config_1.TYPE_VALUE],
			["PushSubscriptionOptions", base_config_1.TYPE_VALUE],
			["RTCDataChannelEventMap", base_config_1.TYPE],
			["RTCDataChannel", base_config_1.TYPE_VALUE],
			["RTCEncodedAudioFrame", base_config_1.TYPE_VALUE],
			["RTCEncodedVideoFrame", base_config_1.TYPE_VALUE],
			["RTCRtpScriptTransformer", base_config_1.TYPE_VALUE],
			["RTCTransformEvent", base_config_1.TYPE_VALUE],
			["ReadableByteStreamController", base_config_1.TYPE_VALUE],
			["ReadableStream", base_config_1.TYPE_VALUE],
			["ReadableStreamBYOBReader", base_config_1.TYPE_VALUE],
			["ReadableStreamBYOBRequest", base_config_1.TYPE_VALUE],
			["ReadableStreamDefaultController", base_config_1.TYPE_VALUE],
			["ReadableStreamDefaultReader", base_config_1.TYPE_VALUE],
			["ReadableStreamGenericReader", base_config_1.TYPE],
			["Report", base_config_1.TYPE_VALUE],
			["ReportBody", base_config_1.TYPE_VALUE],
			["ReportingObserver", base_config_1.TYPE_VALUE],
			["Request", base_config_1.TYPE_VALUE],
			["Response", base_config_1.TYPE_VALUE],
			["SecurityPolicyViolationEvent", base_config_1.TYPE_VALUE],
			["ServiceWorkerEventMap", base_config_1.TYPE],
			["ServiceWorker", base_config_1.TYPE_VALUE],
			["ServiceWorkerContainerEventMap", base_config_1.TYPE],
			["ServiceWorkerContainer", base_config_1.TYPE_VALUE],
			["ServiceWorkerGlobalScopeEventMap", base_config_1.TYPE],
			["ServiceWorkerGlobalScope", base_config_1.TYPE_VALUE],
			["ServiceWorkerRegistrationEventMap", base_config_1.TYPE],
			["ServiceWorkerRegistration", base_config_1.TYPE_VALUE],
			["SharedWorkerGlobalScopeEventMap", base_config_1.TYPE],
			["SharedWorkerGlobalScope", base_config_1.TYPE_VALUE],
			["StorageManager", base_config_1.TYPE_VALUE],
			["StylePropertyMapReadOnly", base_config_1.TYPE_VALUE],
			["SubtleCrypto", base_config_1.TYPE_VALUE],
			["TextDecoder", base_config_1.TYPE_VALUE],
			["TextDecoderCommon", base_config_1.TYPE],
			["TextDecoderStream", base_config_1.TYPE_VALUE],
			["TextEncoder", base_config_1.TYPE_VALUE],
			["TextEncoderCommon", base_config_1.TYPE],
			["TextEncoderStream", base_config_1.TYPE_VALUE],
			["TextMetrics", base_config_1.TYPE_VALUE],
			["TransformStream", base_config_1.TYPE_VALUE],
			["TransformStreamDefaultController", base_config_1.TYPE_VALUE],
			["URL", base_config_1.TYPE_VALUE],
			["URLSearchParams", base_config_1.TYPE_VALUE],
			["VideoColorSpace", base_config_1.TYPE_VALUE],
			["VideoDecoderEventMap", base_config_1.TYPE],
			["VideoDecoder", base_config_1.TYPE_VALUE],
			["VideoEncoderEventMap", base_config_1.TYPE],
			["VideoEncoder", base_config_1.TYPE_VALUE],
			["VideoFrame", base_config_1.TYPE_VALUE],
			["WEBGL_color_buffer_float", base_config_1.TYPE],
			["WEBGL_compressed_texture_astc", base_config_1.TYPE],
			["WEBGL_compressed_texture_etc", base_config_1.TYPE],
			["WEBGL_compressed_texture_etc1", base_config_1.TYPE],
			["WEBGL_compressed_texture_pvrtc", base_config_1.TYPE],
			["WEBGL_compressed_texture_s3tc", base_config_1.TYPE],
			["WEBGL_compressed_texture_s3tc_srgb", base_config_1.TYPE],
			["WEBGL_debug_renderer_info", base_config_1.TYPE],
			["WEBGL_debug_shaders", base_config_1.TYPE],
			["WEBGL_depth_texture", base_config_1.TYPE],
			["WEBGL_draw_buffers", base_config_1.TYPE],
			["WEBGL_lose_context", base_config_1.TYPE],
			["WEBGL_multi_draw", base_config_1.TYPE],
			["WebGL2RenderingContext", base_config_1.TYPE_VALUE],
			["WebGL2RenderingContextBase", base_config_1.TYPE],
			["WebGL2RenderingContextOverloads", base_config_1.TYPE],
			["WebGLActiveInfo", base_config_1.TYPE_VALUE],
			["WebGLBuffer", base_config_1.TYPE_VALUE],
			["WebGLContextEvent", base_config_1.TYPE_VALUE],
			["WebGLFramebuffer", base_config_1.TYPE_VALUE],
			["WebGLProgram", base_config_1.TYPE_VALUE],
			["WebGLQuery", base_config_1.TYPE_VALUE],
			["WebGLRenderbuffer", base_config_1.TYPE_VALUE],
			["WebGLRenderingContext", base_config_1.TYPE_VALUE],
			["WebGLRenderingContextBase", base_config_1.TYPE],
			["WebGLRenderingContextOverloads", base_config_1.TYPE],
			["WebGLSampler", base_config_1.TYPE_VALUE],
			["WebGLShader", base_config_1.TYPE_VALUE],
			["WebGLShaderPrecisionFormat", base_config_1.TYPE_VALUE],
			["WebGLSync", base_config_1.TYPE_VALUE],
			["WebGLTexture", base_config_1.TYPE_VALUE],
			["WebGLTransformFeedback", base_config_1.TYPE_VALUE],
			["WebGLUniformLocation", base_config_1.TYPE_VALUE],
			["WebGLVertexArrayObject", base_config_1.TYPE_VALUE],
			["WebGLVertexArrayObjectOES", base_config_1.TYPE],
			["WebSocketEventMap", base_config_1.TYPE],
			["WebSocket", base_config_1.TYPE_VALUE],
			["WebTransport", base_config_1.TYPE_VALUE],
			["WebTransportBidirectionalStream", base_config_1.TYPE_VALUE],
			["WebTransportDatagramDuplexStream", base_config_1.TYPE_VALUE],
			["WebTransportError", base_config_1.TYPE_VALUE],
			["WindowClient", base_config_1.TYPE_VALUE],
			["WindowOrWorkerGlobalScope", base_config_1.TYPE],
			["WorkerEventMap", base_config_1.TYPE],
			["Worker", base_config_1.TYPE_VALUE],
			["WorkerGlobalScopeEventMap", base_config_1.TYPE],
			["WorkerGlobalScope", base_config_1.TYPE_VALUE],
			["WorkerLocation", base_config_1.TYPE_VALUE],
			["WorkerNavigator", base_config_1.TYPE_VALUE],
			["WritableStream", base_config_1.TYPE_VALUE],
			["WritableStreamDefaultController", base_config_1.TYPE_VALUE],
			["WritableStreamDefaultWriter", base_config_1.TYPE_VALUE],
			["XMLHttpRequestEventMap", base_config_1.TYPE],
			["XMLHttpRequest", base_config_1.TYPE_VALUE],
			["XMLHttpRequestEventTargetEventMap", base_config_1.TYPE],
			["XMLHttpRequestEventTarget", base_config_1.TYPE_VALUE],
			["XMLHttpRequestUpload", base_config_1.TYPE_VALUE],
			["WebAssembly", base_config_1.TYPE_VALUE],
			["Console", base_config_1.TYPE],
			["AudioDataOutputCallback", base_config_1.TYPE],
			["EncodedAudioChunkOutputCallback", base_config_1.TYPE],
			["EncodedVideoChunkOutputCallback", base_config_1.TYPE],
			["FrameRequestCallback", base_config_1.TYPE],
			["LockGrantedCallback", base_config_1.TYPE],
			["OnErrorEventHandlerNonNull", base_config_1.TYPE],
			["PerformanceObserverCallback", base_config_1.TYPE],
			["QueuingStrategySize", base_config_1.TYPE],
			["ReportingObserverCallback", base_config_1.TYPE],
			["TransformerFlushCallback", base_config_1.TYPE],
			["TransformerStartCallback", base_config_1.TYPE],
			["TransformerTransformCallback", base_config_1.TYPE],
			["UnderlyingSinkAbortCallback", base_config_1.TYPE],
			["UnderlyingSinkCloseCallback", base_config_1.TYPE],
			["UnderlyingSinkStartCallback", base_config_1.TYPE],
			["UnderlyingSinkWriteCallback", base_config_1.TYPE],
			["UnderlyingSourceCancelCallback", base_config_1.TYPE],
			["UnderlyingSourcePullCallback", base_config_1.TYPE],
			["UnderlyingSourceStartCallback", base_config_1.TYPE],
			["VideoFrameOutputCallback", base_config_1.TYPE],
			["VoidFunction", base_config_1.TYPE],
			["WebCodecsErrorCallback", base_config_1.TYPE],
			["AlgorithmIdentifier", base_config_1.TYPE],
			["AllowSharedBufferSource", base_config_1.TYPE],
			["BigInteger", base_config_1.TYPE],
			["BlobPart", base_config_1.TYPE],
			["BodyInit", base_config_1.TYPE],
			["BufferSource", base_config_1.TYPE],
			["CSSKeywordish", base_config_1.TYPE],
			["CSSNumberish", base_config_1.TYPE],
			["CSSPerspectiveValue", base_config_1.TYPE],
			["CSSUnparsedSegment", base_config_1.TYPE],
			["CanvasImageSource", base_config_1.TYPE],
			["CookieList", base_config_1.TYPE],
			["DOMHighResTimeStamp", base_config_1.TYPE],
			["EpochTimeStamp", base_config_1.TYPE],
			["EventListenerOrEventListenerObject", base_config_1.TYPE],
			["FileSystemWriteChunkType", base_config_1.TYPE],
			["Float32List", base_config_1.TYPE],
			["FormDataEntryValue", base_config_1.TYPE],
			["GLbitfield", base_config_1.TYPE],
			["GLboolean", base_config_1.TYPE],
			["GLclampf", base_config_1.TYPE],
			["GLenum", base_config_1.TYPE],
			["GLfloat", base_config_1.TYPE],
			["GLint", base_config_1.TYPE],
			["GLint64", base_config_1.TYPE],
			["GLintptr", base_config_1.TYPE],
			["GLsizei", base_config_1.TYPE],
			["GLsizeiptr", base_config_1.TYPE],
			["GLuint", base_config_1.TYPE],
			["GLuint64", base_config_1.TYPE],
			["HashAlgorithmIdentifier", base_config_1.TYPE],
			["HeadersInit", base_config_1.TYPE],
			["IDBValidKey", base_config_1.TYPE],
			["ImageBitmapSource", base_config_1.TYPE],
			["ImageBufferSource", base_config_1.TYPE],
			["ImageDataArray", base_config_1.TYPE],
			["Int32List", base_config_1.TYPE],
			["MessageEventSource", base_config_1.TYPE],
			["NamedCurve", base_config_1.TYPE],
			["OffscreenRenderingContext", base_config_1.TYPE],
			["OnErrorEventHandler", base_config_1.TYPE],
			["PerformanceEntryList", base_config_1.TYPE],
			["PushMessageDataInit", base_config_1.TYPE],
			["ReadableStreamController", base_config_1.TYPE],
			["ReadableStreamReadResult", base_config_1.TYPE],
			["ReadableStreamReader", base_config_1.TYPE],
			["ReportList", base_config_1.TYPE],
			["RequestInfo", base_config_1.TYPE],
			["TexImageSource", base_config_1.TYPE],
			["TimerHandler", base_config_1.TYPE],
			["Transferable", base_config_1.TYPE],
			["Uint32List", base_config_1.TYPE],
			["XMLHttpRequestBodyInit", base_config_1.TYPE],
			["AlphaOption", base_config_1.TYPE],
			["AudioSampleFormat", base_config_1.TYPE],
			["AvcBitstreamFormat", base_config_1.TYPE],
			["BinaryType", base_config_1.TYPE],
			["BitrateMode", base_config_1.TYPE],
			["CSSMathOperator", base_config_1.TYPE],
			["CSSNumericBaseType", base_config_1.TYPE],
			["CanvasDirection", base_config_1.TYPE],
			["CanvasFillRule", base_config_1.TYPE],
			["CanvasFontKerning", base_config_1.TYPE],
			["CanvasFontStretch", base_config_1.TYPE],
			["CanvasFontVariantCaps", base_config_1.TYPE],
			["CanvasLineCap", base_config_1.TYPE],
			["CanvasLineJoin", base_config_1.TYPE],
			["CanvasTextAlign", base_config_1.TYPE],
			["CanvasTextBaseline", base_config_1.TYPE],
			["CanvasTextRendering", base_config_1.TYPE],
			["ClientTypes", base_config_1.TYPE],
			["CodecState", base_config_1.TYPE],
			["ColorGamut", base_config_1.TYPE],
			["ColorSpaceConversion", base_config_1.TYPE],
			["CompressionFormat", base_config_1.TYPE],
			["CookieSameSite", base_config_1.TYPE],
			["DocumentVisibilityState", base_config_1.TYPE],
			["EncodedAudioChunkType", base_config_1.TYPE],
			["EncodedVideoChunkType", base_config_1.TYPE],
			["EndingType", base_config_1.TYPE],
			["FileSystemHandleKind", base_config_1.TYPE],
			["FontDisplay", base_config_1.TYPE],
			["FontFaceLoadStatus", base_config_1.TYPE],
			["FontFaceSetLoadStatus", base_config_1.TYPE],
			["FrameType", base_config_1.TYPE],
			["GlobalCompositeOperation", base_config_1.TYPE],
			["HardwareAcceleration", base_config_1.TYPE],
			["HdrMetadataType", base_config_1.TYPE],
			["IDBCursorDirection", base_config_1.TYPE],
			["IDBRequestReadyState", base_config_1.TYPE],
			["IDBTransactionDurability", base_config_1.TYPE],
			["IDBTransactionMode", base_config_1.TYPE],
			["ImageOrientation", base_config_1.TYPE],
			["ImageSmoothingQuality", base_config_1.TYPE],
			["KeyFormat", base_config_1.TYPE],
			["KeyType", base_config_1.TYPE],
			["KeyUsage", base_config_1.TYPE],
			["LatencyMode", base_config_1.TYPE],
			["LockMode", base_config_1.TYPE],
			["MediaDecodingType", base_config_1.TYPE],
			["MediaEncodingType", base_config_1.TYPE],
			["MediaKeysRequirement", base_config_1.TYPE],
			["NotificationDirection", base_config_1.TYPE],
			["NotificationPermission", base_config_1.TYPE],
			["OffscreenRenderingContextId", base_config_1.TYPE],
			["OpusBitstreamFormat", base_config_1.TYPE],
			["PermissionName", base_config_1.TYPE],
			["PermissionState", base_config_1.TYPE],
			["PredefinedColorSpace", base_config_1.TYPE],
			["PremultiplyAlpha", base_config_1.TYPE],
			["PushEncryptionKeyName", base_config_1.TYPE],
			["RTCDataChannelState", base_config_1.TYPE],
			["RTCEncodedVideoFrameType", base_config_1.TYPE],
			["ReadableStreamReaderMode", base_config_1.TYPE],
			["ReadableStreamType", base_config_1.TYPE],
			["ReferrerPolicy", base_config_1.TYPE],
			["RequestCache", base_config_1.TYPE],
			["RequestCredentials", base_config_1.TYPE],
			["RequestDestination", base_config_1.TYPE],
			["RequestMode", base_config_1.TYPE],
			["RequestPriority", base_config_1.TYPE],
			["RequestRedirect", base_config_1.TYPE],
			["ResizeQuality", base_config_1.TYPE],
			["ResponseType", base_config_1.TYPE],
			["SecurityPolicyViolationEventDisposition", base_config_1.TYPE],
			["ServiceWorkerState", base_config_1.TYPE],
			["ServiceWorkerUpdateViaCache", base_config_1.TYPE],
			["TransferFunction", base_config_1.TYPE],
			["VideoColorPrimaries", base_config_1.TYPE],
			["VideoEncoderBitrateMode", base_config_1.TYPE],
			["VideoMatrixCoefficients", base_config_1.TYPE],
			["VideoPixelFormat", base_config_1.TYPE],
			["VideoTransferCharacteristics", base_config_1.TYPE],
			["WebGLPowerPreference", base_config_1.TYPE],
			["WebTransportCongestionControl", base_config_1.TYPE],
			["WebTransportErrorSource", base_config_1.TYPE],
			["WorkerType", base_config_1.TYPE],
			["WriteCommandType", base_config_1.TYPE],
			["XMLHttpRequestResponseType", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/webworker.asynciterable.js
var require_webworker_asynciterable = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.webworker_asynciterable = void 0;
	const base_config_1 = require_base_config();
	exports.webworker_asynciterable = {
		libs: [],
		variables: [
			["FileSystemDirectoryHandleAsyncIterator", base_config_1.TYPE],
			["FileSystemDirectoryHandle", base_config_1.TYPE],
			["ReadableStreamAsyncIterator", base_config_1.TYPE],
			["ReadableStream", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/webworker.iterable.js
var require_webworker_iterable = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.webworker_iterable = void 0;
	const base_config_1 = require_base_config();
	exports.webworker_iterable = {
		libs: [],
		variables: [
			["CSSNumericArray", base_config_1.TYPE],
			["CSSTransformValue", base_config_1.TYPE],
			["CSSUnparsedValue", base_config_1.TYPE],
			["Cache", base_config_1.TYPE],
			["CanvasPath", base_config_1.TYPE],
			["CanvasPathDrawingStyles", base_config_1.TYPE],
			["CookieStoreManager", base_config_1.TYPE],
			["DOMStringList", base_config_1.TYPE],
			["FileList", base_config_1.TYPE],
			["FontFaceSet", base_config_1.TYPE],
			["FormDataIterator", base_config_1.TYPE],
			["FormData", base_config_1.TYPE],
			["HeadersIterator", base_config_1.TYPE],
			["Headers", base_config_1.TYPE],
			["IDBDatabase", base_config_1.TYPE],
			["IDBObjectStore", base_config_1.TYPE],
			["ImageTrackList", base_config_1.TYPE],
			["MessageEvent", base_config_1.TYPE],
			["StylePropertyMapReadOnlyIterator", base_config_1.TYPE],
			["StylePropertyMapReadOnly", base_config_1.TYPE],
			["SubtleCrypto", base_config_1.TYPE],
			["URLSearchParamsIterator", base_config_1.TYPE],
			["URLSearchParams", base_config_1.TYPE],
			["WEBGL_draw_buffers", base_config_1.TYPE],
			["WEBGL_multi_draw", base_config_1.TYPE],
			["WebGL2RenderingContextBase", base_config_1.TYPE],
			["WebGL2RenderingContextOverloads", base_config_1.TYPE],
			["WebGLRenderingContextBase", base_config_1.TYPE],
			["WebGLRenderingContextOverloads", base_config_1.TYPE]
		]
	};
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/lib/index.js
var require_lib = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.lib = void 0;
	const decorators_1 = require_decorators();
	const decorators_legacy_1 = require_decorators_legacy();
	const dom_1 = require_dom();
	const dom_asynciterable_1 = require_dom_asynciterable();
	const dom_iterable_1 = require_dom_iterable();
	const es5_1 = require_es5();
	const es6_1 = require_es6();
	const es7_1 = require_es7();
	const es2015_1 = require_es2015();
	const es2015_collection_1 = require_es2015_collection();
	const es2015_core_1 = require_es2015_core();
	const es2015_generator_1 = require_es2015_generator();
	const es2015_iterable_1 = require_es2015_iterable();
	const es2015_promise_1 = require_es2015_promise();
	const es2015_proxy_1 = require_es2015_proxy();
	const es2015_reflect_1 = require_es2015_reflect();
	const es2015_symbol_1 = require_es2015_symbol();
	const es2015_symbol_wellknown_1 = require_es2015_symbol_wellknown();
	const es2016_1 = require_es2016();
	const es2016_array_include_1 = require_es2016_array_include();
	const es2016_full_1 = require_es2016_full();
	const es2016_intl_1 = require_es2016_intl();
	const es2017_1 = require_es2017();
	const es2017_arraybuffer_1 = require_es2017_arraybuffer();
	const es2017_date_1 = require_es2017_date();
	const es2017_full_1 = require_es2017_full();
	const es2017_intl_1 = require_es2017_intl();
	const es2017_object_1 = require_es2017_object();
	const es2017_sharedmemory_1 = require_es2017_sharedmemory();
	const es2017_string_1 = require_es2017_string();
	const es2017_typedarrays_1 = require_es2017_typedarrays();
	const es2018_1 = require_es2018();
	const es2018_asyncgenerator_1 = require_es2018_asyncgenerator();
	const es2018_asynciterable_1 = require_es2018_asynciterable();
	const es2018_full_1 = require_es2018_full();
	const es2018_intl_1 = require_es2018_intl();
	const es2018_promise_1 = require_es2018_promise();
	const es2018_regexp_1 = require_es2018_regexp();
	const es2019_1 = require_es2019();
	const es2019_array_1 = require_es2019_array();
	const es2019_full_1 = require_es2019_full();
	const es2019_intl_1 = require_es2019_intl();
	const es2019_object_1 = require_es2019_object();
	const es2019_string_1 = require_es2019_string();
	const es2019_symbol_1 = require_es2019_symbol();
	const es2020_1 = require_es2020();
	const es2020_bigint_1 = require_es2020_bigint();
	const es2020_date_1 = require_es2020_date();
	const es2020_full_1 = require_es2020_full();
	const es2020_intl_1 = require_es2020_intl();
	const es2020_number_1 = require_es2020_number();
	const es2020_promise_1 = require_es2020_promise();
	const es2020_sharedmemory_1 = require_es2020_sharedmemory();
	const es2020_string_1 = require_es2020_string();
	const es2020_symbol_wellknown_1 = require_es2020_symbol_wellknown();
	const es2021_1 = require_es2021();
	const es2021_full_1 = require_es2021_full();
	const es2021_intl_1 = require_es2021_intl();
	const es2021_promise_1 = require_es2021_promise();
	const es2021_string_1 = require_es2021_string();
	const es2021_weakref_1 = require_es2021_weakref();
	const es2022_1 = require_es2022();
	const es2022_array_1 = require_es2022_array();
	const es2022_error_1 = require_es2022_error();
	const es2022_full_1 = require_es2022_full();
	const es2022_intl_1 = require_es2022_intl();
	const es2022_object_1 = require_es2022_object();
	const es2022_regexp_1 = require_es2022_regexp();
	const es2022_string_1 = require_es2022_string();
	const es2023_1 = require_es2023();
	const es2023_array_1 = require_es2023_array();
	const es2023_collection_1 = require_es2023_collection();
	const es2023_full_1 = require_es2023_full();
	const es2023_intl_1 = require_es2023_intl();
	const es2024_1 = require_es2024();
	const es2024_arraybuffer_1 = require_es2024_arraybuffer();
	const es2024_collection_1 = require_es2024_collection();
	const es2024_full_1 = require_es2024_full();
	const es2024_object_1 = require_es2024_object();
	const es2024_promise_1 = require_es2024_promise();
	const es2024_regexp_1 = require_es2024_regexp();
	const es2024_sharedmemory_1 = require_es2024_sharedmemory();
	const es2024_string_1 = require_es2024_string();
	const esnext_1 = require_esnext();
	const esnext_array_1 = require_esnext_array();
	const esnext_asynciterable_1 = require_esnext_asynciterable();
	const esnext_bigint_1 = require_esnext_bigint();
	const esnext_collection_1 = require_esnext_collection();
	const esnext_decorators_1 = require_esnext_decorators();
	const esnext_disposable_1 = require_esnext_disposable();
	const esnext_error_1 = require_esnext_error();
	const esnext_float16_1 = require_esnext_float16();
	const esnext_full_1 = require_esnext_full();
	const esnext_intl_1 = require_esnext_intl();
	const esnext_iterator_1 = require_esnext_iterator();
	const esnext_object_1 = require_esnext_object();
	const esnext_promise_1 = require_esnext_promise();
	const esnext_regexp_1 = require_esnext_regexp();
	const esnext_sharedmemory_1 = require_esnext_sharedmemory();
	const esnext_string_1 = require_esnext_string();
	const esnext_symbol_1 = require_esnext_symbol();
	const esnext_weakref_1 = require_esnext_weakref();
	const lib_1 = require_lib$1();
	const scripthost_1 = require_scripthost();
	const webworker_1 = require_webworker();
	const webworker_asynciterable_1 = require_webworker_asynciterable();
	const webworker_importscripts_1 = require_webworker_importscripts();
	const webworker_iterable_1 = require_webworker_iterable();
	exports.lib = new Map([
		["es5", es5_1.es5],
		["es6", es6_1.es6],
		["es2015", es2015_1.es2015],
		["es7", es7_1.es7],
		["es2016", es2016_1.es2016],
		["es2017", es2017_1.es2017],
		["es2018", es2018_1.es2018],
		["es2019", es2019_1.es2019],
		["es2020", es2020_1.es2020],
		["es2021", es2021_1.es2021],
		["es2022", es2022_1.es2022],
		["es2023", es2023_1.es2023],
		["es2024", es2024_1.es2024],
		["esnext", esnext_1.esnext],
		["dom", dom_1.dom],
		["dom.iterable", dom_iterable_1.dom_iterable],
		["dom.asynciterable", dom_asynciterable_1.dom_asynciterable],
		["webworker", webworker_1.webworker],
		["webworker.importscripts", webworker_importscripts_1.webworker_importscripts],
		["webworker.iterable", webworker_iterable_1.webworker_iterable],
		["webworker.asynciterable", webworker_asynciterable_1.webworker_asynciterable],
		["scripthost", scripthost_1.scripthost],
		["es2015.core", es2015_core_1.es2015_core],
		["es2015.collection", es2015_collection_1.es2015_collection],
		["es2015.generator", es2015_generator_1.es2015_generator],
		["es2015.iterable", es2015_iterable_1.es2015_iterable],
		["es2015.promise", es2015_promise_1.es2015_promise],
		["es2015.proxy", es2015_proxy_1.es2015_proxy],
		["es2015.reflect", es2015_reflect_1.es2015_reflect],
		["es2015.symbol", es2015_symbol_1.es2015_symbol],
		["es2015.symbol.wellknown", es2015_symbol_wellknown_1.es2015_symbol_wellknown],
		["es2016.array.include", es2016_array_include_1.es2016_array_include],
		["es2016.intl", es2016_intl_1.es2016_intl],
		["es2017.arraybuffer", es2017_arraybuffer_1.es2017_arraybuffer],
		["es2017.date", es2017_date_1.es2017_date],
		["es2017.object", es2017_object_1.es2017_object],
		["es2017.sharedmemory", es2017_sharedmemory_1.es2017_sharedmemory],
		["es2017.string", es2017_string_1.es2017_string],
		["es2017.intl", es2017_intl_1.es2017_intl],
		["es2017.typedarrays", es2017_typedarrays_1.es2017_typedarrays],
		["es2018.asyncgenerator", es2018_asyncgenerator_1.es2018_asyncgenerator],
		["es2018.asynciterable", es2018_asynciterable_1.es2018_asynciterable],
		["es2018.intl", es2018_intl_1.es2018_intl],
		["es2018.promise", es2018_promise_1.es2018_promise],
		["es2018.regexp", es2018_regexp_1.es2018_regexp],
		["es2019.array", es2019_array_1.es2019_array],
		["es2019.object", es2019_object_1.es2019_object],
		["es2019.string", es2019_string_1.es2019_string],
		["es2019.symbol", es2019_symbol_1.es2019_symbol],
		["es2019.intl", es2019_intl_1.es2019_intl],
		["es2020.bigint", es2020_bigint_1.es2020_bigint],
		["es2020.date", es2020_date_1.es2020_date],
		["es2020.promise", es2020_promise_1.es2020_promise],
		["es2020.sharedmemory", es2020_sharedmemory_1.es2020_sharedmemory],
		["es2020.string", es2020_string_1.es2020_string],
		["es2020.symbol.wellknown", es2020_symbol_wellknown_1.es2020_symbol_wellknown],
		["es2020.intl", es2020_intl_1.es2020_intl],
		["es2020.number", es2020_number_1.es2020_number],
		["es2021.promise", es2021_promise_1.es2021_promise],
		["es2021.string", es2021_string_1.es2021_string],
		["es2021.weakref", es2021_weakref_1.es2021_weakref],
		["es2021.intl", es2021_intl_1.es2021_intl],
		["es2022.array", es2022_array_1.es2022_array],
		["es2022.error", es2022_error_1.es2022_error],
		["es2022.intl", es2022_intl_1.es2022_intl],
		["es2022.object", es2022_object_1.es2022_object],
		["es2022.string", es2022_string_1.es2022_string],
		["es2022.regexp", es2022_regexp_1.es2022_regexp],
		["es2023.array", es2023_array_1.es2023_array],
		["es2023.collection", es2023_collection_1.es2023_collection],
		["es2023.intl", es2023_intl_1.es2023_intl],
		["es2024.arraybuffer", es2024_arraybuffer_1.es2024_arraybuffer],
		["es2024.collection", es2024_collection_1.es2024_collection],
		["es2024.object", es2024_object_1.es2024_object],
		["es2024.promise", es2024_promise_1.es2024_promise],
		["es2024.regexp", es2024_regexp_1.es2024_regexp],
		["es2024.sharedmemory", es2024_sharedmemory_1.es2024_sharedmemory],
		["es2024.string", es2024_string_1.es2024_string],
		["esnext.array", esnext_array_1.esnext_array],
		["esnext.collection", esnext_collection_1.esnext_collection],
		["esnext.symbol", esnext_symbol_1.esnext_symbol],
		["esnext.asynciterable", esnext_asynciterable_1.esnext_asynciterable],
		["esnext.intl", esnext_intl_1.esnext_intl],
		["esnext.disposable", esnext_disposable_1.esnext_disposable],
		["esnext.bigint", esnext_bigint_1.esnext_bigint],
		["esnext.string", esnext_string_1.esnext_string],
		["esnext.promise", esnext_promise_1.esnext_promise],
		["esnext.weakref", esnext_weakref_1.esnext_weakref],
		["esnext.decorators", esnext_decorators_1.esnext_decorators],
		["esnext.object", esnext_object_1.esnext_object],
		["esnext.regexp", esnext_regexp_1.esnext_regexp],
		["esnext.iterator", esnext_iterator_1.esnext_iterator],
		["esnext.float16", esnext_float16_1.esnext_float16],
		["esnext.error", esnext_error_1.esnext_error],
		["esnext.sharedmemory", esnext_sharedmemory_1.esnext_sharedmemory],
		["decorators", decorators_1.decorators],
		["decorators.legacy", decorators_legacy_1.decorators_legacy],
		["es2016.full", es2016_full_1.es2016_full],
		["es2017.full", es2017_full_1.es2017_full],
		["es2018.full", es2018_full_1.es2018_full],
		["es2019.full", es2019_full_1.es2019_full],
		["es2020.full", es2020_full_1.es2020_full],
		["es2021.full", es2021_full_1.es2021_full],
		["es2022.full", es2022_full_1.es2022_full],
		["es2023.full", es2023_full_1.es2023_full],
		["es2024.full", es2024_full_1.es2024_full],
		["esnext.full", esnext_full_1.esnext_full],
		["lib", lib_1.lib]
	]);
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/referencer/Reference.js
var require_Reference = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Reference = exports.ReferenceTypeFlag = exports.ReferenceFlag = void 0;
	const ID_1 = require_ID();
	var ReferenceFlag;
	(function(ReferenceFlag) {
		ReferenceFlag[ReferenceFlag["Read"] = 1] = "Read";
		ReferenceFlag[ReferenceFlag["Write"] = 2] = "Write";
		ReferenceFlag[ReferenceFlag["ReadWrite"] = 3] = "ReadWrite";
	})(ReferenceFlag || (exports.ReferenceFlag = ReferenceFlag = {}));
	const generator = (0, ID_1.createIdGenerator)();
	var ReferenceTypeFlag;
	(function(ReferenceTypeFlag) {
		ReferenceTypeFlag[ReferenceTypeFlag["Value"] = 1] = "Value";
		ReferenceTypeFlag[ReferenceTypeFlag["Type"] = 2] = "Type";
	})(ReferenceTypeFlag || (exports.ReferenceTypeFlag = ReferenceTypeFlag = {}));
	/**
	* A Reference represents a single occurrence of an identifier in code.
	*/
	var Reference = class {
		/**
		* A unique ID for this instance - primarily used to help debugging and testing
		*/
		$id = generator();
		/**
		* The read-write mode of the reference.
		*/
		#flag;
		/**
		* Reference to the enclosing Scope.
		* @public
		*/
		from;
		/**
		* Identifier syntax node.
		* @public
		*/
		identifier;
		/**
		* `true` if this writing reference is a variable initializer or a default value.
		* @public
		*/
		init;
		maybeImplicitGlobal;
		/**
		* The {@link Variable} object that this reference refers to. If such variable was not defined, this is `null`.
		* @public
		*/
		resolved;
		/**
		* If reference is writeable, this is the node being written to it.
		* @public
		*/
		writeExpr;
		/**
		* In some cases, a reference may be a type, value or both a type and value reference.
		*/
		#referenceType;
		constructor(identifier, scope, flag, writeExpr, maybeImplicitGlobal, init, referenceType = ReferenceTypeFlag.Value) {
			this.identifier = identifier;
			this.from = scope;
			this.resolved = null;
			this.#flag = flag;
			if (this.isWrite()) {
				this.writeExpr = writeExpr;
				this.init = init;
			}
			this.maybeImplicitGlobal = maybeImplicitGlobal;
			this.#referenceType = referenceType;
		}
		/**
		* True if this reference can reference types
		*/
		get isTypeReference() {
			return (this.#referenceType & ReferenceTypeFlag.Type) !== 0;
		}
		/**
		* True if this reference can reference values
		*/
		get isValueReference() {
			return (this.#referenceType & ReferenceTypeFlag.Value) !== 0;
		}
		/**
		* Whether the reference is writeable.
		* @public
		*/
		isWrite() {
			return !!(this.#flag & ReferenceFlag.Write);
		}
		/**
		* Whether the reference is readable.
		* @public
		*/
		isRead() {
			return !!(this.#flag & ReferenceFlag.Read);
		}
		/**
		* Whether the reference is read-only.
		* @public
		*/
		isReadOnly() {
			return this.#flag === ReferenceFlag.Read;
		}
		/**
		* Whether the reference is write-only.
		* @public
		*/
		isWriteOnly() {
			return this.#flag === ReferenceFlag.Write;
		}
		/**
		* Whether the reference is read-write.
		* @public
		*/
		isReadWrite() {
			return this.#flag === ReferenceFlag.ReadWrite;
		}
	};
	exports.Reference = Reference;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/variable/VariableBase.js
var require_VariableBase = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.VariableBase = void 0;
	const generator = (0, require_ID().createIdGenerator)();
	var VariableBase = class {
		/**
		* A unique ID for this instance - primarily used to help debugging and testing
		*/
		$id = generator();
		/**
		* The array of the definitions of this variable.
		* @public
		*/
		defs = [];
		/**
		* True if the variable is considered used for the purposes of `no-unused-vars`, false otherwise.
		* @public
		*/
		eslintUsed = false;
		/**
		* The array of `Identifier` nodes which define this variable.
		* If this variable is redeclared, this array includes two or more nodes.
		* @public
		*/
		identifiers = [];
		/**
		* The variable name, as given in the source code.
		* @public
		*/
		name;
		/**
		* List of {@link Reference} of this variable (excluding parameter entries)  in its defining scope and all nested scopes.
		* For defining occurrences only see {@link Variable#defs}.
		* @public
		*/
		references = [];
		/**
		* Reference to the enclosing Scope.
		*/
		scope;
		constructor(name$1, scope) {
			this.name = name$1;
			this.scope = scope;
		}
	};
	exports.VariableBase = VariableBase;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/variable/ESLintScopeVariable.js
var require_ESLintScopeVariable = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ESLintScopeVariable = void 0;
	const VariableBase_1 = require_VariableBase();
	/**
	* ESLint defines global variables using the eslint-scope Variable class
	* This is declared here for consumers to use
	*/
	var ESLintScopeVariable = class extends VariableBase_1.VariableBase {
		/**
		* Written to by ESLint.
		* If this key exists, this variable is a global variable added by ESLint.
		* If this is `true`, this variable can be assigned arbitrary values.
		* If this is `false`, this variable is readonly.
		*/
		writeable;
		/**
		* Written to by ESLint.
		* This property is undefined if there are no globals comment directives.
		* The array of globals comment directives which defined this global variable in the source code file.
		*/
		eslintExplicitGlobal;
		/**
		* Written to by ESLint.
		* The configured value in config files. This can be different from `variable.writeable` if there are globals comment directives.
		*/
		eslintImplicitGlobalSetting;
		/**
		* Written to by ESLint.
		* If this key exists, it is a global variable added by ESLint.
		* If `true`, this global variable was defined by a globals comment directive in the source code file.
		*/
		eslintExplicitGlobalComments;
	};
	exports.ESLintScopeVariable = ESLintScopeVariable;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/variable/ImplicitLibVariable.js
var require_ImplicitLibVariable = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ImplicitLibVariable = void 0;
	const ESLintScopeVariable_1 = require_ESLintScopeVariable();
	/**
	* An variable implicitly defined by the TS Lib
	*/
	var ImplicitLibVariable = class extends ESLintScopeVariable_1.ESLintScopeVariable {
		/**
		* `true` if the variable is valid in a type context, false otherwise
		*/
		isTypeVariable;
		/**
		* `true` if the variable is valid in a value context, false otherwise
		*/
		isValueVariable;
		constructor(scope, name$1, { eslintImplicitGlobalSetting, isTypeVariable, isValueVariable, writeable }) {
			super(name$1, scope);
			this.isTypeVariable = isTypeVariable ?? false;
			this.isValueVariable = isValueVariable ?? false;
			this.writeable = writeable ?? false;
			this.eslintImplicitGlobalSetting = eslintImplicitGlobalSetting ?? "readonly";
		}
	};
	exports.ImplicitLibVariable = ImplicitLibVariable;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/variable/Variable.js
var require_Variable = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Variable = void 0;
	const VariableBase_1 = require_VariableBase();
	/**
	* A Variable represents a locally scoped identifier. These include arguments to functions.
	*/
	var Variable = class extends VariableBase_1.VariableBase {
		/**
		* `true` if the variable is valid in a type context, false otherwise
		* @public
		*/
		get isTypeVariable() {
			if (this.defs.length === 0) return true;
			return this.defs.some((def) => def.isTypeDefinition);
		}
		/**
		* `true` if the variable is valid in a value context, false otherwise
		* @public
		*/
		get isValueVariable() {
			if (this.defs.length === 0) return true;
			return this.defs.some((def) => def.isVariableDefinition);
		}
	};
	exports.Variable = Variable;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/variable/index.js
var require_variable = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Variable = exports.ImplicitLibVariable = exports.ESLintScopeVariable = void 0;
	var ESLintScopeVariable_1 = require_ESLintScopeVariable();
	Object.defineProperty(exports, "ESLintScopeVariable", {
		enumerable: true,
		get: function() {
			return ESLintScopeVariable_1.ESLintScopeVariable;
		}
	});
	var ImplicitLibVariable_1 = require_ImplicitLibVariable();
	Object.defineProperty(exports, "ImplicitLibVariable", {
		enumerable: true,
		get: function() {
			return ImplicitLibVariable_1.ImplicitLibVariable;
		}
	});
	var Variable_1 = require_Variable();
	Object.defineProperty(exports, "Variable", {
		enumerable: true,
		get: function() {
			return Variable_1.Variable;
		}
	});
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/scope/ScopeType.js
var require_ScopeType = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ScopeType = void 0;
	var ScopeType;
	(function(ScopeType) {
		ScopeType["block"] = "block";
		ScopeType["catch"] = "catch";
		ScopeType["class"] = "class";
		ScopeType["classFieldInitializer"] = "class-field-initializer";
		ScopeType["classStaticBlock"] = "class-static-block";
		ScopeType["conditionalType"] = "conditionalType";
		ScopeType["for"] = "for";
		ScopeType["function"] = "function";
		ScopeType["functionExpressionName"] = "function-expression-name";
		ScopeType["functionType"] = "functionType";
		ScopeType["global"] = "global";
		ScopeType["mappedType"] = "mappedType";
		ScopeType["module"] = "module";
		ScopeType["switch"] = "switch";
		ScopeType["tsEnum"] = "tsEnum";
		ScopeType["tsModule"] = "tsModule";
		ScopeType["type"] = "type";
		ScopeType["with"] = "with";
	})(ScopeType || (exports.ScopeType = ScopeType = {}));
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/scope/ScopeBase.js
var require_ScopeBase = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ScopeBase = void 0;
	const types_1 = require_dist$3();
	const assert_1 = require_assert();
	const definition_1 = require_definition();
	const ID_1 = require_ID();
	const Reference_1 = require_Reference();
	const variable_1 = require_variable();
	const ScopeType_1 = require_ScopeType();
	/**
	* Test if scope is strict
	*/
	function isStrictScope(scope, block, isMethodDefinition) {
		let body;
		if (scope.upper?.isStrict) return true;
		if (isMethodDefinition) return true;
		if (scope.type === ScopeType_1.ScopeType.class || scope.type === ScopeType_1.ScopeType.conditionalType || scope.type === ScopeType_1.ScopeType.functionType || scope.type === ScopeType_1.ScopeType.mappedType || scope.type === ScopeType_1.ScopeType.module || scope.type === ScopeType_1.ScopeType.tsEnum || scope.type === ScopeType_1.ScopeType.tsModule || scope.type === ScopeType_1.ScopeType.type) return true;
		if (scope.type === ScopeType_1.ScopeType.block || scope.type === ScopeType_1.ScopeType.switch) return false;
		if (scope.type === ScopeType_1.ScopeType.function) {
			const functionBody = block;
			switch (functionBody.type) {
				case types_1.AST_NODE_TYPES.ArrowFunctionExpression:
					if (functionBody.body.type !== types_1.AST_NODE_TYPES.BlockStatement) return false;
					body = functionBody.body;
					break;
				case types_1.AST_NODE_TYPES.Program:
					body = functionBody;
					break;
				default: body = functionBody.body;
			}
			if (!body) return false;
		} else if (scope.type === ScopeType_1.ScopeType.global) body = block;
		else return false;
		for (const stmt of body.body) {
			if (stmt.type !== types_1.AST_NODE_TYPES.ExpressionStatement) break;
			if (stmt.directive === "use strict") return true;
			const expr = stmt.expression;
			if (expr.type !== types_1.AST_NODE_TYPES.Literal) break;
			if (expr.raw === "\"use strict\"" || expr.raw === "'use strict'") return true;
			if (expr.value === "use strict") return true;
		}
		return false;
	}
	function registerScope(scopeManager, scope) {
		scopeManager.scopes.push(scope);
		const scopes = scopeManager.nodeToScope.get(scope.block);
		if (scopes) scopes.push(scope);
		else scopeManager.nodeToScope.set(scope.block, [scope]);
	}
	const generator = (0, ID_1.createIdGenerator)();
	const VARIABLE_SCOPE_TYPES = new Set([
		ScopeType_1.ScopeType.classFieldInitializer,
		ScopeType_1.ScopeType.classStaticBlock,
		ScopeType_1.ScopeType.function,
		ScopeType_1.ScopeType.global,
		ScopeType_1.ScopeType.module,
		ScopeType_1.ScopeType.tsModule
	]);
	var ScopeBase = class {
		/**
		* A unique ID for this instance - primarily used to help debugging and testing
		*/
		$id = generator();
		/**
		* The AST node which created this scope.
		* @public
		*/
		block;
		/**
		* The array of child scopes. This does not include grandchild scopes.
		* @public
		*/
		childScopes = [];
		/**
		* A map of the variables for each node in this scope.
		* This is map is a pointer to the one in the parent ScopeManager instance
		*/
		#declaredVariables;
		/**
		* Generally, through the lexical scoping of JS you can always know which variable an identifier in the source code
		* refers to. There are a few exceptions to this rule. With `global` and `with` scopes you can only decide at runtime
		* which variable a reference refers to.
		* All those scopes are considered "dynamic".
		*/
		#dynamic;
		/**
		* Whether this scope is created by a FunctionExpression.
		* @public
		*/
		functionExpressionScope = false;
		/**
		* Whether 'use strict' is in effect in this scope.
		* @public
		*/
		isStrict;
		/**
		* List of {@link Reference}s that are left to be resolved (i.e. which
		* need to be linked to the variable they refer to).
		*/
		leftToResolve = [];
		/**
		* Any variable {@link Reference} found in this scope.
		* This includes occurrences of local variables as well as variables from parent scopes (including the global scope).
		* For local variables this also includes defining occurrences (like in a 'var' statement).
		* In a 'function' scope this does not include the occurrences of the formal parameter in the parameter list.
		* @public
		*/
		references = [];
		/**
		* The map from variable names to variable objects.
		* @public
		*/
		set = /* @__PURE__ */ new Map();
		/**
		* The {@link Reference}s that are not resolved with this scope.
		* @public
		*/
		through = [];
		type;
		/**
		* Reference to the parent {@link Scope}.
		* @public
		*/
		upper;
		/**
		* The scoped {@link Variable}s of this scope.
		* In the case of a 'function' scope this includes the automatic argument `arguments` as its first element, as well
		* as all further formal arguments.
		* This does not include variables which are defined in child scopes.
		* @public
		*/
		variables = [];
		/**
		* For scopes that can contain variable declarations, this is a self-reference.
		* For other scope types this is the *variableScope* value of the parent scope.
		* @public
		*/
		#dynamicCloseRef = (ref) => {
			let current = this;
			do {
				current.through.push(ref);
				current = current.upper;
			} while (current);
		};
		#globalCloseRef = (ref, scopeManager) => {
			if (this.shouldStaticallyCloseForGlobal(ref, scopeManager)) this.#staticCloseRef(ref);
			else this.#dynamicCloseRef(ref);
		};
		#staticCloseRef = (ref) => {
			const resolve = () => {
				const name$1 = ref.identifier.name;
				const variable = this.set.get(name$1);
				if (!variable) return false;
				if (!this.isValidResolution(ref, variable)) return false;
				const isValidTypeReference = ref.isTypeReference && variable.isTypeVariable;
				const isValidValueReference = ref.isValueReference && variable.isValueVariable;
				if (!isValidTypeReference && !isValidValueReference) return false;
				variable.references.push(ref);
				ref.resolved = variable;
				return true;
			};
			if (!resolve()) this.delegateToUpperScope(ref);
		};
		variableScope;
		constructor(scopeManager, type, upperScope, block, isMethodDefinition) {
			const upperScopeAsScopeBase = upperScope;
			this.type = type;
			this.#dynamic = this.type === ScopeType_1.ScopeType.global || this.type === ScopeType_1.ScopeType.with;
			this.block = block;
			this.variableScope = this.isVariableScope() ? this : upperScopeAsScopeBase.variableScope;
			this.upper = upperScope;
			/**
			* Whether 'use strict' is in effect in this scope.
			* @member {boolean} Scope#isStrict
			*/
			this.isStrict = isStrictScope(this, block, isMethodDefinition);
			upperScopeAsScopeBase?.childScopes.push(this);
			this.#declaredVariables = scopeManager.declaredVariables;
			registerScope(scopeManager, this);
		}
		isVariableScope() {
			return VARIABLE_SCOPE_TYPES.has(this.type);
		}
		shouldStaticallyCloseForGlobal(ref, scopeManager) {
			const name$1 = ref.identifier.name;
			const variable = this.set.get(name$1);
			if (!variable) return false;
			if (scopeManager.isModule()) return true;
			const defs = variable.defs;
			return defs.length > 0 && defs.every((def) => {
				if (def.type === definition_1.DefinitionType.Variable && def.parent.kind === "var") return false;
				return true;
			});
		}
		close(scopeManager) {
			let closeRef;
			if (this.shouldStaticallyClose()) closeRef = this.#staticCloseRef;
			else if (this.type !== "global") closeRef = this.#dynamicCloseRef;
			else closeRef = this.#globalCloseRef;
			(0, assert_1.assert)(this.leftToResolve);
			this.leftToResolve.forEach((ref) => closeRef(ref, scopeManager));
			this.leftToResolve = null;
			return this.upper;
		}
		shouldStaticallyClose() {
			return !this.#dynamic;
		}
		/**
		* To override by function scopes.
		* References in default parameters isn't resolved to variables which are in their function body.
		*/
		defineVariable(nameOrVariable, set, variables, node, def) {
			const name$1 = typeof nameOrVariable === "string" ? nameOrVariable : nameOrVariable.name;
			let variable = set.get(name$1);
			if (!variable) {
				variable = typeof nameOrVariable === "string" ? new variable_1.Variable(name$1, this) : nameOrVariable;
				set.set(name$1, variable);
				variables.push(variable);
			}
			if (def) {
				variable.defs.push(def);
				this.addDeclaredVariablesOfNode(variable, def.node);
				this.addDeclaredVariablesOfNode(variable, def.parent);
			}
			if (node) variable.identifiers.push(node);
		}
		delegateToUpperScope(ref) {
			this.upper?.leftToResolve?.push(ref);
			this.through.push(ref);
		}
		isValidResolution(_ref, _variable) {
			return true;
		}
		addDeclaredVariablesOfNode(variable, node) {
			if (node == null) return;
			let variables = this.#declaredVariables.get(node);
			if (variables == null) {
				variables = [];
				this.#declaredVariables.set(node, variables);
			}
			if (!variables.includes(variable)) variables.push(variable);
		}
		defineIdentifier(node, def) {
			this.defineVariable(node.name, this.set, this.variables, node, def);
		}
		defineLiteralIdentifier(node, def) {
			this.defineVariable(node.value, this.set, this.variables, null, def);
		}
		referenceDualValueType(node) {
			const ref = new Reference_1.Reference(node, this, Reference_1.ReferenceFlag.Read, null, null, false, Reference_1.ReferenceTypeFlag.Type | Reference_1.ReferenceTypeFlag.Value);
			this.references.push(ref);
			this.leftToResolve?.push(ref);
		}
		referenceType(node) {
			const ref = new Reference_1.Reference(node, this, Reference_1.ReferenceFlag.Read, null, null, false, Reference_1.ReferenceTypeFlag.Type);
			this.references.push(ref);
			this.leftToResolve?.push(ref);
		}
		referenceValue(node, assign = Reference_1.ReferenceFlag.Read, writeExpr, maybeImplicitGlobal, init = false) {
			const ref = new Reference_1.Reference(node, this, assign, writeExpr, maybeImplicitGlobal, init, Reference_1.ReferenceTypeFlag.Value);
			this.references.push(ref);
			this.leftToResolve?.push(ref);
		}
	};
	exports.ScopeBase = ScopeBase;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/scope/BlockScope.js
var require_BlockScope = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.BlockScope = void 0;
	const ScopeBase_1 = require_ScopeBase();
	const ScopeType_1 = require_ScopeType();
	var BlockScope = class extends ScopeBase_1.ScopeBase {
		constructor(scopeManager, upperScope, block) {
			super(scopeManager, ScopeType_1.ScopeType.block, upperScope, block, false);
		}
	};
	exports.BlockScope = BlockScope;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/scope/CatchScope.js
var require_CatchScope = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.CatchScope = void 0;
	const ScopeBase_1 = require_ScopeBase();
	const ScopeType_1 = require_ScopeType();
	var CatchScope = class extends ScopeBase_1.ScopeBase {
		constructor(scopeManager, upperScope, block) {
			super(scopeManager, ScopeType_1.ScopeType.catch, upperScope, block, false);
		}
	};
	exports.CatchScope = CatchScope;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/scope/ClassFieldInitializerScope.js
var require_ClassFieldInitializerScope = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ClassFieldInitializerScope = void 0;
	const ScopeBase_1 = require_ScopeBase();
	const ScopeType_1 = require_ScopeType();
	var ClassFieldInitializerScope = class extends ScopeBase_1.ScopeBase {
		constructor(scopeManager, upperScope, block) {
			super(scopeManager, ScopeType_1.ScopeType.classFieldInitializer, upperScope, block, false);
		}
	};
	exports.ClassFieldInitializerScope = ClassFieldInitializerScope;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/scope/ClassScope.js
var require_ClassScope = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ClassScope = void 0;
	const ScopeBase_1 = require_ScopeBase();
	const ScopeType_1 = require_ScopeType();
	var ClassScope = class extends ScopeBase_1.ScopeBase {
		constructor(scopeManager, upperScope, block) {
			super(scopeManager, ScopeType_1.ScopeType.class, upperScope, block, false);
		}
	};
	exports.ClassScope = ClassScope;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/scope/ConditionalTypeScope.js
var require_ConditionalTypeScope = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ConditionalTypeScope = void 0;
	const ScopeBase_1 = require_ScopeBase();
	const ScopeType_1 = require_ScopeType();
	var ConditionalTypeScope = class extends ScopeBase_1.ScopeBase {
		constructor(scopeManager, upperScope, block) {
			super(scopeManager, ScopeType_1.ScopeType.conditionalType, upperScope, block, false);
		}
	};
	exports.ConditionalTypeScope = ConditionalTypeScope;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/scope/ForScope.js
var require_ForScope = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ForScope = void 0;
	const ScopeBase_1 = require_ScopeBase();
	const ScopeType_1 = require_ScopeType();
	var ForScope = class extends ScopeBase_1.ScopeBase {
		constructor(scopeManager, upperScope, block) {
			super(scopeManager, ScopeType_1.ScopeType.for, upperScope, block, false);
		}
	};
	exports.ForScope = ForScope;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/scope/FunctionExpressionNameScope.js
var require_FunctionExpressionNameScope = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.FunctionExpressionNameScope = void 0;
	const definition_1 = require_definition();
	const ScopeBase_1 = require_ScopeBase();
	const ScopeType_1 = require_ScopeType();
	var FunctionExpressionNameScope = class extends ScopeBase_1.ScopeBase {
		functionExpressionScope;
		constructor(scopeManager, upperScope, block) {
			super(scopeManager, ScopeType_1.ScopeType.functionExpressionName, upperScope, block, false);
			if (block.id) this.defineIdentifier(block.id, new definition_1.FunctionNameDefinition(block.id, block));
			this.functionExpressionScope = true;
		}
	};
	exports.FunctionExpressionNameScope = FunctionExpressionNameScope;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/scope/FunctionScope.js
var require_FunctionScope = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.FunctionScope = void 0;
	const types_1 = require_dist$3();
	const ScopeBase_1 = require_ScopeBase();
	const ScopeType_1 = require_ScopeType();
	var FunctionScope = class extends ScopeBase_1.ScopeBase {
		constructor(scopeManager, upperScope, block, isMethodDefinition) {
			super(scopeManager, ScopeType_1.ScopeType.function, upperScope, block, isMethodDefinition);
			if (this.block.type !== types_1.AST_NODE_TYPES.ArrowFunctionExpression) this.defineVariable("arguments", this.set, this.variables, null, null);
		}
		isValidResolution(ref, variable) {
			if (this.block.type === types_1.AST_NODE_TYPES.Program) return true;
			const bodyStart = this.block.body?.range[0] ?? -1;
			return !(variable.scope === this && ref.identifier.range[0] < bodyStart && variable.defs.every((d) => d.name.range[0] >= bodyStart));
		}
	};
	exports.FunctionScope = FunctionScope;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/scope/FunctionTypeScope.js
var require_FunctionTypeScope = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.FunctionTypeScope = void 0;
	const ScopeBase_1 = require_ScopeBase();
	const ScopeType_1 = require_ScopeType();
	var FunctionTypeScope = class extends ScopeBase_1.ScopeBase {
		constructor(scopeManager, upperScope, block) {
			super(scopeManager, ScopeType_1.ScopeType.functionType, upperScope, block, false);
		}
	};
	exports.FunctionTypeScope = FunctionTypeScope;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/scope/GlobalScope.js
var require_GlobalScope = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.GlobalScope = void 0;
	const types_1 = require_dist$3();
	const assert_1 = require_assert();
	const ImplicitGlobalVariableDefinition_1 = require_ImplicitGlobalVariableDefinition();
	const variable_1 = require_variable();
	const ScopeBase_1 = require_ScopeBase();
	const ScopeType_1 = require_ScopeType();
	var GlobalScope = class extends ScopeBase_1.ScopeBase {
		implicit;
		constructor(scopeManager, block) {
			super(scopeManager, ScopeType_1.ScopeType.global, null, block, false);
			this.implicit = {
				leftToBeResolved: [],
				set: /* @__PURE__ */ new Map(),
				variables: []
			};
		}
		close(scopeManager) {
			(0, assert_1.assert)(this.leftToResolve);
			for (const ref of this.leftToResolve) if (ref.maybeImplicitGlobal && !this.set.has(ref.identifier.name)) {
				const info = ref.maybeImplicitGlobal;
				const node = info.pattern;
				if (node.type === types_1.AST_NODE_TYPES.Identifier) this.defineVariable(node.name, this.implicit.set, this.implicit.variables, node, new ImplicitGlobalVariableDefinition_1.ImplicitGlobalVariableDefinition(info.pattern, info.node));
			}
			this.implicit.leftToBeResolved = this.leftToResolve;
			return super.close(scopeManager);
		}
		defineImplicitVariable(name$1, options) {
			this.defineVariable(new variable_1.ImplicitLibVariable(this, name$1, options), this.set, this.variables, null, null);
		}
	};
	exports.GlobalScope = GlobalScope;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/scope/MappedTypeScope.js
var require_MappedTypeScope = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.MappedTypeScope = void 0;
	const ScopeBase_1 = require_ScopeBase();
	const ScopeType_1 = require_ScopeType();
	var MappedTypeScope = class extends ScopeBase_1.ScopeBase {
		constructor(scopeManager, upperScope, block) {
			super(scopeManager, ScopeType_1.ScopeType.mappedType, upperScope, block, false);
		}
	};
	exports.MappedTypeScope = MappedTypeScope;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/scope/ModuleScope.js
var require_ModuleScope = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ModuleScope = void 0;
	const ScopeBase_1 = require_ScopeBase();
	const ScopeType_1 = require_ScopeType();
	var ModuleScope = class extends ScopeBase_1.ScopeBase {
		constructor(scopeManager, upperScope, block) {
			super(scopeManager, ScopeType_1.ScopeType.module, upperScope, block, false);
		}
	};
	exports.ModuleScope = ModuleScope;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/scope/Scope.js
var require_Scope$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/scope/SwitchScope.js
var require_SwitchScope = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SwitchScope = void 0;
	const ScopeBase_1 = require_ScopeBase();
	const ScopeType_1 = require_ScopeType();
	var SwitchScope = class extends ScopeBase_1.ScopeBase {
		constructor(scopeManager, upperScope, block) {
			super(scopeManager, ScopeType_1.ScopeType.switch, upperScope, block, false);
		}
	};
	exports.SwitchScope = SwitchScope;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/scope/TSEnumScope.js
var require_TSEnumScope = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.TSEnumScope = void 0;
	const ScopeBase_1 = require_ScopeBase();
	const ScopeType_1 = require_ScopeType();
	var TSEnumScope = class extends ScopeBase_1.ScopeBase {
		constructor(scopeManager, upperScope, block) {
			super(scopeManager, ScopeType_1.ScopeType.tsEnum, upperScope, block, false);
		}
	};
	exports.TSEnumScope = TSEnumScope;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/scope/TSModuleScope.js
var require_TSModuleScope = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.TSModuleScope = void 0;
	const ScopeBase_1 = require_ScopeBase();
	const ScopeType_1 = require_ScopeType();
	var TSModuleScope = class extends ScopeBase_1.ScopeBase {
		constructor(scopeManager, upperScope, block) {
			super(scopeManager, ScopeType_1.ScopeType.tsModule, upperScope, block, false);
		}
	};
	exports.TSModuleScope = TSModuleScope;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/scope/TypeScope.js
var require_TypeScope = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.TypeScope = void 0;
	const ScopeBase_1 = require_ScopeBase();
	const ScopeType_1 = require_ScopeType();
	var TypeScope = class extends ScopeBase_1.ScopeBase {
		constructor(scopeManager, upperScope, block) {
			super(scopeManager, ScopeType_1.ScopeType.type, upperScope, block, false);
		}
	};
	exports.TypeScope = TypeScope;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/scope/WithScope.js
var require_WithScope = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WithScope = void 0;
	const assert_1 = require_assert();
	const ScopeBase_1 = require_ScopeBase();
	const ScopeType_1 = require_ScopeType();
	var WithScope = class extends ScopeBase_1.ScopeBase {
		constructor(scopeManager, upperScope, block) {
			super(scopeManager, ScopeType_1.ScopeType.with, upperScope, block, false);
		}
		close(scopeManager) {
			if (this.shouldStaticallyClose()) return super.close(scopeManager);
			(0, assert_1.assert)(this.leftToResolve);
			this.leftToResolve.forEach((ref) => this.delegateToUpperScope(ref));
			this.leftToResolve = null;
			return this.upper;
		}
	};
	exports.WithScope = WithScope;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/scope/index.js
var require_scope = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$1) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$1, p)) __createBinding(exports$1, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_BlockScope(), exports);
	__exportStar(require_CatchScope(), exports);
	__exportStar(require_ClassFieldInitializerScope(), exports);
	__exportStar(require_ClassScope(), exports);
	__exportStar(require_ConditionalTypeScope(), exports);
	__exportStar(require_ForScope(), exports);
	__exportStar(require_FunctionExpressionNameScope(), exports);
	__exportStar(require_FunctionScope(), exports);
	__exportStar(require_FunctionTypeScope(), exports);
	__exportStar(require_GlobalScope(), exports);
	__exportStar(require_MappedTypeScope(), exports);
	__exportStar(require_ModuleScope(), exports);
	__exportStar(require_Scope$1(), exports);
	__exportStar(require_ScopeType(), exports);
	__exportStar(require_SwitchScope(), exports);
	__exportStar(require_TSEnumScope(), exports);
	__exportStar(require_TSModuleScope(), exports);
	__exportStar(require_TypeScope(), exports);
	__exportStar(require_WithScope(), exports);
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/referencer/VisitorBase.js
var require_VisitorBase = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.VisitorBase = void 0;
	const visitor_keys_1 = require_dist$2();
	function isObject(obj) {
		return typeof obj === "object" && obj != null;
	}
	function isNode(node) {
		return isObject(node) && typeof node.type === "string";
	}
	var VisitorBase = class {
		#childVisitorKeys;
		#visitChildrenEvenIfSelectorExists;
		constructor(options) {
			this.#childVisitorKeys = options.childVisitorKeys ?? visitor_keys_1.visitorKeys;
			this.#visitChildrenEvenIfSelectorExists = options.visitChildrenEvenIfSelectorExists ?? false;
		}
		/**
		* Default method for visiting children.
		* @param node the node whose children should be visited
		* @param excludeArr a list of keys to not visit
		*/
		visitChildren(node, excludeArr = []) {
			if (node?.type == null) return;
			const exclude = new Set([...excludeArr, "parent"]);
			const children = this.#childVisitorKeys[node.type] ?? Object.keys(node);
			for (const key of children) {
				if (exclude.has(key)) continue;
				const child = node[key];
				if (!child) continue;
				if (Array.isArray(child)) {
					for (const subChild of child) if (isNode(subChild)) this.visit(subChild);
				} else if (isNode(child)) this.visit(child);
			}
		}
		/**
		* Dispatching node.
		*/
		visit(node) {
			if (node?.type == null) return;
			const visitor = this[node.type];
			if (visitor) {
				visitor.call(this, node);
				if (!this.#visitChildrenEvenIfSelectorExists) return;
			}
			this.visitChildren(node);
		}
	};
	exports.VisitorBase = VisitorBase;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/referencer/PatternVisitor.js
var require_PatternVisitor = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PatternVisitor = void 0;
	const types_1 = require_dist$3();
	const VisitorBase_1 = require_VisitorBase();
	var PatternVisitor = class extends VisitorBase_1.VisitorBase {
		#assignments = [];
		#callback;
		#restElements = [];
		#rootPattern;
		rightHandNodes = [];
		constructor(options, rootPattern, callback) {
			super(options);
			this.#rootPattern = rootPattern;
			this.#callback = callback;
		}
		static isPattern(node) {
			const nodeType = node.type;
			return nodeType === types_1.AST_NODE_TYPES.Identifier || nodeType === types_1.AST_NODE_TYPES.ObjectPattern || nodeType === types_1.AST_NODE_TYPES.ArrayPattern || nodeType === types_1.AST_NODE_TYPES.SpreadElement || nodeType === types_1.AST_NODE_TYPES.RestElement || nodeType === types_1.AST_NODE_TYPES.AssignmentPattern;
		}
		ArrayExpression(node) {
			node.elements.forEach(this.visit, this);
		}
		ArrayPattern(pattern) {
			for (const element of pattern.elements) this.visit(element);
		}
		AssignmentExpression(node) {
			this.#assignments.push(node);
			this.visit(node.left);
			this.rightHandNodes.push(node.right);
			this.#assignments.pop();
		}
		AssignmentPattern(pattern) {
			this.#assignments.push(pattern);
			this.visit(pattern.left);
			this.rightHandNodes.push(pattern.right);
			this.#assignments.pop();
		}
		CallExpression(node) {
			node.arguments.forEach((a) => {
				this.rightHandNodes.push(a);
			});
			this.visit(node.callee);
		}
		Decorator() {}
		Identifier(pattern) {
			const lastRestElement = this.#restElements.at(-1);
			this.#callback(pattern, {
				assignments: this.#assignments,
				rest: lastRestElement?.argument === pattern,
				topLevel: pattern === this.#rootPattern
			});
		}
		MemberExpression(node) {
			if (node.computed) this.rightHandNodes.push(node.property);
			this.rightHandNodes.push(node.object);
		}
		Property(property) {
			if (property.computed) this.rightHandNodes.push(property.key);
			this.visit(property.value);
		}
		RestElement(pattern) {
			this.#restElements.push(pattern);
			this.visit(pattern.argument);
			this.#restElements.pop();
		}
		SpreadElement(node) {
			this.visit(node.argument);
		}
		TSTypeAnnotation() {}
	};
	exports.PatternVisitor = PatternVisitor;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/referencer/Visitor.js
var require_Visitor = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.VisitorBase = exports.Visitor = void 0;
	const PatternVisitor_1 = require_PatternVisitor();
	const VisitorBase_1 = require_VisitorBase();
	var Visitor = class Visitor extends VisitorBase_1.VisitorBase {
		#options;
		constructor(optionsOrVisitor) {
			super(optionsOrVisitor instanceof Visitor ? optionsOrVisitor.#options : optionsOrVisitor);
			this.#options = optionsOrVisitor instanceof Visitor ? optionsOrVisitor.#options : optionsOrVisitor;
		}
		visitPattern(node, callback, options = { processRightHandNodes: false }) {
			const visitor = new PatternVisitor_1.PatternVisitor(this.#options, node, callback);
			visitor.visit(node);
			if (options.processRightHandNodes) visitor.rightHandNodes.forEach(this.visit, this);
		}
	};
	exports.Visitor = Visitor;
	var VisitorBase_2 = require_VisitorBase();
	Object.defineProperty(exports, "VisitorBase", {
		enumerable: true,
		get: function() {
			return VisitorBase_2.VisitorBase;
		}
	});
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/referencer/TypeVisitor.js
var require_TypeVisitor = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.TypeVisitor = void 0;
	const types_1 = require_dist$3();
	const definition_1 = require_definition();
	const scope_1 = require_scope();
	const Visitor_1 = require_Visitor();
	var TypeVisitor = class TypeVisitor extends Visitor_1.Visitor {
		#referencer;
		constructor(referencer) {
			super(referencer);
			this.#referencer = referencer;
		}
		static visit(referencer, node) {
			new TypeVisitor(referencer).visit(node);
		}
		visitFunctionType(node) {
			this.#referencer.scopeManager.nestFunctionTypeScope(node);
			this.visit(node.typeParameters);
			for (const param of node.params) {
				let didVisitAnnotation = false;
				this.visitPattern(param, (pattern, info) => {
					this.#referencer.currentScope().defineIdentifier(pattern, new definition_1.ParameterDefinition(pattern, node, info.rest));
					if (pattern.typeAnnotation) {
						this.visit(pattern.typeAnnotation);
						didVisitAnnotation = true;
					}
				});
				if (!didVisitAnnotation && "typeAnnotation" in param) this.visit(param.typeAnnotation);
			}
			this.visit(node.returnType);
			this.#referencer.close(node);
		}
		visitPropertyKey(node) {
			if (!node.computed) return;
			this.#referencer.visit(node.key);
		}
		Identifier(node) {
			this.#referencer.currentScope().referenceType(node);
		}
		MemberExpression(node) {
			this.visit(node.object);
		}
		TSCallSignatureDeclaration(node) {
			this.visitFunctionType(node);
		}
		TSConditionalType(node) {
			this.#referencer.scopeManager.nestConditionalTypeScope(node);
			this.visitChildren(node, ["falseType"]);
			this.#referencer.close(node);
			this.visit(node.falseType);
		}
		TSConstructorType(node) {
			this.visitFunctionType(node);
		}
		TSConstructSignatureDeclaration(node) {
			this.visitFunctionType(node);
		}
		TSFunctionType(node) {
			this.visitFunctionType(node);
		}
		TSImportType(node) {
			this.visit(node.typeArguments);
		}
		TSIndexSignature(node) {
			for (const param of node.parameters) if (param.type === types_1.AST_NODE_TYPES.Identifier) this.visit(param.typeAnnotation);
			this.visit(node.typeAnnotation);
		}
		TSInferType(node) {
			const typeParameter = node.typeParameter;
			let scope = this.#referencer.currentScope();
			if (scope.type === scope_1.ScopeType.functionType || scope.type === scope_1.ScopeType.mappedType) {
				let currentScope = scope.upper;
				while (currentScope) {
					if (currentScope.type === scope_1.ScopeType.functionType || currentScope.type === scope_1.ScopeType.mappedType) {
						currentScope = currentScope.upper;
						continue;
					}
					if (currentScope.type === scope_1.ScopeType.conditionalType) {
						scope = currentScope;
						break;
					}
					break;
				}
			}
			scope.defineIdentifier(typeParameter.name, new definition_1.TypeDefinition(typeParameter.name, typeParameter));
			this.visit(typeParameter.constraint);
		}
		TSInterfaceDeclaration(node) {
			this.#referencer.currentScope().defineIdentifier(node.id, new definition_1.TypeDefinition(node.id, node));
			if (node.typeParameters) {
				this.#referencer.scopeManager.nestTypeScope(node);
				this.visit(node.typeParameters);
			}
			node.extends.forEach(this.visit, this);
			this.visit(node.body);
			if (node.typeParameters) this.#referencer.close(node);
		}
		TSMappedType(node) {
			this.#referencer.scopeManager.nestMappedTypeScope(node);
			this.#referencer.currentScope().defineIdentifier(node.key, new definition_1.TypeDefinition(node.key, node));
			this.visit(node.constraint);
			this.visit(node.nameType);
			this.visit(node.typeAnnotation);
			this.#referencer.close(node);
		}
		TSMethodSignature(node) {
			this.visitPropertyKey(node);
			this.visitFunctionType(node);
		}
		TSNamedTupleMember(node) {
			this.visit(node.elementType);
		}
		TSPropertySignature(node) {
			this.visitPropertyKey(node);
			this.visit(node.typeAnnotation);
		}
		TSQualifiedName(node) {
			this.visit(node.left);
		}
		TSTypeAliasDeclaration(node) {
			this.#referencer.currentScope().defineIdentifier(node.id, new definition_1.TypeDefinition(node.id, node));
			if (node.typeParameters) {
				this.#referencer.scopeManager.nestTypeScope(node);
				this.visit(node.typeParameters);
			}
			this.visit(node.typeAnnotation);
			if (node.typeParameters) this.#referencer.close(node);
		}
		TSTypeParameter(node) {
			this.#referencer.currentScope().defineIdentifier(node.name, new definition_1.TypeDefinition(node.name, node));
			this.visit(node.constraint);
			this.visit(node.default);
		}
		TSTypePredicate(node) {
			if (node.parameterName.type !== types_1.AST_NODE_TYPES.TSThisType) this.#referencer.currentScope().referenceValue(node.parameterName);
			this.visit(node.typeAnnotation);
		}
		TSTypeAnnotation(node) {
			this.visitChildren(node);
		}
		TSTypeQuery(node) {
			let entityName;
			if (node.exprName.type === types_1.AST_NODE_TYPES.TSQualifiedName) {
				let iter = node.exprName;
				while (iter.left.type === types_1.AST_NODE_TYPES.TSQualifiedName) iter = iter.left;
				entityName = iter.left;
			} else {
				entityName = node.exprName;
				if (node.exprName.type === types_1.AST_NODE_TYPES.TSImportType) this.visit(node.exprName);
			}
			if (entityName.type === types_1.AST_NODE_TYPES.Identifier) this.#referencer.currentScope().referenceValue(entityName);
			this.visit(node.typeArguments);
		}
	};
	exports.TypeVisitor = TypeVisitor;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/referencer/ClassVisitor.js
var require_ClassVisitor = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ClassVisitor = void 0;
	const types_1 = require_dist$3();
	const definition_1 = require_definition();
	const TypeVisitor_1 = require_TypeVisitor();
	const Visitor_1 = require_Visitor();
	var ClassVisitor = class ClassVisitor extends Visitor_1.Visitor {
		#referencer;
		constructor(referencer) {
			super(referencer);
			this.#referencer = referencer;
		}
		static visit(referencer, node) {
			new ClassVisitor(referencer).visitClass(node);
		}
		visit(node) {
			if (node && node.type in this) super.visit(node);
			else this.#referencer.visit(node);
		}
		visitClass(node) {
			if (node.type === types_1.AST_NODE_TYPES.ClassDeclaration && node.id) this.#referencer.currentScope().defineIdentifier(node.id, new definition_1.ClassNameDefinition(node.id, node));
			node.decorators.forEach((d) => this.#referencer.visit(d));
			this.#referencer.scopeManager.nestClassScope(node);
			if (node.id) this.#referencer.currentScope().defineIdentifier(node.id, new definition_1.ClassNameDefinition(node.id, node));
			this.#referencer.visit(node.superClass);
			this.visitType(node.typeParameters);
			this.visitType(node.superTypeArguments);
			node.implements.forEach((imp) => this.visitType(imp));
			this.visit(node.body);
			this.#referencer.close(node);
		}
		visitFunctionParameterTypeAnnotation(node) {
			switch (node.type) {
				case types_1.AST_NODE_TYPES.AssignmentPattern:
					this.visitType(node.left.typeAnnotation);
					break;
				case types_1.AST_NODE_TYPES.TSParameterProperty:
					this.visitFunctionParameterTypeAnnotation(node.parameter);
					break;
				default: this.visitType(node.typeAnnotation);
			}
		}
		visitMethod(node) {
			if (node.computed) this.#referencer.visit(node.key);
			if (node.value.type === types_1.AST_NODE_TYPES.FunctionExpression) this.visitMethodFunction(node.value);
			else this.#referencer.visit(node.value);
			node.decorators.forEach((d) => this.#referencer.visit(d));
		}
		visitMethodFunction(node) {
			if (node.id) this.#referencer.scopeManager.nestFunctionExpressionNameScope(node);
			node.params.forEach((param) => {
				param.decorators.forEach((d) => this.visit(d));
			});
			this.#referencer.scopeManager.nestFunctionScope(node, true);
			for (const param of node.params) {
				this.visitPattern(param, (pattern, info) => {
					this.#referencer.currentScope().defineIdentifier(pattern, new definition_1.ParameterDefinition(pattern, node, info.rest));
					this.#referencer.referencingDefaultValue(pattern, info.assignments, null, true);
				}, { processRightHandNodes: true });
				this.visitFunctionParameterTypeAnnotation(param);
			}
			this.visitType(node.returnType);
			this.visitType(node.typeParameters);
			this.#referencer.visitChildren(node.body);
			this.#referencer.close(node);
		}
		visitPropertyBase(node) {
			if (node.computed) this.#referencer.visit(node.key);
			if (node.value) {
				if (node.type === types_1.AST_NODE_TYPES.PropertyDefinition || node.type === types_1.AST_NODE_TYPES.AccessorProperty) this.#referencer.scopeManager.nestClassFieldInitializerScope(node.value);
				this.#referencer.visit(node.value);
				if (node.type === types_1.AST_NODE_TYPES.PropertyDefinition || node.type === types_1.AST_NODE_TYPES.AccessorProperty) this.#referencer.close(node.value);
			}
			node.decorators.forEach((d) => this.#referencer.visit(d));
		}
		visitPropertyDefinition(node) {
			this.visitPropertyBase(node);
			/**
			* class A {
			*   @meta     // <--- check this
			*   foo: Type;
			* }
			*/
			this.visitType(node.typeAnnotation);
		}
		visitType(node) {
			if (!node) return;
			TypeVisitor_1.TypeVisitor.visit(this.#referencer, node);
		}
		AccessorProperty(node) {
			this.visitPropertyDefinition(node);
		}
		ClassBody(node) {
			this.visitChildren(node);
		}
		Identifier(node) {
			this.#referencer.visit(node);
		}
		MethodDefinition(node) {
			this.visitMethod(node);
		}
		PrivateIdentifier() {}
		PropertyDefinition(node) {
			this.visitPropertyDefinition(node);
		}
		StaticBlock(node) {
			this.#referencer.scopeManager.nestClassStaticBlockScope(node);
			node.body.forEach((b) => this.visit(b));
			this.#referencer.close(node);
		}
		TSAbstractAccessorProperty(node) {
			this.visitPropertyDefinition(node);
		}
		TSAbstractMethodDefinition(node) {
			this.visitPropertyBase(node);
		}
		TSAbstractPropertyDefinition(node) {
			this.visitPropertyDefinition(node);
		}
		TSIndexSignature(node) {
			this.visitType(node);
		}
	};
	exports.ClassVisitor = ClassVisitor;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/referencer/ExportVisitor.js
var require_ExportVisitor = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ExportVisitor = void 0;
	const types_1 = require_dist$3();
	const Visitor_1 = require_Visitor();
	var ExportVisitor = class ExportVisitor extends Visitor_1.Visitor {
		#exportNode;
		#referencer;
		constructor(node, referencer) {
			super(referencer);
			this.#exportNode = node;
			this.#referencer = referencer;
		}
		static visit(referencer, node) {
			new ExportVisitor(node, referencer).visit(node);
		}
		ExportDefaultDeclaration(node) {
			if (node.declaration.type === types_1.AST_NODE_TYPES.Identifier) this.visit(node.declaration);
		}
		ExportNamedDeclaration(node) {
			if (node.source) return;
			if (!node.declaration) this.visitChildren(node);
		}
		ExportSpecifier(node) {
			if (node.exportKind === "type" && node.local.type === types_1.AST_NODE_TYPES.Identifier) this.#referencer.currentScope().referenceType(node.local);
			else this.visit(node.local);
		}
		Identifier(node) {
			if (this.#exportNode.exportKind === "type") this.#referencer.currentScope().referenceType(node);
			else this.#referencer.currentScope().referenceDualValueType(node);
		}
	};
	exports.ExportVisitor = ExportVisitor;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/referencer/ImportVisitor.js
var require_ImportVisitor = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ImportVisitor = void 0;
	const definition_1 = require_definition();
	const Visitor_1 = require_Visitor();
	var ImportVisitor = class ImportVisitor extends Visitor_1.Visitor {
		#declaration;
		#referencer;
		constructor(declaration, referencer) {
			super(referencer);
			this.#declaration = declaration;
			this.#referencer = referencer;
		}
		static visit(referencer, declaration) {
			new ImportVisitor(declaration, referencer).visit(declaration);
		}
		ImportDefaultSpecifier(node) {
			const local = node.local;
			this.visitImport(local, node);
		}
		ImportNamespaceSpecifier(node) {
			const local = node.local;
			this.visitImport(local, node);
		}
		ImportSpecifier(node) {
			const local = node.local;
			this.visitImport(local, node);
		}
		visitImport(id, specifier) {
			this.#referencer.currentScope().defineIdentifier(id, new definition_1.ImportBindingDefinition(id, specifier, this.#declaration));
		}
	};
	exports.ImportVisitor = ImportVisitor;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/referencer/Referencer.js
var require_Referencer = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Referencer = void 0;
	const types_1 = require_dist$3();
	const assert_1 = require_assert();
	const definition_1 = require_definition();
	const lib_1 = require_lib();
	const ClassVisitor_1 = require_ClassVisitor();
	const ExportVisitor_1 = require_ExportVisitor();
	const ImportVisitor_1 = require_ImportVisitor();
	const PatternVisitor_1 = require_PatternVisitor();
	const Reference_1 = require_Reference();
	const TypeVisitor_1 = require_TypeVisitor();
	const Visitor_1 = require_Visitor();
	var Referencer = class extends Visitor_1.Visitor {
		#hasReferencedJsxFactory = false;
		#hasReferencedJsxFragmentFactory = false;
		#jsxFragmentName;
		#jsxPragma;
		#lib;
		scopeManager;
		constructor(options, scopeManager) {
			super(options);
			this.scopeManager = scopeManager;
			this.#jsxPragma = options.jsxPragma;
			this.#jsxFragmentName = options.jsxFragmentName;
			this.#lib = options.lib;
		}
		populateGlobalsFromLib(globalScope) {
			const flattenedLibs = /* @__PURE__ */ new Set();
			for (const lib of this.#lib) {
				const definition = lib_1.lib.get(lib);
				if (!definition) throw new Error(`Invalid value for lib provided: ${lib}`);
				flattenedLibs.add(definition);
			}
			for (const lib of flattenedLibs) {
				for (const referencedLib of lib.libs) flattenedLibs.add(referencedLib);
				for (const [name$1, variable] of lib.variables) globalScope.defineImplicitVariable(name$1, variable);
			}
			globalScope.defineImplicitVariable("const", {
				eslintImplicitGlobalSetting: "readonly",
				isTypeVariable: true,
				isValueVariable: false
			});
		}
		close(node) {
			while (this.currentScope(true) && node === this.currentScope().block) this.scopeManager.currentScope = this.currentScope().close(this.scopeManager);
		}
		currentScope(dontThrowOnNull) {
			if (!dontThrowOnNull) (0, assert_1.assert)(this.scopeManager.currentScope, "Expected currentScope to exist. This usually happens when analyze() is called with an incomplete AST node instead of a complete Program node.");
			return this.scopeManager.currentScope;
		}
		referencingDefaultValue(pattern, assignments, maybeImplicitGlobal, init) {
			assignments.forEach((assignment) => {
				this.currentScope().referenceValue(pattern, Reference_1.ReferenceFlag.Write, assignment.right, maybeImplicitGlobal, init);
			});
		}
		/**
		* Searches for a variable named "name" in the upper scopes and adds a pseudo-reference from itself to itself
		*/
		referenceInSomeUpperScope(name$1) {
			let scope = this.scopeManager.currentScope;
			while (scope) {
				const variable = scope.set.get(name$1);
				if (!variable) {
					scope = scope.upper;
					continue;
				}
				scope.referenceValue(variable.identifiers[0]);
				return true;
			}
			return false;
		}
		referenceJsxFragment() {
			if (this.#jsxFragmentName == null || this.#hasReferencedJsxFragmentFactory) return;
			this.#hasReferencedJsxFragmentFactory = this.referenceInSomeUpperScope(this.#jsxFragmentName);
		}
		referenceJsxPragma() {
			if (this.#jsxPragma == null || this.#hasReferencedJsxFactory) return;
			this.#hasReferencedJsxFactory = this.referenceInSomeUpperScope(this.#jsxPragma);
		}
		visitClass(node) {
			ClassVisitor_1.ClassVisitor.visit(this, node);
		}
		visitForIn(node) {
			if (node.left.type === types_1.AST_NODE_TYPES.VariableDeclaration && node.left.kind !== "var") this.scopeManager.nestForScope(node);
			if (node.left.type === types_1.AST_NODE_TYPES.VariableDeclaration) {
				this.visit(node.left);
				this.visitPattern(node.left.declarations[0].id, (pattern) => {
					this.currentScope().referenceValue(pattern, Reference_1.ReferenceFlag.Write, node.right, null, true);
				});
			} else this.visitPattern(node.left, (pattern, info) => {
				const maybeImplicitGlobal = !this.currentScope().isStrict ? {
					node,
					pattern
				} : null;
				this.referencingDefaultValue(pattern, info.assignments, maybeImplicitGlobal, false);
				this.currentScope().referenceValue(pattern, Reference_1.ReferenceFlag.Write, node.right, maybeImplicitGlobal, false);
			}, { processRightHandNodes: true });
			this.visit(node.right);
			this.visit(node.body);
			this.close(node);
		}
		visitFunction(node) {
			if (node.type === types_1.AST_NODE_TYPES.FunctionExpression) {
				if (node.id) this.scopeManager.nestFunctionExpressionNameScope(node);
			} else if (node.id) this.currentScope().defineIdentifier(node.id, new definition_1.FunctionNameDefinition(node.id, node));
			this.scopeManager.nestFunctionScope(node, false);
			for (const param of node.params) {
				this.visitPattern(param, (pattern, info) => {
					this.currentScope().defineIdentifier(pattern, new definition_1.ParameterDefinition(pattern, node, info.rest));
					this.referencingDefaultValue(pattern, info.assignments, null, true);
				}, { processRightHandNodes: true });
				this.visitFunctionParameterTypeAnnotation(param);
				param.decorators.forEach((d) => this.visit(d));
			}
			this.visitType(node.returnType);
			this.visitType(node.typeParameters);
			if (node.body) if (node.body.type === types_1.AST_NODE_TYPES.BlockStatement) this.visitChildren(node.body);
			else this.visit(node.body);
			this.close(node);
		}
		visitFunctionParameterTypeAnnotation(node) {
			switch (node.type) {
				case types_1.AST_NODE_TYPES.AssignmentPattern:
					this.visitType(node.left.typeAnnotation);
					break;
				case types_1.AST_NODE_TYPES.TSParameterProperty:
					this.visitFunctionParameterTypeAnnotation(node.parameter);
					break;
				default:
					this.visitType(node.typeAnnotation);
					break;
			}
		}
		visitJSXElement(node) {
			if (node.name.type === types_1.AST_NODE_TYPES.JSXIdentifier) {
				if (node.name.name[0].toUpperCase() === node.name.name[0] || node.name.name === "this") this.visit(node.name);
			} else this.visit(node.name);
		}
		visitProperty(node) {
			if (node.computed) this.visit(node.key);
			this.visit(node.value);
		}
		visitType(node) {
			if (!node) return;
			TypeVisitor_1.TypeVisitor.visit(this, node);
		}
		visitTypeAssertion(node) {
			this.visit(node.expression);
			this.visitType(node.typeAnnotation);
		}
		ArrowFunctionExpression(node) {
			this.visitFunction(node);
		}
		AssignmentExpression(node) {
			const left = this.visitExpressionTarget(node.left);
			if (PatternVisitor_1.PatternVisitor.isPattern(left)) {
				if (node.operator === "=") this.visitPattern(left, (pattern, info) => {
					const maybeImplicitGlobal = !this.currentScope().isStrict ? {
						node,
						pattern
					} : null;
					this.referencingDefaultValue(pattern, info.assignments, maybeImplicitGlobal, false);
					this.currentScope().referenceValue(pattern, Reference_1.ReferenceFlag.Write, node.right, maybeImplicitGlobal, false);
				}, { processRightHandNodes: true });
				else if (left.type === types_1.AST_NODE_TYPES.Identifier) this.currentScope().referenceValue(left, Reference_1.ReferenceFlag.ReadWrite, node.right);
			} else this.visit(left);
			this.visit(node.right);
		}
		BlockStatement(node) {
			this.scopeManager.nestBlockScope(node);
			this.visitChildren(node);
			this.close(node);
		}
		BreakStatement() {}
		CallExpression(node) {
			this.visitChildren(node, ["typeArguments"]);
			this.visitType(node.typeArguments);
		}
		CatchClause(node) {
			this.scopeManager.nestCatchScope(node);
			if (node.param) {
				const param = node.param;
				this.visitPattern(param, (pattern, info) => {
					this.currentScope().defineIdentifier(pattern, new definition_1.CatchClauseDefinition(param, node));
					this.referencingDefaultValue(pattern, info.assignments, null, true);
				}, { processRightHandNodes: true });
			}
			this.visit(node.body);
			this.close(node);
		}
		ClassDeclaration(node) {
			this.visitClass(node);
		}
		ClassExpression(node) {
			this.visitClass(node);
		}
		ContinueStatement() {}
		ExportAllDeclaration() {}
		ExportDefaultDeclaration(node) {
			if (node.declaration.type === types_1.AST_NODE_TYPES.Identifier) ExportVisitor_1.ExportVisitor.visit(this, node);
			else this.visit(node.declaration);
		}
		ExportNamedDeclaration(node) {
			if (node.declaration) this.visit(node.declaration);
			else ExportVisitor_1.ExportVisitor.visit(this, node);
		}
		ForInStatement(node) {
			this.visitForIn(node);
		}
		ForOfStatement(node) {
			this.visitForIn(node);
		}
		ForStatement(node) {
			if (node.init && node.init.type === types_1.AST_NODE_TYPES.VariableDeclaration && node.init.kind !== "var") this.scopeManager.nestForScope(node);
			this.visitChildren(node);
			this.close(node);
		}
		FunctionDeclaration(node) {
			this.visitFunction(node);
		}
		FunctionExpression(node) {
			this.visitFunction(node);
		}
		Identifier(node) {
			this.currentScope().referenceValue(node);
			this.visitType(node.typeAnnotation);
		}
		ImportAttribute() {}
		ImportDeclaration(node) {
			(0, assert_1.assert)(this.scopeManager.isModule(), "ImportDeclaration should appear when the mode is ES6 and in the module context.");
			ImportVisitor_1.ImportVisitor.visit(this, node);
		}
		JSXAttribute(node) {
			this.visit(node.value);
		}
		JSXClosingElement(node) {
			this.visitJSXElement(node);
		}
		JSXFragment(node) {
			this.referenceJsxPragma();
			this.referenceJsxFragment();
			this.visitChildren(node);
		}
		JSXIdentifier(node) {
			this.currentScope().referenceValue(node);
		}
		JSXMemberExpression(node) {
			if (node.object.type !== types_1.AST_NODE_TYPES.JSXIdentifier || node.object.name !== "this") this.visit(node.object);
		}
		JSXOpeningElement(node) {
			this.referenceJsxPragma();
			this.visitJSXElement(node);
			this.visitType(node.typeArguments);
			for (const attr of node.attributes) this.visit(attr);
		}
		LabeledStatement(node) {
			this.visit(node.body);
		}
		MemberExpression(node) {
			this.visit(node.object);
			if (node.computed) this.visit(node.property);
		}
		MetaProperty() {}
		NewExpression(node) {
			this.visitChildren(node, ["typeArguments"]);
			this.visitType(node.typeArguments);
		}
		PrivateIdentifier() {}
		Program(node) {
			const globalScope = this.scopeManager.nestGlobalScope(node);
			this.populateGlobalsFromLib(globalScope);
			if (this.scopeManager.isGlobalReturn()) {
				this.currentScope().isStrict = false;
				this.scopeManager.nestFunctionScope(node, false);
			}
			if (this.scopeManager.isModule()) this.scopeManager.nestModuleScope(node);
			if (this.scopeManager.isImpliedStrict()) this.currentScope().isStrict = true;
			this.visitChildren(node);
			this.close(node);
		}
		Property(node) {
			this.visitProperty(node);
		}
		SwitchStatement(node) {
			this.visit(node.discriminant);
			this.scopeManager.nestSwitchScope(node);
			for (const switchCase of node.cases) this.visit(switchCase);
			this.close(node);
		}
		TaggedTemplateExpression(node) {
			this.visit(node.tag);
			this.visit(node.quasi);
			this.visitType(node.typeArguments);
		}
		TSAsExpression(node) {
			this.visitTypeAssertion(node);
		}
		TSDeclareFunction(node) {
			this.visitFunction(node);
		}
		TSEmptyBodyFunctionExpression(node) {
			this.visitFunction(node);
		}
		TSEnumDeclaration(node) {
			this.currentScope().defineIdentifier(node.id, new definition_1.TSEnumNameDefinition(node.id, node));
			this.scopeManager.nestTSEnumScope(node);
			for (const member of node.body.members) {
				if (member.id.type === types_1.AST_NODE_TYPES.Literal && typeof member.id.value === "string") {
					const name$1 = member.id;
					this.currentScope().defineLiteralIdentifier(name$1, new definition_1.TSEnumMemberDefinition(name$1, member));
				} else if (member.id.type === types_1.AST_NODE_TYPES.Identifier) this.currentScope().defineIdentifier(member.id, new definition_1.TSEnumMemberDefinition(member.id, member));
				this.visit(member.initializer);
			}
			this.close(node);
		}
		TSExportAssignment(node) {
			if (node.expression.type === types_1.AST_NODE_TYPES.Identifier) this.currentScope().referenceDualValueType(node.expression);
			else this.visit(node.expression);
		}
		TSImportEqualsDeclaration(node) {
			this.currentScope().defineIdentifier(node.id, new definition_1.ImportBindingDefinition(node.id, node, node));
			if (node.moduleReference.type === types_1.AST_NODE_TYPES.TSQualifiedName) {
				let moduleIdentifier = node.moduleReference.left;
				while (moduleIdentifier.type === types_1.AST_NODE_TYPES.TSQualifiedName) moduleIdentifier = moduleIdentifier.left;
				this.visit(moduleIdentifier);
			} else this.visit(node.moduleReference);
		}
		TSInstantiationExpression(node) {
			this.visitChildren(node, ["typeArguments"]);
			this.visitType(node.typeArguments);
		}
		TSInterfaceDeclaration(node) {
			this.visitType(node);
		}
		TSModuleDeclaration(node) {
			if (node.id.type === types_1.AST_NODE_TYPES.Identifier && node.kind !== "global") this.currentScope().defineIdentifier(node.id, new definition_1.TSModuleNameDefinition(node.id, node));
			this.scopeManager.nestTSModuleScope(node);
			this.visit(node.body);
			this.close(node);
		}
		TSSatisfiesExpression(node) {
			this.visitTypeAssertion(node);
		}
		TSTypeAliasDeclaration(node) {
			this.visitType(node);
		}
		TSTypeAssertion(node) {
			this.visitTypeAssertion(node);
		}
		UpdateExpression(node) {
			const argument = this.visitExpressionTarget(node.argument);
			if (PatternVisitor_1.PatternVisitor.isPattern(argument)) this.visitPattern(argument, (pattern) => {
				this.currentScope().referenceValue(pattern, Reference_1.ReferenceFlag.ReadWrite, null);
			});
			else this.visitChildren(node);
		}
		VariableDeclaration(node) {
			const variableTargetScope = node.kind === "var" ? this.currentScope().variableScope : this.currentScope();
			for (const decl of node.declarations) {
				const init = decl.init;
				this.visitPattern(decl.id, (pattern, info) => {
					variableTargetScope.defineIdentifier(pattern, new definition_1.VariableDefinition(pattern, decl, node));
					this.referencingDefaultValue(pattern, info.assignments, null, true);
					if (init) this.currentScope().referenceValue(pattern, Reference_1.ReferenceFlag.Write, init, null, true);
				}, { processRightHandNodes: true });
				this.visit(decl.init);
				this.visitType(decl.id.typeAnnotation);
			}
		}
		WithStatement(node) {
			this.visit(node.object);
			this.scopeManager.nestWithScope(node);
			this.visit(node.body);
			this.close(node);
		}
		visitExpressionTarget(left) {
			switch (left.type) {
				case types_1.AST_NODE_TYPES.TSAsExpression:
				case types_1.AST_NODE_TYPES.TSTypeAssertion: this.visitType(left.typeAnnotation);
				case types_1.AST_NODE_TYPES.TSNonNullExpression: left = left.expression;
			}
			return left;
		}
	};
	exports.Referencer = Referencer;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/referencer/index.js
var require_referencer = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Referencer = void 0;
	var Referencer_1 = require_Referencer();
	Object.defineProperty(exports, "Referencer", {
		enumerable: true,
		get: function() {
			return Referencer_1.Referencer;
		}
	});
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/scope/ClassStaticBlockScope.js
var require_ClassStaticBlockScope = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ClassStaticBlockScope = void 0;
	const ScopeBase_1 = require_ScopeBase();
	const ScopeType_1 = require_ScopeType();
	var ClassStaticBlockScope = class extends ScopeBase_1.ScopeBase {
		constructor(scopeManager, upperScope, block) {
			super(scopeManager, ScopeType_1.ScopeType.classStaticBlock, upperScope, block, false);
		}
	};
	exports.ClassStaticBlockScope = ClassStaticBlockScope;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/ScopeManager.js
var require_ScopeManager = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ScopeManager = void 0;
	const assert_1 = require_assert();
	const scope_1 = require_scope();
	const ClassFieldInitializerScope_1 = require_ClassFieldInitializerScope();
	const ClassStaticBlockScope_1 = require_ClassStaticBlockScope();
	/**
	* @see https://eslint.org/docs/latest/developer-guide/scope-manager-interface#scopemanager-interface
	*/
	var ScopeManager = class {
		#options;
		currentScope;
		declaredVariables;
		/**
		* The root scope
		*/
		globalScope;
		nodeToScope;
		/**
		* All scopes
		* @public
		*/
		scopes;
		constructor(options) {
			this.scopes = [];
			this.globalScope = null;
			this.nodeToScope = /* @__PURE__ */ new WeakMap();
			this.currentScope = null;
			this.#options = options;
			this.declaredVariables = /* @__PURE__ */ new WeakMap();
		}
		isES6() {
			return true;
		}
		isGlobalReturn() {
			return this.#options.globalReturn === true;
		}
		isImpliedStrict() {
			return this.#options.impliedStrict === true;
		}
		isModule() {
			return this.#options.sourceType === "module";
		}
		isStrictModeSupported() {
			return true;
		}
		get variables() {
			const variables = /* @__PURE__ */ new Set();
			function recurse(scope) {
				scope.variables.forEach((v) => variables.add(v));
				scope.childScopes.forEach(recurse);
			}
			this.scopes.forEach(recurse);
			return [...variables].sort((a, b) => a.$id - b.$id);
		}
		/**
		* Get the variables that a given AST node defines. The gotten variables' `def[].node`/`def[].parent` property is the node.
		* If the node does not define any variable, this returns an empty array.
		* @param node An AST node to get their variables.
		*/
		getDeclaredVariables(node) {
			return this.declaredVariables.get(node) ?? [];
		}
		/**
		* Get the scope of a given AST node. The gotten scope's `block` property is the node.
		* This method never returns `function-expression-name` scope. If the node does not have their scope, this returns `null`.
		*
		* @param node An AST node to get their scope.
		* @param inner If the node has multiple scopes, this returns the outermost scope normally.
		*                If `inner` is `true` then this returns the innermost scope.
		*/
		acquire(node, inner = false) {
			function predicate(testScope) {
				if (testScope.type === scope_1.ScopeType.function && testScope.functionExpressionScope) return false;
				return true;
			}
			const scopes = this.nodeToScope.get(node);
			if (!scopes || scopes.length === 0) return null;
			if (scopes.length === 1) return scopes[0];
			if (inner) {
				for (let i = scopes.length - 1; i >= 0; --i) {
					const scope = scopes[i];
					if (predicate(scope)) return scope;
				}
				return null;
			}
			return scopes.find(predicate) ?? null;
		}
		nestBlockScope(node) {
			(0, assert_1.assert)(this.currentScope);
			return this.nestScope(new scope_1.BlockScope(this, this.currentScope, node));
		}
		nestCatchScope(node) {
			(0, assert_1.assert)(this.currentScope);
			return this.nestScope(new scope_1.CatchScope(this, this.currentScope, node));
		}
		nestClassFieldInitializerScope(node) {
			(0, assert_1.assert)(this.currentScope);
			return this.nestScope(new ClassFieldInitializerScope_1.ClassFieldInitializerScope(this, this.currentScope, node));
		}
		nestClassScope(node) {
			(0, assert_1.assert)(this.currentScope);
			return this.nestScope(new scope_1.ClassScope(this, this.currentScope, node));
		}
		nestClassStaticBlockScope(node) {
			(0, assert_1.assert)(this.currentScope);
			return this.nestScope(new ClassStaticBlockScope_1.ClassStaticBlockScope(this, this.currentScope, node));
		}
		nestConditionalTypeScope(node) {
			(0, assert_1.assert)(this.currentScope);
			return this.nestScope(new scope_1.ConditionalTypeScope(this, this.currentScope, node));
		}
		nestForScope(node) {
			(0, assert_1.assert)(this.currentScope);
			return this.nestScope(new scope_1.ForScope(this, this.currentScope, node));
		}
		nestFunctionExpressionNameScope(node) {
			(0, assert_1.assert)(this.currentScope);
			return this.nestScope(new scope_1.FunctionExpressionNameScope(this, this.currentScope, node));
		}
		nestFunctionScope(node, isMethodDefinition) {
			(0, assert_1.assert)(this.currentScope);
			return this.nestScope(new scope_1.FunctionScope(this, this.currentScope, node, isMethodDefinition));
		}
		nestFunctionTypeScope(node) {
			(0, assert_1.assert)(this.currentScope);
			return this.nestScope(new scope_1.FunctionTypeScope(this, this.currentScope, node));
		}
		nestGlobalScope(node) {
			return this.nestScope(new scope_1.GlobalScope(this, node));
		}
		nestMappedTypeScope(node) {
			(0, assert_1.assert)(this.currentScope);
			return this.nestScope(new scope_1.MappedTypeScope(this, this.currentScope, node));
		}
		nestModuleScope(node) {
			(0, assert_1.assert)(this.currentScope);
			return this.nestScope(new scope_1.ModuleScope(this, this.currentScope, node));
		}
		nestSwitchScope(node) {
			(0, assert_1.assert)(this.currentScope);
			return this.nestScope(new scope_1.SwitchScope(this, this.currentScope, node));
		}
		nestTSEnumScope(node) {
			(0, assert_1.assert)(this.currentScope);
			return this.nestScope(new scope_1.TSEnumScope(this, this.currentScope, node));
		}
		nestTSModuleScope(node) {
			(0, assert_1.assert)(this.currentScope);
			return this.nestScope(new scope_1.TSModuleScope(this, this.currentScope, node));
		}
		nestTypeScope(node) {
			(0, assert_1.assert)(this.currentScope);
			return this.nestScope(new scope_1.TypeScope(this, this.currentScope, node));
		}
		nestWithScope(node) {
			(0, assert_1.assert)(this.currentScope);
			return this.nestScope(new scope_1.WithScope(this, this.currentScope, node));
		}
		nestScope(scope) {
			if (scope instanceof scope_1.GlobalScope) {
				(0, assert_1.assert)(this.currentScope == null);
				this.globalScope = scope;
			}
			this.currentScope = scope;
			return scope;
		}
	};
	exports.ScopeManager = ScopeManager;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/analyze.js
var require_analyze = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.analyze = analyze;
	const visitor_keys_1 = require_dist$2();
	const referencer_1 = require_referencer();
	const ScopeManager_1 = require_ScopeManager();
	const DEFAULT_OPTIONS = {
		childVisitorKeys: visitor_keys_1.visitorKeys,
		emitDecoratorMetadata: false,
		globalReturn: false,
		impliedStrict: false,
		jsxFragmentName: null,
		jsxPragma: "React",
		lib: ["es2018"],
		sourceType: "script"
	};
	/**
	* Takes an AST and returns the analyzed scopes.
	*/
	function analyze(tree, providedOptions) {
		const options = {
			childVisitorKeys: providedOptions?.childVisitorKeys ?? DEFAULT_OPTIONS.childVisitorKeys,
			emitDecoratorMetadata: false,
			globalReturn: providedOptions?.globalReturn ?? DEFAULT_OPTIONS.globalReturn,
			impliedStrict: providedOptions?.impliedStrict ?? DEFAULT_OPTIONS.impliedStrict,
			jsxFragmentName: providedOptions?.jsxFragmentName ?? DEFAULT_OPTIONS.jsxFragmentName,
			jsxPragma: providedOptions?.jsxPragma === void 0 ? DEFAULT_OPTIONS.jsxPragma : providedOptions.jsxPragma,
			lib: providedOptions?.lib ?? ["esnext"],
			sourceType: providedOptions?.sourceType ?? DEFAULT_OPTIONS.sourceType
		};
		options.lib = options.lib.map((l) => l.toLowerCase());
		const scopeManager = new ScopeManager_1.ScopeManager(options);
		new referencer_1.Referencer(options, scopeManager).visit(tree);
		return scopeManager;
	}
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+scope-manager@8.50.0/node_modules/@typescript-eslint/scope-manager/dist/index.js
var require_dist$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$1) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$1, p)) __createBinding(exports$1, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ScopeManager = exports.Visitor = exports.Reference = exports.PatternVisitor = exports.analyze = void 0;
	var analyze_1 = require_analyze();
	Object.defineProperty(exports, "analyze", {
		enumerable: true,
		get: function() {
			return analyze_1.analyze;
		}
	});
	__exportStar(require_definition(), exports);
	var PatternVisitor_1 = require_PatternVisitor();
	Object.defineProperty(exports, "PatternVisitor", {
		enumerable: true,
		get: function() {
			return PatternVisitor_1.PatternVisitor;
		}
	});
	var Reference_1 = require_Reference();
	Object.defineProperty(exports, "Reference", {
		enumerable: true,
		get: function() {
			return Reference_1.Reference;
		}
	});
	var Visitor_1 = require_Visitor();
	Object.defineProperty(exports, "Visitor", {
		enumerable: true,
		get: function() {
			return Visitor_1.Visitor;
		}
	});
	__exportStar(require_scope(), exports);
	var ScopeManager_1 = require_ScopeManager();
	Object.defineProperty(exports, "ScopeManager", {
		enumerable: true,
		get: function() {
			return ScopeManager_1.ScopeManager;
		}
	});
	__exportStar(require_variable(), exports);
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/ts-eslint/Scope.js
var require_Scope = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar = exports && exports.__importStar || (function() {
		var ownKeys = function(o) {
			ownKeys = Object.getOwnPropertyNames || function(o$1) {
				var ar = [];
				for (var k in o$1) if (Object.prototype.hasOwnProperty.call(o$1, k)) ar[ar.length] = k;
				return ar;
			};
			return ownKeys(o);
		};
		return function(mod) {
			if (mod && mod.__esModule) return mod;
			var result = {};
			if (mod != null) {
				for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
			}
			__setModuleDefault(result, mod);
			return result;
		};
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Scope = void 0;
	const scopeManager = __importStar(require_dist$1());
	var Scope;
	(function(Scope) {
		Scope.ScopeType = scopeManager.ScopeType;
		Scope.DefinitionType = scopeManager.DefinitionType;
	})(Scope || (exports.Scope = Scope = {}));
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/ts-eslint/SourceCode.js
var require_SourceCode = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SourceCode = void 0;
	const eslint_1 = __require("eslint");
	var SourceCode = class extends eslint_1.SourceCode {};
	exports.SourceCode = SourceCode;
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/ts-eslint/index.js
var require_ts_eslint = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$1) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$1, p)) __createBinding(exports$1, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_AST(), exports);
	__exportStar(require_Config(), exports);
	__exportStar(require_ESLint(), exports);
	__exportStar(require_Linter(), exports);
	__exportStar(require_Parser(), exports);
	__exportStar(require_ParserOptions(), exports);
	__exportStar(require_Processor(), exports);
	__exportStar(require_Rule(), exports);
	__exportStar(require_RuleTester(), exports);
	__exportStar(require_Scope(), exports);
	__exportStar(require_SourceCode(), exports);
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/ts-utils/isArray.js
var require_isArray = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isArray = isArray;
	function isArray(arg) {
		return Array.isArray(arg);
	}
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/ts-utils/NoInfer.js
var require_NoInfer = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/ts-utils/index.js
var require_ts_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$1) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$1, p)) __createBinding(exports$1, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_isArray(), exports);
	__exportStar(require_NoInfer(), exports);
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/index.js
var require_dist = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar = exports && exports.__importStar || (function() {
		var ownKeys = function(o) {
			ownKeys = Object.getOwnPropertyNames || function(o$1) {
				var ar = [];
				for (var k in o$1) if (Object.prototype.hasOwnProperty.call(o$1, k)) ar[ar.length] = k;
				return ar;
			};
			return ownKeys(o);
		};
		return function(mod) {
			if (mod && mod.__esModule) return mod;
			var result = {};
			if (mod != null) {
				for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
			}
			__setModuleDefault(result, mod);
			return result;
		};
	})();
	var __exportStar = exports && exports.__exportStar || function(m, exports$1) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$1, p)) __createBinding(exports$1, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.TSUtils = exports.TSESLint = exports.JSONSchema = exports.ESLintUtils = exports.ASTUtils = void 0;
	exports.ASTUtils = __importStar(require_ast_utils());
	exports.ESLintUtils = __importStar(require_eslint_utils());
	exports.JSONSchema = __importStar(require_json_schema());
	exports.TSESLint = __importStar(require_ts_eslint());
	__exportStar(require_ts_estree(), exports);
	exports.TSUtils = __importStar(require_ts_utils());
}));

//#endregion
//#region node_modules/.pnpm/eslint-plugin-erasable-syntax-only@0.4.0_@typescript-eslint+parser@8.50.0_eslint@9.39.2_21a98245f04316fc7a482ff7a0e7c167/node_modules/eslint-plugin-erasable-syntax-only/lib/utils.js
var import_dist = require_dist();
const createRule = import_dist.ESLintUtils.RuleCreator((name$1) => `https://github.com/JoshuaKGoldberg/eslint-plugin-erasable-syntax-only/blob/main/docs/rules/${name$1}.md`);

//#endregion
//#region node_modules/.pnpm/eslint-plugin-erasable-syntax-only@0.4.0_@typescript-eslint+parser@8.50.0_eslint@9.39.2_21a98245f04316fc7a482ff7a0e7c167/node_modules/eslint-plugin-erasable-syntax-only/lib/rules/enums.js
const rule$3 = createRule({
	create(context) {
		return { TSEnumDeclaration(node) {
			const name$1 = node.id.name;
			const isExported = node.parent.type === import_dist.AST_NODE_TYPES.ExportNamedDeclaration;
			let canSuggestion = true;
			const body = [];
			let previousMemberNumericValue = -1;
			for (const enumMember of node.body.members) {
				if (enumMember.id.type !== import_dist.AST_NODE_TYPES.Identifier && (enumMember.id.type !== import_dist.AST_NODE_TYPES.Literal || typeof enumMember.id.value !== "string")) {
					canSuggestion = false;
					break;
				}
				const propertyName = enumMember.id.type === import_dist.AST_NODE_TYPES.Identifier ? enumMember.id.name : enumMember.id.value;
				const value = enumMember.initializer?.type === import_dist.AST_NODE_TYPES.Literal ? enumMember.initializer.value : previousMemberNumericValue + 1;
				if (value === null) {
					canSuggestion = false;
					break;
				}
				body.push({
					content: `${propertyName}: ${typeof value === "string" ? `'${value}'` : value.toString()}`,
					range: enumMember.range
				});
				if (typeof value === "number") previousMemberNumericValue = value;
			}
			context.report({
				messageId: "enum",
				node,
				suggest: canSuggestion ? [{
					fix(fixer) {
						return [
							fixer.replaceTextRange([node.range[0], node.range[0] + 4], "const"),
							fixer.insertTextBefore(node.body, "= "),
							...body.map(({ content, range }) => fixer.replaceTextRange(range, content)),
							fixer.insertTextAfter(node.body, " as const"),
							fixer.insertTextAfter(node.parent.parent ?? node.parent, `

${isExported ? "export " : ""}type ${name$1} = typeof ${name$1}[keyof typeof ${name$1}]`)
						];
					},
					messageId: "enumFix"
				}] : null
			});
		} };
	},
	defaultOptions: [],
	meta: {
		docs: { description: "Avoid using TypeScript's enums." },
		hasSuggestions: true,
		messages: {
			enum: "This enum will not be allowed under TypeScript's --erasableSyntaxOnly.",
			enumFix: "Replace enum with an equivalent object literal."
		},
		schema: [],
		type: "problem"
	},
	name: "enums"
});

//#endregion
//#region node_modules/.pnpm/eslint-plugin-erasable-syntax-only@0.4.0_@typescript-eslint+parser@8.50.0_eslint@9.39.2_21a98245f04316fc7a482ff7a0e7c167/node_modules/eslint-plugin-erasable-syntax-only/lib/rules/import-aliases.js
const rule$2 = createRule({
	create(context) {
		return { TSImportEqualsDeclaration(node) {
			if (node.moduleReference.type === import_dist.AST_NODE_TYPES.TSExternalModuleReference) {
				const importName = node.id.name;
				const importModule = node.moduleReference.expression.value;
				context.report({
					messageId: "importAlias",
					node,
					suggest: [{
						fix(fixer) {
							return fixer.replaceText(node, `import ${importName} from "${importModule}";`);
						},
						messageId: "importAliasDefaultFix"
					}, {
						fix(fixer) {
							return fixer.replaceText(node, `import * as ${importName} from "${importModule}";`);
						},
						messageId: "importAliasNamespaceFix"
					}]
				});
			}
		} };
	},
	defaultOptions: [],
	meta: {
		docs: { description: "Avoid using TypeScript's import aliases." },
		hasSuggestions: true,
		messages: {
			importAlias: "This import alias will not be allowed under TypeScript's --erasableSyntaxOnly.",
			importAliasDefaultFix: "Switch to default import.",
			importAliasNamespaceFix: "Switch to namespace import."
		},
		schema: [],
		type: "problem"
	},
	name: "import-aliases"
});

//#endregion
//#region node_modules/.pnpm/cached-factory@0.1.0/node_modules/cached-factory/lib/index.js
var CachedFactory = class {
	#cache = /* @__PURE__ */ new Map();
	#getter;
	constructor(factory) {
		this.#getter = factory;
	}
	clear() {
		this.#cache.clear();
	}
	entries() {
		return this.#cache.entries();
	}
	get(key) {
		const existing = this.#cache.get(key);
		if (existing) return existing;
		const value = this.#getter(key);
		this.#cache.set(key, value);
		return value;
	}
};

//#endregion
//#region node_modules/.pnpm/eslint-plugin-erasable-syntax-only@0.4.0_@typescript-eslint+parser@8.50.0_eslint@9.39.2_21a98245f04316fc7a482ff7a0e7c167/node_modules/eslint-plugin-erasable-syntax-only/lib/rules/namespaces.js
function skipExportParent(node) {
	return node.parent.type == import_dist.AST_NODE_TYPES.ExportNamedDeclaration ? node.parent : node;
}
function skipModuleParent(node) {
	return node.parent.type === import_dist.AST_NODE_TYPES.TSModuleDeclaration ? node.parent : node;
}
const rule$1 = createRule({
	create(context) {
		const hasValueStatementCache = new CachedFactory((node) => !node.declare && node.id.type !== import_dist.AST_NODE_TYPES.Literal && node.body.body.some?.(isValueStatement));
		function isValueStatement(node) {
			switch (node.type) {
				case import_dist.AST_NODE_TYPES.ExportNamedDeclaration: return !node.declaration || isValueStatement(node.declaration);
				case import_dist.AST_NODE_TYPES.TSInterfaceDeclaration:
				case import_dist.AST_NODE_TYPES.TSTypeAliasDeclaration: return false;
				case import_dist.AST_NODE_TYPES.TSModuleDeclaration: return hasValueStatementCache.get(node);
				default: return true;
			}
		}
		return { TSModuleDeclaration(node) {
			if (hasValueStatementCache.get(node) && skipExportParent(node).parent.type !== import_dist.AST_NODE_TYPES.TSModuleBlock) context.report({
				messageId: "namespace",
				node: skipModuleParent(node)
			});
		} };
	},
	defaultOptions: [],
	meta: {
		docs: { description: "Avoid using TypeScript's namespaces." },
		messages: { namespace: "This namespace will not be allowed under TypeScript's --erasableSyntaxOnly." },
		schema: [],
		type: "problem"
	},
	name: "namespaces"
});

//#endregion
//#region node_modules/.pnpm/eslint-plugin-erasable-syntax-only@0.4.0_@typescript-eslint+parser@8.50.0_eslint@9.39.2_21a98245f04316fc7a482ff7a0e7c167/node_modules/eslint-plugin-erasable-syntax-only/lib/rules/parameter-properties.js
const rule = createRule({
	create(context) {
		return { TSParameterProperty(node) {
			context.report({
				messageId: "parameterProperty",
				node
			});
		} };
	},
	defaultOptions: [],
	meta: {
		docs: { description: "Avoid using TypeScript's class parameter properties." },
		messages: { parameterProperty: "This parameter property will not be allowed under TypeScript's --erasableSyntaxOnly." },
		schema: [],
		type: "problem"
	},
	name: "parameter-properties"
});

//#endregion
//#region node_modules/.pnpm/eslint-plugin-erasable-syntax-only@0.4.0_@typescript-eslint+parser@8.50.0_eslint@9.39.2_21a98245f04316fc7a482ff7a0e7c167/node_modules/eslint-plugin-erasable-syntax-only/lib/rules/index.js
const rules = {
	enums: rule$3,
	"import-aliases": rule$2,
	namespaces: rule$1,
	"parameter-properties": rule
};

//#endregion
//#region node_modules/.pnpm/eslint-plugin-erasable-syntax-only@0.4.0_@typescript-eslint+parser@8.50.0_eslint@9.39.2_21a98245f04316fc7a482ff7a0e7c167/node_modules/eslint-plugin-erasable-syntax-only/lib/index.js
const { name, version } = Module.createRequire(import.meta.url)("../package.json");
const plugin = {
	configs: { get recommended() {
		return recommended;
	} },
	meta: {
		name,
		version
	},
	rules
};
const recommended = {
	plugins: { "erasable-syntax-only": plugin },
	rules: Object.fromEntries(Object.keys(rules).map((rule$4) => [`erasable-syntax-only/${rule$4}`, "error"]))
};
var index_default = plugin;

//#endregion
export { index_default as default, plugin, rules };