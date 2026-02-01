declare const _default: ({
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
export default _default;
