"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MODERN_IOS = exports.MODERN_ANDROID = exports.MODERN_MACOS_CHROME = exports.MODERN_MACOS_FIREFOX = exports.MODERN_MACOS = exports.MODERN_WINDOWS_CHROME = exports.MODERN_WINDOWS_FIREFOX = exports.MODERN_WINDOWS = exports.MODERN_LINUX_CHROME = exports.MODERN_LINUX_FIREFOX = exports.MODERN_LINUX = exports.MODERN_MOBILE = exports.MODERN_DESKTOP = void 0;
exports.MODERN_DESKTOP = {
    browserListQuery: 'last 5 versions',
};
exports.MODERN_MOBILE = {
    ...exports.MODERN_DESKTOP,
    devices: ['mobile'],
};
exports.MODERN_LINUX = {
    ...exports.MODERN_DESKTOP,
    operatingSystems: ['linux'],
};
exports.MODERN_LINUX_FIREFOX = {
    browserListQuery: 'last 5 firefox versions',
    operatingSystems: ['linux'],
};
exports.MODERN_LINUX_CHROME = {
    browserListQuery: 'last 5 chrome versions',
    operatingSystems: ['linux'],
};
exports.MODERN_WINDOWS = {
    ...exports.MODERN_DESKTOP,
    operatingSystems: ['windows'],
};
exports.MODERN_WINDOWS_FIREFOX = {
    browserListQuery: 'last 5 firefox versions',
    operatingSystems: ['windows'],
};
exports.MODERN_WINDOWS_CHROME = {
    browserListQuery: 'last 5 chrome versions',
    operatingSystems: ['windows'],
};
exports.MODERN_MACOS = {
    ...exports.MODERN_DESKTOP,
    operatingSystems: ['macos'],
};
exports.MODERN_MACOS_FIREFOX = {
    browserListQuery: 'last 5 firefox versions',
    operatingSystems: ['macos'],
};
exports.MODERN_MACOS_CHROME = {
    browserListQuery: 'last 5 chrome versions',
    operatingSystems: ['macos'],
};
exports.MODERN_ANDROID = {
    ...exports.MODERN_MOBILE,
    operatingSystems: ['android'],
};
exports.MODERN_IOS = {
    ...exports.MODERN_MOBILE,
    operatingSystems: ['ios'],
};
//# sourceMappingURL=presets.js.map