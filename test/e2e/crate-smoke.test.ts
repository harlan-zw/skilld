import { describe, expect, it } from 'vitest'
import { resolveCrateDocsWithAttempts } from '../../src/sources'

describe('e2e crate smoke', () => {
  it('returns crate resolution result for serde', async () => {
    const result = await resolveCrateDocsWithAttempts('serde')

    if (result.package) {
      expect(result.package.name).toBe('serde')
      expect(result.package.version).toBeTruthy()
      expect(result.package.docsUrl).toMatch(/^https:\/\/docs\.rs\/serde(?:\/|$)/)
      expect(result.attempts.some(a => a.source === 'crates' && a.status === 'success')).toBe(true)
      return
    }

    expect(result.attempts.some(a => a.source === 'crates')).toBe(true)
    expect(result.attempts.some(a => a.status === 'not-found' || a.status === 'error')).toBe(true)
  }, 120_000)
})
