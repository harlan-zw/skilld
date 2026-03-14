import type { CustomPrompt, PromptSection, SectionValidationWarning } from "./types.ts";
import { maxLines } from "./budget.ts";
import {
  checkAbsolutePaths,
  checkLineCount,
  checkSourceCoverage,
  checkSourcePaths,
  checkSparseness,
} from "./validate.ts";

export function customSection(
  { heading, body }: CustomPrompt,
  enabledSectionCount?: number,
): PromptSection {
  const customMaxLines = maxLines(50, 80, enabledSectionCount);

  return {
    validate(content: string): SectionValidationWarning[] {
      return [
        ...checkLineCount(content, customMaxLines),
        ...checkSparseness(content),
        ...checkSourceCoverage(content, 0.3),
        ...checkSourcePaths(content),
        ...checkAbsolutePaths(content),
      ];
    },

    task: `**Custom section — "${heading}":**\n${body}`,

    format: `Custom section format:
\`\`\`
## ${heading}

Content addressing the user's instructions above, using concise examples and source links.
\`\`\``,

    rules: [
      `- **Custom section "${heading}":** MAX ${customMaxLines} lines, use \`## ${heading}\` heading`,
    ],
  };
}
