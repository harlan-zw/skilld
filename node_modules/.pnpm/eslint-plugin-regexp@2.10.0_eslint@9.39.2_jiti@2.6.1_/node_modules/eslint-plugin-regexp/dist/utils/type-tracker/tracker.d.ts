import type { Rule } from "eslint";
import type * as ES from "estree";
export type TypeTracker = {
    isString: (node: ES.Expression) => boolean;
    maybeString: (node: ES.Expression) => boolean;
    isRegExp: (node: ES.Expression) => boolean;
    getTypes: (node: ES.Expression) => string[];
};
export declare function createTypeTracker(context: Rule.RuleContext): TypeTracker;
