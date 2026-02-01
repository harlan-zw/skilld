import type { BayesianNetwork } from './bayesian-network';
/**
 * Performs a set "intersection" on the given (flat) arrays.
 */
export declare function arrayIntersection<T>(a: T[], b: T[]): T[];
/**
 * Performs a set "union" operation on two (flat) arrays.
 */
export declare function arrayUnion<T>(a: T[], b: T[]): T[];
/**
 * Combines two arrays into a single array using the _combiner_ function.
 * @param a First array to be combined.
 * @param b Second array to be combined.
 * @param f Combiner function. It receives the current element from the first array and the current element from the second array.
 * @returns Zipped (multi-dimensional) array.
 */
export declare function arrayZip<T>(a: T[][], b: T[][], f: (aEl: T[], bEl: T[]) => T[]): T[][];
/**
 * Given a `generative-bayesian-network` instance and a set of user constraints, returns an extended
 * set of constraints **induced** by the original constraints and network structure.
 * @param {*} network
 * @param {*} possibleValues
 * @returns
 */
export declare function getConstraintClosure(network: BayesianNetwork, possibleValues: Record<string, string[]>): {
    [x: string]: string[];
};
//# sourceMappingURL=utils.d.ts.map