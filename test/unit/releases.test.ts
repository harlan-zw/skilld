import type { GitHubRelease } from '../../src/sources/releases'
import { describe, expect, it } from 'vitest'
import { isChangelogRedirectPattern, isPrerelease, selectReleases } from '../../src/sources/releases'

function makeRelease(tag: string, markdown: string, prerelease = false): GitHubRelease {
  return { id: 1, tag, name: tag, prerelease, createdAt: '2024-01-01T00:00:00Z', publishedAt: '2024-01-01T00:00:00Z', markdown }
}

describe('selectReleases', () => {
  const releases = [
    makeRelease('v3.5.0', 'three five'),
    makeRelease('v3.4.2', 'three four two'),
    makeRelease('v3.4.1', 'three four one'),
    makeRelease('v3.4.0', 'three four zero'),
    makeRelease('v3.3.0', 'three three'),
  ]

  it('selects latest stable releases', () => {
    const selected = selectReleases(releases)
    expect(selected[0]?.tag).toBe('v3.5.0')
    expect(selected.length).toBe(5)
  })

  it('filters by installedVersion', () => {
    const selected = selectReleases(releases, undefined, '3.4.1')
    expect(selected[0]?.tag).toBe('v3.4.1')
    expect(selected[1]?.tag).toBe('v3.4.0')
    expect(selected[2]?.tag).toBe('v3.3.0')
    expect(selected.length).toBe(3)
  })

  it('filters by installedVersion (v-prefix)', () => {
    const selected = selectReleases(releases, undefined, 'v3.4.0')
    expect(selected[0]?.tag).toBe('v3.4.0')
    expect(selected[1]?.tag).toBe('v3.3.0')
    expect(selected.length).toBe(2)
  })

  it('handles monorepo tags', () => {
    const monoReleases = [
      makeRelease('pkg-a@1.1.0', 'a 1.1'),
      makeRelease('pkg-a@1.0.0', 'a 1.0'),
      makeRelease('pkg-b@2.0.0', 'b 2.0'),
    ]
    const selected = selectReleases(monoReleases, 'pkg-a')
    expect(selected.length).toBe(2)
    expect(selected[0]?.tag).toBe('pkg-a@1.1.0')
  })

  it('filters monorepo tags by version', () => {
    const monoReleases = [
      makeRelease('pkg-a@1.2.0', 'a 1.2'),
      makeRelease('pkg-a@1.1.0', 'a 1.1'),
      makeRelease('pkg-a@1.0.0', 'a 1.0'),
    ]
    const selected = selectReleases(monoReleases, 'pkg-a', '1.1.0')
    expect(selected.length).toBe(2)
    expect(selected[0]?.tag).toBe('pkg-a@1.1.0')
    expect(selected[1]?.tag).toBe('pkg-a@1.0.0')
  })

  it('includes prereleases when installed version is prerelease (same major.minor)', () => {
    const mixed = [
      makeRelease('v6.0.0-beta', 'beta notes', true),
      makeRelease('v6.0.0-rc.1', 'rc notes', true),
      makeRelease('v5.8.3', 'stable notes'),
      makeRelease('v5.8.2', 'stable notes'),
    ]
    const selected = selectReleases(mixed, undefined, '6.0.0-beta')
    expect(selected.map(r => r.tag)).toContain('v6.0.0-beta')
    expect(selected.map(r => r.tag)).toContain('v6.0.0-rc.1')
    expect(selected.map(r => r.tag)).toContain('v5.8.3')
    expect(selected.map(r => r.tag)).toContain('v5.8.2')
  })

  it('excludes prereleases from different major.minor', () => {
    const mixed = [
      makeRelease('v6.0.0-beta', 'beta notes', true),
      makeRelease('v6.1.0-beta', 'next minor beta', true),
      makeRelease('v5.9.0-beta', 'old beta', true),
      makeRelease('v5.8.3', 'stable notes'),
    ]
    const selected = selectReleases(mixed, undefined, '6.0.0-beta')
    expect(selected.map(r => r.tag)).toContain('v6.0.0-beta')
    expect(selected.map(r => r.tag)).not.toContain('v6.1.0-beta')
    expect(selected.map(r => r.tag)).not.toContain('v5.9.0-beta')
  })

  it('excludes all prereleases when installed version is stable', () => {
    const mixed = [
      makeRelease('v3.5.0-beta.1', 'beta', true),
      makeRelease('v3.5.0', 'stable'),
      makeRelease('v3.4.0', 'older stable'),
    ]
    const selected = selectReleases(mixed, undefined, '3.5.0')
    expect(selected.map(r => r.tag)).not.toContain('v3.5.0-beta.1')
    expect(selected.map(r => r.tag)).toContain('v3.5.0')
  })

  it('handles monorepo prerelease tags', () => {
    const monoReleases = [
      makeRelease('pkg-a@2.0.0-beta.1', 'beta', true),
      makeRelease('pkg-a@1.1.0', 'stable'),
      makeRelease('pkg-b@2.0.0-beta.1', 'other pkg beta', true),
    ]
    const selected = selectReleases(monoReleases, 'pkg-a', '2.0.0-beta.1')
    expect(selected.map(r => r.tag)).toContain('pkg-a@2.0.0-beta.1')
    expect(selected.map(r => r.tag)).toContain('pkg-a@1.1.0')
    expect(selected.map(r => r.tag)).not.toContain('pkg-b@2.0.0-beta.1')
  })
})

