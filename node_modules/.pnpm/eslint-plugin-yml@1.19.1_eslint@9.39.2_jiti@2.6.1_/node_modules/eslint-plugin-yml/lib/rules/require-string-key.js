"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../utils/index");
const compat_1 = require("../utils/compat");
exports.default = (0, index_1.createRule)("require-string-key", {
    meta: {
        docs: {
            description: "disallow mapping keys other than strings",
            categories: null,
            extensionRule: false,
            layout: false,
        },
        schema: [],
        messages: {
            expectedString: "The key must be a string.",
        },
        type: "suggestion",
    },
    create(context) {
        var _a;
        const sourceCode = (0, compat_1.getSourceCode)(context);
        if (!((_a = sourceCode.parserServices) === null || _a === void 0 ? void 0 : _a.isYAML)) {
            return {};
        }
        let anchors = {};
        function findAnchor(alias) {
            const target = {
                anchor: null,
                distance: Infinity,
            };
            for (const anchor of anchors[alias.name] || []) {
                if (anchor.range[0] < alias.range[0]) {
                    const distance = alias.range[0] - anchor.range[0];
                    if (target.distance >= distance) {
                        target.anchor = anchor;
                        target.distance = distance;
                    }
                }
            }
            return target.anchor;
        }
        function isStringNode(node) {
            if (!node) {
                return false;
            }
            if (node.type === "YAMLWithMeta") {
                if (node.tag && node.tag.tag === "tag:yaml.org,2002:str") {
                    return true;
                }
                return isStringNode(node.value);
            }
            if (node.type === "YAMLAlias") {
                const anchor = findAnchor(node);
                if (!anchor) {
                    return false;
                }
                return isStringNode(anchor.parent);
            }
            if (node.type !== "YAMLScalar") {
                return false;
            }
            return typeof node.value === "string";
        }
        return {
            YAMLDocument() {
                anchors = {};
            },
            YAMLAnchor(node) {
                const list = anchors[node.name] || (anchors[node.name] = []);
                list.push(node);
            },
            YAMLPair(node) {
                if (!isStringNode(node.key)) {
                    context.report({
                        node: node.key || node,
                        messageId: "expectedString",
                    });
                }
            },
        };
    },
});
