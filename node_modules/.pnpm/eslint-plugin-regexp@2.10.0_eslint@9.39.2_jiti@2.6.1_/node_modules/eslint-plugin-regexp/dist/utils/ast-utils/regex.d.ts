import type { AST, SourceCode } from "eslint";
import type * as ESTree from "estree";
export declare function getFlagsRange(flagsNode: ESTree.RegExpLiteral): AST.Range;
export declare function getFlagsRange(flagsNode: ESTree.Expression | null): AST.Range | null;
export declare function getFlagsLocation(sourceCode: SourceCode, regexpNode: ESTree.CallExpression | ESTree.RegExpLiteral, flagsNode: ESTree.Expression | null): AST.SourceLocation;
export declare function getFlagRange(sourceCode: SourceCode, flagsNode: ESTree.Expression | null, flag: string): AST.Range | null;
export declare function getFlagLocation(sourceCode: SourceCode, regexpNode: ESTree.CallExpression | ESTree.RegExpLiteral, flagsNode: ESTree.Expression | null, flag: string): AST.SourceLocation;
