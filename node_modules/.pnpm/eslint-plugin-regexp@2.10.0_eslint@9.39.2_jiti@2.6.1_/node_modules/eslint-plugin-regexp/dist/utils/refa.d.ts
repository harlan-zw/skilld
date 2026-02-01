import type { CharSet } from "refa";
import { JS } from "refa";
import type { ReadonlyFlags } from "regexp-ast-analysis";
import type { RegExpContext } from ".";
export declare function getJSRegexppAst(context: RegExpContext, ignoreSticky?: boolean): JS.RegexppAst;
export declare const getParser: (key: RegExpContext) => JS.Parser;
export declare function assertValidFlags(flags: ReadonlyFlags): asserts flags is JS.Flags;
export declare function toCharSetSource(charSetOrChar: CharSet | number, flags: ReadonlyFlags): string;
