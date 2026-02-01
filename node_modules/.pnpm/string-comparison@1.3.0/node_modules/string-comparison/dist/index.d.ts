interface SortMatchResultType {
    member: string;
    index: number;
    rating: number;
}
declare abstract class Similarity {
    static initParams(thanos: string, rival: string): string[];
    protected static checkThanosType(thanos: string): void;
    protected static checkRivalType(rival: string): void;
    protected static checkAvengersType(avengers: string[]): void;
    /**
     * @description 寻找最佳匹配结果
     */
    sortMatch(thanos: string, avengers: string[]): SortMatchResultType[];
    /**
     * @description 比较两个字符串
     */
    abstract similarity(thanos: string, rival: string): number;
    abstract distance(thanos: string, rival: string): number;
}

declare class Cosine extends Similarity {
    similarity(pThanos: string, pRival: string): number;
    distance(thanos: string, rival: string): number;
    private stringVectorization;
}

declare class DiceCoefficient extends Similarity {
    similarity(pThanos: string, pRival: string): number;
    distance(thanos: string, rival: string): number;
}

declare class JaccardIndex extends Similarity {
    similarity(pThanos: string, pRival: string): number;
    distance(thanos: string, rival: string): number;
}

declare class Levenshtein extends Similarity {
    similarity(pThanos: string, pRival: string): number;
    distance(pThanos: string, pRival: string): any;
}

declare class LongestCommonSubsequence extends Similarity {
    static lcsLength(pThanos: string, pRival: string): number;
    similarity(pThanos: string, pRival: string): number;
    distance(pThanos: string, pRival: string): number;
}

declare class MetricLCS extends Similarity {
    static lcsLength(thanos: string, rival: string): any;
    similarity(pThanos: string, pRival: string): number;
    distance(pThanos: string, pRival: string): number;
}

declare class JaroWinkler extends Similarity {
    distance(pThanos: string, pRival: string): number;
    similarity(thanos: string, rival: string): number;
}

declare const output: {
    cosine: Cosine;
    diceCoefficient: DiceCoefficient;
    jaccardIndex: JaccardIndex;
    levenshtein: Levenshtein;
    lcs: LongestCommonSubsequence;
    longestCommonSubsequence: LongestCommonSubsequence;
    mlcs: MetricLCS;
    metricLcs: MetricLCS;
    jaroWinkler: JaroWinkler;
};

export { SortMatchResultType, output as default };
