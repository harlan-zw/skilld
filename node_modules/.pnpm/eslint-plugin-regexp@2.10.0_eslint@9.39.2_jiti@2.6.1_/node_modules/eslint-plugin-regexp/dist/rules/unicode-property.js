"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const unicode_alias_1 = require("../utils/unicode-alias");
function isGeneralCategory(key) {
    return unicode_alias_1.UNICODE_CATEGORY_ALIAS.toShort(key) === "gc";
}
exports.default = (0, utils_1.createRule)("unicode-property", {
    meta: {
        docs: {
            description: "enforce consistent naming of unicode properties",
            category: "Stylistic Issues",
            recommended: false,
        },
        schema: [
            {
                type: "object",
                properties: {
                    generalCategory: {
                        enum: ["always", "never", "ignore"],
                    },
                    key: {
                        enum: ["short", "long", "ignore"],
                    },
                    property: {
                        anyOf: [
                            {
                                enum: ["short", "long", "ignore"],
                            },
                            {
                                type: "object",
                                properties: {
                                    binary: {
                                        enum: ["short", "long", "ignore"],
                                    },
                                    generalCategory: {
                                        enum: ["short", "long", "ignore"],
                                    },
                                    script: {
                                        enum: ["short", "long", "ignore"],
                                    },
                                },
                                additionalProperties: false,
                            },
                        ],
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            unnecessaryGc: "Unnecessary '{{ gc }}=' in Unicode property.",
            missingGc: "Missing '{{ gc }}=' in Unicode property.",
            expectedKey: "Excepted {{ len }} key. Use '{{ key }}' instead.",
            expectedProperty: "Excepted {{ len }} {{ type }} property. Use '{{ prop }}' instead.",
        },
        type: "suggestion",
        fixable: "code",
    },
    create(context) {
        const { generalCategory = "never", key: keyFormat = "ignore", property = {
            binary: "ignore",
            generalCategory: "ignore",
            script: "long",
        }, } = (context.options[0] || {});
        let defaultPropertyFormat = "long";
        if (typeof property === "string") {
            defaultPropertyFormat = property;
        }
        const { binary: binaryFormat = defaultPropertyFormat, generalCategory: generalCategoryFormat = defaultPropertyFormat, script: scriptFormat = defaultPropertyFormat, } = typeof property === "string" ? {} : property;
        function createVisitor(regexpContext) {
            const { node, getRegexpLocation, fixReplaceNode } = regexpContext;
            function onUnicodeProperty(cs) {
                const keyValueSyntax = cs.raw.includes("=");
                function fixReplace(inner) {
                    return fixReplaceNode(cs, `${cs.raw.slice(0, 2)}{${inner}}`);
                }
                function getKeyLocation() {
                    const offset = "\\p{".length;
                    if (keyValueSyntax) {
                        return getRegexpLocation({
                            start: cs.start + offset,
                            end: cs.start + offset + cs.key.length,
                        });
                    }
                    return getRegexpLocation({
                        start: cs.start + offset,
                        end: cs.end - 1,
                    });
                }
                function getValueLocation() {
                    return getRegexpLocation({
                        start: cs.end - 1 - (cs.value || cs.key).length,
                        end: cs.end - 1,
                    });
                }
                const { key, value } = cs;
                if (value === null) {
                    if (binaryFormat !== "ignore") {
                        const expected = binaryFormat === "short"
                            ? unicode_alias_1.UNICODE_BINARY_PROPERTY_ALIAS.toShort(key)
                            : unicode_alias_1.UNICODE_BINARY_PROPERTY_ALIAS.toLong(key);
                        if (key !== expected) {
                            context.report({
                                node,
                                loc: getKeyLocation(),
                                messageId: "expectedProperty",
                                data: {
                                    len: binaryFormat,
                                    type: "binary",
                                    prop: expected,
                                },
                                fix: fixReplace(expected),
                            });
                        }
                    }
                }
                else {
                    const isGC = isGeneralCategory(key);
                    let handledKey = false;
                    if (isGC) {
                        if (keyValueSyntax && generalCategory === "never") {
                            context.report({
                                node,
                                loc: getKeyLocation(),
                                messageId: "unnecessaryGc",
                                data: { gc: key },
                                fix: fixReplace(value),
                            });
                            handledKey = true;
                        }
                        if (!keyValueSyntax && generalCategory === "always") {
                            const missing = keyFormat === "long" ? "General_Category" : "gc";
                            context.report({
                                node,
                                loc: getRegexpLocation(cs),
                                messageId: "missingGc",
                                data: { gc: missing },
                                fix: fixReplace(`${missing}=${value}`),
                            });
                            handledKey = true;
                        }
                    }
                    if (!handledKey &&
                        keyValueSyntax &&
                        keyFormat !== "ignore") {
                        const expected = keyFormat === "short"
                            ? unicode_alias_1.UNICODE_CATEGORY_ALIAS.toShort(key)
                            : unicode_alias_1.UNICODE_CATEGORY_ALIAS.toLong(key);
                        if (key !== expected) {
                            context.report({
                                node,
                                loc: getKeyLocation(),
                                messageId: "expectedKey",
                                data: { len: keyFormat, key: expected },
                                fix: fixReplace(`${expected}=${value}`),
                            });
                        }
                    }
                    const valueFormat = isGC
                        ? generalCategoryFormat
                        : scriptFormat;
                    if (valueFormat !== "ignore") {
                        const aliasMap = isGC
                            ? unicode_alias_1.UNICODE_GENERAL_CATEGORY_ALIAS
                            : unicode_alias_1.UNICODE_SCRIPT_ALIAS;
                        const expected = valueFormat === "short"
                            ? aliasMap.toShort(value)
                            : aliasMap.toLong(value);
                        if (value !== expected) {
                            const prefix = keyValueSyntax ? `${key}=` : "";
                            const type = isGC ? "General_Category" : "Script";
                            context.report({
                                node,
                                loc: getValueLocation(),
                                messageId: "expectedProperty",
                                data: {
                                    len: valueFormat,
                                    type,
                                    prop: expected,
                                },
                                fix: fixReplace(`${prefix}${expected}`),
                            });
                        }
                    }
                }
            }
            return {
                onCharacterSetEnter(cs) {
                    if (cs.kind === "property") {
                        onUnicodeProperty(cs);
                    }
                },
            };
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
