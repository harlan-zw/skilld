"use strict";
module.exports = {
    plugins: ["jsonc"],
    overrides: [
        {
            files: ["*.json", "*.json5", "*.jsonc"],
            parser: require.resolve("jsonc-eslint-parser"),
            rules: {
                strict: "off",
                "no-unused-expressions": "off",
                "no-unused-vars": "off",
            },
        },
    ],
};
