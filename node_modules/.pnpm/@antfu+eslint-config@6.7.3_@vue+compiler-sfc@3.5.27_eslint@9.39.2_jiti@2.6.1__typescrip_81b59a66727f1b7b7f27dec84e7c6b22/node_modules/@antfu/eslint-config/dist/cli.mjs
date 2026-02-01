import process from "node:process";
import fsPromises from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";
import * as p from "@clack/prompts";
import c, { green } from "ansis";
import { cac } from "cac";
import parse from "parse-gitignore";
import { execSync } from "node:child_process";

//#region package.json
var version = "6.7.3";

//#endregion
//#region src/cli/constants.ts
const vscodeSettingsString = `
  // Disable the default formatter, use eslint instead
  "prettier.enable": false,
  "editor.formatOnSave": false,

  // Auto fix
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never"
  },

  // Silent the stylistic rules in your IDE, but still auto fix them
  "eslint.rules.customizations": [
    { "rule": "style/*", "severity": "off", "fixable": true },
    { "rule": "format/*", "severity": "off", "fixable": true },
    { "rule": "*-indent", "severity": "off", "fixable": true },
    { "rule": "*-spacing", "severity": "off", "fixable": true },
    { "rule": "*-spaces", "severity": "off", "fixable": true },
    { "rule": "*-order", "severity": "off", "fixable": true },
    { "rule": "*-dangle", "severity": "off", "fixable": true },
    { "rule": "*-newline", "severity": "off", "fixable": true },
    { "rule": "*quotes", "severity": "off", "fixable": true },
    { "rule": "*semi", "severity": "off", "fixable": true }
  ],

  // Enable eslint for all supported languages
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue",
    "html",
    "markdown",
    "json",
    "json5",
    "jsonc",
    "yaml",
    "toml",
    "xml",
    "gql",
    "graphql",
    "astro",
    "svelte",
    "css",
    "less",
    "scss",
    "pcss",
    "postcss"
  ]
`;
const frameworkOptions = [
	{
		label: c.green("Vue"),
		value: "vue"
	},
	{
		label: c.cyan("React"),
		value: "react"
	},
	{
		label: c.red("Svelte"),
		value: "svelte"
	},
	{
		label: c.magenta("Astro"),
		value: "astro"
	},
	{
		label: c.cyan("Solid"),
		value: "solid"
	},
	{
		label: c.blue("Slidev"),
		value: "slidev"
	}
];
const frameworks = frameworkOptions.map(({ value }) => value);
const extraOptions = [{
	hint: "Use external formatters (Prettier and/or dprint) to format files that ESLint cannot handle yet (.css, .html, etc)",
	label: c.red("Formatter"),
	value: "formatter"
}, {
	label: c.cyan("UnoCSS"),
	value: "unocss"
}];
const extra = extraOptions.map(({ value }) => value);
const dependenciesMap = {
	astro: ["eslint-plugin-astro", "astro-eslint-parser"],
	formatter: ["eslint-plugin-format"],
	formatterAstro: ["prettier-plugin-astro"],
	nextjs: ["@next/eslint-plugin-next"],
	react: [
		"@eslint-react/eslint-plugin",
		"eslint-plugin-react-hooks",
		"eslint-plugin-react-refresh"
	],
	slidev: ["prettier-plugin-slidev"],
	solid: ["eslint-plugin-solid"],
	svelte: ["eslint-plugin-svelte", "svelte-eslint-parser"],
	unocss: ["@unocss/eslint-plugin"],
	vue: []
};

//#endregion
//#region src/cli/utils.ts
function isGitClean() {
	try {
		execSync("git diff-index --quiet HEAD --");
		return true;
	} catch {
		return false;
	}
}
function getEslintConfigContent(mainConfig, additionalConfigs) {
	return `
import antfu from '@antfu/eslint-config'

export default antfu({
${mainConfig}
}${additionalConfigs?.map((config) => `,{\n${config}\n}`)})
`.trimStart();
}

