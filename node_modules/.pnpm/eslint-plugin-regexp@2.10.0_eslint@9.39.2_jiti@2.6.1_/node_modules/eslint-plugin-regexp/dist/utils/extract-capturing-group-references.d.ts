import type { Rule } from "eslint";
import type { CallExpression, Expression, Pattern, RestElement } from "estree";
import type { ReadonlyFlags } from "regexp-ast-analysis";
import type { PropertyReference } from "./ast-utils";
import type { TypeTracker } from "./type-tracker";
export type UnknownUsage = {
    type: "UnknownUsage";
    node: Expression;
    on?: "replace" | "replaceAll" | "matchAll";
};
export type WithoutRef = {
    type: "WithoutRef";
    node: Expression;
    on: "search" | "test" | "match" | "replace" | "replaceAll" | "matchAll" | "exec";
};
export type ArrayRef = {
    type: "ArrayRef";
    kind: "index";
    ref: number | null;
    prop: PropertyReference & {
        type: "member" | "destructuring";
    };
} | {
    type: "ArrayRef";
    kind: "name";
    ref: string;
    prop: PropertyReference & {
        type: "member" | "destructuring";
    };
} | {
    type: "ArrayRef";
    kind: "name";
    ref: null;
    prop: PropertyReference & {
        type: "unknown" | "iteration";
    };
};
export type ReplacementRef = {
    type: "ReplacementRef";
    kind: "index";
    ref: number;
    range?: [number, number];
} | {
    type: "ReplacementRef";
    kind: "name";
    ref: string;
    range?: [number, number];
};
export type ReplacerFunctionRef = {
    type: "ReplacerFunctionRef";
    kind: "index";
    ref: number;
    arg: Pattern;
} | {
    type: "ReplacerFunctionRef";
    kind: "name";
    ref: string;
    prop: PropertyReference & {
        type: "member" | "destructuring";
    };
} | {
    type: "ReplacerFunctionRef";
    kind: "name";
    ref: null;
    prop: PropertyReference & {
        type: "unknown" | "iteration";
    };
    arg: null;
} | {
    type: "ReplacerFunctionRef";
    kind: "name";
    ref: null;
    prop: null;
    arg: Pattern;
} | {
    type: "ReplacerFunctionRef";
    kind: "unknown";
    ref: null;
    arg: Pattern;
};
export type Split = {
    type: "Split";
    node: CallExpression;
};
export type UnknownRef = {
    type: "UnknownRef";
    kind: "array";
    prop: PropertyReference & {
        type: "unknown" | "iteration";
    };
} | {
    type: "UnknownRef";
    kind: "replacerFunction";
    arg: RestElement;
};
export type CapturingGroupReference = ArrayRef | ReplacementRef | ReplacerFunctionRef | UnknownRef | WithoutRef | Split | UnknownUsage;
export declare function extractCapturingGroupReferences(node: Expression, flags: ReadonlyFlags, typeTracer: TypeTracker, countOfCapturingGroup: number, context: Rule.RuleContext, options: {
    strictTypes: boolean;
}): Iterable<CapturingGroupReference>;
