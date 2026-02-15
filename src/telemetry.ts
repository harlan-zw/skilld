/**
 * Anonymous telemetry — fire-and-forget GET to add-skill.vercel.sh/t
 *
 * Opt-out: set DISABLE_TELEMETRY=1 or DO_NOT_TRACK=1
 * Auto-disabled in CI environments.
 */

import { isCI } from 'std-env'

const TELEMETRY_URL = 'https://add-skill.vercel.sh/t'
const SKILLS_VERSION = '1.3.9'

interface InstallTelemetryData {
  event: 'install'
  source: string
  skills: string
  agents: string
  global?: '1'
  skillFiles?: string
  sourceType?: string
}

interface RemoveTelemetryData {
  event: 'remove'
  source?: string
  skills: string
  agents: string
  global?: '1'
  sourceType?: string
}

type TelemetryData
  = | InstallTelemetryData
    | RemoveTelemetryData

function isEnabled(): boolean {
  return !process.env.DISABLE_TELEMETRY && !process.env.DO_NOT_TRACK
}

export function track(data: TelemetryData): void {
  if (!isEnabled())
    return

  try {
    const params = new URLSearchParams()

    params.set('v', SKILLS_VERSION)

    if (isCI)
      params.set('ci', '1')

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null)
        params.set(key, String(value))
    }

    // Fire and forget
    fetch(`${TELEMETRY_URL}?${params.toString()}`).catch(() => {})
  }
  catch {
    // Telemetry should never break the CLI
  }
}