//#endregion
//#region src/cli/stages/update-eslint-files.ts
async function updateEslintFiles(result) {
	const cwd = process.cwd();
	const pathESLintIgnore = path.join(cwd, ".eslintignore");
	const pathPackageJSON = path.join(cwd, "package.json");
	const pkgContent = await fsPromises.readFile(pathPackageJSON, "utf-8");
	const configFileName = JSON.parse(pkgContent).type === "module" ? "eslint.config.js" : "eslint.config.mjs";
	const pathFlatConfig = path.join(cwd, configFileName);
	const eslintIgnores = [];
	if (fs.existsSync(pathESLintIgnore)) {
		p.log.step(c.cyan`Migrating existing .eslintignore`);
		const globs = parse(await fsPromises.readFile(pathESLintIgnore, "utf-8")).globs();
		for (const glob of globs) if (glob.type === "ignore") eslintIgnores.push(...glob.patterns);
		else if (glob.type === "unignore") eslintIgnores.push(...glob.patterns.map((pattern) => `!${pattern}`));
	}
	const configLines = [];
	if (eslintIgnores.length) configLines.push(`ignores: ${JSON.stringify(eslintIgnores)},`);
	if (result.extra.includes("formatter")) configLines.push(`formatters: true,`);
	if (result.extra.includes("unocss")) configLines.push(`unocss: true,`);
	for (const framework of result.frameworks) configLines.push(`${framework}: true,`);
	const eslintConfigContent = getEslintConfigContent(configLines.map((i) => `  ${i}`).join("\n"), []);
	await fsPromises.writeFile(pathFlatConfig, eslintConfigContent);
	p.log.success(c.green`Created ${configFileName}`);
	const files = fs.readdirSync(cwd);
	const legacyConfig = [];
	files.forEach((file) => {
		if (/eslint|prettier/.test(file) && !/eslint\.config\./.test(file)) legacyConfig.push(file);
	});
	if (legacyConfig.length) p.note(c.dim(legacyConfig.join(", ")), "You can now remove those files manually");
}

//#endregion
//#region src/cli/constants-generated.ts
const versionsMap = {
	"@eslint-react/eslint-plugin": "^2.3.13",
	"@next/eslint-plugin-next": "^16.1.0",
	"@unocss/eslint-plugin": "^66.5.10",
	"astro-eslint-parser": "^1.2.2",
	"eslint": "^9.39.2",
	"eslint-plugin-astro": "^1.5.0",
	"eslint-plugin-format": "^1.1.0",
	"eslint-plugin-react-hooks": "^7.0.1",
	"eslint-plugin-react-refresh": "^0.4.26",
	"eslint-plugin-solid": "^0.14.5",
	"eslint-plugin-svelte": "^3.13.1",
	"prettier-plugin-astro": "^0.14.1",
	"prettier-plugin-slidev": "^1.0.5",
	"svelte-eslint-parser": "^1.4.1"
};

//#endregion
//#region src/cli/stages/update-package-json.ts
async function updatePackageJson(result) {
	const cwd = process.cwd();
	const pathPackageJSON = path.join(cwd, "package.json");
	p.log.step(c.cyan`Bumping @antfu/eslint-config to v${version}`);
	const pkgContent = await fsPromises.readFile(pathPackageJSON, "utf-8");
	const pkg = JSON.parse(pkgContent);
	pkg.devDependencies ??= {};
	pkg.devDependencies["@antfu/eslint-config"] = `^${version}`;
	pkg.devDependencies.eslint ??= versionsMap.eslint;
	const addedPackages = [];
	if (result.extra.length) result.extra.forEach((item) => {
		switch (item) {
			case "formatter":
				[...dependenciesMap.formatter, ...result.frameworks.includes("astro") ? dependenciesMap.formatterAstro : []].forEach((f) => {
					if (!f) return;
					pkg.devDependencies[f] = versionsMap[f];
					addedPackages.push(f);
				});
				break;
			case "unocss":
				dependenciesMap.unocss.forEach((f) => {
					pkg.devDependencies[f] = versionsMap[f];
					addedPackages.push(f);
				});
				break;
		}
	});
	for (const framework of result.frameworks) {
		const deps = dependenciesMap[framework];
		if (deps) deps.forEach((f) => {
			pkg.devDependencies[f] = versionsMap[f];
			addedPackages.push(f);
		});
	}
	if (addedPackages.length) p.note(c.dim(addedPackages.join(", ")), "Added packages");
	await fsPromises.writeFile(pathPackageJSON, JSON.stringify(pkg, null, 2));
	p.log.success(c.green`Changes wrote to package.json`);
}

