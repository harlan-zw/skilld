import type { Node } from "@eslint-community/regexpp/ast";
import type { ReadonlyFlags } from "regexp-ast-analysis";
import type { ShortCircuit } from "./common";
export declare function isEqualNodes<N extends Node>(a: N, b: N, flags: ReadonlyFlags, shortCircuit?: ShortCircuit): boolean;
