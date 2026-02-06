import type { FeaturesConfig } from '../core/config'
import * as p from '@clack/prompts'
import { agents, getAvailableModels } from '../agent'
import { defaultFeatures, readConfig, updateConfig } from '../core/config'

export async function configCommand(): Promise<void> {
  const config = readConfig()

  const features = config.features ?? defaultFeatures
  const enabledCount = Object.values(features).filter(Boolean).length

  const action = await p.select({
    message: 'Settings',
    options: [
      { label: 'Change features', value: 'features', hint: `${enabledCount}/4 enabled` },
      { label: 'Change model', value: 'model', hint: config.model || 'auto' },
      { label: 'Change agent', value: 'agent', hint: config.agent || 'auto-detect' },
    ],
  })

  if (p.isCancel(action)) {
    p.cancel('Cancelled')
    return
  }

  switch (action) {
    case 'features': {
      const featureOptions = [
        { label: 'Semantic + token search', value: 'search' as const, hint: 'local query engine to cut token costs and speed up grep' },
        { label: 'Release notes', value: 'releases' as const, hint: 'track changelogs for installed packages' },
        { label: 'GitHub issues', value: 'issues' as const, hint: 'surface common problems and solutions' },
        { label: 'GitHub discussions', value: 'discussions' as const, hint: 'include Q&A and community knowledge' },
      ] as const

      const selected = await p.multiselect({
        message: 'Enable features',
        options: featureOptions.map(f => ({
          label: f.label,
          value: f.value,
          hint: f.hint,
        })),
        initialValues: Object.entries(features)
          .filter(([, v]) => v)
          .map(([k]) => k) as Array<keyof FeaturesConfig>,
        required: false,
      })

      if (p.isCancel(selected))
        return

      const updated: FeaturesConfig = {
        search: selected.includes('search'),
        issues: selected.includes('issues'),
        discussions: selected.includes('discussions'),
        releases: selected.includes('releases'),
      }
      updateConfig({ features: updated })
      p.log.success(`Features updated: ${selected.length} enabled`)
      break
    }

    case 'model': {
      const available = await getAvailableModels()
      if (available.length === 0) {
        p.log.warn('No LLM CLIs found')
        return
      }

      const model = await p.select({
        message: 'Select default model',
        options: [
          { label: 'Auto (prompt each time)', value: '' },
          ...available.map(m => ({
            label: m.recommended ? `${m.name} (Recommended)` : m.name,
            value: m.id,
            hint: m.hint,
          })),
        ],
        initialValue: config.model || '',
      })

      if (p.isCancel(model))
        return

      updateConfig({ model: (model || undefined) as typeof config.model })
      p.log.success(model ? `Default model set to ${model}` : 'Model will be prompted each time')
      break
    }

    case 'agent': {
      const agentChoice = await p.select({
        message: 'Select default agent',
        options: [
          { label: 'Auto-detect', value: '' },
          ...Object.entries(agents).map(([id, a]) => ({
            label: a.displayName,
            value: id,
            hint: a.skillsDir,
          })),
        ],
        initialValue: config.agent || '',
      })

      if (p.isCancel(agentChoice))
        return

      updateConfig({ agent: agentChoice || undefined })
      p.log.success(agentChoice ? `Default agent set to ${agentChoice}` : 'Agent will be auto-detected')
      break
    }
  }
}
