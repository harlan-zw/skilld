import { FlatConfigComposer } from "eslint-flat-config-utils";
import process from "node:process";
import fsPromises from "node:fs/promises";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
import { isPackageExists } from "local-pkg";
import createCommand from "eslint-plugin-command/config";
import pluginComments from "@eslint-community/eslint-plugin-eslint-comments";
import pluginAntfu from "eslint-plugin-antfu";
import pluginImportLite from "eslint-plugin-import-lite";
import pluginNode from "eslint-plugin-n";
import pluginPerfectionist from "eslint-plugin-perfectionist";
import pluginUnicorn from "eslint-plugin-unicorn";
import pluginUnusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import { mergeProcessors, processorPassThrough } from "eslint-merge-processors";
import { configs } from "eslint-plugin-regexp";

//#region node_modules/.pnpm/find-up-simple@1.0.1/node_modules/find-up-simple/index.js
const toPath = (urlOrPath) => urlOrPath instanceof URL ? fileURLToPath(urlOrPath) : urlOrPath;
async function findUp(name, { cwd = process.cwd(), type = "file", stopAt } = {}) {
	let directory = path.resolve(toPath(cwd) ?? "");
	const { root } = path.parse(directory);
	stopAt = path.resolve(directory, toPath(stopAt ?? root));
	const isAbsoluteName = path.isAbsolute(name);
	while (directory) {
		const filePath = isAbsoluteName ? name : path.join(directory, name);
		try {
			const stats = await fsPromises.stat(filePath);
			if (type === "file" && stats.isFile() || type === "directory" && stats.isDirectory()) return filePath;
		} catch {}
		if (directory === stopAt || directory === root) break;
		directory = path.dirname(directory);
	}
}
function findUpSync(name, { cwd = process.cwd(), type = "file", stopAt } = {}) {
	let directory = path.resolve(toPath(cwd) ?? "");
	const { root } = path.parse(directory);
	stopAt = path.resolve(directory, toPath(stopAt) ?? root);
	const isAbsoluteName = path.isAbsolute(name);
	while (directory) {
		const filePath = isAbsoluteName ? name : path.join(directory, name);
		try {
			const stats = fs.statSync(filePath, { throwIfNoEntry: false });
			if (type === "file" && stats?.isFile() || type === "directory" && stats?.isDirectory()) return filePath;
		} catch {}
		if (directory === stopAt || directory === root) break;
		directory = path.dirname(directory);
	}
}

//#endregion
//#region src/globs.ts
const GLOB_SRC_EXT = "?([cm])[jt]s?(x)";
const GLOB_SRC = "**/*.?([cm])[jt]s?(x)";
const GLOB_JS = "**/*.?([cm])js";
const GLOB_JSX = "**/*.?([cm])jsx";
const GLOB_TS = "**/*.?([cm])ts";
const GLOB_TSX = "**/*.?([cm])tsx";
const GLOB_STYLE = "**/*.{c,le,sc}ss";
const GLOB_CSS = "**/*.css";
const GLOB_POSTCSS = "**/*.{p,post}css";
const GLOB_LESS = "**/*.less";
const GLOB_SCSS = "**/*.scss";
const GLOB_JSON = "**/*.json";
const GLOB_JSON5 = "**/*.json5";
const GLOB_JSONC = "**/*.jsonc";
const GLOB_MARKDOWN = "**/*.md";
const GLOB_MARKDOWN_IN_MARKDOWN = "**/*.md/*.md";
const GLOB_SVELTE = "**/*.svelte?(.{js,ts})";
const GLOB_VUE = "**/*.vue";
const GLOB_YAML = "**/*.y?(a)ml";
const GLOB_TOML = "**/*.toml";
const GLOB_XML = "**/*.xml";
const GLOB_SVG = "**/*.svg";
const GLOB_HTML = "**/*.htm?(l)";
const GLOB_ASTRO = "**/*.astro";
const GLOB_ASTRO_TS = "**/*.astro/*.ts";
const GLOB_GRAPHQL = "**/*.{g,graph}ql";
const GLOB_MARKDOWN_CODE = `${GLOB_MARKDOWN}/${GLOB_SRC}`;
const GLOB_TESTS = [
	`**/__tests__/**/*.${GLOB_SRC_EXT}`,
	`**/*.spec.${GLOB_SRC_EXT}`,
	`**/*.test.${GLOB_SRC_EXT}`,
	`**/*.bench.${GLOB_SRC_EXT}`,
	`**/*.benchmark.${GLOB_SRC_EXT}`
];
const GLOB_ALL_SRC = [
	GLOB_SRC,
	GLOB_STYLE,
	GLOB_JSON,
	GLOB_JSON5,
	GLOB_MARKDOWN,
	GLOB_SVELTE,
	GLOB_VUE,
	GLOB_YAML,
	GLOB_XML,
	GLOB_HTML
];
const GLOB_EXCLUDE = [
	"**/node_modules",
	"**/dist",
	"**/package-lock.json",
	"**/yarn.lock",
	"**/pnpm-lock.yaml",
	"**/bun.lockb",
	"**/output",
	"**/coverage",
	"**/temp",
	"**/.temp",
	"**/tmp",
	"**/.tmp",
	"**/.history",
	"**/.vitepress/cache",
	"**/.nuxt",
	"**/.next",
	"**/.svelte-kit",
	"**/.vercel",
	"**/.changeset",
	"**/.idea",
	"**/.cache",
	"**/.output",
	"**/.vite-inspect",
	"**/.yarn",
	"**/vite.config.*.timestamp-*",
	"**/CHANGELOG*.md",
	"**/*.min.*",
	"**/LICENSE*",
	"**/__snapshots__",
	"**/auto-import?(s).d.ts",
	"**/components.d.ts"
];

//#endregion
//#region src/utils.ts
const scopeUrl = fileURLToPath(new URL(".", import.meta.url));
const isCwdInScope = isPackageExists("@antfu/eslint-config");
const parserPlain = {
	meta: { name: "parser-plain" },
	parseForESLint: (code) => ({
		ast: {
			body: [],
			comments: [],
			loc: {
				end: code.length,
				start: 0
			},
			range: [0, code.length],
			tokens: [],
			type: "Program"
		},
		scopeManager: null,
		services: { isPlain: true },
		visitorKeys: { Program: [] }
	})
};
/**
* Combine array and non-array configs into a single array.
*/
async function combine(...configs$1) {
	return (await Promise.all(configs$1)).flat();
}
/**
* Rename plugin prefixes in a rule object.
* Accepts a map of prefixes to rename.
*
* @example
* ```ts
* import { renameRules } from '@antfu/eslint-config'
*
* export default [{
*   rules: renameRules(
*     {
*       '@typescript-eslint/indent': 'error'
*     },
*     { '@typescript-eslint': 'ts' }
*   )
* }]
* ```
*/
function renameRules(rules, map) {
	return Object.fromEntries(Object.entries(rules).map(([key, value]) => {
		for (const [from, to] of Object.entries(map)) if (key.startsWith(`${from}/`)) return [to + key.slice(from.length), value];
		return [key, value];
	}));
}
/**
* Rename plugin names a flat configs array
*
* @example
* ```ts
* import { renamePluginInConfigs } from '@antfu/eslint-config'
* import someConfigs from './some-configs'
*
* export default renamePluginInConfigs(someConfigs, {
*   '@typescript-eslint': 'ts',
*   '@stylistic': 'style',
* })
* ```
*/
function renamePluginInConfigs(configs$1, map) {
	return configs$1.map((i) => {
		const clone = { ...i };
		if (clone.rules) clone.rules = renameRules(clone.rules, map);
		if (clone.plugins) clone.plugins = Object.fromEntries(Object.entries(clone.plugins).map(([key, value]) => {
			if (key in map) return [map[key], value];
			return [key, value];
		}));
		return clone;
	});
}
function toArray(value) {
	return Array.isArray(value) ? value : [value];
}
async function interopDefault(m) {
	const resolved = await m;
	return resolved.default || resolved;
}
function isPackageInScope(name) {
	return isPackageExists(name, { paths: [scopeUrl] });
}
async function ensurePackages(packages) {
	if (process.env.CI || process.stdout.isTTY === false || isCwdInScope === false) return;
	const nonExistingPackages = packages.filter((i) => i && !isPackageInScope(i));
	if (nonExistingPackages.length === 0) return;
	if (await (await import("@clack/prompts")).confirm({ message: `${nonExistingPackages.length === 1 ? "Package is" : "Packages are"} required for this config: ${nonExistingPackages.join(", ")}. Do you want to install them?` })) await import("@antfu/install-pkg").then((i) => i.installPackage(nonExistingPackages, { dev: true }));
}
function isInEditorEnv() {
	if (process.env.CI) return false;
	if (isInGitHooksOrLintStaged()) return false;
	return !!(process.env.VSCODE_PID || process.env.VSCODE_CWD || process.env.JETBRAINS_IDE || process.env.VIM || process.env.NVIM);
}
function isInGitHooksOrLintStaged() {
	return !!(process.env.GIT_PARAMS || process.env.VSCODE_GIT_COMMAND || process.env.npm_lifecycle_script?.startsWith("lint-staged"));
}

//#endregion
//#region src/configs/astro.ts
async function astro(options = {}) {
	const { files = [GLOB_ASTRO], overrides = {}, stylistic: stylistic$1 = true } = options;
	const [pluginAstro, parserAstro, parserTs] = await Promise.all([
		interopDefault(import("eslint-plugin-astro")),
		interopDefault(import("astro-eslint-parser")),
		interopDefault(import("@typescript-eslint/parser"))
	]);
	return [{
		name: "antfu/astro/setup",
		plugins: { astro: pluginAstro }
	}, {
		files,
		languageOptions: {
			globals: pluginAstro.environments.astro.globals,
			parser: parserAstro,
			parserOptions: {
				extraFileExtensions: [".astro"],
				parser: parserTs
			},
			sourceType: "module"
		},
		name: "antfu/astro/rules",
		processor: "astro/client-side-ts",
		rules: {
			"antfu/no-top-level-await": "off",
			"astro/missing-client-only-directive-value": "error",
			"astro/no-conflict-set-directives": "error",
			"astro/no-deprecated-astro-canonicalurl": "error",
			"astro/no-deprecated-astro-fetchcontent": "error",
			"astro/no-deprecated-astro-resolve": "error",
			"astro/no-deprecated-getentrybyslug": "error",
			"astro/no-set-html-directive": "off",
			"astro/no-unused-define-vars-in-style": "error",
			"astro/semi": "off",
			"astro/valid-compile": "error",
			...stylistic$1 ? {
				"style/indent": "off",
				"style/jsx-closing-tag-location": "off",
				"style/jsx-one-expression-per-line": "off",
				"style/no-multiple-empty-lines": "off"
			} : {},
			...overrides
		}
	}];
}

//#endregion
//#region src/configs/command.ts
async function command() {
	return [{
		...createCommand(),
		name: "antfu/command/rules"
	}];
}

//#endregion
//#region src/configs/comments.ts
async function comments() {
	return [{
		name: "antfu/eslint-comments/rules",
		plugins: { "eslint-comments": pluginComments },
		rules: {
			"eslint-comments/no-aggregating-enable": "error",
			"eslint-comments/no-duplicate-disable": "error",
			"eslint-comments/no-unlimited-disable": "error",
			"eslint-comments/no-unused-enable": "error"
		}
	}];
}

