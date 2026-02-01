# eslint-plugin-import-lite

> [!WARNING]
>
> WIP
>
> This plugin is still newly born and willing to accept useful import-related rules.
>
> Feel free to open an issue to share your ideas!

[![npm version][npm-version-src]][npm-version-href]
[![npm bundle size][npm-bundle-size-src]][npm-bundle-size-href]
[![License][license-src]][license-href]

## Feature

- Port some useful rules that don’t require a resolver from [`eslint-plugin-import-x`](https://github.com/un-ts/eslint-plugin-import-x).
- No need for a resolver and settings like those in [`eslint-plugin-import-x`](https://github.com/un-ts/eslint-plugin-import-x).
- Drop babel and flow support.

See all rules in [`src/rules`](./src/rules)

## Motivation

I extend [my own ESLint config](https://github.com/9romise/eslint-config) from [`@antfu/eslint-config`](https://github.com/antfu/eslint-config).

Recently this config dropped [`eslint-plugin-import-x`](https://github.com/un-ts/eslint-plugin-import-x) cause it introduce some binary packages and make it heavy.

In a [discussion]((https://github.com/9romise/eslint-import-resolver-oxc/issues/87#issuecomment-2945162572)) about built-in resolver, the maintainer plan to keep it as dependency, which makes it impossible to lightweight the package.

But there are some useful rules and [some people (include me) want to bring the plugin back](https://github.com/antfu/eslint-config/issues/720).

## Credits

- [eslint-plugin-import-x](https://github.com/un-ts/eslint-plugin-import-x) - source codes [MIT](https://github.com/un-ts/eslint-plugin-import-x/blob/master/LICENSE)
- [eslint-stylistic](https://github.com/eslint-stylistic/eslint-stylistic) - project structure and scripts [MIT](https://github.com/eslint-stylistic/eslint-stylistic/blob/main/LICENSE)

## License

[MIT](./LICENSE) License &copy; 2025-PRESENT [Vida Xie](https://github.com/9romise)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/eslint-plugin-import-lite?color=00a3e0
[npm-version-href]: https://npmjs.com/package/eslint-plugin-import-lite
[npm-bundle-size-src]: https://img.shields.io/npm/unpacked-size/eslint-plugin-import-lite?color=00a3e0
[npm-bundle-size-href]: https://npmjs.com/package/eslint-plugin-import-lite
[license-src]: https://img.shields.io/npm/l/eslint-plugin-import-lite?color=00a3e0
[license-href]: https://opensource.org/licenses/MIT
