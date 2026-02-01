import type { Alternative, CharacterClassElement, Element, Pattern, StringAlternative } from "@eslint-community/regexpp/ast";
import type { ReadonlyFlags } from "regexp-ast-analysis";
export declare const getIgnoreCaseFlags: (key: ReadonlyFlags) => ReadonlyFlags;
export declare const getCaseSensitiveFlags: (key: ReadonlyFlags) => ReadonlyFlags;
export declare function isCaseVariant(element: Element | CharacterClassElement | StringAlternative | Alternative | Pattern, flags: ReadonlyFlags, wholeCharacterClass?: boolean): boolean;
