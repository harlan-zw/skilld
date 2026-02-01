"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRegExpNodeFromExpression = getRegExpNodeFromExpression;
const regexpp_1 = require("@eslint-community/regexpp");
const ast_utils_1 = require("../ast-utils");
const parser = new regexpp_1.RegExpParser();
function getRegExpNodeFromExpression(node, context) {
    if (node.type === "Literal") {
        if ("regex" in node && node.regex) {
            try {
                return parser.parsePattern(node.regex.pattern, 0, node.regex.pattern.length, {
                    unicode: node.regex.flags.includes("u"),
                    unicodeSets: node.regex.flags.includes("v"),
                });
            }
            catch (_a) {
                return null;
            }
        }
        return null;
    }
    const evaluated = (0, ast_utils_1.getStaticValue)(context, node);
    if (!evaluated || !(evaluated.value instanceof RegExp)) {
        return null;
    }
    try {
        return (0, regexpp_1.parseRegExpLiteral)(evaluated.value);
    }
    catch (_b) {
        return null;
    }
}
