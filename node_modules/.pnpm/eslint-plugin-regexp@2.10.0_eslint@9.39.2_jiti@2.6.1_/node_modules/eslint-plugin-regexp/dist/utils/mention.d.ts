import type { CharacterClassElement, Node } from "@eslint-community/regexpp/ast";
export declare function mentionChar(element: CharacterClassElement): string;
export declare function mention(element: Node | string): string;
export declare function joinEnglishList(list: readonly string[]): string;
