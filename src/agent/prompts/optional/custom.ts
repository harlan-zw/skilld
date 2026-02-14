import type { CustomPrompt, PromptSection } from './types'
import { maxLines } from './budget'

export function customSection({ heading, body }: CustomPrompt, enabledSectionCount?: number): PromptSection {
  return {
    task: `**Custom section — "${heading}":**\n${body}`,

    format: `Custom section format:
\`\`\`
## ${heading}

Content addressing the user's instructions above, using concise examples and source links.
\`\`\``,

    rules: [
      `- **Custom section "${heading}":** MAX ${maxLines(50, 80, enabledSectionCount)} lines, use \`## ${heading}\` heading`,
    ],
  }
}
