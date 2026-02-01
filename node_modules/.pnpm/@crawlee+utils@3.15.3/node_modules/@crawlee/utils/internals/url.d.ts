export type SearchParams = string | URLSearchParams | Record<string, string | number | boolean | null | undefined>;
/**
 * Appends search (query string) parameters to a URL, replacing the original value (if any).
 *
 * @param url The URL to append to.
 * @param searchParams The search parameters to be appended.
 * @internal
 */
export declare function applySearchParams(url: URL, searchParams: SearchParams | undefined): void;
//# sourceMappingURL=url.d.ts.map