//#endregion
//#region src/configs/disables.ts
async function disables() {
	return [
		{
			files: [`**/scripts/${GLOB_SRC}`],
			name: "antfu/disables/scripts",
			rules: {
				"antfu/no-top-level-await": "off",
				"no-console": "off",
				"ts/explicit-function-return-type": "off"
			}
		},
		{
			files: [`**/cli/${GLOB_SRC}`, `**/cli.${GLOB_SRC_EXT}`],
			name: "antfu/disables/cli",
			rules: {
				"antfu/no-top-level-await": "off",
				"no-console": "off"
			}
		},
		{
			files: ["**/bin/**/*", `**/bin.${GLOB_SRC_EXT}`],
			name: "antfu/disables/bin",
			rules: {
				"antfu/no-import-dist": "off",
				"antfu/no-import-node-modules-by-path": "off"
			}
		},
		{
			files: ["**/*.d.?([cm])ts"],
			name: "antfu/disables/dts",
			rules: {
				"eslint-comments/no-unlimited-disable": "off",
				"no-restricted-syntax": "off",
				"unused-imports/no-unused-vars": "off"
			}
		},
		{
			files: ["**/*.js", "**/*.cjs"],
			name: "antfu/disables/cjs",
			rules: { "ts/no-require-imports": "off" }
		},
		{
			files: [`**/*.config.${GLOB_SRC_EXT}`, `**/*.config.*.${GLOB_SRC_EXT}`],
			name: "antfu/disables/config-files",
			rules: {
				"antfu/no-top-level-await": "off",
				"no-console": "off",
				"ts/explicit-function-return-type": "off"
			}
		}
	];
}

//#endregion
//#region src/configs/stylistic.ts
const StylisticConfigDefaults = {
	experimental: false,
	indent: 2,
	jsx: true,
	quotes: "single",
	semi: false
};
async function stylistic(options = {}) {
	const { experimental, indent, jsx: jsx$1, lessOpinionated = false, overrides = {}, quotes, semi } = {
		...StylisticConfigDefaults,
		...options
	};
	const pluginStylistic = await interopDefault(import("@stylistic/eslint-plugin"));
	const config = pluginStylistic.configs.customize({
		experimental,
		indent,
		jsx: jsx$1,
		pluginName: "style",
		quotes,
		semi
	});
	return [{
		name: "antfu/stylistic/rules",
		plugins: {
			antfu: pluginAntfu,
			style: pluginStylistic
		},
		rules: {
			...config.rules,
			...experimental ? {} : { "antfu/consistent-list-newline": "error" },
			"antfu/consistent-chaining": "error",
			...lessOpinionated ? { curly: ["error", "all"] } : {
				"antfu/curly": "error",
				"antfu/if-newline": "error",
				"antfu/top-level-function": "error"
			},
			"style/generator-star-spacing": ["error", {
				after: true,
				before: false
			}],
			"style/yield-star-spacing": ["error", {
				after: true,
				before: false
			}],
			...overrides
		}
	}];
}

//#endregion
//#region src/configs/formatters.ts
function mergePrettierOptions(options, overrides = {}) {
	return {
		...options,
		...overrides,
		plugins: [...overrides.plugins || [], ...options.plugins || []]
	};
}
async function formatters(options = {}, stylistic$1 = {}) {
	if (options === true) {
		const isPrettierPluginXmlInScope = isPackageInScope("@prettier/plugin-xml");
		options = {
			astro: isPackageInScope("prettier-plugin-astro"),
			css: true,
			graphql: true,
			html: true,
			markdown: true,
			slidev: isPackageExists("@slidev/cli"),
			svg: isPrettierPluginXmlInScope,
			xml: isPrettierPluginXmlInScope
		};
	}
	await ensurePackages([
		"eslint-plugin-format",
		options.markdown && options.slidev ? "prettier-plugin-slidev" : void 0,
		options.astro ? "prettier-plugin-astro" : void 0,
		options.xml || options.svg ? "@prettier/plugin-xml" : void 0
	]);
	if (options.slidev && options.markdown !== true && options.markdown !== "prettier") throw new Error("`slidev` option only works when `markdown` is enabled with `prettier`");
	const { indent, quotes, semi } = {
		...StylisticConfigDefaults,
		...stylistic$1
	};
	const prettierOptions = Object.assign({
		endOfLine: "auto",
		printWidth: 120,
		semi,
		singleQuote: quotes === "single",
		tabWidth: typeof indent === "number" ? indent : 2,
		trailingComma: "all",
		useTabs: indent === "tab"
	}, options.prettierOptions || {});
	const prettierXmlOptions = {
		xmlQuoteAttributes: "double",
		xmlSelfClosingSpace: true,
		xmlSortAttributesByKey: false,
		xmlWhitespaceSensitivity: "ignore"
	};
	const dprintOptions = Object.assign({
		indentWidth: typeof indent === "number" ? indent : 2,
		quoteStyle: quotes === "single" ? "preferSingle" : "preferDouble",
		useTabs: indent === "tab"
	}, options.dprintOptions || {});
	const configs$1 = [{
		name: "antfu/formatter/setup",
		plugins: { format: await interopDefault(import("eslint-plugin-format")) }
	}];
	if (options.css) configs$1.push({
		files: [GLOB_CSS, GLOB_POSTCSS],
		languageOptions: { parser: parserPlain },
		name: "antfu/formatter/css",
		rules: { "format/prettier": ["error", mergePrettierOptions(prettierOptions, { parser: "css" })] }
	}, {
		files: [GLOB_SCSS],
		languageOptions: { parser: parserPlain },
		name: "antfu/formatter/scss",
		rules: { "format/prettier": ["error", mergePrettierOptions(prettierOptions, { parser: "scss" })] }
	}, {
		files: [GLOB_LESS],
		languageOptions: { parser: parserPlain },
		name: "antfu/formatter/less",
		rules: { "format/prettier": ["error", mergePrettierOptions(prettierOptions, { parser: "less" })] }
	});
	if (options.html) configs$1.push({
		files: [GLOB_HTML],
		languageOptions: { parser: parserPlain },
		name: "antfu/formatter/html",
		rules: { "format/prettier": ["error", mergePrettierOptions(prettierOptions, { parser: "html" })] }
	});
	if (options.xml) configs$1.push({
		files: [GLOB_XML],
		languageOptions: { parser: parserPlain },
		name: "antfu/formatter/xml",
		rules: { "format/prettier": ["error", mergePrettierOptions({
			...prettierXmlOptions,
			...prettierOptions
		}, {
			parser: "xml",
			plugins: ["@prettier/plugin-xml"]
		})] }
	});
	if (options.svg) configs$1.push({
		files: [GLOB_SVG],
		languageOptions: { parser: parserPlain },
		name: "antfu/formatter/svg",
		rules: { "format/prettier": ["error", mergePrettierOptions({
			...prettierXmlOptions,
			...prettierOptions
		}, {
			parser: "xml",
			plugins: ["@prettier/plugin-xml"]
		})] }
	});
	if (options.markdown) {
		const formater = options.markdown === true ? "prettier" : options.markdown;
		const GLOB_SLIDEV = !options.slidev ? [] : options.slidev === true ? ["**/slides.md"] : options.slidev.files;
		configs$1.push({
			files: [GLOB_MARKDOWN],
			ignores: GLOB_SLIDEV,
			languageOptions: { parser: parserPlain },
			name: "antfu/formatter/markdown",
			rules: { [`format/${formater}`]: ["error", formater === "prettier" ? mergePrettierOptions(prettierOptions, {
				embeddedLanguageFormatting: "off",
				parser: "markdown"
			}) : {
				...dprintOptions,
				language: "markdown"
			}] }
		});
		if (options.slidev) configs$1.push({
			files: GLOB_SLIDEV,
			languageOptions: { parser: parserPlain },
			name: "antfu/formatter/slidev",
			rules: { "format/prettier": ["error", mergePrettierOptions(prettierOptions, {
				embeddedLanguageFormatting: "off",
				parser: "slidev",
				plugins: ["prettier-plugin-slidev"]
			})] }
		});
	}
	if (options.astro) {
		configs$1.push({
			files: [GLOB_ASTRO],
			languageOptions: { parser: parserPlain },
			name: "antfu/formatter/astro",
			rules: { "format/prettier": ["error", mergePrettierOptions(prettierOptions, {
				parser: "astro",
				plugins: ["prettier-plugin-astro"]
			})] }
		});
		configs$1.push({
			files: [GLOB_ASTRO, GLOB_ASTRO_TS],
			name: "antfu/formatter/astro/disables",
			rules: {
				"style/arrow-parens": "off",
				"style/block-spacing": "off",
				"style/comma-dangle": "off",
				"style/indent": "off",
				"style/no-multi-spaces": "off",
				"style/quotes": "off",
				"style/semi": "off"
			}
		});
	}
	if (options.graphql) configs$1.push({
		files: [GLOB_GRAPHQL],
		languageOptions: { parser: parserPlain },
		name: "antfu/formatter/graphql",
		rules: { "format/prettier": ["error", mergePrettierOptions(prettierOptions, { parser: "graphql" })] }
	});
	return configs$1;
}

//#endregion
//#region src/configs/ignores.ts
async function ignores(userIgnores = []) {
	let ignores$1 = [...GLOB_EXCLUDE];
	if (typeof userIgnores === "function") ignores$1 = userIgnores(ignores$1);
	else ignores$1 = [...ignores$1, ...userIgnores];
	return [{
		ignores: ignores$1,
		name: "antfu/ignores"
	}];
}

//#endregion
//#region src/configs/imports.ts
async function imports(options = {}) {
	const { overrides = {}, stylistic: stylistic$1 = true } = options;
	return [{
		name: "antfu/imports/rules",
		plugins: {
			antfu: pluginAntfu,
			import: pluginImportLite
		},
		rules: {
			"antfu/import-dedupe": "error",
			"antfu/no-import-dist": "error",
			"antfu/no-import-node-modules-by-path": "error",
			"import/consistent-type-specifier-style": ["error", "top-level"],
			"import/first": "error",
			"import/no-duplicates": "error",
			"import/no-mutable-exports": "error",
			"import/no-named-default": "error",
			...stylistic$1 ? { "import/newline-after-import": ["error", { count: 1 }] } : {},
			...overrides
		}
	}];
}

