import type { StreamProgress } from './types.ts'
import { TOOL_NAMES } from './types.ts'

interface ToolProgressLog {
  message: (msg: string) => void
}

/** Create a progress callback that emits one line per tool call, Claude Code style */
export function createToolProgress(log: ToolProgressLog): (progress: StreamProgress) => void {
  let lastMsg = ''
  let repeatCount = 0
  /** Per-section timestamp of last "Writing..." emission — throttles text_delta spam */
  const lastTextEmit = new Map<string, number>()
  const TEXT_THROTTLE_MS = 2000

  function emit(msg: string) {
    if (msg === lastMsg) {
      repeatCount++
      log.message(`${msg} \x1B[90m(+${repeatCount})\x1B[0m`)
    }
    else {
      lastMsg = msg
      repeatCount = 0
      log.message(msg)
    }
  }

  return ({ type, chunk, text, section }) => {
    if (type === 'text') {
      const key = section ?? ''
      const now = Date.now()
      const last = lastTextEmit.get(key) ?? 0
      if (now - last < TEXT_THROTTLE_MS)
        return
      lastTextEmit.set(key, now)
      const prefix = section ? `\x1B[90m[${section}]\x1B[0m ` : ''
      // Count bullet items in accumulated text for meaningful progress
      const items = text ? (text.match(/^- (?:BREAKING|DEPRECATED|NEW|CHANGED|REMOVED|Use |Do |Set |Add |Avoid |Always |Never |Prefer |Check |Ensure )/gm)?.length ?? 0) : 0
      emit(items > 0 ? `${prefix}Writing... \x1B[90m(${items} items)\x1B[0m` : `${prefix}Writing...`)
      return
    }
    if (type !== 'reasoning' || !chunk.startsWith('['))
      return

    // Handle status messages like [starting...], [retrying...], [cached]
    if (/^\[(?:starting|retrying|cached)/.test(chunk)) {
      const prefix = section ? `\x1B[90m[${section}]\x1B[0m ` : ''
      emit(`${prefix}${chunk.slice(1, -1)}`)
      return
    }

    // Parse individual tool names and hints from "[Read: path]" or "[Read, Glob: path1, path2]"
    const match = chunk.match(/^\[([^:[\]]+)(?::\s(.+))?\]$/)
    if (!match)
      return

    const names = match[1]!.split(',').map(n => n.trim())
    const hints = match[2]?.split(',').map(h => h.trim()) ?? []

    for (let i = 0; i < names.length; i++) {
      const rawName = names[i]!
      const hint = hints[i] ?? hints[0] ?? ''
      const verb = TOOL_NAMES[rawName]?.verb ?? rawName
      const prefix = section ? `\x1B[90m[${section}]\x1B[0m ` : ''

      if ((rawName === 'Bash' || rawName === 'run_shell_command') && hint) {
        const searchMatch = hint.match(/skilld search\s+"([^"]+)"/)
        if (searchMatch) {
          emit(`${prefix}Searching \x1B[36m"${searchMatch[1]}"\x1B[0m`)
        }
        else if (hint.includes('skilld validate')) {
          emit(`${prefix}Validating...`)
        }
        else {
          const shortened = shortenCommand(hint)
          emit(`${prefix}Running ${shortened.length > 50 ? `${shortened.slice(0, 47)}...` : shortened}`)
        }
      }
      else {
        const path = shortenPath(hint || '...')
        emit(`${prefix}${verb} \x1B[90m${path}\x1B[0m`)
      }
    }
  }
}

/** Shorten absolute paths for display: /home/user/project/.claude/skills/vue/SKILL.md → .claude/.../SKILL.md */
function shortenPath(p: string): string {
  const refIdx = p.indexOf('.skilld/')
  if (refIdx !== -1)
    return p.slice(refIdx + '.skilld/'.length)
  // Keep just filename for other paths
  const parts = p.split('/')
  return parts.length > 2 ? `.../${parts.slice(-2).join('/')}` : p
}

/** Replace absolute paths in a command string with shortened versions */
function shortenCommand(cmd: string): string {
  return cmd.replace(/\/[^\s"']+/g, (match) => {
    // Only shorten paths that look like they're inside a project
    if (match.includes('.claude/') || match.includes('.skilld/') || match.includes('node_modules/'))
      return `.../${match.split('/').slice(-2).join('/')}`
    return match
  })
}
