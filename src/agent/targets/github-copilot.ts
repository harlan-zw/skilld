import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'pathe'
import { defineTarget, SPEC_FRONTMATTER } from './base.ts'

const home = homedir()

/**
 * GitHub Copilot
 *
 * Has TWO systems: Instructions (.github/instructions/*.instructions.md)
 * and Skills (.github/skills/). We target Skills.
 *
 * Copilot also auto-detects .claude/skills/ as a legacy path,
 * so .claude/skills/ output works for Claude Code, Cursor, Cline, AND Copilot.
 *
 * @see https://docs.github.com/en/copilot/concepts/agents/about-agent-skills
 * @see https://docs.github.com/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot
 */
export const githubCopilot = defineTarget({
  agent: 'github-copilot',
  displayName: 'GitHub Copilot',
  detectInstalled: () => existsSync(join(home, '.copilot')),
  detectEnv: () => !!process.env.GITHUB_COPILOT_SESSION,
  detectProject: cwd => existsSync(join(cwd, '.github', 'copilot-instructions.md')),
  instructionFile: '.github/copilot-instructions.md',

  skillsDir: '.github/skills',
  globalSkillsDir: join(home, '.copilot/skills'),
  additionalSkillsDirs: [
    '.claude/skills',
    '~/.claude/skills',
  ],

  frontmatter: [
    SPEC_FRONTMATTER.name!,
    { ...SPEC_FRONTMATTER.description!, description: 'What the skill does AND when to use it.' },
    SPEC_FRONTMATTER.license!,
    SPEC_FRONTMATTER.compatibility!,
    { ...SPEC_FRONTMATTER.metadata!, description: 'Arbitrary key-value pairs (e.g. version, author)' },
    SPEC_FRONTMATTER['allowed-tools']!,
  ],

  discoveryStrategy: 'lazy',
  discoveryNotes: '3-level progressive disclosure: (1) ~100 tokens for name+description, (2) full SKILL.md body <5000 tokens on activation, (3) resources from scripts/references/assets/ on demand.',

  agentSkillsSpec: true,

  docs: 'https://docs.github.com/en/copilot/concepts/agents/about-agent-skills',
  notes: [
    'Copilot auto-detects .claude/skills/ as a legacy path — emitting there covers multiple agents.',
    'Instructions system (.github/instructions/*.instructions.md) is separate, uses applyTo globs.',
    'copilot-instructions.md at .github/ root is always applied (repo-wide).',
    'AGENTS.md also recognized as of Aug 2025.',
    'excludeAgent property in instructions can hide from code-review or coding-agent.',
    'Keep SKILL.md under 500 lines / 5000 tokens for optimal loading.',
  ],
})
