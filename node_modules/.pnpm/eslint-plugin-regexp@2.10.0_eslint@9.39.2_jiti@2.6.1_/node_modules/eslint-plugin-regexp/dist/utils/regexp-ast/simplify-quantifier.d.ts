import type { Quantifier } from "@eslint-community/regexpp/ast";
import type { JS } from "refa";
import type { ReadonlyFlags } from "regexp-ast-analysis";
export type CanSimplify = {
    readonly canSimplify: true;
    readonly dependencies: Quantifier[];
};
export type CannotSimplify = {
    readonly canSimplify: false;
};
export type SimplifyResult = CanSimplify | CannotSimplify;
export declare function canSimplifyQuantifier(quantifier: Quantifier, flags: ReadonlyFlags, parser: JS.Parser): SimplifyResult;
