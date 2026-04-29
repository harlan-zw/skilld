import { describe, expect, it, vi } from 'vitest'
import { todayIsoDate } from '../../src/core/formatting'

describe('formatting', () => {
  it('formats the current UTC day as YYYY-MM-DD', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-28T23:59:59.000Z'))

    expect(todayIsoDate()).toBe('2026-04-28')

    vi.useRealTimers()
  })
})
