import { describe, expect, it } from 'vitest'
import { agents } from '../src/agent/registry'

describe('agent/registry', () => {
  it('defines all expected agents', () => {
    const expectedAgents = [
      'claude-code',
      'cursor',
      'windsurf',
      'cline',
      'codex',
      'github-copilot',
      'gemini-cli',
      'goose',
      'amp',
      'opencode',
      'roo',
    ]

    expect(Object.keys(agents)).toEqual(expect.arrayContaining(expectedAgents))
    expect(Object.keys(agents)).toHaveLength(expectedAgents.length)
  })

  it('each agent has required config fields', () => {
    for (const [key, config] of Object.entries(agents)) {
      expect(config.name).toBe(key)
      expect(config.displayName).toBeTruthy()
      expect(config.skillsDir).toBeTruthy()
      expect(typeof config.detectInstalled).toBe('function')
    }
  })

  it('all agents have globalSkillsDir defined', () => {
    for (const config of Object.values(agents)) {
      expect(config.globalSkillsDir).toBeTruthy()
    }
  })

  it('skillsDir paths are relative (project-local)', () => {
    for (const config of Object.values(agents)) {
      expect(config.skillsDir.startsWith('.')).toBe(true)
      expect(config.skillsDir.startsWith('/')).toBe(false)
    }
  })

  it('globalSkillsDir paths are absolute', () => {
    for (const config of Object.values(agents)) {
      expect(config.globalSkillsDir!.startsWith('/')).toBe(true)
    }
  })
})
