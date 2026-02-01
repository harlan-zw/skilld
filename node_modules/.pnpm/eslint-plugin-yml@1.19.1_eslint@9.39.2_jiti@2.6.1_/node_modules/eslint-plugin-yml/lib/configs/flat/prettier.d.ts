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
export default _default;
