declare const _default: ({
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
export default _default;
