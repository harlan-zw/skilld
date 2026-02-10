import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'pathe'
import { defineTarget, SPEC_FRONTMATTER } from './base'

const codexHome = process.env.CODEX_HOME || join(homedir(), '.codex')

/**
 * OpenAI Codex CLI
 *
 * IMPORTANT: Codex uses `.agents/skills/` for project-level skills,
 * NOT `.codex/skills/`. The `.codex/` directory is for config (config.toml).
 * `~/.codex/skills/` works only as a legacy user-global path.
 *
 * Codex also has AGENTS.md (or AGENTS.override.md) for general instructions,
 * which walks from git root to CWD concatenating found files.
 *
 * @see https://developers.openai.com/codex/skills
 * @see https://developers.openai.com/codex/guides/agents-md/
 */
export const codex = defineTarget({
  agent: 'codex',
  displayName: 'Codex',
  detectInstalled: () => existsSync(codexHome),
  detectEnv: () => !!(process.env.CODEX_HOME || process.env.CODEX_SESSION),
  detectProject: cwd => existsSync(join(cwd, '.codex')),
  cli: 'codex',

  skillsDir: '.agents/skills',
  globalSkillsDir: join(homedir(), '.agents/skills'),
  additionalSkillsDirs: [
    '~/.codex/skills',
    '/etc/codex/skills',
  ],

  frontmatter: [
    { ...SPEC_FRONTMATTER.name!, description: 'Skill identifier.', constraints: '1-64 chars, ^[a-z0-9-]+$, no leading/trailing/consecutive hyphens' },
    { ...SPEC_FRONTMATTER.description!, description: 'Must include when-to-use criteria. Primary triggering mechanism.', constraints: '1-1024 chars, no angle brackets (< or >)' },
    SPEC_FRONTMATTER.license!,
    SPEC_FRONTMATTER['allowed-tools']!,
    SPEC_FRONTMATTER.metadata!,
  ],

  discoveryStrategy: 'lazy',
  discoveryNotes: 'Startup scan reads name + description + optional agents/openai.yaml. Full body loads only on invocation. Supports $1-$9 and $ARGUMENTS placeholders.',

  agentSkillsSpec: true,
  extensions: [
    'agents/openai.yaml (UI metadata + MCP dependencies)',
    '$1-$9 positional argument placeholders',
    'AGENTS.override.md for temporary overrides',
  ],

  docs: 'https://developers.openai.com/codex/skills',
  notes: [
    'BUG IN CURRENT CODE: skillsDir is .codex/skills/ but should be .agents/skills/. The .codex/ directory is for config, not skills.',
    'Description field cannot contain angle brackets (< or >).',
    'Optional agents/openai.yaml provides UI metadata: display_name, icon, brand_color, default_prompt.',
    'AGENTS.md walks from git root to CWD, concatenating all found files.',
    'Live reload: detects skill file changes without restart (v0.95.0+).',
    'Size limit: 32 KiB default (project_doc_max_bytes), configurable in ~/.codex/config.toml.',
  ],
})
