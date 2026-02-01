export type DeleteEntry<E> = {
    type: "delete";
    a: E;
};
export type InsertEntry<E> = {
    type: "insert";
    b: E;
};
export type CommonEntry<E> = {
    type: "common";
    a: E;
    b: E;
};
export type DiffEntry<E> = DeleteEntry<E> | InsertEntry<E> | CommonEntry<E>;
export declare function calcShortestEditScript<E>(a: E[], b: E[]): DiffEntry<E>[];
