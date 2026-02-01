import { t as __commonJSMin } from "./rolldown-runtime.mjs";

//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.5.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/eslint-utils/deepMerge.js
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
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.5.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/eslint-utils/applyDefault.js
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
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.5.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/eslint-utils/parserSeemsToBeTSESLint.js
var require_parserSeemsToBeTSESLint = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.parserSeemsToBeTSESLint = parserSeemsToBeTSESLint;
	function parserSeemsToBeTSESLint(parser) {
		return !!parser && /(?:typescript-eslint|\.\.)[\w/\\]*parser/.test(parser);
	}
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.5.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/eslint-utils/getParserServices.js
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
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.5.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/eslint-utils/InferTypesFromRule.js
var require_InferTypesFromRule = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));

//#endregion
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.5.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/eslint-utils/nullThrows.js
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
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.5.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/eslint-utils/RuleCreator.js
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
		return function createNamedRule({ meta, name, ...rule }) {
			return createRule({
				meta: {
					...meta,
					docs: {
						...meta.docs,
						url: urlCreator(name)
					}
				},
				...rule
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
//#region node_modules/.pnpm/@typescript-eslint+utils@8.50.0_eslint@9.39.2_jiti@2.5.1__typescript@5.9.3/node_modules/@typescript-eslint/utils/dist/eslint-utils/index.js
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
export { require_eslint_utils as t };