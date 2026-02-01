#!/usr/bin/env node
import { resolvePackageDocs } from "./npm.mjs";
import { agents, detectCurrentAgent, sanitizeName } from "./agents.mjs";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
import { defineCommand, runMain } from "citty";
import consola from "consola";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const SKILL_CREATOR_PATH = join(dirname(fileURLToPath(import.meta.url)), "../skills/skill-creator/SKILL.md");
async function getAvailableModels() {
	const models = [];
	const hasClaude = (() => {
		try {
			execSync("which claude", { stdio: "ignore" });
			return true;
		} catch {
			return false;
		}
	})();
	const hasGemini = (() => {
		try {
			execSync("which gemini", { stdio: "ignore" });
			return true;
		} catch {
			return false;
		}
	})();
	if (hasClaude) models.push({
		id: "haiku",
		name: "Claude Haiku",
		description: "Fast, cheap",
		available: true,
		recommended: true
	}, {
		id: "sonnet",
		name: "Claude Sonnet",
		description: "Balanced",
		available: true
	}, {
		id: "opus",
		name: "Claude Opus",
		description: "Most capable",
		available: true
	});
	if (hasGemini) models.push({
		id: "gemini-flash",
		name: "Gemini 3 Flash",
		description: "Fast",
		available: true,
		recommended: true
	}, {
		id: "gemini-pro",
		name: "Gemini 3 Pro",
		description: "Most capable",
		available: true
	});
	if (process.env.ANTHROPIC_API_KEY) {
		if (!hasClaude) models.push({
			id: "haiku",
			name: "Claude Haiku (API)",
			description: "Fast, cheap",
			available: true,
			recommended: true
		}, {
			id: "sonnet",
			name: "Claude Sonnet (API)",
			description: "Balanced",
			available: true
		});
	}
	return models;
}
function buildPrompt(packageName, packageDocs) {
	return `IMPORTANT: YOU MUST USE THIS SKILL: ${SKILL_CREATOR_PATH}

Generate a SKILL.md for the "${packageName}" package.

## Focus Areas (IMPORTANT)

1. **New API changes that affect best practices** - What's the modern way to do things? What old patterns should be replaced?
2. **Breaking changes from recent versions** - What changed that developers need to update?
3. **Non-obvious gotchas** - Edge cases, common mistakes, things that silently fail
4. **Performance patterns** - What's expensive, what to avoid, what to prefer

## Rules

- Output ONLY the markdown content, no explanations
- Skip basics that any LLM already knows
- Skip installation, badges, marketing
- Keep under 400 lines
- Include version numbers when APIs changed (e.g., "3.5+")

Package docs:

${packageDocs}
`;
}
async function optimizeDocs(content, packageName, agent, model = "haiku") {
	if (model.startsWith("gemini-")) {
		const result = await tryGemini(content, packageName, model);
		if (result) return {
			optimized: result,
			wasOptimized: true
		};
		return {
			optimized: content,
			wasOptimized: false
		};
	}
	if (agent === "claude-code" || !agent) {
		const result = await tryClaudeCode(content, packageName, model);
		if (result) return {
			optimized: result,
			wasOptimized: true
		};
	}
	if (process.env.ANTHROPIC_API_KEY) {
		const result = await tryAnthropicSDK(content, packageName, model);
		if (result) return {
			optimized: result,
			wasOptimized: true
		};
	}
	return {
		optimized: content,
		wasOptimized: false
	};
}
async function tryClaudeCode(content, packageName, model) {
	try {
		execSync("which claude", { stdio: "ignore" });
		const prompt = buildPrompt(packageName, content);
		const { spawnSync } = await import("node:child_process");
		const result = spawnSync("claude", [
			"--model",
			model,
			"--print"
		], {
			input: prompt,
			encoding: "utf-8",
			stdio: [
				"pipe",
				"pipe",
				"inherit"
			],
			maxBuffer: 10 * 1024 * 1024,
			timeout: 18e4
		});
		if (result.error || result.status !== 0) return null;
		return result.stdout.trim();
	} catch {
		return null;
	}
}
async function tryGemini(content, packageName, model) {
	try {
		execSync("which gemini", { stdio: "ignore" });
		const prompt = buildPrompt(packageName, content);
		const geminiModel = GEMINI_MODEL_MAP[model] || "gemini-3-flash-preview";
		const { spawnSync } = await import("node:child_process");
		const result = spawnSync("gemini", ["--model", geminiModel], {
			input: prompt,
			encoding: "utf-8",
			stdio: [
				"pipe",
				"pipe",
				"inherit"
			],
			maxBuffer: 10 * 1024 * 1024,
			timeout: 18e4
		});
		if (result.error || result.status !== 0) return null;
		return result.stdout.trim();
	} catch {
		return null;
	}
}
const CLAUDE_MODEL_MAP = {
	haiku: "claude-3-5-haiku-latest",
	sonnet: "claude-sonnet-4-20250514",
	opus: "claude-opus-4-20250514"
};
const GEMINI_MODEL_MAP = {
	"gemini-flash": "gemini-3-flash-preview",
	"gemini-pro": "gemini-3-pro-preview"
};
async function tryAnthropicSDK(content, packageName, model) {
	try {
		const { default: Anthropic } = await import("@anthropic-ai/sdk");
		return (await new Anthropic().messages.create({
			model: CLAUDE_MODEL_MAP[model] || "claude-3-5-haiku-latest",
			max_tokens: 8192,
			messages: [{
				role: "user",
				content: buildPrompt(packageName, content)
			}]
		})).content.find((b) => b.type === "text")?.text || null;
	} catch {
		return null;
	}
}
const main = defineCommand({
	meta: {
		name: "skilld",
		description: "Sync package documentation for agentic use"
	},
	args: {
		package: {
			type: "positional",
			description: "Package name to sync docs for",
			required: false
		},
		global: {
			type: "boolean",
			alias: "g",
			description: "Install globally to ~/.claude/skills",
			default: false
		},
		agent: {
			type: "string",
			alias: "a",
			description: "Target specific agent (claude-code, cursor, windsurf, etc.)"
		},
		model: {
			type: "string",
			alias: "m",
			description: "LLM model (haiku, sonnet, opus, gemini-flash, gemini-pro)"
		},
		yes: {
			type: "boolean",
			alias: "y",
			description: "Skip prompts, use defaults",
			default: false
		}
	},
	async run({ args }) {
		const currentAgent = args.agent ?? detectCurrentAgent();
		if (!currentAgent) {
			consola.warn("Could not detect agent. Use --agent <name>");
			consola.info("Supported: " + Object.keys(agents).join(", "));
			return;
		}
		const agent = agents[currentAgent];
		consola.info(`Target: ${agent.displayName}`);
		if (!args.package) {
			consola.warn("Usage: skilld <package-name>");
			return;
		}
		let model = "haiku";
		if (args.model) model = args.model;
		else if (!args.yes) {
			const availableModels = await getAvailableModels();
			if (availableModels.length > 0) model = await consola.prompt("Select LLM for SKILL.md generation:", {
				type: "select",
				options: availableModels.map((m) => ({
					label: m.recommended ? `${m.name} (Recommended)` : m.name,
					value: m.id,
					hint: m.description
				})),
				initial: availableModels.find((m) => m.recommended)?.id || availableModels[0]?.id
			});
		}
		await syncPackage(args.package, {
			global: args.global,
			agent: currentAgent,
			model
		});
	}
});
async function syncPackage(packageName, config) {
	consola.start(`Resolving ${packageName}...`);
	const resolved = await resolvePackageDocs(packageName);
	if (!resolved) {
		consola.error(`Could not find docs for: ${packageName}`);
		return;
	}
	const agent = agents[config.agent];
	const skillDir = join(config.global ? join(homedir(), ".claude/skills") : join(process.cwd(), agent.skillsDir), sanitizeName(packageName));
	const docsDir = join(skillDir, "docs");
	mkdirSync(docsDir, { recursive: true });
	let llmsContent = null;
	if (resolved.llmsUrl) {
		consola.start("Fetching llms.txt...");
		llmsContent = await fetchText(resolved.llmsUrl);
		if (llmsContent) {
			const normalizedLlms = llmsContent.replace(/\]\(\/([^)]+\.md)\)/g, "](./docs/$1)");
			writeFileSync(join(skillDir, "llms.txt"), normalizedLlms);
			consola.success("Saved llms.txt");
			const baseUrl = resolved.docsUrl || new URL(resolved.llmsUrl).origin;
			const mdUrls = parseMarkdownLinks(llmsContent);
			if (mdUrls.length > 0) {
				consola.start(`Downloading ${mdUrls.length} doc files...`);
				let downloaded = 0;
				for (const mdPath of mdUrls) {
					const content = await fetchText(mdPath.startsWith("http") ? mdPath : `${baseUrl.replace(/\/$/, "")}${mdPath}`);
					if (content && content.length > 100) {
						const filePath = join(docsDir, mdPath.startsWith("/") ? mdPath.slice(1) : mdPath);
						mkdirSync(dirname(filePath), { recursive: true });
						writeFileSync(filePath, content);
						downloaded++;
					}
				}
				consola.success(`Downloaded ${downloaded}/${mdUrls.length} docs`);
			}
		}
	}
	if (resolved.readmeUrl && !existsSync(join(docsDir, "llms.txt"))) {
		consola.start("Fetching README...");
		const content = await fetchReadme(resolved.readmeUrl);
		if (content) {
			writeFileSync(join(docsDir, "README.md"), content);
			consola.success("Saved README.md");
		}
	}
	let docsContent = null;
	if (llmsContent) {
		const bestPracticesPaths = parseMarkdownLinks(llmsContent).filter((p) => p.includes("/style-guide/") || p.includes("/best-practices/") || p.includes("/typescript/"));
		const sections = [];
		for (const mdPath of bestPracticesPaths) {
			const filePath = join(docsDir, mdPath.startsWith("/") ? mdPath.slice(1) : mdPath);
			if (existsSync(filePath)) {
				const content = readFileSync(filePath, "utf-8");
				sections.push(`# ${mdPath}\n\n${content}`);
			}
		}
		docsContent = sections.length > 0 ? sections.join("\n\n---\n\n") : llmsContent;
	} else if (existsSync(join(docsDir, "README.md"))) docsContent = readFileSync(join(docsDir, "README.md"), "utf-8");
	if (docsContent) {
		consola.start(`Generating SKILL.md with ${config.model}...`);
		const { optimized, wasOptimized } = await optimizeDocs(docsContent, packageName, config.agent, config.model);
		if (wasOptimized) {
			let skillMd = optimized.replace(/^```markdown\n?/m, "").replace(/\n?```$/m, "").trim();
			const frontmatterMatch = skillMd.match(/^(.*?)(---\n[\s\S]*?\n---)/m);
			if (frontmatterMatch && frontmatterMatch[2]) skillMd = skillMd.slice(skillMd.indexOf("---"));
			if (!skillMd.startsWith("---")) skillMd = `---
name: ${sanitizeName(packageName)}
description: "${resolved.description || packageName} - Use this skill when working with ${packageName}."
version: "${resolved.version || "latest"}"
---

${skillMd}`;
			skillMd += `

## Documentation

For deeper information, read the local docs. The \`llms.txt\` file contains an index with relative links to all documentation files:

\`\`\`
./llms.txt          # Index with links to all docs
./docs/api/         # API reference
./docs/guide/       # Guides and tutorials
./docs/style-guide/ # Style guide rules
\`\`\`

Follow relative links in llms.txt to read specific documentation files.
`;
			writeFileSync(join(skillDir, "SKILL.md"), skillMd);
			consola.success("Generated SKILL.md");
		} else {
			consola.warn("Haiku not available, creating minimal SKILL.md");
			const skillMd = `---
name: ${sanitizeName(packageName)}
description: "${resolved.description || packageName} - Use this skill when working with ${packageName}."
version: "${resolved.version || "latest"}"
---

# ${packageName}

${resolved.description || ""}

## Documentation

Raw docs in \`docs/\` - use skill-creator to generate optimized content.
`;
			writeFileSync(join(skillDir, "SKILL.md"), skillMd);
		}
	}
	consola.success(`Synced ${packageName} to ${skillDir}`);
}
async function fetchText(url) {
	const res = await fetch(url, { headers: { "User-Agent": "skilld/1.0" } }).catch(() => null);
	if (!res?.ok) return null;
	return res.text();
}
async function fetchReadme(url) {
	if (url.startsWith("ungh://")) {
		const parts = url.replace("ungh://", "").split("/");
		const owner = parts[0];
		const repo = parts[1];
		const subdir = parts.slice(2).join("/");
		const unghUrl = subdir ? `https://ungh.cc/repos/${owner}/${repo}/files/main/${subdir}/README.md` : `https://ungh.cc/repos/${owner}/${repo}/readme`;
		const res = await fetch(unghUrl, { headers: { "User-Agent": "skilld/1.0" } }).catch(() => null);
		if (!res?.ok) return null;
		const text = await res.text();
		try {
			const json = JSON.parse(text);
			return json.markdown || json.file?.contents || null;
		} catch {
			return text;
		}
	}
	return fetchText(url);
}
function parseMarkdownLinks(content) {
	const links = [];
	const linkRegex = /\[([^\]]+)\]\(([^)]+\.md)\)/g;
	let match;
	while ((match = linkRegex.exec(content)) !== null) {
		const url = match[2];
		if (!links.includes(url)) links.push(url);
	}
	return links;
}
runMain(main);
export {};

//# sourceMappingURL=cli.mjs.map