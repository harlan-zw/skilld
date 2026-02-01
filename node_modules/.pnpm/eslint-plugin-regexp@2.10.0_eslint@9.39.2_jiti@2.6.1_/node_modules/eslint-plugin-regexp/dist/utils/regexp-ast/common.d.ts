import type { Alternative, CapturingGroup, Element, Node, Pattern, RegExpLiteral } from "@eslint-community/regexpp/ast";
import type { FirstConsumedChar, MatchingDirection, ReadonlyFlags } from "regexp-ast-analysis";
export type ShortCircuit = (aNode: Node, bNode: Node) => boolean | null;
export declare function getFirstConsumedCharPlusAfter(element: Element | Alternative, direction: MatchingDirection, flags: ReadonlyFlags): FirstConsumedChar;
export interface CapturingGroups {
    groups: CapturingGroup[];
    names: Set<string>;
    count: number;
}
export declare function extractCaptures(pattern: RegExpLiteral | Pattern): CapturingGroups;
export declare function hasCapturingGroup(node: Node): boolean;
