import { t as RuleOptions } from "./rule-options.mjs";

//#region dts/define-config-support.d.ts
declare module 'eslint-define-config' {
  export interface CustomRuleOptions extends RuleOptions {}
}