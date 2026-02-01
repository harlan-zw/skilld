import type { Node } from "@eslint-community/regexpp/ast";
import type { ReadonlyFlags } from "regexp-ast-analysis";
type Options = {
    flags: ReadonlyFlags;
    canOmitRight: boolean;
};
export declare function isCoveredNode(left: Node, right: Node, options: Options): boolean;
export {};
