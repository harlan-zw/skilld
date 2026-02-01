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
exports.defineWrapperListener = defineWrapperListener;
exports.getCoreRule = getCoreRule;
const jsoncESLintParser = __importStar(require("jsonc-eslint-parser"));
const path_1 = __importDefault(require("path"));
const eslint_compat_utils_1 = require("eslint-compat-utils");
const eslint_json_compat_utils_1 = require("eslint-json-compat-utils");
function createRule(ruleName, rule) {
    return {
        meta: Object.assign(Object.assign({}, rule.meta), { docs: Object.assign(Object.assign({}, rule.meta.docs), { url: `https://ota-meshi.github.io/eslint-plugin-jsonc/rules/${ruleName}.html`, ruleId: `jsonc/${ruleName}`, ruleName }) }),
        jsoncDefineRule: rule,
        create(baseContext) {
            var _a;
            const context = getCompatContext(baseContext);
            const create = (0, eslint_json_compat_utils_1.toCompatCreate)(rule.create);
            const sourceCode = context.sourceCode;
            if (typeof ((_a = sourceCode.parserServices) === null || _a === void 0 ? void 0 : _a.defineCustomBlocksVisitor) ===
                "function" &&
                path_1.default.extname(context.filename) === ".vue") {
                return sourceCode.parserServices.defineCustomBlocksVisitor(context, jsoncESLintParser, {
                    target(lang, block) {
                        if (lang) {
                            return /^json[5c]?$/i.test(lang);
                        }
                        return block.name === "i18n";
                    },
                    create(blockContext) {
                        return create(blockContext, {
                            customBlock: true,
                        });
                    },
                });
            }
            return create(context, {
                customBlock: false,
            });
        },
    };
}
function getCompatContext(context) {
    if (context.sourceCode) {
        return context;
    }
    return {
        __proto__: context,
        get sourceCode() {
            return (0, eslint_compat_utils_1.getSourceCode)(context);
        },
        get filename() {
            return (0, eslint_compat_utils_1.getFilename)(context);
        },
        get cwd() {
            return (0, eslint_compat_utils_1.getCwd)(context);
        },
    };
}
function defineWrapperListener(coreRule, context, options) {
    if (!context.sourceCode.parserServices.isJSON) {
        return {};
    }
    const listener = coreRule.create({
        __proto__: context,
        options,
    });
    const jsonListener = {};
    for (const key of Object.keys(listener)) {
        const original = listener[key];
        if (!original) {
            continue;
        }
        const jsonKey = key.replace(/(?:^|\b)(ExpressionStatement|(?:Template)?Literal|(?:Array|Object|Unary)Expression|Property|Identifier|TemplateElement)(?:\b|$)/gu, "JSON$1");
        jsonListener[jsonKey] = function (node, ...args) {
            original.call(this, getProxyNode(node), ...args);
        };
    }
    function isNode(data) {
        return (data &&
            typeof data.type === "string" &&
            Array.isArray(data.range) &&
            data.range.length === 2 &&
            typeof data.range[0] === "number" &&
            typeof data.range[1] === "number");
    }
    function getProxyNode(node) {
        const type = node.type.startsWith("JSON") ? node.type.slice(4) : node.type;
        const cache = { type };
        return new Proxy(node, {
            get(_t, key) {
                if (key in cache) {
                    return cache[key];
                }
                const data = node[key];
                if (isNode(data)) {
                    return (cache[key] = getProxyNode(data));
                }
                if (Array.isArray(data)) {
                    return (cache[key] = data.map((e) => isNode(e) ? getProxyNode(e) : e));
                }
                return data;
            },
        });
    }
    return jsonListener;
}
let ruleMap = null;
function getCoreRule(name) {
    const eslint = require("eslint");
    try {
        const map = ruleMap || (ruleMap = new eslint.Linter().getRules());
        return map.get(name) || null;
    }
    catch (_a) {
    }
    const { builtinRules } = require("eslint/use-at-your-own-risk");
    return builtinRules.get(name) || null;
}
