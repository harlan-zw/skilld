"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const get_auto_jsonc_rules_config_1 = require("../utils/get-auto-jsonc-rules-config");
exports.default = (0, utils_1.createRule)("auto", {
    meta: {
        docs: {
            description: "apply jsonc rules similar to your configured ESLint core rules",
            recommended: null,
            extensionRule: false,
            layout: false,
        },
        fixable: "code",
        schema: [],
        messages: {},
        type: "suggestion",
    },
    create(context, params) {
        if (!context.sourceCode.parserServices.isJSON) {
            return {};
        }
        const autoConfig = (0, get_auto_jsonc_rules_config_1.getAutoConfig)(context.cwd, context.filename);
        const visitor = {};
        for (const ruleId of Object.keys(autoConfig)) {
            const rule = require(`./${ruleId.replace(/^jsonc\//u, "")}`).default;
            const subContext = {
                __proto__: context,
                options: getRuleOptions(autoConfig[ruleId], rule.jsoncDefineRule),
                report(options) {
                    if (options.messageId) {
                        options.message = `[${ruleId}] ${rule.meta.messages[options.messageId]}`;
                        delete options.messageId;
                    }
                    else {
                        options.message = `[${ruleId}] ${options.message}`;
                    }
                    context.report(options);
                },
            };
            const ruleVisitor = rule.jsoncDefineRule.create(subContext, params);
            for (const key of Object.keys(ruleVisitor)) {
                const newVisit = ruleVisitor[key];
                const oldVisit = visitor[key];
                if (!newVisit) {
                    continue;
                }
                if (!oldVisit) {
                    visitor[key] = ruleVisitor[key];
                }
                else {
                    visitor[key] = ((...args) => {
                        oldVisit(...args);
                        newVisit(...args);
                    });
                }
            }
        }
        return visitor;
    },
});
function getRuleOptions(options, rule) {
    const jsonOptions = Array.isArray(options) ? options.slice(1) : [];
    if (rule.meta.defaultOptions) {
        rule.meta.defaultOptions.forEach((option, index) => {
            if (jsonOptions[index] === undefined) {
                jsonOptions[index] = option;
            }
        });
    }
    return jsonOptions;
}
