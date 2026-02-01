import type { RuleModule } from "./types";
import * as meta from "./meta";
declare const _default: {
    meta: typeof meta;
    configs: {
        base: {
            plugins: string[];
            overrides: {
                files: string[];
                parser: string;
                rules: {
                    "no-irregular-whitespace": string;
                    "no-unused-vars": string;
                    "spaced-comment": string;
                };
            }[];
        };
        recommended: {
            extends: string[];
            rules: {
                "yml/no-empty-document": string;
                "yml/no-empty-key": string;
                "yml/no-empty-mapping-value": string;
                "yml/no-empty-sequence-entry": string;
                "yml/no-irregular-whitespace": string;
                "yml/no-tab-indent": string;
                "yml/vue-custom-block/no-parsing-error": string;
            };
        };
        standard: {
            extends: string[];
            rules: {
                "yml/block-mapping-question-indicator-newline": string;
                "yml/block-mapping": string;
                "yml/block-sequence-hyphen-indicator-newline": string;
                "yml/block-sequence": string;
                "yml/flow-mapping-curly-newline": string;
                "yml/flow-mapping-curly-spacing": string;
                "yml/flow-sequence-bracket-newline": string;
                "yml/flow-sequence-bracket-spacing": string;
                "yml/indent": string;
                "yml/key-spacing": string;
                "yml/no-empty-document": string;
                "yml/no-empty-key": string;
                "yml/no-empty-mapping-value": string;
                "yml/no-empty-sequence-entry": string;
                "yml/no-irregular-whitespace": string;
                "yml/no-tab-indent": string;
                "yml/plain-scalar": string;
                "yml/quotes": string;
                "yml/spaced-comment": string;
                "yml/vue-custom-block/no-parsing-error": string;
            };
        };
        prettier: {
            extends: string[];
            rules: {
                "yml/block-mapping-colon-indicator-newline": string;
                "yml/block-mapping-question-indicator-newline": string;
                "yml/block-sequence-hyphen-indicator-newline": string;
                "yml/flow-mapping-curly-newline": string;
                "yml/flow-mapping-curly-spacing": string;
                "yml/flow-sequence-bracket-newline": string;
                "yml/flow-sequence-bracket-spacing": string;
                "yml/indent": string;
                "yml/key-spacing": string;
                "yml/no-multiple-empty-lines": string;
                "yml/no-trailing-zeros": string;
                "yml/quotes": string;
            };
        };
        "flat/base": ({
            plugins: {
                readonly yml: import("eslint").ESLint.Plugin;
            };
            files?: undefined;
            languageOptions?: undefined;
            rules?: undefined;
        } | {
            files: string[];
            languageOptions: {
                parser: typeof import("yaml-eslint-parser");
            };
            rules: {
                "no-irregular-whitespace": "off";
                "no-unused-vars": "off";
                "spaced-comment": "off";
            };
            plugins?: undefined;
        })[];
        "flat/recommended": ({
            plugins: {
                readonly yml: import("eslint").ESLint.Plugin;
            };
            files?: undefined;
            languageOptions?: undefined;
            rules?: undefined;
        } | {
            files: string[];
            languageOptions: {
                parser: typeof import("yaml-eslint-parser");
            };
            rules: {
                "no-irregular-whitespace": "off";
                "no-unused-vars": "off";
                "spaced-comment": "off";
            };
            plugins?: undefined;
        } | {
            rules: {
                "yml/no-empty-document": "error";
                "yml/no-empty-key": "error";
                "yml/no-empty-mapping-value": "error";
                "yml/no-empty-sequence-entry": "error";
                "yml/no-irregular-whitespace": "error";
                "yml/no-tab-indent": "error";
                "yml/vue-custom-block/no-parsing-error": "error";
            };
        })[];
        "flat/standard": ({
            plugins: {
                readonly yml: import("eslint").ESLint.Plugin;
            };
            files?: undefined;
            languageOptions?: undefined;
            rules?: undefined;
        } | {
            files: string[];
            languageOptions: {
                parser: typeof import("yaml-eslint-parser");
            };
            rules: {
                "no-irregular-whitespace": "off";
                "no-unused-vars": "off";
                "spaced-comment": "off";
            };
            plugins?: undefined;
        } | {
            rules: {
                "yml/block-mapping-question-indicator-newline": "error";
                "yml/block-mapping": "error";
                "yml/block-sequence-hyphen-indicator-newline": "error";
                "yml/block-sequence": "error";
                "yml/flow-mapping-curly-newline": "error";
                "yml/flow-mapping-curly-spacing": "error";
                "yml/flow-sequence-bracket-newline": "error";
                "yml/flow-sequence-bracket-spacing": "error";
                "yml/indent": "error";
                "yml/key-spacing": "error";
                "yml/no-empty-document": "error";
                "yml/no-empty-key": "error";
                "yml/no-empty-mapping-value": "error";
                "yml/no-empty-sequence-entry": "error";
                "yml/no-irregular-whitespace": "error";
                "yml/no-tab-indent": "error";
                "yml/plain-scalar": "error";
                "yml/quotes": "error";
                "yml/spaced-comment": "error";
                "yml/vue-custom-block/no-parsing-error": "error";
            };
        })[];
        "flat/prettier": ({
            plugins: {
                readonly yml: import("eslint").ESLint.Plugin;
            };
            files?: undefined;
            languageOptions?: undefined;
            rules?: undefined;
        } | {
            files: string[];
            languageOptions: {
                parser: typeof import("yaml-eslint-parser");
            };
            rules: {
                "no-irregular-whitespace": "off";
                "no-unused-vars": "off";
                "spaced-comment": "off";
            };
            plugins?: undefined;
        } | {
            rules: {
                "yml/block-mapping-colon-indicator-newline": "off";
                "yml/block-mapping-question-indicator-newline": "off";
                "yml/block-sequence-hyphen-indicator-newline": "off";
                "yml/flow-mapping-curly-newline": "off";
                "yml/flow-mapping-curly-spacing": "off";
                "yml/flow-sequence-bracket-newline": "off";
                "yml/flow-sequence-bracket-spacing": "off";
                "yml/indent": "off";
                "yml/key-spacing": "off";
                "yml/no-multiple-empty-lines": "off";
                "yml/no-trailing-zeros": "off";
                "yml/quotes": "off";
            };
        })[];
    };
    rules: {
        [key: string]: RuleModule;
    };
};
export = _default;
