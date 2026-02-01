"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStaticJSONValue = exports.traverseNodes = exports.parseJSON = exports.parseForESLint = exports.rules = exports.configs = exports.meta = void 0;
const rules_1 = require("./utils/rules");
const base_1 = __importDefault(require("./configs/base"));
const auto_config_1 = __importDefault(require("./configs/auto-config"));
const recommended_with_json_1 = __importDefault(require("./configs/recommended-with-json"));
const recommended_with_jsonc_1 = __importDefault(require("./configs/recommended-with-jsonc"));
const recommended_with_json5_1 = __importDefault(require("./configs/recommended-with-json5"));
const prettier_1 = __importDefault(require("./configs/prettier"));
const all_1 = __importDefault(require("./configs/all"));
const base_2 = __importDefault(require("./configs/flat/base"));
const recommended_with_json_2 = __importDefault(require("./configs/flat/recommended-with-json"));
const recommended_with_jsonc_2 = __importDefault(require("./configs/flat/recommended-with-jsonc"));
const recommended_with_json5_2 = __importDefault(require("./configs/flat/recommended-with-json5"));
const prettier_2 = __importDefault(require("./configs/flat/prettier"));
const all_2 = __importDefault(require("./configs/flat/all"));
const meta = __importStar(require("./meta"));
exports.meta = meta;
const jsonc_eslint_parser_1 = require("jsonc-eslint-parser");
Object.defineProperty(exports, "parseForESLint", { enumerable: true, get: function () { return jsonc_eslint_parser_1.parseForESLint; } });
Object.defineProperty(exports, "parseJSON", { enumerable: true, get: function () { return jsonc_eslint_parser_1.parseJSON; } });
Object.defineProperty(exports, "traverseNodes", { enumerable: true, get: function () { return jsonc_eslint_parser_1.traverseNodes; } });
Object.defineProperty(exports, "getStaticJSONValue", { enumerable: true, get: function () { return jsonc_eslint_parser_1.getStaticJSONValue; } });
const configs = {
    base: base_1.default,
    "auto-config": auto_config_1.default,
    "recommended-with-json": recommended_with_json_1.default,
    "recommended-with-jsonc": recommended_with_jsonc_1.default,
    "recommended-with-json5": recommended_with_json5_1.default,
    prettier: prettier_1.default,
    all: all_1.default,
    "flat/base": base_2.default,
    "flat/recommended-with-json": recommended_with_json_2.default,
    "flat/recommended-with-jsonc": recommended_with_jsonc_2.default,
    "flat/recommended-with-json5": recommended_with_json5_2.default,
    "flat/prettier": prettier_2.default,
    "flat/all": all_2.default,
};
exports.configs = configs;
const rules = rules_1.rules.reduce((obj, r) => {
    obj[r.meta.docs.ruleName] = r;
    return obj;
}, {});
exports.rules = rules;
exports.default = {
    meta,
    configs,
    rules,
    parseForESLint: jsonc_eslint_parser_1.parseForESLint,
    parseJSON: jsonc_eslint_parser_1.parseJSON,
    traverseNodes: jsonc_eslint_parser_1.traverseNodes,
    getStaticJSONValue: jsonc_eslint_parser_1.getStaticJSONValue,
};
