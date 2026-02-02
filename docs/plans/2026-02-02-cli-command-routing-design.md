# CLI Command Routing Design

## Goal

Restructure skilld CLI to support multiple operations (sync, list, remove, search) with smart defaults based on project state, while reducing duplicate code.

## Current Problems

- 780-line `cli.ts` with all logic in one file
- Agent/skills directory iteration duplicated across list, sync, picker
- Lock file handling scattered throughout
- No way to detect if skills are up-to-date vs package.json

## Design

### Smart Default Behavior

```
skilld (no args)
├── missing or outdated skills? → sync picker (pre-select those)
└── everything synced? → prompt: sync more / remove / search / list
```

### Directory Structure

```
src/
  cli.ts                    # Router (~60 lines)
  commands/
    sync.ts                 # Sync/install skills
    list.ts                 # Show installed skills
    remove.ts               # Delete skills
    search.ts               # Query docs index
  core/
    skills.ts               # iterateSkills(), getProjectState()
    lockfile.ts             # readLock(), writeLock()
    formatting.ts           # formatSkillLine(), formatSnippet()
```

### Core Module: `src/core/skills.ts`

```ts
interface SkillEntry {
  name: string
  dir: string
  agent: AgentType
  info: SkillInfo | null
  scope: 'local' | 'global'
}

interface ProjectState {
  skills: SkillEntry[]
  deps: Map<string, string>  // package.json deps
  missing: string[]          // deps without skills
  outdated: SkillEntry[]     // version < dep version
  synced: SkillEntry[]       // up to date
}

function* iterateSkills(opts: {
  scope?: 'local' | 'global' | 'all'
  agents?: AgentType[]
}): Generator<SkillEntry>

function getProjectState(cwd: string): ProjectState
function isOutdated(skill: SkillEntry, depVersion: string): boolean
function getSkillsDir(agent: AgentType, scope: 'local' | 'global'): string
```

### Core Module: `src/core/lockfile.ts`

Extract existing lock logic:

```ts
function readLock(skillsDir: string): SkilldLock | null
function writeLock(skillsDir: string, skillName: string, info: SkillInfo): void
function removeLockEntry(skillsDir: string, skillName: string): void
```

### Core Module: `src/core/formatting.ts`

```ts
function formatSkillLine(skill: SkillEntry): string
function formatSkillStatus(state: ProjectState): void
function formatSnippet(r: SearchSnippet): void
```

### Router: `src/cli.ts`

```ts
const main = defineCommand({
  meta: { name: 'skilld', description: '...' },
  args: {
    package: { type: 'positional', required: false },
    query: { type: 'string', alias: 'q' },
    global: { type: 'boolean', alias: 'g', default: false },
    agent: { type: 'string', alias: 'a' },
    yes: { type: 'boolean', alias: 'y', default: false },
  },
  async run({ args }) {
    const cwd = process.cwd()

    // Explicit operations
    if (args.query) return searchCommand(args.query)
    if (args.package === 'list') return listCommand(getProjectState(cwd), args)
    if (args.package === 'remove') return removeCommand(getProjectState(cwd), args)

    // Explicit package → sync
    if (args.package) {
      return syncCommand(getProjectState(cwd), { packages: [args.package], ...args })
    }

    // Smart default
    const state = getProjectState(cwd)

    if (state.missing.length || state.outdated.length) {
      return syncCommand(state, args)
    }

    // Everything synced → prompt
    const action = await p.select({
      message: `${state.synced.length} skills synced`,
      options: [
        { label: 'Sync more packages', value: 'sync' },
        { label: 'Remove skills', value: 'remove' },
        { label: 'Search docs', value: 'search' },
        { label: 'List installed', value: 'list' },
      ],
    })

    switch (action) {
      case 'sync': return syncCommand(state, args)
      case 'remove': return removeCommand(state, args)
      case 'search': /* prompt for query */ break
      case 'list': return listCommand(state, args)
    }
  },
})
```

### Commands

**`commands/sync.ts`**

```ts
interface SyncOptions {
  packages?: string[]
  global: boolean
  agent: AgentType
  model: OptimizeModel
  yes: boolean
}

async function syncCommand(state: ProjectState, opts: SyncOptions): Promise<void>

// Internal helpers (moved from cli.ts)
async function interactivePicker(state: ProjectState): Promise<string[] | null>
async function selectModel(skipPrompt: boolean): Promise<OptimizeModel | null>
async function syncSinglePackage(pkg: string, config: SyncConfig): Promise<void>
```

**`commands/list.ts`**

```ts
function listCommand(state: ProjectState, opts: { global?: boolean }): void
// Uses state.skills, no fs iteration needed
```

**`commands/remove.ts`**

```ts
async function removeCommand(state: ProjectState, opts: {
  packages?: string[]
  yes: boolean
}): Promise<void>
// Picker from state.skills if no packages specified
// Delete dir + removeLockEntry()
```

**`commands/search.ts`**

```ts
async function searchCommand(query: string): Promise<void>
// Existing searchMode() logic
```

## Implementation Order

1. Create `core/lockfile.ts` - extract existing lock functions
2. Create `core/skills.ts` - iterateSkills + getProjectState
3. Create `core/formatting.ts` - extract formatters
4. Create `commands/search.ts` - move searchMode
5. Create `commands/list.ts` - move listSkills, use state
6. Create `commands/sync.ts` - move sync logic
7. Create `commands/remove.ts` - new command
8. Rewrite `cli.ts` as router
9. Delete dead code from old cli.ts

## Files Changed

| File | Action |
|------|--------|
| `src/cli.ts` | Rewrite as router |
| `src/core/skills.ts` | Create |
| `src/core/lockfile.ts` | Create |
| `src/core/formatting.ts` | Create |
| `src/commands/sync.ts` | Create |
| `src/commands/list.ts` | Create |
| `src/commands/remove.ts` | Create |
| `src/commands/search.ts` | Create |