//#endregion
//#region src/configs/javascript.ts
async function javascript(options = {}) {
	const { isInEditor = false, overrides = {} } = options;
	return [{
		languageOptions: {
			ecmaVersion: "latest",
			globals: {
				...globals.browser,
				...globals.es2021,
				...globals.node,
				document: "readonly",
				navigator: "readonly",
				window: "readonly"
			},
			parserOptions: {
				ecmaFeatures: { jsx: true },
				ecmaVersion: "latest",
				sourceType: "module"
			},
			sourceType: "module"
		},
		linterOptions: { reportUnusedDisableDirectives: true },
		name: "antfu/javascript/setup"
	}, {
		name: "antfu/javascript/rules",
		plugins: {
			"antfu": pluginAntfu,
			"unused-imports": pluginUnusedImports
		},
		rules: {
			"accessor-pairs": ["error", {
				enforceForClassMembers: true,
				setWithoutGet: true
			}],
			"antfu/no-top-level-await": "error",
			"array-callback-return": "error",
			"block-scoped-var": "error",
			"constructor-super": "error",
			"default-case-last": "error",
			"dot-notation": ["error", { allowKeywords: true }],
			"eqeqeq": ["error", "smart"],
			"new-cap": ["error", {
				capIsNew: false,
				newIsCap: true,
				properties: true
			}],
			"no-alert": "error",
			"no-array-constructor": "error",
			"no-async-promise-executor": "error",
			"no-caller": "error",
			"no-case-declarations": "error",
			"no-class-assign": "error",
			"no-compare-neg-zero": "error",
			"no-cond-assign": ["error", "always"],
			"no-console": ["error", { allow: ["warn", "error"] }],
			"no-const-assign": "error",
			"no-control-regex": "error",
			"no-debugger": "error",
			"no-delete-var": "error",
			"no-dupe-args": "error",
			"no-dupe-class-members": "error",
			"no-dupe-keys": "error",
			"no-duplicate-case": "error",
			"no-empty": ["error", { allowEmptyCatch: true }],
			"no-empty-character-class": "error",
			"no-empty-pattern": "error",
			"no-eval": "error",
			"no-ex-assign": "error",
			"no-extend-native": "error",
			"no-extra-bind": "error",
			"no-extra-boolean-cast": "error",
			"no-fallthrough": "error",
			"no-func-assign": "error",
			"no-global-assign": "error",
			"no-implied-eval": "error",
			"no-import-assign": "error",
			"no-invalid-regexp": "error",
			"no-irregular-whitespace": "error",
			"no-iterator": "error",
			"no-labels": ["error", {
				allowLoop: false,
				allowSwitch: false
			}],
			"no-lone-blocks": "error",
			"no-loss-of-precision": "error",
			"no-misleading-character-class": "error",
			"no-multi-str": "error",
			"no-new": "error",
			"no-new-func": "error",
			"no-new-native-nonconstructor": "error",
			"no-new-wrappers": "error",
			"no-obj-calls": "error",
			"no-octal": "error",
			"no-octal-escape": "error",
			"no-proto": "error",
			"no-prototype-builtins": "error",
			"no-redeclare": ["error", { builtinGlobals: false }],
			"no-regex-spaces": "error",
			"no-restricted-globals": [
				"error",
				{
					message: "Use `globalThis` instead.",
					name: "global"
				},
				{
					message: "Use `globalThis` instead.",
					name: "self"
				}
			],
			"no-restricted-properties": [
				"error",
				{
					message: "Use `Object.getPrototypeOf` or `Object.setPrototypeOf` instead.",
					property: "__proto__"
				},
				{
					message: "Use `Object.defineProperty` instead.",
					property: "__defineGetter__"
				},
				{
					message: "Use `Object.defineProperty` instead.",
					property: "__defineSetter__"
				},
				{
					message: "Use `Object.getOwnPropertyDescriptor` instead.",
					property: "__lookupGetter__"
				},
				{
					message: "Use `Object.getOwnPropertyDescriptor` instead.",
					property: "__lookupSetter__"
				}
			],
			"no-restricted-syntax": [
				"error",
				"TSEnumDeclaration[const=true]",
				"TSExportAssignment"
			],
			"no-self-assign": ["error", { props: true }],
			"no-self-compare": "error",
			"no-sequences": "error",
			"no-shadow-restricted-names": "error",
			"no-sparse-arrays": "error",
			"no-template-curly-in-string": "error",
			"no-this-before-super": "error",
			"no-throw-literal": "error",
			"no-undef": "error",
			"no-undef-init": "error",
			"no-unexpected-multiline": "error",
			"no-unmodified-loop-condition": "error",
			"no-unneeded-ternary": ["error", { defaultAssignment: false }],
			"no-unreachable": "error",
			"no-unreachable-loop": "error",
			"no-unsafe-finally": "error",
			"no-unsafe-negation": "error",
			"no-unused-expressions": ["error", {
				allowShortCircuit: true,
				allowTaggedTemplates: true,
				allowTernary: true
			}],
			"no-unused-vars": ["error", {
				args: "none",
				caughtErrors: "none",
				ignoreRestSiblings: true,
				vars: "all"
			}],
			"no-use-before-define": ["error", {
				classes: false,
				functions: false,
				variables: true
			}],
			"no-useless-backreference": "error",
			"no-useless-call": "error",
			"no-useless-catch": "error",
			"no-useless-computed-key": "error",
			"no-useless-constructor": "error",
			"no-useless-rename": "error",
			"no-useless-return": "error",
			"no-var": "error",
			"no-with": "error",
			"object-shorthand": [
				"error",
				"always",
				{
					avoidQuotes: true,
					ignoreConstructors: false
				}
			],
			"one-var": ["error", { initialized: "never" }],
			"prefer-arrow-callback": ["error", {
				allowNamedFunctions: false,
				allowUnboundThis: true
			}],
			"prefer-const": [isInEditor ? "warn" : "error", {
				destructuring: "all",
				ignoreReadBeforeAssign: true
			}],
			"prefer-exponentiation-operator": "error",
			"prefer-promise-reject-errors": "error",
			"prefer-regex-literals": ["error", { disallowRedundantWrapping: true }],
			"prefer-rest-params": "error",
			"prefer-spread": "error",
			"prefer-template": "error",
			"symbol-description": "error",
			"unicode-bom": ["error", "never"],
			"unused-imports/no-unused-imports": isInEditor ? "warn" : "error",
			"unused-imports/no-unused-vars": ["error", {
				args: "after-used",
				argsIgnorePattern: "^_",
				ignoreRestSiblings: true,
				vars: "all",
				varsIgnorePattern: "^_"
			}],
			"use-isnan": ["error", {
				enforceForIndexOf: true,
				enforceForSwitchCase: true
			}],
			"valid-typeof": ["error", { requireStringLiterals: true }],
			"vars-on-top": "error",
			"yoda": ["error", "never"],
			...overrides
		}
	}];
}

//#endregion
//#region src/configs/jsdoc.ts
async function jsdoc(options = {}) {
	const { stylistic: stylistic$1 = true } = options;
	return [{
		name: "antfu/jsdoc/rules",
		plugins: { jsdoc: await interopDefault(import("eslint-plugin-jsdoc")) },
		rules: {
			"jsdoc/check-access": "warn",
			"jsdoc/check-param-names": "warn",
			"jsdoc/check-property-names": "warn",
			"jsdoc/check-types": "warn",
			"jsdoc/empty-tags": "warn",
			"jsdoc/implements-on-classes": "warn",
			"jsdoc/no-defaults": "warn",
			"jsdoc/no-multi-asterisks": "warn",
			"jsdoc/require-param-name": "warn",
			"jsdoc/require-property": "warn",
			"jsdoc/require-property-description": "warn",
			"jsdoc/require-property-name": "warn",
			"jsdoc/require-returns-check": "warn",
			"jsdoc/require-returns-description": "warn",
			"jsdoc/require-yields-check": "warn",
			...stylistic$1 ? {
				"jsdoc/check-alignment": "warn",
				"jsdoc/multiline-blocks": "warn"
			} : {}
		}
	}];
}

//#endregion
//#region src/configs/jsonc.ts
async function jsonc(options = {}) {
	const { files = [
		GLOB_JSON,
		GLOB_JSON5,
		GLOB_JSONC
	], overrides = {}, stylistic: stylistic$1 = true } = options;
	const { indent = 2 } = typeof stylistic$1 === "boolean" ? {} : stylistic$1;
	const [pluginJsonc, parserJsonc] = await Promise.all([interopDefault(import("eslint-plugin-jsonc")), interopDefault(import("jsonc-eslint-parser"))]);
	return [{
		name: "antfu/jsonc/setup",
		plugins: { jsonc: pluginJsonc }
	}, {
		files,
		languageOptions: { parser: parserJsonc },
		name: "antfu/jsonc/rules",
		rules: {
			"jsonc/no-bigint-literals": "error",
			"jsonc/no-binary-expression": "error",
			"jsonc/no-binary-numeric-literals": "error",
			"jsonc/no-dupe-keys": "error",
			"jsonc/no-escape-sequence-in-identifier": "error",
			"jsonc/no-floating-decimal": "error",
			"jsonc/no-hexadecimal-numeric-literals": "error",
			"jsonc/no-infinity": "error",
			"jsonc/no-multi-str": "error",
			"jsonc/no-nan": "error",
			"jsonc/no-number-props": "error",
			"jsonc/no-numeric-separators": "error",
			"jsonc/no-octal": "error",
			"jsonc/no-octal-escape": "error",
			"jsonc/no-octal-numeric-literals": "error",
			"jsonc/no-parenthesized": "error",
			"jsonc/no-plus-sign": "error",
			"jsonc/no-regexp-literals": "error",
			"jsonc/no-sparse-arrays": "error",
			"jsonc/no-template-literals": "error",
			"jsonc/no-undefined-value": "error",
			"jsonc/no-unicode-codepoint-escapes": "error",
			"jsonc/no-useless-escape": "error",
			"jsonc/space-unary-ops": "error",
			"jsonc/valid-json-number": "error",
			"jsonc/vue-custom-block/no-parsing-error": "error",
			...stylistic$1 ? {
				"jsonc/array-bracket-spacing": ["error", "never"],
				"jsonc/comma-dangle": ["error", "never"],
				"jsonc/comma-style": ["error", "last"],
				"jsonc/indent": ["error", indent],
				"jsonc/key-spacing": ["error", {
					afterColon: true,
					beforeColon: false
				}],
				"jsonc/object-curly-newline": ["error", {
					consistent: true,
					multiline: true
				}],
				"jsonc/object-curly-spacing": ["error", "always"],
				"jsonc/object-property-newline": ["error", { allowAllPropertiesOnSameLine: true }],
				"jsonc/quote-props": "error",
				"jsonc/quotes": "error"
			} : {},
			...overrides
		}
	}];
}

//#endregion
//#region src/configs/jsx.ts
async function jsx(options = {}) {
	const { a11y } = options;
	const baseConfig = {
		files: [GLOB_JSX, GLOB_TSX],
		languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
		name: "antfu/jsx/setup",
		plugins: {},
		rules: {}
	};
	if (!a11y) return [baseConfig];
	await ensurePackages(["eslint-plugin-jsx-a11y"]);
	const jsxA11yPlugin = await interopDefault(import("eslint-plugin-jsx-a11y"));
	const a11yConfig = jsxA11yPlugin.flatConfigs.recommended;
	const a11yRules = {
		...a11yConfig.rules || {},
		...typeof a11y === "object" && a11y.overrides ? a11y.overrides : {}
	};
	return [{
		...baseConfig,
		...a11yConfig,
		files: baseConfig.files,
		languageOptions: {
			...baseConfig.languageOptions,
			...a11yConfig.languageOptions
		},
		name: baseConfig.name,
		plugins: {
			...baseConfig.plugins,
			"jsx-a11y": jsxA11yPlugin
		},
		rules: {
			...baseConfig.rules,
			...a11yRules
		}
	}];
}

