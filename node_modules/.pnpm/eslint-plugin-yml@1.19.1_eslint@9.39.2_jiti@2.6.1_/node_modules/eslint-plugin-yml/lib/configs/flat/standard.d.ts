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
export default _default;
