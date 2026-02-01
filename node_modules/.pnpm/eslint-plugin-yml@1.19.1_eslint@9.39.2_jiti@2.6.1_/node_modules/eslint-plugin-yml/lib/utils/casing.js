"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowedCaseOptions = void 0;
exports.kebabCase = kebabCase;
exports.isKebabCase = isKebabCase;
exports.snakeCase = snakeCase;
exports.isSnakeCase = isSnakeCase;
exports.screamingSnakeCase = screamingSnakeCase;
exports.isScreamingSnakeCase = isScreamingSnakeCase;
exports.camelCase = camelCase;
exports.isCamelCase = isCamelCase;
exports.pascalCase = pascalCase;
exports.isPascalCase = isPascalCase;
exports.getChecker = getChecker;
exports.getConverter = getConverter;
exports.getExactConverter = getExactConverter;
exports.allowedCaseOptions = [
    "camelCase",
    "kebab-case",
    "PascalCase",
    "snake_case",
    "SCREAMING_SNAKE_CASE",
];
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
function hasSymbols(str) {
    return /[\u0021-\u0023\u0025-\u002c./\u003a-\u0040\u005b-\u005e`\u007b-\u007d]/u.test(str);
}
function hasUpper(str) {
    return /[A-Z]/u.test(str);
}
function hasLower(str) {
    return /[a-z]/u.test(str);
}
function kebabCase(str) {
    let res = str.replace(/_/gu, "-");
    if (hasLower(res)) {
        res = res.replace(/\B([A-Z])/gu, "-$1");
    }
    return res.toLowerCase();
}
function isKebabCase(str) {
    if (hasUpper(str) ||
        hasSymbols(str) ||
        str.startsWith("-") ||
        /_|--|\s/u.test(str)) {
        return false;
    }
    return true;
}
function snakeCase(str) {
    let res = str.replace(/-/gu, "_");
    if (hasLower(res)) {
        res = res.replace(/\B([A-Z])/gu, "_$1");
    }
    return res.toLowerCase();
}
function isSnakeCase(str) {
    if (hasUpper(str) || hasSymbols(str) || /-|__|\s/u.test(str)) {
        return false;
    }
    return true;
}
function screamingSnakeCase(str) {
    let res = str.replace(/-/gu, "_");
    if (hasLower(res)) {
        res = res.replace(/\B([A-Z])/gu, "_$1");
    }
    return res.toUpperCase();
}
function isScreamingSnakeCase(str) {
    if (hasLower(str) || hasSymbols(str) || /-|__|\s/u.test(str)) {
        return false;
    }
    return true;
}
function camelCase(str) {
    if (isPascalCase(str)) {
        return str.charAt(0).toLowerCase() + str.slice(1);
    }
    let s = str;
    if (!hasLower(s)) {
        s = s.toLowerCase();
    }
    return s.replace(/[-_](\w)/gu, (_, c) => (c ? c.toUpperCase() : ""));
}
function isCamelCase(str) {
    if (hasSymbols(str) ||
        /^[A-Z]/u.test(str) ||
        /[\s\-_]/u.test(str)) {
        return false;
    }
    return true;
}
function pascalCase(str) {
    return capitalize(camelCase(str));
}
function isPascalCase(str) {
    if (hasSymbols(str) ||
        /^[a-z]/u.test(str) ||
        /[\s\-_]/u.test(str)) {
        return false;
    }
    return true;
}
const convertersMap = {
    "kebab-case": kebabCase,
    snake_case: snakeCase,
    SCREAMING_SNAKE_CASE: screamingSnakeCase,
    camelCase,
    PascalCase: pascalCase,
};
const checkersMap = {
    "kebab-case": isKebabCase,
    snake_case: isSnakeCase,
    SCREAMING_SNAKE_CASE: isScreamingSnakeCase,
    camelCase: isCamelCase,
    PascalCase: isPascalCase,
};
function getChecker(name) {
    return checkersMap[name] || isPascalCase;
}
function getConverter(name) {
    return convertersMap[name] || pascalCase;
}
function getExactConverter(name) {
    const converter = getConverter(name);
    const checker = getChecker(name);
    return (str) => {
        const result = converter(str);
        return checker(result) ? result : str;
    };
}