//#endregion
//#region src/cli/stages/update-vscode-settings.ts
async function updateVscodeSettings(result) {
	const cwd = process.cwd();
	if (!result.updateVscodeSettings) return;
	const dotVscodePath = path.join(cwd, ".vscode");
	const settingsPath = path.join(dotVscodePath, "settings.json");
	if (!fs.existsSync(dotVscodePath)) await fsPromises.mkdir(dotVscodePath, { recursive: true });
	if (!fs.existsSync(settingsPath)) {
		await fsPromises.writeFile(settingsPath, `{${vscodeSettingsString}}\n`, "utf-8");
		p.log.success(green`Created .vscode/settings.json`);
	} else {
		let settingsContent = await fsPromises.readFile(settingsPath, "utf8");
		settingsContent = settingsContent.trim().replace(/\s*\}$/, "");
		settingsContent += settingsContent.endsWith(",") || settingsContent.endsWith("{") ? "" : ",";
		settingsContent += `${vscodeSettingsString}}\n`;
		await fsPromises.writeFile(settingsPath, settingsContent, "utf-8");
		p.log.success(green`Updated .vscode/settings.json`);
	}
}

//#endregion
//#region src/cli/run.ts
async function run(options = {}) {
	const argSkipPrompt = !!process.env.SKIP_PROMPT || options.yes;
	const argTemplate = options.frameworks?.map((m) => m?.trim()).filter(Boolean);
	const argExtra = options.extra?.map((m) => m?.trim()).filter(Boolean);
	if (fs.existsSync(path.join(process.cwd(), "eslint.config.js"))) {
		p.log.warn(c.yellow`eslint.config.js already exists, migration wizard exited.`);
		return process.exit(1);
	}
	let result = {
		extra: argExtra ?? [],
		frameworks: argTemplate ?? [],
		uncommittedConfirmed: false,
		updateVscodeSettings: true
	};
	if (!argSkipPrompt) {
		result = await p.group({
			uncommittedConfirmed: () => {
				if (argSkipPrompt || isGitClean()) return Promise.resolve(true);
				return p.confirm({
					initialValue: false,
					message: "There are uncommitted changes in the current repository, are you sure to continue?"
				});
			},
			frameworks: ({ results }) => {
				const isArgTemplateValid = typeof argTemplate === "string" && !!frameworks.includes(argTemplate);
				if (!results.uncommittedConfirmed || isArgTemplateValid) return;
				const message = !isArgTemplateValid && argTemplate ? `"${argTemplate}" isn't a valid template. Please choose from below: ` : "Select a framework:";
				return p.multiselect({
					message: c.reset(message),
					options: frameworkOptions,
					required: false
				});
			},
			extra: ({ results }) => {
				const isArgExtraValid = argExtra?.length && !argExtra.filter((element) => !extra.includes(element)).length;
				if (!results.uncommittedConfirmed || isArgExtraValid) return;
				const message = !isArgExtraValid && argExtra ? `"${argExtra}" isn't a valid extra util. Please choose from below: ` : "Select a extra utils:";
				return p.multiselect({
					message: c.reset(message),
					options: extraOptions,
					required: false
				});
			},
			updateVscodeSettings: ({ results }) => {
				if (!results.uncommittedConfirmed) return;
				return p.confirm({
					initialValue: true,
					message: "Update .vscode/settings.json for better VS Code experience?"
				});
			}
		}, { onCancel: () => {
			p.cancel("Operation cancelled.");
			process.exit(0);
		} });
		if (!result.uncommittedConfirmed) return process.exit(1);
	}
	await updatePackageJson(result);
	await updateEslintFiles(result);
	await updateVscodeSettings(result);
	p.log.success(c.green`Setup completed`);
	p.outro(`Now you can update the dependencies by run ${c.blue("pnpm install")} and run ${c.blue("eslint --fix")}\n`);
}

//#endregion
//#region src/cli/index.ts
function header() {
	console.log("\n");
	p.intro(`${c.green`@antfu/eslint-config `}${c.dim`v${version}`}`);
}
const cli = cac("@antfu/eslint-config");
cli.command("", "Run the initialization or migration").option("--yes, -y", "Skip prompts and use default values", { default: false }).option("--template, -t <template>", "Use the framework template for optimal customization: vue / react / svelte / astro", { type: [] }).option("--extra, -e <extra>", "Use the extra utils: formatter / perfectionist / unocss", { type: [] }).action(async (args) => {
	header();
	try {
		await run(args);
	} catch (error) {
		p.log.error(c.inverse.red(" Failed to migrate "));
		p.log.error(c.red`✘ ${String(error)}`);
		process.exit(1);
	}
});
cli.help();
cli.version(version);
cli.parse();

//#endregion
export {  };