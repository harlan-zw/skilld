import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type { OptimizeModel } from '../agent'

export interface SkilldConfig {
  model?: OptimizeModel
  agent?: string
  projects?: string[]
}

const CONFIG_DIR = join(homedir(), '.skilld')
const CONFIG_PATH = join(CONFIG_DIR, 'config.yaml')

export function readConfig(): SkilldConfig {
  if (!existsSync(CONFIG_PATH)) return {}

  const content = readFileSync(CONFIG_PATH, 'utf-8')
  const config: SkilldConfig = {}
  let inProjects = false
  const projects: string[] = []

  for (const line of content.split('\n')) {
    if (line.startsWith('projects:')) {
      inProjects = true
      continue
    }
    if (inProjects) {
      if (line.startsWith('  - ')) {
        projects.push(line.slice(4).trim().replace(/^["']|["']$/g, ''))
        continue
      }
      inProjects = false
    }
    const [key, ...rest] = line.split(':')
    const value = rest.join(':').trim().replace(/^["']|["']$/g, '')
    if (key === 'model' && value) config.model = value as OptimizeModel
    if (key === 'agent' && value) config.agent = value
  }

  if (projects.length > 0) config.projects = projects
  return config
}

export function writeConfig(config: SkilldConfig): void {
  mkdirSync(CONFIG_DIR, { recursive: true })

  let yaml = ''
  if (config.model) yaml += `model: ${config.model}\n`
  if (config.agent) yaml += `agent: ${config.agent}\n`
  if (config.projects?.length) {
    yaml += 'projects:\n'
    for (const p of config.projects) {
      yaml += `  - ${p}\n`
    }
  }

  writeFileSync(CONFIG_PATH, yaml)
}

export function updateConfig(updates: Partial<SkilldConfig>): void {
  const config = readConfig()
  writeConfig({ ...config, ...updates })
}

export function registerProject(projectPath: string): void {
  const config = readConfig()
  const projects = new Set(config.projects || [])
  projects.add(projectPath)
  writeConfig({ ...config, projects: [...projects] })
}

export function unregisterProject(projectPath: string): void {
  const config = readConfig()
  const projects = (config.projects || []).filter(p => p !== projectPath)
  writeConfig({ ...config, projects })
}

export function getRegisteredProjects(): string[] {
  return readConfig().projects || []
}
