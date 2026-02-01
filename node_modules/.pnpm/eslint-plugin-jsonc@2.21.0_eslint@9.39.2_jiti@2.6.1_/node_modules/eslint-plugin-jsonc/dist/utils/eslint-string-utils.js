"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGraphemeCount = getGraphemeCount;
const graphemer_1 = __importDefault(require("graphemer"));
const ASCII_REGEX = /^[\u0000-\u007f]*$/u;
let segmenter;
let splitter;
function getGraphemeCount(value) {
    if (ASCII_REGEX.test(value))
        return value.length;
    try {
        if (!segmenter)
            segmenter = new Intl.Segmenter();
        return [...segmenter.segment(value)].length;
    }
    catch (_a) {
    }
    if (!splitter)
        splitter = new (graphemer_1.default.default || graphemer_1.default)();
    return splitter.countGraphemes(value);
}
