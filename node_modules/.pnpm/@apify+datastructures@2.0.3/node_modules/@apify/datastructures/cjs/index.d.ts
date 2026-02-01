declare class LinkedListNode<T> {
    readonly data: T;
    prev?: LinkedListNode<T> | null;
    next?: LinkedListNode<T> | null;
    dictKey?: string;
    constructor(data: T);
}
/**
 * A class representing a doubly-linked list.
 */
declare class LinkedList<T = any> {
    head?: LinkedListNode<T> | null;
    tail?: LinkedListNode<T> | null;
    length: number;
    /**
      * Appends a new node with specific data to the end of the linked list.
      */
    add(data: T, toFirstPosition?: boolean): LinkedListNode<T>;
    /**
     * Appends a new node to the end of the linked list or the beginning if firstPosition is true-ish.
     */
    addNode(node: LinkedListNode<T>, toFirstPosition?: boolean): void;
    /**
     * Finds a first node that holds a specific data object. See 'dataEqual' function for a description
     * how the object equality is tested. Function returns null if the data cannot be found.
     */
    find(data: T): LinkedListNode<T> | null;
    removeNode(node: LinkedListNode<T>): void;
    /**
     * Removes the first item from the list. The function
     * returns the item object or null if the list is empty.
     */
    removeFirst(): T | null;
}

/*!
 * This module defines the ListDictionary class, a data structure
 * that combines a linked list and a dictionary.
 *
 * Author: Jan Curn (jan@apify.com)
 * Copyright(c) 2015 Apify. All rights reserved.
 *
 */

/**
 * The main ListDictionary class.
 */
declare class ListDictionary<T = unknown> {
    private linkedList;
    dictionary: Record<string, LinkedListNode<T>>;
    /**
     * Gets the number of item in the list.
     */
    length(): number;
    /**
     * Adds an item to the list. If there is already an item with same key, the function
     * returns false and doesn't make any changes. Otherwise, it returns true.
     */
    add(key: string, item: T, toFirstPosition?: boolean): boolean;
    /**
     * Gets the first item in the list. The function returns null if the list is empty.
     */
    getFirst(): T | null;
    /**
     * Gets the last item in the list. The function returns null if the list is empty.
     */
    getLast(): T | null;
    /**
     * Gets the first item from the list and moves it to the end of the list.
     * The function returns null if the queue is empty.
     */
    moveFirstToEnd(): T | null;
    /**
     * Removes the first item from the list.
     * The function returns the item or null if the list is empty.
     */
    removeFirst(): T | null;
    /**
     * Removes the last item from the list.
     * The function returns the item or null if the list is empty.
     */
    removeLast(): T | null;
    /**
     * Removes an item identified by a key. The function returns the
     * object if it was found or null if it wasn't.
     */
    remove(key: string): T | null;
    /**
     * Finds a request based on the URL.
     */
    get(key: string): T | null;
    /**
     * Removes all items from the list.
     */
    clear(): void;
}

interface LruCacheOptions {
    maxLength: number;
}
/**
 * Least recently used cache.
 */
declare class LruCache<T = any> {
    private options;
    listDictionary: ListDictionary<T>;
    maxLength: number;
    constructor(options: LruCacheOptions);
    /**
     * Gets the number of item in the list.
     */
    length(): number;
    /**
     * Get item from Cache and move to last position
     */
    get(key: string): T | null;
    /**
     * Add new item to cache, remove least used item if length exceeds maxLength
     */
    add(key: string, value: T): boolean;
    /**
     * Remove item with key
     */
    remove(key: string): T | null;
    /**
     * Clear cache
     */
    clear(): void;
}

export { LinkedList, LinkedListNode, ListDictionary, LruCache, type LruCacheOptions };
