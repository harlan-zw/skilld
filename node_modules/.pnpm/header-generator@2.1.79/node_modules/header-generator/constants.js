"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTP2_SEC_FETCH_ATTRIBUTES = exports.HTTP1_SEC_FETCH_ATTRIBUTES = exports.MISSING_VALUE_DATASET_TOKEN = exports.DEVICE_NODE_NAME = exports.OPERATING_SYSTEM_NODE_NAME = exports.BROWSER_HTTP_NODE_NAME = exports.SUPPORTED_HTTP_VERSIONS = exports.SUPPORTED_DEVICES = exports.SUPPORTED_OPERATING_SYSTEMS = exports.SUPPORTED_BROWSERS = void 0;
exports.SUPPORTED_BROWSERS = [
    'chrome',
    'firefox',
    'safari',
    'edge',
];
exports.SUPPORTED_OPERATING_SYSTEMS = [
    'windows',
    'macos',
    'linux',
    'android',
    'ios',
];
exports.SUPPORTED_DEVICES = ['desktop', 'mobile'];
exports.SUPPORTED_HTTP_VERSIONS = ['1', '2'];
exports.BROWSER_HTTP_NODE_NAME = '*BROWSER_HTTP';
exports.OPERATING_SYSTEM_NODE_NAME = '*OPERATING_SYSTEM';
exports.DEVICE_NODE_NAME = '*DEVICE';
exports.MISSING_VALUE_DATASET_TOKEN = '*MISSING_VALUE*';
exports.HTTP1_SEC_FETCH_ATTRIBUTES = {
    mode: 'Sec-Fetch-Mode',
    dest: 'Sec-Fetch-Dest',
    site: 'Sec-Fetch-Site',
    user: 'Sec-Fetch-User',
};
exports.HTTP2_SEC_FETCH_ATTRIBUTES = {
    mode: 'sec-fetch-mode',
    dest: 'sec-fetch-dest',
    site: 'sec-fetch-site',
    user: 'sec-fetch-user',
};
//# sourceMappingURL=constants.js.map