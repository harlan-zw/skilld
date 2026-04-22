import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('ofetch', () => ({
  ofetch: vi.fn(),
}))

describe('registry client', () => {
  let originalUrl: string | undefined

  beforeEach(() => {
    originalUrl = process.env.SKILLD_REGISTRY_URL
    vi.resetAllMocks()
  })

  afterEach(() => {
    if (originalUrl === undefined)
      delete process.env.SKILLD_REGISTRY_URL
    else
      process.env.SKILLD_REGISTRY_URL = originalUrl
  })

  it('fetchRegistrySkill uses default base when env unset', async () => {
    delete process.env.SKILLD_REGISTRY_URL
    const { ofetch } = await import('ofetch')
    vi.mocked(ofetch).mockResolvedValueOnce({ name: 'vue-skilld', packageName: 'vue', version: '3.5.0', content: '# vue' })

    const { fetchRegistrySkill } = await import('../../src/registry/client')
    await fetchRegistrySkill('vue')

    expect(ofetch).toHaveBeenCalledWith('https://skilld.dev/api/skills/vue')
  })

  it('fetchRegistrySkill respects SKILLD_REGISTRY_URL override', async () => {
    process.env.SKILLD_REGISTRY_URL = 'http://localhost:3000/api'
    const { ofetch } = await import('ofetch')
    vi.mocked(ofetch).mockResolvedValueOnce({ name: 'vue-skilld', packageName: 'vue', version: '3.5.0', content: '# vue' })

    const { fetchRegistrySkill } = await import('../../src/registry/client')
    await fetchRegistrySkill('vue')

    expect(ofetch).toHaveBeenCalledWith('http://localhost:3000/api/skills/vue')
  })

  it('strips trailing slash from override', async () => {
    process.env.SKILLD_REGISTRY_URL = 'http://localhost:3000/api/'
    const { ofetch } = await import('ofetch')
    vi.mocked(ofetch).mockResolvedValueOnce({ name: 'vue-skilld', packageName: 'vue', version: '3.5.0', content: '# vue' })

    const { fetchRegistrySkill } = await import('../../src/registry/client')
    await fetchRegistrySkill('vue')

    expect(ofetch).toHaveBeenCalledWith('http://localhost:3000/api/skills/vue')
  })

  it('returns null when registry fetch fails', async () => {
    const { ofetch } = await import('ofetch')
    vi.mocked(ofetch).mockRejectedValueOnce(new Error('404'))

    const { fetchRegistrySkill } = await import('../../src/registry/client')
    expect(await fetchRegistrySkill('nonexistent')).toBeNull()
  })

  it('encodes scoped package names', async () => {
    delete process.env.SKILLD_REGISTRY_URL
    const { ofetch } = await import('ofetch')
    vi.mocked(ofetch).mockResolvedValueOnce({ name: 'nuxt-ui-skilld', packageName: '@nuxt/ui', version: '3.0.0', content: '# nuxt/ui' })

    const { fetchRegistrySkill } = await import('../../src/registry/client')
    await fetchRegistrySkill('@nuxt/ui')

    expect(ofetch).toHaveBeenCalledWith('https://skilld.dev/api/skills/%40nuxt%2Fui')
  })
})
