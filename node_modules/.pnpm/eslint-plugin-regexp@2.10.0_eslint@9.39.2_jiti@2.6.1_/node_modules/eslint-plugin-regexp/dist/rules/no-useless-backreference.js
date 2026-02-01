"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
const mention_1 = require("../utils/mention");
function hasNegatedLookaroundInBetween(from, to) {
    for (let p = from.parent; p && p !== to; p = p.parent) {
        if (p.type === "Assertion" &&
            (p.kind === "lookahead" || p.kind === "lookbehind") &&
            p.negate) {
            return true;
        }
    }
    return false;
}
function getUselessProblem(backRef, flags) {
    const groups = [backRef.resolved].flat();
    const problems = [];
    for (const group of groups) {
        const messageId = getUselessMessageId(backRef, group, flags);
        if (!messageId) {
            return null;
        }
        problems.push({ messageId, group });
    }
    if (problems.length === 0) {
        return null;
    }
    let problemsToReport;
    const problemsInSameDisjunction = problems.filter((problem) => problem.messageId !== "disjunctive");
    if (problemsInSameDisjunction.length) {
        problemsToReport = problemsInSameDisjunction;
    }
    else {
        problemsToReport = problems;
    }
    const [{ messageId, group }, ...other] = problemsToReport;
    let otherGroups = "";
    if (other.length === 1) {
        otherGroups = " and another group";
    }
    else if (other.length > 1) {
        otherGroups = ` and other ${other.length} groups`;
    }
    return {
        messageId,
        group,
        otherGroups,
    };
}
function getUselessMessageId(backRef, group, flags) {
    const closestAncestor = (0, regexp_ast_analysis_1.getClosestAncestor)(backRef, group);
    if (closestAncestor === group) {
        return "nested";
    }
    else if (closestAncestor.type !== "Alternative") {
        return "disjunctive";
    }
    if (hasNegatedLookaroundInBetween(group, closestAncestor)) {
        return "intoNegativeLookaround";
    }
    const matchingDir = (0, regexp_ast_analysis_1.getMatchingDirection)(closestAncestor);
    if (matchingDir === "ltr" && backRef.end <= group.start) {
        return "forward";
    }
    else if (matchingDir === "rtl" && group.end <= backRef.start) {
        return "backward";
    }
    if ((0, regexp_ast_analysis_1.isZeroLength)(group, flags)) {
        return "empty";
    }
    return null;
}
exports.default = (0, utils_1.createRule)("no-useless-backreference", {
    meta: {
        docs: {
            description: "disallow useless backreferences in regular expressions",
            category: "Possible Errors",
            recommended: true,
        },
        schema: [],
        messages: {
            nested: "Backreference {{ bref }} will be ignored. It references group {{ group }}{{ otherGroups }} from within that group.",
            forward: "Backreference {{ bref }} will be ignored. It references group {{ group }}{{ otherGroups }} which appears later in the pattern.",
            backward: "Backreference {{ bref }} will be ignored. It references group {{ group }}{{ otherGroups }} which appears before in the same lookbehind.",
            disjunctive: "Backreference {{ bref }} will be ignored. It references group {{ group }}{{ otherGroups }} which is in another alternative.",
            intoNegativeLookaround: "Backreference {{ bref }} will be ignored. It references group {{ group }}{{ otherGroups }} which is in a negative lookaround.",
            empty: "Backreference {{ bref }} will be ignored. It references group {{ group }}{{ otherGroups }} which always captures zero characters.",
        },
        type: "suggestion",
    },
    create(context) {
        function createVisitor({ node, flags, getRegexpLocation, }) {
            return {
                onBackreferenceEnter(backRef) {
                    const problem = getUselessProblem(backRef, flags);
                    if (problem) {
                        context.report({
                            node,
                            loc: getRegexpLocation(backRef),
                            messageId: problem.messageId,
                            data: {
                                bref: (0, mention_1.mention)(backRef),
                                group: (0, mention_1.mention)(problem.group),
                                otherGroups: problem.otherGroups,
                            },
                        });
                    }
                },
            };
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
