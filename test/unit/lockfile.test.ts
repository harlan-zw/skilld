import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('node:fs', async () => {
  const actual = await vi.importActual<typeof import('node:fs')>('node:fs')
  return {
    ...actual,
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    unlinkSync: vi.fn(),
  }
})

describe('core/lockfile', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('parsePackages', () => {
    it('returns empty array for undefined', async () => {
      const { parsePackages } = await import('../../src/core/lockfile')
      expect(parsePackages(undefined)).toEqual([])
    })

    it('returns empty array for empty string', async () => {
      const { parsePackages } = await import('../../src/core/lockfile')
      expect(parsePackages('')).toEqual([])
    })

    it('parses single package', async () => {
      const { parsePackages } = await import('../../src/core/lockfile')
      expect(parsePackages('vue@3.5.0')).toEqual([
        { name: 'vue', version: '3.5.0' },
      ])
    })

    it('parses multiple packages', async () => {
      const { parsePackages } = await import('../../src/core/lockfile')
      expect(parsePackages('vue@3.5.0, @vue/reactivity@3.5.0')).toEqual([
        { name: 'vue', version: '3.5.0' },
        { name: '@vue/reactivity', version: '3.5.0' },
      ])
    })

    it('handles scoped packages correctly (last @ is version separator)', async () => {
      const { parsePackages } = await import('../../src/core/lockfile')
      const result = parsePackages('@nuxt/ui@3.0.0')
      expect(result).toEqual([{ name: '@nuxt/ui', version: '3.0.0' }])
    })
  })

  describe('serializePackages', () => {
    it('serializes single package', async () => {
      const { serializePackages } = await import('../../src/core/lockfile')
      expect(serializePackages([{ name: 'vue', version: '3.5.0' }])).toBe('vue@3.5.0')
    })

    it('serializes multiple packages', async () => {
      const { serializePackages } = await import('../../src/core/lockfile')
      expect(serializePackages([
        { name: 'vue', version: '3.5.0' },
        { name: '@vue/reactivity', version: '3.5.0' },
      ])).toBe('vue@3.5.0, @vue/reactivity@3.5.0')
    })

    it('roundtrips with parsePackages', async () => {
      const { parsePackages, serializePackages } = await import('../../src/core/lockfile')
      const original = [
        { name: 'vue', version: '3.5.0' },
        { name: '@vue/reactivity', version: '3.5.0' },
      ]
      expect(parsePackages(serializePackages(original))).toEqual(original)
    })
  })

  describe('writeLock merge', () => {
    it('merges new package into existing skill entry', async () => {
      const { existsSync, readFileSync, writeFileSync } = await import('node:fs')
      const { writeLock } = await import('../../src/core/lockfile')

      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(
        'skills:\n'
        + '  vuejs-core:\n'
        + '    packageName: vue\n'
        + '    version: "3.5.0"\n'
        + '    repo: vuejs/core\n'
        + '    source: docs\n'
        + '    generator: skilld\n',
      )

      writeLock('/skills', 'vuejs-core', {
        packageName: '@vue/reactivity',
        version: '3.5.0',
        syncedAt: '2026-02-09',
        generator: 'skilld',
      })

      const written = vi.mocked(writeFileSync).mock.calls[0]![1] as string
      // Should keep vue as primary (first)
      expect(written).toContain('packageName: vue')
      // Should have packages field with both
      expect(written).toContain('vue@3.5.0')
      expect(written).toContain('@vue/reactivity@3.5.0')
      // Should preserve repo from existing
      expect(written).toContain('repo: vuejs/core')
    })

    it('updates version of existing package in packages list', async () => {
      const { existsSync, readFileSync, writeFileSync } = await import('node:fs')
      const { writeLock } = await import('../../src/core/lockfile')

      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(
        'skills:\n'
        + '  vuejs-core:\n'
        + '    packageName: vue\n'
        + '    version: "3.4.0"\n'
        + '    packages: "vue@3.4.0, @vue/reactivity@3.4.0"\n'
        + '    generator: skilld\n',
      )

      writeLock('/skills', 'vuejs-core', {
        packageName: 'vue',
        version: '3.5.0',
        syncedAt: '2026-02-09',
        generator: 'skilld',
      })

      const written = vi.mocked(writeFileSync).mock.calls[0]![1] as string
      expect(written).toContain('vue@3.5.0')
      // Reactivity should still be at old version since we only updated vue
      expect(written).toContain('@vue/reactivity@3.4.0')
    })

    it('does not merge when same packageName', async () => {
      const { existsSync, readFileSync, writeFileSync } = await import('node:fs')
      const { writeLock } = await import('../../src/core/lockfile')

      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(
        'skills:\n'
        + '  vue:\n'
        + '    packageName: vue\n'
        + '    version: "3.4.0"\n',
      )

      writeLock('/skills', 'vue', {
        packageName: 'vue',
        version: '3.5.0',
        syncedAt: '2026-02-09',
        generator: 'skilld',
      })

      const written = vi.mocked(writeFileSync).mock.calls[0]![1] as string
      expect(written).toContain('version: 3.5.0')
      // packages should contain just vue@3.5.0 (@ triggers yaml quoting)
      expect(written).toContain('vue@3.5.0')
    })
  })

  describe('readLock parses packages field', () => {
    it('reads packages field from lockfile', async () => {
      const { existsSync, readFileSync } = await import('node:fs')
      const { readLock } = await import('../../src/core/lockfile')

      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(
        'skills:\n'
        + '  vuejs-core:\n'
        + '    packageName: vue\n'
        + '    version: "3.5.0"\n'
        + '    packages: "vue@3.5.0, @vue/reactivity@3.5.0"\n',
      )

      const lock = readLock('/skills')
      expect(lock?.skills['vuejs-core']?.packages).toBe('vue@3.5.0, @vue/reactivity@3.5.0')
    })
  })

  describe('git skill fields (path, ref, commit)', () => {
    it('readLock parses git fields from lockfile', async () => {
      const { existsSync, readFileSync } = await import('node:fs')
      const { readLock } = await import('../../src/core/lockfile')

      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(
        'skills:\n'
        + '  web-design-guidelines:\n'
        + '    source: github\n'
        + '    repo: vercel-labs/agent-skills\n'
        + '    path: skills/web-design-guidelines\n'
        + '    ref: main\n'
        + '    commit: abc123def\n'
        + '    generator: external\n',
      )

      const lock = readLock('/skills')
      const skill = lock?.skills['web-design-guidelines']
      expect(skill?.source).toBe('github')
      expect(skill?.repo).toBe('vercel-labs/agent-skills')
      expect(skill?.path).toBe('skills/web-design-guidelines')
      expect(skill?.ref).toBe('main')
      expect(skill?.commit).toBe('abc123def')
      expect(skill?.generator).toBe('external')
    })

    it('writeLock serializes git fields', async () => {
      const { existsSync, writeFileSync } = await import('node:fs')
      const { writeLock } = await import('../../src/core/lockfile')

      vi.mocked(existsSync).mockReturnValue(false)

      writeLock('/skills', 'web-design-guidelines', {
        source: 'github',
        repo: 'vercel-labs/agent-skills',
        path: 'skills/web-design-guidelines',
        ref: 'main',
        commit: 'abc123def456',
        syncedAt: '2026-02-10',
        generator: 'external',
      })

      const written = vi.mocked(writeFileSync).mock.calls[0]![1] as string
      expect(written).toContain('source: github')
      expect(written).toContain('repo: vercel-labs/agent-skills')
      expect(written).toContain('path: skills/web-design-guidelines')
      expect(written).toContain('ref: main')
      expect(written).toContain('commit: abc123def456')
      expect(written).toContain('generator: external')
    })

    it('writeLock omits git fields when not set', async () => {
      const { existsSync, writeFileSync } = await import('node:fs')
      const { writeLock } = await import('../../src/core/lockfile')

      vi.mocked(existsSync).mockReturnValue(false)

      writeLock('/skills', 'vue', {
        packageName: 'vue',
        version: '3.5.0',
        source: 'docs',
        generator: 'skilld',
      })

      const written = vi.mocked(writeFileSync).mock.calls[0]![1] as string
      expect(written).not.toContain('path:')
      expect(written).not.toContain('ref:')
      expect(written).not.toContain('commit:')
    })
  })
})
