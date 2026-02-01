"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BayesianNetwork = void 0;
const AdmZip = require("adm-zip");
const bayesian_node_1 = require("./bayesian-node");
/**
 * BayesianNetwork is an implementation of a bayesian network capable of randomly sampling from the distribution
 * represented by the network.
 */
class BayesianNetwork {
    constructor({ path }) {
        Object.defineProperty(this, "nodesInSamplingOrder", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "nodesByName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        const zip = new AdmZip(path);
        const zipEntries = zip.getEntries();
        const networkDefinition = JSON.parse(zipEntries[0].getData().toString('utf8'));
        this.nodesInSamplingOrder = networkDefinition.nodes.map((nodeDefinition) => new bayesian_node_1.BayesianNode(nodeDefinition));
        this.nodesByName = this.nodesInSamplingOrder.reduce((p, node) => ({
            ...p,
            [node.name]: node,
        }), {});
    }
    /**
     * Randomly samples from the distribution represented by the bayesian network.
     * @param inputValues Already known node values.
     */
    generateSample(inputValues = {}) {
        const sample = inputValues;
        for (const node of this.nodesInSamplingOrder) {
            if (!(node.name in sample)) {
                sample[node.name] = node.sample(sample);
            }
        }
        return sample;
    }
    /**
     * Randomly samples values from the distribution represented by the bayesian network,
     * making sure the sample is consistent with the provided restrictions on value possibilities.
     * Returns false if no such sample can be generated.
     * @param valuePossibilities A dictionary of lists of possible values for nodes (if a node isn't present in the dictionary, all values are possible).
     */
    generateConsistentSampleWhenPossible(valuePossibilities) {
        return this.recursivelyGenerateConsistentSampleWhenPossible({}, valuePossibilities, 0);
    }
    /**
     * Recursively generates a random sample consistent with the given restrictions on possible values.
     * @param sampleSoFar Already known node values.
     * @param valuePossibilities A dictionary of lists of possible values for nodes (if a node isn't present in the dictionary, all values are possible).
     * @param depth Current recursion depth.
     */
    recursivelyGenerateConsistentSampleWhenPossible(sampleSoFar, valuePossibilities, depth) {
        const bannedValues = [];
        const node = this.nodesInSamplingOrder[depth];
        let sampleValue;
        do {
            sampleValue = node.sampleAccordingToRestrictions(sampleSoFar, valuePossibilities[node.name], bannedValues);
            if (!sampleValue)
                break;
            sampleSoFar[node.name] = sampleValue;
            if (depth + 1 < this.nodesInSamplingOrder.length) {
                const sample = this.recursivelyGenerateConsistentSampleWhenPossible(sampleSoFar, valuePossibilities, depth + 1);
                if (Object.keys(sample).length !== 0) {
                    return sample;
                }
            }
            else {
                return sampleSoFar;
            }
            bannedValues.push(sampleValue);
        } while (sampleValue);
        return {};
    }
    /**
     * Sets the conditional probability distributions of this network's nodes to match the given data.
     * @param dataframe A Danfo.js dataframe containing the data.
     */
    setProbabilitiesAccordingToData(data) {
        this.nodesInSamplingOrder.forEach((node, i) => {
            // eslint-disable-next-line no-console
            console.log(`${i}/${this.nodesInSamplingOrder.length} Setting probabilities for node ${node.name}`);
            const possibleParentValues = {};
            for (const parentName of node.parentNames) {
                possibleParentValues[parentName] =
                    this.nodesByName[parentName].possibleValues;
            }
            node.setProbabilitiesAccordingToData(data, possibleParentValues);
        });
    }
    /**
     * Saves the network definition to the specified file path to be used later.
     * @param networkDefinitionFilePath File path where the network definition should be saved.
     */
    saveNetworkDefinition({ path }) {
        const network = {
            nodes: this.nodesInSamplingOrder,
        };
        // creating archives
        const zip = new AdmZip();
        zip.addFile('network.json', Buffer.from(JSON.stringify(network), 'utf8'));
        zip.writeZip(path);
    }
}
exports.BayesianNetwork = BayesianNetwork;
//# sourceMappingURL=bayesian-network.js.map