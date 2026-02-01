export declare class CodePointIterator {
    readonly text: string;
    private readonly locs;
    private lastCodePoint;
    start: number;
    end: number;
    /**
     * Initialize this char iterator.
     */
    constructor(text: string);
    next(): number;
    getLocFromIndex(index: number): {
        line: number;
        column: number;
    };
    eat(cp: number): boolean;
    moveAt(offset: number): number;
}
