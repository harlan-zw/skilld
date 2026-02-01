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
exports.createRule = createRule;
const yamlESLintParser = __importStar(require("yaml-eslint-parser"));
const path_1 = __importDefault(require("path"));
const compat_1 = require("./compat");
function createRule(ruleName, rule) {
    return {
        meta: Object.assign(Object.assign({}, rule.meta), { docs: Object.assign(Object.assign({}, rule.meta.docs), { url: `https://ota-meshi.github.io/eslint-plugin-yml/rules/${ruleName}.html`, ruleId: `yml/${ruleName}`, ruleName }) }),
        create(context) {
            var _a;
            const sourceCode = (0, compat_1.getSourceCode)(context);
            if (typeof ((_a = sourceCode.parserServices) === null || _a === void 0 ? void 0 : _a.defineCustomBlocksVisitor) ===
                "function" &&
                path_1.default.extname((0, compat_1.getFilename)(context)) === ".vue") {
                return sourceCode.parserServices.defineCustomBlocksVisitor(context, yamlESLintParser, {
                    target: ["yaml", "yml"],
                    create(blockContext) {
                        return rule.create(blockContext, {
                            customBlock: true,
                        });
                    },
                });
            }
            return rule.create(context, {
                customBlock: false,
            });
        },
    };
}
