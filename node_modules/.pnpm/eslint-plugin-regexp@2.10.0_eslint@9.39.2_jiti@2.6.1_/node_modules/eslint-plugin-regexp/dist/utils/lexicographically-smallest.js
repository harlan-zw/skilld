"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLexicographicallySmallest = getLexicographicallySmallest;
exports.getLexicographicallySmallestInConcatenation = getLexicographicallySmallestInConcatenation;
function findMin(array, compare) {
    if (array.length === 0) {
        return undefined;
    }
    let min = array[0];
    for (let i = 1; i < array.length; i++) {
        const item = array[i];
        if (compare(item, min) < 0) {
            min = item;
        }
    }
    return min;
}
function compareWords(a, b) {
    const l = Math.min(a.length, b.length);
    for (let i = 0; i < l; i++) {
        const diff = a[i] - b[i];
        if (diff !== 0) {
            return diff;
        }
    }
    return a.length - b.length;
}
function getLexicographicallySmallest(set) {
    if (set.accept.isEmpty) {
        return set.chars.isEmpty ? undefined : [set.chars.ranges[0].min];
    }
    const words = set.accept.wordSets.map((w) => w.map((c) => c.ranges[0].min));
    return findMin(words, compareWords);
}
function getLexicographicallySmallestInConcatenation(elements) {
    if (elements.length === 1) {
        return getLexicographicallySmallest(elements[0]);
    }
    let smallest = [];
    for (let i = elements.length - 1; i >= 0; i--) {
        const set = elements[i];
        if (set.isEmpty) {
            return undefined;
        }
        else if (set.accept.isEmpty) {
            smallest.unshift(set.chars.ranges[0].min);
        }
        else {
            let words = [
                ...(set.chars.isEmpty ? [] : [[set.chars]]),
                ...set.accept.wordSets,
            ].map((w) => w.map((c) => c.ranges[0].min));
            const seenLengths = new Set();
            words = words.sort(compareWords).filter((w) => {
                if (seenLengths.has(w.length)) {
                    return false;
                }
                seenLengths.add(w.length);
                return true;
            });
            smallest = findMin(words.map((w) => [...w, ...smallest]), compareWords);
        }
    }
    return smallest;
}
