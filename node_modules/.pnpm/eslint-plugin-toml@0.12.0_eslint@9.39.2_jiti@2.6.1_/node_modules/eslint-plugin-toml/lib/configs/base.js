"use strict";
module.exports = {
    plugins: ["toml"],
    overrides: [
        {
            files: ["*.toml"],
            parser: require.resolve("toml-eslint-parser"),
            rules: {
                "no-irregular-whitespace": "off",
                "spaced-comment": "off",
            },
        },
    ],
};
