/**
@hidden
*/
export type CollectionLike<T> = {
    has: (item: T) => boolean;
};
/**
Retrieve the missing values in a collection based on an array of items.

@hidden

@param source - Source collection to search through.
@param items - Items to search for.
@param maxValues - Maximum number of values after the search process is stopped. Default: 5.
*/
declare const hasItems: <T>(source: CollectionLike<T>, items: readonly T[], maxValues?: number) => true | T[];
export default hasItems;
