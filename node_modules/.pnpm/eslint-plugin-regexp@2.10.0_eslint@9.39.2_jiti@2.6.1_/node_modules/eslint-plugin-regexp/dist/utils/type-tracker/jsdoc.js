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
exports.JSDoc = exports.JSDocParam = exports.JSDocParams = void 0;
exports.getJSDoc = getJSDoc;
exports.parseTypeText = parseTypeText;
const jsdocTypeParser = __importStar(require("jsdoc-type-pratt-parser"));
const eslint_utils_1 = require("@eslint-community/eslint-utils");
const commentParser = __importStar(require("comment-parser"));
class JSDocParams {
    constructor() {
        this.params = [];
    }
    isEmpty() {
        return this.params.length === 0;
    }
    add(paths, param) {
        const name = paths.shift();
        if (paths.length > 0) {
            for (const rootParam of this.params) {
                if (rootParam.name === name) {
                    rootParam.add(paths, param);
                    return;
                }
            }
        }
        this.params.push(new JSDocParam(name || null, param));
    }
    get(paths) {
        const { name, index } = paths.shift();
        if (name) {
            for (const param of this.params) {
                if (param.name === name) {
                    return paths.length ? param.get(paths) : param.param;
                }
            }
        }
        if (index != null) {
            const param = this.params[index];
            if (param) {
                return paths.length ? param.get(paths) : param.param;
            }
        }
        return null;
    }
}
exports.JSDocParams = JSDocParams;
class JSDocParam extends JSDocParams {
    constructor(name, param) {
        super();
        this.name = name;
        this.param = param;
    }
}
exports.JSDocParam = JSDocParam;
const TAGS = {
    param: ["param", "arg", "argument"],
    returns: ["returns", "return"],
    type: ["type"],
};
class JSDoc {
    constructor(parsed) {
        this.params = null;
        this.parsed = parsed;
    }
    getTag(name) {
        for (const tag of this.genTags(name)) {
            return tag;
        }
        return null;
    }
    parseParams() {
        if (this.params) {
            return this.params;
        }
        const params = (this.params = new JSDocParams());
        for (const param of this.genTags("param")) {
            const paths = (param.name || "").split(/\./u);
            params.add(paths, param);
        }
        return params;
    }
    *genTags(name) {
        const names = TAGS[name];
        for (const tag of this.parsed.tags) {
            if (names.includes(tag.tag)) {
                yield tag;
            }
        }
    }
}
exports.JSDoc = JSDoc;
function getJSDoc(node, context) {
    const sourceCode = context.sourceCode;
    const jsdoc = findJSDocComment(node, sourceCode);
    if (jsdoc) {
        try {
            const parsed = commentParser.parse(`/*${jsdoc.value}*/`)[0];
            return new JSDoc(parsed);
        }
        catch (_a) {
        }
    }
    return null;
}
function findJSDocComment(node, sourceCode) {
    let target = node;
    let tokenBefore = null;
    while (target) {
        tokenBefore = sourceCode.getTokenBefore(target, {
            includeComments: true,
        });
        if (!tokenBefore) {
            return null;
        }
        if (tokenBefore.type === "Keyword" &&
            target.type === "VariableDeclarator") {
            if (tokenBefore.value === "const" ||
                tokenBefore.value === "let" ||
                tokenBefore.value === "var") {
                target = tokenBefore;
                continue;
            }
        }
        if (tokenBefore.type === "Punctuator") {
            if (tokenBefore.value === "(") {
                target = tokenBefore;
                continue;
            }
        }
        if ((0, eslint_utils_1.isCommentToken)(tokenBefore)) {
            if (tokenBefore.type === "Line") {
                target = tokenBefore;
                continue;
            }
        }
        break;
    }
    if (tokenBefore &&
        tokenBefore.type === "Block" &&
        tokenBefore.value.startsWith("*")) {
        return tokenBefore;
    }
    return null;
}
function parseTypeText(text) {
    try {
        const result = jsdocTypeParser.tryParse(text);
        return result;
    }
    catch (_a) {
        return null;
    }
}
