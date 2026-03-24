import { describe, expect, it } from 'vitest'
import { classifyIssue, labelMatchesAny } from '../../src/sources/issues.ts'

describe('labelMatchesAny', () => {
  const BUG_KEYWORDS = new Set(['bug', 'defect', 'regression', 'error', 'crash', 'fix', 'confirmed', 'verified'])

  it('matches exact labels', () => {
    expect(labelMatchesAny('bug', BUG_KEYWORDS)).toBe(true)
    expect(labelMatchesAny('fix', BUG_KEYWORDS)).toBe(true)
  })

  it('does not match substrings', () => {
    expect(labelMatchesAny('debug', BUG_KEYWORDS)).toBe(false)
    expect(labelMatchesAny('debugging', BUG_KEYWORDS)).toBe(false)
    expect(labelMatchesAny('prefix', BUG_KEYWORDS)).toBe(false)
    expect(labelMatchesAny('suffix', BUG_KEYWORDS)).toBe(false)
    expect(labelMatchesAny('terraform', BUG_KEYWORDS)).toBe(false)
  })

  it('matches emoji-prefixed labels', () => {
    expect(labelMatchesAny(':lady_beetle: bug', BUG_KEYWORDS)).toBe(true)
    expect(labelMatchesAny(':bug: report', BUG_KEYWORDS)).toBe(true)
  })

  it('matches hyphen-separated labels', () => {
    expect(labelMatchesAny('confirmed-bug', BUG_KEYWORDS)).toBe(true)
    expect(labelMatchesAny('bug-report', BUG_KEYWORDS)).toBe(true)
  })

  it('is case-sensitive (callers must normalize)', () => {
    expect(labelMatchesAny('BUG', BUG_KEYWORDS)).toBe(false)
    expect(labelMatchesAny('Bug', BUG_KEYWORDS)).toBe(false)
  })

  it('does not match unrelated labels', () => {
    expect(labelMatchesAny('enhancement', BUG_KEYWORDS)).toBe(false)
    expect(labelMatchesAny('question', BUG_KEYWORDS)).toBe(false)
  })

  it('handles doc vs docker correctly', () => {
    const DOCS_KEYWORDS = new Set(['documentation', 'docs', 'doc', 'typo'])
    expect(labelMatchesAny('doc', DOCS_KEYWORDS)).toBe(true)
    expect(labelMatchesAny('docker', DOCS_KEYWORDS)).toBe(false)
    expect(labelMatchesAny('dockerfile', DOCS_KEYWORDS)).toBe(false)
  })

  it('handles help vs helpful correctly', () => {
    const QUESTION_KEYWORDS = new Set(['question', 'help wanted', 'support', 'usage', 'how-to', 'help', 'assistance'])
    expect(labelMatchesAny('help', QUESTION_KEYWORDS)).toBe(true)
    expect(labelMatchesAny('helpful', QUESTION_KEYWORDS)).toBe(false)
    expect(labelMatchesAny('help wanted', QUESTION_KEYWORDS)).toBe(true)
  })

  it('handles noise labels with substrings', () => {
    const NOISE_KEYWORDS = new Set(['duplicate', 'stale', 'invalid', 'wontfix', 'spam'])
    expect(labelMatchesAny('stale', NOISE_KEYWORDS)).toBe(true)
    expect(labelMatchesAny('not-stale', NOISE_KEYWORDS)).toBe(true)
    expect(labelMatchesAny('anti-spam', NOISE_KEYWORDS)).toBe(true)
    expect(labelMatchesAny('spammer', NOISE_KEYWORDS)).toBe(false)
  })
})

describe('classifyIssue', () => {
  it('classifies bug labels', () => {
    expect(classifyIssue(['bug'])).toBe('bug')
    expect(classifyIssue([':lady_beetle: bug'])).toBe('bug')
  })

  it('does not misclassify debug as bug', () => {
    expect(classifyIssue(['debug'])).toBe('other')
  })

  it('does not misclassify docker as docs', () => {
    expect(classifyIssue(['docker'])).toBe('other')
  })

  it('classifies question labels', () => {
    expect(classifyIssue(['question'])).toBe('question')
    expect(classifyIssue(['help wanted'])).toBe('question')
  })

  it('does not misclassify helpful as question', () => {
    expect(classifyIssue(['helpful'])).toBe('other')
  })

  it('bug takes priority over question', () => {
    expect(classifyIssue(['bug', 'question'])).toBe('bug')
  })
})
