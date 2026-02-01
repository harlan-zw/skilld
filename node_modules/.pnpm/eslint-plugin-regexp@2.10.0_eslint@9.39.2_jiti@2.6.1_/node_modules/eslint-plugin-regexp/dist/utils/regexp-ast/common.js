"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirstConsumedCharPlusAfter = getFirstConsumedCharPlusAfter;
exports.extractCaptures = extractCaptures;
exports.hasCapturingGroup = hasCapturingGroup;
const regexpp_1 = require("@eslint-community/regexpp");
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
function getFirstConsumedCharPlusAfter(element, direction, flags) {
    const consumed = (0, regexp_ast_analysis_1.getFirstConsumedChar)(element, direction, flags);
    if (!consumed.empty) {
        return consumed;
    }
    return regexp_ast_analysis_1.FirstConsumedChars.concat([consumed, (0, regexp_ast_analysis_1.getFirstConsumedCharAfter)(element, direction, flags)], flags);
}
function extractCaptures(pattern) {
    const groups = [];
    (0, regexpp_1.visitRegExpAST)(pattern, {
        onCapturingGroupEnter(group) {
            groups.push(group);
        },
    });
    groups.sort((a, b) => a.start - b.start);
    const names = new Set();
    for (const group of groups) {
        if (group.name !== null) {
            names.add(group.name);
        }
    }
    return { groups, names, count: groups.length };
}
function hasCapturingGroup(node) {
    return (0, regexp_ast_analysis_1.hasSomeDescendant)(node, (d) => d.type === "CapturingGroup");
}
