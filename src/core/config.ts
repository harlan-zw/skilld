import type { OptimizeModel } from '../agent'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

export interface FeaturesConfig {
  search: boolean
  issues: boolean
  discussions: boolean
  releases: boolean
}

export const defaultFeatures: FeaturesConfig = {
  search: true,
  issues: false,
  discussions: false,
  releases: true,
}

export interface SkilldConfig {
  model?: OptimizeModel
  agent?: string
  features?: FeaturesConfig
  projects?: string[]
  skipLlm?: boolean
}

const CONFIG_DIR = join(homedir(), '.skilld')
const CONFIG_PATH = join(CONFIG_DIR, 'config.yaml')

export function hasConfig(): boolean {
  return existsSync(CONFIG_PATH)
}

export function readConfig(): SkilldConfig {
  if (!existsSync(CONFIG_PATH))
    return {}

  const content = readFileSync(CONFIG_PATH, 'utf-8')
  const config: SkilldConfig = {}
  let inBlock: 'projects' | 'features' | null = null
  const projects: string[] = []
  const features: Partial<FeaturesConfig> = {}

  for (const line of content.split('\n')) {
    if (line.startsWith('projects:')) {
      inBlock = 'projects'
      continue
    }
    if (line.startsWith('features:')) {
      inBlock = 'features'
      continue
    }
    if (inBlock === 'projects') {
      if (line.startsWith('  - ')) {
        projects.push(line.slice(4).trim().replace(/^["']|["']$/g, ''))
        continue
      }
      inBlock = null
    }
    if (inBlock === 'features') {
      const m = line.match(/^ {2}(\w+):\s*(.+)/)
      if (m) {
        const key = m[1] as keyof FeaturesConfig
        if (key in defaultFeatures)
          features[key] = m[2] === 'true'
        continue
      }
      inBlock = null
    }
    const [key, ...rest] = line.split(':')
    const value = rest.join(':').trim().replace(/^["']|["']$/g, '')
    if (key === 'model' && value)
      config.model = value as OptimizeModel
    if (key === 'agent' && value)
      config.agent = value
    if (key === 'skipLlm')
      config.skipLlm = value === 'true'
  }

  if (projects.length > 0)
    config.projects = projects
  if (Object.keys(features).length > 0)
    config.features = { ...defaultFeatures, ...features }
  return config
}

export function writeConfig(config: SkilldConfig): void {
  mkdirSync(CONFIG_DIR, { recursive: true })

  let yaml = ''
  if (config.model)
    yaml += `model: ${config.model}\n`
  if (config.agent)
    yaml += `agent: ${config.agent}\n`
  if (config.skipLlm)
    yaml += `skipLlm: true\n`
  if (config.features) {
    yaml += 'features:\n'
    for (const [k, v] of Object.entries(config.features)) {
      yaml += `  ${k}: ${v}\n`
    }
  }
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
