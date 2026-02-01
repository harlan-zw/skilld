"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
function getCapturingGroupIdentifier(group) {
    if (group.name) {
        return `'${group.name}'`;
    }
    return `number ${(0, regexp_ast_analysis_1.getCapturingGroupNumber)(group)}`;
}
exports.default = (0, utils_1.createRule)("no-unused-capturing-group", {
    meta: {
        docs: {
            description: "disallow unused capturing group",
            category: "Best Practices",
            recommended: true,
        },
        fixable: "code",
        schema: [
            {
                type: "object",
                properties: {
                    fixable: { type: "boolean" },
                    allowNamed: { type: "boolean" },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            unusedCapturingGroup: "Capturing group {{identifier}} is defined but never used.",
            makeNonCapturing: "Making this a non-capturing group.",
        },
        type: "suggestion",
        hasSuggestions: true,
    },
    create(context) {
        var _a, _b, _c, _d;
        const fixable = (_b = (_a = context.options[0]) === null || _a === void 0 ? void 0 : _a.fixable) !== null && _b !== void 0 ? _b : false;
        const allowNamed = (_d = (_c = context.options[0]) === null || _c === void 0 ? void 0 : _c.allowNamed) !== null && _d !== void 0 ? _d : false;
        function reportUnused(unused, regexpContext) {
            const { node, getRegexpLocation, fixReplaceNode, getAllCapturingGroups, } = regexpContext;
            if (allowNamed) {
                for (const cgNode of unused) {
                    if (cgNode.name) {
                        unused.delete(cgNode);
                    }
                }
            }
            const fixableGroups = new Set();
            for (const group of [...getAllCapturingGroups()].reverse()) {
                if (unused.has(group)) {
                    fixableGroups.add(group);
                }
                else {
                    break;
                }
            }
            for (const cgNode of unused) {
                const fix = fixableGroups.has(cgNode)
                    ? fixReplaceNode(cgNode, cgNode.raw.replace(/^\((?:\?<[^<>]+>)?/u, "(?:"))
                    : null;
                context.report({
                    node,
                    loc: getRegexpLocation(cgNode),
                    messageId: "unusedCapturingGroup",
                    data: { identifier: getCapturingGroupIdentifier(cgNode) },
                    fix: fixable ? fix : null,
                    suggest: fix
                        ? [{ messageId: "makeNonCapturing", fix }]
                        : null,
                });
            }
        }
        function getCapturingGroupReferences(regexpContext) {
            const capturingGroupReferences = regexpContext.getCapturingGroupReferences();
            if (!capturingGroupReferences.length) {
                return null;
            }
            const indexRefs = [];
            const namedRefs = [];
            let hasUnknownName = false;
            let hasSplit = false;
            for (const ref of capturingGroupReferences) {
                if (ref.type === "UnknownUsage" || ref.type === "UnknownRef") {
                    return null;
                }
                if (ref.type === "ArrayRef" ||
                    ref.type === "ReplacementRef" ||
                    ref.type === "ReplacerFunctionRef") {
                    if (ref.kind === "index") {
                        if (ref.ref != null) {
                            indexRefs.push(ref.ref);
                        }
                        else {
                            return null;
                        }
                    }
                    else {
                        if (ref.ref) {
                            namedRefs.push(ref.ref);
                        }
                        else {
                            hasUnknownName = true;
                        }
                    }
                }
                else if (ref.type === "Split") {
                    hasSplit = true;
                }
            }
            return {
                unusedIndexRef(index) {
                    if (hasSplit) {
                        return false;
                    }
                    return !indexRefs.includes(index);
                },
                unusedNamedRef(name) {
                    if (hasUnknownName) {
                        return false;
                    }
                    return !namedRefs.includes(name);
                },
            };
        }
        function createVisitor(regexpContext) {
            const references = getCapturingGroupReferences(regexpContext);
            if (!references) {
                return {};
            }
            const unused = new Set();
            const allCapturingGroups = regexpContext.getAllCapturingGroups();
            for (let index = 0; index < allCapturingGroups.length; index++) {
                const cgNode = allCapturingGroups[index];
                if (cgNode.references.length ||
                    !references.unusedIndexRef(index + 1)) {
                    continue;
                }
                if (cgNode.name && !references.unusedNamedRef(cgNode.name)) {
                    continue;
                }
                unused.add(cgNode);
            }
            reportUnused(unused, regexpContext);
            return {};
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
