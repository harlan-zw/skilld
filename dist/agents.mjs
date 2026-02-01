import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
const home = homedir();
const configHome = process.env.XDG_CONFIG_HOME || join(home, ".config");
const claudeHome = process.env.CLAUDE_CONFIG_DIR || join(home, ".claude");
const codexHome = process.env.CODEX_HOME || join(home, ".codex");
const agents = {
	"claude-code": {
		name: "claude-code",
		displayName: "Claude Code",
		skillsDir: ".claude/skills",
		globalSkillsDir: join(claudeHome, "skills"),
		detectInstalled: () => existsSync(claudeHome)
	},
	cursor: {
		name: "cursor",
		displayName: "Cursor",
		skillsDir: ".cursor/skills",
		globalSkillsDir: join(home, ".cursor/skills"),
		detectInstalled: () => existsSync(join(home, ".cursor"))
	},
	windsurf: {
		name: "windsurf",
		displayName: "Windsurf",
		skillsDir: ".windsurf/skills",
		globalSkillsDir: join(home, ".codeium/windsurf/skills"),
		detectInstalled: () => existsSync(join(home, ".codeium/windsurf"))
	},
	cline: {
		name: "cline",
		displayName: "Cline",
		skillsDir: ".cline/skills",
		globalSkillsDir: join(home, ".cline/skills"),
		detectInstalled: () => existsSync(join(home, ".cline"))
	},
	codex: {
		name: "codex",
		displayName: "Codex",
		skillsDir: ".codex/skills",
		globalSkillsDir: join(codexHome, "skills"),
		detectInstalled: () => existsSync(codexHome)
	},
	"github-copilot": {
		name: "github-copilot",
		displayName: "GitHub Copilot",
		skillsDir: ".github/skills",
		globalSkillsDir: join(home, ".copilot/skills"),
		detectInstalled: () => existsSync(join(home, ".copilot"))
	},
	"gemini-cli": {
		name: "gemini-cli",
		displayName: "Gemini CLI",
		skillsDir: ".gemini/skills",
		globalSkillsDir: join(home, ".gemini/skills"),
		detectInstalled: () => existsSync(join(home, ".gemini"))
	},
	goose: {
		name: "goose",
		displayName: "Goose",
		skillsDir: ".goose/skills",
		globalSkillsDir: join(configHome, "goose/skills"),
		detectInstalled: () => existsSync(join(configHome, "goose"))
	},
	amp: {
		name: "amp",
		displayName: "Amp",
		skillsDir: ".agents/skills",
		globalSkillsDir: join(configHome, "agents/skills"),
		detectInstalled: () => existsSync(join(configHome, "amp"))
	},
	opencode: {
		name: "opencode",
		displayName: "OpenCode",
		skillsDir: ".opencode/skills",
		globalSkillsDir: join(configHome, "opencode/skills"),
		detectInstalled: () => existsSync(join(configHome, "opencode"))
	},
	roo: {
		name: "roo",
		displayName: "Roo Code",
		skillsDir: ".roo/skills",
		globalSkillsDir: join(home, ".roo/skills"),
		detectInstalled: () => existsSync(join(home, ".roo"))
	}
};
function detectInstalledAgents() {
	return Object.entries(agents).filter(([_, config]) => config.detectInstalled()).map(([type]) => type);
}
function detectCurrentAgent() {
	if (process.env.CLAUDE_CODE || process.env.CLAUDE_CONFIG_DIR) return "claude-code";
	if (process.env.CURSOR_SESSION || process.env.CURSOR_TRACE_ID) return "cursor";
	if (process.env.WINDSURF_SESSION) return "windsurf";
	if (process.env.CLINE_TASK_ID) return "cline";
	if (process.env.CODEX_HOME || process.env.CODEX_SESSION) return "codex";
	if (process.env.GITHUB_COPILOT_SESSION) return "github-copilot";
	if (process.env.GEMINI_API_KEY && process.env.GEMINI_SESSION) return "gemini-cli";
	if (process.env.GOOSE_SESSION) return "goose";
	if (process.env.AMP_SESSION) return "amp";
	if (process.env.OPENCODE_SESSION) return "opencode";
	if (process.env.ROO_SESSION) return "roo";
	const cwd = process.cwd();
	if (existsSync(join(cwd, ".claude"))) return "claude-code";
	if (existsSync(join(cwd, ".cursor"))) return "cursor";
	if (existsSync(join(cwd, ".windsurf"))) return "windsurf";
	if (existsSync(join(cwd, ".cline"))) return "cline";
	return null;
}
function sanitizeName(name) {
	return name.toLowerCase().replace(/[^a-z0-9._]+/g, "-").replace(/^[.\-]+|[.\-]+$/g, "").slice(0, 255) || "unnamed-skill";
}
function installSkillForAgents(skillName, skillContent, options = {}) {
	const isGlobal = options.global ?? false;
	const cwd = options.cwd || process.cwd();
	const sanitized = sanitizeName(skillName);
	const targetAgents = options.agents || detectInstalledAgents();
	const installed = [];
	const paths = [];
	for (const agentType of targetAgents) {
		const agent = agents[agentType];
		if (isGlobal && !agent.globalSkillsDir) continue;
		const skillDir = join(isGlobal ? agent.globalSkillsDir : join(cwd, agent.skillsDir), sanitized);
		mkdirSync(skillDir, { recursive: true });
		writeFileSync(join(skillDir, "SKILL.md"), skillContent);
		if (options.files) for (const [filename, content] of Object.entries(options.files)) writeFileSync(join(skillDir, filename), content);
		installed.push(agentType);
		paths.push(skillDir);
	}
	return {
		installed,
		paths
	};
}
function generateSkillMd(meta, body) {
	const { name, version, description: packageDescription } = meta;
	const description = packageDescription ? `${packageDescription} Use this skill when working with ${name}, importing from "${name}", or when the user asks about ${name} features, API, or usage.` : `Documentation for ${name}. Use this skill when working with ${name} or importing from "${name}".`;
	const frontmatter = [
		"---",
		`name: ${name}`,
		`description: ${description}`
	];
	if (version) frontmatter.push(`version: "${version}"`);
	frontmatter.push("---");
	return frontmatter.join("\n") + "\n\n" + body;
}
export { agents, detectCurrentAgent, detectInstalledAgents, generateSkillMd, installSkillForAgents, sanitizeName };

//# sourceMappingURL=agents.mjs.map