import type { FeaturesConfig } from '../core/config.ts'
import { execSync } from 'node:child_process'
import * as p from '@clack/prompts'
import { getAvailableModels } from '../agent/index.ts'
import { isInteractive } from '../cli-helpers.ts'
import { defaultFeatures, updateConfig } from '../core/config.ts'

function hasGhCli(): boolean {
  if (process.env.SKILLD_NO_GH)
    return false
  try {
    execSync('gh --version', { stdio: 'ignore' })
    return true
  }
  catch {
    return false
  }
}

export async function runWizard(): Promise<void> {
  if (!isInteractive())
    return

  p.note(
    'Skilld gives your AI agent skill knowledge on your NPM\n'
    + 'dependencies gathered from versioned docs, source code\n'
    + 'and GitHub issues.',
    'Welcome to skilld',
  )

  const ghInstalled = hasGhCli()

  if (ghInstalled) {
    p.log.success(
      'GitHub CLI detected — will use it to pull issues and discussions.',
    )
  }
  else {
    p.log.warn(
      'GitHub CLI not found. Install it to enable issues/discussions:\n'
      + '  \x1B[36mhttps://cli.github.com\x1B[0m',
    )
  }

  // Feature toggles
  const selected = await p.multiselect({
    message: 'Which features would you like to enable?',
    options: [
      { label: 'Semantic + token search', value: 'search' as const, hint: 'local query engine to cut token costs and speed up grep' },
      { label: 'Release notes', value: 'releases' as const, hint: 'track changelogs for installed packages' },
      { label: 'GitHub issues', value: 'issues' as const, hint: 'surface common problems and solutions', disabled: !ghInstalled },
      { label: 'GitHub discussions', value: 'discussions' as const, hint: 'include Q&A and community knowledge', disabled: !ghInstalled },
    ],
    initialValues: [
      ...Object.entries(defaultFeatures)
        .filter(([, v]) => v)
        .map(([k]) => k),
      ...(ghInstalled ? ['issues', 'discussions'] as const : []),
    ] as Array<keyof FeaturesConfig>,
    required: false,
  })

  if (p.isCancel(selected)) {
    p.cancel('Setup cancelled')
    process.exit(0)
  }

  const features: FeaturesConfig = {
    search: selected.includes('search'),
    issues: selected.includes('issues'),
    discussions: selected.includes('discussions'),
    releases: selected.includes('releases'),
  }

  // LLM optimization — optional, model selection is independent of target agent
  const allModels = process.env.SKILLD_NO_AGENTS ? [] : await getAvailableModels()
  let modelId: string | undefined

  if (allModels.length > 0) {
    p.note(
      'Skills work without an LLM, but one can rewrite your\n'
      + 'SKILL.md files with best practices and better structure.\n'
      + '\x1B[90mThis is separate from the agent where skills are installed —\n'
      + 'the target agent is auto-detected from your project files.\x1B[0m',
      'Optional: LLM optimization',
    )

    const modelChoice = await p.select({
      message: 'Model for generating SKILL.md',
      options: [
        { label: 'Skip', value: '', hint: 'use raw docs, no LLM needed' },
        ...allModels.map(m => ({
          label: m.recommended ? `${m.name} (Recommended)` : m.name,
          value: m.id,
          hint: `${m.agentName} · ${m.hint}`,
        })),
      ],
    })

    if (p.isCancel(modelChoice)) {
      p.cancel('Setup cancelled')
      process.exit(0)
    }

    modelId = (modelChoice as string) || undefined
  }
  else {
    p.log.warn(
      'No supported LLM CLIs detected (claude, gemini, codex).\n'
      + '  Skills will still work, but won\'t be LLM-optimized.',
    )
    const proceed = await p.confirm({
      message: 'Continue without LLM optimization?',
      initialValue: true,
    })
    if (p.isCancel(proceed) || !proceed) {
      p.cancel('Setup cancelled')
      process.exit(0)
    }
  }

  updateConfig({
    features,
    ...(modelId ? { model: modelId as any } : { skipLlm: true }),
  })

  p.outro('Thanks, you\'re all set! Change config anytime with `skilld config`.')
}
