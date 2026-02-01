import type { Quantifier } from "@eslint-community/regexpp/ast";
export declare function getQuantifierOffsets(qNode: Quantifier): [number, number];
export interface Quant {
    min: number;
    max: number;
    greedy?: boolean;
}
export declare function quantToString(quant: Readonly<Quant>): string;
