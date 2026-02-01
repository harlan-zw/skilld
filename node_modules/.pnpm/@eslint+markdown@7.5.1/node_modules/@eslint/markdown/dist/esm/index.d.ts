export default plugin;
export { MarkdownSourceCode };
export * from "./language/markdown-language.js";
export * from "./types.js";
declare namespace plugin {
    export namespace meta {
        let name: string;
        let version: string;
    }
    export namespace processors {
        export { processor as markdown };
    }
    export namespace languages {
        let commonmark: MarkdownLanguage;
        let gfm: MarkdownLanguage;
    }
    export { rules };
    export let configs: {
        "recommended-legacy": {
            plugins: string[];
            overrides: ({
                files: string[];
                processor: string;
                parserOptions?: undefined;
                rules?: undefined;
            } | {
                files: string[];
                parserOptions: {
                    ecmaFeatures: {
                        impliedStrict: boolean;
                    };
                };
                rules: {
                    [key: string]: import("@eslint/core", { with: { "resolution-mode": "require" } }).RuleConfig<unknown[]>;
                };
                processor?: undefined;
            })[];
        };
        recommended: {
            name: string;
            files: string[];
            language: string;
            plugins: {};
            rules: {
                readonly "markdown/fenced-code-language": "error";
                readonly "markdown/heading-increment": "error";
                readonly "markdown/no-duplicate-definitions": "error";
                readonly "markdown/no-empty-definitions": "error";
                readonly "markdown/no-empty-images": "error";
                readonly "markdown/no-empty-links": "error";
                readonly "markdown/no-invalid-label-refs": "error";
                readonly "markdown/no-missing-atx-heading-space": "error";
                readonly "markdown/no-missing-label-refs": "error";
                readonly "markdown/no-missing-link-fragments": "error";
                readonly "markdown/no-multiple-h1": "error";
                readonly "markdown/no-reference-like-urls": "error";
                readonly "markdown/no-reversed-media-syntax": "error";
                readonly "markdown/no-space-in-emphasis": "error";
                readonly "markdown/no-unused-definitions": "error";
                readonly "markdown/require-alt-text": "error";
                readonly "markdown/table-column-count": "error";
            };
        }[];
        processor: Linter.Config[];
    };
}
import { MarkdownSourceCode } from "./language/markdown-source-code.js";
import { processor } from "./processor.js";
import { MarkdownLanguage } from "./language/markdown-language.js";
import rules from "./build/rules.js";
import type { Linter } from "eslint";
