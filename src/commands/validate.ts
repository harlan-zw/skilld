/**
 * skilld validate <file> [--section <type>]
 *
 * Validates a generated skill section file against quality heuristics.
 * Exits non-zero on warnings so the LLM agent detects issues via exit code.
 */

import type { SkillSection } from "../agent/prompts/index.ts";
import { existsSync, readFileSync } from "node:fs";
import { defineCommand } from "citty";
import { getSectionValidator } from "../agent/prompts/index.ts";

const SECTION_HEADINGS: Record<string, SkillSection> = {
  "## API Changes": "api-changes",
  "## Best Practices": "best-practices",
};

/** Infer section type from content headings */
function inferSection(content: string): SkillSection | null {
  for (const [heading, section] of Object.entries(SECTION_HEADINGS)) {
    if (content.includes(heading)) return section;
  }
  // Custom sections don't have a fixed heading — fall back
  return "custom";
}

export const validateCommandDef = defineCommand({
  meta: { name: "validate", description: "Validate a generated skill section" },
  args: {
    file: {
      type: "positional",
      description: "Path to the section file to validate",
      required: true,
    },
    section: {
      type: "string",
      description:
        "Section type (api-changes, best-practices, custom). Auto-detected from heading if omitted.",
    },
  },

  /* eslint-disable no-console */
  async run({ args }) {
    const filePath = args.file as string;
    if (!existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }

    const content = readFileSync(filePath, "utf-8").trim();
    if (!content) {
      console.error("File is empty");
      process.exit(1);
    }

    const section = (args.section as SkillSection) || inferSection(content);
    if (!section) {
      console.error("Could not infer section type — use --section flag");
      process.exit(1);
    }

    const validator = getSectionValidator(section);
    if (!validator) {
      console.log("OK: No validator for section type:", section);
      process.exit(0);
    }

    const warnings = validator(content);

    if (warnings.length === 0) {
      console.log("OK: No validation warnings");
      process.exit(0);
    }

    for (const w of warnings) console.log(`WARNING: ${w.warning}`);

    process.exit(1);
  },
});
