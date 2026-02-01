import { RecordList } from './bayesian-network';
/**
 * Bayesian network node definition.
 */
interface NodeDefinition {
    /**
     * Name of this node.
     */
    name: string;
    /**
     * Name of the current node's parent nodes.
     */
    parentNames: string[];
    /**
     * Array of possible values for this node.
     */
    possibleValues: string[];
    /**
     * Conditional probabilities for the `possibleValues`, given specified ancestor values.
     */
    conditionalProbabilities: any;
}
/**
 * BayesianNode is an implementation of a single node in a bayesian network allowing sampling from its conditional distribution.
 */
export declare class BayesianNode {
    private nodeDefinition;
    /**
     * @param nodeDefinition Node structure and distributions definition taken from the network definition file.
     */
    constructor(nodeDefinition: NodeDefinition);
    toJSON(): NodeDefinition;
    /**
     * Extracts unconditional probabilities of node values given the values of the parent nodes
     * @param parentValues Parent nodes values.
     */
    private getProbabilitiesGivenKnownValues;
    /**
     * Randomly samples from the given values using the given probabilities
     * @param possibleValues A list of values to sample from.
     * @param totalProbabilityOfPossibleValues Sum of probabilities of possibleValues in the conditional distribution.
     * @param probabilities A dictionary of probabilities from the conditional distribution, indexed by the values.
     */
    private sampleRandomValueFromPossibilities;
    /**
     * Randomly samples from the conditional distribution of this node given values of parents
     * @param parentValues Values of the parent nodes.
     */
    sample(parentValues?: {}): string;
    /**
     * Randomly samples from the conditional distribution of this node given restrictions on the possible
     * values and the values of the parents.
     * @param parentValues Values of the parent nodes.
     * @param valuePossibilities List of possible values for this node.
     * @param bannedValues What values of this node are banned.
     */
    sampleAccordingToRestrictions(parentValues: Record<string, string>, valuePossibilities: string[], bannedValues: string[]): string | false;
    /**
     * Sets the conditional probability distribution for this node to match the given data.
     * @param data A RecordList containing the data.
     * @param possibleParentValues A dictionary of lists of possible values for parent nodes.
     */
    setProbabilitiesAccordingToData(data: RecordList, possibleParentValues?: Record<string, string[]>): void;
    /**
     * Recursively calculates the conditional probability distribution for this node from the data.
     * @param dataframe A Danfo.js dataframe containing the data.
     * @param possibleParentValues A dictionary of lists of possible values for parent nodes.
     * @param depth Depth of the current recursive call.
     */
    private recursivelyCalculateConditionalProbabilitiesAccordingToData;
    get name(): string;
    get parentNames(): string[];
    get possibleValues(): string[];
}
export {};
//# sourceMappingURL=bayesian-node.d.ts.map