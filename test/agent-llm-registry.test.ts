import { describe, expect, it, vi } from 'vitest'
import { findProviderForModel, getAvailableModels, getProvider, getProviders, registerProvider } from '../src/agent/llm/registry'

describe('agent/llm/registry', () => {
  describe('getProviders', () => {
    it('returns array of providers', () => {
      const providers = getProviders()

      expect(Array.isArray(providers)).toBe(true)
      expect(providers.length).toBeGreaterThan(0)
    })

    it('includes expected provider IDs', () => {
      const providers = getProviders()
      const ids = providers.map(p => p.id)

      expect(ids).toContain('claude')
      expect(ids).toContain('gemini')
      expect(ids).toContain('codex')
      expect(ids).toContain('openai')
    })
  })

  describe('getProvider', () => {
    it('finds provider by ID', () => {
      const claude = getProvider('claude')

      expect(claude).toBeDefined()
      expect(claude?.id).toBe('claude')
      expect(claude?.name).toBe('Claude CLI')
    })

    it('returns undefined for unknown ID', () => {
      expect(getProvider('nonexistent')).toBeUndefined()
    })
  })

  describe('registerProvider', () => {
    it('adds provider to registry', () => {
      const customProvider = {
        id: 'custom-test',
        name: 'Custom Test',
        isAvailable: () => false,
        getModels: () => [],
        generate: async () => null,
      }

      const beforeCount = getProviders().length
      registerProvider(customProvider)
      const afterCount = getProviders().length

      expect(afterCount).toBe(beforeCount + 1)
      expect(getProvider('custom-test')).toBe(customProvider)
    })
  })

  describe('provider interface', () => {
    it('all providers have required methods', () => {
      for (const provider of getProviders()) {
        expect(provider.id).toBeTruthy()
        expect(provider.name).toBeTruthy()
        expect(typeof provider.isAvailable).toBe('function')
        expect(typeof provider.getModels).toBe('function')
        expect(typeof provider.generate).toBe('function')
      }
    })

    it('claude provider has expected models', () => {
      const claude = getProvider('claude')!
      const models = claude.getModels()
      const ids = models.map(m => m.id)

      expect(ids).toContain('haiku')
      expect(ids).toContain('sonnet')
      expect(ids).toContain('opus')
    })
  })

  describe('findProviderForModel', () => {
    it('finds provider that supports model and is available', () => {
      // Mock a provider as available
      const mockProvider = {
        id: 'mock-provider',
        name: 'Mock',
        isAvailable: () => true,
        getModels: () => [{ id: 'test-model', name: 'Test' }],
        generate: async () => null,
      }
      registerProvider(mockProvider)

      const found = findProviderForModel('test-model')

      expect(found).toBe(mockProvider)
    })

    it('returns undefined when no provider has model', () => {
      const found = findProviderForModel('nonexistent-model-xyz')

      expect(found).toBeUndefined()
    })

    it('skips unavailable providers', () => {
      const mockProvider = {
        id: 'unavailable-provider',
        name: 'Unavailable',
        isAvailable: () => false,
        getModels: () => [{ id: 'unavailable-model', name: 'Test' }],
        generate: async () => null,
      }
      registerProvider(mockProvider)

      const found = findProviderForModel('unavailable-model')

      expect(found).toBeUndefined()
    })
  })

  describe('getAvailableModels', () => {
    it('returns models from available providers', async () => {
      const mockProvider = {
        id: 'available-test',
        name: 'Available Test',
        isAvailable: () => true,
        getModels: () => [
          { id: 'avail-model-1', name: 'Model 1' },
          { id: 'avail-model-2', name: 'Model 2' },
        ],
        generate: async () => null,
      }
      registerProvider(mockProvider)

      const models = await getAvailableModels()
      const ids = models.map(m => m.id)

      expect(ids).toContain('avail-model-1')
      expect(ids).toContain('avail-model-2')
    })

    it('includes providerId in returned models', async () => {
      const mockProvider = {
        id: 'provider-id-test',
        name: 'Provider ID Test',
        isAvailable: () => true,
        getModels: () => [{ id: 'pid-model', name: 'Model' }],
        generate: async () => null,
      }
      registerProvider(mockProvider)

      const models = await getAvailableModels()
      const model = models.find(m => m.id === 'pid-model')

      expect(model?.providerId).toBe('provider-id-test')
      expect(model?.available).toBe(true)
    })

    it('deduplicates models (first provider wins)', async () => {
      const provider1 = {
        id: 'first-provider',
        name: 'First',
        isAvailable: () => true,
        getModels: () => [{ id: 'dupe-model', name: 'From First' }],
        generate: async () => null,
      }
      const provider2 = {
        id: 'second-provider',
        name: 'Second',
        isAvailable: () => true,
        getModels: () => [{ id: 'dupe-model', name: 'From Second' }],
        generate: async () => null,
      }
      registerProvider(provider1)
      registerProvider(provider2)

      const models = await getAvailableModels()
      const dupes = models.filter(m => m.id === 'dupe-model')

      expect(dupes).toHaveLength(1)
      expect(dupes[0].providerId).toBe('first-provider')
    })

    it('skips unavailable providers', async () => {
      const mockProvider = {
        id: 'skip-unavailable',
        name: 'Skip',
        isAvailable: () => false,
        getModels: () => [{ id: 'skip-model', name: 'Skip' }],
        generate: async () => null,
      }
      registerProvider(mockProvider)

      const models = await getAvailableModels()
      const found = models.find(m => m.id === 'skip-model')

      expect(found).toBeUndefined()
    })
  })
})
