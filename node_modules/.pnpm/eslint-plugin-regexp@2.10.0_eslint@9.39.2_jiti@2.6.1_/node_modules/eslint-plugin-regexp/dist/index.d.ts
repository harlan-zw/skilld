import * as all from "./configs/all";
import * as flatAll from "./configs/flat/all";
import * as flatRecommended from "./configs/flat/recommended";
import * as recommended from "./configs/recommended";
import type { RuleModule } from "./types";
export * as meta from "./meta";
export declare const configs: {
    recommended: typeof recommended;
    all: typeof all;
    "flat/all": typeof flatAll;
    "flat/recommended": typeof flatRecommended;
};
export declare const rules: {
    [key: string]: RuleModule;
};
