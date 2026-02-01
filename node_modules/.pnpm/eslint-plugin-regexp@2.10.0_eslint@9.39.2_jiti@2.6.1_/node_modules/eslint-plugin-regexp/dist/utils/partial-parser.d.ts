import type { AST } from "@eslint-community/regexpp";
import type { Expression, NoParent } from "refa";
import { JS } from "refa";
export type NestedAlternative = AST.Alternative | AST.CharacterClassElement | AST.StringAlternative;
export declare class PartialParser {
    private readonly parser;
    private readonly options;
    private readonly nativeCache;
    constructor(parser: JS.Parser, options?: JS.ParseOptions);
    parse(node: JS.ParsableElement, alternative: NestedAlternative): NoParent<Expression>;
    private parseAlternatives;
    private parseAlternative;
    private parseStringAlternatives;
    private parseStringAlternative;
    private parseElement;
    private parseCharacterClass;
    private nativeParseElement;
    private nativeParseElementUncached;
}
