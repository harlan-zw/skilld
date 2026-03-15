import { describe, expect, it } from 'vitest'
import { isOutdated } from '../../src/core/skills.ts'
import type { SkillEntry } from '../../src/core/skills.ts'

function makeSkill(version: string | undefined): SkillEntry {
  return {
    name: 'test-pkg',
    dir: '/test',
    agent: 'claude-code',
    info: version ? { version, generator: 'skilld', packageName: 'test-pkg' } : null,
    scope: 'local',
  }
}

describe('isOutdated', () => {
  it('returns true when skill has no version', () => {
    expect(isOutdated(makeSkill(undefined), '1.0.0')).toBe(true)
  })

  it('returns true when dep version is newer', () => {
    expect(isOutdated(makeSkill('1.0.0'), '2.0.0')).toBe(true)
  })

  it('returns false when versions match', () => {
    expect(isOutdated(makeSkill('1.0.0'), '1.0.0')).toBe(false)
  })

  it('returns false when skill version is newer', () => {
    expect(isOutdated(makeSkill('2.0.0'), '1.0.0')).toBe(false)
  })

  it('strips ^ and ~ prefixes from dep version', () => {
    expect(isOutdated(makeSkill('1.0.0'), '^1.0.0')).toBe(false)
    expect(isOutdated(makeSkill('1.0.0'), '~2.0.0')).toBe(true)
  })

  it('returns false for wildcard * version from catalog:/workspace:', () => {
    expect(isOutdated(makeSkill('1.0.0'), '*')).toBe(false)
  })

  it('returns false for non-semver version strings', () => {
    expect(isOutdated(makeSkill('1.0.0'), 'latest')).toBe(false)
    expect(isOutdated(makeSkill('1.0.0'), 'next')).toBe(false)
  })
})
