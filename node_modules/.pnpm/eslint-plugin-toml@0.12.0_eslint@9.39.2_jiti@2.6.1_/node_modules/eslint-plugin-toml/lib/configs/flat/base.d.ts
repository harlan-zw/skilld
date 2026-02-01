import type { ESLint } from "eslint";
import * as parser from "toml-eslint-parser";
declare const _default: ({
    plugins: {
        readonly toml: ESLint.Plugin;
    };
    files?: undefined;
    languageOptions?: undefined;
    rules?: undefined;
} | {
    files: string[];
    languageOptions: {
        parser: typeof parser;
    };
    rules: {
        "no-irregular-whitespace": "off";
        "spaced-comment": "off";
    };
    plugins?: undefined;
})[];
export default _default;
