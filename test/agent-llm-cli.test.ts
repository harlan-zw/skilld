import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock child_process - only mock execSync, leave spawn for integration
vi.mock('node:child_process', async () => {
  const actual = await vi.importActual<typeof import('node:child_process')>('node:child_process')
  return {
    ...actual,
    execSync: vi.fn(),
  }
})

describe('agent/llm/cli', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('hasCli', () => {
    it('returns true when command exists', async () => {
      const { execSync } = await import('node:child_process')
      const { hasCli } = await import('../src/agent/llm/cli')
      vi.mocked(execSync).mockReturnValue(Buffer.from('/usr/bin/claude'))

      expect(hasCli('claude')).toBe(true)
      expect(execSync).toHaveBeenCalledWith('which claude', { stdio: 'ignore' })
    })

    it('returns false when command not found', async () => {
      const { execSync } = await import('node:child_process')
      const { hasCli } = await import('../src/agent/llm/cli')
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error('not found')
      })

      expect(hasCli('nonexistent')).toBe(false)
    })
  })

  describe('createCliProvider', () => {
    it('creates provider with correct interface', async () => {
      const { createCliProvider } = await import('../src/agent/llm/cli')

      const provider = createCliProvider({
        id: 'test',
        name: 'Test CLI',
        command: 'test-cmd',
        models: [
          { id: 'fast', name: 'Fast Model' },
          { id: 'smart', name: 'Smart Model' },
        ],
        modelMap: { fast: 'f', smart: 's' },
      })

      expect(provider.id).toBe('test')
      expect(provider.name).toBe('Test CLI')
      expect(provider.getModels()).toHaveLength(2)
      expect(typeof provider.isAvailable).toBe('function')
      expect(typeof provider.generate).toBe('function')
    })

    it('isAvailable checks for CLI command', async () => {
      const { execSync } = await import('node:child_process')
      const { createCliProvider } = await import('../src/agent/llm/cli')
      vi.mocked(execSync).mockReturnValue(Buffer.from(''))

      const provider = createCliProvider({
        id: 'test',
        name: 'Test',
        command: 'my-cli',
        models: [],
        modelMap: {},
      })

      provider.isAvailable()

      expect(execSync).toHaveBeenCalledWith('which my-cli', { stdio: 'ignore' })
    })

    it('getModels returns configured models', async () => {
      const { createCliProvider } = await import('../src/agent/llm/cli')

      const models = [
        { id: 'model1', name: 'Model 1', description: 'First' },
        { id: 'model2', name: 'Model 2', recommended: true },
      ]

      const provider = createCliProvider({
        id: 'test',
        name: 'Test',
        command: 'test',
        models,
        modelMap: { model1: 'm1', model2: 'm2' },
      })

      expect(provider.getModels()).toEqual(models)
    })

    it('uses default buildArgs when not provided', async () => {
      const { createCliProvider } = await import('../src/agent/llm/cli')

      const provider = createCliProvider({
        id: 'test',
        name: 'Test',
        command: 'test',
        models: [{ id: 'model1', name: 'M1' }],
        modelMap: { model1: 'm1' },
        // No buildArgs - should use default
      })

      // Provider should be created without error
      expect(provider.id).toBe('test')
    })

    it('uses custom buildArgs when provided', async () => {
      const { createCliProvider } = await import('../src/agent/llm/cli')
      const customBuildArgs = vi.fn().mockReturnValue(['--custom', 'args'])

      const provider = createCliProvider({
        id: 'test',
        name: 'Test',
        command: 'test',
        models: [{ id: 'model1', name: 'M1' }],
        modelMap: { model1: 'm1' },
        buildArgs: customBuildArgs,
      })

      expect(provider.id).toBe('test')
    })
  })
})