//#endregion
//#region src/configs/markdown.ts
async function markdown(options = {}) {
	const { componentExts = [], files = [GLOB_MARKDOWN], overrides = {} } = options;
	const markdown$1 = await interopDefault(import("@eslint/markdown"));
	return [
		{
			name: "antfu/markdown/setup",
			plugins: { markdown: markdown$1 }
		},
		{
			files,
			ignores: [GLOB_MARKDOWN_IN_MARKDOWN],
			name: "antfu/markdown/processor",
			processor: mergeProcessors([markdown$1.processors.markdown, processorPassThrough])
		},
		{
			files,
			languageOptions: { parser: parserPlain },
			name: "antfu/markdown/parser"
		},
		{
			files: [GLOB_MARKDOWN_CODE, ...componentExts.map((ext) => `${GLOB_MARKDOWN}/**/*.${ext}`)],
			languageOptions: { parserOptions: { ecmaFeatures: { impliedStrict: true } } },
			name: "antfu/markdown/disables",
			rules: {
				"antfu/no-top-level-await": "off",
				"no-alert": "off",
				"no-console": "off",
				"no-labels": "off",
				"no-lone-blocks": "off",
				"no-restricted-syntax": "off",
				"no-undef": "off",
				"no-unused-expressions": "off",
				"no-unused-labels": "off",
				"no-unused-vars": "off",
				"node/prefer-global/process": "off",
				"style/comma-dangle": "off",
				"style/eol-last": "off",
				"style/padding-line-between-statements": "off",
				"ts/consistent-type-imports": "off",
				"ts/explicit-function-return-type": "off",
				"ts/no-namespace": "off",
				"ts/no-redeclare": "off",
				"ts/no-require-imports": "off",
				"ts/no-unused-expressions": "off",
				"ts/no-unused-vars": "off",
				"ts/no-use-before-define": "off",
				"unicode-bom": "off",
				"unused-imports/no-unused-imports": "off",
				"unused-imports/no-unused-vars": "off",
				...overrides
			}
		}
	];
}

//#endregion
//#region src/configs/nextjs.ts
function normalizeRules(rules) {
	return Object.fromEntries(Object.entries(rules).map(([key, value]) => [key, typeof value === "string" ? [value] : value]));
}
async function nextjs(options = {}) {
	const { files = [GLOB_SRC], overrides = {} } = options;
	await ensurePackages(["@next/eslint-plugin-next"]);
	const pluginNextJS = await interopDefault(import("@next/eslint-plugin-next"));
	function getRules(name) {
		const rules = pluginNextJS.configs?.[name]?.rules;
		if (!rules) throw new Error(`[@antfu/eslint-config] Failed to find config ${name} in @next/eslint-plugin-next`);
		return normalizeRules(rules);
	}
	return [{
		name: "antfu/nextjs/setup",
		plugins: { next: pluginNextJS }
	}, {
		files,
		languageOptions: {
			parserOptions: { ecmaFeatures: { jsx: true } },
			sourceType: "module"
		},
		name: "antfu/nextjs/rules",
		rules: {
			...getRules("recommended"),
			...getRules("core-web-vitals"),
			...overrides
		},
		settings: { react: { version: "detect" } }
	}];
}

//#endregion
//#region src/configs/node.ts
async function node() {
	return [{
		name: "antfu/node/rules",
		plugins: { node: pluginNode },
		rules: {
			"node/handle-callback-err": ["error", "^(err|error)$"],
			"node/no-deprecated-api": "error",
			"node/no-exports-assign": "error",
			"node/no-new-require": "error",
			"node/no-path-concat": "error",
			"node/prefer-global/buffer": ["error", "never"],
			"node/prefer-global/process": ["error", "never"],
			"node/process-exit-as-throw": "error"
		}
	}];
}

//#endregion
//#region src/configs/perfectionist.ts
/**
* Perfectionist plugin for props and items sorting.
*
* @see https://github.com/azat-io/eslint-plugin-perfectionist
*/
async function perfectionist() {
	return [{
		name: "antfu/perfectionist/setup",
		plugins: { perfectionist: pluginPerfectionist },
		rules: {
			"perfectionist/sort-exports": ["error", {
				order: "asc",
				type: "natural"
			}],
			"perfectionist/sort-imports": ["error", {
				groups: [
					"type",
					[
						"parent-type",
						"sibling-type",
						"index-type",
						"internal-type"
					],
					"builtin",
					"external",
					"internal",
					[
						"parent",
						"sibling",
						"index"
					],
					"side-effect",
					"object",
					"unknown"
				],
				newlinesBetween: "ignore",
				order: "asc",
				type: "natural"
			}],
			"perfectionist/sort-named-exports": ["error", {
				order: "asc",
				type: "natural"
			}],
			"perfectionist/sort-named-imports": ["error", {
				order: "asc",
				type: "natural"
			}]
		}
	}];
}

//#endregion
//#region src/configs/pnpm.ts
async function detectCatalogUsage() {
	const workspaceFile = await findUp("pnpm-workspace.yaml");
	if (!workspaceFile) return false;
	const yaml$1 = await fsPromises.readFile(workspaceFile, "utf-8");
	return yaml$1.includes("catalog:") || yaml$1.includes("catalogs:");
}
async function pnpm(options) {
	const [pluginPnpm, pluginYaml, yamlParser, jsoncParser] = await Promise.all([
		interopDefault(import("eslint-plugin-pnpm")),
		interopDefault(import("eslint-plugin-yml")),
		interopDefault(import("yaml-eslint-parser")),
		interopDefault(import("jsonc-eslint-parser"))
	]);
	const { catalogs = await detectCatalogUsage(), isInEditor = false, json = true, sort = true, yaml: yaml$1 = true } = options;
	const configs$1 = [];
	if (json) configs$1.push({
		files: ["package.json", "**/package.json"],
		languageOptions: { parser: jsoncParser },
		name: "antfu/pnpm/package-json",
		plugins: { pnpm: pluginPnpm },
		rules: {
			...catalogs ? { "pnpm/json-enforce-catalog": ["error", {
				autofix: !isInEditor,
				ignores: ["@types/vscode"]
			}] } : {},
			"pnpm/json-prefer-workspace-settings": ["error", { autofix: !isInEditor }],
			"pnpm/json-valid-catalog": ["error", { autofix: !isInEditor }]
		}
	});
	if (yaml$1) {
		configs$1.push({
			files: ["pnpm-workspace.yaml"],
			languageOptions: { parser: yamlParser },
			name: "antfu/pnpm/pnpm-workspace-yaml",
			plugins: { pnpm: pluginPnpm },
			rules: {
				"pnpm/yaml-enforce-settings": ["error", { settings: {
					shellEmulator: true,
					trustPolicy: "no-downgrade"
				} }],
				"pnpm/yaml-no-duplicate-catalog-item": "error",
				"pnpm/yaml-no-unused-catalog-item": "error"
			}
		});
		if (sort) configs$1.push({
			files: ["pnpm-workspace.yaml"],
			languageOptions: { parser: yamlParser },
			name: "antfu/pnpm/pnpm-workspace-yaml-sort",
			plugins: { yaml: pluginYaml },
			rules: { "yaml/sort-keys": [
				"error",
				{
					order: [
						...[
							"cacheDir",
							"catalogMode",
							"cleanupUnusedCatalogs",
							"dedupeDirectDeps",
							"deployAllFiles",
							"enablePrePostScripts",
							"engineStrict",
							"extendNodePath",
							"hoist",
							"hoistPattern",
							"hoistWorkspacePackages",
							"ignoreCompatibilityDb",
							"ignoreDepScripts",
							"ignoreScripts",
							"ignoreWorkspaceRootCheck",
							"managePackageManagerVersions",
							"minimumReleaseAge",
							"minimumReleaseAgeExclude",
							"modulesDir",
							"nodeLinker",
							"nodeVersion",
							"optimisticRepeatInstall",
							"packageManagerStrict",
							"packageManagerStrictVersion",
							"preferSymlinkedExecutables",
							"preferWorkspacePackages",
							"publicHoistPattern",
							"registrySupportsTimeField",
							"requiredScripts",
							"resolutionMode",
							"savePrefix",
							"scriptShell",
							"shamefullyHoist",
							"shellEmulator",
							"stateDir",
							"supportedArchitectures",
							"symlink",
							"tag",
							"trustPolicy",
							"trustPolicyExclude",
							"updateNotifier"
						],
						"packages",
						"overrides",
						"patchedDependencies",
						"catalog",
						"catalogs",
						...[
							"allowedDeprecatedVersions",
							"allowNonAppliedPatches",
							"configDependencies",
							"ignoredBuiltDependencies",
							"ignoredOptionalDependencies",
							"neverBuiltDependencies",
							"onlyBuiltDependencies",
							"onlyBuiltDependenciesFile",
							"packageExtensions",
							"peerDependencyRules"
						]
					],
					pathPattern: "^$"
				},
				{
					order: { type: "asc" },
					pathPattern: ".*"
				}
			] }
		});
	}
	return configs$1;
}

