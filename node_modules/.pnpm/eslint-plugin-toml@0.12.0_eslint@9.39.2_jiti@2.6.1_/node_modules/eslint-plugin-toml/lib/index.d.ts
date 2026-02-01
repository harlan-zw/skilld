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
                    "spaced-comment": string;
                };
            }[];
        };
        recommended: {
            extends: string[];
            rules: {
                "toml/no-unreadable-number-separator": string;
                "toml/precision-of-fractional-seconds": string;
                "toml/precision-of-integer": string;
                "toml/vue-custom-block/no-parsing-error": string;
            };
        };
        standard: {
            extends: string[];
            rules: {
                "toml/array-bracket-newline": string;
                "toml/array-bracket-spacing": string;
                "toml/array-element-newline": string;
                "toml/comma-style": string;
                "toml/indent": string;
                "toml/inline-table-curly-spacing": string;
                "toml/key-spacing": string;
                "toml/keys-order": string;
                "toml/no-space-dots": string;
                "toml/no-unreadable-number-separator": string;
                "toml/padding-line-between-pairs": string;
                "toml/padding-line-between-tables": string;
                "toml/precision-of-fractional-seconds": string;
                "toml/precision-of-integer": string;
                "toml/quoted-keys": string;
                "toml/spaced-comment": string;
                "toml/table-bracket-spacing": string;
                "toml/tables-order": string;
                "toml/vue-custom-block/no-parsing-error": string;
            };
        };
        "flat/base": ({
            plugins: {
                readonly toml: import("eslint").ESLint.Plugin;
            };
            files?: undefined;
            languageOptions?: undefined;
            rules?: undefined;
        } | {
            files: string[];
            languageOptions: {
                parser: typeof import("toml-eslint-parser");
            };
            rules: {
                "no-irregular-whitespace": "off";
                "spaced-comment": "off";
            };
            plugins?: undefined;
        })[];
        "flat/recommended": ({
            plugins: {
                readonly toml: import("eslint").ESLint.Plugin;
            };
            files?: undefined;
            languageOptions?: undefined;
            rules?: undefined;
        } | {
            files: string[];
            languageOptions: {
                parser: typeof import("toml-eslint-parser");
            };
            rules: {
                "no-irregular-whitespace": "off";
                "spaced-comment": "off";
            };
            plugins?: undefined;
        } | {
            rules: {
                "toml/no-unreadable-number-separator": "error";
                "toml/precision-of-fractional-seconds": "error";
                "toml/precision-of-integer": "error";
                "toml/vue-custom-block/no-parsing-error": "error";
            };
        })[];
        "flat/standard": ({
            plugins: {
                readonly toml: import("eslint").ESLint.Plugin;
            };
            files?: undefined;
            languageOptions?: undefined;
            rules?: undefined;
        } | {
            files: string[];
            languageOptions: {
                parser: typeof import("toml-eslint-parser");
            };
            rules: {
                "no-irregular-whitespace": "off";
                "spaced-comment": "off";
            };
            plugins?: undefined;
        } | {
            rules: {
                "toml/array-bracket-newline": "error";
                "toml/array-bracket-spacing": "error";
                "toml/array-element-newline": "error";
                "toml/comma-style": "error";
                "toml/indent": "error";
                "toml/inline-table-curly-spacing": "error";
                "toml/key-spacing": "error";
                "toml/keys-order": "error";
                "toml/no-space-dots": "error";
                "toml/no-unreadable-number-separator": "error";
                "toml/padding-line-between-pairs": "error";
                "toml/padding-line-between-tables": "error";
                "toml/precision-of-fractional-seconds": "error";
                "toml/precision-of-integer": "error";
                "toml/quoted-keys": "error";
                "toml/spaced-comment": "error";
                "toml/table-bracket-spacing": "error";
                "toml/tables-order": "error";
                "toml/vue-custom-block/no-parsing-error": "error";
            };
        })[];
    };
    rules: {
        [key: string]: RuleModule;
    };
};
export = _default;
