"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maxBitToMaxValues = maxBitToMaxValues;
function maxBitToMaxValues(maxBit) {
    const binaryMax = [];
    const minusMax = [0];
    const plusMax = [0];
    const hexMax = [0];
    const octalMax = [0];
    for (let index = 0; index < maxBit; index++) {
        const binaryNum = index === 0 ? 1 : 0;
        binaryMax.push(binaryNum);
        processDigits(minusMax, binaryNum, 10);
        processDigits(hexMax, binaryNum, 16);
        processDigits(octalMax, binaryNum, 8);
        if (index > 0) {
            processDigits(plusMax, 1, 10);
        }
    }
    return {
        "+": plusMax.reverse().join(""),
        "-": minusMax.reverse().join(""),
        "0x": hexMax
            .map((i) => i.toString(16))
            .reverse()
            .join("")
            .toLowerCase(),
        "0o": octalMax.reverse().join(""),
        "0b": binaryMax.join(""),
    };
    function processDigits(digits, binaryNum, radix) {
        let num = binaryNum;
        for (let place = 0; place < digits.length; place++) {
            num = digits[place] * 2 + num;
            digits[place] = num % radix;
            num = Math.floor(num / radix);
        }
        while (num > 0) {
            digits.push(num % radix);
            num = Math.floor(num / radix);
        }
    }
}