//#endregion
//#region src/configs/react.ts
const ReactRefreshAllowConstantExportPackages = ["vite"];
const RemixPackages = [
	"@remix-run/node",
	"@remix-run/react",
	"@remix-run/serve",
	"@remix-run/dev"
];
const ReactRouterPackages = [
	"@react-router/node",
	"@react-router/react",
	"@react-router/serve",
	"@react-router/dev"
];
const NextJsPackages = ["next"];
const ReactCompilerPackages = ["babel-plugin-react-compiler"];
async function react(options = {}) {
	const { files = [GLOB_SRC], filesTypeAware = [GLOB_TS, GLOB_TSX], ignoresTypeAware = [`${GLOB_MARKDOWN}/**`, GLOB_ASTRO_TS], overrides = {}, tsconfigPath, reactCompiler = ReactCompilerPackages.some((i) => isPackageExists(i)) } = options;
	await ensurePackages([
		"@eslint-react/eslint-plugin",
		"eslint-plugin-react-hooks",
		"eslint-plugin-react-refresh"
	]);
	const isTypeAware = !!tsconfigPath;
	const typeAwareRules = { "react/no-leaked-conditional-rendering": "warn" };
	const [pluginReact, pluginReactHooks, pluginReactRefresh] = await Promise.all([
		interopDefault(import("@eslint-react/eslint-plugin")),
		interopDefault(import("eslint-plugin-react-hooks")),
		interopDefault(import("eslint-plugin-react-refresh"))
	]);
	const isAllowConstantExport = ReactRefreshAllowConstantExportPackages.some((i) => isPackageExists(i));
	const isUsingRemix = RemixPackages.some((i) => isPackageExists(i));
	const isUsingReactRouter = ReactRouterPackages.some((i) => isPackageExists(i));
	const isUsingNext = NextJsPackages.some((i) => isPackageExists(i));
	const plugins = pluginReact.configs.all.plugins;
	return [
		{
			name: "antfu/react/setup",
			plugins: {
				"react": plugins["@eslint-react"],
				"react-dom": plugins["@eslint-react/dom"],
				"react-hooks": pluginReactHooks,
				"react-hooks-extra": plugins["@eslint-react/hooks-extra"],
				"react-naming-convention": plugins["@eslint-react/naming-convention"],
				"react-refresh": pluginReactRefresh,
				"react-web-api": plugins["@eslint-react/web-api"]
			}
		},
		{
			files,
			languageOptions: {
				parserOptions: { ecmaFeatures: { jsx: true } },
				sourceType: "module"
			},
			name: "antfu/react/rules",
			rules: {
				"react/jsx-key-before-spread": "warn",
				"react/jsx-no-comment-textnodes": "warn",
				"react/jsx-no-duplicate-props": "warn",
				"react/jsx-uses-react": "warn",
				"react/jsx-uses-vars": "warn",
				"react/no-access-state-in-setstate": "error",
				"react/no-array-index-key": "warn",
				"react/no-children-count": "warn",
				"react/no-children-for-each": "warn",
				"react/no-children-map": "warn",
				"react/no-children-only": "warn",
				"react/no-children-to-array": "warn",
				"react/no-clone-element": "warn",
				"react/no-component-will-mount": "error",
				"react/no-component-will-receive-props": "error",
				"react/no-component-will-update": "error",
				"react/no-context-provider": "warn",
				"react/no-create-ref": "error",
				"react/no-default-props": "error",
				"react/no-direct-mutation-state": "error",
				"react/no-duplicate-key": "error",
				"react/no-forward-ref": "warn",
				"react/no-implicit-key": "warn",
				"react/no-missing-key": "error",
				"react/no-nested-component-definitions": "error",
				"react/no-nested-lazy-component-declarations": "error",
				"react/no-prop-types": "error",
				"react/no-redundant-should-component-update": "error",
				"react/no-set-state-in-component-did-mount": "warn",
				"react/no-set-state-in-component-did-update": "warn",
				"react/no-set-state-in-component-will-update": "warn",
				"react/no-string-refs": "error",
				"react/no-unnecessary-use-prefix": "warn",
				"react/no-unsafe-component-will-mount": "warn",
				"react/no-unsafe-component-will-receive-props": "warn",
				"react/no-unsafe-component-will-update": "warn",
				"react/no-use-context": "warn",
				"react/no-useless-forward-ref": "warn",
				"react/prefer-use-state-lazy-initialization": "warn",
				"react-dom/no-dangerously-set-innerhtml": "warn",
				"react-dom/no-dangerously-set-innerhtml-with-children": "error",
				"react-dom/no-find-dom-node": "error",
				"react-dom/no-flush-sync": "error",
				"react-dom/no-hydrate": "error",
				"react-dom/no-namespace": "error",
				"react-dom/no-render": "error",
				"react-dom/no-render-return-value": "error",
				"react-dom/no-script-url": "warn",
				"react-dom/no-unsafe-iframe-sandbox": "warn",
				"react-dom/no-use-form-state": "error",
				"react-dom/no-void-elements-with-children": "error",
				"react-hooks/rules-of-hooks": "error",
				"react-hooks/exhaustive-deps": "warn",
				...reactCompiler ? {
					"react-hooks/config": "error",
					"react-hooks/error-boundaries": "error",
					"react-hooks/component-hook-factories": "error",
					"react-hooks/gating": "error",
					"react-hooks/globals": "error",
					"react-hooks/immutability": "error",
					"react-hooks/preserve-manual-memoization": "error",
					"react-hooks/purity": "error",
					"react-hooks/refs": "error",
					"react-hooks/set-state-in-effect": "error",
					"react-hooks/set-state-in-render": "error",
					"react-hooks/static-components": "error",
					"react-hooks/unsupported-syntax": "warn",
					"react-hooks/use-memo": "error",
					"react-hooks/incompatible-library": "warn"
				} : {},
				"react-hooks-extra/no-direct-set-state-in-use-effect": "warn",
				"react-web-api/no-leaked-event-listener": "warn",
				"react-web-api/no-leaked-interval": "warn",
				"react-web-api/no-leaked-resize-observer": "warn",
				"react-web-api/no-leaked-timeout": "warn",
				"react-refresh/only-export-components": ["warn", {
					allowConstantExport: isAllowConstantExport,
					allowExportNames: [...isUsingNext ? [
						"dynamic",
						"dynamicParams",
						"revalidate",
						"fetchCache",
						"runtime",
						"preferredRegion",
						"maxDuration",
						"config",
						"generateStaticParams",
						"metadata",
						"generateMetadata",
						"viewport",
						"generateViewport"
					] : [], ...isUsingRemix || isUsingReactRouter ? [
						"meta",
						"links",
						"headers",
						"loader",
						"action",
						"clientLoader",
						"clientAction",
						"handle",
						"shouldRevalidate"
					] : []]
				}],
				...overrides
			}
		},
		...isTypeAware ? [{
			files: filesTypeAware,
			ignores: ignoresTypeAware,
			name: "antfu/react/type-aware-rules",
			rules: { ...typeAwareRules }
		}] : []
	];
}

//#endregion
//#region src/configs/regexp.ts
async function regexp(options = {}) {
	const config = configs["flat/recommended"];
	const rules = { ...config.rules };
	if (options.level === "warn") {
		for (const key in rules) if (rules[key] === "error") rules[key] = "warn";
	}
	return [{
		...config,
		name: "antfu/regexp/rules",
		rules: {
			...rules,
			...options.overrides
		}
	}];
}

//#endregion
//#region src/configs/solid.ts
async function solid(options = {}) {
	const { files = [GLOB_JSX, GLOB_TSX], overrides = {}, typescript: typescript$1 = true } = options;
	await ensurePackages(["eslint-plugin-solid"]);
	const tsconfigPath = options?.tsconfigPath ? toArray(options.tsconfigPath) : void 0;
	const isTypeAware = !!tsconfigPath;
	const [pluginSolid, parserTs] = await Promise.all([interopDefault(import("eslint-plugin-solid")), interopDefault(import("@typescript-eslint/parser"))]);
	return [{
		name: "antfu/solid/setup",
		plugins: { solid: pluginSolid }
	}, {
		files,
		languageOptions: {
			parser: parserTs,
			parserOptions: {
				ecmaFeatures: { jsx: true },
				...isTypeAware ? { project: tsconfigPath } : {}
			},
			sourceType: "module"
		},
		name: "antfu/solid/rules",
		rules: {
			"solid/components-return-once": "warn",
			"solid/event-handlers": ["error", {
				ignoreCase: false,
				warnOnSpread: false
			}],
			"solid/imports": "error",
			"solid/jsx-no-duplicate-props": "error",
			"solid/jsx-no-script-url": "error",
			"solid/jsx-no-undef": "error",
			"solid/jsx-uses-vars": "error",
			"solid/no-destructure": "error",
			"solid/no-innerhtml": ["error", { allowStatic: true }],
			"solid/no-react-deps": "error",
			"solid/no-react-specific-props": "error",
			"solid/no-unknown-namespaces": "error",
			"solid/prefer-for": "error",
			"solid/reactivity": "warn",
			"solid/self-closing-comp": "error",
			"solid/style-prop": ["error", { styleProps: ["style", "css"] }],
			...typescript$1 ? {
				"solid/jsx-no-undef": ["error", { typescriptEnabled: true }],
				"solid/no-unknown-namespaces": "off"
			} : {},
			...overrides
		}
	}];
}

//#endregion
//#region src/configs/sort.ts
/**
* Sort package.json
*
* Requires `jsonc` config
*/
async function sortPackageJson() {
	return [{
		files: ["**/package.json"],
		name: "antfu/sort/package-json",
		rules: {
			"jsonc/sort-array-values": ["error", {
				order: { type: "asc" },
				pathPattern: "^files$"
			}],
			"jsonc/sort-keys": [
				"error",
				{
					order: [
						"publisher",
						"name",
						"displayName",
						"type",
						"version",
						"private",
						"packageManager",
						"description",
						"author",
						"contributors",
						"license",
						"funding",
						"homepage",
						"repository",
						"bugs",
						"keywords",
						"categories",
						"sideEffects",
						"imports",
						"exports",
						"main",
						"module",
						"unpkg",
						"jsdelivr",
						"types",
						"typesVersions",
						"bin",
						"icon",
						"files",
						"engines",
						"activationEvents",
						"contributes",
						"scripts",
						"peerDependencies",
						"peerDependenciesMeta",
						"dependencies",
						"optionalDependencies",
						"devDependencies",
						"pnpm",
						"overrides",
						"resolutions",
						"husky",
						"simple-git-hooks",
						"lint-staged",
						"eslintConfig"
					],
					pathPattern: "^$"
				},
				{
					order: { type: "asc" },
					pathPattern: "^(?:dev|peer|optional|bundled)?[Dd]ependencies(Meta)?$"
				},
				{
					order: { type: "asc" },
					pathPattern: "^(?:resolutions|overrides|pnpm.overrides)$"
				},
				{
					order: { type: "asc" },
					pathPattern: "^workspaces\\.catalog$"
				},
				{
					order: { type: "asc" },
					pathPattern: "^workspaces\\.catalogs\\.[^.]+$"
				},
				{
					order: [
						"types",
						"import",
						"require",
						"default"
					],
					pathPattern: "^exports.*$"
				},
				{
					order: [
						"pre-commit",
						"prepare-commit-msg",
						"commit-msg",
						"post-commit",
						"pre-rebase",
						"post-rewrite",
						"post-checkout",
						"post-merge",
						"pre-push",
						"pre-auto-gc"
					],
					pathPattern: "^(?:gitHooks|husky|simple-git-hooks)$"
				}
			]
		}
	}];
}
/**
* Sort tsconfig.json
*
* Requires `jsonc` config
*/
function sortTsconfig() {
	return [{
		files: ["**/[jt]sconfig.json", "**/[jt]sconfig.*.json"],
		name: "antfu/sort/tsconfig-json",
		rules: { "jsonc/sort-keys": [
			"error",
			{
				order: [
					"extends",
					"compilerOptions",
					"references",
					"files",
					"include",
					"exclude"
				],
				pathPattern: "^$"
			},
			{
				order: [
					"incremental",
					"composite",
					"tsBuildInfoFile",
					"disableSourceOfProjectReferenceRedirect",
					"disableSolutionSearching",
					"disableReferencedProjectLoad",
					"target",
					"jsx",
					"jsxFactory",
					"jsxFragmentFactory",
					"jsxImportSource",
					"lib",
					"moduleDetection",
					"noLib",
					"reactNamespace",
					"useDefineForClassFields",
					"emitDecoratorMetadata",
					"experimentalDecorators",
					"libReplacement",
					"baseUrl",
					"rootDir",
					"rootDirs",
					"customConditions",
					"module",
					"moduleResolution",
					"moduleSuffixes",
					"noResolve",
					"paths",
					"resolveJsonModule",
					"resolvePackageJsonExports",
					"resolvePackageJsonImports",
					"typeRoots",
					"types",
					"allowArbitraryExtensions",
					"allowImportingTsExtensions",
					"allowUmdGlobalAccess",
					"allowJs",
					"checkJs",
					"maxNodeModuleJsDepth",
					"strict",
					"strictBindCallApply",
					"strictFunctionTypes",
					"strictNullChecks",
					"strictPropertyInitialization",
					"allowUnreachableCode",
					"allowUnusedLabels",
					"alwaysStrict",
					"exactOptionalPropertyTypes",
					"noFallthroughCasesInSwitch",
					"noImplicitAny",
					"noImplicitOverride",
					"noImplicitReturns",
					"noImplicitThis",
					"noPropertyAccessFromIndexSignature",
					"noUncheckedIndexedAccess",
					"noUnusedLocals",
					"noUnusedParameters",
					"useUnknownInCatchVariables",
					"declaration",
					"declarationDir",
					"declarationMap",
					"downlevelIteration",
					"emitBOM",
					"emitDeclarationOnly",
					"importHelpers",
					"importsNotUsedAsValues",
					"inlineSourceMap",
					"inlineSources",
					"mapRoot",
					"newLine",
					"noEmit",
					"noEmitHelpers",
					"noEmitOnError",
					"outDir",
					"outFile",
					"preserveConstEnums",
					"preserveValueImports",
					"removeComments",
					"sourceMap",
					"sourceRoot",
					"stripInternal",
					"allowSyntheticDefaultImports",
					"esModuleInterop",
					"forceConsistentCasingInFileNames",
					"isolatedDeclarations",
					"isolatedModules",
					"preserveSymlinks",
					"verbatimModuleSyntax",
					"erasableSyntaxOnly",
					"skipDefaultLibCheck",
					"skipLibCheck"
				],
				pathPattern: "^compilerOptions$"
			}
		] }
	}];
}

