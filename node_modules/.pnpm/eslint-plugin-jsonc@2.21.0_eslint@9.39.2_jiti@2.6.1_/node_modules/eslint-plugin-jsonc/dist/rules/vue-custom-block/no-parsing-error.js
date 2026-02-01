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
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils");
const jsoncESLintParser = __importStar(require("jsonc-eslint-parser"));
exports.default = (0, utils_1.createRule)("vue-custom-block/no-parsing-error", {
    meta: {
        docs: {
            description: "disallow parsing errors in Vue custom blocks",
            recommended: ["json", "json5", "jsonc"],
            extensionRule: false,
            layout: false,
        },
        schema: [],
        messages: {},
        type: "problem",
    },
    create(context, { customBlock }) {
        var _a;
        if (!customBlock) {
            return {};
        }
        const sourceCode = context.sourceCode;
        const parserServices = (_a = context.parserServices) !== null && _a !== void 0 ? _a : sourceCode.parserServices;
        const parseError = parserServices.parseError;
        if (parseError) {
            return errorReportVisitor(context, parseError);
        }
        const parseCustomBlockElement = parserServices.parseCustomBlockElement;
        const customBlockElement = parserServices.customBlock;
        if (customBlockElement && parseCustomBlockElement) {
            let lang = getLang(customBlockElement);
            if (!lang) {
                lang = "json";
            }
            const { error } = parseCustomBlockElement(jsoncESLintParser, {
                jsonSyntax: lang,
            });
            if (error) {
                return errorReportVisitor(context, error);
            }
        }
        return {};
    },
});
function errorReportVisitor(context, error) {
    let loc = undefined;
    if ("column" in error && "lineNumber" in error) {
        loc = {
            line: error.lineNumber,
            column: error.column,
        };
    }
    return {
        Program(node) {
            context.report({
                node: node,
                loc,
                message: error.message,
            });
        },
    };
}
function getLang(customBlock) {
    var _a, _b;
    return (((_b = (_a = customBlock.startTag.attributes.find((attr) => !attr.directive && attr.key.name === "lang")) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.value) || null);
}
