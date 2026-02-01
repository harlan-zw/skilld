"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuffleArray = exports.getBrowsersFromQuery = exports.getBrowser = exports.getUserAgent = void 0;
const tslib_1 = require("tslib");
const browserslist_1 = tslib_1.__importDefault(require("browserslist"));
const constants_1 = require("./constants");
const getUserAgent = (headers) => {
    for (const [header, value] of Object.entries(headers)) {
        if (header.toLowerCase() === 'user-agent') {
            return value;
        }
    }
    return undefined;
};
exports.getUserAgent = getUserAgent;
const getBrowser = (userAgent) => {
    if (!userAgent) {
        return undefined;
    }
    let browser;
    if (userAgent.includes('Firefox')) {
        browser = 'firefox';
    }
    else if (userAgent.includes('Chrome')) {
        browser = 'chrome';
    }
    else {
        browser = 'safari';
    }
    return browser;
};
exports.getBrowser = getBrowser;
const getBrowsersWithVersions = (browserList) => {
    const browsersWithVersions = {};
    for (const browserDefinition of browserList) {
        const [browserSplit, versionString] = browserDefinition.split(' ');
        const browser = browserSplit;
        const version = parseInt(versionString, 10);
        if (!constants_1.SUPPORTED_BROWSERS.includes(browser)) {
            continue;
        }
        if (browsersWithVersions[browser]) {
            browsersWithVersions[browser].push(version);
        }
        else {
            browsersWithVersions[browser] = [version];
        }
    }
    return browsersWithVersions;
};
const getOptimizedVersionDistribution = (browsersWithVersions) => {
    const finalOptimizedBrowsers = [];
    Object.entries(browsersWithVersions).forEach(([browser, versions]) => {
        const sortedVersions = versions.sort((a, b) => a - b);
        let lowestVersionSoFar = sortedVersions[0];
        sortedVersions.forEach((version, index) => {
            const nextVersion = sortedVersions[index + 1];
            const isLast = index === sortedVersions.length - 1;
            const isNextVersionGap = nextVersion - version > 1;
            if (isNextVersionGap || isLast) {
                finalOptimizedBrowsers.push({
                    name: browser,
                    minVersion: lowestVersionSoFar,
                    maxVersion: version,
                });
                lowestVersionSoFar = nextVersion;
            }
        });
    });
    return finalOptimizedBrowsers;
};
const getBrowsersFromQuery = (browserListQuery) => {
    const browserList = (0, browserslist_1.default)(browserListQuery);
    const browsersWithVersions = getBrowsersWithVersions(browserList);
    return getOptimizedVersionDistribution(browsersWithVersions);
};
exports.getBrowsersFromQuery = getBrowsersFromQuery;
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};
exports.shuffleArray = shuffleArray;
//# sourceMappingURL=utils.js.map