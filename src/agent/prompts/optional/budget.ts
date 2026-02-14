/**
 * Dynamic budget allocation for skill sections.
 *
 * Total SKILL.md body should stay under ~300 lines (≈5,000 words per Agent Skills guide).
 * When more sections are enabled, each gets proportionally less space.
 */

/** Scale max lines based on enabled section count. Solo sections get full budget, 4 sections ~60%. */
export function maxLines(min: number, max: number, sectionCount?: number): number {
  const scale = budgetScale(sectionCount)
  return Math.max(min, Math.round(max * scale))
}

/** Scale item count based on enabled section count. */
export function maxItems(min: number, max: number, sectionCount?: number): number {
  const scale = budgetScale(sectionCount)
  return Math.max(min, Math.round(max * scale))
}

function budgetScale(sectionCount?: number): number {
  if (!sectionCount || sectionCount <= 1)
    return 1.0
  if (sectionCount === 2)
    return 0.85
  if (sectionCount === 3)
    return 0.7
  return 0.6 // 4+ sections
}
