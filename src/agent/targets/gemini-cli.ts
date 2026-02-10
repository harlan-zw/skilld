import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'pathe'
import { defineTarget, SPEC_FRONTMATTER } from './base'

const home = homedir()

/**
 * Google Gemini CLI
 *
 * Follows the Agent Skills open standard (agentskills.io).
 * Skills are activated via `activate_skill` tool with user confirmation.
 *
 * Also has GEMINI.md context files (analogous to CLAUDE.md) which support
 * @file.md import syntax for modular composition.
 *
 * @see https://geminicli.com/docs/cli/skills/
 * @see https://geminicli.com/docs/cli/creating-skills/
 */
export const geminiCli = defineTarget({
  agent: 'gemini-cli',
  displayName: 'Gemini CLI',
  detectInstalled: () => existsSync(join(home, '.gemini')),
  detectEnv: () => !!(process.env.GEMINI_API_KEY && process.env.GEMINI_SESSION),
  detectProject: cwd => existsSync(join(cwd, '.gemini')) || existsSync(join(cwd, 'AGENTS.md')),
  cli: 'gemini',
  instructionFile: 'GEMINI.md',

  skillsDir: '.gemini/skills',
  globalSkillsDir: join(home, '.gemini/skills'),

  frontmatter: [
    SPEC_FRONTMATTER.name!,
    { ...SPEC_FRONTMATTER.description!, description: 'Primary trigger — agent uses this to match tasks.' },
    SPEC_FRONTMATTER.license!,
    SPEC_FRONTMATTER.compatibility!,
    SPEC_FRONTMATTER.metadata!,
    SPEC_FRONTMATTER['allowed-tools']!,
  ],

  discoveryStrategy: 'eager',
  discoveryNotes: 'Scans at session start, injects ~100 tokens per skill (name+description). Activation via activate_skill tool requires user confirmation. Skill stays active for session duration.',

  agentSkillsSpec: true,

  docs: 'https://geminicli.com/docs/cli/skills/',
  notes: [
    'Management commands: /skills list, /skills enable <name>, /skills disable <name>, /skills reload.',
    'GEMINI.md context files are separate from skills — support @file.md import syntax.',
    'settings.json can configure additional context filenames: ["AGENTS.md", "CONTEXT.md", "GEMINI.md"].',
    'scripts/, references/, assets/ directories are defined by spec but implementation is still incomplete (issue #15895).',
  ],
})
