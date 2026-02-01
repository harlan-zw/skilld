//#region src/agents.d.ts
/**
 * Agent detection and skill installation
 * Writes directly to agent skill directories in the project
 */
type AgentType = 'claude-code' | 'cursor' | 'windsurf' | 'cline' | 'codex' | 'github-copilot' | 'gemini-cli' | 'goose' | 'amp' | 'opencode' | 'roo';
interface AgentConfig {
  name: AgentType;
  displayName: string;
  /** Project-level skills directory (e.g., .claude/skills) */
  skillsDir: string;
  /** Global skills directory (e.g., ~/.claude/skills) */
  globalSkillsDir: string | undefined;
  /** Check if agent is installed on the system */
  detectInstalled: () => boolean;
}
declare const agents: Record<AgentType, AgentConfig>;
/**
 * Detect which agents are installed on the system
 */
declare function detectInstalledAgents(): AgentType[];
/**
 * Detect which agent is currently running this command
 * Returns the active agent based on environment variables and context
 */
declare function detectCurrentAgent(): AgentType | null;
/**
 * Sanitize skill name for filesystem
 */
declare function sanitizeName(name: string): string;
/**
 * Install a skill directly to agent skill directories
 * Writes to each agent's skill folder in the project (e.g., .claude/skills/package-name/)
 */
declare function installSkillForAgents(skillName: string, skillContent: string, options?: {
  global?: boolean;
  cwd?: string;
  agents?: AgentType[]; /** Additional files to write (filename -> content) */
  files?: Record<string, string>;
}): {
  installed: AgentType[];
  paths: string[];
};
interface SkillMetadata {
  name: string;
  version?: string;
  description?: string;
}
/**
 * Generate SKILL.md frontmatter content
 * The description tells the agent when to use this skill
 */
declare function generateSkillMd(meta: SkillMetadata, body: string): string;
//#endregion
export { AgentConfig, AgentType, SkillMetadata, agents, detectCurrentAgent, detectInstalledAgents, generateSkillMd, installSkillForAgents, sanitizeName };
//# sourceMappingURL=agents.d.mts.map