//#endregion
//#region src/configs/svelte.ts
async function svelte(options = {}) {
	const { files = [GLOB_SVELTE], overrides = {}, stylistic: stylistic$1 = true } = options;
	const { indent = 2, quotes = "single" } = typeof stylistic$1 === "boolean" ? {} : stylistic$1;
	await ensurePackages(["eslint-plugin-svelte"]);
	const [pluginSvelte, parserSvelte] = await Promise.all([interopDefault(import("eslint-plugin-svelte")), interopDefault(import("svelte-eslint-parser"))]);
	return [{
		name: "antfu/svelte/setup",
		plugins: { svelte: pluginSvelte }
	}, {
		files,
		languageOptions: {
			parser: parserSvelte,
			parserOptions: {
				extraFileExtensions: [".svelte"],
				parser: options.typescript ? await interopDefault(import("@typescript-eslint/parser")) : null
			}
		},
		name: "antfu/svelte/rules",
		processor: pluginSvelte.processors[".svelte"],
		rules: {
			"no-undef": "off",
			"no-unused-vars": ["error", {
				args: "none",
				caughtErrors: "none",
				ignoreRestSiblings: true,
				vars: "all",
				varsIgnorePattern: "^(\\$\\$Props$|\\$\\$Events$|\\$\\$Slots$)"
			}],
			"svelte/comment-directive": "error",
			"svelte/no-at-debug-tags": "warn",
			"svelte/no-at-html-tags": "error",
			"svelte/no-dupe-else-if-blocks": "error",
			"svelte/no-dupe-style-properties": "error",
			"svelte/no-dupe-use-directives": "error",
			"svelte/no-export-load-in-svelte-module-in-kit-pages": "error",
			"svelte/no-inner-declarations": "error",
			"svelte/no-not-function-handler": "error",
			"svelte/no-object-in-text-mustaches": "error",
			"svelte/no-reactive-functions": "error",
			"svelte/no-reactive-literals": "error",
			"svelte/no-shorthand-style-property-overrides": "error",
			"svelte/no-unknown-style-directive-property": "error",
			"svelte/no-unused-svelte-ignore": "error",
			"svelte/no-useless-mustaches": "error",
			"svelte/require-store-callbacks-use-set-param": "error",
			"svelte/system": "error",
			"svelte/valid-each-key": "error",
			"unused-imports/no-unused-vars": ["error", {
				args: "after-used",
				argsIgnorePattern: "^_",
				vars: "all",
				varsIgnorePattern: "^(_|\\$\\$Props$|\\$\\$Events$|\\$\\$Slots$)"
			}],
			...stylistic$1 ? {
				"style/indent": "off",
				"style/no-trailing-spaces": "off",
				"svelte/derived-has-same-inputs-outputs": "error",
				"svelte/html-closing-bracket-spacing": "error",
				"svelte/html-quotes": ["error", { prefer: quotes === "backtick" ? "double" : quotes }],
				"svelte/indent": ["error", {
					alignAttributesVertically: true,
					indent
				}],
				"svelte/mustache-spacing": "error",
				"svelte/no-spaces-around-equal-signs-in-attribute": "error",
				"svelte/no-trailing-spaces": "error",
				"svelte/spaced-html-comment": "error"
			} : {},
			...overrides
		}
	}];
}

//#endregion
//#region src/configs/test.ts
let _pluginTest;
async function test(options = {}) {
	const { files = GLOB_TESTS, isInEditor = false, overrides = {} } = options;
	const [pluginVitest, pluginNoOnlyTests] = await Promise.all([interopDefault(import("@vitest/eslint-plugin")), interopDefault(import("eslint-plugin-no-only-tests"))]);
	_pluginTest = _pluginTest || {
		...pluginVitest,
		rules: {
			...pluginVitest.rules,
			...pluginNoOnlyTests.rules
		}
	};
	return [{
		name: "antfu/test/setup",
		plugins: { test: _pluginTest }
	}, {
		files,
		name: "antfu/test/rules",
		rules: {
			"test/consistent-test-it": ["error", {
				fn: "it",
				withinDescribe: "it"
			}],
			"test/no-identical-title": "error",
			"test/no-import-node-test": "error",
			"test/no-only-tests": isInEditor ? "warn" : "error",
			"test/prefer-hooks-in-order": "error",
			"test/prefer-lowercase-title": "error",
			"antfu/no-top-level-await": "off",
			"no-unused-expressions": "off",
			"node/prefer-global/process": "off",
			"ts/explicit-function-return-type": "off",
			...overrides
		}
	}];
}

//#endregion
//#region src/configs/toml.ts
async function toml(options = {}) {
	const { files = [GLOB_TOML], overrides = {}, stylistic: stylistic$1 = true } = options;
	const { indent = 2 } = typeof stylistic$1 === "boolean" ? {} : stylistic$1;
	const [pluginToml, parserToml] = await Promise.all([interopDefault(import("eslint-plugin-toml")), interopDefault(import("toml-eslint-parser"))]);
	return [{
		name: "antfu/toml/setup",
		plugins: { toml: pluginToml }
	}, {
		files,
		languageOptions: { parser: parserToml },
		name: "antfu/toml/rules",
		rules: {
			"style/spaced-comment": "off",
			"toml/comma-style": "error",
			"toml/keys-order": "error",
			"toml/no-space-dots": "error",
			"toml/no-unreadable-number-separator": "error",
			"toml/precision-of-fractional-seconds": "error",
			"toml/precision-of-integer": "error",
			"toml/tables-order": "error",
			"toml/vue-custom-block/no-parsing-error": "error",
			...stylistic$1 ? {
				"toml/array-bracket-newline": "error",
				"toml/array-bracket-spacing": "error",
				"toml/array-element-newline": "error",
				"toml/indent": ["error", indent === "tab" ? 2 : indent],
				"toml/inline-table-curly-spacing": "error",
				"toml/key-spacing": "error",
				"toml/padding-line-between-pairs": "error",
				"toml/padding-line-between-tables": "error",
				"toml/quoted-keys": "error",
				"toml/spaced-comment": "error",
				"toml/table-bracket-spacing": "error"
			} : {},
			...overrides
		}
	}];
}

//#endregion
//#region src/configs/typescript.ts
async function typescript(options = {}) {
	const { componentExts = [], erasableOnly = false, overrides = {}, overridesTypeAware = {}, parserOptions = {}, type = "app" } = options;
	const files = options.files ?? [
		GLOB_TS,
		GLOB_TSX,
		...componentExts.map((ext) => `**/*.${ext}`)
	];
	const filesTypeAware = options.filesTypeAware ?? [GLOB_TS, GLOB_TSX];
	const ignoresTypeAware = options.ignoresTypeAware ?? [`${GLOB_MARKDOWN}/**`, GLOB_ASTRO_TS];
	const tsconfigPath = options?.tsconfigPath ? options.tsconfigPath : void 0;
	const isTypeAware = !!tsconfigPath;
	const typeAwareRules = {
		"dot-notation": "off",
		"no-implied-eval": "off",
		"ts/await-thenable": "error",
		"ts/dot-notation": ["error", { allowKeywords: true }],
		"ts/no-floating-promises": "error",
		"ts/no-for-in-array": "error",
		"ts/no-implied-eval": "error",
		"ts/no-misused-promises": "error",
		"ts/no-unnecessary-type-assertion": "error",
		"ts/no-unsafe-argument": "error",
		"ts/no-unsafe-assignment": "error",
		"ts/no-unsafe-call": "error",
		"ts/no-unsafe-member-access": "error",
		"ts/no-unsafe-return": "error",
		"ts/promise-function-async": "error",
		"ts/restrict-plus-operands": "error",
		"ts/restrict-template-expressions": "error",
		"ts/return-await": ["error", "in-try-catch"],
		"ts/strict-boolean-expressions": ["error", {
			allowNullableBoolean: true,
			allowNullableObject: true
		}],
		"ts/switch-exhaustiveness-check": "error",
		"ts/unbound-method": "error"
	};
	const [pluginTs, parserTs] = await Promise.all([interopDefault(import("@typescript-eslint/eslint-plugin")), interopDefault(import("@typescript-eslint/parser"))]);
	function makeParser(typeAware, files$1, ignores$1) {
		return {
			files: files$1,
			...ignores$1 ? { ignores: ignores$1 } : {},
			languageOptions: {
				parser: parserTs,
				parserOptions: {
					extraFileExtensions: componentExts.map((ext) => `.${ext}`),
					sourceType: "module",
					...typeAware ? {
						projectService: {
							allowDefaultProject: ["./*.js"],
							defaultProject: tsconfigPath
						},
						tsconfigRootDir: process.cwd()
					} : {},
					...parserOptions
				}
			},
			name: `antfu/typescript/${typeAware ? "type-aware-parser" : "parser"}`
		};
	}
	return [
		{
			name: "antfu/typescript/setup",
			plugins: {
				antfu: pluginAntfu,
				ts: pluginTs
			}
		},
		...isTypeAware ? [makeParser(false, files), makeParser(true, filesTypeAware, ignoresTypeAware)] : [makeParser(false, files)],
		{
			files,
			name: "antfu/typescript/rules",
			rules: {
				...renameRules(pluginTs.configs["eslint-recommended"].overrides[0].rules, { "@typescript-eslint": "ts" }),
				...renameRules(pluginTs.configs.strict.rules, { "@typescript-eslint": "ts" }),
				"no-dupe-class-members": "off",
				"no-redeclare": "off",
				"no-use-before-define": "off",
				"no-useless-constructor": "off",
				"ts/ban-ts-comment": ["error", { "ts-expect-error": "allow-with-description" }],
				"ts/consistent-type-definitions": ["error", "interface"],
				"ts/consistent-type-imports": ["error", {
					disallowTypeAnnotations: false,
					fixStyle: "separate-type-imports",
					prefer: "type-imports"
				}],
				"ts/method-signature-style": ["error", "property"],
				"ts/no-dupe-class-members": "error",
				"ts/no-dynamic-delete": "off",
				"ts/no-empty-object-type": ["error", { allowInterfaces: "always" }],
				"ts/no-explicit-any": "off",
				"ts/no-extraneous-class": "off",
				"ts/no-import-type-side-effects": "error",
				"ts/no-invalid-void-type": "off",
				"ts/no-non-null-assertion": "off",
				"ts/no-redeclare": ["error", { builtinGlobals: false }],
				"ts/no-require-imports": "error",
				"ts/no-unused-expressions": ["error", {
					allowShortCircuit: true,
					allowTaggedTemplates: true,
					allowTernary: true
				}],
				"ts/no-unused-vars": "off",
				"ts/no-use-before-define": ["error", {
					classes: false,
					functions: false,
					variables: true
				}],
				"ts/no-useless-constructor": "off",
				"ts/no-wrapper-object-types": "error",
				"ts/triple-slash-reference": "off",
				"ts/unified-signatures": "off",
				...type === "lib" ? { "ts/explicit-function-return-type": ["error", {
					allowExpressions: true,
					allowHigherOrderFunctions: true,
					allowIIFEs: true
				}] } : {},
				...overrides
			}
		},
		...isTypeAware ? [{
			files: filesTypeAware,
			ignores: ignoresTypeAware,
			name: "antfu/typescript/rules-type-aware",
			rules: {
				...typeAwareRules,
				...overridesTypeAware
			}
		}] : [],
		...erasableOnly ? [{
			name: "antfu/typescript/erasable-syntax-only",
			plugins: { "erasable-syntax-only": await interopDefault(import("./lib-Bxfuo2Ed.mjs")) },
			rules: {
				"erasable-syntax-only/enums": "error",
				"erasable-syntax-only/import-aliases": "error",
				"erasable-syntax-only/namespaces": "error",
				"erasable-syntax-only/parameter-properties": "error"
			}
		}] : []
	];
}

