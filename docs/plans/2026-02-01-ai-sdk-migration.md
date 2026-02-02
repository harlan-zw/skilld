# AI SDK Migration

Migrate from 13 custom LLM provider implementations to Vercel AI SDK with community CLI providers.

## Motivation

1. **Maintenance burden** - 13 provider files to update
2. **Missing features** - no streaming, structured output, or tool calling
3. **Consistency** - inconsistent error handling, no retry logic
4. **Broken outputs** - LLM preamble leaking into generated skills

## Core Providers

Only three providers are essential:

| Provider | Package | Type |
|----------|---------|------|
| Claude Code | `ai-sdk-provider-claude-code` | CLI |
| Gemini CLI | `ai-sdk-provider-gemini-cli` | CLI |
| Codex CLI | `ai-sdk-provider-codex-cli` | CLI |

All others (anthropic API, openai, groq, ollama, etc.) are nice-to-have and can be added later via ai/sdk ecosystem.

## Files to Keep/Modify

- `src/agent/prompts/` - keep prompt templates
- `src/agent/llm/index.ts` - simplify to thin wrapper
- `src/agent/llm/types.ts` - may adopt ai/sdk types instead

## New Implementation

```ts
// src/agent/llm/index.ts
import { generateText } from 'ai'
import { claudeCode } from 'ai-sdk-provider-claude-code'
import { geminiCli } from 'ai-sdk-provider-gemini-cli'
import { codexCli } from 'ai-sdk-provider-codex-cli'
import { buildPrompt } from '../prompts'

export type OptimizeModel = 'haiku' | 'sonnet' | 'gemini-flash' | 'codex'

const models = {
  haiku: claudeCode('haiku'),
  sonnet: claudeCode('sonnet'),
  'gemini-flash': geminiCli('gemini-2.0-flash'),
  codex: codexCli('o4-mini'),
}

export async function optimizeDocs(
  content: string,
  packageName: string,
  model: OptimizeModel = 'haiku',
  preset: PromptPresetId = 'simple',
): Promise<{ optimized: string, wasOptimized: boolean }> {
  const prompt = buildPrompt(packageName, content, preset)

  try {
    const { text } = await generateText({
      model: models[model],
      prompt,
    })
    return { optimized: text, wasOptimized: true }
  }
  catch {
    // Fallback to haiku if other model fails
    if (model !== 'haiku') {
      const { text } = await generateText({
        model: models.haiku,
        prompt,
      })
      return { optimized: text, wasOptimized: true }
    }
    return { optimized: content, wasOptimized: false }
  }
}
```

## Future Benefits

Once on ai/sdk:

- **Streaming** - `streamText()` for progress feedback
- **Structured output** - Zod schemas to prevent malformed skill output
- **Tool calling** - if needed later
- **Easy provider additions** - just `npm add @ai-sdk/openai` etc.

## Dependencies

```json
{
  "dependencies": {
    "ai": "^4.2",
    "ai-sdk-provider-claude-code": "^3.x",
    "ai-sdk-provider-gemini-cli": "^2.x",
    "ai-sdk-provider-codex-cli": "^2.x"
  }
}
```

Provider docs:
- https://ai-sdk.dev/providers/community-providers/claude-code
- https://ai-sdk.dev/providers/community-providers/gemini-cli
- https://ai-sdk.dev/providers/community-providers/codex-cli

## Implementation Steps

1. [ ] Add deps: `pnpm add ai ai-sdk-provider-claude-code ai-sdk-provider-gemini-cli ai-sdk-provider-codex-cli`
2. [ ] Rewrite `src/agent/llm/index.ts` with ai/sdk generateText
3. [ ] Delete `src/agent/providers/` directory (14 files)
4. [ ] Delete `src/agent/llm/cli.ts` and `src/agent/llm/registry.ts`
5. [ ] Update `src/agent/llm/types.ts` to use ai/sdk types or keep minimal
6. [ ] Fix imports in `src/agent/index.ts`
7. [ ] Update/remove tests in `src/agent/llm/`
8. [ ] Test with `skilld vue --model haiku` and other models

## Files Deleted (~800 lines)

```
src/agent/providers/
├── aider.ts
├── anthropic.ts
├── claude.ts
├── codex.ts
├── deepseek.ts
├── gemini.ts
├── groq.ts
├── index.ts
├── mistral.ts
├── ollama.ts
├── openai.ts
├── opencode.ts
├── openrouter.ts
└── together.ts

src/agent/llm/
├── cli.ts
├── cli.test.ts
├── registry.ts
└── registry.test.ts
```
