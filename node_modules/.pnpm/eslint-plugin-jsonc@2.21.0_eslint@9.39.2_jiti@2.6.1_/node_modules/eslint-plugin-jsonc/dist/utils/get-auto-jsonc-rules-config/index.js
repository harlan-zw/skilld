"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAutoConfig = getAutoConfig;
const fs_1 = require("fs");
const path_1 = require("path");
const should_use_flat_config_1 = require("./should-use-flat-config");
const calculate_config_for_file_1 = require("./calculate-config-for-file");
const configResolvers = {};
let ruleNames;
function getConfigResolver(cwd) {
    const configResolver = configResolvers[cwd];
    if (configResolver) {
        return configResolver;
    }
    if ((0, should_use_flat_config_1.shouldUseFlatConfig)(cwd)) {
        return (configResolvers[cwd] = (filePath) => (0, calculate_config_for_file_1.calculateConfigForFile)(cwd, filePath));
    }
    const plugin = require("../..");
    try {
        const eslintrc = require("@eslint/eslintrc");
        const configArrayFactory = new eslintrc.Legacy.CascadingConfigArrayFactory({
            additionalPluginPool: new Map([["eslint-plugin-jsonc", plugin]]),
            getEslintRecommendedConfig() {
                return require("../../../conf/eslint-recommended.js");
            },
            getEslintAllConfig() {
                return require("../../../conf/eslint-all.js");
            },
            eslintRecommendedPath: require.resolve("../../../conf/eslint-recommended.js"),
            eslintAllPath: require.resolve("../../../conf/eslint-all.js"),
            resolvePluginsRelativeTo: (0, path_1.resolve)(__dirname, "../../../../../"),
        });
        return (configResolvers[cwd] = (filePath) => {
            const absolutePath = (0, path_1.resolve)(cwd, filePath);
            return configArrayFactory
                .getConfigArrayForFile(absolutePath)
                .extractConfig(absolutePath)
                .toCompatibleObjectAsConfigFileContent();
        });
    }
    catch (_a) {
    }
    try {
        const eslint = require("eslint");
        const engine = new eslint.CLIEngine({ cwd });
        engine.addPlugin("eslint-plugin-jsonc", plugin);
        return (configResolvers[cwd] = (filePath) => {
            let targetFilePath = filePath;
            const ext = (0, path_1.extname)(filePath);
            while (!isValidFilename(targetFilePath)) {
                const dir = (0, path_1.dirname)(targetFilePath);
                if (dir === targetFilePath) {
                    return {};
                }
                targetFilePath = dir;
                if (ext && (0, path_1.extname)(targetFilePath) !== ext) {
                    targetFilePath += ext;
                }
            }
            return engine.getConfigForFile(targetFilePath);
        });
    }
    catch (_b) {
    }
    return () => ({});
}
function isValidFilename(filename) {
    const dir = (0, path_1.dirname)(filename);
    if ((0, fs_1.existsSync)(dir) && (0, fs_1.statSync)(dir).isDirectory()) {
        if ((0, fs_1.existsSync)(filename) && (0, fs_1.statSync)(filename).isDirectory()) {
            return false;
        }
        return true;
    }
    return false;
}
function getConfig(cwd, filename) {
    return getConfigResolver(cwd)(filename);
}
function getJsoncRule(rule) {
    var _a;
    ruleNames =
        ruleNames ||
            new Set(require("../rules").rules.map((r) => r.meta.docs.ruleName));
    const ruleName = rule.startsWith("@stylistic/")
        ? ((_a = rule.split("/").pop()) !== null && _a !== void 0 ? _a : rule)
        : rule;
    return ruleNames.has(ruleName) ? `jsonc/${ruleName}` : null;
}
function getAutoConfig(cwd, filename) {
    const autoConfig = {};
    const config = getConfig(cwd, filename);
    if (config.rules) {
        for (const ruleName of Object.keys(config.rules)) {
            const jsoncName = getJsoncRule(ruleName);
            if (jsoncName && !config.rules[jsoncName]) {
                const entry = config.rules[ruleName];
                if (entry) {
                    const severity = Array.isArray(entry) ? entry[0] : entry;
                    if (severity !== "off" && severity !== 0) {
                        autoConfig[jsoncName] = entry;
                    }
                }
            }
        }
    }
    return autoConfig;
}
