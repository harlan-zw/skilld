/**
 * Checks if a frontmatter block contains a title matching the given pattern.
 * @param {string} value The frontmatter content.
 * @param {RegExp|null} pattern The pattern to match against.
 * @returns {boolean} Whether a title was found.
 */
export function frontmatterHasTitle(value: string, pattern: RegExp | null): boolean;
/**
 * Replaces all HTML comments with whitespace.
 * This preserves offsets and locations of characters
 * outside HTML comments by keeping line breaks and replacing
 * other code units with a space character.
 * @param {string} value The string to remove HTML comments from.
 * @returns {string} The string with HTML comments removed.
 */
export function stripHtmlComments(value: string): string;
/**
 * @fileoverview Utility Library
 * @author Nicholas C. Zakas
 */
/**
 * Line ending pattern to match all line endings (CRLF, CR, LF). (CommonMark spec)
 * @see https://spec.commonmark.org/0.31.2/#line-ending
 */
export const lineEndingPattern: RegExp;
/**
 * CommonMark does not allow any white space between the brackets in a reference link.
 * If that pattern is detected, then it's treated as text and not as a link. This pattern
 * is used to detect that situation.
 */
export const illegalShorthandTailPattern: RegExp;
/**
 * Regular expression to match HTML comments, including multiline comments.
 */
export const htmlCommentPattern: RegExp;
