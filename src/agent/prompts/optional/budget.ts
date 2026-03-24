/**
 * Dynamic budget allocation for skill sections.
 *
 * Total SKILL.md target is ~500 lines. Overhead (frontmatter, header, search, footer)
 * is subtracted to get the available body budget, which is divided among enabled sections.
 * When a package has many releases, budgets scale up.
 */

const TOTAL_TARGET = 500
const DEFAULT_OVERHEAD = 30

/** Available body lines after overhead is subtracted */
function remainingLines(overheadLines?: number): number {
  return TOTAL_TARGET - (overheadLines ?? DEFAULT_OVERHEAD)
}

/** Scale max lines based on enabled section count and available remaining space. */
export function maxLines(min: number, max: number, sectionCount?: number, overheadLines?: number): number {
  const remaining = remainingLines(overheadLines)
  const scale = budgetScale(sectionCount)
  return Math.max(min, Math.min(Math.round(max * scale), remaining))
}

/** Scale item count based on enabled section count. */
export function maxItems(min: number, max: number, sectionCount?: number): number {
  const scale = budgetScale(sectionCount)
  return Math.max(min, Math.round(max * scale))
}

/**
 * Boost budget for high-churn packages based on API-level release density.
 * Combines major/minor release count with current minor version as a churn signal.
 *
 * @param significantReleases - Count of major/minor releases (patch releases excluded)
 * @param minorVersion - Current minor version number (e.g., 15 for v3.15.0)
 */
export function releaseBoost(significantReleases?: number, minorVersion?: number): number {
  const releaseSignal = !significantReleases ? 0 : significantReleases <= 5 ? 0 : significantReleases <= 15 ? 1 : 2
  const churnSignal = !minorVersion ? 0 : minorVersion <= 3 ? 0 : minorVersion <= 10 ? 1 : 2
  const combined = releaseSignal + churnSignal
  if (combined <= 0)
    return 1.0
  if (combined <= 2)
    return 1.3
  return 1.6
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