//#endregion
//#region src/configs/unicorn.ts
async function unicorn(options = {}) {
	const { allRecommended = false, overrides = {} } = options;
	return [{
		name: "antfu/unicorn/rules",
		plugins: { unicorn: pluginUnicorn },
		rules: {
			...allRecommended ? pluginUnicorn.configs.recommended.rules : {
				"unicorn/consistent-empty-array-spread": "error",
				"unicorn/error-message": "error",
				"unicorn/escape-case": "error",
				"unicorn/new-for-builtins": "error",
				"unicorn/no-instanceof-builtins": "error",
				"unicorn/no-new-array": "error",
				"unicorn/no-new-buffer": "error",
				"unicorn/number-literal-case": "error",
				"unicorn/prefer-dom-node-text-content": "error",
				"unicorn/prefer-includes": "error",
				"unicorn/prefer-node-protocol": "error",
				"unicorn/prefer-number-properties": "error",
				"unicorn/prefer-string-starts-ends-with": "error",
				"unicorn/prefer-type-error": "error",
				"unicorn/throw-new-error": "error"
			},
			...overrides
		}
	}];
}

//#endregion
//#region src/configs/unocss.ts
async function unocss(options = {}) {
	const { attributify = true, strict = false } = options;
	await ensurePackages(["@unocss/eslint-plugin"]);
	const [pluginUnoCSS] = await Promise.all([interopDefault(import("@unocss/eslint-plugin"))]);
	return [{
		name: "antfu/unocss",
		plugins: { unocss: pluginUnoCSS },
		rules: {
			"unocss/order": "warn",
			...attributify ? { "unocss/order-attributify": "warn" } : {},
			...strict ? { "unocss/blocklist": "error" } : {}
		}
	}];
}

//#endregion
//#region src/configs/vue.ts
async function vue(options = {}) {
	const { a11y = false, files = [GLOB_VUE], overrides = {}, stylistic: stylistic$1 = true, vueVersion = 3 } = options;
	const sfcBlocks = options.sfcBlocks === true ? {} : options.sfcBlocks ?? {};
	const { indent = 2 } = typeof stylistic$1 === "boolean" ? {} : stylistic$1;
	if (a11y) await ensurePackages(["eslint-plugin-vuejs-accessibility"]);
	const [pluginVue, parserVue, processorVueBlocks, pluginVueA11y] = await Promise.all([
		interopDefault(import("eslint-plugin-vue")),
		interopDefault(import("vue-eslint-parser")),
		interopDefault(import("eslint-processor-vue-blocks")),
		...a11y ? [interopDefault(import("eslint-plugin-vuejs-accessibility"))] : []
	]);
	return [{
		languageOptions: { globals: {
			computed: "readonly",
			defineEmits: "readonly",
			defineExpose: "readonly",
			defineProps: "readonly",
			onMounted: "readonly",
			onUnmounted: "readonly",
			reactive: "readonly",
			ref: "readonly",
			shallowReactive: "readonly",
			shallowRef: "readonly",
			toRef: "readonly",
			toRefs: "readonly",
			watch: "readonly",
			watchEffect: "readonly"
		} },
		name: "antfu/vue/setup",
		plugins: {
			vue: pluginVue,
			...a11y ? { "vue-a11y": pluginVueA11y } : {}
		}
	}, {
		files,
		languageOptions: {
			parser: parserVue,
			parserOptions: {
				ecmaFeatures: { jsx: true },
				extraFileExtensions: [".vue"],
				parser: options.typescript ? await interopDefault(import("@typescript-eslint/parser")) : null,
				sourceType: "module"
			}
		},
		name: "antfu/vue/rules",
		processor: sfcBlocks === false ? pluginVue.processors[".vue"] : mergeProcessors([pluginVue.processors[".vue"], processorVueBlocks({
			...sfcBlocks,
			blocks: {
				styles: true,
				...sfcBlocks.blocks
			}
		})]),
		rules: {
			...pluginVue.configs.base.rules,
			...vueVersion === 2 ? {
				...pluginVue.configs["vue2-essential"].rules,
				...pluginVue.configs["vue2-strongly-recommended"].rules,
				...pluginVue.configs["vue2-recommended"].rules
			} : {
				...pluginVue.configs["flat/essential"].map((c) => c.rules).reduce((acc, c) => ({
					...acc,
					...c
				}), {}),
				...pluginVue.configs["flat/strongly-recommended"].map((c) => c.rules).reduce((acc, c) => ({
					...acc,
					...c
				}), {}),
				...pluginVue.configs["flat/recommended"].map((c) => c.rules).reduce((acc, c) => ({
					...acc,
					...c
				}), {})
			},
			"antfu/no-top-level-await": "off",
			"node/prefer-global/process": "off",
			"ts/explicit-function-return-type": "off",
			"vue/block-order": ["error", { order: [
				"script",
				"template",
				"style"
			] }],
			"vue/component-name-in-template-casing": ["error", "PascalCase"],
			"vue/component-options-name-casing": ["error", "PascalCase"],
			"vue/component-tags-order": "off",
			"vue/custom-event-name-casing": ["error", "camelCase"],
			"vue/define-macros-order": ["error", { order: [
				"defineOptions",
				"defineProps",
				"defineEmits",
				"defineSlots"
			] }],
			"vue/dot-location": ["error", "property"],
			"vue/dot-notation": ["error", { allowKeywords: true }],
			"vue/eqeqeq": ["error", "smart"],
			"vue/html-indent": ["error", indent],
			"vue/html-quotes": ["error", "double"],
			"vue/max-attributes-per-line": "off",
			"vue/multi-word-component-names": "off",
			"vue/no-dupe-keys": "off",
			"vue/no-empty-pattern": "error",
			"vue/no-irregular-whitespace": "error",
			"vue/no-loss-of-precision": "error",
			"vue/no-restricted-syntax": [
				"error",
				"DebuggerStatement",
				"LabeledStatement",
				"WithStatement"
			],
			"vue/no-restricted-v-bind": ["error", "/^v-/"],
			"vue/no-setup-props-reactivity-loss": "off",
			"vue/no-sparse-arrays": "error",
			"vue/no-unused-refs": "error",
			"vue/no-useless-v-bind": "error",
			"vue/no-v-html": "off",
			"vue/object-shorthand": [
				"error",
				"always",
				{
					avoidQuotes: true,
					ignoreConstructors: false
				}
			],
			"vue/prefer-separate-static-class": "error",
			"vue/prefer-template": "error",
			"vue/prop-name-casing": ["error", "camelCase"],
			"vue/require-default-prop": "off",
			"vue/require-prop-types": "off",
			"vue/space-infix-ops": "error",
			"vue/space-unary-ops": ["error", {
				nonwords: false,
				words: true
			}],
			...stylistic$1 ? {
				"vue/array-bracket-spacing": ["error", "never"],
				"vue/arrow-spacing": ["error", {
					after: true,
					before: true
				}],
				"vue/block-spacing": ["error", "always"],
				"vue/block-tag-newline": ["error", {
					multiline: "always",
					singleline: "always"
				}],
				"vue/brace-style": [
					"error",
					"stroustrup",
					{ allowSingleLine: true }
				],
				"vue/comma-dangle": ["error", "always-multiline"],
				"vue/comma-spacing": ["error", {
					after: true,
					before: false
				}],
				"vue/comma-style": ["error", "last"],
				"vue/html-comment-content-spacing": [
					"error",
					"always",
					{ exceptions: ["-"] }
				],
				"vue/key-spacing": ["error", {
					afterColon: true,
					beforeColon: false
				}],
				"vue/keyword-spacing": ["error", {
					after: true,
					before: true
				}],
				"vue/object-curly-newline": "off",
				"vue/object-curly-spacing": ["error", "always"],
				"vue/object-property-newline": ["error", { allowAllPropertiesOnSameLine: true }],
				"vue/operator-linebreak": ["error", "before"],
				"vue/padding-line-between-blocks": ["error", "always"],
				"vue/quote-props": ["error", "consistent-as-needed"],
				"vue/space-in-parens": ["error", "never"],
				"vue/template-curly-spacing": "error"
			} : {},
			...a11y ? {
				"vue-a11y/alt-text": "error",
				"vue-a11y/anchor-has-content": "error",
				"vue-a11y/aria-props": "error",
				"vue-a11y/aria-role": "error",
				"vue-a11y/aria-unsupported-elements": "error",
				"vue-a11y/click-events-have-key-events": "error",
				"vue-a11y/form-control-has-label": "error",
				"vue-a11y/heading-has-content": "error",
				"vue-a11y/iframe-has-title": "error",
				"vue-a11y/interactive-supports-focus": "error",
				"vue-a11y/label-has-for": "error",
				"vue-a11y/media-has-caption": "warn",
				"vue-a11y/mouse-events-have-key-events": "error",
				"vue-a11y/no-access-key": "error",
				"vue-a11y/no-aria-hidden-on-focusable": "error",
				"vue-a11y/no-autofocus": "warn",
				"vue-a11y/no-distracting-elements": "error",
				"vue-a11y/no-redundant-roles": "error",
				"vue-a11y/no-role-presentation-on-focusable": "error",
				"vue-a11y/no-static-element-interactions": "error",
				"vue-a11y/role-has-required-aria-props": "error",
				"vue-a11y/tabindex-no-positive": "warn"
			} : {},
			...overrides
		}
	}];
}

//#endregion
//#region src/configs/yaml.ts
async function yaml(options = {}) {
	const { files = [GLOB_YAML], overrides = {}, stylistic: stylistic$1 = true } = options;
	const { indent = 2, quotes = "single" } = typeof stylistic$1 === "boolean" ? {} : stylistic$1;
	const [pluginYaml, parserYaml] = await Promise.all([interopDefault(import("eslint-plugin-yml")), interopDefault(import("yaml-eslint-parser"))]);
	return [{
		name: "antfu/yaml/setup",
		plugins: { yaml: pluginYaml }
	}, {
		files,
		languageOptions: { parser: parserYaml },
		name: "antfu/yaml/rules",
		rules: {
			"style/spaced-comment": "off",
			"yaml/block-mapping": "error",
			"yaml/block-sequence": "error",
			"yaml/no-empty-key": "error",
			"yaml/no-empty-sequence-entry": "error",
			"yaml/no-irregular-whitespace": "error",
			"yaml/plain-scalar": "error",
			"yaml/vue-custom-block/no-parsing-error": "error",
			...stylistic$1 ? {
				"yaml/block-mapping-question-indicator-newline": "error",
				"yaml/block-sequence-hyphen-indicator-newline": "error",
				"yaml/flow-mapping-curly-newline": "error",
				"yaml/flow-mapping-curly-spacing": "error",
				"yaml/flow-sequence-bracket-newline": "error",
				"yaml/flow-sequence-bracket-spacing": "error",
				"yaml/indent": ["error", indent === "tab" ? 2 : indent],
				"yaml/key-spacing": "error",
				"yaml/no-tab-indent": "error",
				"yaml/quotes": ["error", {
					avoidEscape: true,
					prefer: quotes === "backtick" ? "single" : quotes
				}],
				"yaml/spaced-comment": "error"
			} : {},
			...overrides
		}
	}];
}

