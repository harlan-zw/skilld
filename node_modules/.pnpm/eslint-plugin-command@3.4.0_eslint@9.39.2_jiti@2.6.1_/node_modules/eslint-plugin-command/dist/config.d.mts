import { i as ESLintPluginCommandOptions } from "./types-CtFtnOf-.mjs";
import { Linter } from "eslint";

//#region src/config.d.ts
declare function config(options?: ESLintPluginCommandOptions): Linter.FlatConfig;
//#endregion
export { config as default };