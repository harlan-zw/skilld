export type RecordList = Record<string, any>[];
/**
 * BayesianNetwork is an implementation of a bayesian network capable of randomly sampling from the distribution
 * represented by the network.
 */
export declare class BayesianNetwork {
    private nodesInSamplingOrder;
    private nodesByName;
    constructor({ path }: {
        path: string;
    });
    /**
     * Randomly samples from the distribution represented by the bayesian network.
     * @param inputValues Already known node values.
     */
    generateSample(inputValues?: Record<string, string>): Record<string, string>;
    /**
     * Randomly samples values from the distribution represented by the bayesian network,
     * making sure the sample is consistent with the provided restrictions on value possibilities.
     * Returns false if no such sample can be generated.
     * @param valuePossibilities A dictionary of lists of possible values for nodes (if a node isn't present in the dictionary, all values are possible).
     */
    generateConsistentSampleWhenPossible(valuePossibilities: Record<string, string[]>): Record<string, string>;
    /**
     * Recursively generates a random sample consistent with the given restrictions on possible values.
     * @param sampleSoFar Already known node values.
     * @param valuePossibilities A dictionary of lists of possible values for nodes (if a node isn't present in the dictionary, all values are possible).
     * @param depth Current recursion depth.
     */
    private recursivelyGenerateConsistentSampleWhenPossible;
    /**
     * Sets the conditional probability distributions of this network's nodes to match the given data.
     * @param dataframe A Danfo.js dataframe containing the data.
     */
    setProbabilitiesAccordingToData(data: RecordList): void;
    /**
     * Saves the network definition to the specified file path to be used later.
     * @param networkDefinitionFilePath File path where the network definition should be saved.
     */
    saveNetworkDefinition({ path }: {
        path: string;
    }): void;
}
//# sourceMappingURL=bayesian-network.d.ts.map