//#endregion
//#region src/factory.ts
const flatConfigProps = [
	"name",
	"languageOptions",
	"linterOptions",
	"processor",
	"plugins",
	"rules",
	"settings"
];
const VuePackages = [
	"vue",
	"nuxt",
	"vitepress",
	"@slidev/cli"
];
const defaultPluginRenaming = {
	"@eslint-react": "react",
	"@eslint-react/dom": "react-dom",
	"@eslint-react/hooks-extra": "react-hooks-extra",
	"@eslint-react/naming-convention": "react-naming-convention",
	"@next/next": "next",
	"@stylistic": "style",
	"@typescript-eslint": "ts",
	"import-lite": "import",
	"n": "node",
	"vitest": "test",
	"yml": "yaml"
};
/**
* Construct an array of ESLint flat config items.
*
* @param {OptionsConfig & TypedFlatConfigItem} options
*  The options for generating the ESLint configurations.
* @param {Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[]>[]} userConfigs
*  The user configurations to be merged with the generated configurations.
* @returns {Promise<TypedFlatConfigItem[]>}
*  The merged ESLint configurations.
*/
function antfu(options = {}, ...userConfigs) {
	const { astro: enableAstro = false, autoRenamePlugins = true, componentExts = [], gitignore: enableGitignore = true, ignores: userIgnores = [], imports: enableImports = true, jsdoc: enableJsdoc = true, jsx: enableJsx = true, nextjs: enableNextjs = false, node: enableNode = true, pnpm: enableCatalogs = !!findUpSync("pnpm-workspace.yaml"), react: enableReact = false, regexp: enableRegexp = true, solid: enableSolid = false, svelte: enableSvelte = false, typescript: enableTypeScript = isPackageExists("typescript"), unicorn: enableUnicorn = true, unocss: enableUnoCSS = false, vue: enableVue = VuePackages.some((i) => isPackageExists(i)) } = options;
	let isInEditor = options.isInEditor;
	if (isInEditor == null) {
		isInEditor = isInEditorEnv();
		if (isInEditor) console.log("[@antfu/eslint-config] Detected running in editor, some rules are disabled.");
	}
	const stylisticOptions = options.stylistic === false ? false : typeof options.stylistic === "object" ? options.stylistic : {};
	if (stylisticOptions && !("jsx" in stylisticOptions)) stylisticOptions.jsx = typeof enableJsx === "object" ? true : enableJsx;
	const configs$1 = [];
	if (enableGitignore) if (typeof enableGitignore !== "boolean") configs$1.push(interopDefault(import("eslint-config-flat-gitignore")).then((r) => [r({
		name: "antfu/gitignore",
		...enableGitignore
	})]));
	else configs$1.push(interopDefault(import("eslint-config-flat-gitignore")).then((r) => [r({
		name: "antfu/gitignore",
		strict: false
	})]));
	const typescriptOptions = resolveSubOptions(options, "typescript");
	const tsconfigPath = "tsconfigPath" in typescriptOptions ? typescriptOptions.tsconfigPath : void 0;
	configs$1.push(ignores(userIgnores), javascript({
		isInEditor,
		overrides: getOverrides(options, "javascript")
	}), comments(), command(), perfectionist());
	if (enableNode) configs$1.push(node());
	if (enableJsdoc) configs$1.push(jsdoc({ stylistic: stylisticOptions }));
	if (enableImports) configs$1.push(imports({
		stylistic: stylisticOptions,
		...resolveSubOptions(options, "imports")
	}));
	if (enableUnicorn) configs$1.push(unicorn(enableUnicorn === true ? {} : enableUnicorn));
	if (enableVue) componentExts.push("vue");
	if (enableJsx) configs$1.push(jsx(enableJsx === true ? {} : enableJsx));
	if (enableTypeScript) configs$1.push(typescript({
		...typescriptOptions,
		componentExts,
		overrides: getOverrides(options, "typescript"),
		type: options.type
	}));
	if (stylisticOptions) configs$1.push(stylistic({
		...stylisticOptions,
		lessOpinionated: options.lessOpinionated,
		overrides: getOverrides(options, "stylistic")
	}));
	if (enableRegexp) configs$1.push(regexp(typeof enableRegexp === "boolean" ? {} : enableRegexp));
	if (options.test ?? true) configs$1.push(test({
		isInEditor,
		overrides: getOverrides(options, "test")
	}));
	if (enableVue) configs$1.push(vue({
		...resolveSubOptions(options, "vue"),
		overrides: getOverrides(options, "vue"),
		stylistic: stylisticOptions,
		typescript: !!enableTypeScript
	}));
	if (enableReact) configs$1.push(react({
		...typescriptOptions,
		...resolveSubOptions(options, "react"),
		overrides: getOverrides(options, "react"),
		tsconfigPath
	}));
	if (enableNextjs) configs$1.push(nextjs({ overrides: getOverrides(options, "nextjs") }));
	if (enableSolid) configs$1.push(solid({
		overrides: getOverrides(options, "solid"),
		tsconfigPath,
		typescript: !!enableTypeScript
	}));
	if (enableSvelte) configs$1.push(svelte({
		overrides: getOverrides(options, "svelte"),
		stylistic: stylisticOptions,
		typescript: !!enableTypeScript
	}));
	if (enableUnoCSS) configs$1.push(unocss({
		...resolveSubOptions(options, "unocss"),
		overrides: getOverrides(options, "unocss")
	}));
	if (enableAstro) configs$1.push(astro({
		overrides: getOverrides(options, "astro"),
		stylistic: stylisticOptions
	}));
	if (options.jsonc ?? true) configs$1.push(jsonc({
		overrides: getOverrides(options, "jsonc"),
		stylistic: stylisticOptions
	}), sortPackageJson(), sortTsconfig());
	if (enableCatalogs) {
		const optionsPnpm = resolveSubOptions(options, "pnpm");
		configs$1.push(pnpm({
			isInEditor,
			json: options.jsonc !== false,
			yaml: options.yaml !== false,
			...optionsPnpm
		}));
	}
	if (options.yaml ?? true) configs$1.push(yaml({
		overrides: getOverrides(options, "yaml"),
		stylistic: stylisticOptions
	}));
	if (options.toml ?? true) configs$1.push(toml({
		overrides: getOverrides(options, "toml"),
		stylistic: stylisticOptions
	}));
	if (options.markdown ?? true) configs$1.push(markdown({
		componentExts,
		overrides: getOverrides(options, "markdown")
	}));
	if (options.formatters) configs$1.push(formatters(options.formatters, typeof stylisticOptions === "boolean" ? {} : stylisticOptions));
	configs$1.push(disables());
	if ("files" in options) throw new Error("[@antfu/eslint-config] The first argument should not contain the \"files\" property as the options are supposed to be global. Place it in the second or later config instead.");
	const fusedConfig = flatConfigProps.reduce((acc, key) => {
		if (key in options) acc[key] = options[key];
		return acc;
	}, {});
	if (Object.keys(fusedConfig).length) configs$1.push([fusedConfig]);
	let composer = new FlatConfigComposer();
	composer = composer.append(...configs$1, ...userConfigs);
	if (autoRenamePlugins) composer = composer.renamePlugins(defaultPluginRenaming);
	if (isInEditor) composer = composer.disableRulesFix([
		"unused-imports/no-unused-imports",
		"test/no-only-tests",
		"prefer-const"
	], { builtinRules: () => import(["eslint", "use-at-your-own-risk"].join("/")).then((r) => r.builtinRules) });
	return composer;
}
function resolveSubOptions(options, key) {
	return typeof options[key] === "boolean" ? {} : options[key] || {};
}
function getOverrides(options, key) {
	const sub = resolveSubOptions(options, key);
	return {
		...options.overrides?.[key],
		..."overrides" in sub ? sub.overrides : {}
	};
}

//#endregion
//#region src/config-presets.ts
const CONFIG_PRESET_FULL_ON = {
	astro: true,
	formatters: true,
	gitignore: true,
	imports: true,
	jsdoc: true,
	jsonc: true,
	jsx: { a11y: true },
	markdown: true,
	nextjs: true,
	node: true,
	pnpm: true,
	react: { reactCompiler: true },
	regexp: true,
	solid: true,
	stylistic: { experimental: true },
	svelte: true,
	test: true,
	toml: true,
	typescript: {
		erasableOnly: true,
		tsconfigPath: "tsconfig.json"
	},
	unicorn: true,
	unocss: true,
	vue: { a11y: true },
	yaml: true
};
const CONFIG_PRESET_FULL_OFF = {
	astro: false,
	formatters: false,
	gitignore: false,
	imports: false,
	jsdoc: false,
	jsonc: false,
	jsx: false,
	markdown: false,
	nextjs: false,
	node: false,
	pnpm: false,
	react: false,
	regexp: false,
	solid: false,
	stylistic: false,
	svelte: false,
	test: false,
	toml: false,
	typescript: false,
	unicorn: false,
	unocss: false,
	vue: false,
	yaml: false
};

//#endregion
//#region src/index.ts
var src_default = antfu;

//#endregion
export { CONFIG_PRESET_FULL_OFF, CONFIG_PRESET_FULL_ON, GLOB_ALL_SRC, GLOB_ASTRO, GLOB_ASTRO_TS, GLOB_CSS, GLOB_EXCLUDE, GLOB_GRAPHQL, GLOB_HTML, GLOB_JS, GLOB_JSON, GLOB_JSON5, GLOB_JSONC, GLOB_JSX, GLOB_LESS, GLOB_MARKDOWN, GLOB_MARKDOWN_CODE, GLOB_MARKDOWN_IN_MARKDOWN, GLOB_POSTCSS, GLOB_SCSS, GLOB_SRC, GLOB_SRC_EXT, GLOB_STYLE, GLOB_SVELTE, GLOB_SVG, GLOB_TESTS, GLOB_TOML, GLOB_TS, GLOB_TSX, GLOB_VUE, GLOB_XML, GLOB_YAML, StylisticConfigDefaults, antfu, astro, combine, command, comments, src_default as default, defaultPluginRenaming, disables, ensurePackages, formatters, getOverrides, ignores, imports, interopDefault, isInEditorEnv, isInGitHooksOrLintStaged, isPackageInScope, javascript, jsdoc, jsonc, jsx, markdown, nextjs, node, parserPlain, perfectionist, pnpm, react, regexp, renamePluginInConfigs, renameRules, resolveSubOptions, solid, sortPackageJson, sortTsconfig, stylistic, svelte, test, toArray, toml, typescript, unicorn, unocss, vue, yaml };