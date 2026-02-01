import type { ESLint } from "eslint";
import * as parser from "yaml-eslint-parser";
declare const _default: ({
    plugins: {
        readonly yml: ESLint.Plugin;
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
        "no-unused-vars": "off";
        "spaced-comment": "off";
    };
    plugins?: undefined;
})[];
export default _default;
