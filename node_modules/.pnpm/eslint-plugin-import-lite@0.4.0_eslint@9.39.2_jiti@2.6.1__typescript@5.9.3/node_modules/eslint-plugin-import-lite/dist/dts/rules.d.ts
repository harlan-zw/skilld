import type { Rule } from 'eslint'
import type { RuleOptions } from './rule-options'

type RuleName<K extends string>
  = K extends `${string}/${infer Name}`
    ? RuleName<Name>
    : K

export type Rules = Required<{
  [K in keyof RuleOptions as RuleName<K>]: Rule.RuleModule
}>