describe('isPrerelease', () => {
  it('detects prerelease versions', () => {
    expect(isPrerelease('6.0.0-beta')).toBe(true)
    expect(isPrerelease('6.0.0-beta.1')).toBe(true)
    expect(isPrerelease('6.0.0-rc.1')).toBe(true)
    expect(isPrerelease('1.0.0-alpha')).toBe(true)
    expect(isPrerelease('v6.0.0-beta')).toBe(true)
    expect(isPrerelease('1.2.3-dev.20260214')).toBe(true)
  })

  it('rejects stable versions', () => {
    expect(isPrerelease('6.0.0')).toBe(false)
    expect(isPrerelease('v1.2.3')).toBe(false)
    expect(isPrerelease('latest')).toBe(false)
    expect(isPrerelease('next')).toBe(false)
  })
})

describe('isChangelogRedirectPattern', () => {
  it('detects Vue-style changelog redirects', () => {
    const releases = [
      makeRelease('v3.5.8', 'For stable releases, please refer to [CHANGELOG.md](https://github.com/vuejs/core/blob/main/CHANGELOG.md) for details.\nFor pre-releases, please refer to [CHANGELOG.md](https://github.com/vuejs/core/blob/minor/CHANGELOG.md) of the `minor` branch.'),
      makeRelease('v3.5.7', 'For stable releases, please refer to [CHANGELOG.md](https://github.com/vuejs/core/blob/main/CHANGELOG.md) for details.'),
      makeRelease('v3.5.6', 'For stable releases, please refer to CHANGELOG.md for details.'),
    ]
    expect(isChangelogRedirectPattern(releases)).toBe(true)
  })

  it('detects Vite-style changelog redirects', () => {
    const releases = [
      makeRelease('v7.3.1', 'Please refer to [CHANGELOG.md](https://github.com/vitejs/vite/blob/v7.3.1/packages/vite/CHANGELOG.md) for details.'),
      makeRelease('v7.3.0', 'Please refer to [CHANGELOG.md](https://github.com/vitejs/vite/blob/v7.3.0/packages/vite/CHANGELOG.md) for details.'),
      makeRelease('v7.2.7', 'Please refer to [CHANGELOG.md](https://github.com/vitejs/vite/blob/v7.2.7/packages/vite/CHANGELOG.md) for details.'),
    ]
    expect(isChangelogRedirectPattern(releases)).toBe(true)
  })

  it('rejects real release notes', () => {
    const releases = [
      makeRelease('v4.3.1', '## What\'s Changed\n\n### Bug Fixes\n\n- fix(nuxt): resolve composable imports correctly (#12345)\n- fix(kit): handle edge case in module resolution\n\n### Features\n\n- feat: add new `useAsyncData` option for cache control\n\n**Full Changelog**: https://github.com/nuxt/nuxt/compare/v4.3.0...v4.3.1'),
      makeRelease('v4.3.0', '## What\'s Changed\n\n### Breaking Changes\n\n- The default rendering mode has changed\n\n### Features\n\n- New routing system with improved type safety\n- Server components improvements\n\n**Full Changelog**: https://github.com/nuxt/nuxt/compare/v4.2.0...v4.3.0'),
    ]
    expect(isChangelogRedirectPattern(releases)).toBe(false)
  })

  it('rejects releases with long markdown even if they mention changelog', () => {
    const longContent = `See CHANGELOG.md for full details.\n\n${'- fix: something important\n'.repeat(50)}`
    const releases = [
      makeRelease('v1.0.0', longContent),
      makeRelease('v0.9.0', longContent),
    ]
    expect(isChangelogRedirectPattern(releases)).toBe(false)
  })

  it('returns false for empty releases', () => {
    expect(isChangelogRedirectPattern([])).toBe(false)
  })

  it('rejects if any sampled release has real content', () => {
    const releases = [
      makeRelease('v2.0.0', 'See CHANGELOG.md'),
      makeRelease('v1.9.0', '## Features\n\n- Added new API endpoint\n- Improved performance by 50%\n- New configuration options'),
      makeRelease('v1.8.0', 'See CHANGELOG.md'),
    ]
    expect(isChangelogRedirectPattern(releases)).toBe(false)
  })

  it('only samples first 3 releases', () => {
    const releases = [
      makeRelease('v3.0.0', 'Refer to CHANGELOG.md'),
      makeRelease('v2.9.0', 'Refer to CHANGELOG.md'),
      makeRelease('v2.8.0', 'Refer to CHANGELOG.md'),
      // 4th release has real content but should not be sampled
      makeRelease('v2.7.0', `## Big release with lots of features\n${'content '.repeat(100)}`),
    ]
    expect(isChangelogRedirectPattern(releases)).toBe(true)
  })

  it('handles empty markdown body', () => {
    const releases = [
      makeRelease('v1.0.0', ''),
      makeRelease('v0.9.0', ''),
    ]
    // Empty body doesn't mention changelog
    expect(isChangelogRedirectPattern(releases)).toBe(false)
  })
})
