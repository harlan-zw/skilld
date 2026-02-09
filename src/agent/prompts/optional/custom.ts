import type { CustomPrompt, PromptSection } from './types'

export function customSection({ heading, body }: CustomPrompt): PromptSection {
  return {
    task: `**Custom section — "${heading}":**\n${body}`,

    format: `Custom section format:
\`\`\`
## ${heading}

Content addressing the user's instructions above, using concise examples and source links.
\`\`\``,

    rules: [
      `- **Custom section "${heading}":** MAX 80 lines, use \`## ${heading}\` heading`,
    ],
  }
}
