"use strict";
module.exports = {
    plugins: ["yml"],
    overrides: [
        {
            files: ["*.yaml", "*.yml"],
            parser: require.resolve("yaml-eslint-parser"),
            rules: {
                "no-irregular-whitespace": "off",
                "no-unused-vars": "off",
                "spaced-comment": "off",
            },
        },
    ],
};
