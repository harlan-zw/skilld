# Introduction

[eslint-plugin-toml](https://www.npmjs.com/package/eslint-plugin-toml) is ESLint plugin provides linting rules for [TOML].

[![NPM license](https://img.shields.io/npm/l/eslint-plugin-toml.svg)](https://www.npmjs.com/package/eslint-plugin-toml)
[![NPM version](https://img.shields.io/npm/v/eslint-plugin-toml.svg)](https://www.npmjs.com/package/eslint-plugin-toml)
[![NPM downloads](https://img.shields.io/badge/dynamic/json.svg?label=downloads&colorB=green&suffix=/day&query=$.downloads&uri=https://api.npmjs.org//downloads/point/last-day/eslint-plugin-toml&maxAge=3600)](http://www.npmtrends.com/eslint-plugin-toml)
[![NPM downloads](https://img.shields.io/npm/dw/eslint-plugin-toml.svg)](http://www.npmtrends.com/eslint-plugin-toml)
[![NPM downloads](https://img.shields.io/npm/dm/eslint-plugin-toml.svg)](http://www.npmtrends.com/eslint-plugin-toml)
[![NPM downloads](https://img.shields.io/npm/dy/eslint-plugin-toml.svg)](http://www.npmtrends.com/eslint-plugin-toml)
[![NPM downloads](https://img.shields.io/npm/dt/eslint-plugin-toml.svg)](http://www.npmtrends.com/eslint-plugin-toml)
[![Build Status](https://github.com/ota-meshi/eslint-plugin-toml/workflows/CI/badge.svg?branch=main)](https://github.com/ota-meshi/eslint-plugin-toml/actions?query=workflow%3ACI)

## :name_badge: Features

This ESLint plugin provides linting rules for [TOML].

- You can use ESLint to lint [TOML].
- You can find out the problem with your [TOML] files.
- You can apply consistent code styles to your [TOML] files.
- Supports [Vue SFC](https://vue-loader.vuejs.org/spec.html) custom blocks such as `<custom-block lang="toml">`.  
  Requirements `vue-eslint-parser` v7.3.0 and above.
- Supports ESLint directives. e.g. `# eslint-disable-next-line`
- You can check your code in real-time using the ESLint editor integrations.

You can check on the [Online DEMO](https://ota-meshi.github.io/eslint-plugin-toml/playground/).

<!--DOCS_IGNORE_START-->

## :book: Documentation

See [documents](https://ota-meshi.github.io/eslint-plugin-toml/).

## :cd: Installation

```bash
npm install --save-dev eslint eslint-plugin-toml
```

> **Requirements**
>
> - ESLint v6.0.0 and above
> - Node.js v12.22.x, v14.17.x, v16.x and above

<!--DOCS_IGNORE_END-->

## :book: Usage

<!--USAGE_SECTION_START-->
<!--USAGE_GUIDE_START-->

### Configuration

#### New Config (`eslint.config.js`)

Use `eslint.config.js` file to configure rules. See also: <https://eslint.org/docs/latest/use/configure/configuration-files-new>.

Example **eslint.config.js**:

```mjs
import eslintPluginToml from 'eslint-plugin-toml';
export default [
  // add more generic rule sets here, such as:
  // js.configs.recommended,
  ...eslintPluginToml.configs['flat/recommended'],
  {
    rules: {
      // override/add rules settings here, such as:
    // 'toml/rule-name': 'error'
    }
  }
];
```

This plugin provides configs:

- `*.configs['flat/base']` ... Configuration to enable correct TOML parsing.
- `*.configs['flat/recommended']` ... Above, plus rules to prevent errors or unintended behavior.
- `*.configs['flat/standard']` ... Above, plus rules to enforce the common stylistic conventions.

See [the rule list](https://ota-meshi.github.io/eslint-plugin-toml/rules/) to get the `rules` that this plugin provides.

#### Legacy Config (`.eslintrc`)

Use `.eslintrc.*` file to configure rules. See also: <https://eslint.org/docs/latest/use/configure/>.

Example **.eslintrc.js**:

```js
module.exports = {
  extends: [
    // add more generic rulesets here, such as:
    // 'eslint:recommended',
    'plugin:toml/standard'
  ],
  rules: {
    // override/add rules settings here, such as:
    // 'toml/rule-name': 'error'
  }
}
```

This plugin provides configs:

- `plugin:toml/base` ... Configuration to enable correct TOML parsing.
- `plugin:toml/recommended` ... Above, plus rules to prevent errors or unintended behavior.
- `plugin:toml/standard` ... Above, plus rules to enforce the common stylistic conventions.

Note that these configurations do not enable ESLint's core rules.
For example, the following style rules can also be used in TOML.

```json5
{
    "rules": {
        "comma-spacing": "error",
        "no-multi-spaces": ["error", { "exceptions": { "TOMLKeyValue": true } }],
        "no-multiple-empty-lines": "error",
        "no-trailing-spaces": "error"
    }
}
```

See [the rule list](https://ota-meshi.github.io/eslint-plugin-toml/rules/) to get the `rules` that this plugin provides.

#### Parser Configuration

If you have specified a parser, you need to configure a parser for `.toml`.

For example, if you are using the `"@babel/eslint-parser"`, configure it as follows:

```js
module.exports = {
  // ...
  extends: ["plugin:toml/standard"],
  // ...
  parser: "@babel/eslint-parser",
  // Add an `overrides` section to add a parser configuration for TOML.
  overrides: [
    {
      files: ["*.toml"],
      parser: "toml-eslint-parser",
    },
  ],
  // ...
};
```

### Running ESLint from the command line

If you want to run `eslint` from the command line, make sure you include the `.toml` extension using [the `--ext` option](https://eslint.org/docs/user-guide/configuring#specifying-file-extensions-to-lint) or a glob pattern, because ESLint targets only `.js` files by default.

Examples:

```bash
eslint --ext .js,.toml src
eslint "src/**/*.{js,toml}"
```

## :computer: Editor Integrations

### Visual Studio Code

Use the [dbaeumer.vscode-eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extension that Microsoft provides officially.

You have to configure the `eslint.validate` option of the extension to check `.toml` files, because the extension targets only `*.js` or `*.jsx` files by default.

Example **.vscode/settings.json**:

```json
{
    "eslint.validate": [
        "javascript",
        "javascriptreact",
        "toml"
    ]
}
```

<!--USAGE_GUIDE_END-->
<!--USAGE_SECTION_END-->

## :white_check_mark: Rules

<!--RULES_SECTION_START-->

The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) automatically fixes problems reported by rules which have a wrench :wrench: below.  
The rules with the following star :star: are included in the configs.

<!--RULES_TABLE_START-->

### TOML Rules

| Rule ID | Description | Fixable | RECOMMENDED | STANDARD |
|:--------|:------------|:-------:|:-----------:|:--------:|
| [toml/indent](https://ota-meshi.github.io/eslint-plugin-toml/rules/indent.html) | enforce consistent indentation | :wrench: |  | :star: |
| [toml/keys-order](https://ota-meshi.github.io/eslint-plugin-toml/rules/keys-order.html) | disallow defining pair keys out-of-order | :wrench: |  | :star: |
| [toml/no-mixed-type-in-array](https://ota-meshi.github.io/eslint-plugin-toml/rules/no-mixed-type-in-array.html) | disallow mixed data types in array |  |  |  |
| [toml/no-non-decimal-integer](https://ota-meshi.github.io/eslint-plugin-toml/rules/no-non-decimal-integer.html) | disallow hexadecimal, octal and binary integer | :wrench: |  |  |
| [toml/no-space-dots](https://ota-meshi.github.io/eslint-plugin-toml/rules/no-space-dots.html) | disallow spacing around infix operators | :wrench: |  | :star: |
| [toml/no-unreadable-number-separator](https://ota-meshi.github.io/eslint-plugin-toml/rules/no-unreadable-number-separator.html) | disallow number separators that to not enhance readability. |  | :star: | :star: |
| [toml/padding-line-between-pairs](https://ota-meshi.github.io/eslint-plugin-toml/rules/padding-line-between-pairs.html) | require or disallow padding lines between pairs | :wrench: |  | :star: |
| [toml/padding-line-between-tables](https://ota-meshi.github.io/eslint-plugin-toml/rules/padding-line-between-tables.html) | require or disallow padding lines between tables | :wrench: |  | :star: |
| [toml/precision-of-fractional-seconds](https://ota-meshi.github.io/eslint-plugin-toml/rules/precision-of-fractional-seconds.html) | disallow precision of fractional seconds greater than the specified value. |  | :star: | :star: |
| [toml/precision-of-integer](https://ota-meshi.github.io/eslint-plugin-toml/rules/precision-of-integer.html) | disallow precision of integer greater than the specified value. |  | :star: | :star: |
| [toml/quoted-keys](https://ota-meshi.github.io/eslint-plugin-toml/rules/quoted-keys.html) | require or disallow quotes around keys | :wrench: |  | :star: |
| [toml/tables-order](https://ota-meshi.github.io/eslint-plugin-toml/rules/tables-order.html) | disallow defining tables out-of-order | :wrench: |  | :star: |
| [toml/vue-custom-block/no-parsing-error](https://ota-meshi.github.io/eslint-plugin-toml/rules/vue-custom-block/no-parsing-error.html) | disallow parsing errors in Vue custom blocks |  | :star: | :star: |

### Extension Rules

| Rule ID | Description | Fixable | RECOMMENDED | STANDARD |
|:--------|:------------|:-------:|:-----------:|:--------:|
| [toml/array-bracket-newline](https://ota-meshi.github.io/eslint-plugin-toml/rules/array-bracket-newline.html) | enforce linebreaks after opening and before closing array brackets | :wrench: |  | :star: |
| [toml/array-bracket-spacing](https://ota-meshi.github.io/eslint-plugin-toml/rules/array-bracket-spacing.html) | enforce consistent spacing inside array brackets | :wrench: |  | :star: |
| [toml/array-element-newline](https://ota-meshi.github.io/eslint-plugin-toml/rules/array-element-newline.html) | enforce line breaks between array elements | :wrench: |  | :star: |
| [toml/comma-style](https://ota-meshi.github.io/eslint-plugin-toml/rules/comma-style.html) | enforce consistent comma style in array | :wrench: |  | :star: |
| [toml/inline-table-curly-spacing](https://ota-meshi.github.io/eslint-plugin-toml/rules/inline-table-curly-spacing.html) | enforce consistent spacing inside braces | :wrench: |  | :star: |
| [toml/key-spacing](https://ota-meshi.github.io/eslint-plugin-toml/rules/key-spacing.html) | enforce consistent spacing between keys and values in key/value pairs | :wrench: |  | :star: |
| [toml/spaced-comment](https://ota-meshi.github.io/eslint-plugin-toml/rules/spaced-comment.html) | enforce consistent spacing after the `#` in a comment | :wrench: |  | :star: |
| [toml/table-bracket-spacing](https://ota-meshi.github.io/eslint-plugin-toml/rules/table-bracket-spacing.html) | enforce consistent spacing inside table brackets | :wrench: |  | :star: |

## Deprecated

- :warning: We're going to remove deprecated rules in the next major release. Please migrate to successor/new rules.
- :innocent: We don't fix bugs which are in deprecated rules since we don't have enough resources.

| Rule ID | Replaced by |
|:--------|:------------|
| [toml/space-eq-sign](https://ota-meshi.github.io/eslint-plugin-toml/rules/space-eq-sign.html) | [toml/key-spacing](https://ota-meshi.github.io/eslint-plugin-toml/rules/key-spacing.html.md) |

<!--RULES_TABLE_END-->
<!--RULES_SECTION_END-->

<!--DOCS_IGNORE_START-->

## :beers: Contributing

Welcome contributing!

Please use GitHub's Issues/PRs.

### Development Tools

- `npm test` runs tests and measures coverage.  
- `npm run update` runs in order to update readme and recommended configuration.  

### Working With Rules

This plugin uses [toml-eslint-parser](https://github.com/ota-meshi/toml-eslint-parser) for the parser. Check [here](https://ota-meshi.github.io/toml-eslint-parser/) to find out about AST.

<!--DOCS_IGNORE_END-->

## :couple: Related Packages

- [eslint-plugin-jsonc](https://github.com/ota-meshi/eslint-plugin-jsonc) ... ESLint plugin for JSON, JSON with comments (JSONC) and JSON5.
- [eslint-plugin-yml](https://github.com/ota-meshi/eslint-plugin-yml) ... ESLint plugin for YAML.
- [eslint-plugin-json-schema-validator](https://github.com/ota-meshi/eslint-plugin-json-schema-validator) ... ESLint plugin that validates data using JSON Schema Validator.
- [jsonc-eslint-parser](https://github.com/ota-meshi/jsonc-eslint-parser) ... JSON, JSONC and JSON5 parser for use with ESLint plugins.
- [yaml-eslint-parser](https://github.com/ota-meshi/yaml-eslint-parser) ... YAML parser for use with ESLint plugins.
- [toml-eslint-parser](https://github.com/ota-meshi/toml-eslint-parser) ... TOML parser for use with ESLint plugins.

## :lock: License

See the [LICENSE](LICENSE) file for license rights and limitations (MIT).

[TOML]: https://toml.io/
