import type { Linter } from 'eslint'

export declare const configs: {
  /**
   * The default recommended config in Flat Config Format
   */
  recommended: Linter.Config
  /**
   * Enable all rules, in Flat Config Format
   */
  all: Linter.Config
}

export type Configs = typeof configs
