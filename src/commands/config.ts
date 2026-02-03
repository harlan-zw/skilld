import * as p from '@clack/prompts'
import { agents, getAvailableModels } from '../agent'
import { readConfig, updateConfig } from '../core/config'

export async function configCommand(): Promise<void> {
  const config = readConfig()

  const action = await p.select({
    message: 'Settings',
    options: [
      { label: 'Change model', value: 'model', hint: config.model || 'auto' },
      { label: 'Change agent', value: 'agent', hint: config.agent || 'auto-detect' },
      { label: 'Show current config', value: 'show' },
    ],
  })

  if (p.isCancel(action)) {
    p.cancel('Cancelled')
    return
  }

  switch (action) {
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

    case 'show': {
      console.log()
      console.log(`  model: ${config.model || '\x1B[90m(auto)\x1B[0m'}`)
      console.log(`  agent: ${config.agent || '\x1B[90m(auto-detect)\x1B[0m'}`)
      console.log()
      break
    }
  }
}
