"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcShortestEditScript = calcShortestEditScript;
const diff_sequences_1 = __importDefault(require("diff-sequences"));
function calcShortestEditScript(a, b) {
    let aIndex = 0;
    let bIndex = 0;
    const result = [];
    (0, diff_sequences_1.default)(a.length, b.length, (aIndex, bIndex) => a[aIndex] === b[bIndex], (nCommon, aCommon, bCommon) => {
        pushDelIns(aIndex, aCommon, bIndex, bCommon);
        aIndex = aCommon + nCommon;
        bIndex = bCommon + nCommon;
        if (nCommon > 0) {
            for (let index = 0; index < nCommon; index++) {
                const elementA = a[aCommon + index];
                const elementB = b[bCommon + index];
                result.push({
                    type: "common",
                    a: elementA,
                    b: elementB,
                });
            }
        }
    });
    pushDelIns(aIndex, a.length, bIndex, b.length);
    return result;
    function pushDelIns(aStart, aEnd, bStart, bEnd) {
        for (const element of a.slice(aStart, aEnd)) {
            result.push({
                type: "delete",
                a: element,
            });
        }
        for (const element of b.slice(bStart, bEnd)) {
            result.push({
                type: "insert",
                b: element,
            });
        }
    }
}
