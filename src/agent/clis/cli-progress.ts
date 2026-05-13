import type { StreamProgress } from './types.ts'
import { styleText } from 'node:util'
import { TOOL_NAMES } from './types.ts'

const STATIC_REGEX_1 = /^\[(?:starting|retrying|cached)/
const STATIC_REGEX_2 = /^\[([^:[\]]+)(?::\s(.+))?\]$/
const STATIC_REGEX_3 = /skilld search\s+"([^"]+)"/

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
      log.message(`${msg} ${styleText('gray', `(+${repeatCount})`)}`)
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
      const prefix = section ? `${styleText('gray', `[${section}]`)} ` : ''
      // Count bullet items in accumulated text for meaningful progress
      const items = text ? (text.match(/^- (?:BREAKING|DEPRECATED|NEW|CHANGED|REMOVED|Use |Do |Set |Add |Avoid |Always |Never |Prefer |Check |Ensure )/gm)?.length ?? 0) : 0
      emit(items > 0 ? `${prefix}Writing... ${styleText('gray', `(${items} items)`)}` : `${prefix}Writing...`)
      return
    }
    if (type !== 'reasoning' || !chunk.startsWith('['))
      return

    // Handle status messages like [starting...], [retrying...], [cached]
    if (STATIC_REGEX_1.test(chunk)) {
      const prefix = section ? `${styleText('gray', `[${section}]`)} ` : ''
      emit(`${prefix}${chunk.slice(1, -1)}`)
      return
    }

    // Parse individual tool names and hints from "[Read: path]" or "[Read, Glob: path1, path2]"
    const match = chunk.match(STATIC_REGEX_2)
    if (!match)
      return

    const names = match[1]!.split(',').map(n => n.trim())
    const hints = match[2]?.split(',').map(h => h.trim()) ?? []

    for (let i = 0; i < names.length; i++) {
      const rawName = names[i]!
      const hint = hints[i] ?? hints[0] ?? ''
      const verb = TOOL_NAMES[rawName]?.verb ?? rawName
      const prefix = section ? `${styleText('gray', `[${section}]`)} ` : ''

      if ((rawName === 'Bash' || rawName === 'run_shell_command') && hint) {
        const searchMatch = hint.match(STATIC_REGEX_3)
        if (searchMatch) {
          emit(`${prefix}Searching ${styleText('cyan', `"${searchMatch[1]}"`)}`)
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
        emit(`${prefix}${verb} ${styleText('gray', path)}`)
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
