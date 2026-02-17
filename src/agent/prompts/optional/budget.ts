/**
 * Dynamic budget allocation for skill sections.
 *
 * Total SKILL.md body should stay under ~300 lines (≈5,000 words per Agent Skills guide).
 * When more sections are enabled, each gets proportionally less space.
 * When a package has many releases, API changes budget scales up to capture more churn.
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
