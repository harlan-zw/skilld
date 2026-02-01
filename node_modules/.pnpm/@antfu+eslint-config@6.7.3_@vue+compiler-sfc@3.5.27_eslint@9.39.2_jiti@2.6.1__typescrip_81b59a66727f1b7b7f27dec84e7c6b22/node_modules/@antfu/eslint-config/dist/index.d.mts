import { FlatConfigComposer } from "eslint-flat-config-utils";
import { Linter } from "eslint";
import { StylisticCustomizeOptions } from "@stylistic/eslint-plugin";
import { ParserOptions } from "@typescript-eslint/parser";
import { FlatGitignoreOptions } from "eslint-config-flat-gitignore";
import { Options } from "eslint-processor-vue-blocks";

//#region src/typegen.d.ts
interface RuleOptions {
  /**
   * Enforce getter and setter pairs in objects and classes
   * @see https://eslint.org/docs/latest/rules/accessor-pairs
   */
  'accessor-pairs'?: Linter.RuleEntry<AccessorPairs>;
  /**
   * Having line breaks styles to object, array and named imports
   * @see https://github.com/antfu/eslint-plugin-antfu/blob/main/src/rules/consistent-chaining.md
   */
  'antfu/consistent-chaining'?: Linter.RuleEntry<AntfuConsistentChaining>;
  /**
   * Having line breaks styles to object, array and named imports
   * @see https://github.com/antfu/eslint-plugin-antfu/blob/main/src/rules/consistent-list-newline.md
   */
  'antfu/consistent-list-newline'?: Linter.RuleEntry<AntfuConsistentListNewline>;
  /**
   * Enforce Anthony's style of curly bracket
   * @see https://github.com/antfu/eslint-plugin-antfu/blob/main/src/rules/curly.md
   */
  'antfu/curly'?: Linter.RuleEntry<[]>;
  /**
   * Newline after if
   * @see https://github.com/antfu/eslint-plugin-antfu/blob/main/src/rules/if-newline.md
   */
  'antfu/if-newline'?: Linter.RuleEntry<[]>;
  /**
   * Fix duplication in imports
   * @see https://github.com/antfu/eslint-plugin-antfu/blob/main/src/rules/import-dedupe.md
   */
  'antfu/import-dedupe'?: Linter.RuleEntry<[]>;
  /**
   * Enforce consistent indentation in `unindent` template tag
   * @see https://github.com/antfu/eslint-plugin-antfu/blob/main/src/rules/indent-unindent.md
   */
  'antfu/indent-unindent'?: Linter.RuleEntry<AntfuIndentUnindent>;
  /**
   * Prevent importing modules in `dist` folder
   * @see https://github.com/antfu/eslint-plugin-antfu/blob/main/src/rules/no-import-dist.test.ts
   */
  'antfu/no-import-dist'?: Linter.RuleEntry<[]>;
  /**
   * Prevent importing modules in `node_modules` folder by relative or absolute path
   * @see https://github.com/antfu/eslint-plugin-antfu/blob/main/src/rules/no-import-node-modules-by-path.test.ts
   */
  'antfu/no-import-node-modules-by-path'?: Linter.RuleEntry<[]>;
  /**
   * Prevent using top-level await
   * @see https://github.com/antfu/eslint-plugin-antfu/blob/main/src/rules/no-top-level-await.test.ts
   */
  'antfu/no-top-level-await'?: Linter.RuleEntry<[]>;
  /**
   * Do not use `exports =`
   * @see https://github.com/antfu/eslint-plugin-antfu/blob/main/src/rules/no-ts-export-equal.test.ts
   */
  'antfu/no-ts-export-equal'?: Linter.RuleEntry<[]>;
  /**
   * Enforce top-level functions to be declared with function keyword
   * @see https://github.com/antfu/eslint-plugin-antfu/blob/main/src/rules/top-level-function.md
   */
  'antfu/top-level-function'?: Linter.RuleEntry<[]>;
  /**
   * Enforce linebreaks after opening and before closing array brackets
   * @see https://eslint.org/docs/latest/rules/array-bracket-newline
   * @deprecated
   */
  'array-bracket-newline'?: Linter.RuleEntry<ArrayBracketNewline>;
  /**
   * Enforce consistent spacing inside array brackets
   * @see https://eslint.org/docs/latest/rules/array-bracket-spacing
   * @deprecated
   */
  'array-bracket-spacing'?: Linter.RuleEntry<ArrayBracketSpacing>;
  /**
   * Enforce `return` statements in callbacks of array methods
   * @see https://eslint.org/docs/latest/rules/array-callback-return
   */
  'array-callback-return'?: Linter.RuleEntry<ArrayCallbackReturn>;
  /**
   * Enforce line breaks after each array element
   * @see https://eslint.org/docs/latest/rules/array-element-newline
   * @deprecated
   */
  'array-element-newline'?: Linter.RuleEntry<ArrayElementNewline>;
  /**
   * Require braces around arrow function bodies
   * @see https://eslint.org/docs/latest/rules/arrow-body-style
   */
  'arrow-body-style'?: Linter.RuleEntry<ArrowBodyStyle>;
  /**
   * Require parentheses around arrow function arguments
   * @see https://eslint.org/docs/latest/rules/arrow-parens
   * @deprecated
   */
  'arrow-parens'?: Linter.RuleEntry<ArrowParens>;
  /**
   * Enforce consistent spacing before and after the arrow in arrow functions
   * @see https://eslint.org/docs/latest/rules/arrow-spacing
   * @deprecated
   */
  'arrow-spacing'?: Linter.RuleEntry<ArrowSpacing>;
  /**
   * apply `jsx-a11y/alt-text` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/alt-text/
   */
  'astro/jsx-a11y/alt-text'?: Linter.RuleEntry<AstroJsxA11YAltText>;
  /**
   * apply `jsx-a11y/anchor-ambiguous-text` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/anchor-ambiguous-text/
   */
  'astro/jsx-a11y/anchor-ambiguous-text'?: Linter.RuleEntry<AstroJsxA11YAnchorAmbiguousText>;
  /**
   * apply `jsx-a11y/anchor-has-content` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/anchor-has-content/
   */
  'astro/jsx-a11y/anchor-has-content'?: Linter.RuleEntry<AstroJsxA11YAnchorHasContent>;
  /**
   * apply `jsx-a11y/anchor-is-valid` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/anchor-is-valid/
   */
  'astro/jsx-a11y/anchor-is-valid'?: Linter.RuleEntry<AstroJsxA11YAnchorIsValid>;
  /**
   * apply `jsx-a11y/aria-activedescendant-has-tabindex` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/aria-activedescendant-has-tabindex/
   */
  'astro/jsx-a11y/aria-activedescendant-has-tabindex'?: Linter.RuleEntry<AstroJsxA11YAriaActivedescendantHasTabindex>;
  /**
   * apply `jsx-a11y/aria-props` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/aria-props/
   */
  'astro/jsx-a11y/aria-props'?: Linter.RuleEntry<AstroJsxA11YAriaProps>;
  /**
   * apply `jsx-a11y/aria-proptypes` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/aria-proptypes/
   */
  'astro/jsx-a11y/aria-proptypes'?: Linter.RuleEntry<AstroJsxA11YAriaProptypes>;
  /**
   * apply `jsx-a11y/aria-role` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/aria-role/
   */
  'astro/jsx-a11y/aria-role'?: Linter.RuleEntry<AstroJsxA11YAriaRole>;
  /**
   * apply `jsx-a11y/aria-unsupported-elements` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/aria-unsupported-elements/
   */
  'astro/jsx-a11y/aria-unsupported-elements'?: Linter.RuleEntry<AstroJsxA11YAriaUnsupportedElements>;
  /**
   * apply `jsx-a11y/autocomplete-valid` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/autocomplete-valid/
   */
  'astro/jsx-a11y/autocomplete-valid'?: Linter.RuleEntry<AstroJsxA11YAutocompleteValid>;
  /**
   * apply `jsx-a11y/click-events-have-key-events` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/click-events-have-key-events/
   */
  'astro/jsx-a11y/click-events-have-key-events'?: Linter.RuleEntry<AstroJsxA11YClickEventsHaveKeyEvents>;
  /**
   * apply `jsx-a11y/control-has-associated-label` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/control-has-associated-label/
   */
  'astro/jsx-a11y/control-has-associated-label'?: Linter.RuleEntry<AstroJsxA11YControlHasAssociatedLabel>;
  /**
   * apply `jsx-a11y/heading-has-content` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/heading-has-content/
   */
  'astro/jsx-a11y/heading-has-content'?: Linter.RuleEntry<AstroJsxA11YHeadingHasContent>;
  /**
   * apply `jsx-a11y/html-has-lang` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/html-has-lang/
   */
  'astro/jsx-a11y/html-has-lang'?: Linter.RuleEntry<AstroJsxA11YHtmlHasLang>;
  /**
   * apply `jsx-a11y/iframe-has-title` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/iframe-has-title/
   */
  'astro/jsx-a11y/iframe-has-title'?: Linter.RuleEntry<AstroJsxA11YIframeHasTitle>;
  /**
   * apply `jsx-a11y/img-redundant-alt` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/img-redundant-alt/
   */
  'astro/jsx-a11y/img-redundant-alt'?: Linter.RuleEntry<AstroJsxA11YImgRedundantAlt>;
  /**
   * apply `jsx-a11y/interactive-supports-focus` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/interactive-supports-focus/
   */
  'astro/jsx-a11y/interactive-supports-focus'?: Linter.RuleEntry<AstroJsxA11YInteractiveSupportsFocus>;
  /**
   * apply `jsx-a11y/label-has-associated-control` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/label-has-associated-control/
   */
  'astro/jsx-a11y/label-has-associated-control'?: Linter.RuleEntry<AstroJsxA11YLabelHasAssociatedControl>;
  /**
   * apply `jsx-a11y/lang` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/lang/
   */
  'astro/jsx-a11y/lang'?: Linter.RuleEntry<AstroJsxA11YLang>;
  /**
   * apply `jsx-a11y/media-has-caption` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/media-has-caption/
   */
  'astro/jsx-a11y/media-has-caption'?: Linter.RuleEntry<AstroJsxA11YMediaHasCaption>;
  /**
   * apply `jsx-a11y/mouse-events-have-key-events` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/mouse-events-have-key-events/
   */
  'astro/jsx-a11y/mouse-events-have-key-events'?: Linter.RuleEntry<AstroJsxA11YMouseEventsHaveKeyEvents>;
  /**
   * apply `jsx-a11y/no-access-key` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/no-access-key/
   */
  'astro/jsx-a11y/no-access-key'?: Linter.RuleEntry<AstroJsxA11YNoAccessKey>;
  /**
   * apply `jsx-a11y/no-aria-hidden-on-focusable` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/no-aria-hidden-on-focusable/
   */
  'astro/jsx-a11y/no-aria-hidden-on-focusable'?: Linter.RuleEntry<AstroJsxA11YNoAriaHiddenOnFocusable>;
  /**
   * apply `jsx-a11y/no-autofocus` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/no-autofocus/
   */
  'astro/jsx-a11y/no-autofocus'?: Linter.RuleEntry<AstroJsxA11YNoAutofocus>;
  /**
   * apply `jsx-a11y/no-distracting-elements` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/no-distracting-elements/
   */
  'astro/jsx-a11y/no-distracting-elements'?: Linter.RuleEntry<AstroJsxA11YNoDistractingElements>;
  /**
   * apply `jsx-a11y/no-interactive-element-to-noninteractive-role` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/no-interactive-element-to-noninteractive-role/
   */
  'astro/jsx-a11y/no-interactive-element-to-noninteractive-role'?: Linter.RuleEntry<AstroJsxA11YNoInteractiveElementToNoninteractiveRole>;
  /**
   * apply `jsx-a11y/no-noninteractive-element-interactions` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/no-noninteractive-element-interactions/
   */
  'astro/jsx-a11y/no-noninteractive-element-interactions'?: Linter.RuleEntry<AstroJsxA11YNoNoninteractiveElementInteractions>;
  /**
   * apply `jsx-a11y/no-noninteractive-element-to-interactive-role` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/no-noninteractive-element-to-interactive-role/
   */
  'astro/jsx-a11y/no-noninteractive-element-to-interactive-role'?: Linter.RuleEntry<AstroJsxA11YNoNoninteractiveElementToInteractiveRole>;
  /**
   * apply `jsx-a11y/no-noninteractive-tabindex` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/no-noninteractive-tabindex/
   */
  'astro/jsx-a11y/no-noninteractive-tabindex'?: Linter.RuleEntry<AstroJsxA11YNoNoninteractiveTabindex>;
  /**
   * apply `jsx-a11y/no-redundant-roles` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/no-redundant-roles/
   */
  'astro/jsx-a11y/no-redundant-roles'?: Linter.RuleEntry<AstroJsxA11YNoRedundantRoles>;
  /**
   * apply `jsx-a11y/no-static-element-interactions` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/no-static-element-interactions/
   */
  'astro/jsx-a11y/no-static-element-interactions'?: Linter.RuleEntry<AstroJsxA11YNoStaticElementInteractions>;
  /**
   * apply `jsx-a11y/prefer-tag-over-role` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/prefer-tag-over-role/
   */
  'astro/jsx-a11y/prefer-tag-over-role'?: Linter.RuleEntry<AstroJsxA11YPreferTagOverRole>;
  /**
   * apply `jsx-a11y/role-has-required-aria-props` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/role-has-required-aria-props/
   */
  'astro/jsx-a11y/role-has-required-aria-props'?: Linter.RuleEntry<AstroJsxA11YRoleHasRequiredAriaProps>;
  /**
   * apply `jsx-a11y/role-supports-aria-props` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/role-supports-aria-props/
   */
  'astro/jsx-a11y/role-supports-aria-props'?: Linter.RuleEntry<AstroJsxA11YRoleSupportsAriaProps>;
  /**
   * apply `jsx-a11y/scope` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/scope/
   */
  'astro/jsx-a11y/scope'?: Linter.RuleEntry<AstroJsxA11YScope>;
  /**
   * apply `jsx-a11y/tabindex-no-positive` rule to Astro components
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/jsx-a11y/tabindex-no-positive/
   */
  'astro/jsx-a11y/tabindex-no-positive'?: Linter.RuleEntry<AstroJsxA11YTabindexNoPositive>;
  /**
   * the client:only directive is missing the correct component's framework value
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/missing-client-only-directive-value/
   */
  'astro/missing-client-only-directive-value'?: Linter.RuleEntry<[]>;
  /**
   * disallow conflicting set directives and child contents
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/no-conflict-set-directives/
   */
  'astro/no-conflict-set-directives'?: Linter.RuleEntry<[]>;
  /**
   * disallow using deprecated `Astro.canonicalURL`
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/no-deprecated-astro-canonicalurl/
   */
  'astro/no-deprecated-astro-canonicalurl'?: Linter.RuleEntry<[]>;
  /**
   * disallow using deprecated `Astro.fetchContent()`
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/no-deprecated-astro-fetchcontent/
   */
  'astro/no-deprecated-astro-fetchcontent'?: Linter.RuleEntry<[]>;
  /**
   * disallow using deprecated `Astro.resolve()`
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/no-deprecated-astro-resolve/
   */
  'astro/no-deprecated-astro-resolve'?: Linter.RuleEntry<[]>;
  /**
   * disallow using deprecated `getEntryBySlug()`
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/no-deprecated-getentrybyslug/
   */
  'astro/no-deprecated-getentrybyslug'?: Linter.RuleEntry<[]>;
  /**
   * disallow value export
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/no-exports-from-components/
   */
  'astro/no-exports-from-components'?: Linter.RuleEntry<[]>;
  /**
   * disallow use of `set:html` to prevent XSS attack
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/no-set-html-directive/
   */
  'astro/no-set-html-directive'?: Linter.RuleEntry<[]>;
  /**
   * disallow use of `set:text`
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/no-set-text-directive/
   */
  'astro/no-set-text-directive'?: Linter.RuleEntry<[]>;
  /**
   * disallow inline `<script>` without `src` to encourage CSP-safe patterns
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/no-unsafe-inline-scripts/
   */
  'astro/no-unsafe-inline-scripts'?: Linter.RuleEntry<AstroNoUnsafeInlineScripts>;
  /**
   * disallow selectors defined in `style` tag that don't use in HTML
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/no-unused-css-selector/
   */
  'astro/no-unused-css-selector'?: Linter.RuleEntry<[]>;
  /**
   * disallow unused `define:vars={...}` in `style` tag
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/no-unused-define-vars-in-style/
   */
  'astro/no-unused-define-vars-in-style'?: Linter.RuleEntry<[]>;
  /**
   * require `class:list` directives instead of `class` with expressions
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/prefer-class-list-directive/
   */
  'astro/prefer-class-list-directive'?: Linter.RuleEntry<[]>;
  /**
   * require use object instead of ternary expression in `class:list`
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/prefer-object-class-list/
   */
  'astro/prefer-object-class-list'?: Linter.RuleEntry<[]>;
  /**
   * require use split array elements in `class:list`
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/prefer-split-class-list/
   */
  'astro/prefer-split-class-list'?: Linter.RuleEntry<AstroPreferSplitClassList>;
  /**
   * Require or disallow semicolons instead of ASI
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/semi/
   */
  'astro/semi'?: Linter.RuleEntry<AstroSemi>;
  /**
   * enforce sorting of attributes
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/sort-attributes/
   */
  'astro/sort-attributes'?: Linter.RuleEntry<AstroSortAttributes>;
  /**
   * disallow warnings when compiling.
   * @see https://ota-meshi.github.io/eslint-plugin-astro/rules/valid-compile/
   */
  'astro/valid-compile'?: Linter.RuleEntry<[]>;
  /**
   * Enforce the use of variables within the scope they are defined
   * @see https://eslint.org/docs/latest/rules/block-scoped-var
   */
  'block-scoped-var'?: Linter.RuleEntry<[]>;
  /**
   * Disallow or enforce spaces inside of blocks after opening block and before closing block
   * @see https://eslint.org/docs/latest/rules/block-spacing
   * @deprecated
   */
  'block-spacing'?: Linter.RuleEntry<BlockSpacing>;
  /**
   * Enforce consistent brace style for blocks
   * @see https://eslint.org/docs/latest/rules/brace-style
   * @deprecated
   */
  'brace-style'?: Linter.RuleEntry<BraceStyle>;
  /**
   * Require `return` statements after callbacks
   * @see https://eslint.org/docs/latest/rules/callback-return
   * @deprecated
   */
  'callback-return'?: Linter.RuleEntry<CallbackReturn>;
  /**
   * Enforce camelcase naming convention
   * @see https://eslint.org/docs/latest/rules/camelcase
   */
  'camelcase'?: Linter.RuleEntry<Camelcase>;
  /**
   * Enforce or disallow capitalization of the first letter of a comment
   * @see https://eslint.org/docs/latest/rules/capitalized-comments
   */
  'capitalized-comments'?: Linter.RuleEntry<CapitalizedComments>;
  /**
   * Enforce that class methods utilize `this`
   * @see https://eslint.org/docs/latest/rules/class-methods-use-this
   */
  'class-methods-use-this'?: Linter.RuleEntry<ClassMethodsUseThis>;
  /**
   * Require or disallow trailing commas
   * @see https://eslint.org/docs/latest/rules/comma-dangle
   * @deprecated
   */
  'comma-dangle'?: Linter.RuleEntry<CommaDangle>;
  /**
   * Enforce consistent spacing before and after commas
   * @see https://eslint.org/docs/latest/rules/comma-spacing
   * @deprecated
   */
  'comma-spacing'?: Linter.RuleEntry<CommaSpacing>;
  /**
   * Enforce consistent comma style
   * @see https://eslint.org/docs/latest/rules/comma-style
   * @deprecated
   */
  'comma-style'?: Linter.RuleEntry<CommaStyle>;
  /**
   * Comment-as-command for one-off codemod with ESLint
   * @see https://github.com/antfu/eslint-plugin-command
   */
  'command/command'?: Linter.RuleEntry<[]>;
  /**
   * Enforce a maximum cyclomatic complexity allowed in a program
   * @see https://eslint.org/docs/latest/rules/complexity
   */
  'complexity'?: Linter.RuleEntry<Complexity>;
  /**
   * Enforce consistent spacing inside computed property brackets
   * @see https://eslint.org/docs/latest/rules/computed-property-spacing
   * @deprecated
   */
  'computed-property-spacing'?: Linter.RuleEntry<ComputedPropertySpacing>;
  /**
   * Require `return` statements to either always or never specify values
   * @see https://eslint.org/docs/latest/rules/consistent-return
   */
  'consistent-return'?: Linter.RuleEntry<ConsistentReturn>;
  /**
   * Enforce consistent naming when capturing the current execution context
   * @see https://eslint.org/docs/latest/rules/consistent-this
   */
  'consistent-this'?: Linter.RuleEntry<ConsistentThis>;
  /**
   * Require `super()` calls in constructors
   * @see https://eslint.org/docs/latest/rules/constructor-super
   */
  'constructor-super'?: Linter.RuleEntry<[]>;
  /**
   * Enforce consistent brace style for all control statements
   * @see https://eslint.org/docs/latest/rules/curly
   */
  'curly'?: Linter.RuleEntry<Curly>;
  /**
   * Require `default` cases in `switch` statements
   * @see https://eslint.org/docs/latest/rules/default-case
   */
  'default-case'?: Linter.RuleEntry<DefaultCase>;
  /**
   * Enforce `default` clauses in `switch` statements to be last
   * @see https://eslint.org/docs/latest/rules/default-case-last
   */
  'default-case-last'?: Linter.RuleEntry<[]>;
  /**
   * Enforce default parameters to be last
   * @see https://eslint.org/docs/latest/rules/default-param-last
   */
  'default-param-last'?: Linter.RuleEntry<[]>;
  /**
   * Enforce consistent newlines before and after dots
   * @see https://eslint.org/docs/latest/rules/dot-location
   * @deprecated
   */
  'dot-location'?: Linter.RuleEntry<DotLocation>;
  /**
   * Enforce dot notation whenever possible
   * @see https://eslint.org/docs/latest/rules/dot-notation
   */
  'dot-notation'?: Linter.RuleEntry<DotNotation>;
  /**
   * Require or disallow newline at the end of files
   * @see https://eslint.org/docs/latest/rules/eol-last
   * @deprecated
   */
  'eol-last'?: Linter.RuleEntry<EolLast>;
  /**
   * Require the use of `===` and `!==`
   * @see https://eslint.org/docs/latest/rules/eqeqeq
   */
  'eqeqeq'?: Linter.RuleEntry<Eqeqeq>;
  /**
   * Avoid using TypeScript's enums.
   * @see https://github.com/JoshuaKGoldberg/eslint-plugin-erasable-syntax-only/blob/main/docs/rules/enums.md
   */
  'erasable-syntax-only/enums'?: Linter.RuleEntry<[]>;
  /**
   * Avoid using TypeScript's import aliases.
   * @see https://github.com/JoshuaKGoldberg/eslint-plugin-erasable-syntax-only/blob/main/docs/rules/import-aliases.md
   */
  'erasable-syntax-only/import-aliases'?: Linter.RuleEntry<[]>;
  /**
   * Avoid using TypeScript's namespaces.
   * @see https://github.com/JoshuaKGoldberg/eslint-plugin-erasable-syntax-only/blob/main/docs/rules/namespaces.md
   */
  'erasable-syntax-only/namespaces'?: Linter.RuleEntry<[]>;
  /**
   * Avoid using TypeScript's class parameter properties.
   * @see https://github.com/JoshuaKGoldberg/eslint-plugin-erasable-syntax-only/blob/main/docs/rules/parameter-properties.md
   */
  'erasable-syntax-only/parameter-properties'?: Linter.RuleEntry<[]>;
  /**
   * require a `eslint-enable` comment for every `eslint-disable` comment
   * @see https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/disable-enable-pair.html
   */
  'eslint-comments/disable-enable-pair'?: Linter.RuleEntry<EslintCommentsDisableEnablePair>;
  /**
   * disallow a `eslint-enable` comment for multiple `eslint-disable` comments
   * @see https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/no-aggregating-enable.html
   */
  'eslint-comments/no-aggregating-enable'?: Linter.RuleEntry<[]>;
  /**
   * disallow duplicate `eslint-disable` comments
   * @see https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/no-duplicate-disable.html
   */
  'eslint-comments/no-duplicate-disable'?: Linter.RuleEntry<[]>;
  /**
   * disallow `eslint-disable` comments about specific rules
   * @see https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/no-restricted-disable.html
   */
  'eslint-comments/no-restricted-disable'?: Linter.RuleEntry<EslintCommentsNoRestrictedDisable>;
  /**
   * disallow `eslint-disable` comments without rule names
   * @see https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/no-unlimited-disable.html
   */
  'eslint-comments/no-unlimited-disable'?: Linter.RuleEntry<[]>;
  /**
   * disallow unused `eslint-disable` comments
   * @see https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/no-unused-disable.html
   */
  'eslint-comments/no-unused-disable'?: Linter.RuleEntry<[]>;
  /**
   * disallow unused `eslint-enable` comments
   * @see https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/no-unused-enable.html
   */
  'eslint-comments/no-unused-enable'?: Linter.RuleEntry<[]>;
  /**
   * disallow ESLint directive-comments
   * @see https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/no-use.html
   */
  'eslint-comments/no-use'?: Linter.RuleEntry<EslintCommentsNoUse>;
  /**
   * require include descriptions in ESLint directive-comments
   * @see https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/require-description.html
   */
  'eslint-comments/require-description'?: Linter.RuleEntry<EslintCommentsRequireDescription>;
  /**
   * Enforce `for` loop update clause moving the counter in the right direction
   * @see https://eslint.org/docs/latest/rules/for-direction
   */
  'for-direction'?: Linter.RuleEntry<[]>;
  /**
   * Use dprint to format code
   */
  'format/dprint'?: Linter.RuleEntry<FormatDprint>;
  /**
   * Use Prettier to format code
   */
  'format/prettier'?: Linter.RuleEntry<FormatPrettier>;
  /**
   * Require or disallow spacing between function identifiers and their invocations
   * @see https://eslint.org/docs/latest/rules/func-call-spacing
   * @deprecated
   */
  'func-call-spacing'?: Linter.RuleEntry<FuncCallSpacing>;
  /**
   * Require function names to match the name of the variable or property to which they are assigned
   * @see https://eslint.org/docs/latest/rules/func-name-matching
   */
  'func-name-matching'?: Linter.RuleEntry<FuncNameMatching>;
  /**
   * Require or disallow named `function` expressions
   * @see https://eslint.org/docs/latest/rules/func-names
   */
  'func-names'?: Linter.RuleEntry<FuncNames>;
  /**
   * Enforce the consistent use of either `function` declarations or expressions assigned to variables
   * @see https://eslint.org/docs/latest/rules/func-style
   */
  'func-style'?: Linter.RuleEntry<FuncStyle>;
  /**
   * Enforce line breaks between arguments of a function call
   * @see https://eslint.org/docs/latest/rules/function-call-argument-newline
   * @deprecated
   */
  'function-call-argument-newline'?: Linter.RuleEntry<FunctionCallArgumentNewline>;
  /**
   * Enforce consistent line breaks inside function parentheses
   * @see https://eslint.org/docs/latest/rules/function-paren-newline
   * @deprecated
   */
  'function-paren-newline'?: Linter.RuleEntry<FunctionParenNewline>;
  /**
   * Enforce consistent spacing around `*` operators in generator functions
   * @see https://eslint.org/docs/latest/rules/generator-star-spacing
   * @deprecated
   */
  'generator-star-spacing'?: Linter.RuleEntry<GeneratorStarSpacing>;
  /**
   * Enforce `return` statements in getters
   * @see https://eslint.org/docs/latest/rules/getter-return
   */
  'getter-return'?: Linter.RuleEntry<GetterReturn>;
  /**
   * Require `require()` calls to be placed at top-level module scope
   * @see https://eslint.org/docs/latest/rules/global-require
   * @deprecated
   */
  'global-require'?: Linter.RuleEntry<[]>;
  /**
   * Require grouped accessor pairs in object literals and classes
   * @see https://eslint.org/docs/latest/rules/grouped-accessor-pairs
   */
  'grouped-accessor-pairs'?: Linter.RuleEntry<GroupedAccessorPairs>;
  /**
   * Require `for-in` loops to include an `if` statement
   * @see https://eslint.org/docs/latest/rules/guard-for-in
   */
  'guard-for-in'?: Linter.RuleEntry<[]>;
  /**
   * Require error handling in callbacks
   * @see https://eslint.org/docs/latest/rules/handle-callback-err
   * @deprecated
   */
  'handle-callback-err'?: Linter.RuleEntry<HandleCallbackErr>;
  /**
   * Disallow specified identifiers
   * @see https://eslint.org/docs/latest/rules/id-blacklist
   * @deprecated
   */
  'id-blacklist'?: Linter.RuleEntry<IdBlacklist>;
  /**
   * Disallow specified identifiers
   * @see https://eslint.org/docs/latest/rules/id-denylist
   */
  'id-denylist'?: Linter.RuleEntry<IdDenylist>;
  /**
   * Enforce minimum and maximum identifier lengths
   * @see https://eslint.org/docs/latest/rules/id-length
   */
  'id-length'?: Linter.RuleEntry<IdLength>;
  /**
   * Require identifiers to match a specified regular expression
   * @see https://eslint.org/docs/latest/rules/id-match
   */
  'id-match'?: Linter.RuleEntry<IdMatch>;
  /**
   * Enforce the location of arrow function bodies
   * @see https://eslint.org/docs/latest/rules/implicit-arrow-linebreak
   * @deprecated
   */
  'implicit-arrow-linebreak'?: Linter.RuleEntry<ImplicitArrowLinebreak>;
  /**
   * Enforce or ban the use of inline type-only markers for named imports.
   * @see https://github.com/9romise/eslint-plugin-import-lite/blob/main/src/rules/consistent-type-specifier-style/README.md
   */
  'import/consistent-type-specifier-style'?: Linter.RuleEntry<ImportConsistentTypeSpecifierStyle>;
  /**
   * Ensure all exports appear after other statements.
   * @see https://github.com/9romise/eslint-plugin-import-lite/blob/main/src/rules/exports-last/README.md
   */
  'import/exports-last'?: Linter.RuleEntry<[]>;
  /**
   * Ensure all imports appear before other statements.
   * @see https://github.com/9romise/eslint-plugin-import-lite/blob/main/src/rules/first/README.md
   */
  'import/first'?: Linter.RuleEntry<ImportFirst>;
  /**
   * Enforce a newline after import statements.
   * @see https://github.com/9romise/eslint-plugin-import-lite/blob/main/src/rules/newline-after-import/README.md
   */
  'import/newline-after-import'?: Linter.RuleEntry<ImportNewlineAfterImport>;
  /**
   * Forbid default exports.
   * @see https://github.com/9romise/eslint-plugin-import-lite/blob/main/src/rules/no-default-export/README.md
   */
  'import/no-default-export'?: Linter.RuleEntry<[]>;
  /**
   * Forbid repeated import of the same module in multiple places.
   * @see https://github.com/9romise/eslint-plugin-import-lite/blob/main/src/rules/no-duplicates/README.md
   */
  'import/no-duplicates'?: Linter.RuleEntry<ImportNoDuplicates>;
  /**
   * Forbid the use of mutable exports with `var` or `let`.
   * @see https://github.com/9romise/eslint-plugin-import-lite/blob/main/src/rules/no-mutable-exports/README.md
   */
  'import/no-mutable-exports'?: Linter.RuleEntry<[]>;
  /**
   * Forbid named default exports.
   * @see https://github.com/9romise/eslint-plugin-import-lite/blob/main/src/rules/no-named-default/README.md
   */
  'import/no-named-default'?: Linter.RuleEntry<[]>;
  /**
   * Enforce consistent indentation
   * @see https://eslint.org/docs/latest/rules/indent
   * @deprecated
   */
  'indent'?: Linter.RuleEntry<Indent>;
  /**
   * Enforce consistent indentation
   * @see https://eslint.org/docs/latest/rules/indent-legacy
   * @deprecated
   */
  'indent-legacy'?: Linter.RuleEntry<IndentLegacy>;
  /**
   * Require or disallow initialization in variable declarations
   * @see https://eslint.org/docs/latest/rules/init-declarations
   */
  'init-declarations'?: Linter.RuleEntry<InitDeclarations>;
  /**
   * Checks that `@access` tags have a valid value.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/check-access.md#repos-sticky-header
   */
  'jsdoc/check-access'?: Linter.RuleEntry<[]>;
  /**
   * Reports invalid alignment of JSDoc block asterisks.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/check-alignment.md#repos-sticky-header
   */
  'jsdoc/check-alignment'?: Linter.RuleEntry<JsdocCheckAlignment>;
  /**
   * @deprecated - Use `getJsdocProcessorPlugin` processor; ensures that (JavaScript) samples within `@example` tags adhere to ESLint rules.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/check-examples.md#repos-sticky-header
   */
  'jsdoc/check-examples'?: Linter.RuleEntry<JsdocCheckExamples>;
  /**
   * Reports invalid padding inside JSDoc blocks.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/check-indentation.md#repos-sticky-header
   */
  'jsdoc/check-indentation'?: Linter.RuleEntry<JsdocCheckIndentation>;
  /**
   * Reports invalid alignment of JSDoc block lines.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/check-line-alignment.md#repos-sticky-header
   */
  'jsdoc/check-line-alignment'?: Linter.RuleEntry<JsdocCheckLineAlignment>;
  /**
   * Checks for dupe `@param` names, that nested param names have roots, and that parameter names in function declarations match JSDoc param names.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/check-param-names.md#repos-sticky-header
   */
  'jsdoc/check-param-names'?: Linter.RuleEntry<JsdocCheckParamNames>;
  /**
   * Ensures that property names in JSDoc are not duplicated on the same block and that nested properties have defined roots.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/check-property-names.md#repos-sticky-header
   */
  'jsdoc/check-property-names'?: Linter.RuleEntry<JsdocCheckPropertyNames>;
  /**
   * Reports against syntax not valid for the mode (e.g., Google Closure Compiler in non-Closure mode).
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/check-syntax.md#repos-sticky-header
   */
  'jsdoc/check-syntax'?: Linter.RuleEntry<[]>;
  /**
   * Reports invalid block tag names.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/check-tag-names.md#repos-sticky-header
   */
  'jsdoc/check-tag-names'?: Linter.RuleEntry<JsdocCheckTagNames>;
  /**
   * Checks that any `@template` names are actually used in the connected `@typedef` or type alias.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/check-template-names.md#repos-sticky-header
   */
  'jsdoc/check-template-names'?: Linter.RuleEntry<[]>;
  /**
   * Reports types deemed invalid (customizable and with defaults, for preventing and/or recommending replacements).
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/check-types.md#repos-sticky-header
   */
  'jsdoc/check-types'?: Linter.RuleEntry<JsdocCheckTypes>;
  /**
   * This rule checks the values for a handful of tags: `@version`, `@since`, `@license` and `@author`.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/check-values.md#repos-sticky-header
   */
  'jsdoc/check-values'?: Linter.RuleEntry<JsdocCheckValues>;
  /**
   * Converts non-JSDoc comments preceding or following nodes into JSDoc ones
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/convert-to-jsdoc-comments.md#repos-sticky-header
   */
  'jsdoc/convert-to-jsdoc-comments'?: Linter.RuleEntry<JsdocConvertToJsdocComments>;
  /**
   * Checks tags that are expected to be empty (e.g., `@abstract` or `@async`), reporting if they have content
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/empty-tags.md#repos-sticky-header
   */
  'jsdoc/empty-tags'?: Linter.RuleEntry<JsdocEmptyTags>;
  /**
   * Reports use of JSDoc tags in non-tag positions (in the default "typescript" mode).
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/escape-inline-tags.md#repos-sticky-header
   */
  'jsdoc/escape-inline-tags'?: Linter.RuleEntry<JsdocEscapeInlineTags>;
  /**
   * Prohibits use of `@implements` on non-constructor functions (to enforce the tag only being used on classes/constructors).
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/implements-on-classes.md#repos-sticky-header
   */
  'jsdoc/implements-on-classes'?: Linter.RuleEntry<JsdocImplementsOnClasses>;
  /**
   * Reports if JSDoc `import()` statements point to a package which is not listed in `dependencies` or `devDependencies`
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/imports-as-dependencies.md#repos-sticky-header
   */
  'jsdoc/imports-as-dependencies'?: Linter.RuleEntry<[]>;
  /**
   * This rule reports doc comments that only restate their attached name.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/informative-docs.md#repos-sticky-header
   */
  'jsdoc/informative-docs'?: Linter.RuleEntry<JsdocInformativeDocs>;
  /**
   * Enforces minimum number of newlines before JSDoc comment blocks
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/lines-before-block.md#repos-sticky-header
   */
  'jsdoc/lines-before-block'?: Linter.RuleEntry<JsdocLinesBeforeBlock>;
  /**
   * Enforces a regular expression pattern on descriptions.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/match-description.md#repos-sticky-header
   */
  'jsdoc/match-description'?: Linter.RuleEntry<JsdocMatchDescription>;
  /**
   * Reports the name portion of a JSDoc tag if matching or not matching a given regular expression.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/match-name.md#repos-sticky-header
   */
  'jsdoc/match-name'?: Linter.RuleEntry<JsdocMatchName>;
  /**
   * Controls how and whether JSDoc blocks can be expressed as single or multiple line blocks.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/multiline-blocks.md#repos-sticky-header
   */
  'jsdoc/multiline-blocks'?: Linter.RuleEntry<JsdocMultilineBlocks>;
  /**
   * This rule checks for multi-line-style comments which fail to meet the criteria of a JSDoc block.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/no-bad-blocks.md#repos-sticky-header
   */
  'jsdoc/no-bad-blocks'?: Linter.RuleEntry<JsdocNoBadBlocks>;
  /**
   * If tags are present, this rule will prevent empty lines in the block description. If no tags are present, this rule will prevent extra empty lines in the block description.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/no-blank-block-descriptions.md#repos-sticky-header
   */
  'jsdoc/no-blank-block-descriptions'?: Linter.RuleEntry<[]>;
  /**
   * Removes empty blocks with nothing but possibly line breaks
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/no-blank-blocks.md#repos-sticky-header
   */
  'jsdoc/no-blank-blocks'?: Linter.RuleEntry<JsdocNoBlankBlocks>;
  /**
   * This rule reports defaults being used on the relevant portion of `@param` or `@default`.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/no-defaults.md#repos-sticky-header
   */
  'jsdoc/no-defaults'?: Linter.RuleEntry<JsdocNoDefaults>;
  /**
   * Reports when certain comment structures are always expected.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/no-missing-syntax.md#repos-sticky-header
   */
  'jsdoc/no-missing-syntax'?: Linter.RuleEntry<JsdocNoMissingSyntax>;
  /**
   * Prevents use of multiple asterisks at the beginning of lines.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/no-multi-asterisks.md#repos-sticky-header
   */
  'jsdoc/no-multi-asterisks'?: Linter.RuleEntry<JsdocNoMultiAsterisks>;
  /**
   * Reports when certain comment structures are present.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/no-restricted-syntax.md#repos-sticky-header
   */
  'jsdoc/no-restricted-syntax'?: Linter.RuleEntry<JsdocNoRestrictedSyntax>;
  /**
   * This rule reports types being used on `@param` or `@returns` (redundant with TypeScript).
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/no-types.md#repos-sticky-header
   */
  'jsdoc/no-types'?: Linter.RuleEntry<JsdocNoTypes>;
  /**
   * Besides some expected built-in types, prohibits any types not specified as globals or within `@typedef`.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/no-undefined-types.md#repos-sticky-header
   */
  'jsdoc/no-undefined-types'?: Linter.RuleEntry<JsdocNoUndefinedTypes>;
  /**
   * Prefer `@import` tags to inline `import()` statements.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/prefer-import-tag.md#repos-sticky-header
   */
  'jsdoc/prefer-import-tag'?: Linter.RuleEntry<JsdocPreferImportTag>;
  /**
   * Reports use of `any` or `*` type
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/reject-any-type.md#repos-sticky-header
   */
  'jsdoc/reject-any-type'?: Linter.RuleEntry<[]>;
  /**
   * Reports use of `Function` type
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/reject-function-type.md#repos-sticky-header
   */
  'jsdoc/reject-function-type'?: Linter.RuleEntry<[]>;
  /**
   * Requires that each JSDoc line starts with an `*`.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-asterisk-prefix.md#repos-sticky-header
   */
  'jsdoc/require-asterisk-prefix'?: Linter.RuleEntry<JsdocRequireAsteriskPrefix>;
  /**
   * Requires that all functions (and potentially other contexts) have a description.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-description.md#repos-sticky-header
   */
  'jsdoc/require-description'?: Linter.RuleEntry<JsdocRequireDescription>;
  /**
   * Requires that block description, explicit `@description`, and `@param`/`@returns` tag descriptions are written in complete sentences.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-description-complete-sentence.md#repos-sticky-header
   */
  'jsdoc/require-description-complete-sentence'?: Linter.RuleEntry<JsdocRequireDescriptionCompleteSentence>;
  /**
   * Requires that all functions (and potentially other contexts) have examples.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-example.md#repos-sticky-header
   */
  'jsdoc/require-example'?: Linter.RuleEntry<JsdocRequireExample>;
  /**
   * Checks that all files have one `@file`, `@fileoverview`, or `@overview` tag at the beginning of the file.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-file-overview.md#repos-sticky-header
   */
  'jsdoc/require-file-overview'?: Linter.RuleEntry<JsdocRequireFileOverview>;
  /**
   * Requires a hyphen before the `@param` description (and optionally before `@property` descriptions).
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-hyphen-before-param-description.md#repos-sticky-header
   */
  'jsdoc/require-hyphen-before-param-description'?: Linter.RuleEntry<JsdocRequireHyphenBeforeParamDescription>;
  /**
   * Checks for presence of JSDoc comments, on functions and potentially other contexts (optionally limited to exports).
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-jsdoc.md#repos-sticky-header
   */
  'jsdoc/require-jsdoc'?: Linter.RuleEntry<JsdocRequireJsdoc>;
  /**
   * Requires a description for `@next` tags
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-next-description.md#repos-sticky-header
   */
  'jsdoc/require-next-description'?: Linter.RuleEntry<[]>;
  /**
   * Requires a type for `@next` tags
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-next-type.md#repos-sticky-header
   */
  'jsdoc/require-next-type'?: Linter.RuleEntry<[]>;
  /**
   * Requires that all function parameters are documented with a `@param` tag.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-param.md#repos-sticky-header
   */
  'jsdoc/require-param'?: Linter.RuleEntry<JsdocRequireParam>;
  /**
   * Requires that each `@param` tag has a `description` value.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-param-description.md#repos-sticky-header
   */
  'jsdoc/require-param-description'?: Linter.RuleEntry<JsdocRequireParamDescription>;
  /**
   * Requires that all `@param` tags have names.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-param-name.md#repos-sticky-header
   */
  'jsdoc/require-param-name'?: Linter.RuleEntry<JsdocRequireParamName>;
  /**
   * Requires that each `@param` tag has a type value (in curly brackets).
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-param-type.md#repos-sticky-header
   */
  'jsdoc/require-param-type'?: Linter.RuleEntry<JsdocRequireParamType>;
  /**
   * Requires that all `@typedef` and `@namespace` tags have `@property` when their type is a plain `object`, `Object`, or `PlainObject`.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-property.md#repos-sticky-header
   */
  'jsdoc/require-property'?: Linter.RuleEntry<[]>;
  /**
   * Requires that each `@property` tag has a `description` value.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-property-description.md#repos-sticky-header
   */
  'jsdoc/require-property-description'?: Linter.RuleEntry<[]>;
  /**
   * Requires that all `@property` tags have names.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-property-name.md#repos-sticky-header
   */
  'jsdoc/require-property-name'?: Linter.RuleEntry<[]>;
  /**
   * Requires that each `@property` tag has a type value (in curly brackets).
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-property-type.md#repos-sticky-header
   */
  'jsdoc/require-property-type'?: Linter.RuleEntry<[]>;
  /**
   * Requires that Promise rejections are documented with `@rejects` tags.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-rejects.md#repos-sticky-header
   */
  'jsdoc/require-rejects'?: Linter.RuleEntry<JsdocRequireRejects>;
  /**
   * Requires that returns are documented with `@returns`.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-returns.md#repos-sticky-header
   */
  'jsdoc/require-returns'?: Linter.RuleEntry<JsdocRequireReturns>;
  /**
   * Requires a return statement in function body if a `@returns` tag is specified in JSDoc comment(and reports if multiple `@returns` tags are present).
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-returns-check.md#repos-sticky-header
   */
  'jsdoc/require-returns-check'?: Linter.RuleEntry<JsdocRequireReturnsCheck>;
  /**
   * Requires that the `@returns` tag has a `description` value (not including `void`/`undefined` type returns).
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-returns-description.md#repos-sticky-header
   */
  'jsdoc/require-returns-description'?: Linter.RuleEntry<JsdocRequireReturnsDescription>;
  /**
   * Requires that `@returns` tag has type value (in curly brackets).
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-returns-type.md#repos-sticky-header
   */
  'jsdoc/require-returns-type'?: Linter.RuleEntry<JsdocRequireReturnsType>;
  /**
   * Requires tags be present, optionally for specific contexts
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-tags.md#repos-sticky-header
   */
  'jsdoc/require-tags'?: Linter.RuleEntry<JsdocRequireTags>;
  /**
   * Requires `@template` tags be present when type parameters are used.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-template.md#repos-sticky-header
   */
  'jsdoc/require-template'?: Linter.RuleEntry<JsdocRequireTemplate>;
  /**
   * Requires a description for `@template` tags
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-template-description.md#repos-sticky-header
   */
  'jsdoc/require-template-description'?: Linter.RuleEntry<[]>;
  /**
   * Requires that throw statements are documented with `@throws` tags.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-throws.md#repos-sticky-header
   */
  'jsdoc/require-throws'?: Linter.RuleEntry<JsdocRequireThrows>;
  /**
   * Requires a description for `@throws` tags
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-throws-description.md#repos-sticky-header
   */
  'jsdoc/require-throws-description'?: Linter.RuleEntry<[]>;
  /**
   * Requires a type for `@throws` tags
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-throws-type.md#repos-sticky-header
   */
  'jsdoc/require-throws-type'?: Linter.RuleEntry<[]>;
  /**
   * Requires yields are documented with `@yields` tags.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-yields.md#repos-sticky-header
   */
  'jsdoc/require-yields'?: Linter.RuleEntry<JsdocRequireYields>;
  /**
   * Ensures that if a `@yields` is present that a `yield` (or `yield` with a value) is present in the function body (or that if a `@next` is present that there is a yield with a return value present).
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-yields-check.md#repos-sticky-header
   */
  'jsdoc/require-yields-check'?: Linter.RuleEntry<JsdocRequireYieldsCheck>;
  /**
   * Requires a description for `@yields` tags
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-yields-description.md#repos-sticky-header
   */
  'jsdoc/require-yields-description'?: Linter.RuleEntry<[]>;
  /**
   * Requires a type for `@yields` tags
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-yields-type.md#repos-sticky-header
   */
  'jsdoc/require-yields-type'?: Linter.RuleEntry<[]>;
  /**
   * Sorts tags by a specified sequence according to tag name, optionally adding line breaks between tag groups.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/sort-tags.md#repos-sticky-header
   */
  'jsdoc/sort-tags'?: Linter.RuleEntry<JsdocSortTags>;
  /**
   * Enforces lines (or no lines) before, after, or between tags.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/tag-lines.md#repos-sticky-header
   */
  'jsdoc/tag-lines'?: Linter.RuleEntry<JsdocTagLines>;
  /**
   * Auto-escape certain characters that are input within block and tag descriptions.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/text-escaping.md#repos-sticky-header
   */
  'jsdoc/text-escaping'?: Linter.RuleEntry<JsdocTextEscaping>;
  /**
   * Prefers either function properties or method signatures
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/ts-method-signature-style.md#repos-sticky-header
   */
  'jsdoc/ts-method-signature-style'?: Linter.RuleEntry<JsdocTsMethodSignatureStyle>;
  /**
   * Warns against use of the empty object type
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/ts-no-empty-object-type.md#repos-sticky-header
   */
  'jsdoc/ts-no-empty-object-type'?: Linter.RuleEntry<[]>;
  /**
   * Catches unnecessary template expressions such as string expressions within a template literal.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/ts-no-unnecessary-template-expression.md#repos-sticky-header
   */
  'jsdoc/ts-no-unnecessary-template-expression'?: Linter.RuleEntry<JsdocTsNoUnnecessaryTemplateExpression>;
  /**
   * Prefers function types over call signatures when there are no other properties.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/ts-prefer-function-type.md#repos-sticky-header
   */
  'jsdoc/ts-prefer-function-type'?: Linter.RuleEntry<JsdocTsPreferFunctionType>;
  /**
   * Formats JSDoc type values.
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/type-formatting.md#repos-sticky-header
   */
  'jsdoc/type-formatting'?: Linter.RuleEntry<JsdocTypeFormatting>;
  /**
   * Requires all types/namepaths to be valid JSDoc, Closure compiler, or TypeScript types (configurable in settings).
   * @see https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/valid-types.md#repos-sticky-header
   */
  'jsdoc/valid-types'?: Linter.RuleEntry<JsdocValidTypes>;
  /**
   * enforce line breaks after opening and before closing array brackets
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/array-bracket-newline.html
   */
  'jsonc/array-bracket-newline'?: Linter.RuleEntry<JsoncArrayBracketNewline>;
  /**
   * disallow or enforce spaces inside of brackets
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/array-bracket-spacing.html
   */
  'jsonc/array-bracket-spacing'?: Linter.RuleEntry<JsoncArrayBracketSpacing>;
  /**
   * enforce line breaks between array elements
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/array-element-newline.html
   */
  'jsonc/array-element-newline'?: Linter.RuleEntry<JsoncArrayElementNewline>;
  /**
   * apply jsonc rules similar to your configured ESLint core rules
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/auto.html
   */
  'jsonc/auto'?: Linter.RuleEntry<[]>;
  /**
   * require or disallow trailing commas
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/comma-dangle.html
   */
  'jsonc/comma-dangle'?: Linter.RuleEntry<JsoncCommaDangle>;
  /**
   * enforce consistent comma style
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/comma-style.html
   */
  'jsonc/comma-style'?: Linter.RuleEntry<JsoncCommaStyle>;
  /**
   * enforce consistent indentation
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/indent.html
   */
  'jsonc/indent'?: Linter.RuleEntry<JsoncIndent>;
  /**
   * enforce naming convention to property key names
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/key-name-casing.html
   */
  'jsonc/key-name-casing'?: Linter.RuleEntry<JsoncKeyNameCasing>;
  /**
   * enforce consistent spacing between keys and values in object literal properties
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/key-spacing.html
   */
  'jsonc/key-spacing'?: Linter.RuleEntry<JsoncKeySpacing>;
  /**
   * disallow BigInt literals
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-bigint-literals.html
   */
  'jsonc/no-bigint-literals'?: Linter.RuleEntry<[]>;
  /**
   * disallow binary expression
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-binary-expression.html
   */
  'jsonc/no-binary-expression'?: Linter.RuleEntry<[]>;
  /**
   * disallow binary numeric literals
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-binary-numeric-literals.html
   */
  'jsonc/no-binary-numeric-literals'?: Linter.RuleEntry<[]>;
  /**
   * disallow comments
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-comments.html
   */
  'jsonc/no-comments'?: Linter.RuleEntry<[]>;
  /**
   * disallow duplicate keys in object literals
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-dupe-keys.html
   */
  'jsonc/no-dupe-keys'?: Linter.RuleEntry<[]>;
  /**
   * disallow escape sequences in identifiers.
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-escape-sequence-in-identifier.html
   */
  'jsonc/no-escape-sequence-in-identifier'?: Linter.RuleEntry<[]>;
  /**
   * disallow leading or trailing decimal points in numeric literals
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-floating-decimal.html
   */
  'jsonc/no-floating-decimal'?: Linter.RuleEntry<[]>;
  /**
   * disallow hexadecimal numeric literals
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-hexadecimal-numeric-literals.html
   */
  'jsonc/no-hexadecimal-numeric-literals'?: Linter.RuleEntry<[]>;
  /**
   * disallow Infinity
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-infinity.html
   */
  'jsonc/no-infinity'?: Linter.RuleEntry<[]>;
  /**
   * disallow irregular whitespace
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-irregular-whitespace.html
   */
  'jsonc/no-irregular-whitespace'?: Linter.RuleEntry<JsoncNoIrregularWhitespace>;
  /**
   * disallow multiline strings
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-multi-str.html
   */
  'jsonc/no-multi-str'?: Linter.RuleEntry<[]>;
  /**
   * disallow NaN
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-nan.html
   */
  'jsonc/no-nan'?: Linter.RuleEntry<[]>;
  /**
   * disallow number property keys
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-number-props.html
   */
  'jsonc/no-number-props'?: Linter.RuleEntry<[]>;
  /**
   * disallow numeric separators
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-numeric-separators.html
   */
  'jsonc/no-numeric-separators'?: Linter.RuleEntry<[]>;
  /**
   * disallow legacy octal literals
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-octal.html
   */
  'jsonc/no-octal'?: Linter.RuleEntry<[]>;
  /**
   * disallow octal escape sequences in string literals
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-octal-escape.html
   */
  'jsonc/no-octal-escape'?: Linter.RuleEntry<[]>;
  /**
   * disallow octal numeric literals
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-octal-numeric-literals.html
   */
  'jsonc/no-octal-numeric-literals'?: Linter.RuleEntry<[]>;
  /**
   * disallow parentheses around the expression
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-parenthesized.html
   */
  'jsonc/no-parenthesized'?: Linter.RuleEntry<[]>;
  /**
   * disallow plus sign
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-plus-sign.html
   */
  'jsonc/no-plus-sign'?: Linter.RuleEntry<[]>;
  /**
   * disallow RegExp literals
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-regexp-literals.html
   */
  'jsonc/no-regexp-literals'?: Linter.RuleEntry<[]>;
  /**
   * disallow sparse arrays
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-sparse-arrays.html
   */
  'jsonc/no-sparse-arrays'?: Linter.RuleEntry<[]>;
  /**
   * disallow template literals
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-template-literals.html
   */
  'jsonc/no-template-literals'?: Linter.RuleEntry<[]>;
  /**
   * disallow `undefined`
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-undefined-value.html
   */
  'jsonc/no-undefined-value'?: Linter.RuleEntry<[]>;
  /**
   * disallow Unicode code point escape sequences.
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-unicode-codepoint-escapes.html
   */
  'jsonc/no-unicode-codepoint-escapes'?: Linter.RuleEntry<[]>;
  /**
   * disallow unnecessary escape usage
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-useless-escape.html
   */
  'jsonc/no-useless-escape'?: Linter.RuleEntry<JsoncNoUselessEscape>;
  /**
   * enforce consistent line breaks inside braces
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/object-curly-newline.html
   */
  'jsonc/object-curly-newline'?: Linter.RuleEntry<JsoncObjectCurlyNewline>;
  /**
   * enforce consistent spacing inside braces
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/object-curly-spacing.html
   */
  'jsonc/object-curly-spacing'?: Linter.RuleEntry<JsoncObjectCurlySpacing>;
  /**
   * enforce placing object properties on separate lines
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/object-property-newline.html
   */
  'jsonc/object-property-newline'?: Linter.RuleEntry<JsoncObjectPropertyNewline>;
  /**
   * require quotes around object literal property names
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/quote-props.html
   */
  'jsonc/quote-props'?: Linter.RuleEntry<JsoncQuoteProps>;
  /**
   * enforce use of double or single quotes
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/quotes.html
   */
  'jsonc/quotes'?: Linter.RuleEntry<JsoncQuotes>;
  /**
   * require array values to be sorted
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/sort-array-values.html
   */
  'jsonc/sort-array-values'?: Linter.RuleEntry<JsoncSortArrayValues>;
  /**
   * require object keys to be sorted
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/sort-keys.html
   */
  'jsonc/sort-keys'?: Linter.RuleEntry<JsoncSortKeys>;
  /**
   * disallow spaces after unary operators
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/space-unary-ops.html
   */
  'jsonc/space-unary-ops'?: Linter.RuleEntry<JsoncSpaceUnaryOps>;
  /**
   * disallow invalid number for JSON
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/valid-json-number.html
   */
  'jsonc/valid-json-number'?: Linter.RuleEntry<[]>;
  /**
   * disallow parsing errors in Vue custom blocks
   * @see https://ota-meshi.github.io/eslint-plugin-jsonc/rules/vue-custom-block/no-parsing-error.html
   */
  'jsonc/vue-custom-block/no-parsing-error'?: Linter.RuleEntry<[]>;
  /**
   * Enforce emojis are wrapped in `<span>` and provide screen reader access.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/accessible-emoji.md
   * @deprecated
   */
  'jsx-a11y/accessible-emoji'?: Linter.RuleEntry<JsxA11YAccessibleEmoji>;
  /**
   * Enforce all elements that require alternative text have meaningful information to relay back to end user.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/alt-text.md
   */
  'jsx-a11y/alt-text'?: Linter.RuleEntry<JsxA11YAltText>;
  /**
   * Enforce `<a>` text to not exactly match "click here", "here", "link", or "a link".
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/anchor-ambiguous-text.md
   */
  'jsx-a11y/anchor-ambiguous-text'?: Linter.RuleEntry<JsxA11YAnchorAmbiguousText>;
  /**
   * Enforce all anchors to contain accessible content.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/anchor-has-content.md
   */
  'jsx-a11y/anchor-has-content'?: Linter.RuleEntry<JsxA11YAnchorHasContent>;
  /**
   * Enforce all anchors are valid, navigable elements.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/anchor-is-valid.md
   */
  'jsx-a11y/anchor-is-valid'?: Linter.RuleEntry<JsxA11YAnchorIsValid>;
  /**
   * Enforce elements with aria-activedescendant are tabbable.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/aria-activedescendant-has-tabindex.md
   */
  'jsx-a11y/aria-activedescendant-has-tabindex'?: Linter.RuleEntry<JsxA11YAriaActivedescendantHasTabindex>;
  /**
   * Enforce all `aria-*` props are valid.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/aria-props.md
   */
  'jsx-a11y/aria-props'?: Linter.RuleEntry<JsxA11YAriaProps>;
  /**
   * Enforce ARIA state and property values are valid.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/aria-proptypes.md
   */
  'jsx-a11y/aria-proptypes'?: Linter.RuleEntry<JsxA11YAriaProptypes>;
  /**
   * Enforce that elements with ARIA roles must use a valid, non-abstract ARIA role.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/aria-role.md
   */
  'jsx-a11y/aria-role'?: Linter.RuleEntry<JsxA11YAriaRole>;
  /**
   * Enforce that elements that do not support ARIA roles, states, and properties do not have those attributes.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/aria-unsupported-elements.md
   */
  'jsx-a11y/aria-unsupported-elements'?: Linter.RuleEntry<JsxA11YAriaUnsupportedElements>;
  /**
   * Enforce that autocomplete attributes are used correctly.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/autocomplete-valid.md
   */
  'jsx-a11y/autocomplete-valid'?: Linter.RuleEntry<JsxA11YAutocompleteValid>;
  /**
   * Enforce a clickable non-interactive element has at least one keyboard event listener.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/click-events-have-key-events.md
   */
  'jsx-a11y/click-events-have-key-events'?: Linter.RuleEntry<JsxA11YClickEventsHaveKeyEvents>;
  /**
   * Enforce that a control (an interactive element) has a text label.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/control-has-associated-label.md
   */
  'jsx-a11y/control-has-associated-label'?: Linter.RuleEntry<JsxA11YControlHasAssociatedLabel>;
  /**
   * Enforce heading (`h1`, `h2`, etc) elements contain accessible content.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/heading-has-content.md
   */
  'jsx-a11y/heading-has-content'?: Linter.RuleEntry<JsxA11YHeadingHasContent>;
  /**
   * Enforce `<html>` element has `lang` prop.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/html-has-lang.md
   */
  'jsx-a11y/html-has-lang'?: Linter.RuleEntry<JsxA11YHtmlHasLang>;
  /**
   * Enforce iframe elements have a title attribute.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/iframe-has-title.md
   */
  'jsx-a11y/iframe-has-title'?: Linter.RuleEntry<JsxA11YIframeHasTitle>;
  /**
   * Enforce `<img>` alt prop does not contain the word "image", "picture", or "photo".
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/img-redundant-alt.md
   */
  'jsx-a11y/img-redundant-alt'?: Linter.RuleEntry<JsxA11YImgRedundantAlt>;
  /**
   * Enforce that elements with interactive handlers like `onClick` must be focusable.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/interactive-supports-focus.md
   */
  'jsx-a11y/interactive-supports-focus'?: Linter.RuleEntry<JsxA11YInteractiveSupportsFocus>;
  /**
   * Enforce that a `label` tag has a text label and an associated control.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/label-has-associated-control.md
   */
  'jsx-a11y/label-has-associated-control'?: Linter.RuleEntry<JsxA11YLabelHasAssociatedControl>;
  /**
   * Enforce that `<label>` elements have the `htmlFor` prop.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/label-has-for.md
   * @deprecated
   */
  'jsx-a11y/label-has-for'?: Linter.RuleEntry<JsxA11YLabelHasFor>;
  /**
   * Enforce lang attribute has a valid value.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/lang.md
   */
  'jsx-a11y/lang'?: Linter.RuleEntry<JsxA11YLang>;
  /**
   * Enforces that `<audio>` and `<video>` elements must have a `<track>` for captions.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/media-has-caption.md
   */
  'jsx-a11y/media-has-caption'?: Linter.RuleEntry<JsxA11YMediaHasCaption>;
  /**
   * Enforce that `onMouseOver`/`onMouseOut` are accompanied by `onFocus`/`onBlur` for keyboard-only users.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/mouse-events-have-key-events.md
   */
  'jsx-a11y/mouse-events-have-key-events'?: Linter.RuleEntry<JsxA11YMouseEventsHaveKeyEvents>;
  /**
   * Enforce that the `accessKey` prop is not used on any element to avoid complications with keyboard commands used by a screen reader.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/no-access-key.md
   */
  'jsx-a11y/no-access-key'?: Linter.RuleEntry<JsxA11YNoAccessKey>;
  /**
   * Disallow `aria-hidden="true"` from being set on focusable elements.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/no-aria-hidden-on-focusable.md
   */
  'jsx-a11y/no-aria-hidden-on-focusable'?: Linter.RuleEntry<JsxA11YNoAriaHiddenOnFocusable>;
  /**
   * Enforce autoFocus prop is not used.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/no-autofocus.md
   */
  'jsx-a11y/no-autofocus'?: Linter.RuleEntry<JsxA11YNoAutofocus>;
  /**
   * Enforce distracting elements are not used.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/no-distracting-elements.md
   */
  'jsx-a11y/no-distracting-elements'?: Linter.RuleEntry<JsxA11YNoDistractingElements>;
  /**
   * Interactive elements should not be assigned non-interactive roles.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/no-interactive-element-to-noninteractive-role.md
   */
  'jsx-a11y/no-interactive-element-to-noninteractive-role'?: Linter.RuleEntry<JsxA11YNoInteractiveElementToNoninteractiveRole>;
  /**
   * Non-interactive elements should not be assigned mouse or keyboard event listeners.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/no-noninteractive-element-interactions.md
   */
  'jsx-a11y/no-noninteractive-element-interactions'?: Linter.RuleEntry<JsxA11YNoNoninteractiveElementInteractions>;
  /**
   * Non-interactive elements should not be assigned interactive roles.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/no-noninteractive-element-to-interactive-role.md
   */
  'jsx-a11y/no-noninteractive-element-to-interactive-role'?: Linter.RuleEntry<JsxA11YNoNoninteractiveElementToInteractiveRole>;
  /**
   * `tabIndex` should only be declared on interactive elements.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/no-noninteractive-tabindex.md
   */
  'jsx-a11y/no-noninteractive-tabindex'?: Linter.RuleEntry<JsxA11YNoNoninteractiveTabindex>;
  /**
   * Enforce usage of `onBlur` over `onChange` on select menus for accessibility.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/no-onchange.md
   * @deprecated
   */
  'jsx-a11y/no-onchange'?: Linter.RuleEntry<JsxA11YNoOnchange>;
  /**
   * Enforce explicit role property is not the same as implicit/default role property on element.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/no-redundant-roles.md
   */
  'jsx-a11y/no-redundant-roles'?: Linter.RuleEntry<JsxA11YNoRedundantRoles>;
  /**
   * Enforce that non-interactive, visible elements (such as `<div>`) that have click handlers use the role attribute.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/no-static-element-interactions.md
   */
  'jsx-a11y/no-static-element-interactions'?: Linter.RuleEntry<JsxA11YNoStaticElementInteractions>;
  /**
   * Enforces using semantic DOM elements over the ARIA `role` property.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/prefer-tag-over-role.md
   */
  'jsx-a11y/prefer-tag-over-role'?: Linter.RuleEntry<JsxA11YPreferTagOverRole>;
  /**
   * Enforce that elements with ARIA roles must have all required attributes for that role.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/role-has-required-aria-props.md
   */
  'jsx-a11y/role-has-required-aria-props'?: Linter.RuleEntry<JsxA11YRoleHasRequiredAriaProps>;
  /**
   * Enforce that elements with explicit or implicit roles defined contain only `aria-*` properties supported by that `role`.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/role-supports-aria-props.md
   */
  'jsx-a11y/role-supports-aria-props'?: Linter.RuleEntry<JsxA11YRoleSupportsAriaProps>;
  /**
   * Enforce `scope` prop is only used on `<th>` elements.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/scope.md
   */
  'jsx-a11y/scope'?: Linter.RuleEntry<JsxA11YScope>;
  /**
   * Enforce `tabIndex` value is not greater than zero.
   * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/tabindex-no-positive.md
   */
  'jsx-a11y/tabindex-no-positive'?: Linter.RuleEntry<JsxA11YTabindexNoPositive>;
  /**
   * Enforce the consistent use of either double or single quotes in JSX attributes
   * @see https://eslint.org/docs/latest/rules/jsx-quotes
   * @deprecated
   */
  'jsx-quotes'?: Linter.RuleEntry<JsxQuotes>;
  /**
   * Enforce consistent spacing between keys and values in object literal properties
   * @see https://eslint.org/docs/latest/rules/key-spacing
   * @deprecated
   */
  'key-spacing'?: Linter.RuleEntry<KeySpacing>;
  /**
   * Enforce consistent spacing before and after keywords
   * @see https://eslint.org/docs/latest/rules/keyword-spacing
   * @deprecated
   */
  'keyword-spacing'?: Linter.RuleEntry<KeywordSpacing>;
  /**
   * Enforce position of line comments
   * @see https://eslint.org/docs/latest/rules/line-comment-position
   * @deprecated
   */
  'line-comment-position'?: Linter.RuleEntry<LineCommentPosition>;
  /**
   * Enforce consistent linebreak style
   * @see https://eslint.org/docs/latest/rules/linebreak-style
   * @deprecated
   */
  'linebreak-style'?: Linter.RuleEntry<LinebreakStyle>;
  /**
   * Require empty lines around comments
   * @see https://eslint.org/docs/latest/rules/lines-around-comment
   * @deprecated
   */
  'lines-around-comment'?: Linter.RuleEntry<LinesAroundComment>;
  /**
   * Require or disallow newlines around directives
   * @see https://eslint.org/docs/latest/rules/lines-around-directive
   * @deprecated
   */
  'lines-around-directive'?: Linter.RuleEntry<LinesAroundDirective>;
  /**
   * Require or disallow an empty line between class members
   * @see https://eslint.org/docs/latest/rules/lines-between-class-members
   * @deprecated
   */
  'lines-between-class-members'?: Linter.RuleEntry<LinesBetweenClassMembers>;
  /**
   * Require or disallow logical assignment operator shorthand
   * @see https://eslint.org/docs/latest/rules/logical-assignment-operators
   */
  'logical-assignment-operators'?: Linter.RuleEntry<LogicalAssignmentOperators>;
  /**
   * Require languages for fenced code blocks
   * @see https://github.com/eslint/markdown/blob/main/docs/rules/fenced-code-language.md
   */
  'markdown/fenced-code-language'?: Linter.RuleEntry<MarkdownFencedCodeLanguage>;
  /**
   * Enforce heading levels increment by one
   * @see https://github.com/eslint/markdown/blob/main/docs/rules/heading-increment.md
   */
  'markdown/heading-increment'?: Linter.RuleEntry<MarkdownHeadingIncrement>;
  /**
   * Disallow bare URLs
   * @see https://github.com/eslint/markdown/blob/main/docs/rules/no-bare-urls.md
   */
  'markdown/no-bare-urls'?: Linter.RuleEntry<[]>;
  /**
   * Disallow duplicate definitions
   * @see https://github.com/eslint/markdown/blob/main/docs/rules/no-duplicate-definitions.md
   */
  'markdown/no-duplicate-definitions'?: Linter.RuleEntry<MarkdownNoDuplicateDefinitions>;
  /**
   * Disallow duplicate headings in the same document
   * @see https://github.com/eslint/markdown/blob/main/docs/rules/no-duplicate-headings.md
   */
  'markdown/no-duplicate-headings'?: Linter.RuleEntry<MarkdownNoDuplicateHeadings>;
  /**
   * Disallow empty definitions
   * @see https://github.com/eslint/markdown/blob/main/docs/rules/no-empty-definitions.md
   */
  'markdown/no-empty-definitions'?: Linter.RuleEntry<MarkdownNoEmptyDefinitions>;
  /**
   * Disallow empty images
   * @see https://github.com/eslint/markdown/blob/main/docs/rules/no-empty-images.md
   */
  'markdown/no-empty-images'?: Linter.RuleEntry<[]>;
  /**
   * Disallow empty links
   * @see https://github.com/eslint/markdown/blob/main/docs/rules/no-empty-links.md
   */
  'markdown/no-empty-links'?: Linter.RuleEntry<[]>;
  /**
   * Disallow HTML tags
   * @see https://github.com/eslint/markdown/blob/main/docs/rules/no-html.md
   */
  'markdown/no-html'?: Linter.RuleEntry<MarkdownNoHtml>;
  /**
   * Disallow invalid label references
   * @see https://github.com/eslint/markdown/blob/main/docs/rules/no-invalid-label-refs.md
   */
  'markdown/no-invalid-label-refs'?: Linter.RuleEntry<[]>;
  /**
   * Disallow headings without a space after the hash characters
   * @see https://github.com/eslint/markdown/blob/main/docs/rules/no-missing-atx-heading-space.md
   */
  'markdown/no-missing-atx-heading-space'?: Linter.RuleEntry<MarkdownNoMissingAtxHeadingSpace>;
  /**
   * Disallow missing label references
   * @see https://github.com/eslint/markdown/blob/main/docs/rules/no-missing-label-refs.md
   */
  'markdown/no-missing-label-refs'?: Linter.RuleEntry<MarkdownNoMissingLabelRefs>;
  /**
   * Disallow link fragments that do not reference valid headings
   * @see https://github.com/eslint/markdown/blob/main/docs/rules/no-missing-link-fragments.md
   */
  'markdown/no-missing-link-fragments'?: Linter.RuleEntry<MarkdownNoMissingLinkFragments>;
  /**
   * Disallow multiple H1 headings in the same document
   * @see https://github.com/eslint/markdown/blob/main/docs/rules/no-multiple-h1.md
   */
  'markdown/no-multiple-h1'?: Linter.RuleEntry<MarkdownNoMultipleH1>;
  /**
   * Disallow URLs that match defined reference identifiers
   * @see https://github.com/eslint/markdown/blob/main/docs/rules/no-reference-like-urls.md
   */
  'markdown/no-reference-like-urls'?: Linter.RuleEntry<[]>;
  /**
   * Disallow reversed link and image syntax
   * @see https://github.com/eslint/markdown/blob/main/docs/rules/no-reversed-media-syntax.md
   */
  'markdown/no-reversed-media-syntax'?: Linter.RuleEntry<[]>;
  /**
   * Disallow spaces around emphasis markers
   * @see https://github.com/eslint/markdown/blob/main/docs/rules/no-space-in-emphasis.md
   */
  'markdown/no-space-in-emphasis'?: Linter.RuleEntry<MarkdownNoSpaceInEmphasis>;
  /**
   * Disallow unused definitions
   * @see https://github.com/eslint/markdown/blob/main/docs/rules/no-unused-definitions.md
   */
  'markdown/no-unused-definitions'?: Linter.RuleEntry<MarkdownNoUnusedDefinitions>;
  /**
   * Require alternative text for images
   * @see https://github.com/eslint/markdown/blob/main/docs/rules/require-alt-text.md
   */
  'markdown/require-alt-text'?: Linter.RuleEntry<[]>;
  /**
   * Disallow data rows in a GitHub Flavored Markdown table from having more cells than the header row
   * @see https://github.com/eslint/markdown/blob/main/docs/rules/table-column-count.md
   */
  'markdown/table-column-count'?: Linter.RuleEntry<MarkdownTableColumnCount>;
  /**
   * Enforce a maximum number of classes per file
   * @see https://eslint.org/docs/latest/rules/max-classes-per-file
   */
  'max-classes-per-file'?: Linter.RuleEntry<MaxClassesPerFile>;
  /**
   * Enforce a maximum depth that blocks can be nested
   * @see https://eslint.org/docs/latest/rules/max-depth
   */
  'max-depth'?: Linter.RuleEntry<MaxDepth>;
  /**
   * Enforce a maximum line length
   * @see https://eslint.org/docs/latest/rules/max-len
   * @deprecated
   */
  'max-len'?: Linter.RuleEntry<MaxLen>;
  /**
   * Enforce a maximum number of lines per file
   * @see https://eslint.org/docs/latest/rules/max-lines
   */
  'max-lines'?: Linter.RuleEntry<MaxLines>;
  /**
   * Enforce a maximum number of lines of code in a function
   * @see https://eslint.org/docs/latest/rules/max-lines-per-function
   */
  'max-lines-per-function'?: Linter.RuleEntry<MaxLinesPerFunction>;
  /**
   * Enforce a maximum depth that callbacks can be nested
   * @see https://eslint.org/docs/latest/rules/max-nested-callbacks
   */
  'max-nested-callbacks'?: Linter.RuleEntry<MaxNestedCallbacks>;
  /**
   * Enforce a maximum number of parameters in function definitions
   * @see https://eslint.org/docs/latest/rules/max-params
   */
  'max-params'?: Linter.RuleEntry<MaxParams>;
  /**
   * Enforce a maximum number of statements allowed in function blocks
   * @see https://eslint.org/docs/latest/rules/max-statements
   */
  'max-statements'?: Linter.RuleEntry<MaxStatements>;
  /**
   * Enforce a maximum number of statements allowed per line
   * @see https://eslint.org/docs/latest/rules/max-statements-per-line
   * @deprecated
   */
  'max-statements-per-line'?: Linter.RuleEntry<MaxStatementsPerLine>;
  /**
   * Enforce a particular style for multiline comments
   * @see https://eslint.org/docs/latest/rules/multiline-comment-style
   * @deprecated
   */
  'multiline-comment-style'?: Linter.RuleEntry<MultilineCommentStyle>;
  /**
   * Enforce newlines between operands of ternary expressions
   * @see https://eslint.org/docs/latest/rules/multiline-ternary
   * @deprecated
   */
  'multiline-ternary'?: Linter.RuleEntry<MultilineTernary>;
  /**
   * Require constructor names to begin with a capital letter
   * @see https://eslint.org/docs/latest/rules/new-cap
   */
  'new-cap'?: Linter.RuleEntry<NewCap>;
  /**
   * Enforce or disallow parentheses when invoking a constructor with no arguments
   * @see https://eslint.org/docs/latest/rules/new-parens
   * @deprecated
   */
  'new-parens'?: Linter.RuleEntry<NewParens>;
  /**
   * Require or disallow an empty line after variable declarations
   * @see https://eslint.org/docs/latest/rules/newline-after-var
   * @deprecated
   */
  'newline-after-var'?: Linter.RuleEntry<NewlineAfterVar>;
  /**
   * Require an empty line before `return` statements
   * @see https://eslint.org/docs/latest/rules/newline-before-return
   * @deprecated
   */
  'newline-before-return'?: Linter.RuleEntry<[]>;
  /**
   * Require a newline after each call in a method chain
   * @see https://eslint.org/docs/latest/rules/newline-per-chained-call
   * @deprecated
   */
  'newline-per-chained-call'?: Linter.RuleEntry<NewlinePerChainedCall>;
  /**
   * Enforce font-display behavior with Google Fonts.
   * @see https://nextjs.org/docs/messages/google-font-display
   */
  'next/google-font-display'?: Linter.RuleEntry<[]>;
  /**
   * Ensure `preconnect` is used with Google Fonts.
   * @see https://nextjs.org/docs/messages/google-font-preconnect
   */
  'next/google-font-preconnect'?: Linter.RuleEntry<[]>;
  /**
   * Enforce `id` attribute on `next/script` components with inline content.
   * @see https://nextjs.org/docs/messages/inline-script-id
   */
  'next/inline-script-id'?: Linter.RuleEntry<[]>;
  /**
   * Prefer `@next/third-parties/google` when using the inline script for Google Analytics and Tag Manager.
   * @see https://nextjs.org/docs/messages/next-script-for-ga
   */
  'next/next-script-for-ga'?: Linter.RuleEntry<[]>;
  /**
   * Prevent assignment to the `module` variable.
   * @see https://nextjs.org/docs/messages/no-assign-module-variable
   */
  'next/no-assign-module-variable'?: Linter.RuleEntry<[]>;
  /**
   * Prevent Client Components from being async functions.
   * @see https://nextjs.org/docs/messages/no-async-client-component
   */
  'next/no-async-client-component'?: Linter.RuleEntry<[]>;
  /**
   * Prevent usage of `next/script`'s `beforeInteractive` strategy outside of `pages/_document.js`.
   * @see https://nextjs.org/docs/messages/no-before-interactive-script-outside-document
   */
  'next/no-before-interactive-script-outside-document'?: Linter.RuleEntry<[]>;
  /**
   * Prevent manual stylesheet tags.
   * @see https://nextjs.org/docs/messages/no-css-tags
   */
  'next/no-css-tags'?: Linter.RuleEntry<[]>;
  /**
   * Prevent importing `next/document` outside of `pages/_document.js`.
   * @see https://nextjs.org/docs/messages/no-document-import-in-page
   */
  'next/no-document-import-in-page'?: Linter.RuleEntry<[]>;
  /**
   * Prevent duplicate usage of `<Head>` in `pages/_document.js`.
   * @see https://nextjs.org/docs/messages/no-duplicate-head
   */
  'next/no-duplicate-head'?: Linter.RuleEntry<[]>;
  /**
   * Prevent usage of `<head>` element.
   * @see https://nextjs.org/docs/messages/no-head-element
   */
  'next/no-head-element'?: Linter.RuleEntry<[]>;
  /**
   * Prevent usage of `next/head` in `pages/_document.js`.
   * @see https://nextjs.org/docs/messages/no-head-import-in-document
   */
  'next/no-head-import-in-document'?: Linter.RuleEntry<[]>;
  /**
   * Prevent usage of `<a>` elements to navigate to internal Next.js pages.
   * @see https://nextjs.org/docs/messages/no-html-link-for-pages
   */
  'next/no-html-link-for-pages'?: Linter.RuleEntry<NextNoHtmlLinkForPages>;
  /**
   * Prevent usage of `<img>` element due to slower LCP and higher bandwidth.
   * @see https://nextjs.org/docs/messages/no-img-element
   */
  'next/no-img-element'?: Linter.RuleEntry<[]>;
  /**
   * Prevent page-only custom fonts.
   * @see https://nextjs.org/docs/messages/no-page-custom-font
   */
  'next/no-page-custom-font'?: Linter.RuleEntry<[]>;
  /**
   * Prevent usage of `next/script` in `next/head` component.
   * @see https://nextjs.org/docs/messages/no-script-component-in-head
   */
  'next/no-script-component-in-head'?: Linter.RuleEntry<[]>;
  /**
   * Prevent usage of `styled-jsx` in `pages/_document.js`.
   * @see https://nextjs.org/docs/messages/no-styled-jsx-in-document
   */
  'next/no-styled-jsx-in-document'?: Linter.RuleEntry<[]>;
  /**
   * Prevent synchronous scripts.
   * @see https://nextjs.org/docs/messages/no-sync-scripts
   */
  'next/no-sync-scripts'?: Linter.RuleEntry<[]>;
  /**
   * Prevent usage of `<title>` with `Head` component from `next/document`.
   * @see https://nextjs.org/docs/messages/no-title-in-document-head
   */
  'next/no-title-in-document-head'?: Linter.RuleEntry<[]>;
  /**
   * Prevent common typos in Next.js data fetching functions.
   */
  'next/no-typos'?: Linter.RuleEntry<[]>;
  /**
   * Prevent duplicate polyfills from Polyfill.io.
   * @see https://nextjs.org/docs/messages/no-unwanted-polyfillio
   */
  'next/no-unwanted-polyfillio'?: Linter.RuleEntry<[]>;
  /**
   * Disallow the use of `alert`, `confirm`, and `prompt`
   * @see https://eslint.org/docs/latest/rules/no-alert
   */
  'no-alert'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `Array` constructors
   * @see https://eslint.org/docs/latest/rules/no-array-constructor
   */
  'no-array-constructor'?: Linter.RuleEntry<[]>;
  /**
   * Disallow using an async function as a Promise executor
   * @see https://eslint.org/docs/latest/rules/no-async-promise-executor
   */
  'no-async-promise-executor'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `await` inside of loops
   * @see https://eslint.org/docs/latest/rules/no-await-in-loop
   */
  'no-await-in-loop'?: Linter.RuleEntry<[]>;
  /**
   * Disallow bitwise operators
   * @see https://eslint.org/docs/latest/rules/no-bitwise
   */
  'no-bitwise'?: Linter.RuleEntry<NoBitwise>;
  /**
   * Disallow use of the `Buffer()` constructor
   * @see https://eslint.org/docs/latest/rules/no-buffer-constructor
   * @deprecated
   */
  'no-buffer-constructor'?: Linter.RuleEntry<[]>;
  /**
   * Disallow the use of `arguments.caller` or `arguments.callee`
   * @see https://eslint.org/docs/latest/rules/no-caller
   */
  'no-caller'?: Linter.RuleEntry<[]>;
  /**
   * Disallow lexical declarations in case clauses
   * @see https://eslint.org/docs/latest/rules/no-case-declarations
   */
  'no-case-declarations'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `catch` clause parameters from shadowing variables in the outer scope
   * @see https://eslint.org/docs/latest/rules/no-catch-shadow
   * @deprecated
   */
  'no-catch-shadow'?: Linter.RuleEntry<[]>;
  /**
   * Disallow reassigning class members
   * @see https://eslint.org/docs/latest/rules/no-class-assign
   */
  'no-class-assign'?: Linter.RuleEntry<[]>;
  /**
   * Disallow comparing against `-0`
   * @see https://eslint.org/docs/latest/rules/no-compare-neg-zero
   */
  'no-compare-neg-zero'?: Linter.RuleEntry<[]>;
  /**
   * Disallow assignment operators in conditional expressions
   * @see https://eslint.org/docs/latest/rules/no-cond-assign
   */
  'no-cond-assign'?: Linter.RuleEntry<NoCondAssign>;
  /**
   * Disallow arrow functions where they could be confused with comparisons
   * @see https://eslint.org/docs/latest/rules/no-confusing-arrow
   * @deprecated
   */
  'no-confusing-arrow'?: Linter.RuleEntry<NoConfusingArrow>;
  /**
   * Disallow the use of `console`
   * @see https://eslint.org/docs/latest/rules/no-console
   */
  'no-console'?: Linter.RuleEntry<NoConsole>;
  /**
   * Disallow reassigning `const`, `using`, and `await using` variables
   * @see https://eslint.org/docs/latest/rules/no-const-assign
   */
  'no-const-assign'?: Linter.RuleEntry<[]>;
  /**
   * Disallow expressions where the operation doesn't affect the value
   * @see https://eslint.org/docs/latest/rules/no-constant-binary-expression
   */
  'no-constant-binary-expression'?: Linter.RuleEntry<[]>;
  /**
   * Disallow constant expressions in conditions
   * @see https://eslint.org/docs/latest/rules/no-constant-condition
   */
  'no-constant-condition'?: Linter.RuleEntry<NoConstantCondition>;
  /**
   * Disallow returning value from constructor
   * @see https://eslint.org/docs/latest/rules/no-constructor-return
   */
  'no-constructor-return'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `continue` statements
   * @see https://eslint.org/docs/latest/rules/no-continue
   */
  'no-continue'?: Linter.RuleEntry<[]>;
  /**
   * Disallow control characters in regular expressions
   * @see https://eslint.org/docs/latest/rules/no-control-regex
   */
  'no-control-regex'?: Linter.RuleEntry<[]>;
  /**
   * Disallow the use of `debugger`
   * @see https://eslint.org/docs/latest/rules/no-debugger
   */
  'no-debugger'?: Linter.RuleEntry<[]>;
  /**
   * Disallow deleting variables
   * @see https://eslint.org/docs/latest/rules/no-delete-var
   */
  'no-delete-var'?: Linter.RuleEntry<[]>;
  /**
   * Disallow equal signs explicitly at the beginning of regular expressions
   * @see https://eslint.org/docs/latest/rules/no-div-regex
   */
  'no-div-regex'?: Linter.RuleEntry<[]>;
  /**
   * Disallow duplicate arguments in `function` definitions
   * @see https://eslint.org/docs/latest/rules/no-dupe-args
   */
  'no-dupe-args'?: Linter.RuleEntry<[]>;
  /**
   * Disallow duplicate class members
   * @see https://eslint.org/docs/latest/rules/no-dupe-class-members
   */
  'no-dupe-class-members'?: Linter.RuleEntry<[]>;
  /**
   * Disallow duplicate conditions in if-else-if chains
   * @see https://eslint.org/docs/latest/rules/no-dupe-else-if
   */
  'no-dupe-else-if'?: Linter.RuleEntry<[]>;
  /**
   * Disallow duplicate keys in object literals
   * @see https://eslint.org/docs/latest/rules/no-dupe-keys
   */
  'no-dupe-keys'?: Linter.RuleEntry<[]>;
  /**
   * Disallow duplicate case labels
   * @see https://eslint.org/docs/latest/rules/no-duplicate-case
   */
  'no-duplicate-case'?: Linter.RuleEntry<[]>;
  /**
   * Disallow duplicate module imports
   * @see https://eslint.org/docs/latest/rules/no-duplicate-imports
   */
  'no-duplicate-imports'?: Linter.RuleEntry<NoDuplicateImports>;
  /**
   * Disallow `else` blocks after `return` statements in `if` statements
   * @see https://eslint.org/docs/latest/rules/no-else-return
   */
  'no-else-return'?: Linter.RuleEntry<NoElseReturn>;
  /**
   * Disallow empty block statements
   * @see https://eslint.org/docs/latest/rules/no-empty
   */
  'no-empty'?: Linter.RuleEntry<NoEmpty>;
  /**
   * Disallow empty character classes in regular expressions
   * @see https://eslint.org/docs/latest/rules/no-empty-character-class
   */
  'no-empty-character-class'?: Linter.RuleEntry<[]>;
  /**
   * Disallow empty functions
   * @see https://eslint.org/docs/latest/rules/no-empty-function
   */
  'no-empty-function'?: Linter.RuleEntry<NoEmptyFunction>;
  /**
   * Disallow empty destructuring patterns
   * @see https://eslint.org/docs/latest/rules/no-empty-pattern
   */
  'no-empty-pattern'?: Linter.RuleEntry<NoEmptyPattern>;
  /**
   * Disallow empty static blocks
   * @see https://eslint.org/docs/latest/rules/no-empty-static-block
   */
  'no-empty-static-block'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `null` comparisons without type-checking operators
   * @see https://eslint.org/docs/latest/rules/no-eq-null
   */
  'no-eq-null'?: Linter.RuleEntry<[]>;
  /**
   * Disallow the use of `eval()`
   * @see https://eslint.org/docs/latest/rules/no-eval
   */
  'no-eval'?: Linter.RuleEntry<NoEval>;
  /**
   * Disallow reassigning exceptions in `catch` clauses
   * @see https://eslint.org/docs/latest/rules/no-ex-assign
   */
  'no-ex-assign'?: Linter.RuleEntry<[]>;
  /**
   * Disallow extending native types
   * @see https://eslint.org/docs/latest/rules/no-extend-native
   */
  'no-extend-native'?: Linter.RuleEntry<NoExtendNative>;
  /**
   * Disallow unnecessary calls to `.bind()`
   * @see https://eslint.org/docs/latest/rules/no-extra-bind
   */
  'no-extra-bind'?: Linter.RuleEntry<[]>;
  /**
   * Disallow unnecessary boolean casts
   * @see https://eslint.org/docs/latest/rules/no-extra-boolean-cast
   */
  'no-extra-boolean-cast'?: Linter.RuleEntry<NoExtraBooleanCast>;
  /**
   * Disallow unnecessary labels
   * @see https://eslint.org/docs/latest/rules/no-extra-label
   */
  'no-extra-label'?: Linter.RuleEntry<[]>;
  /**
   * Disallow unnecessary parentheses
   * @see https://eslint.org/docs/latest/rules/no-extra-parens
   * @deprecated
   */
  'no-extra-parens'?: Linter.RuleEntry<NoExtraParens>;
  /**
   * Disallow unnecessary semicolons
   * @see https://eslint.org/docs/latest/rules/no-extra-semi
   * @deprecated
   */
  'no-extra-semi'?: Linter.RuleEntry<[]>;
  /**
   * Disallow fallthrough of `case` statements
   * @see https://eslint.org/docs/latest/rules/no-fallthrough
   */
  'no-fallthrough'?: Linter.RuleEntry<NoFallthrough>;
  /**
   * Disallow leading or trailing decimal points in numeric literals
   * @see https://eslint.org/docs/latest/rules/no-floating-decimal
   * @deprecated
   */
  'no-floating-decimal'?: Linter.RuleEntry<[]>;
  /**
   * Disallow reassigning `function` declarations
   * @see https://eslint.org/docs/latest/rules/no-func-assign
   */
  'no-func-assign'?: Linter.RuleEntry<[]>;
  /**
   * Disallow assignments to native objects or read-only global variables
   * @see https://eslint.org/docs/latest/rules/no-global-assign
   */
  'no-global-assign'?: Linter.RuleEntry<NoGlobalAssign>;
  /**
   * Disallow shorthand type conversions
   * @see https://eslint.org/docs/latest/rules/no-implicit-coercion
   */
  'no-implicit-coercion'?: Linter.RuleEntry<NoImplicitCoercion>;
  /**
   * Disallow declarations in the global scope
   * @see https://eslint.org/docs/latest/rules/no-implicit-globals
   */
  'no-implicit-globals'?: Linter.RuleEntry<NoImplicitGlobals>;
  /**
   * Disallow the use of `eval()`-like methods
   * @see https://eslint.org/docs/latest/rules/no-implied-eval
   */
  'no-implied-eval'?: Linter.RuleEntry<[]>;
  /**
   * Disallow assigning to imported bindings
   * @see https://eslint.org/docs/latest/rules/no-import-assign
   */
  'no-import-assign'?: Linter.RuleEntry<[]>;
  /**
   * Disallow inline comments after code
   * @see https://eslint.org/docs/latest/rules/no-inline-comments
   */
  'no-inline-comments'?: Linter.RuleEntry<NoInlineComments>;
  /**
   * Disallow variable or `function` declarations in nested blocks
   * @see https://eslint.org/docs/latest/rules/no-inner-declarations
   */
  'no-inner-declarations'?: Linter.RuleEntry<NoInnerDeclarations>;
  /**
   * Disallow invalid regular expression strings in `RegExp` constructors
   * @see https://eslint.org/docs/latest/rules/no-invalid-regexp
   */
  'no-invalid-regexp'?: Linter.RuleEntry<NoInvalidRegexp>;
  /**
   * Disallow use of `this` in contexts where the value of `this` is `undefined`
   * @see https://eslint.org/docs/latest/rules/no-invalid-this
   */
  'no-invalid-this'?: Linter.RuleEntry<NoInvalidThis>;
  /**
   * Disallow irregular whitespace
   * @see https://eslint.org/docs/latest/rules/no-irregular-whitespace
   */
  'no-irregular-whitespace'?: Linter.RuleEntry<NoIrregularWhitespace>;
  /**
   * Disallow the use of the `__iterator__` property
   * @see https://eslint.org/docs/latest/rules/no-iterator
   */
  'no-iterator'?: Linter.RuleEntry<[]>;
  /**
   * Disallow labels that share a name with a variable
   * @see https://eslint.org/docs/latest/rules/no-label-var
   */
  'no-label-var'?: Linter.RuleEntry<[]>;
  /**
   * Disallow labeled statements
   * @see https://eslint.org/docs/latest/rules/no-labels
   */
  'no-labels'?: Linter.RuleEntry<NoLabels>;
  /**
   * Disallow unnecessary nested blocks
   * @see https://eslint.org/docs/latest/rules/no-lone-blocks
   */
  'no-lone-blocks'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `if` statements as the only statement in `else` blocks
   * @see https://eslint.org/docs/latest/rules/no-lonely-if
   */
  'no-lonely-if'?: Linter.RuleEntry<[]>;
  /**
   * Disallow function declarations that contain unsafe references inside loop statements
   * @see https://eslint.org/docs/latest/rules/no-loop-func
   */
  'no-loop-func'?: Linter.RuleEntry<[]>;
  /**
   * Disallow literal numbers that lose precision
   * @see https://eslint.org/docs/latest/rules/no-loss-of-precision
   */
  'no-loss-of-precision'?: Linter.RuleEntry<[]>;
  /**
   * Disallow magic numbers
   * @see https://eslint.org/docs/latest/rules/no-magic-numbers
   */
  'no-magic-numbers'?: Linter.RuleEntry<NoMagicNumbers>;
  /**
   * Disallow characters which are made with multiple code points in character class syntax
   * @see https://eslint.org/docs/latest/rules/no-misleading-character-class
   */
  'no-misleading-character-class'?: Linter.RuleEntry<NoMisleadingCharacterClass>;
  /**
   * Disallow mixed binary operators
   * @see https://eslint.org/docs/latest/rules/no-mixed-operators
   * @deprecated
   */
  'no-mixed-operators'?: Linter.RuleEntry<NoMixedOperators>;
  /**
   * Disallow `require` calls to be mixed with regular variable declarations
   * @see https://eslint.org/docs/latest/rules/no-mixed-requires
   * @deprecated
   */
  'no-mixed-requires'?: Linter.RuleEntry<NoMixedRequires>;
  /**
   * Disallow mixed spaces and tabs for indentation
   * @see https://eslint.org/docs/latest/rules/no-mixed-spaces-and-tabs
   * @deprecated
   */
  'no-mixed-spaces-and-tabs'?: Linter.RuleEntry<NoMixedSpacesAndTabs>;
  /**
   * Disallow use of chained assignment expressions
   * @see https://eslint.org/docs/latest/rules/no-multi-assign
   */
  'no-multi-assign'?: Linter.RuleEntry<NoMultiAssign>;
  /**
   * Disallow multiple spaces
   * @see https://eslint.org/docs/latest/rules/no-multi-spaces
   * @deprecated
   */
  'no-multi-spaces'?: Linter.RuleEntry<NoMultiSpaces>;
  /**
   * Disallow multiline strings
   * @see https://eslint.org/docs/latest/rules/no-multi-str
   */
  'no-multi-str'?: Linter.RuleEntry<[]>;
  /**
   * Disallow multiple empty lines
   * @see https://eslint.org/docs/latest/rules/no-multiple-empty-lines
   * @deprecated
   */
  'no-multiple-empty-lines'?: Linter.RuleEntry<NoMultipleEmptyLines>;
  /**
   * Disallow assignments to native objects or read-only global variables
   * @see https://eslint.org/docs/latest/rules/no-native-reassign
   * @deprecated
   */
  'no-native-reassign'?: Linter.RuleEntry<NoNativeReassign>;
  /**
   * Disallow negated conditions
   * @see https://eslint.org/docs/latest/rules/no-negated-condition
   */
  'no-negated-condition'?: Linter.RuleEntry<[]>;
  /**
   * Disallow negating the left operand in `in` expressions
   * @see https://eslint.org/docs/latest/rules/no-negated-in-lhs
   * @deprecated
   */
  'no-negated-in-lhs'?: Linter.RuleEntry<[]>;
  /**
   * Disallow nested ternary expressions
   * @see https://eslint.org/docs/latest/rules/no-nested-ternary
   */
  'no-nested-ternary'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `new` operators outside of assignments or comparisons
   * @see https://eslint.org/docs/latest/rules/no-new
   */
  'no-new'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `new` operators with the `Function` object
   * @see https://eslint.org/docs/latest/rules/no-new-func
   */
  'no-new-func'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `new` operators with global non-constructor functions
   * @see https://eslint.org/docs/latest/rules/no-new-native-nonconstructor
   */
  'no-new-native-nonconstructor'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `Object` constructors
   * @see https://eslint.org/docs/latest/rules/no-new-object
   * @deprecated
   */
  'no-new-object'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `new` operators with calls to `require`
   * @see https://eslint.org/docs/latest/rules/no-new-require
   * @deprecated
   */
  'no-new-require'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `new` operators with the `Symbol` object
   * @see https://eslint.org/docs/latest/rules/no-new-symbol
   * @deprecated
   */
  'no-new-symbol'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `new` operators with the `String`, `Number`, and `Boolean` objects
   * @see https://eslint.org/docs/latest/rules/no-new-wrappers
   */
  'no-new-wrappers'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `\8` and `\9` escape sequences in string literals
   * @see https://eslint.org/docs/latest/rules/no-nonoctal-decimal-escape
   */
  'no-nonoctal-decimal-escape'?: Linter.RuleEntry<[]>;
  /**
   * Disallow calling global object properties as functions
   * @see https://eslint.org/docs/latest/rules/no-obj-calls
   */
  'no-obj-calls'?: Linter.RuleEntry<[]>;
  /**
   * Disallow calls to the `Object` constructor without an argument
   * @see https://eslint.org/docs/latest/rules/no-object-constructor
   */
  'no-object-constructor'?: Linter.RuleEntry<[]>;
  /**
   * Disallow octal literals
   * @see https://eslint.org/docs/latest/rules/no-octal
   */
  'no-octal'?: Linter.RuleEntry<[]>;
  /**
   * Disallow octal escape sequences in string literals
   * @see https://eslint.org/docs/latest/rules/no-octal-escape
   */
  'no-octal-escape'?: Linter.RuleEntry<[]>;
  /**
   * Disallow reassigning function parameters
   * @see https://eslint.org/docs/latest/rules/no-param-reassign
   */
  'no-param-reassign'?: Linter.RuleEntry<NoParamReassign>;
  /**
   * Disallow string concatenation with `__dirname` and `__filename`
   * @see https://eslint.org/docs/latest/rules/no-path-concat
   * @deprecated
   */
  'no-path-concat'?: Linter.RuleEntry<[]>;
  /**
   * Disallow the unary operators `++` and `--`
   * @see https://eslint.org/docs/latest/rules/no-plusplus
   */
  'no-plusplus'?: Linter.RuleEntry<NoPlusplus>;
  /**
   * Disallow the use of `process.env`
   * @see https://eslint.org/docs/latest/rules/no-process-env
   * @deprecated
   */
  'no-process-env'?: Linter.RuleEntry<[]>;
  /**
   * Disallow the use of `process.exit()`
   * @see https://eslint.org/docs/latest/rules/no-process-exit
   * @deprecated
   */
  'no-process-exit'?: Linter.RuleEntry<[]>;
  /**
   * Disallow returning values from Promise executor functions
   * @see https://eslint.org/docs/latest/rules/no-promise-executor-return
   */
  'no-promise-executor-return'?: Linter.RuleEntry<NoPromiseExecutorReturn>;
  /**
   * Disallow the use of the `__proto__` property
   * @see https://eslint.org/docs/latest/rules/no-proto
   */
  'no-proto'?: Linter.RuleEntry<[]>;
  /**
   * Disallow calling some `Object.prototype` methods directly on objects
   * @see https://eslint.org/docs/latest/rules/no-prototype-builtins
   */
  'no-prototype-builtins'?: Linter.RuleEntry<[]>;
  /**
   * Disallow variable redeclaration
   * @see https://eslint.org/docs/latest/rules/no-redeclare
   */
  'no-redeclare'?: Linter.RuleEntry<NoRedeclare>;
  /**
   * Disallow multiple spaces in regular expressions
   * @see https://eslint.org/docs/latest/rules/no-regex-spaces
   */
  'no-regex-spaces'?: Linter.RuleEntry<[]>;
  /**
   * Disallow specified names in exports
   * @see https://eslint.org/docs/latest/rules/no-restricted-exports
   */
  'no-restricted-exports'?: Linter.RuleEntry<NoRestrictedExports>;
  /**
   * Disallow specified global variables
   * @see https://eslint.org/docs/latest/rules/no-restricted-globals
   */
  'no-restricted-globals'?: Linter.RuleEntry<NoRestrictedGlobals>;
  /**
   * Disallow specified modules when loaded by `import`
   * @see https://eslint.org/docs/latest/rules/no-restricted-imports
   */
  'no-restricted-imports'?: Linter.RuleEntry<NoRestrictedImports>;
  /**
   * Disallow specified modules when loaded by `require`
   * @see https://eslint.org/docs/latest/rules/no-restricted-modules
   * @deprecated
   */
  'no-restricted-modules'?: Linter.RuleEntry<NoRestrictedModules>;
  /**
   * Disallow certain properties on certain objects
   * @see https://eslint.org/docs/latest/rules/no-restricted-properties
   */
  'no-restricted-properties'?: Linter.RuleEntry<NoRestrictedProperties>;
  /**
   * Disallow specified syntax
   * @see https://eslint.org/docs/latest/rules/no-restricted-syntax
   */
  'no-restricted-syntax'?: Linter.RuleEntry<NoRestrictedSyntax>;
  /**
   * Disallow assignment operators in `return` statements
   * @see https://eslint.org/docs/latest/rules/no-return-assign
   */
  'no-return-assign'?: Linter.RuleEntry<NoReturnAssign>;
  /**
   * Disallow unnecessary `return await`
   * @see https://eslint.org/docs/latest/rules/no-return-await
   * @deprecated
   */
  'no-return-await'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `javascript:` URLs
   * @see https://eslint.org/docs/latest/rules/no-script-url
   */
  'no-script-url'?: Linter.RuleEntry<[]>;
  /**
   * Disallow assignments where both sides are exactly the same
   * @see https://eslint.org/docs/latest/rules/no-self-assign
   */
  'no-self-assign'?: Linter.RuleEntry<NoSelfAssign>;
  /**
   * Disallow comparisons where both sides are exactly the same
   * @see https://eslint.org/docs/latest/rules/no-self-compare
   */
  'no-self-compare'?: Linter.RuleEntry<[]>;
  /**
   * Disallow comma operators
   * @see https://eslint.org/docs/latest/rules/no-sequences
   */
  'no-sequences'?: Linter.RuleEntry<NoSequences>;
  /**
   * Disallow returning values from setters
   * @see https://eslint.org/docs/latest/rules/no-setter-return
   */
  'no-setter-return'?: Linter.RuleEntry<[]>;
  /**
   * Disallow variable declarations from shadowing variables declared in the outer scope
   * @see https://eslint.org/docs/latest/rules/no-shadow
   */
  'no-shadow'?: Linter.RuleEntry<NoShadow>;
  /**
   * Disallow identifiers from shadowing restricted names
   * @see https://eslint.org/docs/latest/rules/no-shadow-restricted-names
   */
  'no-shadow-restricted-names'?: Linter.RuleEntry<NoShadowRestrictedNames>;
  /**
   * Disallow spacing between function identifiers and their applications (deprecated)
   * @see https://eslint.org/docs/latest/rules/no-spaced-func
   * @deprecated
   */
  'no-spaced-func'?: Linter.RuleEntry<[]>;
  /**
   * Disallow sparse arrays
   * @see https://eslint.org/docs/latest/rules/no-sparse-arrays
   */
  'no-sparse-arrays'?: Linter.RuleEntry<[]>;
  /**
   * Disallow synchronous methods
   * @see https://eslint.org/docs/latest/rules/no-sync
   * @deprecated
   */
  'no-sync'?: Linter.RuleEntry<NoSync>;
  /**
   * Disallow all tabs
   * @see https://eslint.org/docs/latest/rules/no-tabs
   * @deprecated
   */
  'no-tabs'?: Linter.RuleEntry<NoTabs>;
  /**
   * Disallow template literal placeholder syntax in regular strings
   * @see https://eslint.org/docs/latest/rules/no-template-curly-in-string
   */
  'no-template-curly-in-string'?: Linter.RuleEntry<[]>;
  /**
   * Disallow ternary operators
   * @see https://eslint.org/docs/latest/rules/no-ternary
   */
  'no-ternary'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `this`/`super` before calling `super()` in constructors
   * @see https://eslint.org/docs/latest/rules/no-this-before-super
   */
  'no-this-before-super'?: Linter.RuleEntry<[]>;
  /**
   * Disallow throwing literals as exceptions
   * @see https://eslint.org/docs/latest/rules/no-throw-literal
   */
  'no-throw-literal'?: Linter.RuleEntry<[]>;
  /**
   * Disallow trailing whitespace at the end of lines
   * @see https://eslint.org/docs/latest/rules/no-trailing-spaces
   * @deprecated
   */
  'no-trailing-spaces'?: Linter.RuleEntry<NoTrailingSpaces>;
  /**
   * Disallow `let` or `var` variables that are read but never assigned
   * @see https://eslint.org/docs/latest/rules/no-unassigned-vars
   */
  'no-unassigned-vars'?: Linter.RuleEntry<[]>;
  /**
   * Disallow the use of undeclared variables unless mentioned in `/*global *\/` comments
   * @see https://eslint.org/docs/latest/rules/no-undef
   */
  'no-undef'?: Linter.RuleEntry<NoUndef>;
  /**
   * Disallow initializing variables to `undefined`
   * @see https://eslint.org/docs/latest/rules/no-undef-init
   */
  'no-undef-init'?: Linter.RuleEntry<[]>;
  /**
   * Disallow the use of `undefined` as an identifier
   * @see https://eslint.org/docs/latest/rules/no-undefined
   */
  'no-undefined'?: Linter.RuleEntry<[]>;
  /**
   * Disallow dangling underscores in identifiers
   * @see https://eslint.org/docs/latest/rules/no-underscore-dangle
   */
  'no-underscore-dangle'?: Linter.RuleEntry<NoUnderscoreDangle>;
  /**
   * Disallow confusing multiline expressions
   * @see https://eslint.org/docs/latest/rules/no-unexpected-multiline
   */
  'no-unexpected-multiline'?: Linter.RuleEntry<[]>;
  /**
   * Disallow unmodified loop conditions
   * @see https://eslint.org/docs/latest/rules/no-unmodified-loop-condition
   */
  'no-unmodified-loop-condition'?: Linter.RuleEntry<[]>;
  /**
   * Disallow ternary operators when simpler alternatives exist
   * @see https://eslint.org/docs/latest/rules/no-unneeded-ternary
   */
  'no-unneeded-ternary'?: Linter.RuleEntry<NoUnneededTernary>;
  /**
   * Disallow unreachable code after `return`, `throw`, `continue`, and `break` statements
   * @see https://eslint.org/docs/latest/rules/no-unreachable
   */
  'no-unreachable'?: Linter.RuleEntry<[]>;
  /**
   * Disallow loops with a body that allows only one iteration
   * @see https://eslint.org/docs/latest/rules/no-unreachable-loop
   */
  'no-unreachable-loop'?: Linter.RuleEntry<NoUnreachableLoop>;
  /**
   * Disallow control flow statements in `finally` blocks
   * @see https://eslint.org/docs/latest/rules/no-unsafe-finally
   */
  'no-unsafe-finally'?: Linter.RuleEntry<[]>;
  /**
   * Disallow negating the left operand of relational operators
   * @see https://eslint.org/docs/latest/rules/no-unsafe-negation
   */
  'no-unsafe-negation'?: Linter.RuleEntry<NoUnsafeNegation>;
  /**
   * Disallow use of optional chaining in contexts where the `undefined` value is not allowed
   * @see https://eslint.org/docs/latest/rules/no-unsafe-optional-chaining
   */
  'no-unsafe-optional-chaining'?: Linter.RuleEntry<NoUnsafeOptionalChaining>;
  /**
   * Disallow unused expressions
   * @see https://eslint.org/docs/latest/rules/no-unused-expressions
   */
  'no-unused-expressions'?: Linter.RuleEntry<NoUnusedExpressions>;
  /**
   * Disallow unused labels
   * @see https://eslint.org/docs/latest/rules/no-unused-labels
   */
  'no-unused-labels'?: Linter.RuleEntry<[]>;
  /**
   * Disallow unused private class members
   * @see https://eslint.org/docs/latest/rules/no-unused-private-class-members
   */
  'no-unused-private-class-members'?: Linter.RuleEntry<[]>;
  /**
   * Disallow unused variables
   * @see https://eslint.org/docs/latest/rules/no-unused-vars
   */
  'no-unused-vars'?: Linter.RuleEntry<NoUnusedVars>;
  /**
   * Disallow the use of variables before they are defined
   * @see https://eslint.org/docs/latest/rules/no-use-before-define
   */
  'no-use-before-define'?: Linter.RuleEntry<NoUseBeforeDefine>;
  /**
   * Disallow variable assignments when the value is not used
   * @see https://eslint.org/docs/latest/rules/no-useless-assignment
   */
  'no-useless-assignment'?: Linter.RuleEntry<[]>;
  /**
   * Disallow useless backreferences in regular expressions
   * @see https://eslint.org/docs/latest/rules/no-useless-backreference
   */
  'no-useless-backreference'?: Linter.RuleEntry<[]>;
  /**
   * Disallow unnecessary calls to `.call()` and `.apply()`
   * @see https://eslint.org/docs/latest/rules/no-useless-call
   */
  'no-useless-call'?: Linter.RuleEntry<[]>;
  /**
   * Disallow unnecessary `catch` clauses
   * @see https://eslint.org/docs/latest/rules/no-useless-catch
   */
  'no-useless-catch'?: Linter.RuleEntry<[]>;
  /**
   * Disallow unnecessary computed property keys in objects and classes
   * @see https://eslint.org/docs/latest/rules/no-useless-computed-key
   */
  'no-useless-computed-key'?: Linter.RuleEntry<NoUselessComputedKey>;
  /**
   * Disallow unnecessary concatenation of literals or template literals
   * @see https://eslint.org/docs/latest/rules/no-useless-concat
   */
  'no-useless-concat'?: Linter.RuleEntry<[]>;
  /**
   * Disallow unnecessary constructors
   * @see https://eslint.org/docs/latest/rules/no-useless-constructor
   */
  'no-useless-constructor'?: Linter.RuleEntry<[]>;
  /**
   * Disallow unnecessary escape characters
   * @see https://eslint.org/docs/latest/rules/no-useless-escape
   */
  'no-useless-escape'?: Linter.RuleEntry<NoUselessEscape>;
  /**
   * Disallow renaming import, export, and destructured assignments to the same name
   * @see https://eslint.org/docs/latest/rules/no-useless-rename
   */
  'no-useless-rename'?: Linter.RuleEntry<NoUselessRename>;
  /**
   * Disallow redundant return statements
   * @see https://eslint.org/docs/latest/rules/no-useless-return
   */
  'no-useless-return'?: Linter.RuleEntry<[]>;
  /**
   * Require `let` or `const` instead of `var`
   * @see https://eslint.org/docs/latest/rules/no-var
   */
  'no-var'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `void` operators
   * @see https://eslint.org/docs/latest/rules/no-void
   */
  'no-void'?: Linter.RuleEntry<NoVoid>;
  /**
   * Disallow specified warning terms in comments
   * @see https://eslint.org/docs/latest/rules/no-warning-comments
   */
  'no-warning-comments'?: Linter.RuleEntry<NoWarningComments>;
  /**
   * Disallow whitespace before properties
   * @see https://eslint.org/docs/latest/rules/no-whitespace-before-property
   * @deprecated
   */
  'no-whitespace-before-property'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `with` statements
   * @see https://eslint.org/docs/latest/rules/no-with
   */
  'no-with'?: Linter.RuleEntry<[]>;
  /**
   * require `return` statements after callbacks
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/callback-return.md
   */
  'node/callback-return'?: Linter.RuleEntry<NodeCallbackReturn>;
  /**
   * enforce either `module.exports` or `exports`
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/exports-style.md
   */
  'node/exports-style'?: Linter.RuleEntry<NodeExportsStyle>;
  /**
   * enforce the style of file extensions in `import` declarations
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/file-extension-in-import.md
   */
  'node/file-extension-in-import'?: Linter.RuleEntry<NodeFileExtensionInImport>;
  /**
   * require `require()` calls to be placed at top-level module scope
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/global-require.md
   */
  'node/global-require'?: Linter.RuleEntry<[]>;
  /**
   * require error handling in callbacks
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/handle-callback-err.md
   */
  'node/handle-callback-err'?: Linter.RuleEntry<NodeHandleCallbackErr>;
  /**
   * require correct usage of hashbang
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/hashbang.md
   */
  'node/hashbang'?: Linter.RuleEntry<NodeHashbang>;
  /**
   * enforce Node.js-style error-first callback pattern is followed
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-callback-literal.md
   */
  'node/no-callback-literal'?: Linter.RuleEntry<[]>;
  /**
   * disallow deprecated APIs
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-deprecated-api.md
   */
  'node/no-deprecated-api'?: Linter.RuleEntry<NodeNoDeprecatedApi>;
  /**
   * disallow the assignment to `exports`
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-exports-assign.md
   */
  'node/no-exports-assign'?: Linter.RuleEntry<[]>;
  /**
   * disallow `import` declarations which import extraneous modules
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-extraneous-import.md
   */
  'node/no-extraneous-import'?: Linter.RuleEntry<NodeNoExtraneousImport>;
  /**
   * disallow `require()` expressions which import extraneous modules
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-extraneous-require.md
   */
  'node/no-extraneous-require'?: Linter.RuleEntry<NodeNoExtraneousRequire>;
  /**
   * disallow third-party modules which are hiding core modules
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-hide-core-modules.md
   * @deprecated
   */
  'node/no-hide-core-modules'?: Linter.RuleEntry<NodeNoHideCoreModules>;
  /**
   * disallow `import` declarations which import missing modules
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-missing-import.md
   */
  'node/no-missing-import'?: Linter.RuleEntry<NodeNoMissingImport>;
  /**
   * disallow `require()` expressions which import missing modules
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-missing-require.md
   */
  'node/no-missing-require'?: Linter.RuleEntry<NodeNoMissingRequire>;
  /**
   * disallow `require` calls to be mixed with regular variable declarations
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-mixed-requires.md
   */
  'node/no-mixed-requires'?: Linter.RuleEntry<NodeNoMixedRequires>;
  /**
   * disallow `new` operators with calls to `require`
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-new-require.md
   */
  'node/no-new-require'?: Linter.RuleEntry<[]>;
  /**
   * disallow string concatenation with `__dirname` and `__filename`
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-path-concat.md
   */
  'node/no-path-concat'?: Linter.RuleEntry<[]>;
  /**
   * disallow the use of `process.env`
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-process-env.md
   */
  'node/no-process-env'?: Linter.RuleEntry<NodeNoProcessEnv>;
  /**
   * disallow the use of `process.exit()`
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-process-exit.md
   */
  'node/no-process-exit'?: Linter.RuleEntry<[]>;
  /**
   * disallow specified modules when loaded by `import` declarations
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-restricted-import.md
   */
  'node/no-restricted-import'?: Linter.RuleEntry<NodeNoRestrictedImport>;
  /**
   * disallow specified modules when loaded by `require`
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-restricted-require.md
   */
  'node/no-restricted-require'?: Linter.RuleEntry<NodeNoRestrictedRequire>;
  /**
   * disallow synchronous methods
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-sync.md
   */
  'node/no-sync'?: Linter.RuleEntry<NodeNoSync>;
  /**
   * disallow top-level `await` in published modules
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-top-level-await.md
   */
  'node/no-top-level-await'?: Linter.RuleEntry<NodeNoTopLevelAwait>;
  /**
   * disallow `bin` files that npm ignores
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unpublished-bin.md
   */
  'node/no-unpublished-bin'?: Linter.RuleEntry<NodeNoUnpublishedBin>;
  /**
   * disallow `import` declarations which import private modules
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unpublished-import.md
   */
  'node/no-unpublished-import'?: Linter.RuleEntry<NodeNoUnpublishedImport>;
  /**
   * disallow `require()` expressions which import private modules
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unpublished-require.md
   */
  'node/no-unpublished-require'?: Linter.RuleEntry<NodeNoUnpublishedRequire>;
  /**
   * disallow unsupported ECMAScript built-ins on the specified version
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unsupported-features/es-builtins.md
   */
  'node/no-unsupported-features/es-builtins'?: Linter.RuleEntry<NodeNoUnsupportedFeaturesEsBuiltins>;
  /**
   * disallow unsupported ECMAScript syntax on the specified version
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unsupported-features/es-syntax.md
   */
  'node/no-unsupported-features/es-syntax'?: Linter.RuleEntry<NodeNoUnsupportedFeaturesEsSyntax>;
  /**
   * disallow unsupported Node.js built-in APIs on the specified version
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unsupported-features/node-builtins.md
   */
  'node/no-unsupported-features/node-builtins'?: Linter.RuleEntry<NodeNoUnsupportedFeaturesNodeBuiltins>;
  /**
   * enforce either `Buffer` or `require("buffer").Buffer`
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/buffer.md
   */
  'node/prefer-global/buffer'?: Linter.RuleEntry<NodePreferGlobalBuffer>;
  /**
   * enforce either `console` or `require("console")`
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/console.md
   */
  'node/prefer-global/console'?: Linter.RuleEntry<NodePreferGlobalConsole>;
  /**
   * enforce either `process` or `require("process")`
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/process.md
   */
  'node/prefer-global/process'?: Linter.RuleEntry<NodePreferGlobalProcess>;
  /**
   * enforce either `TextDecoder` or `require("util").TextDecoder`
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/text-decoder.md
   */
  'node/prefer-global/text-decoder'?: Linter.RuleEntry<NodePreferGlobalTextDecoder>;
  /**
   * enforce either `TextEncoder` or `require("util").TextEncoder`
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/text-encoder.md
   */
  'node/prefer-global/text-encoder'?: Linter.RuleEntry<NodePreferGlobalTextEncoder>;
  /**
   * enforce either `URL` or `require("url").URL`
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/url.md
   */
  'node/prefer-global/url'?: Linter.RuleEntry<NodePreferGlobalUrl>;
  /**
   * enforce either `URLSearchParams` or `require("url").URLSearchParams`
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/url-search-params.md
   */
  'node/prefer-global/url-search-params'?: Linter.RuleEntry<NodePreferGlobalUrlSearchParams>;
  /**
   * enforce using the `node:` protocol when importing Node.js builtin modules.
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-node-protocol.md
   */
  'node/prefer-node-protocol'?: Linter.RuleEntry<NodePreferNodeProtocol>;
  /**
   * enforce `require("dns").promises`
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-promises/dns.md
   */
  'node/prefer-promises/dns'?: Linter.RuleEntry<[]>;
  /**
   * enforce `require("fs").promises`
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-promises/fs.md
   */
  'node/prefer-promises/fs'?: Linter.RuleEntry<[]>;
  /**
   * require that `process.exit()` expressions use the same code path as `throw`
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/process-exit-as-throw.md
   */
  'node/process-exit-as-throw'?: Linter.RuleEntry<[]>;
  /**
   * require correct usage of hashbang
   * @see https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/hashbang.md
   * @deprecated
   */
  'node/shebang'?: Linter.RuleEntry<NodeShebang>;
  /**
   * Enforce the location of single-line statements
   * @see https://eslint.org/docs/latest/rules/nonblock-statement-body-position
   * @deprecated
   */
  'nonblock-statement-body-position'?: Linter.RuleEntry<NonblockStatementBodyPosition>;
  /**
   * Enforce consistent line breaks after opening and before closing braces
   * @see https://eslint.org/docs/latest/rules/object-curly-newline
   * @deprecated
   */
  'object-curly-newline'?: Linter.RuleEntry<ObjectCurlyNewline>;
  /**
   * Enforce consistent spacing inside braces
   * @see https://eslint.org/docs/latest/rules/object-curly-spacing
   * @deprecated
   */
  'object-curly-spacing'?: Linter.RuleEntry<ObjectCurlySpacing>;
  /**
   * Enforce placing object properties on separate lines
   * @see https://eslint.org/docs/latest/rules/object-property-newline
   * @deprecated
   */
  'object-property-newline'?: Linter.RuleEntry<ObjectPropertyNewline>;
  /**
   * Require or disallow method and property shorthand syntax for object literals
   * @see https://eslint.org/docs/latest/rules/object-shorthand
   */
  'object-shorthand'?: Linter.RuleEntry<ObjectShorthand>;
  /**
   * Enforce variables to be declared either together or separately in functions
   * @see https://eslint.org/docs/latest/rules/one-var
   */
  'one-var'?: Linter.RuleEntry<OneVar>;
  /**
   * Require or disallow newlines around variable declarations
   * @see https://eslint.org/docs/latest/rules/one-var-declaration-per-line
   * @deprecated
   */
  'one-var-declaration-per-line'?: Linter.RuleEntry<OneVarDeclarationPerLine>;
  /**
   * Require or disallow assignment operator shorthand where possible
   * @see https://eslint.org/docs/latest/rules/operator-assignment
   */
  'operator-assignment'?: Linter.RuleEntry<OperatorAssignment>;
  /**
   * Enforce consistent linebreak style for operators
   * @see https://eslint.org/docs/latest/rules/operator-linebreak
   * @deprecated
   */
  'operator-linebreak'?: Linter.RuleEntry<OperatorLinebreak>;
  /**
   * Require or disallow padding within blocks
   * @see https://eslint.org/docs/latest/rules/padded-blocks
   * @deprecated
   */
  'padded-blocks'?: Linter.RuleEntry<PaddedBlocks>;
  /**
   * Require or disallow padding lines between statements
   * @see https://eslint.org/docs/latest/rules/padding-line-between-statements
   * @deprecated
   */
  'padding-line-between-statements'?: Linter.RuleEntry<PaddingLineBetweenStatements>;
  /**
   * Enforce sorted arrays before include method.
   * @see https://perfectionist.dev/rules/sort-array-includes
   */
  'perfectionist/sort-array-includes'?: Linter.RuleEntry<PerfectionistSortArrayIncludes>;
  /**
   * Enforce sorted classes.
   * @see https://perfectionist.dev/rules/sort-classes
   */
  'perfectionist/sort-classes'?: Linter.RuleEntry<PerfectionistSortClasses>;
  /**
   * Enforce sorted decorators.
   * @see https://perfectionist.dev/rules/sort-decorators
   */
  'perfectionist/sort-decorators'?: Linter.RuleEntry<PerfectionistSortDecorators>;
  /**
   * Enforce sorted TypeScript enums.
   * @see https://perfectionist.dev/rules/sort-enums
   */
  'perfectionist/sort-enums'?: Linter.RuleEntry<PerfectionistSortEnums>;
  /**
   * Enforce sorted exports.
   * @see https://perfectionist.dev/rules/sort-exports
   */
  'perfectionist/sort-exports'?: Linter.RuleEntry<PerfectionistSortExports>;
  /**
   * Enforce sorted heritage clauses.
   * @see https://perfectionist.dev/rules/sort-heritage-clauses
   */
  'perfectionist/sort-heritage-clauses'?: Linter.RuleEntry<PerfectionistSortHeritageClauses>;
  /**
   * Enforce sorted imports.
   * @see https://perfectionist.dev/rules/sort-imports
   */
  'perfectionist/sort-imports'?: Linter.RuleEntry<PerfectionistSortImports>;
  /**
   * Enforce sorted interface properties.
   * @see https://perfectionist.dev/rules/sort-interfaces
   */
  'perfectionist/sort-interfaces'?: Linter.RuleEntry<PerfectionistSortInterfaces>;
  /**
   * Enforce sorted intersection types.
   * @see https://perfectionist.dev/rules/sort-intersection-types
   */
  'perfectionist/sort-intersection-types'?: Linter.RuleEntry<PerfectionistSortIntersectionTypes>;
  /**
   * Enforce sorted JSX props.
   * @see https://perfectionist.dev/rules/sort-jsx-props
   */
  'perfectionist/sort-jsx-props'?: Linter.RuleEntry<PerfectionistSortJsxProps>;
  /**
   * Enforce sorted Map elements.
   * @see https://perfectionist.dev/rules/sort-maps
   */
  'perfectionist/sort-maps'?: Linter.RuleEntry<PerfectionistSortMaps>;
  /**
   * Enforce sorted modules.
   * @see https://perfectionist.dev/rules/sort-modules
   */
  'perfectionist/sort-modules'?: Linter.RuleEntry<PerfectionistSortModules>;
  /**
   * Enforce sorted named exports.
   * @see https://perfectionist.dev/rules/sort-named-exports
   */
  'perfectionist/sort-named-exports'?: Linter.RuleEntry<PerfectionistSortNamedExports>;
  /**
   * Enforce sorted named imports.
   * @see https://perfectionist.dev/rules/sort-named-imports
   */
  'perfectionist/sort-named-imports'?: Linter.RuleEntry<PerfectionistSortNamedImports>;
  /**
   * Enforce sorted object types.
   * @see https://perfectionist.dev/rules/sort-object-types
   */
  'perfectionist/sort-object-types'?: Linter.RuleEntry<PerfectionistSortObjectTypes>;
  /**
   * Enforce sorted objects.
   * @see https://perfectionist.dev/rules/sort-objects
   */
  'perfectionist/sort-objects'?: Linter.RuleEntry<PerfectionistSortObjects>;
  /**
   * Enforce sorted sets.
   * @see https://perfectionist.dev/rules/sort-sets
   */
  'perfectionist/sort-sets'?: Linter.RuleEntry<PerfectionistSortSets>;
  /**
   * Enforce sorted switch cases.
   * @see https://perfectionist.dev/rules/sort-switch-case
   */
  'perfectionist/sort-switch-case'?: Linter.RuleEntry<PerfectionistSortSwitchCase>;
  /**
   * Enforce sorted union types.
   * @see https://perfectionist.dev/rules/sort-union-types
   */
  'perfectionist/sort-union-types'?: Linter.RuleEntry<PerfectionistSortUnionTypes>;
  /**
   * Enforce sorted variable declarations.
   * @see https://perfectionist.dev/rules/sort-variable-declarations
   */
  'perfectionist/sort-variable-declarations'?: Linter.RuleEntry<PerfectionistSortVariableDeclarations>;
  /**
   * Enforce using "catalog:" in `package.json`
   * @see https://github.com/antfu/pnpm-workspace-utils/tree/main/packages/eslint-plugin-pnpm/src/rules/json/json-enforce-catalog.test.ts
   */
  'pnpm/json-enforce-catalog'?: Linter.RuleEntry<PnpmJsonEnforceCatalog>;
  /**
   * Prefer having pnpm settings in `pnpm-workspace.yaml` instead of `package.json`. This requires pnpm v10.6+, see https://github.com/orgs/pnpm/discussions/9037.
   * @see https://github.com/antfu/pnpm-workspace-utils/tree/main/packages/eslint-plugin-pnpm/src/rules/json/json-prefer-workspace-settings.test.ts
   */
  'pnpm/json-prefer-workspace-settings'?: Linter.RuleEntry<PnpmJsonPreferWorkspaceSettings>;
  /**
   * Enforce using valid catalog in `package.json`
   * @see https://github.com/antfu/pnpm-workspace-utils/tree/main/packages/eslint-plugin-pnpm/src/rules/json/json-valid-catalog.test.ts
   */
  'pnpm/json-valid-catalog'?: Linter.RuleEntry<PnpmJsonValidCatalog>;
  /**
   * Enforce settings in `pnpm-workspace.yaml`
   * @see https://github.com/antfu/pnpm-workspace-utils/tree/main/packages/eslint-plugin-pnpm/src/rules/yaml/yaml-enforce-settings.test.ts
   */
  'pnpm/yaml-enforce-settings'?: Linter.RuleEntry<PnpmYamlEnforceSettings>;
  /**
   * Disallow duplicate catalog items in `pnpm-workspace.yaml`
   * @see https://github.com/antfu/pnpm-workspace-utils/tree/main/packages/eslint-plugin-pnpm/src/rules/yaml/yaml-no-duplicate-catalog-item.test.ts
   */
  'pnpm/yaml-no-duplicate-catalog-item'?: Linter.RuleEntry<PnpmYamlNoDuplicateCatalogItem>;
  /**
   * Disallow unused catalogs in `pnpm-workspace.yaml`
   * @see https://github.com/antfu/pnpm-workspace-utils/tree/main/packages/eslint-plugin-pnpm/src/rules/yaml/yaml-no-unused-catalog-item.test.ts
   */
  'pnpm/yaml-no-unused-catalog-item'?: Linter.RuleEntry<[]>;
  /**
   * Ensure all package patterns in `pnpm-workspace.yaml` match at least one directory
   * @see https://github.com/antfu/pnpm-workspace-utils/tree/main/packages/eslint-plugin-pnpm/src/rules/yaml/yaml-valid-packages.test.ts
   */
  'pnpm/yaml-valid-packages'?: Linter.RuleEntry<[]>;
  /**
   * Require using arrow functions for callbacks
   * @see https://eslint.org/docs/latest/rules/prefer-arrow-callback
   */
  'prefer-arrow-callback'?: Linter.RuleEntry<PreferArrowCallback>;
  /**
   * Require `const` declarations for variables that are never reassigned after declared
   * @see https://eslint.org/docs/latest/rules/prefer-const
   */
  'prefer-const'?: Linter.RuleEntry<PreferConst>;
  /**
   * Require destructuring from arrays and/or objects
   * @see https://eslint.org/docs/latest/rules/prefer-destructuring
   */
  'prefer-destructuring'?: Linter.RuleEntry<PreferDestructuring>;
  /**
   * Disallow the use of `Math.pow` in favor of the `**` operator
   * @see https://eslint.org/docs/latest/rules/prefer-exponentiation-operator
   */
  'prefer-exponentiation-operator'?: Linter.RuleEntry<[]>;
  /**
   * Enforce using named capture group in regular expression
   * @see https://eslint.org/docs/latest/rules/prefer-named-capture-group
   */
  'prefer-named-capture-group'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `parseInt()` and `Number.parseInt()` in favor of binary, octal, and hexadecimal literals
   * @see https://eslint.org/docs/latest/rules/prefer-numeric-literals
   */
  'prefer-numeric-literals'?: Linter.RuleEntry<[]>;
  /**
   * Disallow use of `Object.prototype.hasOwnProperty.call()` and prefer use of `Object.hasOwn()`
   * @see https://eslint.org/docs/latest/rules/prefer-object-has-own
   */
  'prefer-object-has-own'?: Linter.RuleEntry<[]>;
  /**
   * Disallow using `Object.assign` with an object literal as the first argument and prefer the use of object spread instead
   * @see https://eslint.org/docs/latest/rules/prefer-object-spread
   */
  'prefer-object-spread'?: Linter.RuleEntry<[]>;
  /**
   * Require using Error objects as Promise rejection reasons
   * @see https://eslint.org/docs/latest/rules/prefer-promise-reject-errors
   */
  'prefer-promise-reject-errors'?: Linter.RuleEntry<PreferPromiseRejectErrors>;
  /**
   * Require `Reflect` methods where applicable
   * @see https://eslint.org/docs/latest/rules/prefer-reflect
   * @deprecated
   */
  'prefer-reflect'?: Linter.RuleEntry<PreferReflect>;
  /**
   * Disallow use of the `RegExp` constructor in favor of regular expression literals
   * @see https://eslint.org/docs/latest/rules/prefer-regex-literals
   */
  'prefer-regex-literals'?: Linter.RuleEntry<PreferRegexLiterals>;
  /**
   * Require rest parameters instead of `arguments`
   * @see https://eslint.org/docs/latest/rules/prefer-rest-params
   */
  'prefer-rest-params'?: Linter.RuleEntry<[]>;
  /**
   * Require spread operators instead of `.apply()`
   * @see https://eslint.org/docs/latest/rules/prefer-spread
   */
  'prefer-spread'?: Linter.RuleEntry<[]>;
  /**
   * Require template literals instead of string concatenation
   * @see https://eslint.org/docs/latest/rules/prefer-template
   */
  'prefer-template'?: Linter.RuleEntry<[]>;
  /**
   * Disallow losing originally caught error when re-throwing custom errors
   * @see https://eslint.org/docs/latest/rules/preserve-caught-error
   */
  'preserve-caught-error'?: Linter.RuleEntry<PreserveCaughtError>;
  /**
   * Require quotes around object literal property names
   * @see https://eslint.org/docs/latest/rules/quote-props
   * @deprecated
   */
  'quote-props'?: Linter.RuleEntry<QuoteProps>;
  /**
   * Enforce the consistent use of either backticks, double, or single quotes
   * @see https://eslint.org/docs/latest/rules/quotes
   * @deprecated
   */
  'quotes'?: Linter.RuleEntry<Quotes>;
  /**
   * Enforce the consistent use of the radix argument when using `parseInt()`
   * @see https://eslint.org/docs/latest/rules/radix
   */
  'radix'?: Linter.RuleEntry<Radix>;
  /**
   * Disallow `dangerouslySetInnerHTML`.
   * @see https://eslint-react.xyz/docs/rules/dom-no-dangerously-set-innerhtml
   */
  'react-dom/no-dangerously-set-innerhtml'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `dangerouslySetInnerHTML` and `children` at the same time.
   * @see https://eslint-react.xyz/docs/rules/dom-no-dangerously-set-innerhtml-with-children
   */
  'react-dom/no-dangerously-set-innerhtml-with-children'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `findDOMNode`.
   * @see https://eslint-react.xyz/docs/rules/dom-no-find-dom-node
   */
  'react-dom/no-find-dom-node'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `flushSync`.
   * @see https://eslint-react.xyz/docs/rules/dom-no-flush-sync
   */
  'react-dom/no-flush-sync'?: Linter.RuleEntry<[]>;
  /**
   * Replaces usages of `ReactDom.hydrate()` with `hydrateRoot()`.
   * @see https://eslint-react.xyz/docs/rules/dom-no-hydrate
   */
  'react-dom/no-hydrate'?: Linter.RuleEntry<[]>;
  /**
   * Enforces explicit `type` attribute for `button` elements.
   * @see https://eslint-react.xyz/docs/rules/dom-no-missing-button-type
   */
  'react-dom/no-missing-button-type'?: Linter.RuleEntry<[]>;
  /**
   * Enforces explicit `sandbox` prop for `iframe` elements.
   * @see https://eslint-react.xyz/docs/rules/dom-no-missing-iframe-sandbox
   */
  'react-dom/no-missing-iframe-sandbox'?: Linter.RuleEntry<[]>;
  /**
   * Enforces the absence of a `namespace` in React elements.
   * @see https://eslint-react.xyz/docs/rules/dom-no-namespace
   */
  'react-dom/no-namespace'?: Linter.RuleEntry<[]>;
  /**
   * Replaces usages of `ReactDom.render()` with `createRoot(node).render()`.
   * @see https://eslint-react.xyz/docs/rules/dom-no-render
   */
  'react-dom/no-render'?: Linter.RuleEntry<[]>;
  /**
   * Disallow the return value of `ReactDOM.render`.
   * @see https://eslint-react.xyz/docs/rules/dom-no-render-return-value
   */
  'react-dom/no-render-return-value'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `javascript:` URLs as attribute values.
   * @see https://eslint-react.xyz/docs/rules/dom-no-script-url
   */
  'react-dom/no-script-url'?: Linter.RuleEntry<[]>;
  /**
   * Disallows the use of string style prop.
   * @see https://eslint-react.xyz/docs/rules/dom-no-string-style-prop
   */
  'react-dom/no-string-style-prop'?: Linter.RuleEntry<[]>;
  /**
   * Disallow unknown `DOM` property.
   * @see https://eslint-react.xyz/docs/rules/dom-no-unknown-property
   */
  'react-dom/no-unknown-property'?: Linter.RuleEntry<ReactDomNoUnknownProperty>;
  /**
   * Enforces `sandbox` attribute for `iframe` elements is not set to unsafe combinations.
   * @see https://eslint-react.xyz/docs/rules/dom-no-unsafe-iframe-sandbox
   */
  'react-dom/no-unsafe-iframe-sandbox'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `target="_blank"` without `rel="noreferrer noopener"`.
   * @see https://eslint-react.xyz/docs/rules/dom-no-unsafe-target-blank
   */
  'react-dom/no-unsafe-target-blank'?: Linter.RuleEntry<[]>;
  /**
   * Replaces usages of `useFormState` with `useActionState`.
   * @see https://eslint-react.xyz/docs/rules/dom-no-use-form-state
   */
  'react-dom/no-use-form-state'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `children` in void DOM elements.
   * @see https://eslint-react.xyz/docs/rules/dom-no-void-elements-with-children
   */
  'react-dom/no-void-elements-with-children'?: Linter.RuleEntry<[]>;
  /**
   * Enforces React Dom is imported via a namespace import.
   * @see https://eslint-react.xyz/docs/rules/dom-prefer-namespace-import
   */
  'react-dom/prefer-namespace-import'?: Linter.RuleEntry<[]>;
  /**
   * Disallow direct calls to the `set` function of `useState` in `useEffect`.
   * @see https://eslint-react.xyz/docs/rules/hooks-extra-no-direct-set-state-in-use-effect
   */
  'react-hooks-extra/no-direct-set-state-in-use-effect'?: Linter.RuleEntry<[]>;
  /**
   * Verifies that automatic effect dependencies are compiled if opted-in
   */
  'react-hooks/automatic-effect-dependencies'?: Linter.RuleEntry<ReactHooksAutomaticEffectDependencies>;
  /**
   * Validates against calling capitalized functions/methods instead of using JSX
   */
  'react-hooks/capitalized-calls'?: Linter.RuleEntry<ReactHooksCapitalizedCalls>;
  /**
   * Validates against higher order functions defining nested components or hooks. Components and hooks should be defined at the module level
   */
  'react-hooks/component-hook-factories'?: Linter.RuleEntry<ReactHooksComponentHookFactories>;
  /**
   * Validates the compiler configuration options
   */
  'react-hooks/config'?: Linter.RuleEntry<ReactHooksConfig>;
  /**
   * Validates usage of error boundaries instead of try/catch for errors in child components
   */
  'react-hooks/error-boundaries'?: Linter.RuleEntry<ReactHooksErrorBoundaries>;
  /**
   * verifies the list of dependencies for Hooks like useEffect and similar
   * @see https://github.com/facebook/react/issues/14920
   */
  'react-hooks/exhaustive-deps'?: Linter.RuleEntry<ReactHooksExhaustiveDeps>;
  /**
   * Validates usage of fbt
   */
  'react-hooks/fbt'?: Linter.RuleEntry<ReactHooksFbt>;
  /**
   * Validates usage of `fire`
   */
  'react-hooks/fire'?: Linter.RuleEntry<ReactHooksFire>;
  /**
   * Validates configuration of [gating mode](https://react.dev/reference/react-compiler/gating)
   */
  'react-hooks/gating'?: Linter.RuleEntry<ReactHooksGating>;
  /**
   * Validates against assignment/mutation of globals during render, part of ensuring that [side effects must render outside of render](https://react.dev/reference/rules/components-and-hooks-must-be-pure#side-effects-must-run-outside-of-render)
   */
  'react-hooks/globals'?: Linter.RuleEntry<ReactHooksGlobals>;
  /**
   * Validates the rules of hooks
   */
  'react-hooks/hooks'?: Linter.RuleEntry<ReactHooksHooks>;
  /**
   * Validates against mutating props, state, and other values that [are immutable](https://react.dev/reference/rules/components-and-hooks-must-be-pure#props-and-state-are-immutable)
   */
  'react-hooks/immutability'?: Linter.RuleEntry<ReactHooksImmutability>;
  /**
   * Validates against usage of libraries which are incompatible with memoization (manual or automatic)
   */
  'react-hooks/incompatible-library'?: Linter.RuleEntry<ReactHooksIncompatibleLibrary>;
  /**
   * Internal invariants
   */
  'react-hooks/invariant'?: Linter.RuleEntry<ReactHooksInvariant>;
  /**
   * Validates that effect dependencies are memoized
   */
  'react-hooks/memoized-effect-dependencies'?: Linter.RuleEntry<ReactHooksMemoizedEffectDependencies>;
  /**
   * Validates against deriving values from state in an effect
   */
  'react-hooks/no-deriving-state-in-effects'?: Linter.RuleEntry<ReactHooksNoDerivingStateInEffects>;
  /**
   * Validates that existing manual memoized is preserved by the compiler. React Compiler will only compile components and hooks if its inference [matches or exceeds the existing manual memoization](https://react.dev/learn/react-compiler/introduction#what-should-i-do-about-usememo-usecallback-and-reactmemo)
   */
  'react-hooks/preserve-manual-memoization'?: Linter.RuleEntry<ReactHooksPreserveManualMemoization>;
  /**
   * Validates that [components/hooks are pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure) by checking that they do not call known-impure functions
   */
  'react-hooks/purity'?: Linter.RuleEntry<ReactHooksPurity>;
  /**
   * Validates correct usage of refs, not reading/writing during render. See the "pitfalls" section in [`useRef()` usage](https://react.dev/reference/react/useRef#usage)
   */
  'react-hooks/refs'?: Linter.RuleEntry<ReactHooksRefs>;
  /**
   * Validates against suppression of other rules
   */
  'react-hooks/rule-suppression'?: Linter.RuleEntry<ReactHooksRuleSuppression>;
  /**
   * enforces the Rules of Hooks
   * @see https://react.dev/reference/rules/rules-of-hooks
   */
  'react-hooks/rules-of-hooks'?: Linter.RuleEntry<ReactHooksRulesOfHooks>;
  /**
   * Validates against calling setState synchronously in an effect, which can lead to re-renders that degrade performance
   */
  'react-hooks/set-state-in-effect'?: Linter.RuleEntry<ReactHooksSetStateInEffect>;
  /**
   * Validates against setting state during render, which can trigger additional renders and potential infinite render loops
   */
  'react-hooks/set-state-in-render'?: Linter.RuleEntry<ReactHooksSetStateInRender>;
  /**
   * Validates that components are static, not recreated every render. Components that are recreated dynamically can reset state and trigger excessive re-rendering
   */
  'react-hooks/static-components'?: Linter.RuleEntry<ReactHooksStaticComponents>;
  /**
   * Validates against invalid syntax
   */
  'react-hooks/syntax'?: Linter.RuleEntry<ReactHooksSyntax>;
  /**
   * Unimplemented features
   */
  'react-hooks/todo'?: Linter.RuleEntry<ReactHooksTodo>;
  /**
   * Validates against syntax that we do not plan to support in React Compiler
   */
  'react-hooks/unsupported-syntax'?: Linter.RuleEntry<ReactHooksUnsupportedSyntax>;
  /**
   * Validates usage of the useMemo() hook against common mistakes. See [`useMemo()` docs](https://react.dev/reference/react/useMemo) for more information.
   */
  'react-hooks/use-memo'?: Linter.RuleEntry<ReactHooksUseMemo>;
  /**
   * Validates that useMemos always return a value and that the result of the useMemo is used by the component/hook. See [`useMemo()` docs](https://react.dev/reference/react/useMemo) for more information.
   */
  'react-hooks/void-use-memo'?: Linter.RuleEntry<ReactHooksVoidUseMemo>;
  /**
   * Enforces naming conventions for components.
   * @see https://eslint-react.xyz/docs/rules/naming-convention-component-name
   */
  'react-naming-convention/component-name'?: Linter.RuleEntry<ReactNamingConventionComponentName>;
  /**
   * Enforces context name to be a valid component name with the suffix `Context`.
   * @see https://eslint-react.xyz/docs/rules/naming-convention-context-name
   */
  'react-naming-convention/context-name'?: Linter.RuleEntry<[]>;
  /**
   * Enforces consistent file naming conventions.
   * @see https://eslint-react.xyz/docs/rules/naming-convention-filename
   */
  'react-naming-convention/filename'?: Linter.RuleEntry<ReactNamingConventionFilename>;
  /**
   * Enforces consistent file naming conventions.
   * @see https://eslint-react.xyz/docs/rules/naming-convention-filename-extension
   */
  'react-naming-convention/filename-extension'?: Linter.RuleEntry<ReactNamingConventionFilenameExtension>;
  /**
   * Enforces destructuring and symmetric naming of `useState` hook value and setter.
   * @see https://eslint-react.xyz/docs/rules/naming-convention-use-state
   */
  'react-naming-convention/use-state'?: Linter.RuleEntry<[]>;
  'react-refresh/only-export-components'?: Linter.RuleEntry<ReactRefreshOnlyExportComponents>;
  /**
   * Prevents leaked `addEventListener` in a component or custom Hook.
   * @see https://eslint-react.xyz/docs/rules/web-api-no-leaked-event-listener
   */
  'react-web-api/no-leaked-event-listener'?: Linter.RuleEntry<[]>;
  /**
   * Prevents leaked `setInterval` in a component or custom Hook.
   * @see https://eslint-react.xyz/docs/rules/web-api-no-leaked-interval
   */
  'react-web-api/no-leaked-interval'?: Linter.RuleEntry<[]>;
  /**
   * Prevents leaked `ResizeObserver` in a component or custom Hook.
   * @see https://eslint-react.xyz/docs/rules/web-api-no-leaked-resize-observer
   */
  'react-web-api/no-leaked-resize-observer'?: Linter.RuleEntry<[]>;
  /**
   * Prevents leaked `setTimeout` in a component or custom Hook.
   * @see https://eslint-react.xyz/docs/rules/web-api-no-leaked-timeout
   */
  'react-web-api/no-leaked-timeout'?: Linter.RuleEntry<[]>;
  /**
   * Prevents dollar signs from being inserted as text nodes before expressions.
   * @see https://eslint-react.xyz/docs/rules/jsx-dollar
   */
  'react/jsx-dollar'?: Linter.RuleEntry<[]>;
  /**
   * Enforces that the 'key' prop is placed before the spread prop in JSX elements.
   * @see https://eslint-react.xyz/docs/rules/jsx-key-before-spread
   */
  'react/jsx-key-before-spread'?: Linter.RuleEntry<[]>;
  /**
   * Prevents comments from being inserted as text nodes.
   * @see https://eslint-react.xyz/docs/rules/jsx-no-comment-textnodes
   */
  'react/jsx-no-comment-textnodes'?: Linter.RuleEntry<[]>;
  /**
   * Disallow duplicate props in JSX elements.
   * @see https://eslint-react.xyz/docs/rules/jsx-no-duplicate-props
   */
  'react/jsx-no-duplicate-props'?: Linter.RuleEntry<[]>;
  /**
   * Disallows 'IIFE' in JSX elements.
   * @see https://eslint-react.xyz/docs/rules/jsx-no-iife
   */
  'react/jsx-no-iife'?: Linter.RuleEntry<[]>;
  /**
   * Disallow undefined variables in JSX.
   * @see https://eslint-react.xyz/docs/rules/jsx-no-undef
   */
  'react/jsx-no-undef'?: Linter.RuleEntry<[]>;
  /**
   * Enforces shorthand syntax for boolean attributes.
   * @see https://eslint-react.xyz/docs/rules/jsx-shorthand-boolean
   */
  'react/jsx-shorthand-boolean'?: Linter.RuleEntry<ReactJsxShorthandBoolean>;
  /**
   * Enforces shorthand syntax for fragments.
   * @see https://eslint-react.xyz/docs/rules/jsx-shorthand-fragment
   */
  'react/jsx-shorthand-fragment'?: Linter.RuleEntry<ReactJsxShorthandFragment>;
  /**
   * Marks React variables as used when JSX is used.
   * @see https://eslint-react.xyz/docs/rules/jsx-uses-react
   */
  'react/jsx-uses-react'?: Linter.RuleEntry<[]>;
  /**
   * Marks variables used in JSX elements as used.
   * @see https://eslint-react.xyz/docs/rules/jsx-uses-vars
   */
  'react/jsx-uses-vars'?: Linter.RuleEntry<[]>;
  /**
   * Disallow accessing `this.state` inside `setState` calls.
   * @see https://eslint-react.xyz/docs/rules/no-access-state-in-setstate
   */
  'react/no-access-state-in-setstate'?: Linter.RuleEntry<[]>;
  /**
   * Disallow an item's index in the array as its key.
   * @see https://eslint-react.xyz/docs/rules/no-array-index-key
   */
  'react/no-array-index-key'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `Children.count`.
   * @see https://eslint-react.xyz/docs/rules/no-children-count
   */
  'react/no-children-count'?: Linter.RuleEntry<[]>;
  /**
   * Disallow 'Children.forEach'.
   * @see https://eslint-react.xyz/docs/rules/no-children-for-each
   */
  'react/no-children-for-each'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `Children.map`.
   * @see https://eslint-react.xyz/docs/rules/no-children-map
   */
  'react/no-children-map'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `Children.only`.
   * @see https://eslint-react.xyz/docs/rules/no-children-only
   */
  'react/no-children-only'?: Linter.RuleEntry<[]>;
  /**
   * Disallow passing `children` as a prop.
   * @see https://eslint-react.xyz/docs/rules/no-children-prop
   */
  'react/no-children-prop'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `Children.toArray`.
   * @see https://eslint-react.xyz/docs/rules/no-children-to-array
   */
  'react/no-children-to-array'?: Linter.RuleEntry<[]>;
  /**
   * Disallow class components except for error boundaries.
   * @see https://eslint-react.xyz/docs/rules/no-class-component
   */
  'react/no-class-component'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `cloneElement`.
   * @see https://eslint-react.xyz/docs/rules/no-clone-element
   */
  'react/no-clone-element'?: Linter.RuleEntry<[]>;
  /**
   * Replace usages of `componentWillMount` with `UNSAFE_componentWillMount`.
   * @see https://eslint-react.xyz/docs/rules/no-component-will-mount
   */
  'react/no-component-will-mount'?: Linter.RuleEntry<[]>;
  /**
   * Replace usages of `componentWillReceiveProps` with `UNSAFE_componentWillReceiveProps`.
   * @see https://eslint-react.xyz/docs/rules/no-component-will-receive-props
   */
  'react/no-component-will-receive-props'?: Linter.RuleEntry<[]>;
  /**
   * Replace usages of `componentWillUpdate` with `UNSAFE_componentWillUpdate`.
   * @see https://eslint-react.xyz/docs/rules/no-component-will-update
   */
  'react/no-component-will-update'?: Linter.RuleEntry<[]>;
  /**
   * Replace usages of `<Context.Provider>` with `<Context>`.
   * @see https://eslint-react.xyz/docs/rules/no-context-provider
   */
  'react/no-context-provider'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `createRef` in function components.
   * @see https://eslint-react.xyz/docs/rules/no-create-ref
   */
  'react/no-create-ref'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `defaultProps` property in favor of ES6 default parameters.
   * @see https://eslint-react.xyz/docs/rules/no-default-props
   */
  'react/no-default-props'?: Linter.RuleEntry<[]>;
  /**
   * Disallow direct mutation of `this.state`.
   * @see https://eslint-react.xyz/docs/rules/no-direct-mutation-state
   */
  'react/no-direct-mutation-state'?: Linter.RuleEntry<[]>;
  /**
   * Disallow duplicate `key` on elements in the same array or a list of `children`.
   * @see https://eslint-react.xyz/docs/rules/no-duplicate-key
   */
  'react/no-duplicate-key'?: Linter.RuleEntry<[]>;
  /**
   * Disallow certain props on components.
   * @see https://eslint-react.xyz/docs/rules/no-forbidden-props
   * @deprecated
   */
  'react/no-forbidden-props'?: Linter.RuleEntry<ReactNoForbiddenProps>;
  /**
   * Replaces usages of `forwardRef` with passing `ref` as a prop.
   * @see https://eslint-react.xyz/docs/rules/no-forward-ref
   */
  'react/no-forward-ref'?: Linter.RuleEntry<[]>;
  /**
   * Prevents `key` from not being explicitly specified (e.g. spreading `key` from objects).
   * @see https://eslint-react.xyz/docs/rules/no-implicit-key
   */
  'react/no-implicit-key'?: Linter.RuleEntry<[]>;
  /**
   * Prevents problematic leaked values from being rendered.
   * @see https://eslint-react.xyz/docs/rules/no-leaked-conditional-rendering
   */
  'react/no-leaked-conditional-rendering'?: Linter.RuleEntry<[]>;
  /**
   * Enforces that all components have a `displayName` which can be used in devtools.
   * @see https://eslint-react.xyz/docs/rules/no-missing-component-display-name
   */
  'react/no-missing-component-display-name'?: Linter.RuleEntry<[]>;
  /**
   * Enforces that all contexts have a `displayName` which can be used in devtools.
   * @see https://eslint-react.xyz/docs/rules/no-missing-context-display-name
   */
  'react/no-missing-context-display-name'?: Linter.RuleEntry<[]>;
  /**
   * Disallow missing `key` on items in list rendering.
   * @see https://eslint-react.xyz/docs/rules/no-missing-key
   */
  'react/no-missing-key'?: Linter.RuleEntry<[]>;
  /**
   * Prevents incorrect usage of `captureOwnerStack`.
   * @see https://eslint-react.xyz/docs/rules/no-misused-capture-owner-stack
   */
  'react/no-misused-capture-owner-stack'?: Linter.RuleEntry<[]>;
  /**
   * Disallow nesting component definitions inside other components.
   * @see https://eslint-react.xyz/docs/rules/no-nested-component-definitions
   */
  'react/no-nested-component-definitions'?: Linter.RuleEntry<[]>;
  /**
   * Disallow nesting lazy component declarations inside other components.
   * @see https://eslint-react.xyz/docs/rules/no-nested-lazy-component-declarations
   */
  'react/no-nested-lazy-component-declarations'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `propTypes` in favor of TypeScript or another type-checking solution.
   * @see https://eslint-react.xyz/docs/rules/no-prop-types
   */
  'react/no-prop-types'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `shouldComponentUpdate` when extending `React.PureComponent`.
   * @see https://eslint-react.xyz/docs/rules/no-redundant-should-component-update
   */
  'react/no-redundant-should-component-update'?: Linter.RuleEntry<[]>;
  /**
   * Disallow calling `this.setState` in `componentDidMount` outside of functions, such as callbacks.
   * @see https://eslint-react.xyz/docs/rules/no-set-state-in-component-did-mount
   */
  'react/no-set-state-in-component-did-mount'?: Linter.RuleEntry<[]>;
  /**
   * Disallow calling `this.setState` in `componentDidUpdate` outside of functions, such as callbacks.
   * @see https://eslint-react.xyz/docs/rules/no-set-state-in-component-did-update
   */
  'react/no-set-state-in-component-did-update'?: Linter.RuleEntry<[]>;
  /**
   * Disallow calling `this.setState` in `componentWillUpdate` outside of functions, such as callbacks.
   * @see https://eslint-react.xyz/docs/rules/no-set-state-in-component-will-update
   */
  'react/no-set-state-in-component-will-update'?: Linter.RuleEntry<[]>;
  /**
   * Replaces string refs with callback refs.
   * @see https://eslint-react.xyz/docs/rules/no-string-refs
   */
  'react/no-string-refs'?: Linter.RuleEntry<[]>;
  /**
   * Prevents the use of unnecessary `key` props on JSX elements when rendering lists.
   * @see https://eslint-react.xyz/docs/rules/no-unnecessary-key
   */
  'react/no-unnecessary-key'?: Linter.RuleEntry<[]>;
  /**
   * Disallow unnecessary usage of `useCallback`.
   * @see https://eslint-react.xyz/docs/rules/no-unnecessary-use-callback
   */
  'react/no-unnecessary-use-callback'?: Linter.RuleEntry<[]>;
  /**
   * Disallow unnecessary usage of `useMemo`.
   * @see https://eslint-react.xyz/docs/rules/no-unnecessary-use-memo
   */
  'react/no-unnecessary-use-memo'?: Linter.RuleEntry<[]>;
  /**
   * Enforces that a function with the `use` prefix should use at least one Hook inside of it.
   * @see https://eslint-react.xyz/docs/rules/no-unnecessary-use-prefix
   */
  'react/no-unnecessary-use-prefix'?: Linter.RuleEntry<[]>;
  /**
   * Warns the usage of `UNSAFE_componentWillMount` in class components.
   * @see https://eslint-react.xyz/docs/rules/no-unsafe-component-will-mount
   */
  'react/no-unsafe-component-will-mount'?: Linter.RuleEntry<[]>;
  /**
   * Warns the usage of `UNSAFE_componentWillReceiveProps` in class components.
   * @see https://eslint-react.xyz/docs/rules/no-unsafe-component-will-receive-props
   */
  'react/no-unsafe-component-will-receive-props'?: Linter.RuleEntry<[]>;
  /**
   * Warns the usage of `UNSAFE_componentWillUpdate` in class components.
   * @see https://eslint-react.xyz/docs/rules/no-unsafe-component-will-update
   */
  'react/no-unsafe-component-will-update'?: Linter.RuleEntry<[]>;
  /**
   * Prevents non-stable values (i.e. object literals) from being used as a value for `Context.Provider`.
   * @see https://eslint-react.xyz/docs/rules/no-unstable-context-value
   */
  'react/no-unstable-context-value'?: Linter.RuleEntry<[]>;
  /**
   * Prevents using referential-type values as default props in object destructuring.
   * @see https://eslint-react.xyz/docs/rules/no-unstable-default-props
   */
  'react/no-unstable-default-props'?: Linter.RuleEntry<ReactNoUnstableDefaultProps>;
  /**
   * Warns unused class component methods and properties.
   * @see https://eslint-react.xyz/docs/rules/no-unused-class-component-members
   */
  'react/no-unused-class-component-members'?: Linter.RuleEntry<[]>;
  /**
   * Warns component props that are defined but never used.
   * @see https://eslint-react.xyz/docs/rules/no-unused-props
   */
  'react/no-unused-props'?: Linter.RuleEntry<[]>;
  /**
   * Warns unused class component state.
   * @see https://eslint-react.xyz/docs/rules/no-unused-state
   */
  'react/no-unused-state'?: Linter.RuleEntry<[]>;
  /**
   * Replaces usages of `useContext` with `use`.
   * @see https://eslint-react.xyz/docs/rules/no-use-context
   */
  'react/no-use-context'?: Linter.RuleEntry<[]>;
  /**
   * Disallow useless `forwardRef` calls on components that don't use `ref`s.
   * @see https://eslint-react.xyz/docs/rules/no-useless-forward-ref
   */
  'react/no-useless-forward-ref'?: Linter.RuleEntry<[]>;
  /**
   * Disallow useless fragment elements.
   * @see https://eslint-react.xyz/docs/rules/no-useless-fragment
   */
  'react/no-useless-fragment'?: Linter.RuleEntry<ReactNoUselessFragment>;
  /**
   * Enforces destructuring assignment for component props and context.
   * @see https://eslint-react.xyz/docs/rules/prefer-destructuring-assignment
   */
  'react/prefer-destructuring-assignment'?: Linter.RuleEntry<[]>;
  /**
   * Enforces React is imported via a namespace import.
   * @see https://eslint-react.xyz/docs/rules/prefer-namespace-import
   */
  'react/prefer-namespace-import'?: Linter.RuleEntry<[]>;
  /**
   * Enforces read-only props in components.
   * @see https://eslint-react.xyz/docs/rules/prefer-read-only-props
   */
  'react/prefer-read-only-props'?: Linter.RuleEntry<[]>;
  /**
   * Enforces function calls made inside `useState` to be wrapped in an `initializer function`.
   * @see https://eslint-react.xyz/docs/rules/prefer-use-state-lazy-initialization
   */
  'react/prefer-use-state-lazy-initialization'?: Linter.RuleEntry<[]>;
  /**
   * disallow confusing quantifiers
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/confusing-quantifier.html
   */
  'regexp/confusing-quantifier'?: Linter.RuleEntry<[]>;
  /**
   * enforce consistent escaping of control characters
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/control-character-escape.html
   */
  'regexp/control-character-escape'?: Linter.RuleEntry<[]>;
  /**
   * enforce single grapheme in string literal
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/grapheme-string-literal.html
   */
  'regexp/grapheme-string-literal'?: Linter.RuleEntry<[]>;
  /**
   * enforce consistent usage of hexadecimal escape
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/hexadecimal-escape.html
   */
  'regexp/hexadecimal-escape'?: Linter.RuleEntry<RegexpHexadecimalEscape>;
  /**
   * enforce into your favorite case
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/letter-case.html
   */
  'regexp/letter-case'?: Linter.RuleEntry<RegexpLetterCase>;
  /**
   * enforce match any character style
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/match-any.html
   */
  'regexp/match-any'?: Linter.RuleEntry<RegexpMatchAny>;
  /**
   * enforce use of escapes on negation
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/negation.html
   */
  'regexp/negation'?: Linter.RuleEntry<[]>;
  /**
   * disallow elements that contradict assertions
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-contradiction-with-assertion.html
   */
  'regexp/no-contradiction-with-assertion'?: Linter.RuleEntry<[]>;
  /**
   * disallow control characters
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-control-character.html
   */
  'regexp/no-control-character'?: Linter.RuleEntry<[]>;
  /**
   * disallow duplicate characters in the RegExp character class
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-dupe-characters-character-class.html
   */
  'regexp/no-dupe-characters-character-class'?: Linter.RuleEntry<[]>;
  /**
   * disallow duplicate disjunctions
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-dupe-disjunctions.html
   */
  'regexp/no-dupe-disjunctions'?: Linter.RuleEntry<RegexpNoDupeDisjunctions>;
  /**
   * disallow alternatives without elements
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-empty-alternative.html
   */
  'regexp/no-empty-alternative'?: Linter.RuleEntry<[]>;
  /**
   * disallow capturing group that captures empty.
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-empty-capturing-group.html
   */
  'regexp/no-empty-capturing-group'?: Linter.RuleEntry<[]>;
  /**
   * disallow character classes that match no characters
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-empty-character-class.html
   */
  'regexp/no-empty-character-class'?: Linter.RuleEntry<[]>;
  /**
   * disallow empty group
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-empty-group.html
   */
  'regexp/no-empty-group'?: Linter.RuleEntry<[]>;
  /**
   * disallow empty lookahead assertion or empty lookbehind assertion
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-empty-lookarounds-assertion.html
   */
  'regexp/no-empty-lookarounds-assertion'?: Linter.RuleEntry<[]>;
  /**
   * disallow empty string literals in character classes
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-empty-string-literal.html
   */
  'regexp/no-empty-string-literal'?: Linter.RuleEntry<[]>;
  /**
   * disallow escape backspace (`[\b]`)
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-escape-backspace.html
   */
  'regexp/no-escape-backspace'?: Linter.RuleEntry<[]>;
  /**
   * disallow unnecessary nested lookaround assertions
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-extra-lookaround-assertions.html
   */
  'regexp/no-extra-lookaround-assertions'?: Linter.RuleEntry<[]>;
  /**
   * disallow invalid regular expression strings in `RegExp` constructors
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-invalid-regexp.html
   */
  'regexp/no-invalid-regexp'?: Linter.RuleEntry<[]>;
  /**
   * disallow invisible raw character
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-invisible-character.html
   */
  'regexp/no-invisible-character'?: Linter.RuleEntry<[]>;
  /**
   * disallow lazy quantifiers at the end of an expression
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-lazy-ends.html
   */
  'regexp/no-lazy-ends'?: Linter.RuleEntry<RegexpNoLazyEnds>;
  /**
   * disallow legacy RegExp features
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-legacy-features.html
   */
  'regexp/no-legacy-features'?: Linter.RuleEntry<RegexpNoLegacyFeatures>;
  /**
   * disallow capturing groups that do not behave as one would expect
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-misleading-capturing-group.html
   */
  'regexp/no-misleading-capturing-group'?: Linter.RuleEntry<RegexpNoMisleadingCapturingGroup>;
  /**
   * disallow multi-code-point characters in character classes and quantifiers
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-misleading-unicode-character.html
   */
  'regexp/no-misleading-unicode-character'?: Linter.RuleEntry<RegexpNoMisleadingUnicodeCharacter>;
  /**
   * disallow missing `g` flag in patterns used in `String#matchAll` and `String#replaceAll`
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-missing-g-flag.html
   */
  'regexp/no-missing-g-flag'?: Linter.RuleEntry<RegexpNoMissingGFlag>;
  /**
   * disallow non-standard flags
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-non-standard-flag.html
   */
  'regexp/no-non-standard-flag'?: Linter.RuleEntry<[]>;
  /**
   * disallow obscure character ranges
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-obscure-range.html
   */
  'regexp/no-obscure-range'?: Linter.RuleEntry<RegexpNoObscureRange>;
  /**
   * disallow octal escape sequence
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-octal.html
   */
  'regexp/no-octal'?: Linter.RuleEntry<[]>;
  /**
   * disallow optional assertions
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-optional-assertion.html
   */
  'regexp/no-optional-assertion'?: Linter.RuleEntry<[]>;
  /**
   * disallow backreferences that reference a group that might not be matched
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-potentially-useless-backreference.html
   */
  'regexp/no-potentially-useless-backreference'?: Linter.RuleEntry<[]>;
  /**
   * disallow standalone backslashes (`\`)
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-standalone-backslash.html
   */
  'regexp/no-standalone-backslash'?: Linter.RuleEntry<[]>;
  /**
   * disallow exponential and polynomial backtracking
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-super-linear-backtracking.html
   */
  'regexp/no-super-linear-backtracking'?: Linter.RuleEntry<RegexpNoSuperLinearBacktracking>;
  /**
   * disallow quantifiers that cause quadratic moves
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-super-linear-move.html
   */
  'regexp/no-super-linear-move'?: Linter.RuleEntry<RegexpNoSuperLinearMove>;
  /**
   * disallow trivially nested assertions
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-trivially-nested-assertion.html
   */
  'regexp/no-trivially-nested-assertion'?: Linter.RuleEntry<[]>;
  /**
   * disallow nested quantifiers that can be rewritten as one quantifier
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-trivially-nested-quantifier.html
   */
  'regexp/no-trivially-nested-quantifier'?: Linter.RuleEntry<[]>;
  /**
   * disallow unused capturing group
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-unused-capturing-group.html
   */
  'regexp/no-unused-capturing-group'?: Linter.RuleEntry<RegexpNoUnusedCapturingGroup>;
  /**
   * disallow assertions that are known to always accept (or reject)
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-useless-assertions.html
   */
  'regexp/no-useless-assertions'?: Linter.RuleEntry<[]>;
  /**
   * disallow useless backreferences in regular expressions
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-useless-backreference.html
   */
  'regexp/no-useless-backreference'?: Linter.RuleEntry<[]>;
  /**
   * disallow character class with one character
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-useless-character-class.html
   */
  'regexp/no-useless-character-class'?: Linter.RuleEntry<RegexpNoUselessCharacterClass>;
  /**
   * disallow useless `$` replacements in replacement string
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-useless-dollar-replacements.html
   */
  'regexp/no-useless-dollar-replacements'?: Linter.RuleEntry<[]>;
  /**
   * disallow unnecessary escape characters in RegExp
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-useless-escape.html
   */
  'regexp/no-useless-escape'?: Linter.RuleEntry<[]>;
  /**
   * disallow unnecessary regex flags
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-useless-flag.html
   */
  'regexp/no-useless-flag'?: Linter.RuleEntry<RegexpNoUselessFlag>;
  /**
   * disallow unnecessarily non-greedy quantifiers
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-useless-lazy.html
   */
  'regexp/no-useless-lazy'?: Linter.RuleEntry<[]>;
  /**
   * disallow unnecessary non-capturing group
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-useless-non-capturing-group.html
   */
  'regexp/no-useless-non-capturing-group'?: Linter.RuleEntry<RegexpNoUselessNonCapturingGroup>;
  /**
   * disallow quantifiers that can be removed
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-useless-quantifier.html
   */
  'regexp/no-useless-quantifier'?: Linter.RuleEntry<[]>;
  /**
   * disallow unnecessary character ranges
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-useless-range.html
   */
  'regexp/no-useless-range'?: Linter.RuleEntry<[]>;
  /**
   * disallow unnecessary elements in expression character classes
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-useless-set-operand.html
   */
  'regexp/no-useless-set-operand'?: Linter.RuleEntry<[]>;
  /**
   * disallow string disjunction of single characters in `\q{...}`
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-useless-string-literal.html
   */
  'regexp/no-useless-string-literal'?: Linter.RuleEntry<[]>;
  /**
   * disallow unnecessary `{n,m}` quantifier
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-useless-two-nums-quantifier.html
   */
  'regexp/no-useless-two-nums-quantifier'?: Linter.RuleEntry<[]>;
  /**
   * disallow quantifiers with a maximum of zero
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-zero-quantifier.html
   */
  'regexp/no-zero-quantifier'?: Linter.RuleEntry<[]>;
  /**
   * disallow the alternatives of lookarounds that end with a non-constant quantifier
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/optimal-lookaround-quantifier.html
   */
  'regexp/optimal-lookaround-quantifier'?: Linter.RuleEntry<[]>;
  /**
   * require optimal quantifiers for concatenated quantifiers
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/optimal-quantifier-concatenation.html
   */
  'regexp/optimal-quantifier-concatenation'?: Linter.RuleEntry<RegexpOptimalQuantifierConcatenation>;
  /**
   * enforce using character class
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/prefer-character-class.html
   */
  'regexp/prefer-character-class'?: Linter.RuleEntry<RegexpPreferCharacterClass>;
  /**
   * enforce using `\d`
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/prefer-d.html
   */
  'regexp/prefer-d'?: Linter.RuleEntry<RegexpPreferD>;
  /**
   * enforces escape of replacement `$` character (`$$`).
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/prefer-escape-replacement-dollar-char.html
   */
  'regexp/prefer-escape-replacement-dollar-char'?: Linter.RuleEntry<[]>;
  /**
   * prefer lookarounds over capturing group that do not replace
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/prefer-lookaround.html
   */
  'regexp/prefer-lookaround'?: Linter.RuleEntry<RegexpPreferLookaround>;
  /**
   * enforce using named backreferences
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/prefer-named-backreference.html
   */
  'regexp/prefer-named-backreference'?: Linter.RuleEntry<[]>;
  /**
   * enforce using named capture groups
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/prefer-named-capture-group.html
   */
  'regexp/prefer-named-capture-group'?: Linter.RuleEntry<[]>;
  /**
   * enforce using named replacement
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/prefer-named-replacement.html
   */
  'regexp/prefer-named-replacement'?: Linter.RuleEntry<RegexpPreferNamedReplacement>;
  /**
   * enforce using `+` quantifier
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/prefer-plus-quantifier.html
   */
  'regexp/prefer-plus-quantifier'?: Linter.RuleEntry<[]>;
  /**
   * prefer predefined assertion over equivalent lookarounds
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/prefer-predefined-assertion.html
   */
  'regexp/prefer-predefined-assertion'?: Linter.RuleEntry<[]>;
  /**
   * enforce using quantifier
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/prefer-quantifier.html
   */
  'regexp/prefer-quantifier'?: Linter.RuleEntry<RegexpPreferQuantifier>;
  /**
   * enforce using `?` quantifier
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/prefer-question-quantifier.html
   */
  'regexp/prefer-question-quantifier'?: Linter.RuleEntry<[]>;
  /**
   * enforce using character class range
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/prefer-range.html
   */
  'regexp/prefer-range'?: Linter.RuleEntry<RegexpPreferRange>;
  /**
   * enforce that `RegExp#exec` is used instead of `String#match` if no global flag is provided
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/prefer-regexp-exec.html
   */
  'regexp/prefer-regexp-exec'?: Linter.RuleEntry<[]>;
  /**
   * enforce that `RegExp#test` is used instead of `String#match` and `RegExp#exec`
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/prefer-regexp-test.html
   */
  'regexp/prefer-regexp-test'?: Linter.RuleEntry<[]>;
  /**
   * enforce using result array `groups`
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/prefer-result-array-groups.html
   */
  'regexp/prefer-result-array-groups'?: Linter.RuleEntry<RegexpPreferResultArrayGroups>;
  /**
   * prefer character class set operations instead of lookarounds
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/prefer-set-operation.html
   */
  'regexp/prefer-set-operation'?: Linter.RuleEntry<[]>;
  /**
   * enforce using `*` quantifier
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/prefer-star-quantifier.html
   */
  'regexp/prefer-star-quantifier'?: Linter.RuleEntry<[]>;
  /**
   * enforce use of unicode codepoint escapes
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/prefer-unicode-codepoint-escapes.html
   */
  'regexp/prefer-unicode-codepoint-escapes'?: Linter.RuleEntry<[]>;
  /**
   * enforce using `\w`
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/prefer-w.html
   */
  'regexp/prefer-w'?: Linter.RuleEntry<[]>;
  /**
   * enforce the use of the `u` flag
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/require-unicode-regexp.html
   */
  'regexp/require-unicode-regexp'?: Linter.RuleEntry<[]>;
  /**
   * enforce the use of the `v` flag
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/require-unicode-sets-regexp.html
   */
  'regexp/require-unicode-sets-regexp'?: Linter.RuleEntry<[]>;
  /**
   * require simplify set operations
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/simplify-set-operations.html
   */
  'regexp/simplify-set-operations'?: Linter.RuleEntry<[]>;
  /**
   * sort alternatives if order doesn't matter
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/sort-alternatives.html
   */
  'regexp/sort-alternatives'?: Linter.RuleEntry<[]>;
  /**
   * enforces elements order in character class
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/sort-character-class-elements.html
   */
  'regexp/sort-character-class-elements'?: Linter.RuleEntry<RegexpSortCharacterClassElements>;
  /**
   * require regex flags to be sorted
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/sort-flags.html
   */
  'regexp/sort-flags'?: Linter.RuleEntry<[]>;
  /**
   * disallow not strictly valid regular expressions
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/strict.html
   */
  'regexp/strict'?: Linter.RuleEntry<[]>;
  /**
   * enforce consistent usage of unicode escape or unicode codepoint escape
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/unicode-escape.html
   */
  'regexp/unicode-escape'?: Linter.RuleEntry<RegexpUnicodeEscape>;
  /**
   * enforce consistent naming of unicode properties
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/unicode-property.html
   */
  'regexp/unicode-property'?: Linter.RuleEntry<RegexpUnicodeProperty>;
  /**
   * use the `i` flag if it simplifies the pattern
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/use-ignore-case.html
   */
  'regexp/use-ignore-case'?: Linter.RuleEntry<[]>;
  /**
   * Disallow assignments that can lead to race conditions due to usage of `await` or `yield`
   * @see https://eslint.org/docs/latest/rules/require-atomic-updates
   */
  'require-atomic-updates'?: Linter.RuleEntry<RequireAtomicUpdates>;
  /**
   * Disallow async functions which have no `await` expression
   * @see https://eslint.org/docs/latest/rules/require-await
   */
  'require-await'?: Linter.RuleEntry<[]>;
  /**
   * Enforce the use of `u` or `v` flag on regular expressions
   * @see https://eslint.org/docs/latest/rules/require-unicode-regexp
   */
  'require-unicode-regexp'?: Linter.RuleEntry<RequireUnicodeRegexp>;
  /**
   * Require generator functions to contain `yield`
   * @see https://eslint.org/docs/latest/rules/require-yield
   */
  'require-yield'?: Linter.RuleEntry<[]>;
  /**
   * Enforce spacing between rest and spread operators and their expressions
   * @see https://eslint.org/docs/latest/rules/rest-spread-spacing
   * @deprecated
   */
  'rest-spread-spacing'?: Linter.RuleEntry<RestSpreadSpacing>;
  /**
   * Require or disallow semicolons instead of ASI
   * @see https://eslint.org/docs/latest/rules/semi
   * @deprecated
   */
  'semi'?: Linter.RuleEntry<Semi>;
  /**
   * Enforce consistent spacing before and after semicolons
   * @see https://eslint.org/docs/latest/rules/semi-spacing
   * @deprecated
   */
  'semi-spacing'?: Linter.RuleEntry<SemiSpacing>;
  /**
   * Enforce location of semicolons
   * @see https://eslint.org/docs/latest/rules/semi-style
   * @deprecated
   */
  'semi-style'?: Linter.RuleEntry<SemiStyle>;
  /**
   * Disallow early returns in components. Solid components only run once, and so conditionals should be inside JSX.
   * @see https://github.com/solidjs-community/eslint-plugin-solid/blob/main/packages/eslint-plugin-solid/docs/components-return-once.md
   */
  'solid/components-return-once'?: Linter.RuleEntry<[]>;
  /**
   * Enforce naming DOM element event handlers consistently and prevent Solid's analysis from misunderstanding whether a prop should be an event handler.
   * @see https://github.com/solidjs-community/eslint-plugin-solid/blob/main/packages/eslint-plugin-solid/docs/event-handlers.md
   */
  'solid/event-handlers'?: Linter.RuleEntry<SolidEventHandlers>;
  /**
   * Enforce consistent imports from "solid-js", "solid-js/web", and "solid-js/store".
   * @see https://github.com/solidjs-community/eslint-plugin-solid/blob/main/packages/eslint-plugin-solid/docs/imports.md
   */
  'solid/imports'?: Linter.RuleEntry<[]>;
  /**
   * Disallow passing the same prop twice in JSX.
   * @see https://github.com/solidjs-community/eslint-plugin-solid/blob/main/packages/eslint-plugin-solid/docs/jsx-no-duplicate-props.md
   */
  'solid/jsx-no-duplicate-props'?: Linter.RuleEntry<SolidJsxNoDuplicateProps>;
  /**
   * Disallow javascript: URLs.
   * @see https://github.com/solidjs-community/eslint-plugin-solid/blob/main/packages/eslint-plugin-solid/docs/jsx-no-script-url.md
   */
  'solid/jsx-no-script-url'?: Linter.RuleEntry<[]>;
  /**
   * Disallow references to undefined variables in JSX. Handles custom directives.
   * @see https://github.com/solidjs-community/eslint-plugin-solid/blob/main/packages/eslint-plugin-solid/docs/jsx-no-undef.md
   */
  'solid/jsx-no-undef'?: Linter.RuleEntry<SolidJsxNoUndef>;
  /**
   * Prevent variables used in JSX from being marked as unused.
   * @see https://github.com/solidjs-community/eslint-plugin-solid/blob/main/packages/eslint-plugin-solid/docs/jsx-uses-vars.md
   */
  'solid/jsx-uses-vars'?: Linter.RuleEntry<[]>;
  /**
   * Disallow usage of type-unsafe event handlers.
   * @see https://github.com/solidjs-community/eslint-plugin-solid/blob/main/packages/eslint-plugin-solid/docs/no-array-handlers.md
   */
  'solid/no-array-handlers'?: Linter.RuleEntry<[]>;
  /**
   * Disallow destructuring props. In Solid, props must be used with property accesses (`props.foo`) to preserve reactivity. This rule only tracks destructuring in the parameter list.
   * @see https://github.com/solidjs-community/eslint-plugin-solid/blob/main/packages/eslint-plugin-solid/docs/no-destructure.md
   */
  'solid/no-destructure'?: Linter.RuleEntry<[]>;
  /**
   * Disallow usage of the innerHTML attribute, which can often lead to security vulnerabilities.
   * @see https://github.com/solidjs-community/eslint-plugin-solid/blob/main/packages/eslint-plugin-solid/docs/no-innerhtml.md
   */
  'solid/no-innerhtml'?: Linter.RuleEntry<SolidNoInnerhtml>;
  /**
   * Disallow usage of APIs that use ES6 Proxies, only to target environments that don't support them.
   * @see https://github.com/solidjs-community/eslint-plugin-solid/blob/main/packages/eslint-plugin-solid/docs/no-proxy-apis.md
   */
  'solid/no-proxy-apis'?: Linter.RuleEntry<[]>;
  /**
   * Disallow usage of dependency arrays in `createEffect` and `createMemo`.
   * @see https://github.com/solidjs-community/eslint-plugin-solid/blob/main/packages/eslint-plugin-solid/docs/no-react-deps.md
   */
  'solid/no-react-deps'?: Linter.RuleEntry<[]>;
  /**
   * Disallow usage of React-specific `className`/`htmlFor` props, which were deprecated in v1.4.0.
   * @see https://github.com/solidjs-community/eslint-plugin-solid/blob/main/packages/eslint-plugin-solid/docs/no-react-specific-props.md
   */
  'solid/no-react-specific-props'?: Linter.RuleEntry<[]>;
  /**
   * Enforce using only Solid-specific namespaced attribute names (i.e. `'on:'` in `<div on:click={...} />`).
   * @see https://github.com/solidjs-community/eslint-plugin-solid/blob/main/packages/eslint-plugin-solid/docs/no-unknown-namespaces.md
   */
  'solid/no-unknown-namespaces'?: Linter.RuleEntry<SolidNoUnknownNamespaces>;
  /**
   * Enforce using the classlist prop over importing a classnames helper. The classlist prop accepts an object `{ [class: string]: boolean }` just like classnames.
   * @see https://github.com/solidjs-community/eslint-plugin-solid/blob/main/packages/eslint-plugin-solid/docs/prefer-classlist.md
   * @deprecated
   */
  'solid/prefer-classlist'?: Linter.RuleEntry<SolidPreferClasslist>;
  /**
   * Enforce using Solid's `<For />` component for mapping an array to JSX elements.
   * @see https://github.com/solidjs-community/eslint-plugin-solid/blob/main/packages/eslint-plugin-solid/docs/prefer-for.md
   */
  'solid/prefer-for'?: Linter.RuleEntry<[]>;
  /**
   * Enforce using Solid's `<Show />` component for conditionally showing content. Solid's compiler covers this case, so it's a stylistic rule only.
   * @see https://github.com/solidjs-community/eslint-plugin-solid/blob/main/packages/eslint-plugin-solid/docs/prefer-show.md
   */
  'solid/prefer-show'?: Linter.RuleEntry<[]>;
  /**
   * Enforce that reactivity (props, signals, memos, etc.) is properly used, so changes in those values will be tracked and update the view as expected.
   * @see https://github.com/solidjs-community/eslint-plugin-solid/blob/main/packages/eslint-plugin-solid/docs/reactivity.md
   */
  'solid/reactivity'?: Linter.RuleEntry<SolidReactivity>;
  /**
   * Disallow extra closing tags for components without children.
   * @see https://github.com/solidjs-community/eslint-plugin-solid/blob/main/packages/eslint-plugin-solid/docs/self-closing-comp.md
   */
  'solid/self-closing-comp'?: Linter.RuleEntry<SolidSelfClosingComp>;
  /**
   * Require CSS properties in the `style` prop to be valid and kebab-cased (ex. 'font-size'), not camel-cased (ex. 'fontSize') like in React, and that property values with dimensions are strings, not numbers with implicit 'px' units.
   * @see https://github.com/solidjs-community/eslint-plugin-solid/blob/main/packages/eslint-plugin-solid/docs/style-prop.md
   */
  'solid/style-prop'?: Linter.RuleEntry<SolidStyleProp>;
  /**
   * Enforce sorted `import` declarations within modules
   * @see https://eslint.org/docs/latest/rules/sort-imports
   */
  'sort-imports'?: Linter.RuleEntry<SortImports>;
  /**
   * Require object keys to be sorted
   * @see https://eslint.org/docs/latest/rules/sort-keys
   */
  'sort-keys'?: Linter.RuleEntry<SortKeys>;
  /**
   * Require variables within the same declaration block to be sorted
   * @see https://eslint.org/docs/latest/rules/sort-vars
   */
  'sort-vars'?: Linter.RuleEntry<SortVars>;
  /**
   * Enforce consistent spacing before blocks
   * @see https://eslint.org/docs/latest/rules/space-before-blocks
   * @deprecated
   */
  'space-before-blocks'?: Linter.RuleEntry<SpaceBeforeBlocks>;
  /**
   * Enforce consistent spacing before `function` definition opening parenthesis
   * @see https://eslint.org/docs/latest/rules/space-before-function-paren
   * @deprecated
   */
  'space-before-function-paren'?: Linter.RuleEntry<SpaceBeforeFunctionParen>;
  /**
   * Enforce consistent spacing inside parentheses
   * @see https://eslint.org/docs/latest/rules/space-in-parens
   * @deprecated
   */
  'space-in-parens'?: Linter.RuleEntry<SpaceInParens>;
  /**
   * Require spacing around infix operators
   * @see https://eslint.org/docs/latest/rules/space-infix-ops
   * @deprecated
   */
  'space-infix-ops'?: Linter.RuleEntry<SpaceInfixOps>;
  /**
   * Enforce consistent spacing before or after unary operators
   * @see https://eslint.org/docs/latest/rules/space-unary-ops
   * @deprecated
   */
  'space-unary-ops'?: Linter.RuleEntry<SpaceUnaryOps>;
  /**
   * Enforce consistent spacing after the `//` or `/*` in a comment
   * @see https://eslint.org/docs/latest/rules/spaced-comment
   * @deprecated
   */
  'spaced-comment'?: Linter.RuleEntry<SpacedComment>;
  /**
   * Require or disallow strict mode directives
   * @see https://eslint.org/docs/latest/rules/strict
   */
  'strict'?: Linter.RuleEntry<Strict>;
  /**
   * Enforce linebreaks after opening and before closing array brackets
   * @see https://eslint.style/rules/array-bracket-newline
   */
  'style/array-bracket-newline'?: Linter.RuleEntry<StyleArrayBracketNewline>;
  /**
   * Enforce consistent spacing inside array brackets
   * @see https://eslint.style/rules/array-bracket-spacing
   */
  'style/array-bracket-spacing'?: Linter.RuleEntry<StyleArrayBracketSpacing>;
  /**
   * Enforce line breaks after each array element
   * @see https://eslint.style/rules/array-element-newline
   */
  'style/array-element-newline'?: Linter.RuleEntry<StyleArrayElementNewline>;
  /**
   * Require parentheses around arrow function arguments
   * @see https://eslint.style/rules/arrow-parens
   */
  'style/arrow-parens'?: Linter.RuleEntry<StyleArrowParens>;
  /**
   * Enforce consistent spacing before and after the arrow in arrow functions
   * @see https://eslint.style/rules/arrow-spacing
   */
  'style/arrow-spacing'?: Linter.RuleEntry<StyleArrowSpacing>;
  /**
   * Disallow or enforce spaces inside of blocks after opening block and before closing block
   * @see https://eslint.style/rules/block-spacing
   */
  'style/block-spacing'?: Linter.RuleEntry<StyleBlockSpacing>;
  /**
   * Enforce consistent brace style for blocks
   * @see https://eslint.style/rules/brace-style
   */
  'style/brace-style'?: Linter.RuleEntry<StyleBraceStyle>;
  /**
   * Require or disallow trailing commas
   * @see https://eslint.style/rules/comma-dangle
   */
  'style/comma-dangle'?: Linter.RuleEntry<StyleCommaDangle>;
  /**
   * Enforce consistent spacing before and after commas
   * @see https://eslint.style/rules/comma-spacing
   */
  'style/comma-spacing'?: Linter.RuleEntry<StyleCommaSpacing>;
  /**
   * Enforce consistent comma style
   * @see https://eslint.style/rules/comma-style
   */
  'style/comma-style'?: Linter.RuleEntry<StyleCommaStyle>;
  /**
   * Enforce consistent spacing inside computed property brackets
   * @see https://eslint.style/rules/computed-property-spacing
   */
  'style/computed-property-spacing'?: Linter.RuleEntry<StyleComputedPropertySpacing>;
  /**
   * Enforce consistent line breaks after opening and before closing braces
   * @see https://eslint.style/rules/curly-newline
   */
  'style/curly-newline'?: Linter.RuleEntry<StyleCurlyNewline>;
  /**
   * Enforce consistent newlines before and after dots
   * @see https://eslint.style/rules/dot-location
   */
  'style/dot-location'?: Linter.RuleEntry<StyleDotLocation>;
  /**
   * Require or disallow newline at the end of files
   * @see https://eslint.style/rules/eol-last
   */
  'style/eol-last'?: Linter.RuleEntry<StyleEolLast>;
  /**
   * Enforce consistent spacing and line break styles inside brackets.
   * @see https://eslint.style/rules/list-style
   */
  'style/exp-list-style'?: Linter.RuleEntry<StyleExpListStyle>;
  /**
   * Enforce line breaks between arguments of a function call
   * @see https://eslint.style/rules/function-call-argument-newline
   */
  'style/function-call-argument-newline'?: Linter.RuleEntry<StyleFunctionCallArgumentNewline>;
  /**
   * Require or disallow spacing between function identifiers and their invocations
   * @see https://eslint.style/rules/function-call-spacing
   */
  'style/function-call-spacing'?: Linter.RuleEntry<StyleFunctionCallSpacing>;
  /**
   * Enforce consistent line breaks inside function parentheses
   * @see https://eslint.style/rules/function-paren-newline
   */
  'style/function-paren-newline'?: Linter.RuleEntry<StyleFunctionParenNewline>;
  /**
   * Enforce consistent spacing around `*` operators in generator functions
   * @see https://eslint.style/rules/generator-star-spacing
   */
  'style/generator-star-spacing'?: Linter.RuleEntry<StyleGeneratorStarSpacing>;
  /**
   * Enforce the location of arrow function bodies
   * @see https://eslint.style/rules/implicit-arrow-linebreak
   */
  'style/implicit-arrow-linebreak'?: Linter.RuleEntry<StyleImplicitArrowLinebreak>;
  /**
   * Enforce consistent indentation
   * @see https://eslint.style/rules/indent
   */
  'style/indent'?: Linter.RuleEntry<StyleIndent>;
  /**
   * Indentation for binary operators
   * @see https://eslint.style/rules/indent-binary-ops
   */
  'style/indent-binary-ops'?: Linter.RuleEntry<StyleIndentBinaryOps>;
  /**
   * Enforce or disallow spaces inside of curly braces in JSX attributes and expressions
   * @see https://eslint.style/rules/jsx-child-element-spacing
   */
  'style/jsx-child-element-spacing'?: Linter.RuleEntry<[]>;
  /**
   * Enforce closing bracket location in JSX
   * @see https://eslint.style/rules/jsx-closing-bracket-location
   */
  'style/jsx-closing-bracket-location'?: Linter.RuleEntry<StyleJsxClosingBracketLocation>;
  /**
   * Enforce closing tag location for multiline JSX
   * @see https://eslint.style/rules/jsx-closing-tag-location
   */
  'style/jsx-closing-tag-location'?: Linter.RuleEntry<StyleJsxClosingTagLocation>;
  /**
   * Disallow unnecessary JSX expressions when literals alone are sufficient or enforce JSX expressions on literals in JSX children or attributes
   * @see https://eslint.style/rules/jsx-curly-brace-presence
   */
  'style/jsx-curly-brace-presence'?: Linter.RuleEntry<StyleJsxCurlyBracePresence>;
  /**
   * Enforce consistent linebreaks in curly braces in JSX attributes and expressions
   * @see https://eslint.style/rules/jsx-curly-newline
   */
  'style/jsx-curly-newline'?: Linter.RuleEntry<StyleJsxCurlyNewline>;
  /**
   * Enforce or disallow spaces inside of curly braces in JSX attributes and expressions
   * @see https://eslint.style/rules/jsx-curly-spacing
   */
  'style/jsx-curly-spacing'?: Linter.RuleEntry<StyleJsxCurlySpacing>;
  /**
   * Enforce or disallow spaces around equal signs in JSX attributes
   * @see https://eslint.style/rules/jsx-equals-spacing
   */
  'style/jsx-equals-spacing'?: Linter.RuleEntry<StyleJsxEqualsSpacing>;
  /**
   * Enforce proper position of the first property in JSX
   * @see https://eslint.style/rules/jsx-first-prop-new-line
   */
  'style/jsx-first-prop-new-line'?: Linter.RuleEntry<StyleJsxFirstPropNewLine>;
  /**
   * Enforce line breaks before and after JSX elements when they are used as arguments to a function.
   * @see https://eslint.style/rules/jsx-function-call-newline
   */
  'style/jsx-function-call-newline'?: Linter.RuleEntry<StyleJsxFunctionCallNewline>;
  /**
   * Enforce JSX indentation. Deprecated, use `indent` rule instead.
   * @see https://eslint.style/rules/jsx-indent
   * @deprecated
   */
  'style/jsx-indent'?: Linter.RuleEntry<StyleJsxIndent>;
  /**
   * Enforce props indentation in JSX
   * @see https://eslint.style/rules/jsx-indent-props
   */
  'style/jsx-indent-props'?: Linter.RuleEntry<StyleJsxIndentProps>;
  /**
   * Enforce maximum of props on a single line in JSX
   * @see https://eslint.style/rules/jsx-max-props-per-line
   */
  'style/jsx-max-props-per-line'?: Linter.RuleEntry<StyleJsxMaxPropsPerLine>;
  /**
   * Require or prevent a new line after jsx elements and expressions.
   * @see https://eslint.style/rules/jsx-newline
   */
  'style/jsx-newline'?: Linter.RuleEntry<StyleJsxNewline>;
  /**
   * Require one JSX element per line
   * @see https://eslint.style/rules/jsx-one-expression-per-line
   */
  'style/jsx-one-expression-per-line'?: Linter.RuleEntry<StyleJsxOneExpressionPerLine>;
  /**
   * Enforce PascalCase for user-defined JSX components
   * @see https://eslint.style/rules/jsx-pascal-case
   */
  'style/jsx-pascal-case'?: Linter.RuleEntry<StyleJsxPascalCase>;
  /**
   * Disallow multiple spaces between inline JSX props. Deprecated, use `no-multi-spaces` rule instead.
   * @see https://eslint.style/rules/jsx-props-no-multi-spaces
   * @deprecated
   */
  'style/jsx-props-no-multi-spaces'?: Linter.RuleEntry<[]>;
  /**
   * Enforce the consistent use of either double or single quotes in JSX attributes
   * @see https://eslint.style/rules/jsx-quotes
   */
  'style/jsx-quotes'?: Linter.RuleEntry<StyleJsxQuotes>;
  /**
   * Disallow extra closing tags for components without children
   * @see https://eslint.style/rules/jsx-self-closing-comp
   */
  'style/jsx-self-closing-comp'?: Linter.RuleEntry<StyleJsxSelfClosingComp>;
  /**
   * Enforce props alphabetical sorting
   * @see https://eslint.style/rules/jsx-sort-props
   */
  'style/jsx-sort-props'?: Linter.RuleEntry<StyleJsxSortProps>;
  /**
   * Enforce whitespace in and around the JSX opening and closing brackets
   * @see https://eslint.style/rules/jsx-tag-spacing
   */
  'style/jsx-tag-spacing'?: Linter.RuleEntry<StyleJsxTagSpacing>;
  /**
   * Disallow missing parentheses around multiline JSX
   * @see https://eslint.style/rules/jsx-wrap-multilines
   */
  'style/jsx-wrap-multilines'?: Linter.RuleEntry<StyleJsxWrapMultilines>;
  /**
   * Enforce consistent spacing between property names and type annotations in types and interfaces
   * @see https://eslint.style/rules/key-spacing
   */
  'style/key-spacing'?: Linter.RuleEntry<StyleKeySpacing>;
  /**
   * Enforce consistent spacing before and after keywords
   * @see https://eslint.style/rules/keyword-spacing
   */
  'style/keyword-spacing'?: Linter.RuleEntry<StyleKeywordSpacing>;
  /**
   * Enforce position of line comments
   * @see https://eslint.style/rules/line-comment-position
   */
  'style/line-comment-position'?: Linter.RuleEntry<StyleLineCommentPosition>;
  /**
   * Enforce consistent linebreak style
   * @see https://eslint.style/rules/linebreak-style
   */
  'style/linebreak-style'?: Linter.RuleEntry<StyleLinebreakStyle>;
  /**
   * Require empty lines around comments
   * @see https://eslint.style/rules/lines-around-comment
   */
  'style/lines-around-comment'?: Linter.RuleEntry<StyleLinesAroundComment>;
  /**
   * Require or disallow an empty line between class members
   * @see https://eslint.style/rules/lines-between-class-members
   */
  'style/lines-between-class-members'?: Linter.RuleEntry<StyleLinesBetweenClassMembers>;
  /**
   * Enforce a maximum line length
   * @see https://eslint.style/rules/max-len
   */
  'style/max-len'?: Linter.RuleEntry<StyleMaxLen>;
  /**
   * Enforce a maximum number of statements allowed per line
   * @see https://eslint.style/rules/max-statements-per-line
   */
  'style/max-statements-per-line'?: Linter.RuleEntry<StyleMaxStatementsPerLine>;
  /**
   * Require a specific member delimiter style for interfaces and type literals
   * @see https://eslint.style/rules/member-delimiter-style
   */
  'style/member-delimiter-style'?: Linter.RuleEntry<StyleMemberDelimiterStyle>;
  /**
   * Enforce a particular style for multiline comments
   * @see https://eslint.style/rules/multiline-comment-style
   */
  'style/multiline-comment-style'?: Linter.RuleEntry<StyleMultilineCommentStyle>;
  /**
   * Enforce newlines between operands of ternary expressions
   * @see https://eslint.style/rules/multiline-ternary
   */
  'style/multiline-ternary'?: Linter.RuleEntry<StyleMultilineTernary>;
  /**
   * Enforce or disallow parentheses when invoking a constructor with no arguments
   * @see https://eslint.style/rules/new-parens
   */
  'style/new-parens'?: Linter.RuleEntry<StyleNewParens>;
  /**
   * Require a newline after each call in a method chain
   * @see https://eslint.style/rules/newline-per-chained-call
   */
  'style/newline-per-chained-call'?: Linter.RuleEntry<StyleNewlinePerChainedCall>;
  /**
   * Disallow arrow functions where they could be confused with comparisons
   * @see https://eslint.style/rules/no-confusing-arrow
   */
  'style/no-confusing-arrow'?: Linter.RuleEntry<StyleNoConfusingArrow>;
  /**
   * Disallow unnecessary parentheses
   * @see https://eslint.style/rules/no-extra-parens
   */
  'style/no-extra-parens'?: Linter.RuleEntry<StyleNoExtraParens>;
  /**
   * Disallow unnecessary semicolons
   * @see https://eslint.style/rules/no-extra-semi
   */
  'style/no-extra-semi'?: Linter.RuleEntry<[]>;
  /**
   * Disallow leading or trailing decimal points in numeric literals
   * @see https://eslint.style/rules/no-floating-decimal
   */
  'style/no-floating-decimal'?: Linter.RuleEntry<[]>;
  /**
   * Disallow mixed binary operators
   * @see https://eslint.style/rules/no-mixed-operators
   */
  'style/no-mixed-operators'?: Linter.RuleEntry<StyleNoMixedOperators>;
  /**
   * Disallow mixed spaces and tabs for indentation
   * @see https://eslint.style/rules/no-mixed-spaces-and-tabs
   */
  'style/no-mixed-spaces-and-tabs'?: Linter.RuleEntry<StyleNoMixedSpacesAndTabs>;
  /**
   * Disallow multiple spaces
   * @see https://eslint.style/rules/no-multi-spaces
   */
  'style/no-multi-spaces'?: Linter.RuleEntry<StyleNoMultiSpaces>;
  /**
   * Disallow multiple empty lines
   * @see https://eslint.style/rules/no-multiple-empty-lines
   */
  'style/no-multiple-empty-lines'?: Linter.RuleEntry<StyleNoMultipleEmptyLines>;
  /**
   * Disallow all tabs
   * @see https://eslint.style/rules/no-tabs
   */
  'style/no-tabs'?: Linter.RuleEntry<StyleNoTabs>;
  /**
   * Disallow trailing whitespace at the end of lines
   * @see https://eslint.style/rules/no-trailing-spaces
   */
  'style/no-trailing-spaces'?: Linter.RuleEntry<StyleNoTrailingSpaces>;
  /**
   * Disallow whitespace before properties
   * @see https://eslint.style/rules/no-whitespace-before-property
   */
  'style/no-whitespace-before-property'?: Linter.RuleEntry<[]>;
  /**
   * Enforce the location of single-line statements
   * @see https://eslint.style/rules/nonblock-statement-body-position
   */
  'style/nonblock-statement-body-position'?: Linter.RuleEntry<StyleNonblockStatementBodyPosition>;
  /**
   * Enforce consistent line breaks after opening and before closing braces
   * @see https://eslint.style/rules/object-curly-newline
   */
  'style/object-curly-newline'?: Linter.RuleEntry<StyleObjectCurlyNewline>;
  /**
   * Enforce consistent spacing inside braces
   * @see https://eslint.style/rules/object-curly-spacing
   */
  'style/object-curly-spacing'?: Linter.RuleEntry<StyleObjectCurlySpacing>;
  /**
   * Enforce placing object properties on separate lines
   * @see https://eslint.style/rules/object-property-newline
   */
  'style/object-property-newline'?: Linter.RuleEntry<StyleObjectPropertyNewline>;
  /**
   * Require or disallow newlines around variable declarations
   * @see https://eslint.style/rules/one-var-declaration-per-line
   */
  'style/one-var-declaration-per-line'?: Linter.RuleEntry<StyleOneVarDeclarationPerLine>;
  /**
   * Enforce consistent linebreak style for operators
   * @see https://eslint.style/rules/operator-linebreak
   */
  'style/operator-linebreak'?: Linter.RuleEntry<StyleOperatorLinebreak>;
  /**
   * Require or disallow padding within blocks
   * @see https://eslint.style/rules/padded-blocks
   */
  'style/padded-blocks'?: Linter.RuleEntry<StylePaddedBlocks>;
  /**
   * Require or disallow padding lines between statements
   * @see https://eslint.style/rules/padding-line-between-statements
   */
  'style/padding-line-between-statements'?: Linter.RuleEntry<StylePaddingLineBetweenStatements>;
  /**
   * Require quotes around object literal, type literal, interfaces and enums property names
   * @see https://eslint.style/rules/quote-props
   */
  'style/quote-props'?: Linter.RuleEntry<StyleQuoteProps>;
  /**
   * Enforce the consistent use of either backticks, double, or single quotes
   * @see https://eslint.style/rules/quotes
   */
  'style/quotes'?: Linter.RuleEntry<StyleQuotes>;
  /**
   * Enforce spacing between rest and spread operators and their expressions
   * @see https://eslint.style/rules/rest-spread-spacing
   */
  'style/rest-spread-spacing'?: Linter.RuleEntry<StyleRestSpreadSpacing>;
  /**
   * Require or disallow semicolons instead of ASI
   * @see https://eslint.style/rules/semi
   */
  'style/semi'?: Linter.RuleEntry<StyleSemi>;
  /**
   * Enforce consistent spacing before and after semicolons
   * @see https://eslint.style/rules/semi-spacing
   */
  'style/semi-spacing'?: Linter.RuleEntry<StyleSemiSpacing>;
  /**
   * Enforce location of semicolons
   * @see https://eslint.style/rules/semi-style
   */
  'style/semi-style'?: Linter.RuleEntry<StyleSemiStyle>;
  /**
   * Enforce consistent spacing before blocks
   * @see https://eslint.style/rules/space-before-blocks
   */
  'style/space-before-blocks'?: Linter.RuleEntry<StyleSpaceBeforeBlocks>;
  /**
   * Enforce consistent spacing before function parenthesis
   * @see https://eslint.style/rules/space-before-function-paren
   */
  'style/space-before-function-paren'?: Linter.RuleEntry<StyleSpaceBeforeFunctionParen>;
  /**
   * Enforce consistent spacing inside parentheses
   * @see https://eslint.style/rules/space-in-parens
   */
  'style/space-in-parens'?: Linter.RuleEntry<StyleSpaceInParens>;
  /**
   * Require spacing around infix operators
   * @see https://eslint.style/rules/space-infix-ops
   */
  'style/space-infix-ops'?: Linter.RuleEntry<StyleSpaceInfixOps>;
  /**
   * Enforce consistent spacing before or after unary operators
   * @see https://eslint.style/rules/space-unary-ops
   */
  'style/space-unary-ops'?: Linter.RuleEntry<StyleSpaceUnaryOps>;
  /**
   * Enforce consistent spacing after the `//` or `/*` in a comment
   * @see https://eslint.style/rules/spaced-comment
   */
  'style/spaced-comment'?: Linter.RuleEntry<StyleSpacedComment>;
  /**
   * Enforce spacing around colons of switch statements
   * @see https://eslint.style/rules/switch-colon-spacing
   */
  'style/switch-colon-spacing'?: Linter.RuleEntry<StyleSwitchColonSpacing>;
  /**
   * Require or disallow spacing around embedded expressions of template strings
   * @see https://eslint.style/rules/template-curly-spacing
   */
  'style/template-curly-spacing'?: Linter.RuleEntry<StyleTemplateCurlySpacing>;
  /**
   * Require or disallow spacing between template tags and their literals
   * @see https://eslint.style/rules/template-tag-spacing
   */
  'style/template-tag-spacing'?: Linter.RuleEntry<StyleTemplateTagSpacing>;
  /**
   * Require consistent spacing around type annotations
   * @see https://eslint.style/rules/type-annotation-spacing
   */
  'style/type-annotation-spacing'?: Linter.RuleEntry<StyleTypeAnnotationSpacing>;
  /**
   * Enforces consistent spacing inside TypeScript type generics
   * @see https://eslint.style/rules/type-generic-spacing
   */
  'style/type-generic-spacing'?: Linter.RuleEntry<[]>;
  /**
   * Expect space before the type declaration in the named tuple
   * @see https://eslint.style/rules/type-named-tuple-spacing
   */
  'style/type-named-tuple-spacing'?: Linter.RuleEntry<[]>;
  /**
   * Require parentheses around immediate `function` invocations
   * @see https://eslint.style/rules/wrap-iife
   */
  'style/wrap-iife'?: Linter.RuleEntry<StyleWrapIife>;
  /**
   * Require parenthesis around regex literals
   * @see https://eslint.style/rules/wrap-regex
   */
  'style/wrap-regex'?: Linter.RuleEntry<[]>;
  /**
   * Require or disallow spacing around the `*` in `yield*` expressions
   * @see https://eslint.style/rules/yield-star-spacing
   */
  'style/yield-star-spacing'?: Linter.RuleEntry<StyleYieldStarSpacing>;
  /**
   * disallow conditionals where the type is always truthy or always falsy
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/@typescript-eslint/no-unnecessary-condition/
   * @deprecated
   */
  'svelte/@typescript-eslint/no-unnecessary-condition'?: Linter.RuleEntry<SvelteTypescriptEslintNoUnnecessaryCondition>;
  /**
   * disallows the use of languages other than those specified in the configuration for the lang attribute of `<script>` and `<style>` blocks.
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/block-lang/
   */
  'svelte/block-lang'?: Linter.RuleEntry<SvelteBlockLang>;
  /**
   * disallow usage of button without an explicit type attribute
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/button-has-type/
   */
  'svelte/button-has-type'?: Linter.RuleEntry<SvelteButtonHasType>;
  /**
   * support comment-directives in HTML template
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/comment-directive/
   */
  'svelte/comment-directive'?: Linter.RuleEntry<SvelteCommentDirective>;
  /**
   * enforce a consistent style for CSS selectors
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/consistent-selector-style/
   */
  'svelte/consistent-selector-style'?: Linter.RuleEntry<SvelteConsistentSelectorStyle>;
  /**
   * derived store should use same variable names between values and callback
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/derived-has-same-inputs-outputs/
   */
  'svelte/derived-has-same-inputs-outputs'?: Linter.RuleEntry<[]>;
  /**
   * require slot type declaration using the `$$Slots` interface
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/experimental-require-slot-types/
   */
  'svelte/experimental-require-slot-types'?: Linter.RuleEntry<[]>;
  /**
   * require the strictEvents attribute on `<script>` tags
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/experimental-require-strict-events/
   */
  'svelte/experimental-require-strict-events'?: Linter.RuleEntry<[]>;
  /**
   * enforce the location of first attribute
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/first-attribute-linebreak/
   */
  'svelte/first-attribute-linebreak'?: Linter.RuleEntry<SvelteFirstAttributeLinebreak>;
  /**
   * Require or disallow a line break before tag's closing brackets
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/html-closing-bracket-new-line/
   */
  'svelte/html-closing-bracket-new-line'?: Linter.RuleEntry<SvelteHtmlClosingBracketNewLine>;
  /**
   * require or disallow a space before tag's closing brackets
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/html-closing-bracket-spacing/
   */
  'svelte/html-closing-bracket-spacing'?: Linter.RuleEntry<SvelteHtmlClosingBracketSpacing>;
  /**
   * enforce quotes style of HTML attributes
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/html-quotes/
   */
  'svelte/html-quotes'?: Linter.RuleEntry<SvelteHtmlQuotes>;
  /**
   * enforce self-closing style
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/html-self-closing/
   */
  'svelte/html-self-closing'?: Linter.RuleEntry<SvelteHtmlSelfClosing>;
  /**
   * enforce consistent indentation
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/indent/
   */
  'svelte/indent'?: Linter.RuleEntry<SvelteIndent>;
  /**
   * Svelte runtime prevents calling the same reactive statement twice in a microtask. But between different microtask, it doesn't prevent.
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/infinite-reactive-loop/
   */
  'svelte/infinite-reactive-loop'?: Linter.RuleEntry<[]>;
  /**
   * enforce the maximum number of attributes per line
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/max-attributes-per-line/
   */
  'svelte/max-attributes-per-line'?: Linter.RuleEntry<SvelteMaxAttributesPerLine>;
  /**
   * enforce unified spacing in mustache
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/mustache-spacing/
   */
  'svelte/mustache-spacing'?: Linter.RuleEntry<SvelteMustacheSpacing>;
  /**
   * Warns against the use of `addEventListener`
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-add-event-listener/
   */
  'svelte/no-add-event-listener'?: Linter.RuleEntry<[]>;
  /**
   * disallow the use of `{@debug}`
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-at-debug-tags/
   */
  'svelte/no-at-debug-tags'?: Linter.RuleEntry<[]>;
  /**
   * disallow use of `{@html}` to prevent XSS attack
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-at-html-tags/
   */
  'svelte/no-at-html-tags'?: Linter.RuleEntry<[]>;
  /**
   * disallow DOM manipulating
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-dom-manipulating/
   */
  'svelte/no-dom-manipulating'?: Linter.RuleEntry<[]>;
  /**
   * disallow duplicate conditions in `{#if}` / `{:else if}` chains
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-dupe-else-if-blocks/
   */
  'svelte/no-dupe-else-if-blocks'?: Linter.RuleEntry<[]>;
  /**
   * disallow duplicate `on:` directives
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-dupe-on-directives/
   */
  'svelte/no-dupe-on-directives'?: Linter.RuleEntry<[]>;
  /**
   * disallow duplicate style properties
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-dupe-style-properties/
   */
  'svelte/no-dupe-style-properties'?: Linter.RuleEntry<[]>;
  /**
   * disallow duplicate `use:` directives
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-dupe-use-directives/
   */
  'svelte/no-dupe-use-directives'?: Linter.RuleEntry<[]>;
  /**
   * disallow dynamic slot name
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-dynamic-slot-name/
   * @deprecated
   */
  'svelte/no-dynamic-slot-name'?: Linter.RuleEntry<[]>;
  /**
   * disallow exporting load functions in `*.svelte` module in SvelteKit page components.
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-export-load-in-svelte-module-in-kit-pages/
   */
  'svelte/no-export-load-in-svelte-module-in-kit-pages'?: Linter.RuleEntry<[]>;
  /**
   * disallow wrapping single reactive statements in curly braces
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-extra-reactive-curlies/
   */
  'svelte/no-extra-reactive-curlies'?: Linter.RuleEntry<[]>;
  /**
   * disallow using goto() without the base path
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-goto-without-base/
   * @deprecated
   */
  'svelte/no-goto-without-base'?: Linter.RuleEntry<[]>;
  /**
   * disallow ignoring the unsubscribe method returned by the `subscribe()` on Svelte stores.
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-ignored-unsubscribe/
   */
  'svelte/no-ignored-unsubscribe'?: Linter.RuleEntry<[]>;
  /**
   * disallow reactive statements that don't reference reactive values.
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-immutable-reactive-statements/
   */
  'svelte/no-immutable-reactive-statements'?: Linter.RuleEntry<[]>;
  /**
   * disallow attributes and directives that produce inline styles
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-inline-styles/
   */
  'svelte/no-inline-styles'?: Linter.RuleEntry<SvelteNoInlineStyles>;
  /**
   * disallow variable or `function` declarations in nested blocks
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-inner-declarations/
   */
  'svelte/no-inner-declarations'?: Linter.RuleEntry<SvelteNoInnerDeclarations>;
  /**
   * Warns against the use of `$inspect` directive
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-inspect/
   */
  'svelte/no-inspect'?: Linter.RuleEntry<[]>;
  /**
   * disallow using navigation (links, goto, pushState, replaceState) without the base path
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-navigation-without-base/
   * @deprecated
   */
  'svelte/no-navigation-without-base'?: Linter.RuleEntry<SvelteNoNavigationWithoutBase>;
  /**
   * disallow using navigation (links, goto, pushState, replaceState) without a resolve()
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-navigation-without-resolve/
   */
  'svelte/no-navigation-without-resolve'?: Linter.RuleEntry<SvelteNoNavigationWithoutResolve>;
  /**
   * disallow use of not function in event handler
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-not-function-handler/
   */
  'svelte/no-not-function-handler'?: Linter.RuleEntry<[]>;
  /**
   * disallow objects in text mustache interpolation
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-object-in-text-mustaches/
   */
  'svelte/no-object-in-text-mustaches'?: Linter.RuleEntry<[]>;
  /**
   * Checks for invalid raw HTML elements
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-raw-special-elements/
   */
  'svelte/no-raw-special-elements'?: Linter.RuleEntry<[]>;
  /**
   * it's not necessary to define functions in reactive statements
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-reactive-functions/
   */
  'svelte/no-reactive-functions'?: Linter.RuleEntry<[]>;
  /**
   * don't assign literal values in reactive statements
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-reactive-literals/
   */
  'svelte/no-reactive-literals'?: Linter.RuleEntry<[]>;
  /**
   * disallow reassigning reactive values
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-reactive-reassign/
   */
  'svelte/no-reactive-reassign'?: Linter.RuleEntry<SvelteNoReactiveReassign>;
  /**
   * disallow specific HTML elements
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-restricted-html-elements/
   */
  'svelte/no-restricted-html-elements'?: Linter.RuleEntry<SvelteNoRestrictedHtmlElements>;
  /**
   * disallow shorthand style properties that override related longhand properties
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-shorthand-style-property-overrides/
   */
  'svelte/no-shorthand-style-property-overrides'?: Linter.RuleEntry<[]>;
  /**
   * disallow spaces around equal signs in attribute
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-spaces-around-equal-signs-in-attribute/
   */
  'svelte/no-spaces-around-equal-signs-in-attribute'?: Linter.RuleEntry<[]>;
  /**
   * disallow using async/await inside svelte stores because it causes issues with the auto-unsubscribing features
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-store-async/
   */
  'svelte/no-store-async'?: Linter.RuleEntry<[]>;
  /**
   * svelte/internal will be removed in Svelte 6.
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-svelte-internal/
   */
  'svelte/no-svelte-internal'?: Linter.RuleEntry<[]>;
  /**
   * disallow `target="_blank"` attribute without `rel="noopener noreferrer"`
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-target-blank/
   */
  'svelte/no-target-blank'?: Linter.RuleEntry<SvelteNoTargetBlank>;
  /**
   * disallow using top-level browser global variables
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-top-level-browser-globals/
   */
  'svelte/no-top-level-browser-globals'?: Linter.RuleEntry<[]>;
  /**
   * disallow trailing whitespace at the end of lines
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-trailing-spaces/
   */
  'svelte/no-trailing-spaces'?: Linter.RuleEntry<SvelteNoTrailingSpaces>;
  /**
   * disallow unknown `style:property`
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-unknown-style-directive-property/
   */
  'svelte/no-unknown-style-directive-property'?: Linter.RuleEntry<SvelteNoUnknownStyleDirectiveProperty>;
  /**
   * Disallow unnecessary $state wrapping of reactive classes
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-unnecessary-state-wrap/
   */
  'svelte/no-unnecessary-state-wrap'?: Linter.RuleEntry<SvelteNoUnnecessaryStateWrap>;
  /**
   * disallow the use of a class in the template without a corresponding style
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-unused-class-name/
   */
  'svelte/no-unused-class-name'?: Linter.RuleEntry<SvelteNoUnusedClassName>;
  /**
   * Warns about defined Props properties that are unused
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-unused-props/
   */
  'svelte/no-unused-props'?: Linter.RuleEntry<SvelteNoUnusedProps>;
  /**
   * disallow unused svelte-ignore comments
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-unused-svelte-ignore/
   */
  'svelte/no-unused-svelte-ignore'?: Linter.RuleEntry<[]>;
  /**
   * disallow explicit children snippet where it's not needed
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-useless-children-snippet/
   */
  'svelte/no-useless-children-snippet'?: Linter.RuleEntry<[]>;
  /**
   * disallow unnecessary mustache interpolations
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/no-useless-mustaches/
   */
  'svelte/no-useless-mustaches'?: Linter.RuleEntry<SvelteNoUselessMustaches>;
  /**
   * require class directives instead of ternary expressions
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/prefer-class-directive/
   */
  'svelte/prefer-class-directive'?: Linter.RuleEntry<SveltePreferClassDirective>;
  /**
   * Require `const` declarations for variables that are never reassigned after declared
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/prefer-const/
   */
  'svelte/prefer-const'?: Linter.RuleEntry<SveltePreferConst>;
  /**
   * destructure values from object stores for better change tracking & fewer redraws
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/prefer-destructured-store-props/
   */
  'svelte/prefer-destructured-store-props'?: Linter.RuleEntry<[]>;
  /**
   * require style directives instead of style attribute
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/prefer-style-directive/
   */
  'svelte/prefer-style-directive'?: Linter.RuleEntry<[]>;
  /**
   * disallow using mutable instances of built-in classes where a reactive alternative is provided by svelte/reactivity
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/prefer-svelte-reactivity/
   */
  'svelte/prefer-svelte-reactivity'?: Linter.RuleEntry<[]>;
  /**
   * Prefer using writable $derived instead of $state and $effect
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/prefer-writable-derived/
   */
  'svelte/prefer-writable-derived'?: Linter.RuleEntry<[]>;
  /**
   * require keyed `{#each}` block
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/require-each-key/
   */
  'svelte/require-each-key'?: Linter.RuleEntry<[]>;
  /**
   * require type parameters for `createEventDispatcher`
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/require-event-dispatcher-types/
   */
  'svelte/require-event-dispatcher-types'?: Linter.RuleEntry<[]>;
  /**
   * require component event names to start with "on"
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/require-event-prefix/
   */
  'svelte/require-event-prefix'?: Linter.RuleEntry<SvelteRequireEventPrefix>;
  /**
   * require style attributes that can be optimized
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/require-optimized-style-attribute/
   */
  'svelte/require-optimized-style-attribute'?: Linter.RuleEntry<[]>;
  /**
   * store callbacks must use `set` param
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/require-store-callbacks-use-set-param/
   */
  'svelte/require-store-callbacks-use-set-param'?: Linter.RuleEntry<[]>;
  /**
   * disallow to use of the store itself as an operand. Need to use $ prefix or get function.
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/require-store-reactive-access/
   */
  'svelte/require-store-reactive-access'?: Linter.RuleEntry<[]>;
  /**
   * require initial value in store
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/require-stores-init/
   */
  'svelte/require-stores-init'?: Linter.RuleEntry<[]>;
  /**
   * enforce use of shorthand syntax in attribute
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/shorthand-attribute/
   */
  'svelte/shorthand-attribute'?: Linter.RuleEntry<SvelteShorthandAttribute>;
  /**
   * enforce use of shorthand syntax in directives
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/shorthand-directive/
   */
  'svelte/shorthand-directive'?: Linter.RuleEntry<SvelteShorthandDirective>;
  /**
   * enforce order of attributes
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/sort-attributes/
   */
  'svelte/sort-attributes'?: Linter.RuleEntry<SvelteSortAttributes>;
  /**
   * enforce consistent spacing after the `<!--` and before the `-->` in a HTML comment
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/spaced-html-comment/
   */
  'svelte/spaced-html-comment'?: Linter.RuleEntry<SvelteSpacedHtmlComment>;
  /**
   * system rule for working this plugin
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/system/
   */
  'svelte/system'?: Linter.RuleEntry<[]>;
  /**
   * disallow warnings when compiling.
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/valid-compile/
   */
  'svelte/valid-compile'?: Linter.RuleEntry<SvelteValidCompile>;
  /**
   * enforce keys to use variables defined in the `{#each}` block
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/valid-each-key/
   */
  'svelte/valid-each-key'?: Linter.RuleEntry<[]>;
  /**
   * disallow props other than data or errors in SvelteKit page components.
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/valid-prop-names-in-kit-pages/
   */
  'svelte/valid-prop-names-in-kit-pages'?: Linter.RuleEntry<[]>;
  /**
   * require valid style element parsing
   * @see https://sveltejs.github.io/eslint-plugin-svelte/rules/valid-style-parse/
   */
  'svelte/valid-style-parse'?: Linter.RuleEntry<[]>;
  /**
   * Enforce spacing around colons of switch statements
   * @see https://eslint.org/docs/latest/rules/switch-colon-spacing
   * @deprecated
   */
  'switch-colon-spacing'?: Linter.RuleEntry<SwitchColonSpacing>;
  /**
   * Require symbol descriptions
   * @see https://eslint.org/docs/latest/rules/symbol-description
   */
  'symbol-description'?: Linter.RuleEntry<[]>;
  /**
   * Require or disallow spacing around embedded expressions of template strings
   * @see https://eslint.org/docs/latest/rules/template-curly-spacing
   * @deprecated
   */
  'template-curly-spacing'?: Linter.RuleEntry<TemplateCurlySpacing>;
  /**
   * Require or disallow spacing between template tags and their literals
   * @see https://eslint.org/docs/latest/rules/template-tag-spacing
   * @deprecated
   */
  'template-tag-spacing'?: Linter.RuleEntry<TemplateTagSpacing>;
  /**
   * enforce using `.each` or `.for` consistently
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/consistent-each-for.md
   */
  'test/consistent-each-for'?: Linter.RuleEntry<TestConsistentEachFor>;
  /**
   * require test file pattern
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/consistent-test-filename.md
   */
  'test/consistent-test-filename'?: Linter.RuleEntry<TestConsistentTestFilename>;
  /**
   * enforce using test or it but not both
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/consistent-test-it.md
   */
  'test/consistent-test-it'?: Linter.RuleEntry<TestConsistentTestIt>;
  /**
   * enforce using vitest or vi but not both
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/consistent-vitest-vi.md
   */
  'test/consistent-vitest-vi'?: Linter.RuleEntry<TestConsistentVitestVi>;
  /**
   * enforce having expectation in test body
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/expect-expect.md
   */
  'test/expect-expect'?: Linter.RuleEntry<TestExpectExpect>;
  /**
   * enforce hoisted APIs to be on top of the file
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/hoisted-apis-on-top.md
   */
  'test/hoisted-apis-on-top'?: Linter.RuleEntry<[]>;
  /**
   * enforce a maximum number of expect per test
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/max-expects.md
   */
  'test/max-expects'?: Linter.RuleEntry<TestMaxExpects>;
  /**
   * require describe block to be less than set max value or default value
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/max-nested-describe.md
   */
  'test/max-nested-describe'?: Linter.RuleEntry<TestMaxNestedDescribe>;
  /**
   * disallow alias methods
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-alias-methods.md
   */
  'test/no-alias-methods'?: Linter.RuleEntry<[]>;
  /**
   * disallow commented out tests
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-commented-out-tests.md
   */
  'test/no-commented-out-tests'?: Linter.RuleEntry<[]>;
  /**
   * disallow conditional expects
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-conditional-expect.md
   */
  'test/no-conditional-expect'?: Linter.RuleEntry<[]>;
  /**
   * disallow conditional tests
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-conditional-in-test.md
   */
  'test/no-conditional-in-test'?: Linter.RuleEntry<[]>;
  /**
   * disallow conditional tests
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-conditional-tests.md
   */
  'test/no-conditional-tests'?: Linter.RuleEntry<[]>;
  /**
   * disallow disabled tests
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-disabled-tests.md
   */
  'test/no-disabled-tests'?: Linter.RuleEntry<[]>;
  /**
   * disallow using a callback in asynchronous tests and hooks
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-done-callback.md
   * @deprecated
   */
  'test/no-done-callback'?: Linter.RuleEntry<[]>;
  /**
   * disallow duplicate hooks and teardown hooks
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-duplicate-hooks.md
   */
  'test/no-duplicate-hooks'?: Linter.RuleEntry<[]>;
  /**
   * disallow focused tests
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-focused-tests.md
   */
  'test/no-focused-tests'?: Linter.RuleEntry<TestNoFocusedTests>;
  /**
   * disallow setup and teardown hooks
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-hooks.md
   */
  'test/no-hooks'?: Linter.RuleEntry<TestNoHooks>;
  /**
   * disallow identical titles
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-identical-title.md
   */
  'test/no-identical-title'?: Linter.RuleEntry<[]>;
  /**
   * disallow importing `node:test`
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-import-node-test.md
   */
  'test/no-import-node-test'?: Linter.RuleEntry<[]>;
  /**
   * disallow importing Vitest globals
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-importing-vitest-globals.md
   */
  'test/no-importing-vitest-globals'?: Linter.RuleEntry<[]>;
  /**
   * disallow string interpolation in snapshots
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-interpolation-in-snapshots.md
   */
  'test/no-interpolation-in-snapshots'?: Linter.RuleEntry<[]>;
  /**
   * disallow large snapshots
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-large-snapshots.md
   */
  'test/no-large-snapshots'?: Linter.RuleEntry<TestNoLargeSnapshots>;
  /**
   * disallow importing from __mocks__ directory
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-mocks-import.md
   */
  'test/no-mocks-import'?: Linter.RuleEntry<[]>;
  /**
   * disallow .only blocks in tests
   * @see https://github.com/levibuzolic/eslint-plugin-no-only-tests
   */
  'test/no-only-tests'?: Linter.RuleEntry<TestNoOnlyTests>;
  /**
   * disallow the use of certain matchers
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-restricted-matchers.md
   */
  'test/no-restricted-matchers'?: Linter.RuleEntry<TestNoRestrictedMatchers>;
  /**
   * disallow specific `vi.` methods
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-restricted-vi-methods.md
   */
  'test/no-restricted-vi-methods'?: Linter.RuleEntry<TestNoRestrictedViMethods>;
  /**
   * disallow using `expect` outside of `it` or `test` blocks
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-standalone-expect.md
   */
  'test/no-standalone-expect'?: Linter.RuleEntry<TestNoStandaloneExpect>;
  /**
   * disallow using the `f` and `x` prefixes in favour of `.only` and `.skip`
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-test-prefixes.md
   */
  'test/no-test-prefixes'?: Linter.RuleEntry<[]>;
  /**
   * disallow return statements in tests
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-test-return-statement.md
   */
  'test/no-test-return-statement'?: Linter.RuleEntry<[]>;
  /**
   * Disallow unnecessary async function wrapper for expected promises
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/no-unneeded-async-expect-function.md
   */
  'test/no-unneeded-async-expect-function'?: Linter.RuleEntry<[]>;
  /**
   * Enforce padding around `afterAll` blocks
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/padding-around-after-all-blocks.md
   */
  'test/padding-around-after-all-blocks'?: Linter.RuleEntry<[]>;
  /**
   * Enforce padding around `afterEach` blocks
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/padding-around-after-each-blocks.md
   */
  'test/padding-around-after-each-blocks'?: Linter.RuleEntry<[]>;
  /**
   * Enforce padding around vitest functions
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/padding-around-all.md
   */
  'test/padding-around-all'?: Linter.RuleEntry<[]>;
  /**
   * Enforce padding around `beforeAll` blocks
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/padding-around-before-all-blocks.md
   */
  'test/padding-around-before-all-blocks'?: Linter.RuleEntry<[]>;
  /**
   * Enforce padding around `beforeEach` blocks
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/padding-around-before-each-blocks.md
   */
  'test/padding-around-before-each-blocks'?: Linter.RuleEntry<[]>;
  /**
   * Enforce padding around `describe` blocks
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/padding-around-describe-blocks.md
   */
  'test/padding-around-describe-blocks'?: Linter.RuleEntry<[]>;
  /**
   * Enforce padding around `expect` groups
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/padding-around-expect-groups.md
   */
  'test/padding-around-expect-groups'?: Linter.RuleEntry<[]>;
  /**
   * Enforce padding around `test` blocks
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/padding-around-test-blocks.md
   */
  'test/padding-around-test-blocks'?: Linter.RuleEntry<[]>;
  /**
   * Prefer `toHaveBeenCalledExactlyOnceWith` over `toHaveBeenCalledOnce` and `toHaveBeenCalledWith`
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-called-exactly-once-with.md
   */
  'test/prefer-called-exactly-once-with'?: Linter.RuleEntry<[]>;
  /**
   * enforce using `toBeCalledOnce()` or `toHaveBeenCalledOnce()`
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-called-once.md
   */
  'test/prefer-called-once'?: Linter.RuleEntry<[]>;
  /**
   * enforce using `toBeCalledTimes(1)` or `toHaveBeenCalledTimes(1)`
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-called-times.md
   */
  'test/prefer-called-times'?: Linter.RuleEntry<[]>;
  /**
   * enforce using `toBeCalledWith()` or `toHaveBeenCalledWith()`
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-called-with.md
   */
  'test/prefer-called-with'?: Linter.RuleEntry<[]>;
  /**
   * enforce using the built-in comparison matchers
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-comparison-matcher.md
   */
  'test/prefer-comparison-matcher'?: Linter.RuleEntry<[]>;
  /**
   * enforce using a function as a describe title over an equivalent string
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-describe-function-title.md
   */
  'test/prefer-describe-function-title'?: Linter.RuleEntry<[]>;
  /**
   * enforce using `each` rather than manual loops
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-each.md
   */
  'test/prefer-each'?: Linter.RuleEntry<[]>;
  /**
   * enforce using the built-in equality matchers
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-equality-matcher.md
   */
  'test/prefer-equality-matcher'?: Linter.RuleEntry<[]>;
  /**
   * enforce using expect assertions instead of callbacks
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-expect-assertions.md
   */
  'test/prefer-expect-assertions'?: Linter.RuleEntry<TestPreferExpectAssertions>;
  /**
   * enforce using `expect().resolves` over `expect(await ...)` syntax
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-expect-resolves.md
   */
  'test/prefer-expect-resolves'?: Linter.RuleEntry<[]>;
  /**
   * enforce using `expectTypeOf` instead of `expect(typeof ...)`
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-expect-type-of.md
   */
  'test/prefer-expect-type-of'?: Linter.RuleEntry<[]>;
  /**
   * enforce having hooks in consistent order
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-hooks-in-order.md
   */
  'test/prefer-hooks-in-order'?: Linter.RuleEntry<[]>;
  /**
   * enforce having hooks before any test cases
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-hooks-on-top.md
   */
  'test/prefer-hooks-on-top'?: Linter.RuleEntry<[]>;
  /**
   * prefer dynamic import in mock
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-import-in-mock.md
   */
  'test/prefer-import-in-mock'?: Linter.RuleEntry<[]>;
  /**
   * enforce importing Vitest globals
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-importing-vitest-globals.md
   */
  'test/prefer-importing-vitest-globals'?: Linter.RuleEntry<[]>;
  /**
   * enforce lowercase titles
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-lowercase-title.md
   */
  'test/prefer-lowercase-title'?: Linter.RuleEntry<TestPreferLowercaseTitle>;
  /**
   * enforce mock resolved/rejected shorthands for promises
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-mock-promise-shorthand.md
   */
  'test/prefer-mock-promise-shorthand'?: Linter.RuleEntry<[]>;
  /**
   * enforce including a hint with external snapshots
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-snapshot-hint.md
   */
  'test/prefer-snapshot-hint'?: Linter.RuleEntry<TestPreferSnapshotHint>;
  /**
   * enforce using `vi.spyOn`
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-spy-on.md
   */
  'test/prefer-spy-on'?: Linter.RuleEntry<[]>;
  /**
   * enforce using `toBe(true)` and `toBe(false)` over matchers that coerce types to boolean
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-strict-boolean-matchers.md
   */
  'test/prefer-strict-boolean-matchers'?: Linter.RuleEntry<[]>;
  /**
   * enforce strict equal over equal
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-strict-equal.md
   */
  'test/prefer-strict-equal'?: Linter.RuleEntry<[]>;
  /**
   * enforce using toBe()
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-to-be.md
   */
  'test/prefer-to-be'?: Linter.RuleEntry<[]>;
  /**
   * enforce using toBeFalsy()
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-to-be-falsy.md
   */
  'test/prefer-to-be-falsy'?: Linter.RuleEntry<[]>;
  /**
   * enforce using toBeObject()
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-to-be-object.md
   */
  'test/prefer-to-be-object'?: Linter.RuleEntry<[]>;
  /**
   * enforce using `toBeTruthy`
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-to-be-truthy.md
   */
  'test/prefer-to-be-truthy'?: Linter.RuleEntry<[]>;
  /**
   * enforce using toContain()
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-to-contain.md
   */
  'test/prefer-to-contain'?: Linter.RuleEntry<[]>;
  /**
   * enforce using toHaveLength()
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-to-have-length.md
   */
  'test/prefer-to-have-length'?: Linter.RuleEntry<[]>;
  /**
   * enforce using `test.todo`
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-todo.md
   */
  'test/prefer-todo'?: Linter.RuleEntry<[]>;
  /**
   * require `vi.mocked()` over `fn as Mock`
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-vi-mocked.md
   */
  'test/prefer-vi-mocked'?: Linter.RuleEntry<[]>;
  /**
   * ensure that every `expect.poll` call is awaited
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/require-awaited-expect-poll.md
   */
  'test/require-awaited-expect-poll'?: Linter.RuleEntry<[]>;
  /**
   * require setup and teardown to be within a hook
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/require-hook.md
   */
  'test/require-hook'?: Linter.RuleEntry<TestRequireHook>;
  /**
   * require usage of import in vi.mock()
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/require-import-vi-mock.md
   */
  'test/require-import-vi-mock'?: Linter.RuleEntry<[]>;
  /**
   * require local Test Context for concurrent snapshot tests
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/require-local-test-context-for-concurrent-snapshots.md
   */
  'test/require-local-test-context-for-concurrent-snapshots'?: Linter.RuleEntry<[]>;
  /**
   * enforce using type parameters with vitest mock functions
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/require-mock-type-parameters.md
   */
  'test/require-mock-type-parameters'?: Linter.RuleEntry<TestRequireMockTypeParameters>;
  /**
   * require toThrow() to be called with an error message
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/require-to-throw-message.md
   */
  'test/require-to-throw-message'?: Linter.RuleEntry<[]>;
  /**
   * enforce that all tests are in a top-level describe
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/require-top-level-describe.md
   */
  'test/require-top-level-describe'?: Linter.RuleEntry<TestRequireTopLevelDescribe>;
  /**
   * enforce valid describe callback
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/valid-describe-callback.md
   */
  'test/valid-describe-callback'?: Linter.RuleEntry<[]>;
  /**
   * enforce valid `expect()` usage
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/valid-expect.md
   */
  'test/valid-expect'?: Linter.RuleEntry<TestValidExpect>;
  /**
   * require promises that have expectations in their chain to be valid
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/valid-expect-in-promise.md
   */
  'test/valid-expect-in-promise'?: Linter.RuleEntry<[]>;
  /**
   * enforce valid titles
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/valid-title.md
   */
  'test/valid-title'?: Linter.RuleEntry<TestValidTitle>;
  /**
   * disallow `.todo` usage
   * @see https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/warn-todo.md
   */
  'test/warn-todo'?: Linter.RuleEntry<[]>;
  /**
   * enforce linebreaks after opening and before closing array brackets
   * @see https://ota-meshi.github.io/eslint-plugin-toml/rules/array-bracket-newline.html
   */
  'toml/array-bracket-newline'?: Linter.RuleEntry<TomlArrayBracketNewline>;
  /**
   * enforce consistent spacing inside array brackets
   * @see https://ota-meshi.github.io/eslint-plugin-toml/rules/array-bracket-spacing.html
   */
  'toml/array-bracket-spacing'?: Linter.RuleEntry<TomlArrayBracketSpacing>;
  /**
   * enforce line breaks between array elements
   * @see https://ota-meshi.github.io/eslint-plugin-toml/rules/array-element-newline.html
   */
  'toml/array-element-newline'?: Linter.RuleEntry<TomlArrayElementNewline>;
  /**
   * enforce consistent comma style in array
   * @see https://ota-meshi.github.io/eslint-plugin-toml/rules/comma-style.html
   */
  'toml/comma-style'?: Linter.RuleEntry<TomlCommaStyle>;
  /**
   * enforce consistent indentation
   * @see https://ota-meshi.github.io/eslint-plugin-toml/rules/indent.html
   */
  'toml/indent'?: Linter.RuleEntry<TomlIndent>;
  /**
   * enforce consistent spacing inside braces
   * @see https://ota-meshi.github.io/eslint-plugin-toml/rules/inline-table-curly-spacing.html
   */
  'toml/inline-table-curly-spacing'?: Linter.RuleEntry<TomlInlineTableCurlySpacing>;
  /**
   * enforce consistent spacing between keys and values in key/value pairs
   * @see https://ota-meshi.github.io/eslint-plugin-toml/rules/key-spacing.html
   */
  'toml/key-spacing'?: Linter.RuleEntry<TomlKeySpacing>;
  /**
   * disallow defining pair keys out-of-order
   * @see https://ota-meshi.github.io/eslint-plugin-toml/rules/keys-order.html
   */
  'toml/keys-order'?: Linter.RuleEntry<[]>;
  /**
   * disallow mixed data types in array
   * @see https://ota-meshi.github.io/eslint-plugin-toml/rules/no-mixed-type-in-array.html
   */
  'toml/no-mixed-type-in-array'?: Linter.RuleEntry<TomlNoMixedTypeInArray>;
  /**
   * disallow hexadecimal, octal and binary integer
   * @see https://ota-meshi.github.io/eslint-plugin-toml/rules/no-non-decimal-integer.html
   */
  'toml/no-non-decimal-integer'?: Linter.RuleEntry<TomlNoNonDecimalInteger>;
  /**
   * disallow spacing around infix operators
   * @see https://ota-meshi.github.io/eslint-plugin-toml/rules/no-space-dots.html
   */
  'toml/no-space-dots'?: Linter.RuleEntry<[]>;
  /**
   * disallow number separators that to not enhance readability.
   * @see https://ota-meshi.github.io/eslint-plugin-toml/rules/no-unreadable-number-separator.html
   */
  'toml/no-unreadable-number-separator'?: Linter.RuleEntry<[]>;
  /**
   * require or disallow padding lines between pairs
   * @see https://ota-meshi.github.io/eslint-plugin-toml/rules/padding-line-between-pairs.html
   */
  'toml/padding-line-between-pairs'?: Linter.RuleEntry<[]>;
  /**
   * require or disallow padding lines between tables
   * @see https://ota-meshi.github.io/eslint-plugin-toml/rules/padding-line-between-tables.html
   */
  'toml/padding-line-between-tables'?: Linter.RuleEntry<[]>;
  /**
   * disallow precision of fractional seconds greater than the specified value.
   * @see https://ota-meshi.github.io/eslint-plugin-toml/rules/precision-of-fractional-seconds.html
   */
  'toml/precision-of-fractional-seconds'?: Linter.RuleEntry<TomlPrecisionOfFractionalSeconds>;
  /**
   * disallow precision of integer greater than the specified value.
   * @see https://ota-meshi.github.io/eslint-plugin-toml/rules/precision-of-integer.html
   */
  'toml/precision-of-integer'?: Linter.RuleEntry<TomlPrecisionOfInteger>;
  /**
   * require or disallow quotes around keys
   * @see https://ota-meshi.github.io/eslint-plugin-toml/rules/quoted-keys.html
   */
  'toml/quoted-keys'?: Linter.RuleEntry<TomlQuotedKeys>;
  /**
   * require spacing around equals sign
   * @see https://ota-meshi.github.io/eslint-plugin-toml/rules/space-eq-sign.html
   * @deprecated
   */
  'toml/space-eq-sign'?: Linter.RuleEntry<[]>;
  /**
   * enforce consistent spacing after the `#` in a comment
   * @see https://ota-meshi.github.io/eslint-plugin-toml/rules/spaced-comment.html
   */
  'toml/spaced-comment'?: Linter.RuleEntry<TomlSpacedComment>;
  /**
   * enforce consistent spacing inside table brackets
   * @see https://ota-meshi.github.io/eslint-plugin-toml/rules/table-bracket-spacing.html
   */
  'toml/table-bracket-spacing'?: Linter.RuleEntry<TomlTableBracketSpacing>;
  /**
   * disallow defining tables out-of-order
   * @see https://ota-meshi.github.io/eslint-plugin-toml/rules/tables-order.html
   */
  'toml/tables-order'?: Linter.RuleEntry<[]>;
  /**
   * disallow parsing errors in Vue custom blocks
   * @see https://ota-meshi.github.io/eslint-plugin-toml/rules/vue-custom-block/no-parsing-error.html
   */
  'toml/vue-custom-block/no-parsing-error'?: Linter.RuleEntry<[]>;
  /**
   * Require that function overload signatures be consecutive
   * @see https://typescript-eslint.io/rules/adjacent-overload-signatures
   */
  'ts/adjacent-overload-signatures'?: Linter.RuleEntry<[]>;
  /**
   * Require consistently using either `T[]` or `Array<T>` for arrays
   * @see https://typescript-eslint.io/rules/array-type
   */
  'ts/array-type'?: Linter.RuleEntry<TsArrayType>;
  /**
   * Disallow awaiting a value that is not a Thenable
   * @see https://typescript-eslint.io/rules/await-thenable
   */
  'ts/await-thenable'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `@ts-<directive>` comments or require descriptions after directives
   * @see https://typescript-eslint.io/rules/ban-ts-comment
   */
  'ts/ban-ts-comment'?: Linter.RuleEntry<TsBanTsComment>;
  /**
   * Disallow `// tslint:<rule-flag>` comments
   * @see https://typescript-eslint.io/rules/ban-tslint-comment
   */
  'ts/ban-tslint-comment'?: Linter.RuleEntry<[]>;
  /**
   * Enforce that literals on classes are exposed in a consistent style
   * @see https://typescript-eslint.io/rules/class-literal-property-style
   */
  'ts/class-literal-property-style'?: Linter.RuleEntry<TsClassLiteralPropertyStyle>;
  /**
   * Enforce that class methods utilize `this`
   * @see https://typescript-eslint.io/rules/class-methods-use-this
   */
  'ts/class-methods-use-this'?: Linter.RuleEntry<TsClassMethodsUseThis>;
  /**
   * Enforce specifying generic type arguments on type annotation or constructor name of a constructor call
   * @see https://typescript-eslint.io/rules/consistent-generic-constructors
   */
  'ts/consistent-generic-constructors'?: Linter.RuleEntry<TsConsistentGenericConstructors>;
  /**
   * Require or disallow the `Record` type
   * @see https://typescript-eslint.io/rules/consistent-indexed-object-style
   */
  'ts/consistent-indexed-object-style'?: Linter.RuleEntry<TsConsistentIndexedObjectStyle>;
  /**
   * Require `return` statements to either always or never specify values
   * @see https://typescript-eslint.io/rules/consistent-return
   */
  'ts/consistent-return'?: Linter.RuleEntry<TsConsistentReturn>;
  /**
   * Enforce consistent usage of type assertions
   * @see https://typescript-eslint.io/rules/consistent-type-assertions
   */
  'ts/consistent-type-assertions'?: Linter.RuleEntry<TsConsistentTypeAssertions>;
  /**
   * Enforce type definitions to consistently use either `interface` or `type`
   * @see https://typescript-eslint.io/rules/consistent-type-definitions
   */
  'ts/consistent-type-definitions'?: Linter.RuleEntry<TsConsistentTypeDefinitions>;
  /**
   * Enforce consistent usage of type exports
   * @see https://typescript-eslint.io/rules/consistent-type-exports
   */
  'ts/consistent-type-exports'?: Linter.RuleEntry<TsConsistentTypeExports>;
  /**
   * Enforce consistent usage of type imports
   * @see https://typescript-eslint.io/rules/consistent-type-imports
   */
  'ts/consistent-type-imports'?: Linter.RuleEntry<TsConsistentTypeImports>;
  /**
   * Enforce default parameters to be last
   * @see https://typescript-eslint.io/rules/default-param-last
   */
  'ts/default-param-last'?: Linter.RuleEntry<[]>;
  /**
   * Enforce dot notation whenever possible
   * @see https://typescript-eslint.io/rules/dot-notation
   */
  'ts/dot-notation'?: Linter.RuleEntry<TsDotNotation>;
  /**
   * Require explicit return types on functions and class methods
   * @see https://typescript-eslint.io/rules/explicit-function-return-type
   */
  'ts/explicit-function-return-type'?: Linter.RuleEntry<TsExplicitFunctionReturnType>;
  /**
   * Require explicit accessibility modifiers on class properties and methods
   * @see https://typescript-eslint.io/rules/explicit-member-accessibility
   */
  'ts/explicit-member-accessibility'?: Linter.RuleEntry<TsExplicitMemberAccessibility>;
  /**
   * Require explicit return and argument types on exported functions' and classes' public class methods
   * @see https://typescript-eslint.io/rules/explicit-module-boundary-types
   */
  'ts/explicit-module-boundary-types'?: Linter.RuleEntry<TsExplicitModuleBoundaryTypes>;
  /**
   * Require or disallow initialization in variable declarations
   * @see https://typescript-eslint.io/rules/init-declarations
   */
  'ts/init-declarations'?: Linter.RuleEntry<TsInitDeclarations>;
  /**
   * Enforce a maximum number of parameters in function definitions
   * @see https://typescript-eslint.io/rules/max-params
   */
  'ts/max-params'?: Linter.RuleEntry<TsMaxParams>;
  /**
   * Require a consistent member declaration order
   * @see https://typescript-eslint.io/rules/member-ordering
   */
  'ts/member-ordering'?: Linter.RuleEntry<TsMemberOrdering>;
  /**
   * Enforce using a particular method signature syntax
   * @see https://typescript-eslint.io/rules/method-signature-style
   */
  'ts/method-signature-style'?: Linter.RuleEntry<TsMethodSignatureStyle>;
  /**
   * Enforce naming conventions for everything across a codebase
   * @see https://typescript-eslint.io/rules/naming-convention
   */
  'ts/naming-convention'?: Linter.RuleEntry<TsNamingConvention>;
  /**
   * Disallow generic `Array` constructors
   * @see https://typescript-eslint.io/rules/no-array-constructor
   */
  'ts/no-array-constructor'?: Linter.RuleEntry<[]>;
  /**
   * Disallow using the `delete` operator on array values
   * @see https://typescript-eslint.io/rules/no-array-delete
   */
  'ts/no-array-delete'?: Linter.RuleEntry<[]>;
  /**
   * Require `.toString()` and `.toLocaleString()` to only be called on objects which provide useful information when stringified
   * @see https://typescript-eslint.io/rules/no-base-to-string
   */
  'ts/no-base-to-string'?: Linter.RuleEntry<TsNoBaseToString>;
  /**
   * Disallow non-null assertion in locations that may be confusing
   * @see https://typescript-eslint.io/rules/no-confusing-non-null-assertion
   */
  'ts/no-confusing-non-null-assertion'?: Linter.RuleEntry<[]>;
  /**
   * Require expressions of type void to appear in statement position
   * @see https://typescript-eslint.io/rules/no-confusing-void-expression
   */
  'ts/no-confusing-void-expression'?: Linter.RuleEntry<TsNoConfusingVoidExpression>;
  /**
   * Disallow using code marked as `@deprecated`
   * @see https://typescript-eslint.io/rules/no-deprecated
   */
  'ts/no-deprecated'?: Linter.RuleEntry<TsNoDeprecated>;
  /**
   * Disallow duplicate class members
   * @see https://typescript-eslint.io/rules/no-dupe-class-members
   */
  'ts/no-dupe-class-members'?: Linter.RuleEntry<[]>;
  /**
   * Disallow duplicate enum member values
   * @see https://typescript-eslint.io/rules/no-duplicate-enum-values
   */
  'ts/no-duplicate-enum-values'?: Linter.RuleEntry<[]>;
  /**
   * Disallow duplicate constituents of union or intersection types
   * @see https://typescript-eslint.io/rules/no-duplicate-type-constituents
   */
  'ts/no-duplicate-type-constituents'?: Linter.RuleEntry<TsNoDuplicateTypeConstituents>;
  /**
   * Disallow using the `delete` operator on computed key expressions
   * @see https://typescript-eslint.io/rules/no-dynamic-delete
   */
  'ts/no-dynamic-delete'?: Linter.RuleEntry<[]>;
  /**
   * Disallow empty functions
   * @see https://typescript-eslint.io/rules/no-empty-function
   */
  'ts/no-empty-function'?: Linter.RuleEntry<TsNoEmptyFunction>;
  /**
   * Disallow the declaration of empty interfaces
   * @see https://typescript-eslint.io/rules/no-empty-interface
   * @deprecated
   */
  'ts/no-empty-interface'?: Linter.RuleEntry<TsNoEmptyInterface>;
  /**
   * Disallow accidentally using the "empty object" type
   * @see https://typescript-eslint.io/rules/no-empty-object-type
   */
  'ts/no-empty-object-type'?: Linter.RuleEntry<TsNoEmptyObjectType>;
  /**
   * Disallow the `any` type
   * @see https://typescript-eslint.io/rules/no-explicit-any
   */
  'ts/no-explicit-any'?: Linter.RuleEntry<TsNoExplicitAny>;
  /**
   * Disallow extra non-null assertions
   * @see https://typescript-eslint.io/rules/no-extra-non-null-assertion
   */
  'ts/no-extra-non-null-assertion'?: Linter.RuleEntry<[]>;
  /**
   * Disallow classes used as namespaces
   * @see https://typescript-eslint.io/rules/no-extraneous-class
   */
  'ts/no-extraneous-class'?: Linter.RuleEntry<TsNoExtraneousClass>;
  /**
   * Require Promise-like statements to be handled appropriately
   * @see https://typescript-eslint.io/rules/no-floating-promises
   */
  'ts/no-floating-promises'?: Linter.RuleEntry<TsNoFloatingPromises>;
  /**
   * Disallow iterating over an array with a for-in loop
   * @see https://typescript-eslint.io/rules/no-for-in-array
   */
  'ts/no-for-in-array'?: Linter.RuleEntry<[]>;
  /**
   * Disallow the use of `eval()`-like functions
   * @see https://typescript-eslint.io/rules/no-implied-eval
   */
  'ts/no-implied-eval'?: Linter.RuleEntry<[]>;
  /**
   * Enforce the use of top-level import type qualifier when an import only has specifiers with inline type qualifiers
   * @see https://typescript-eslint.io/rules/no-import-type-side-effects
   */
  'ts/no-import-type-side-effects'?: Linter.RuleEntry<[]>;
  /**
   * Disallow explicit type declarations for variables or parameters initialized to a number, string, or boolean
   * @see https://typescript-eslint.io/rules/no-inferrable-types
   */
  'ts/no-inferrable-types'?: Linter.RuleEntry<TsNoInferrableTypes>;
  /**
   * Disallow `this` keywords outside of classes or class-like objects
   * @see https://typescript-eslint.io/rules/no-invalid-this
   */
  'ts/no-invalid-this'?: Linter.RuleEntry<TsNoInvalidThis>;
  /**
   * Disallow `void` type outside of generic or return types
   * @see https://typescript-eslint.io/rules/no-invalid-void-type
   */
  'ts/no-invalid-void-type'?: Linter.RuleEntry<TsNoInvalidVoidType>;
  /**
   * Disallow function declarations that contain unsafe references inside loop statements
   * @see https://typescript-eslint.io/rules/no-loop-func
   */
  'ts/no-loop-func'?: Linter.RuleEntry<[]>;
  /**
   * Disallow literal numbers that lose precision
   * @see https://typescript-eslint.io/rules/no-loss-of-precision
   * @deprecated
   */
  'ts/no-loss-of-precision'?: Linter.RuleEntry<[]>;
  /**
   * Disallow magic numbers
   * @see https://typescript-eslint.io/rules/no-magic-numbers
   */
  'ts/no-magic-numbers'?: Linter.RuleEntry<TsNoMagicNumbers>;
  /**
   * Disallow the `void` operator except when used to discard a value
   * @see https://typescript-eslint.io/rules/no-meaningless-void-operator
   */
  'ts/no-meaningless-void-operator'?: Linter.RuleEntry<TsNoMeaninglessVoidOperator>;
  /**
   * Enforce valid definition of `new` and `constructor`
   * @see https://typescript-eslint.io/rules/no-misused-new
   */
  'ts/no-misused-new'?: Linter.RuleEntry<[]>;
  /**
   * Disallow Promises in places not designed to handle them
   * @see https://typescript-eslint.io/rules/no-misused-promises
   */
  'ts/no-misused-promises'?: Linter.RuleEntry<TsNoMisusedPromises>;
  /**
   * Disallow using the spread operator when it might cause unexpected behavior
   * @see https://typescript-eslint.io/rules/no-misused-spread
   */
  'ts/no-misused-spread'?: Linter.RuleEntry<TsNoMisusedSpread>;
  /**
   * Disallow enums from having both number and string members
   * @see https://typescript-eslint.io/rules/no-mixed-enums
   */
  'ts/no-mixed-enums'?: Linter.RuleEntry<[]>;
  /**
   * Disallow TypeScript namespaces
   * @see https://typescript-eslint.io/rules/no-namespace
   */
  'ts/no-namespace'?: Linter.RuleEntry<TsNoNamespace>;
  /**
   * Disallow non-null assertions in the left operand of a nullish coalescing operator
   * @see https://typescript-eslint.io/rules/no-non-null-asserted-nullish-coalescing
   */
  'ts/no-non-null-asserted-nullish-coalescing'?: Linter.RuleEntry<[]>;
  /**
   * Disallow non-null assertions after an optional chain expression
   * @see https://typescript-eslint.io/rules/no-non-null-asserted-optional-chain
   */
  'ts/no-non-null-asserted-optional-chain'?: Linter.RuleEntry<[]>;
  /**
   * Disallow non-null assertions using the `!` postfix operator
   * @see https://typescript-eslint.io/rules/no-non-null-assertion
   */
  'ts/no-non-null-assertion'?: Linter.RuleEntry<[]>;
  /**
   * Disallow variable redeclaration
   * @see https://typescript-eslint.io/rules/no-redeclare
   */
  'ts/no-redeclare'?: Linter.RuleEntry<TsNoRedeclare>;
  /**
   * Disallow members of unions and intersections that do nothing or override type information
   * @see https://typescript-eslint.io/rules/no-redundant-type-constituents
   */
  'ts/no-redundant-type-constituents'?: Linter.RuleEntry<[]>;
  /**
   * Disallow invocation of `require()`
   * @see https://typescript-eslint.io/rules/no-require-imports
   */
  'ts/no-require-imports'?: Linter.RuleEntry<TsNoRequireImports>;
  /**
   * Disallow specified modules when loaded by `import`
   * @see https://typescript-eslint.io/rules/no-restricted-imports
   */
  'ts/no-restricted-imports'?: Linter.RuleEntry<TsNoRestrictedImports>;
  /**
   * Disallow certain types
   * @see https://typescript-eslint.io/rules/no-restricted-types
   */
  'ts/no-restricted-types'?: Linter.RuleEntry<TsNoRestrictedTypes>;
  /**
   * Disallow variable declarations from shadowing variables declared in the outer scope
   * @see https://typescript-eslint.io/rules/no-shadow
   */
  'ts/no-shadow'?: Linter.RuleEntry<TsNoShadow>;
  /**
   * Disallow aliasing `this`
   * @see https://typescript-eslint.io/rules/no-this-alias
   */
  'ts/no-this-alias'?: Linter.RuleEntry<TsNoThisAlias>;
  /**
   * Disallow type aliases
   * @see https://typescript-eslint.io/rules/no-type-alias
   * @deprecated
   */
  'ts/no-type-alias'?: Linter.RuleEntry<TsNoTypeAlias>;
  /**
   * Disallow unnecessary equality comparisons against boolean literals
   * @see https://typescript-eslint.io/rules/no-unnecessary-boolean-literal-compare
   */
  'ts/no-unnecessary-boolean-literal-compare'?: Linter.RuleEntry<TsNoUnnecessaryBooleanLiteralCompare>;
  /**
   * Disallow conditionals where the type is always truthy or always falsy
   * @see https://typescript-eslint.io/rules/no-unnecessary-condition
   */
  'ts/no-unnecessary-condition'?: Linter.RuleEntry<TsNoUnnecessaryCondition>;
  /**
   * Disallow unnecessary assignment of constructor property parameter
   * @see https://typescript-eslint.io/rules/no-unnecessary-parameter-property-assignment
   */
  'ts/no-unnecessary-parameter-property-assignment'?: Linter.RuleEntry<[]>;
  /**
   * Disallow unnecessary namespace qualifiers
   * @see https://typescript-eslint.io/rules/no-unnecessary-qualifier
   */
  'ts/no-unnecessary-qualifier'?: Linter.RuleEntry<[]>;
  /**
   * Disallow unnecessary template expressions
   * @see https://typescript-eslint.io/rules/no-unnecessary-template-expression
   */
  'ts/no-unnecessary-template-expression'?: Linter.RuleEntry<[]>;
  /**
   * Disallow type arguments that are equal to the default
   * @see https://typescript-eslint.io/rules/no-unnecessary-type-arguments
   */
  'ts/no-unnecessary-type-arguments'?: Linter.RuleEntry<[]>;
  /**
   * Disallow type assertions that do not change the type of an expression
   * @see https://typescript-eslint.io/rules/no-unnecessary-type-assertion
   */
  'ts/no-unnecessary-type-assertion'?: Linter.RuleEntry<TsNoUnnecessaryTypeAssertion>;
  /**
   * Disallow unnecessary constraints on generic types
   * @see https://typescript-eslint.io/rules/no-unnecessary-type-constraint
   */
  'ts/no-unnecessary-type-constraint'?: Linter.RuleEntry<[]>;
  /**
   * Disallow conversion idioms when they do not change the type or value of the expression
   * @see https://typescript-eslint.io/rules/no-unnecessary-type-conversion
   */
  'ts/no-unnecessary-type-conversion'?: Linter.RuleEntry<[]>;
  /**
   * Disallow type parameters that aren't used multiple times
   * @see https://typescript-eslint.io/rules/no-unnecessary-type-parameters
   */
  'ts/no-unnecessary-type-parameters'?: Linter.RuleEntry<[]>;
  /**
   * Disallow calling a function with a value with type `any`
   * @see https://typescript-eslint.io/rules/no-unsafe-argument
   */
  'ts/no-unsafe-argument'?: Linter.RuleEntry<[]>;
  /**
   * Disallow assigning a value with type `any` to variables and properties
   * @see https://typescript-eslint.io/rules/no-unsafe-assignment
   */
  'ts/no-unsafe-assignment'?: Linter.RuleEntry<[]>;
  /**
   * Disallow calling a value with type `any`
   * @see https://typescript-eslint.io/rules/no-unsafe-call
   */
  'ts/no-unsafe-call'?: Linter.RuleEntry<[]>;
  /**
   * Disallow unsafe declaration merging
   * @see https://typescript-eslint.io/rules/no-unsafe-declaration-merging
   */
  'ts/no-unsafe-declaration-merging'?: Linter.RuleEntry<[]>;
  /**
   * Disallow comparing an enum value with a non-enum value
   * @see https://typescript-eslint.io/rules/no-unsafe-enum-comparison
   */
  'ts/no-unsafe-enum-comparison'?: Linter.RuleEntry<[]>;
  /**
   * Disallow using the unsafe built-in Function type
   * @see https://typescript-eslint.io/rules/no-unsafe-function-type
   */
  'ts/no-unsafe-function-type'?: Linter.RuleEntry<[]>;
  /**
   * Disallow member access on a value with type `any`
   * @see https://typescript-eslint.io/rules/no-unsafe-member-access
   */
  'ts/no-unsafe-member-access'?: Linter.RuleEntry<TsNoUnsafeMemberAccess>;
  /**
   * Disallow returning a value with type `any` from a function
   * @see https://typescript-eslint.io/rules/no-unsafe-return
   */
  'ts/no-unsafe-return'?: Linter.RuleEntry<[]>;
  /**
   * Disallow type assertions that narrow a type
   * @see https://typescript-eslint.io/rules/no-unsafe-type-assertion
   */
  'ts/no-unsafe-type-assertion'?: Linter.RuleEntry<[]>;
  /**
   * Require unary negation to take a number
   * @see https://typescript-eslint.io/rules/no-unsafe-unary-minus
   */
  'ts/no-unsafe-unary-minus'?: Linter.RuleEntry<[]>;
  /**
   * Disallow unused expressions
   * @see https://typescript-eslint.io/rules/no-unused-expressions
   */
  'ts/no-unused-expressions'?: Linter.RuleEntry<TsNoUnusedExpressions>;
  /**
   * Disallow unused private class members
   * @see https://typescript-eslint.io/rules/no-unused-private-class-members
   */
  'ts/no-unused-private-class-members'?: Linter.RuleEntry<[]>;
  /**
   * Disallow unused variables
   * @see https://typescript-eslint.io/rules/no-unused-vars
   */
  'ts/no-unused-vars'?: Linter.RuleEntry<TsNoUnusedVars>;
  /**
   * Disallow the use of variables before they are defined
   * @see https://typescript-eslint.io/rules/no-use-before-define
   */
  'ts/no-use-before-define'?: Linter.RuleEntry<TsNoUseBeforeDefine>;
  /**
   * Disallow unnecessary constructors
   * @see https://typescript-eslint.io/rules/no-useless-constructor
   */
  'ts/no-useless-constructor'?: Linter.RuleEntry<[]>;
  /**
   * Disallow default values that will never be used
   * @see https://typescript-eslint.io/rules/no-useless-default-assignment
   */
  'ts/no-useless-default-assignment'?: Linter.RuleEntry<[]>;
  /**
   * Disallow empty exports that don't change anything in a module file
   * @see https://typescript-eslint.io/rules/no-useless-empty-export
   */
  'ts/no-useless-empty-export'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `require` statements except in import statements
   * @see https://typescript-eslint.io/rules/no-var-requires
   * @deprecated
   */
  'ts/no-var-requires'?: Linter.RuleEntry<TsNoVarRequires>;
  /**
   * Disallow using confusing built-in primitive class wrappers
   * @see https://typescript-eslint.io/rules/no-wrapper-object-types
   */
  'ts/no-wrapper-object-types'?: Linter.RuleEntry<[]>;
  /**
   * Enforce non-null assertions over explicit type assertions
   * @see https://typescript-eslint.io/rules/non-nullable-type-assertion-style
   */
  'ts/non-nullable-type-assertion-style'?: Linter.RuleEntry<[]>;
  /**
   * Disallow throwing non-`Error` values as exceptions
   * @see https://typescript-eslint.io/rules/only-throw-error
   */
  'ts/only-throw-error'?: Linter.RuleEntry<TsOnlyThrowError>;
  /**
   * Require or disallow parameter properties in class constructors
   * @see https://typescript-eslint.io/rules/parameter-properties
   */
  'ts/parameter-properties'?: Linter.RuleEntry<TsParameterProperties>;
  /**
   * Enforce the use of `as const` over literal type
   * @see https://typescript-eslint.io/rules/prefer-as-const
   */
  'ts/prefer-as-const'?: Linter.RuleEntry<[]>;
  /**
   * Require destructuring from arrays and/or objects
   * @see https://typescript-eslint.io/rules/prefer-destructuring
   */
  'ts/prefer-destructuring'?: Linter.RuleEntry<TsPreferDestructuring>;
  /**
   * Require each enum member value to be explicitly initialized
   * @see https://typescript-eslint.io/rules/prefer-enum-initializers
   */
  'ts/prefer-enum-initializers'?: Linter.RuleEntry<[]>;
  /**
   * Enforce the use of Array.prototype.find() over Array.prototype.filter() followed by [0] when looking for a single result
   * @see https://typescript-eslint.io/rules/prefer-find
   */
  'ts/prefer-find'?: Linter.RuleEntry<[]>;
  /**
   * Enforce the use of `for-of` loop over the standard `for` loop where possible
   * @see https://typescript-eslint.io/rules/prefer-for-of
   */
  'ts/prefer-for-of'?: Linter.RuleEntry<[]>;
  /**
   * Enforce using function types instead of interfaces with call signatures
   * @see https://typescript-eslint.io/rules/prefer-function-type
   */
  'ts/prefer-function-type'?: Linter.RuleEntry<[]>;
  /**
   * Enforce `includes` method over `indexOf` method
   * @see https://typescript-eslint.io/rules/prefer-includes
   */
  'ts/prefer-includes'?: Linter.RuleEntry<[]>;
  /**
   * Require all enum members to be literal values
   * @see https://typescript-eslint.io/rules/prefer-literal-enum-member
   */
  'ts/prefer-literal-enum-member'?: Linter.RuleEntry<TsPreferLiteralEnumMember>;
  /**
   * Require using `namespace` keyword over `module` keyword to declare custom TypeScript modules
   * @see https://typescript-eslint.io/rules/prefer-namespace-keyword
   */
  'ts/prefer-namespace-keyword'?: Linter.RuleEntry<[]>;
  /**
   * Enforce using the nullish coalescing operator instead of logical assignments or chaining
   * @see https://typescript-eslint.io/rules/prefer-nullish-coalescing
   */
  'ts/prefer-nullish-coalescing'?: Linter.RuleEntry<TsPreferNullishCoalescing>;
  /**
   * Enforce using concise optional chain expressions instead of chained logical ands, negated logical ors, or empty objects
   * @see https://typescript-eslint.io/rules/prefer-optional-chain
   */
  'ts/prefer-optional-chain'?: Linter.RuleEntry<TsPreferOptionalChain>;
  /**
   * Require using Error objects as Promise rejection reasons
   * @see https://typescript-eslint.io/rules/prefer-promise-reject-errors
   */
  'ts/prefer-promise-reject-errors'?: Linter.RuleEntry<TsPreferPromiseRejectErrors>;
  /**
   * Require private members to be marked as `readonly` if they're never modified outside of the constructor
   * @see https://typescript-eslint.io/rules/prefer-readonly
   */
  'ts/prefer-readonly'?: Linter.RuleEntry<TsPreferReadonly>;
  /**
   * Require function parameters to be typed as `readonly` to prevent accidental mutation of inputs
   * @see https://typescript-eslint.io/rules/prefer-readonly-parameter-types
   */
  'ts/prefer-readonly-parameter-types'?: Linter.RuleEntry<TsPreferReadonlyParameterTypes>;
  /**
   * Enforce using type parameter when calling `Array#reduce` instead of using a type assertion
   * @see https://typescript-eslint.io/rules/prefer-reduce-type-parameter
   */
  'ts/prefer-reduce-type-parameter'?: Linter.RuleEntry<[]>;
  /**
   * Enforce `RegExp#exec` over `String#match` if no global flag is provided
   * @see https://typescript-eslint.io/rules/prefer-regexp-exec
   */
  'ts/prefer-regexp-exec'?: Linter.RuleEntry<[]>;
  /**
   * Enforce that `this` is used when only `this` type is returned
   * @see https://typescript-eslint.io/rules/prefer-return-this-type
   */
  'ts/prefer-return-this-type'?: Linter.RuleEntry<[]>;
  /**
   * Enforce using `String#startsWith` and `String#endsWith` over other equivalent methods of checking substrings
   * @see https://typescript-eslint.io/rules/prefer-string-starts-ends-with
   */
  'ts/prefer-string-starts-ends-with'?: Linter.RuleEntry<TsPreferStringStartsEndsWith>;
  /**
   * Enforce using `@ts-expect-error` over `@ts-ignore`
   * @see https://typescript-eslint.io/rules/prefer-ts-expect-error
   * @deprecated
   */
  'ts/prefer-ts-expect-error'?: Linter.RuleEntry<[]>;
  /**
   * Require any function or method that returns a Promise to be marked async
   * @see https://typescript-eslint.io/rules/promise-function-async
   */
  'ts/promise-function-async'?: Linter.RuleEntry<TsPromiseFunctionAsync>;
  /**
   * Enforce that `get()` types should be assignable to their equivalent `set()` type
   * @see https://typescript-eslint.io/rules/related-getter-setter-pairs
   */
  'ts/related-getter-setter-pairs'?: Linter.RuleEntry<[]>;
  /**
   * Require `Array#sort` and `Array#toSorted` calls to always provide a `compareFunction`
   * @see https://typescript-eslint.io/rules/require-array-sort-compare
   */
  'ts/require-array-sort-compare'?: Linter.RuleEntry<TsRequireArraySortCompare>;
  /**
   * Disallow async functions which do not return promises and have no `await` expression
   * @see https://typescript-eslint.io/rules/require-await
   */
  'ts/require-await'?: Linter.RuleEntry<[]>;
  /**
   * Require both operands of addition to be the same type and be `bigint`, `number`, or `string`
   * @see https://typescript-eslint.io/rules/restrict-plus-operands
   */
  'ts/restrict-plus-operands'?: Linter.RuleEntry<TsRestrictPlusOperands>;
  /**
   * Enforce template literal expressions to be of `string` type
   * @see https://typescript-eslint.io/rules/restrict-template-expressions
   */
  'ts/restrict-template-expressions'?: Linter.RuleEntry<TsRestrictTemplateExpressions>;
  /**
   * Enforce consistent awaiting of returned promises
   * @see https://typescript-eslint.io/rules/return-await
   */
  'ts/return-await'?: Linter.RuleEntry<TsReturnAwait>;
  /**
   * Enforce constituents of a type union/intersection to be sorted alphabetically
   * @see https://typescript-eslint.io/rules/sort-type-constituents
   * @deprecated
   */
  'ts/sort-type-constituents'?: Linter.RuleEntry<TsSortTypeConstituents>;
  /**
   * Disallow certain types in boolean expressions
   * @see https://typescript-eslint.io/rules/strict-boolean-expressions
   */
  'ts/strict-boolean-expressions'?: Linter.RuleEntry<TsStrictBooleanExpressions>;
  /**
   * Require switch-case statements to be exhaustive
   * @see https://typescript-eslint.io/rules/switch-exhaustiveness-check
   */
  'ts/switch-exhaustiveness-check'?: Linter.RuleEntry<TsSwitchExhaustivenessCheck>;
  /**
   * Disallow certain triple slash directives in favor of ES6-style import declarations
   * @see https://typescript-eslint.io/rules/triple-slash-reference
   */
  'ts/triple-slash-reference'?: Linter.RuleEntry<TsTripleSlashReference>;
  /**
   * Require type annotations in certain places
   * @see https://typescript-eslint.io/rules/typedef
   * @deprecated
   */
  'ts/typedef'?: Linter.RuleEntry<TsTypedef>;
  /**
   * Enforce unbound methods are called with their expected scope
   * @see https://typescript-eslint.io/rules/unbound-method
   */
  'ts/unbound-method'?: Linter.RuleEntry<TsUnboundMethod>;
  /**
   * Disallow two overloads that could be unified into one with a union or an optional/rest parameter
   * @see https://typescript-eslint.io/rules/unified-signatures
   */
  'ts/unified-signatures'?: Linter.RuleEntry<TsUnifiedSignatures>;
  /**
   * Enforce typing arguments in Promise rejection callbacks as `unknown`
   * @see https://typescript-eslint.io/rules/use-unknown-in-catch-callback-variable
   */
  'ts/use-unknown-in-catch-callback-variable'?: Linter.RuleEntry<[]>;
  /**
   * Require or disallow Unicode byte order mark (BOM)
   * @see https://eslint.org/docs/latest/rules/unicode-bom
   */
  'unicode-bom'?: Linter.RuleEntry<UnicodeBom>;
  /**
   * Improve regexes by making them shorter, consistent, and safer.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/better-regex.md
   */
  'unicorn/better-regex'?: Linter.RuleEntry<UnicornBetterRegex>;
  /**
   * Enforce a specific parameter name in catch clauses.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/catch-error-name.md
   */
  'unicorn/catch-error-name'?: Linter.RuleEntry<UnicornCatchErrorName>;
  /**
   * Enforce consistent assertion style with `node:assert`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/consistent-assert.md
   */
  'unicorn/consistent-assert'?: Linter.RuleEntry<[]>;
  /**
   * Prefer passing `Date` directly to the constructor when cloning.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/consistent-date-clone.md
   */
  'unicorn/consistent-date-clone'?: Linter.RuleEntry<[]>;
  /**
   * Use destructured variables over properties.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/consistent-destructuring.md
   */
  'unicorn/consistent-destructuring'?: Linter.RuleEntry<[]>;
  /**
   * Prefer consistent types when spreading a ternary in an array literal.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/consistent-empty-array-spread.md
   */
  'unicorn/consistent-empty-array-spread'?: Linter.RuleEntry<[]>;
  /**
   * Enforce consistent style for element existence checks with `indexOf()`, `lastIndexOf()`, `findIndex()`, and `findLastIndex()`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/consistent-existence-index-check.md
   */
  'unicorn/consistent-existence-index-check'?: Linter.RuleEntry<[]>;
  /**
   * Move function definitions to the highest possible scope.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/consistent-function-scoping.md
   */
  'unicorn/consistent-function-scoping'?: Linter.RuleEntry<UnicornConsistentFunctionScoping>;
  /**
   * Enforce correct `Error` subclassing.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/custom-error-definition.md
   */
  'unicorn/custom-error-definition'?: Linter.RuleEntry<[]>;
  /**
   * Enforce no spaces between braces.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/empty-brace-spaces.md
   */
  'unicorn/empty-brace-spaces'?: Linter.RuleEntry<[]>;
  /**
   * Enforce passing a `message` value when creating a built-in error.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/error-message.md
   */
  'unicorn/error-message'?: Linter.RuleEntry<[]>;
  /**
   * Require escape sequences to use uppercase or lowercase values.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/escape-case.md
   */
  'unicorn/escape-case'?: Linter.RuleEntry<UnicornEscapeCase>;
  /**
   * Add expiration conditions to TODO comments.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/expiring-todo-comments.md
   */
  'unicorn/expiring-todo-comments'?: Linter.RuleEntry<UnicornExpiringTodoComments>;
  /**
   * Enforce explicitly comparing the `length` or `size` property of a value.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/explicit-length-check.md
   */
  'unicorn/explicit-length-check'?: Linter.RuleEntry<UnicornExplicitLengthCheck>;
  /**
   * Enforce a case style for filenames.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/filename-case.md
   */
  'unicorn/filename-case'?: Linter.RuleEntry<UnicornFilenameCase>;
  /**
   * Enforce specific import styles per module.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/import-style.md
   */
  'unicorn/import-style'?: Linter.RuleEntry<UnicornImportStyle>;
  /**
   * Enforce the use of `new` for all builtins, except `String`, `Number`, `Boolean`, `Symbol` and `BigInt`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/new-for-builtins.md
   */
  'unicorn/new-for-builtins'?: Linter.RuleEntry<[]>;
  /**
   * Enforce specifying rules to disable in `eslint-disable` comments.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-abusive-eslint-disable.md
   */
  'unicorn/no-abusive-eslint-disable'?: Linter.RuleEntry<[]>;
  /**
   * Disallow recursive access to `this` within getters and setters.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-accessor-recursion.md
   */
  'unicorn/no-accessor-recursion'?: Linter.RuleEntry<[]>;
  /**
   * Disallow anonymous functions and classes as the default export.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-anonymous-default-export.md
   */
  'unicorn/no-anonymous-default-export'?: Linter.RuleEntry<[]>;
  /**
   * Prevent passing a function reference directly to iterator methods.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-array-callback-reference.md
   */
  'unicorn/no-array-callback-reference'?: Linter.RuleEntry<[]>;
  /**
   * Prefer `for…of` over the `forEach` method.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-array-for-each.md
   */
  'unicorn/no-array-for-each'?: Linter.RuleEntry<[]>;
  /**
   * Disallow using the `this` argument in array methods.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-array-method-this-argument.md
   */
  'unicorn/no-array-method-this-argument'?: Linter.RuleEntry<[]>;
  /**
   * Replaced by `unicorn/prefer-single-call` which covers more cases.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/deprecated-rules.md#no-array-push-push
   * @deprecated
   */
  'unicorn/no-array-push-push'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `Array#reduce()` and `Array#reduceRight()`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-array-reduce.md
   */
  'unicorn/no-array-reduce'?: Linter.RuleEntry<UnicornNoArrayReduce>;
  /**
   * Prefer `Array#toReversed()` over `Array#reverse()`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-array-reverse.md
   */
  'unicorn/no-array-reverse'?: Linter.RuleEntry<UnicornNoArrayReverse>;
  /**
   * Prefer `Array#toSorted()` over `Array#sort()`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-array-sort.md
   */
  'unicorn/no-array-sort'?: Linter.RuleEntry<UnicornNoArraySort>;
  /**
   * Disallow member access from await expression.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-await-expression-member.md
   */
  'unicorn/no-await-expression-member'?: Linter.RuleEntry<[]>;
  /**
   * Disallow using `await` in `Promise` method parameters.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-await-in-promise-methods.md
   */
  'unicorn/no-await-in-promise-methods'?: Linter.RuleEntry<[]>;
  /**
   * Do not use leading/trailing space between `console.log` parameters.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-console-spaces.md
   */
  'unicorn/no-console-spaces'?: Linter.RuleEntry<[]>;
  /**
   * Do not use `document.cookie` directly.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-document-cookie.md
   */
  'unicorn/no-document-cookie'?: Linter.RuleEntry<[]>;
  /**
   * Disallow empty files.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-empty-file.md
   */
  'unicorn/no-empty-file'?: Linter.RuleEntry<[]>;
  /**
   * Do not use a `for` loop that can be replaced with a `for-of` loop.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-for-loop.md
   */
  'unicorn/no-for-loop'?: Linter.RuleEntry<[]>;
  /**
   * Enforce the use of Unicode escapes instead of hexadecimal escapes.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-hex-escape.md
   */
  'unicorn/no-hex-escape'?: Linter.RuleEntry<[]>;
  /**
   * Disallow immediate mutation after variable assignment.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-immediate-mutation.md
   */
  'unicorn/no-immediate-mutation'?: Linter.RuleEntry<[]>;
  /**
   * Replaced by `unicorn/no-instanceof-builtins` which covers more cases.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/deprecated-rules.md#no-instanceof-array
   * @deprecated
   */
  'unicorn/no-instanceof-array'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `instanceof` with built-in objects
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-instanceof-builtins.md
   */
  'unicorn/no-instanceof-builtins'?: Linter.RuleEntry<UnicornNoInstanceofBuiltins>;
  /**
   * Disallow invalid options in `fetch()` and `new Request()`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-invalid-fetch-options.md
   */
  'unicorn/no-invalid-fetch-options'?: Linter.RuleEntry<[]>;
  /**
   * Prevent calling `EventTarget#removeEventListener()` with the result of an expression.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-invalid-remove-event-listener.md
   */
  'unicorn/no-invalid-remove-event-listener'?: Linter.RuleEntry<[]>;
  /**
   * Disallow identifiers starting with `new` or `class`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-keyword-prefix.md
   */
  'unicorn/no-keyword-prefix'?: Linter.RuleEntry<UnicornNoKeywordPrefix>;
  /**
   * Replaced by `unicorn/no-unnecessary-slice-end` which covers more cases.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/deprecated-rules.md#no-length-as-slice-end
   * @deprecated
   */
  'unicorn/no-length-as-slice-end'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `if` statements as the only statement in `if` blocks without `else`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-lonely-if.md
   */
  'unicorn/no-lonely-if'?: Linter.RuleEntry<[]>;
  /**
   * Disallow a magic number as the `depth` argument in `Array#flat(…).`
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-magic-array-flat-depth.md
   */
  'unicorn/no-magic-array-flat-depth'?: Linter.RuleEntry<[]>;
  /**
   * Disallow named usage of default import and export.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-named-default.md
   */
  'unicorn/no-named-default'?: Linter.RuleEntry<[]>;
  /**
   * Disallow negated conditions.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-negated-condition.md
   */
  'unicorn/no-negated-condition'?: Linter.RuleEntry<[]>;
  /**
   * Disallow negated expression in equality check.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-negation-in-equality-check.md
   */
  'unicorn/no-negation-in-equality-check'?: Linter.RuleEntry<[]>;
  /**
   * Disallow nested ternary expressions.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-nested-ternary.md
   */
  'unicorn/no-nested-ternary'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `new Array()`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-new-array.md
   */
  'unicorn/no-new-array'?: Linter.RuleEntry<[]>;
  /**
   * Enforce the use of `Buffer.from()` and `Buffer.alloc()` instead of the deprecated `new Buffer()`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-new-buffer.md
   */
  'unicorn/no-new-buffer'?: Linter.RuleEntry<[]>;
  /**
   * Disallow the use of the `null` literal.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-null.md
   */
  'unicorn/no-null'?: Linter.RuleEntry<UnicornNoNull>;
  /**
   * Disallow the use of objects as default parameters.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-object-as-default-parameter.md
   */
  'unicorn/no-object-as-default-parameter'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `process.exit()`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-process-exit.md
   */
  'unicorn/no-process-exit'?: Linter.RuleEntry<[]>;
  /**
   * Disallow passing single-element arrays to `Promise` methods.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-single-promise-in-promise-methods.md
   */
  'unicorn/no-single-promise-in-promise-methods'?: Linter.RuleEntry<[]>;
  /**
   * Disallow classes that only have static members.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-static-only-class.md
   */
  'unicorn/no-static-only-class'?: Linter.RuleEntry<[]>;
  /**
   * Disallow `then` property.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-thenable.md
   */
  'unicorn/no-thenable'?: Linter.RuleEntry<[]>;
  /**
   * Disallow assigning `this` to a variable.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-this-assignment.md
   */
  'unicorn/no-this-assignment'?: Linter.RuleEntry<[]>;
  /**
   * Disallow comparing `undefined` using `typeof`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-typeof-undefined.md
   */
  'unicorn/no-typeof-undefined'?: Linter.RuleEntry<UnicornNoTypeofUndefined>;
  /**
   * Disallow using `1` as the `depth` argument of `Array#flat()`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-unnecessary-array-flat-depth.md
   */
  'unicorn/no-unnecessary-array-flat-depth'?: Linter.RuleEntry<[]>;
  /**
   * Disallow using `.length` or `Infinity` as the `deleteCount` or `skipCount` argument of `Array#{splice,toSpliced}()`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-unnecessary-array-splice-count.md
   */
  'unicorn/no-unnecessary-array-splice-count'?: Linter.RuleEntry<[]>;
  /**
   * Disallow awaiting non-promise values.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-unnecessary-await.md
   */
  'unicorn/no-unnecessary-await'?: Linter.RuleEntry<[]>;
  /**
   * Enforce the use of built-in methods instead of unnecessary polyfills.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-unnecessary-polyfills.md
   */
  'unicorn/no-unnecessary-polyfills'?: Linter.RuleEntry<UnicornNoUnnecessaryPolyfills>;
  /**
   * Disallow using `.length` or `Infinity` as the `end` argument of `{Array,String,TypedArray}#slice()`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-unnecessary-slice-end.md
   */
  'unicorn/no-unnecessary-slice-end'?: Linter.RuleEntry<[]>;
  /**
   * Disallow unreadable array destructuring.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-unreadable-array-destructuring.md
   */
  'unicorn/no-unreadable-array-destructuring'?: Linter.RuleEntry<[]>;
  /**
   * Disallow unreadable IIFEs.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-unreadable-iife.md
   */
  'unicorn/no-unreadable-iife'?: Linter.RuleEntry<[]>;
  /**
   * Disallow unused object properties.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-unused-properties.md
   */
  'unicorn/no-unused-properties'?: Linter.RuleEntry<[]>;
  /**
   * Disallow useless values or fallbacks in `Set`, `Map`, `WeakSet`, or `WeakMap`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-useless-collection-argument.md
   */
  'unicorn/no-useless-collection-argument'?: Linter.RuleEntry<[]>;
  /**
   * Disallow unnecessary `Error.captureStackTrace(…)`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-useless-error-capture-stack-trace.md
   */
  'unicorn/no-useless-error-capture-stack-trace'?: Linter.RuleEntry<[]>;
  /**
   * Disallow useless fallback when spreading in object literals.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-useless-fallback-in-spread.md
   */
  'unicorn/no-useless-fallback-in-spread'?: Linter.RuleEntry<[]>;
  /**
   * Disallow useless array length check.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-useless-length-check.md
   */
  'unicorn/no-useless-length-check'?: Linter.RuleEntry<[]>;
  /**
   * Disallow returning/yielding `Promise.resolve/reject()` in async functions or promise callbacks
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-useless-promise-resolve-reject.md
   */
  'unicorn/no-useless-promise-resolve-reject'?: Linter.RuleEntry<[]>;
  /**
   * Disallow unnecessary spread.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-useless-spread.md
   */
  'unicorn/no-useless-spread'?: Linter.RuleEntry<[]>;
  /**
   * Disallow useless case in switch statements.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-useless-switch-case.md
   */
  'unicorn/no-useless-switch-case'?: Linter.RuleEntry<[]>;
  /**
   * Disallow useless `undefined`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-useless-undefined.md
   */
  'unicorn/no-useless-undefined'?: Linter.RuleEntry<UnicornNoUselessUndefined>;
  /**
   * Disallow number literals with zero fractions or dangling dots.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/no-zero-fractions.md
   */
  'unicorn/no-zero-fractions'?: Linter.RuleEntry<[]>;
  /**
   * Enforce proper case for numeric literals.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/number-literal-case.md
   */
  'unicorn/number-literal-case'?: Linter.RuleEntry<UnicornNumberLiteralCase>;
  /**
   * Enforce the style of numeric separators by correctly grouping digits.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/numeric-separators-style.md
   */
  'unicorn/numeric-separators-style'?: Linter.RuleEntry<UnicornNumericSeparatorsStyle>;
  /**
   * Prefer `.addEventListener()` and `.removeEventListener()` over `on`-functions.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-add-event-listener.md
   */
  'unicorn/prefer-add-event-listener'?: Linter.RuleEntry<UnicornPreferAddEventListener>;
  /**
   * Prefer `.find(…)` and `.findLast(…)` over the first or last element from `.filter(…)`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-array-find.md
   */
  'unicorn/prefer-array-find'?: Linter.RuleEntry<UnicornPreferArrayFind>;
  /**
   * Prefer `Array#flat()` over legacy techniques to flatten arrays.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-array-flat.md
   */
  'unicorn/prefer-array-flat'?: Linter.RuleEntry<UnicornPreferArrayFlat>;
  /**
   * Prefer `.flatMap(…)` over `.map(…).flat()`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-array-flat-map.md
   */
  'unicorn/prefer-array-flat-map'?: Linter.RuleEntry<[]>;
  /**
   * Prefer `Array#{indexOf,lastIndexOf}()` over `Array#{findIndex,findLastIndex}()` when looking for the index of an item.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-array-index-of.md
   */
  'unicorn/prefer-array-index-of'?: Linter.RuleEntry<[]>;
  /**
   * Prefer `.some(…)` over `.filter(…).length` check and `.{find,findLast,findIndex,findLastIndex}(…)`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-array-some.md
   */
  'unicorn/prefer-array-some'?: Linter.RuleEntry<[]>;
  /**
   * Prefer `.at()` method for index access and `String#charAt()`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-at.md
   */
  'unicorn/prefer-at'?: Linter.RuleEntry<UnicornPreferAt>;
  /**
   * Prefer `BigInt` literals over the constructor.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-bigint-literals.md
   */
  'unicorn/prefer-bigint-literals'?: Linter.RuleEntry<[]>;
  /**
   * Prefer `Blob#arrayBuffer()` over `FileReader#readAsArrayBuffer(…)` and `Blob#text()` over `FileReader#readAsText(…)`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-blob-reading-methods.md
   */
  'unicorn/prefer-blob-reading-methods'?: Linter.RuleEntry<[]>;
  /**
   * Prefer class field declarations over `this` assignments in constructors.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-class-fields.md
   */
  'unicorn/prefer-class-fields'?: Linter.RuleEntry<[]>;
  /**
   * Prefer using `Element#classList.toggle()` to toggle class names.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-classlist-toggle.md
   */
  'unicorn/prefer-classlist-toggle'?: Linter.RuleEntry<[]>;
  /**
   * Prefer `String#codePointAt(…)` over `String#charCodeAt(…)` and `String.fromCodePoint(…)` over `String.fromCharCode(…)`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-code-point.md
   */
  'unicorn/prefer-code-point'?: Linter.RuleEntry<[]>;
  /**
   * Prefer `Date.now()` to get the number of milliseconds since the Unix Epoch.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-date-now.md
   */
  'unicorn/prefer-date-now'?: Linter.RuleEntry<[]>;
  /**
   * Prefer default parameters over reassignment.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-default-parameters.md
   */
  'unicorn/prefer-default-parameters'?: Linter.RuleEntry<[]>;
  /**
   * Prefer `Node#append()` over `Node#appendChild()`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-dom-node-append.md
   */
  'unicorn/prefer-dom-node-append'?: Linter.RuleEntry<[]>;
  /**
   * Prefer using `.dataset` on DOM elements over calling attribute methods.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-dom-node-dataset.md
   */
  'unicorn/prefer-dom-node-dataset'?: Linter.RuleEntry<[]>;
  /**
   * Prefer `childNode.remove()` over `parentNode.removeChild(childNode)`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-dom-node-remove.md
   */
  'unicorn/prefer-dom-node-remove'?: Linter.RuleEntry<[]>;
  /**
   * Prefer `.textContent` over `.innerText`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-dom-node-text-content.md
   */
  'unicorn/prefer-dom-node-text-content'?: Linter.RuleEntry<[]>;
  /**
   * Prefer `EventTarget` over `EventEmitter`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-event-target.md
   */
  'unicorn/prefer-event-target'?: Linter.RuleEntry<[]>;
  /**
   * Prefer `export…from` when re-exporting.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-export-from.md
   */
  'unicorn/prefer-export-from'?: Linter.RuleEntry<UnicornPreferExportFrom>;
  /**
   * Prefer `globalThis` over `window`, `self`, and `global`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-global-this.md
   */
  'unicorn/prefer-global-this'?: Linter.RuleEntry<[]>;
  /**
   * Prefer `import.meta.{dirname,filename}` over legacy techniques for getting file paths.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-import-meta-properties.md
   */
  'unicorn/prefer-import-meta-properties'?: Linter.RuleEntry<[]>;
  /**
   * Prefer `.includes()` over `.indexOf()`, `.lastIndexOf()`, and `Array#some()` when checking for existence or non-existence.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-includes.md
   */
  'unicorn/prefer-includes'?: Linter.RuleEntry<[]>;
  /**
   * Prefer reading a JSON file as a buffer.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-json-parse-buffer.md
   */
  'unicorn/prefer-json-parse-buffer'?: Linter.RuleEntry<[]>;
  /**
   * Prefer `KeyboardEvent#key` over `KeyboardEvent#keyCode`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-keyboard-event-key.md
   */
  'unicorn/prefer-keyboard-event-key'?: Linter.RuleEntry<[]>;
  /**
   * Prefer using a logical operator over a ternary.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-logical-operator-over-ternary.md
   */
  'unicorn/prefer-logical-operator-over-ternary'?: Linter.RuleEntry<[]>;
  /**
   * Prefer `Math.min()` and `Math.max()` over ternaries for simple comparisons.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-math-min-max.md
   */
  'unicorn/prefer-math-min-max'?: Linter.RuleEntry<[]>;
  /**
   * Enforce the use of `Math.trunc` instead of bitwise operators.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-math-trunc.md
   */
  'unicorn/prefer-math-trunc'?: Linter.RuleEntry<[]>;
  /**
   * Prefer `.before()` over `.insertBefore()`, `.replaceWith()` over `.replaceChild()`, prefer one of `.before()`, `.after()`, `.append()` or `.prepend()` over `insertAdjacentText()` and `insertAdjacentElement()`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-modern-dom-apis.md
   */
  'unicorn/prefer-modern-dom-apis'?: Linter.RuleEntry<[]>;
  /**
   * Prefer modern `Math` APIs over legacy patterns.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-modern-math-apis.md
   */
  'unicorn/prefer-modern-math-apis'?: Linter.RuleEntry<[]>;
  /**
   * Prefer JavaScript modules (ESM) over CommonJS.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-module.md
   */
  'unicorn/prefer-module'?: Linter.RuleEntry<[]>;
  /**
   * Prefer using `String`, `Number`, `BigInt`, `Boolean`, and `Symbol` directly.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-native-coercion-functions.md
   */
  'unicorn/prefer-native-coercion-functions'?: Linter.RuleEntry<[]>;
  /**
   * Prefer negative index over `.length - index` when possible.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-negative-index.md
   */
  'unicorn/prefer-negative-index'?: Linter.RuleEntry<[]>;
  /**
   * Prefer using the `node:` protocol when importing Node.js builtin modules.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-node-protocol.md
   */
  'unicorn/prefer-node-protocol'?: Linter.RuleEntry<[]>;
  /**
   * Prefer `Number` static properties over global ones.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-number-properties.md
   */
  'unicorn/prefer-number-properties'?: Linter.RuleEntry<UnicornPreferNumberProperties>;
  /**
   * Prefer using `Object.fromEntries(…)` to transform a list of key-value pairs into an object.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-object-from-entries.md
   */
  'unicorn/prefer-object-from-entries'?: Linter.RuleEntry<UnicornPreferObjectFromEntries>;
  /**
   * Prefer omitting the `catch` binding parameter.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-optional-catch-binding.md
   */
  'unicorn/prefer-optional-catch-binding'?: Linter.RuleEntry<[]>;
  /**
   * Prefer borrowing methods from the prototype instead of the instance.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-prototype-methods.md
   */
  'unicorn/prefer-prototype-methods'?: Linter.RuleEntry<[]>;
  /**
   * Prefer `.querySelector()` over `.getElementById()`, `.querySelectorAll()` over `.getElementsByClassName()` and `.getElementsByTagName()` and `.getElementsByName()`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-query-selector.md
   */
  'unicorn/prefer-query-selector'?: Linter.RuleEntry<[]>;
  /**
   * Prefer `Reflect.apply()` over `Function#apply()`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-reflect-apply.md
   */
  'unicorn/prefer-reflect-apply'?: Linter.RuleEntry<[]>;
  /**
   * Prefer `RegExp#test()` over `String#match()` and `RegExp#exec()`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-regexp-test.md
   */
  'unicorn/prefer-regexp-test'?: Linter.RuleEntry<[]>;
  /**
   * Prefer `Response.json()` over `new Response(JSON.stringify())`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-response-static-json.md
   */
  'unicorn/prefer-response-static-json'?: Linter.RuleEntry<[]>;
  /**
   * Prefer `Set#has()` over `Array#includes()` when checking for existence or non-existence.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-set-has.md
   */
  'unicorn/prefer-set-has'?: Linter.RuleEntry<[]>;
  /**
   * Prefer using `Set#size` instead of `Array#length`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-set-size.md
   */
  'unicorn/prefer-set-size'?: Linter.RuleEntry<[]>;
  /**
   * Enforce combining multiple `Array#push()`, `Element#classList.{add,remove}()`, and `importScripts()` into one call.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-single-call.md
   */
  'unicorn/prefer-single-call'?: Linter.RuleEntry<UnicornPreferSingleCall>;
  /**
   * Prefer the spread operator over `Array.from(…)`, `Array#concat(…)`, `Array#{slice,toSpliced}()` and `String#split('')`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-spread.md
   */
  'unicorn/prefer-spread'?: Linter.RuleEntry<[]>;
  /**
   * Prefer using the `String.raw` tag to avoid escaping `\`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-string-raw.md
   */
  'unicorn/prefer-string-raw'?: Linter.RuleEntry<[]>;
  /**
   * Prefer `String#replaceAll()` over regex searches with the global flag.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-string-replace-all.md
   */
  'unicorn/prefer-string-replace-all'?: Linter.RuleEntry<[]>;
  /**
   * Prefer `String#slice()` over `String#substr()` and `String#substring()`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-string-slice.md
   */
  'unicorn/prefer-string-slice'?: Linter.RuleEntry<[]>;
  /**
   * Prefer `String#startsWith()` & `String#endsWith()` over `RegExp#test()`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-string-starts-ends-with.md
   */
  'unicorn/prefer-string-starts-ends-with'?: Linter.RuleEntry<[]>;
  /**
   * Prefer `String#trimStart()` / `String#trimEnd()` over `String#trimLeft()` / `String#trimRight()`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-string-trim-start-end.md
   */
  'unicorn/prefer-string-trim-start-end'?: Linter.RuleEntry<[]>;
  /**
   * Prefer using `structuredClone` to create a deep clone.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-structured-clone.md
   */
  'unicorn/prefer-structured-clone'?: Linter.RuleEntry<UnicornPreferStructuredClone>;
  /**
   * Prefer `switch` over multiple `else-if`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-switch.md
   */
  'unicorn/prefer-switch'?: Linter.RuleEntry<UnicornPreferSwitch>;
  /**
   * Prefer ternary expressions over simple `if-else` statements.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-ternary.md
   */
  'unicorn/prefer-ternary'?: Linter.RuleEntry<UnicornPreferTernary>;
  /**
   * Prefer top-level await over top-level promises and async function calls.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-top-level-await.md
   */
  'unicorn/prefer-top-level-await'?: Linter.RuleEntry<[]>;
  /**
   * Enforce throwing `TypeError` in type checking conditions.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prefer-type-error.md
   */
  'unicorn/prefer-type-error'?: Linter.RuleEntry<[]>;
  /**
   * Prevent abbreviations.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/prevent-abbreviations.md
   */
  'unicorn/prevent-abbreviations'?: Linter.RuleEntry<UnicornPreventAbbreviations>;
  /**
   * Enforce consistent relative URL style.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/relative-url-style.md
   */
  'unicorn/relative-url-style'?: Linter.RuleEntry<UnicornRelativeUrlStyle>;
  /**
   * Enforce using the separator argument with `Array#join()`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/require-array-join-separator.md
   */
  'unicorn/require-array-join-separator'?: Linter.RuleEntry<[]>;
  /**
   * Require non-empty module attributes for imports and exports
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/require-module-attributes.md
   */
  'unicorn/require-module-attributes'?: Linter.RuleEntry<[]>;
  /**
   * Require non-empty specifier list in import and export statements.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/require-module-specifiers.md
   */
  'unicorn/require-module-specifiers'?: Linter.RuleEntry<[]>;
  /**
   * Enforce using the digits argument with `Number#toFixed()`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/require-number-to-fixed-digits-argument.md
   */
  'unicorn/require-number-to-fixed-digits-argument'?: Linter.RuleEntry<[]>;
  /**
   * Enforce using the `targetOrigin` argument with `window.postMessage()`.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/require-post-message-target-origin.md
   */
  'unicorn/require-post-message-target-origin'?: Linter.RuleEntry<[]>;
  /**
   * Enforce better string content.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/string-content.md
   */
  'unicorn/string-content'?: Linter.RuleEntry<UnicornStringContent>;
  /**
   * Enforce consistent brace style for `case` clauses.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/switch-case-braces.md
   */
  'unicorn/switch-case-braces'?: Linter.RuleEntry<UnicornSwitchCaseBraces>;
  /**
   * Fix whitespace-insensitive template indentation.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/template-indent.md
   */
  'unicorn/template-indent'?: Linter.RuleEntry<UnicornTemplateIndent>;
  /**
   * Enforce consistent case for text encoding identifiers.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/text-encoding-identifier-case.md
   */
  'unicorn/text-encoding-identifier-case'?: Linter.RuleEntry<UnicornTextEncodingIdentifierCase>;
  /**
   * Require `new` when creating an error.
   * @see https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v62.0.0/docs/rules/throw-new-error.md
   */
  'unicorn/throw-new-error'?: Linter.RuleEntry<[]>;
  /**
   * Utilities in UnoCSS blocklist
   * @see https://unocss.dev/integrations/eslint#rules
   */
  'unocss/blocklist'?: Linter.RuleEntry<[]>;
  /**
   * Enforce class compilation
   * @see https://unocss.dev/integrations/eslint#rules
   */
  'unocss/enforce-class-compile'?: Linter.RuleEntry<UnocssEnforceClassCompile>;
  /**
   * Order of UnoCSS utilities in class attribute
   * @see https://unocss.dev/integrations/eslint#rules
   */
  'unocss/order'?: Linter.RuleEntry<UnocssOrder>;
  /**
   * Order of UnoCSS attributes
   * @see https://unocss.dev/integrations/eslint#rules
   */
  'unocss/order-attributify'?: Linter.RuleEntry<[]>;
  /**
   * Disallow unused variables
   * @see https://github.com/sweepline/eslint-plugin-unused-imports/blob/master/docs/rules/no-unused-imports.md
   */
  'unused-imports/no-unused-imports'?: Linter.RuleEntry<UnusedImportsNoUnusedImports>;
  /**
   * Disallow unused variables
   * @see https://github.com/sweepline/eslint-plugin-unused-imports/blob/master/docs/rules/no-unused-vars.md
   */
  'unused-imports/no-unused-vars'?: Linter.RuleEntry<UnusedImportsNoUnusedVars>;
  /**
   * Require calls to `isNaN()` when checking for `NaN`
   * @see https://eslint.org/docs/latest/rules/use-isnan
   */
  'use-isnan'?: Linter.RuleEntry<UseIsnan>;
  /**
   * Enforce comparing `typeof` expressions against valid strings
   * @see https://eslint.org/docs/latest/rules/valid-typeof
   */
  'valid-typeof'?: Linter.RuleEntry<ValidTypeof>;
  /**
   * Require `var` declarations be placed at the top of their containing scope
   * @see https://eslint.org/docs/latest/rules/vars-on-top
   */
  'vars-on-top'?: Linter.RuleEntry<[]>;
  /**
   * @see https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rules/alt-text.html
   */
  'vue-a11y/alt-text'?: Linter.RuleEntry<VueA11YAltText>;
  /**
   * @see https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rules/anchor-has-content.html
   */
  'vue-a11y/anchor-has-content'?: Linter.RuleEntry<VueA11YAnchorHasContent>;
  /**
   * @see https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rules/aria-props.html
   */
  'vue-a11y/aria-props'?: Linter.RuleEntry<[]>;
  /**
   * @see https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rules/aria-role.html
   */
  'vue-a11y/aria-role'?: Linter.RuleEntry<VueA11YAriaRole>;
  /**
   * @see https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rules/aria-unsupported-elements.html
   */
  'vue-a11y/aria-unsupported-elements'?: Linter.RuleEntry<[]>;
  /**
   * @see https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rules/click-events-have-key-events.html
   */
  'vue-a11y/click-events-have-key-events'?: Linter.RuleEntry<[]>;
  /**
   * @see https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rules/form-control-has-label.html
   */
  'vue-a11y/form-control-has-label'?: Linter.RuleEntry<VueA11YFormControlHasLabel>;
  /**
   * @see https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rules/heading-has-content.html
   */
  'vue-a11y/heading-has-content'?: Linter.RuleEntry<VueA11YHeadingHasContent>;
  /**
   * @see https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rules/iframe-has-title.html
   */
  'vue-a11y/iframe-has-title'?: Linter.RuleEntry<[]>;
  /**
   * @see https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rules/interactive-supports-focus.html
   */
  'vue-a11y/interactive-supports-focus'?: Linter.RuleEntry<VueA11YInteractiveSupportsFocus>;
  /**
   * @see https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rules/label-has-for.html
   */
  'vue-a11y/label-has-for'?: Linter.RuleEntry<VueA11YLabelHasFor>;
  /**
   * @see https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rules/media-has-caption.html
   */
  'vue-a11y/media-has-caption'?: Linter.RuleEntry<VueA11YMediaHasCaption>;
  /**
   * @see https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rules/mouse-events-have-key-events.html
   */
  'vue-a11y/mouse-events-have-key-events'?: Linter.RuleEntry<[]>;
  /**
   * @see https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rules/no-access-key.html
   */
  'vue-a11y/no-access-key'?: Linter.RuleEntry<[]>;
  /**
   * @see https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rules/no-aria-hidden-on-focusable.html
   */
  'vue-a11y/no-aria-hidden-on-focusable'?: Linter.RuleEntry<[]>;
  /**
   * @see https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rules/no-autofocus.html
   */
  'vue-a11y/no-autofocus'?: Linter.RuleEntry<VueA11YNoAutofocus>;
  /**
   * @see https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rules/no-distracting-elements.html
   */
  'vue-a11y/no-distracting-elements'?: Linter.RuleEntry<VueA11YNoDistractingElements>;
  /**
   * @see https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rules/no-onchange.html
   * @deprecated
   */
  'vue-a11y/no-onchange'?: Linter.RuleEntry<[]>;
  /**
   * @see https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rules/no-redundant-roles.html
   */
  'vue-a11y/no-redundant-roles'?: Linter.RuleEntry<VueA11YNoRedundantRoles>;
  /**
   * @see https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rules/no-role-presentation-on-focusable.html
   */
  'vue-a11y/no-role-presentation-on-focusable'?: Linter.RuleEntry<[]>;
  /**
   * @see https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rules/no-static-element-interactions.html
   */
  'vue-a11y/no-static-element-interactions'?: Linter.RuleEntry<[]>;
  /**
   * @see https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rules/role-has-required-aria-props.html
   */
  'vue-a11y/role-has-required-aria-props'?: Linter.RuleEntry<[]>;
  /**
   * @see https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rules/tabindex-no-positive.html
   */
  'vue-a11y/tabindex-no-positive'?: Linter.RuleEntry<[]>;
  /**
   * Enforce linebreaks after opening and before closing array brackets in `<template>`
   * @see https://eslint.vuejs.org/rules/array-bracket-newline.html
   */
  'vue/array-bracket-newline'?: Linter.RuleEntry<VueArrayBracketNewline>;
  /**
   * Enforce consistent spacing inside array brackets in `<template>`
   * @see https://eslint.vuejs.org/rules/array-bracket-spacing.html
   */
  'vue/array-bracket-spacing'?: Linter.RuleEntry<VueArrayBracketSpacing>;
  /**
   * Enforce line breaks after each array element in `<template>`
   * @see https://eslint.vuejs.org/rules/array-element-newline.html
   */
  'vue/array-element-newline'?: Linter.RuleEntry<VueArrayElementNewline>;
  /**
   * Enforce consistent spacing before and after the arrow in arrow functions in `<template>`
   * @see https://eslint.vuejs.org/rules/arrow-spacing.html
   */
  'vue/arrow-spacing'?: Linter.RuleEntry<VueArrowSpacing>;
  /**
   * enforce attribute naming style on custom components in template
   * @see https://eslint.vuejs.org/rules/attribute-hyphenation.html
   */
  'vue/attribute-hyphenation'?: Linter.RuleEntry<VueAttributeHyphenation>;
  /**
   * enforce order of attributes
   * @see https://eslint.vuejs.org/rules/attributes-order.html
   */
  'vue/attributes-order'?: Linter.RuleEntry<VueAttributesOrder>;
  /**
   * disallow use other than available `lang`
   * @see https://eslint.vuejs.org/rules/block-lang.html
   */
  'vue/block-lang'?: Linter.RuleEntry<VueBlockLang>;
  /**
   * enforce order of component top-level elements
   * @see https://eslint.vuejs.org/rules/block-order.html
   */
  'vue/block-order'?: Linter.RuleEntry<VueBlockOrder>;
  /**
   * Disallow or enforce spaces inside of blocks after opening block and before closing block in `<template>`
   * @see https://eslint.vuejs.org/rules/block-spacing.html
   */
  'vue/block-spacing'?: Linter.RuleEntry<VueBlockSpacing>;
  /**
   * enforce line breaks after opening and before closing block-level tags
   * @see https://eslint.vuejs.org/rules/block-tag-newline.html
   */
  'vue/block-tag-newline'?: Linter.RuleEntry<VueBlockTagNewline>;
  /**
   * Enforce consistent brace style for blocks in `<template>`
   * @see https://eslint.vuejs.org/rules/brace-style.html
   */
  'vue/brace-style'?: Linter.RuleEntry<VueBraceStyle>;
  /**
   * Enforce camelcase naming convention in `<template>`
   * @see https://eslint.vuejs.org/rules/camelcase.html
   */
  'vue/camelcase'?: Linter.RuleEntry<VueCamelcase>;
  /**
   * Require or disallow trailing commas in `<template>`
   * @see https://eslint.vuejs.org/rules/comma-dangle.html
   */
  'vue/comma-dangle'?: Linter.RuleEntry<VueCommaDangle>;
  /**
   * Enforce consistent spacing before and after commas in `<template>`
   * @see https://eslint.vuejs.org/rules/comma-spacing.html
   */
  'vue/comma-spacing'?: Linter.RuleEntry<VueCommaSpacing>;
  /**
   * Enforce consistent comma style in `<template>`
   * @see https://eslint.vuejs.org/rules/comma-style.html
   */
  'vue/comma-style'?: Linter.RuleEntry<VueCommaStyle>;
  /**
   * support comment-directives in `<template>`
   * @see https://eslint.vuejs.org/rules/comment-directive.html
   */
  'vue/comment-directive'?: Linter.RuleEntry<VueCommentDirective>;
  /**
   * enforce component API style
   * @see https://eslint.vuejs.org/rules/component-api-style.html
   */
  'vue/component-api-style'?: Linter.RuleEntry<VueComponentApiStyle>;
  /**
   * enforce specific casing for component definition name
   * @see https://eslint.vuejs.org/rules/component-definition-name-casing.html
   */
  'vue/component-definition-name-casing'?: Linter.RuleEntry<VueComponentDefinitionNameCasing>;
  /**
   * enforce specific casing for the component naming style in template
   * @see https://eslint.vuejs.org/rules/component-name-in-template-casing.html
   */
  'vue/component-name-in-template-casing'?: Linter.RuleEntry<VueComponentNameInTemplateCasing>;
  /**
   * enforce the casing of component name in `components` options
   * @see https://eslint.vuejs.org/rules/component-options-name-casing.html
   */
  'vue/component-options-name-casing'?: Linter.RuleEntry<VueComponentOptionsNameCasing>;
  /**
   * enforce specific casing for custom event name
   * @see https://eslint.vuejs.org/rules/custom-event-name-casing.html
   */
  'vue/custom-event-name-casing'?: Linter.RuleEntry<VueCustomEventNameCasing>;
  /**
   * enforce declaration style of `defineEmits`
   * @see https://eslint.vuejs.org/rules/define-emits-declaration.html
   */
  'vue/define-emits-declaration'?: Linter.RuleEntry<VueDefineEmitsDeclaration>;
  /**
   * enforce order of compiler macros (`defineProps`, `defineEmits`, etc.)
   * @see https://eslint.vuejs.org/rules/define-macros-order.html
   */
  'vue/define-macros-order'?: Linter.RuleEntry<VueDefineMacrosOrder>;
  /**
   * enforce declaration style of `defineProps`
   * @see https://eslint.vuejs.org/rules/define-props-declaration.html
   */
  'vue/define-props-declaration'?: Linter.RuleEntry<VueDefinePropsDeclaration>;
  /**
   * enforce consistent style for props destructuring
   * @see https://eslint.vuejs.org/rules/define-props-destructuring.html
   */
  'vue/define-props-destructuring'?: Linter.RuleEntry<VueDefinePropsDestructuring>;
  /**
   * Enforce consistent newlines before and after dots in `<template>`
   * @see https://eslint.vuejs.org/rules/dot-location.html
   */
  'vue/dot-location'?: Linter.RuleEntry<VueDotLocation>;
  /**
   * Enforce dot notation whenever possible in `<template>`
   * @see https://eslint.vuejs.org/rules/dot-notation.html
   */
  'vue/dot-notation'?: Linter.RuleEntry<VueDotNotation>;
  /**
   * enforce or forbid the use of the `scoped` and `module` attributes in SFC top level style tags
   * @see https://eslint.vuejs.org/rules/enforce-style-attribute.html
   */
  'vue/enforce-style-attribute'?: Linter.RuleEntry<VueEnforceStyleAttribute>;
  /**
   * Require the use of `===` and `!==` in `<template>`
   * @see https://eslint.vuejs.org/rules/eqeqeq.html
   */
  'vue/eqeqeq'?: Linter.RuleEntry<VueEqeqeq>;
  /**
   * enforce the location of first attribute
   * @see https://eslint.vuejs.org/rules/first-attribute-linebreak.html
   */
  'vue/first-attribute-linebreak'?: Linter.RuleEntry<VueFirstAttributeLinebreak>;
  /**
   * Require or disallow spacing between function identifiers and their invocations in `<template>`
   * @see https://eslint.vuejs.org/rules/func-call-spacing.html
   */
  'vue/func-call-spacing'?: Linter.RuleEntry<VueFuncCallSpacing>;
  /**
   * disallow usage of button without an explicit type attribute
   * @see https://eslint.vuejs.org/rules/html-button-has-type.html
   */
  'vue/html-button-has-type'?: Linter.RuleEntry<VueHtmlButtonHasType>;
  /**
   * require or disallow a line break before tag's closing brackets
   * @see https://eslint.vuejs.org/rules/html-closing-bracket-newline.html
   */
  'vue/html-closing-bracket-newline'?: Linter.RuleEntry<VueHtmlClosingBracketNewline>;
  /**
   * require or disallow a space before tag's closing brackets
   * @see https://eslint.vuejs.org/rules/html-closing-bracket-spacing.html
   */
  'vue/html-closing-bracket-spacing'?: Linter.RuleEntry<VueHtmlClosingBracketSpacing>;
  /**
   * enforce unified line break in HTML comments
   * @see https://eslint.vuejs.org/rules/html-comment-content-newline.html
   */
  'vue/html-comment-content-newline'?: Linter.RuleEntry<VueHtmlCommentContentNewline>;
  /**
   * enforce unified spacing in HTML comments
   * @see https://eslint.vuejs.org/rules/html-comment-content-spacing.html
   */
  'vue/html-comment-content-spacing'?: Linter.RuleEntry<VueHtmlCommentContentSpacing>;
  /**
   * enforce consistent indentation in HTML comments
   * @see https://eslint.vuejs.org/rules/html-comment-indent.html
   */
  'vue/html-comment-indent'?: Linter.RuleEntry<VueHtmlCommentIndent>;
  /**
   * enforce end tag style
   * @see https://eslint.vuejs.org/rules/html-end-tags.html
   */
  'vue/html-end-tags'?: Linter.RuleEntry<[]>;
  /**
   * enforce consistent indentation in `<template>`
   * @see https://eslint.vuejs.org/rules/html-indent.html
   */
  'vue/html-indent'?: Linter.RuleEntry<VueHtmlIndent>;
  /**
   * enforce quotes style of HTML attributes
   * @see https://eslint.vuejs.org/rules/html-quotes.html
   */
  'vue/html-quotes'?: Linter.RuleEntry<VueHtmlQuotes>;
  /**
   * enforce self-closing style
   * @see https://eslint.vuejs.org/rules/html-self-closing.html
   */
  'vue/html-self-closing'?: Linter.RuleEntry<VueHtmlSelfClosing>;
  /**
   * prevent variables used in JSX to be marked as unused
   * @see https://eslint.vuejs.org/rules/jsx-uses-vars.html
   */
  'vue/jsx-uses-vars'?: Linter.RuleEntry<[]>;
  /**
   * Enforce consistent spacing between keys and values in object literal properties in `<template>`
   * @see https://eslint.vuejs.org/rules/key-spacing.html
   */
  'vue/key-spacing'?: Linter.RuleEntry<VueKeySpacing>;
  /**
   * Enforce consistent spacing before and after keywords in `<template>`
   * @see https://eslint.vuejs.org/rules/keyword-spacing.html
   */
  'vue/keyword-spacing'?: Linter.RuleEntry<VueKeywordSpacing>;
  /**
   * require component name property to match its file name
   * @see https://eslint.vuejs.org/rules/match-component-file-name.html
   */
  'vue/match-component-file-name'?: Linter.RuleEntry<VueMatchComponentFileName>;
  /**
   * require the registered component name to match the imported component name
   * @see https://eslint.vuejs.org/rules/match-component-import-name.html
   */
  'vue/match-component-import-name'?: Linter.RuleEntry<[]>;
  /**
   * enforce the maximum number of attributes per line
   * @see https://eslint.vuejs.org/rules/max-attributes-per-line.html
   */
  'vue/max-attributes-per-line'?: Linter.RuleEntry<VueMaxAttributesPerLine>;
  /**
   * enforce a maximum line length in `.vue` files
   * @see https://eslint.vuejs.org/rules/max-len.html
   */
  'vue/max-len'?: Linter.RuleEntry<VueMaxLen>;
  /**
   * enforce maximum number of lines in Vue SFC blocks
   * @see https://eslint.vuejs.org/rules/max-lines-per-block.html
   */
  'vue/max-lines-per-block'?: Linter.RuleEntry<VueMaxLinesPerBlock>;
  /**
   * enforce maximum number of props in Vue component
   * @see https://eslint.vuejs.org/rules/max-props.html
   */
  'vue/max-props'?: Linter.RuleEntry<VueMaxProps>;
  /**
   * enforce maximum depth of template
   * @see https://eslint.vuejs.org/rules/max-template-depth.html
   */
  'vue/max-template-depth'?: Linter.RuleEntry<VueMaxTemplateDepth>;
  /**
   * require component names to be always multi-word
   * @see https://eslint.vuejs.org/rules/multi-word-component-names.html
   */
  'vue/multi-word-component-names'?: Linter.RuleEntry<VueMultiWordComponentNames>;
  /**
   * require a line break before and after the contents of a multiline element
   * @see https://eslint.vuejs.org/rules/multiline-html-element-content-newline.html
   */
  'vue/multiline-html-element-content-newline'?: Linter.RuleEntry<VueMultilineHtmlElementContentNewline>;
  /**
   * Enforce newlines between operands of ternary expressions in `<template>`
   * @see https://eslint.vuejs.org/rules/multiline-ternary.html
   */
  'vue/multiline-ternary'?: Linter.RuleEntry<VueMultilineTernary>;
  /**
   * enforce unified spacing in mustache interpolations
   * @see https://eslint.vuejs.org/rules/mustache-interpolation-spacing.html
   */
  'vue/mustache-interpolation-spacing'?: Linter.RuleEntry<VueMustacheInterpolationSpacing>;
  /**
   * enforce new lines between multi-line properties in Vue components
   * @see https://eslint.vuejs.org/rules/new-line-between-multi-line-property.html
   */
  'vue/new-line-between-multi-line-property'?: Linter.RuleEntry<VueNewLineBetweenMultiLineProperty>;
  /**
   * enforce Promise or callback style in `nextTick`
   * @see https://eslint.vuejs.org/rules/next-tick-style.html
   */
  'vue/next-tick-style'?: Linter.RuleEntry<VueNextTickStyle>;
  /**
   * disallow using arrow functions to define watcher
   * @see https://eslint.vuejs.org/rules/no-arrow-functions-in-watch.html
   */
  'vue/no-arrow-functions-in-watch'?: Linter.RuleEntry<[]>;
  /**
   * disallow asynchronous actions in computed properties
   * @see https://eslint.vuejs.org/rules/no-async-in-computed-properties.html
   */
  'vue/no-async-in-computed-properties'?: Linter.RuleEntry<VueNoAsyncInComputedProperties>;
  /**
   * disallow the use of bare strings in `<template>`
   * @see https://eslint.vuejs.org/rules/no-bare-strings-in-template.html
   */
  'vue/no-bare-strings-in-template'?: Linter.RuleEntry<VueNoBareStringsInTemplate>;
  /**
   * disallow boolean defaults
   * @see https://eslint.vuejs.org/rules/no-boolean-default.html
   */
  'vue/no-boolean-default'?: Linter.RuleEntry<VueNoBooleanDefault>;
  /**
   * disallow element's child contents which would be overwritten by a directive like `v-html` or `v-text`
   * @see https://eslint.vuejs.org/rules/no-child-content.html
   */
  'vue/no-child-content'?: Linter.RuleEntry<VueNoChildContent>;
  /**
   * disallow accessing computed properties in `data`
   * @see https://eslint.vuejs.org/rules/no-computed-properties-in-data.html
   */
  'vue/no-computed-properties-in-data'?: Linter.RuleEntry<[]>;
  /**
   * Disallow the use of `console` in `<template>`
   * @see https://eslint.vuejs.org/rules/no-console.html
   */
  'vue/no-console'?: Linter.RuleEntry<VueNoConsole>;
  /**
   * Disallow constant expressions in conditions in `<template>`
   * @see https://eslint.vuejs.org/rules/no-constant-condition.html
   */
  'vue/no-constant-condition'?: Linter.RuleEntry<VueNoConstantCondition>;
  /**
   * disallow custom modifiers on v-model used on the component
   * @see https://eslint.vuejs.org/rules/no-custom-modifiers-on-v-model.html
   */
  'vue/no-custom-modifiers-on-v-model'?: Linter.RuleEntry<[]>;
  /**
   * disallow using deprecated object declaration on data (in Vue.js 3.0.0+)
   * @see https://eslint.vuejs.org/rules/no-deprecated-data-object-declaration.html
   */
  'vue/no-deprecated-data-object-declaration'?: Linter.RuleEntry<[]>;
  /**
   * disallow using deprecated `$delete` and `$set` (in Vue.js 3.0.0+)
   * @see https://eslint.vuejs.org/rules/no-deprecated-delete-set.html
   */
  'vue/no-deprecated-delete-set'?: Linter.RuleEntry<[]>;
  /**
   * disallow using deprecated `destroyed` and `beforeDestroy` lifecycle hooks (in Vue.js 3.0.0+)
   * @see https://eslint.vuejs.org/rules/no-deprecated-destroyed-lifecycle.html
   */
  'vue/no-deprecated-destroyed-lifecycle'?: Linter.RuleEntry<[]>;
  /**
   * disallow using deprecated `$listeners` (in Vue.js 3.0.0+)
   * @see https://eslint.vuejs.org/rules/no-deprecated-dollar-listeners-api.html
   */
  'vue/no-deprecated-dollar-listeners-api'?: Linter.RuleEntry<[]>;
  /**
   * disallow using deprecated `$scopedSlots` (in Vue.js 3.0.0+)
   * @see https://eslint.vuejs.org/rules/no-deprecated-dollar-scopedslots-api.html
   */
  'vue/no-deprecated-dollar-scopedslots-api'?: Linter.RuleEntry<[]>;
  /**
   * disallow using deprecated events api (in Vue.js 3.0.0+)
   * @see https://eslint.vuejs.org/rules/no-deprecated-events-api.html
   */
  'vue/no-deprecated-events-api'?: Linter.RuleEntry<[]>;
  /**
   * disallow using deprecated filters syntax (in Vue.js 3.0.0+)
   * @see https://eslint.vuejs.org/rules/no-deprecated-filter.html
   */
  'vue/no-deprecated-filter'?: Linter.RuleEntry<[]>;
  /**
   * disallow using deprecated the `functional` template (in Vue.js 3.0.0+)
   * @see https://eslint.vuejs.org/rules/no-deprecated-functional-template.html
   */
  'vue/no-deprecated-functional-template'?: Linter.RuleEntry<[]>;
  /**
   * disallow using deprecated the `is` attribute on HTML elements (in Vue.js 3.0.0+)
   * @see https://eslint.vuejs.org/rules/no-deprecated-html-element-is.html
   */
  'vue/no-deprecated-html-element-is'?: Linter.RuleEntry<[]>;
  /**
   * disallow using deprecated `inline-template` attribute (in Vue.js 3.0.0+)
   * @see https://eslint.vuejs.org/rules/no-deprecated-inline-template.html
   */
  'vue/no-deprecated-inline-template'?: Linter.RuleEntry<[]>;
  /**
   * disallow deprecated `model` definition (in Vue.js 3.0.0+)
   * @see https://eslint.vuejs.org/rules/no-deprecated-model-definition.html
   */
  'vue/no-deprecated-model-definition'?: Linter.RuleEntry<VueNoDeprecatedModelDefinition>;
  /**
   * disallow deprecated `this` access in props default function (in Vue.js 3.0.0+)
   * @see https://eslint.vuejs.org/rules/no-deprecated-props-default-this.html
   */
  'vue/no-deprecated-props-default-this'?: Linter.RuleEntry<[]>;
  /**
   * disallow using deprecated `tag` property on `RouterLink` (in Vue.js 3.0.0+)
   * @see https://eslint.vuejs.org/rules/no-deprecated-router-link-tag-prop.html
   */
  'vue/no-deprecated-router-link-tag-prop'?: Linter.RuleEntry<VueNoDeprecatedRouterLinkTagProp>;
  /**
   * disallow deprecated `scope` attribute (in Vue.js 2.5.0+)
   * @see https://eslint.vuejs.org/rules/no-deprecated-scope-attribute.html
   */
  'vue/no-deprecated-scope-attribute'?: Linter.RuleEntry<[]>;
  /**
   * disallow deprecated `slot` attribute (in Vue.js 2.6.0+)
   * @see https://eslint.vuejs.org/rules/no-deprecated-slot-attribute.html
   */
  'vue/no-deprecated-slot-attribute'?: Linter.RuleEntry<VueNoDeprecatedSlotAttribute>;
  /**
   * disallow deprecated `slot-scope` attribute (in Vue.js 2.6.0+)
   * @see https://eslint.vuejs.org/rules/no-deprecated-slot-scope-attribute.html
   */
  'vue/no-deprecated-slot-scope-attribute'?: Linter.RuleEntry<[]>;
  /**
   * disallow use of deprecated `.sync` modifier on `v-bind` directive (in Vue.js 3.0.0+)
   * @see https://eslint.vuejs.org/rules/no-deprecated-v-bind-sync.html
   */
  'vue/no-deprecated-v-bind-sync'?: Linter.RuleEntry<[]>;
  /**
   * disallow deprecated `v-is` directive (in Vue.js 3.1.0+)
   * @see https://eslint.vuejs.org/rules/no-deprecated-v-is.html
   */
  'vue/no-deprecated-v-is'?: Linter.RuleEntry<[]>;
  /**
   * disallow using deprecated `.native` modifiers (in Vue.js 3.0.0+)
   * @see https://eslint.vuejs.org/rules/no-deprecated-v-on-native-modifier.html
   */
  'vue/no-deprecated-v-on-native-modifier'?: Linter.RuleEntry<[]>;
  /**
   * disallow using deprecated number (keycode) modifiers (in Vue.js 3.0.0+)
   * @see https://eslint.vuejs.org/rules/no-deprecated-v-on-number-modifiers.html
   */
  'vue/no-deprecated-v-on-number-modifiers'?: Linter.RuleEntry<[]>;
  /**
   * disallow using deprecated `Vue.config.keyCodes` (in Vue.js 3.0.0+)
   * @see https://eslint.vuejs.org/rules/no-deprecated-vue-config-keycodes.html
   */
  'vue/no-deprecated-vue-config-keycodes'?: Linter.RuleEntry<[]>;
  /**
   * disallow duplication of field names
   * @see https://eslint.vuejs.org/rules/no-dupe-keys.html
   */
  'vue/no-dupe-keys'?: Linter.RuleEntry<VueNoDupeKeys>;
  /**
   * disallow duplicate conditions in `v-if` / `v-else-if` chains
   * @see https://eslint.vuejs.org/rules/no-dupe-v-else-if.html
   */
  'vue/no-dupe-v-else-if'?: Linter.RuleEntry<[]>;
  /**
   * enforce `inheritAttrs` to be set to `false` when using `v-bind="$attrs"`
   * @see https://eslint.vuejs.org/rules/no-duplicate-attr-inheritance.html
   */
  'vue/no-duplicate-attr-inheritance'?: Linter.RuleEntry<VueNoDuplicateAttrInheritance>;
  /**
   * disallow duplication of attributes
   * @see https://eslint.vuejs.org/rules/no-duplicate-attributes.html
   */
  'vue/no-duplicate-attributes'?: Linter.RuleEntry<VueNoDuplicateAttributes>;
  /**
   * disallow duplication of class names in class attributes
   * @see https://eslint.vuejs.org/rules/no-duplicate-class-names.html
   */
  'vue/no-duplicate-class-names'?: Linter.RuleEntry<[]>;
  /**
   * disallow the `<template>` `<script>` `<style>` block to be empty
   * @see https://eslint.vuejs.org/rules/no-empty-component-block.html
   */
  'vue/no-empty-component-block'?: Linter.RuleEntry<[]>;
  /**
   * Disallow empty destructuring patterns in `<template>`
   * @see https://eslint.vuejs.org/rules/no-empty-pattern.html
   */
  'vue/no-empty-pattern'?: Linter.RuleEntry<VueNoEmptyPattern>;
  /**
   * disallow `export` in `<script setup>`
   * @see https://eslint.vuejs.org/rules/no-export-in-script-setup.html
   */
  'vue/no-export-in-script-setup'?: Linter.RuleEntry<[]>;
  /**
   * disallow asynchronously registered `expose`
   * @see https://eslint.vuejs.org/rules/no-expose-after-await.html
   */
  'vue/no-expose-after-await'?: Linter.RuleEntry<[]>;
  /**
   * Disallow unnecessary parentheses in `<template>`
   * @see https://eslint.vuejs.org/rules/no-extra-parens.html
   */
  'vue/no-extra-parens'?: Linter.RuleEntry<VueNoExtraParens>;
  /**
   * Disallow shorthand type conversions in `<template>`
   * @see https://eslint.vuejs.org/rules/no-implicit-coercion.html
   */
  'vue/no-implicit-coercion'?: Linter.RuleEntry<VueNoImplicitCoercion>;
  /**
   * disallow importing Vue compiler macros
   * @see https://eslint.vuejs.org/rules/no-import-compiler-macros.html
   */
  'vue/no-import-compiler-macros'?: Linter.RuleEntry<[]>;
  /**
   * disallow irregular whitespace in `.vue` files
   * @see https://eslint.vuejs.org/rules/no-irregular-whitespace.html
   */
  'vue/no-irregular-whitespace'?: Linter.RuleEntry<VueNoIrregularWhitespace>;
  /**
   * disallow asynchronously registered lifecycle hooks
   * @see https://eslint.vuejs.org/rules/no-lifecycle-after-await.html
   */
  'vue/no-lifecycle-after-await'?: Linter.RuleEntry<[]>;
  /**
   * disallow unnecessary `<template>`
   * @see https://eslint.vuejs.org/rules/no-lone-template.html
   */
  'vue/no-lone-template'?: Linter.RuleEntry<VueNoLoneTemplate>;
  /**
   * Disallow literal numbers that lose precision in `<template>`
   * @see https://eslint.vuejs.org/rules/no-loss-of-precision.html
   */
  'vue/no-loss-of-precision'?: Linter.RuleEntry<[]>;
  /**
   * disallow multiple spaces
   * @see https://eslint.vuejs.org/rules/no-multi-spaces.html
   */
  'vue/no-multi-spaces'?: Linter.RuleEntry<VueNoMultiSpaces>;
  /**
   * disallow passing multiple objects in an array to class
   * @see https://eslint.vuejs.org/rules/no-multiple-objects-in-class.html
   */
  'vue/no-multiple-objects-in-class'?: Linter.RuleEntry<[]>;
  /**
   * disallow passing multiple arguments to scoped slots
   * @see https://eslint.vuejs.org/rules/no-multiple-slot-args.html
   */
  'vue/no-multiple-slot-args'?: Linter.RuleEntry<[]>;
  /**
   * disallow adding multiple root nodes to the template
   * @see https://eslint.vuejs.org/rules/no-multiple-template-root.html
   */
  'vue/no-multiple-template-root'?: Linter.RuleEntry<VueNoMultipleTemplateRoot>;
  /**
   * disallow mutation of component props
   * @see https://eslint.vuejs.org/rules/no-mutating-props.html
   */
  'vue/no-mutating-props'?: Linter.RuleEntry<VueNoMutatingProps>;
  /**
   * Disallow negated conditions in `<template>`
   * @see https://eslint.vuejs.org/rules/no-negated-condition.html
   */
  'vue/no-negated-condition'?: Linter.RuleEntry<[]>;
  /**
   * disallow negated conditions in v-if/v-else
   * @see https://eslint.vuejs.org/rules/no-negated-v-if-condition.html
   */
  'vue/no-negated-v-if-condition'?: Linter.RuleEntry<[]>;
  /**
   * disallow parsing errors in `<template>`
   * @see https://eslint.vuejs.org/rules/no-parsing-error.html
   */
  'vue/no-parsing-error'?: Linter.RuleEntry<VueNoParsingError>;
  /**
   * disallow a potential typo in your component property
   * @see https://eslint.vuejs.org/rules/no-potential-component-option-typo.html
   */
  'vue/no-potential-component-option-typo'?: Linter.RuleEntry<VueNoPotentialComponentOptionTypo>;
  /**
   * disallow use of value wrapped by `ref()` (Composition API) as an operand
   * @see https://eslint.vuejs.org/rules/no-ref-as-operand.html
   */
  'vue/no-ref-as-operand'?: Linter.RuleEntry<[]>;
  /**
   * disallow usages of ref objects that can lead to loss of reactivity
   * @see https://eslint.vuejs.org/rules/no-ref-object-reactivity-loss.html
   */
  'vue/no-ref-object-reactivity-loss'?: Linter.RuleEntry<[]>;
  /**
   * enforce props with default values to be optional
   * @see https://eslint.vuejs.org/rules/no-required-prop-with-default.html
   */
  'vue/no-required-prop-with-default'?: Linter.RuleEntry<VueNoRequiredPropWithDefault>;
  /**
   * disallow the use of reserved names in component definitions
   * @see https://eslint.vuejs.org/rules/no-reserved-component-names.html
   */
  'vue/no-reserved-component-names'?: Linter.RuleEntry<VueNoReservedComponentNames>;
  /**
   * disallow overwriting reserved keys
   * @see https://eslint.vuejs.org/rules/no-reserved-keys.html
   */
  'vue/no-reserved-keys'?: Linter.RuleEntry<VueNoReservedKeys>;
  /**
   * disallow reserved names in props
   * @see https://eslint.vuejs.org/rules/no-reserved-props.html
   */
  'vue/no-reserved-props'?: Linter.RuleEntry<VueNoReservedProps>;
  /**
   * disallow specific block
   * @see https://eslint.vuejs.org/rules/no-restricted-block.html
   */
  'vue/no-restricted-block'?: Linter.RuleEntry<VueNoRestrictedBlock>;
  /**
   * disallow asynchronously called restricted methods
   * @see https://eslint.vuejs.org/rules/no-restricted-call-after-await.html
   */
  'vue/no-restricted-call-after-await'?: Linter.RuleEntry<VueNoRestrictedCallAfterAwait>;
  /**
   * disallow specific classes in Vue components
   * @see https://eslint.vuejs.org/rules/no-restricted-class.html
   */
  'vue/no-restricted-class'?: Linter.RuleEntry<VueNoRestrictedClass>;
  /**
   * disallow specific component names
   * @see https://eslint.vuejs.org/rules/no-restricted-component-names.html
   */
  'vue/no-restricted-component-names'?: Linter.RuleEntry<VueNoRestrictedComponentNames>;
  /**
   * disallow specific component option
   * @see https://eslint.vuejs.org/rules/no-restricted-component-options.html
   */
  'vue/no-restricted-component-options'?: Linter.RuleEntry<VueNoRestrictedComponentOptions>;
  /**
   * disallow specific custom event
   * @see https://eslint.vuejs.org/rules/no-restricted-custom-event.html
   */
  'vue/no-restricted-custom-event'?: Linter.RuleEntry<VueNoRestrictedCustomEvent>;
  /**
   * disallow specific elements
   * @see https://eslint.vuejs.org/rules/no-restricted-html-elements.html
   */
  'vue/no-restricted-html-elements'?: Linter.RuleEntry<VueNoRestrictedHtmlElements>;
  /**
   * disallow specific props
   * @see https://eslint.vuejs.org/rules/no-restricted-props.html
   */
  'vue/no-restricted-props'?: Linter.RuleEntry<VueNoRestrictedProps>;
  /**
   * disallow specific attribute
   * @see https://eslint.vuejs.org/rules/no-restricted-static-attribute.html
   */
  'vue/no-restricted-static-attribute'?: Linter.RuleEntry<VueNoRestrictedStaticAttribute>;
  /**
   * Disallow specified syntax in `<template>`
   * @see https://eslint.vuejs.org/rules/no-restricted-syntax.html
   */
  'vue/no-restricted-syntax'?: Linter.RuleEntry<VueNoRestrictedSyntax>;
  /**
   * disallow specific argument in `v-bind`
   * @see https://eslint.vuejs.org/rules/no-restricted-v-bind.html
   */
  'vue/no-restricted-v-bind'?: Linter.RuleEntry<VueNoRestrictedVBind>;
  /**
   * disallow specific argument in `v-on`
   * @see https://eslint.vuejs.org/rules/no-restricted-v-on.html
   */
  'vue/no-restricted-v-on'?: Linter.RuleEntry<VueNoRestrictedVOn>;
  /**
   * disallow `v-if` directives on root element
   * @see https://eslint.vuejs.org/rules/no-root-v-if.html
   */
  'vue/no-root-v-if'?: Linter.RuleEntry<[]>;
  /**
   * disallow usages that lose the reactivity of `props` passed to `setup`
   * @see https://eslint.vuejs.org/rules/no-setup-props-reactivity-loss.html
   */
  'vue/no-setup-props-reactivity-loss'?: Linter.RuleEntry<[]>;
  /**
   * enforce component's data property to be a function
   * @see https://eslint.vuejs.org/rules/no-shared-component-data.html
   */
  'vue/no-shared-component-data'?: Linter.RuleEntry<[]>;
  /**
   * disallow side effects in computed properties
   * @see https://eslint.vuejs.org/rules/no-side-effects-in-computed-properties.html
   */
  'vue/no-side-effects-in-computed-properties'?: Linter.RuleEntry<[]>;
  /**
   * disallow spaces around equal signs in attribute
   * @see https://eslint.vuejs.org/rules/no-spaces-around-equal-signs-in-attribute.html
   */
  'vue/no-spaces-around-equal-signs-in-attribute'?: Linter.RuleEntry<[]>;
  /**
   * Disallow sparse arrays in `<template>`
   * @see https://eslint.vuejs.org/rules/no-sparse-arrays.html
   */
  'vue/no-sparse-arrays'?: Linter.RuleEntry<[]>;
  /**
   * disallow static inline `style` attributes
   * @see https://eslint.vuejs.org/rules/no-static-inline-styles.html
   */
  'vue/no-static-inline-styles'?: Linter.RuleEntry<VueNoStaticInlineStyles>;
  /**
   * disallow `key` attribute on `<template>`
   * @see https://eslint.vuejs.org/rules/no-template-key.html
   */
  'vue/no-template-key'?: Linter.RuleEntry<[]>;
  /**
   * disallow variable declarations from shadowing variables declared in the outer scope
   * @see https://eslint.vuejs.org/rules/no-template-shadow.html
   */
  'vue/no-template-shadow'?: Linter.RuleEntry<VueNoTemplateShadow>;
  /**
   * disallow target="_blank" attribute without rel="noopener noreferrer"
   * @see https://eslint.vuejs.org/rules/no-template-target-blank.html
   */
  'vue/no-template-target-blank'?: Linter.RuleEntry<VueNoTemplateTargetBlank>;
  /**
   * disallow mustaches in `<textarea>`
   * @see https://eslint.vuejs.org/rules/no-textarea-mustache.html
   */
  'vue/no-textarea-mustache'?: Linter.RuleEntry<[]>;
  /**
   * disallow `this` usage in a `beforeRouteEnter` method
   * @see https://eslint.vuejs.org/rules/no-this-in-before-route-enter.html
   */
  'vue/no-this-in-before-route-enter'?: Linter.RuleEntry<[]>;
  /**
   * disallow use of undefined components in `<template>`
   * @see https://eslint.vuejs.org/rules/no-undef-components.html
   */
  'vue/no-undef-components'?: Linter.RuleEntry<VueNoUndefComponents>;
  /**
   * disallow undefined properties
   * @see https://eslint.vuejs.org/rules/no-undef-properties.html
   */
  'vue/no-undef-properties'?: Linter.RuleEntry<VueNoUndefProperties>;
  /**
   * disallow unsupported Vue.js syntax on the specified version
   * @see https://eslint.vuejs.org/rules/no-unsupported-features.html
   */
  'vue/no-unsupported-features'?: Linter.RuleEntry<VueNoUnsupportedFeatures>;
  /**
   * disallow registering components that are not used inside templates
   * @see https://eslint.vuejs.org/rules/no-unused-components.html
   */
  'vue/no-unused-components'?: Linter.RuleEntry<VueNoUnusedComponents>;
  /**
   * disallow unused emit declarations
   * @see https://eslint.vuejs.org/rules/no-unused-emit-declarations.html
   */
  'vue/no-unused-emit-declarations'?: Linter.RuleEntry<[]>;
  /**
   * disallow unused properties
   * @see https://eslint.vuejs.org/rules/no-unused-properties.html
   */
  'vue/no-unused-properties'?: Linter.RuleEntry<VueNoUnusedProperties>;
  /**
   * disallow unused refs
   * @see https://eslint.vuejs.org/rules/no-unused-refs.html
   */
  'vue/no-unused-refs'?: Linter.RuleEntry<[]>;
  /**
   * disallow unused variable definitions of v-for directives or scope attributes
   * @see https://eslint.vuejs.org/rules/no-unused-vars.html
   */
  'vue/no-unused-vars'?: Linter.RuleEntry<VueNoUnusedVars>;
  /**
   * disallow use computed property like method
   * @see https://eslint.vuejs.org/rules/no-use-computed-property-like-method.html
   */
  'vue/no-use-computed-property-like-method'?: Linter.RuleEntry<[]>;
  /**
   * disallow using `v-else-if`/`v-else` on the same element as `v-for`
   * @see https://eslint.vuejs.org/rules/no-use-v-else-with-v-for.html
   */
  'vue/no-use-v-else-with-v-for'?: Linter.RuleEntry<[]>;
  /**
   * disallow using `v-if` on the same element as `v-for`
   * @see https://eslint.vuejs.org/rules/no-use-v-if-with-v-for.html
   */
  'vue/no-use-v-if-with-v-for'?: Linter.RuleEntry<VueNoUseVIfWithVFor>;
  /**
   * Disallow unnecessary concatenation of literals or template literals in `<template>`
   * @see https://eslint.vuejs.org/rules/no-useless-concat.html
   */
  'vue/no-useless-concat'?: Linter.RuleEntry<[]>;
  /**
   * disallow unnecessary mustache interpolations
   * @see https://eslint.vuejs.org/rules/no-useless-mustaches.html
   */
  'vue/no-useless-mustaches'?: Linter.RuleEntry<VueNoUselessMustaches>;
  /**
   * disallow useless attribute on `<template>`
   * @see https://eslint.vuejs.org/rules/no-useless-template-attributes.html
   */
  'vue/no-useless-template-attributes'?: Linter.RuleEntry<[]>;
  /**
   * disallow unnecessary `v-bind` directives
   * @see https://eslint.vuejs.org/rules/no-useless-v-bind.html
   */
  'vue/no-useless-v-bind'?: Linter.RuleEntry<VueNoUselessVBind>;
  /**
   * disallow `key` attribute on `<template v-for>`
   * @see https://eslint.vuejs.org/rules/no-v-for-template-key.html
   * @deprecated
   */
  'vue/no-v-for-template-key'?: Linter.RuleEntry<[]>;
  /**
   * disallow key of `<template v-for>` placed on child elements
   * @see https://eslint.vuejs.org/rules/no-v-for-template-key-on-child.html
   */
  'vue/no-v-for-template-key-on-child'?: Linter.RuleEntry<[]>;
  /**
   * disallow use of v-html to prevent XSS attack
   * @see https://eslint.vuejs.org/rules/no-v-html.html
   */
  'vue/no-v-html'?: Linter.RuleEntry<VueNoVHtml>;
  /**
   * disallow adding an argument to `v-model` used in custom component
   * @see https://eslint.vuejs.org/rules/no-v-model-argument.html
   * @deprecated
   */
  'vue/no-v-model-argument'?: Linter.RuleEntry<[]>;
  /**
   * disallow use of v-text
   * @see https://eslint.vuejs.org/rules/no-v-text.html
   */
  'vue/no-v-text'?: Linter.RuleEntry<[]>;
  /**
   * disallow v-text / v-html on component
   * @see https://eslint.vuejs.org/rules/no-v-text-v-html-on-component.html
   */
  'vue/no-v-text-v-html-on-component'?: Linter.RuleEntry<VueNoVTextVHtmlOnComponent>;
  /**
   * disallow asynchronously registered `watch`
   * @see https://eslint.vuejs.org/rules/no-watch-after-await.html
   */
  'vue/no-watch-after-await'?: Linter.RuleEntry<[]>;
  /**
   * Enforce consistent line breaks after opening and before closing braces in `<template>`
   * @see https://eslint.vuejs.org/rules/object-curly-newline.html
   */
  'vue/object-curly-newline'?: Linter.RuleEntry<VueObjectCurlyNewline>;
  /**
   * Enforce consistent spacing inside braces in `<template>`
   * @see https://eslint.vuejs.org/rules/object-curly-spacing.html
   */
  'vue/object-curly-spacing'?: Linter.RuleEntry<VueObjectCurlySpacing>;
  /**
   * Enforce placing object properties on separate lines in `<template>`
   * @see https://eslint.vuejs.org/rules/object-property-newline.html
   */
  'vue/object-property-newline'?: Linter.RuleEntry<VueObjectPropertyNewline>;
  /**
   * Require or disallow method and property shorthand syntax for object literals in `<template>`
   * @see https://eslint.vuejs.org/rules/object-shorthand.html
   */
  'vue/object-shorthand'?: Linter.RuleEntry<VueObjectShorthand>;
  /**
   * enforce that each component should be in its own file
   * @see https://eslint.vuejs.org/rules/one-component-per-file.html
   */
  'vue/one-component-per-file'?: Linter.RuleEntry<[]>;
  /**
   * Enforce consistent linebreak style for operators in `<template>`
   * @see https://eslint.vuejs.org/rules/operator-linebreak.html
   */
  'vue/operator-linebreak'?: Linter.RuleEntry<VueOperatorLinebreak>;
  /**
   * enforce order of properties in components
   * @see https://eslint.vuejs.org/rules/order-in-components.html
   */
  'vue/order-in-components'?: Linter.RuleEntry<VueOrderInComponents>;
  /**
   * require or disallow padding lines between blocks
   * @see https://eslint.vuejs.org/rules/padding-line-between-blocks.html
   */
  'vue/padding-line-between-blocks'?: Linter.RuleEntry<VuePaddingLineBetweenBlocks>;
  /**
   * require or disallow newlines between sibling tags in template
   * @see https://eslint.vuejs.org/rules/padding-line-between-tags.html
   */
  'vue/padding-line-between-tags'?: Linter.RuleEntry<VuePaddingLineBetweenTags>;
  /**
   * require or disallow padding lines in component definition
   * @see https://eslint.vuejs.org/rules/padding-lines-in-component-definition.html
   */
  'vue/padding-lines-in-component-definition'?: Linter.RuleEntry<VuePaddingLinesInComponentDefinition>;
  /**
   * enforce use of `defineOptions` instead of default export
   * @see https://eslint.vuejs.org/rules/prefer-define-options.html
   */
  'vue/prefer-define-options'?: Linter.RuleEntry<[]>;
  /**
   * enforce import from 'vue' instead of import from '@vue/*'
   * @see https://eslint.vuejs.org/rules/prefer-import-from-vue.html
   */
  'vue/prefer-import-from-vue'?: Linter.RuleEntry<[]>;
  /**
   * enforce `Boolean` comes first in component prop types
   * @see https://eslint.vuejs.org/rules/prefer-prop-type-boolean-first.html
   */
  'vue/prefer-prop-type-boolean-first'?: Linter.RuleEntry<[]>;
  /**
   * require static class names in template to be in a separate `class` attribute
   * @see https://eslint.vuejs.org/rules/prefer-separate-static-class.html
   */
  'vue/prefer-separate-static-class'?: Linter.RuleEntry<[]>;
  /**
   * Require template literals instead of string concatenation in `<template>`
   * @see https://eslint.vuejs.org/rules/prefer-template.html
   */
  'vue/prefer-template'?: Linter.RuleEntry<[]>;
  /**
   * require shorthand form attribute when `v-bind` value is `true`
   * @see https://eslint.vuejs.org/rules/prefer-true-attribute-shorthand.html
   */
  'vue/prefer-true-attribute-shorthand'?: Linter.RuleEntry<VuePreferTrueAttributeShorthand>;
  /**
   * require using `useTemplateRef` instead of `ref`/`shallowRef` for template refs
   * @see https://eslint.vuejs.org/rules/prefer-use-template-ref.html
   */
  'vue/prefer-use-template-ref'?: Linter.RuleEntry<[]>;
  /**
   * enforce specific casing for the Prop name in Vue components
   * @see https://eslint.vuejs.org/rules/prop-name-casing.html
   */
  'vue/prop-name-casing'?: Linter.RuleEntry<VuePropNameCasing>;
  /**
   * Require quotes around object literal property names in `<template>`
   * @see https://eslint.vuejs.org/rules/quote-props.html
   */
  'vue/quote-props'?: Linter.RuleEntry<VueQuoteProps>;
  /**
   * require `v-bind:is` of `<component>` elements
   * @see https://eslint.vuejs.org/rules/require-component-is.html
   */
  'vue/require-component-is'?: Linter.RuleEntry<[]>;
  /**
   * require components to be the default export
   * @see https://eslint.vuejs.org/rules/require-default-export.html
   */
  'vue/require-default-export'?: Linter.RuleEntry<[]>;
  /**
   * require default value for props
   * @see https://eslint.vuejs.org/rules/require-default-prop.html
   */
  'vue/require-default-prop'?: Linter.RuleEntry<[]>;
  /**
   * require the component to be directly exported
   * @see https://eslint.vuejs.org/rules/require-direct-export.html
   */
  'vue/require-direct-export'?: Linter.RuleEntry<VueRequireDirectExport>;
  /**
   * require type definitions in emits
   * @see https://eslint.vuejs.org/rules/require-emit-validator.html
   */
  'vue/require-emit-validator'?: Linter.RuleEntry<[]>;
  /**
   * require `emits` option with name triggered by `$emit()`
   * @see https://eslint.vuejs.org/rules/require-explicit-emits.html
   */
  'vue/require-explicit-emits'?: Linter.RuleEntry<VueRequireExplicitEmits>;
  /**
   * require slots to be explicitly defined
   * @see https://eslint.vuejs.org/rules/require-explicit-slots.html
   */
  'vue/require-explicit-slots'?: Linter.RuleEntry<[]>;
  /**
   * require declare public properties using `expose`
   * @see https://eslint.vuejs.org/rules/require-expose.html
   */
  'vue/require-expose'?: Linter.RuleEntry<[]>;
  /**
   * require a certain macro variable name
   * @see https://eslint.vuejs.org/rules/require-macro-variable-name.html
   */
  'vue/require-macro-variable-name'?: Linter.RuleEntry<VueRequireMacroVariableName>;
  /**
   * require a name property in Vue components
   * @see https://eslint.vuejs.org/rules/require-name-property.html
   */
  'vue/require-name-property'?: Linter.RuleEntry<[]>;
  /**
   * require props to have a comment
   * @see https://eslint.vuejs.org/rules/require-prop-comment.html
   */
  'vue/require-prop-comment'?: Linter.RuleEntry<VueRequirePropComment>;
  /**
   * require prop type to be a constructor
   * @see https://eslint.vuejs.org/rules/require-prop-type-constructor.html
   */
  'vue/require-prop-type-constructor'?: Linter.RuleEntry<[]>;
  /**
   * require type definitions in props
   * @see https://eslint.vuejs.org/rules/require-prop-types.html
   */
  'vue/require-prop-types'?: Linter.RuleEntry<[]>;
  /**
   * enforce render function to always return value
   * @see https://eslint.vuejs.org/rules/require-render-return.html
   */
  'vue/require-render-return'?: Linter.RuleEntry<[]>;
  /**
   * enforce properties of `$slots` to be used as a function
   * @see https://eslint.vuejs.org/rules/require-slots-as-functions.html
   */
  'vue/require-slots-as-functions'?: Linter.RuleEntry<[]>;
  /**
   * require control the display of the content inside `<transition>`
   * @see https://eslint.vuejs.org/rules/require-toggle-inside-transition.html
   */
  'vue/require-toggle-inside-transition'?: Linter.RuleEntry<VueRequireToggleInsideTransition>;
  /**
   * enforce adding type declarations to object props
   * @see https://eslint.vuejs.org/rules/require-typed-object-prop.html
   */
  'vue/require-typed-object-prop'?: Linter.RuleEntry<[]>;
  /**
   * require `ref` and `shallowRef` functions to be strongly typed
   * @see https://eslint.vuejs.org/rules/require-typed-ref.html
   */
  'vue/require-typed-ref'?: Linter.RuleEntry<[]>;
  /**
   * require `v-bind:key` with `v-for` directives
   * @see https://eslint.vuejs.org/rules/require-v-for-key.html
   */
  'vue/require-v-for-key'?: Linter.RuleEntry<[]>;
  /**
   * enforce props default values to be valid
   * @see https://eslint.vuejs.org/rules/require-valid-default-prop.html
   */
  'vue/require-valid-default-prop'?: Linter.RuleEntry<[]>;
  /**
   * enforce using only specific component names
   * @see https://eslint.vuejs.org/rules/restricted-component-names.html
   */
  'vue/restricted-component-names'?: Linter.RuleEntry<VueRestrictedComponentNames>;
  /**
   * enforce that a return statement is present in computed property
   * @see https://eslint.vuejs.org/rules/return-in-computed-property.html
   */
  'vue/return-in-computed-property'?: Linter.RuleEntry<VueReturnInComputedProperty>;
  /**
   * enforce that a return statement is present in emits validator
   * @see https://eslint.vuejs.org/rules/return-in-emits-validator.html
   */
  'vue/return-in-emits-validator'?: Linter.RuleEntry<[]>;
  /**
   * enforce consistent indentation in `<script>`
   * @see https://eslint.vuejs.org/rules/script-indent.html
   */
  'vue/script-indent'?: Linter.RuleEntry<VueScriptIndent>;
  /**
   * require a line break before and after the contents of a singleline element
   * @see https://eslint.vuejs.org/rules/singleline-html-element-content-newline.html
   */
  'vue/singleline-html-element-content-newline'?: Linter.RuleEntry<VueSinglelineHtmlElementContentNewline>;
  /**
   * enforce specific casing for slot names
   * @see https://eslint.vuejs.org/rules/slot-name-casing.html
   */
  'vue/slot-name-casing'?: Linter.RuleEntry<VueSlotNameCasing>;
  /**
   * enforce sort-keys in a manner that is compatible with order-in-components
   * @see https://eslint.vuejs.org/rules/sort-keys.html
   */
  'vue/sort-keys'?: Linter.RuleEntry<VueSortKeys>;
  /**
   * Enforce consistent spacing inside parentheses in `<template>`
   * @see https://eslint.vuejs.org/rules/space-in-parens.html
   */
  'vue/space-in-parens'?: Linter.RuleEntry<VueSpaceInParens>;
  /**
   * Require spacing around infix operators in `<template>`
   * @see https://eslint.vuejs.org/rules/space-infix-ops.html
   */
  'vue/space-infix-ops'?: Linter.RuleEntry<VueSpaceInfixOps>;
  /**
   * Enforce consistent spacing before or after unary operators in `<template>`
   * @see https://eslint.vuejs.org/rules/space-unary-ops.html
   */
  'vue/space-unary-ops'?: Linter.RuleEntry<VueSpaceUnaryOps>;
  /**
   * enforce static class names order
   * @see https://eslint.vuejs.org/rules/static-class-names-order.html
   */
  'vue/static-class-names-order'?: Linter.RuleEntry<[]>;
  /**
   * Require or disallow spacing around embedded expressions of template strings in `<template>`
   * @see https://eslint.vuejs.org/rules/template-curly-spacing.html
   */
  'vue/template-curly-spacing'?: Linter.RuleEntry<VueTemplateCurlySpacing>;
  /**
   * disallow usage of `this` in template
   * @see https://eslint.vuejs.org/rules/this-in-template.html
   */
  'vue/this-in-template'?: Linter.RuleEntry<VueThisInTemplate>;
  /**
   * enforce usage of `exact` modifier on `v-on`
   * @see https://eslint.vuejs.org/rules/use-v-on-exact.html
   */
  'vue/use-v-on-exact'?: Linter.RuleEntry<[]>;
  /**
   * enforce `v-bind` directive style
   * @see https://eslint.vuejs.org/rules/v-bind-style.html
   */
  'vue/v-bind-style'?: Linter.RuleEntry<VueVBindStyle>;
  /**
   * enforce `v-for` directive's delimiter style
   * @see https://eslint.vuejs.org/rules/v-for-delimiter-style.html
   */
  'vue/v-for-delimiter-style'?: Linter.RuleEntry<VueVForDelimiterStyle>;
  /**
   * require key attribute for conditionally rendered repeated components
   * @see https://eslint.vuejs.org/rules/v-if-else-key.html
   */
  'vue/v-if-else-key'?: Linter.RuleEntry<[]>;
  /**
   * enforce v-on event naming style on custom components in template
   * @see https://eslint.vuejs.org/rules/v-on-event-hyphenation.html
   */
  'vue/v-on-event-hyphenation'?: Linter.RuleEntry<VueVOnEventHyphenation>;
  /**
   * enforce writing style for handlers in `v-on` directives
   * @see https://eslint.vuejs.org/rules/v-on-handler-style.html
   */
  'vue/v-on-handler-style'?: Linter.RuleEntry<VueVOnHandlerStyle>;
  /**
   * enforce `v-on` directive style
   * @see https://eslint.vuejs.org/rules/v-on-style.html
   */
  'vue/v-on-style'?: Linter.RuleEntry<VueVOnStyle>;
  /**
   * enforce `v-slot` directive style
   * @see https://eslint.vuejs.org/rules/v-slot-style.html
   */
  'vue/v-slot-style'?: Linter.RuleEntry<VueVSlotStyle>;
  /**
   * require valid attribute names
   * @see https://eslint.vuejs.org/rules/valid-attribute-name.html
   */
  'vue/valid-attribute-name'?: Linter.RuleEntry<[]>;
  /**
   * enforce valid `defineEmits` compiler macro
   * @see https://eslint.vuejs.org/rules/valid-define-emits.html
   */
  'vue/valid-define-emits'?: Linter.RuleEntry<[]>;
  /**
   * enforce valid `defineOptions` compiler macro
   * @see https://eslint.vuejs.org/rules/valid-define-options.html
   */
  'vue/valid-define-options'?: Linter.RuleEntry<[]>;
  /**
   * enforce valid `defineProps` compiler macro
   * @see https://eslint.vuejs.org/rules/valid-define-props.html
   */
  'vue/valid-define-props'?: Linter.RuleEntry<[]>;
  /**
   * require valid keys in model option
   * @see https://eslint.vuejs.org/rules/valid-model-definition.html
   * @deprecated
   */
  'vue/valid-model-definition'?: Linter.RuleEntry<[]>;
  /**
   * enforce valid `nextTick` function calls
   * @see https://eslint.vuejs.org/rules/valid-next-tick.html
   */
  'vue/valid-next-tick'?: Linter.RuleEntry<[]>;
  /**
   * enforce valid template root
   * @see https://eslint.vuejs.org/rules/valid-template-root.html
   */
  'vue/valid-template-root'?: Linter.RuleEntry<[]>;
  /**
   * enforce valid `v-bind` directives
   * @see https://eslint.vuejs.org/rules/valid-v-bind.html
   */
  'vue/valid-v-bind'?: Linter.RuleEntry<[]>;
  /**
   * enforce valid `.sync` modifier on `v-bind` directives
   * @see https://eslint.vuejs.org/rules/valid-v-bind-sync.html
   * @deprecated
   */
  'vue/valid-v-bind-sync'?: Linter.RuleEntry<[]>;
  /**
   * enforce valid `v-cloak` directives
   * @see https://eslint.vuejs.org/rules/valid-v-cloak.html
   */
  'vue/valid-v-cloak'?: Linter.RuleEntry<[]>;
  /**
   * enforce valid `v-else` directives
   * @see https://eslint.vuejs.org/rules/valid-v-else.html
   */
  'vue/valid-v-else'?: Linter.RuleEntry<[]>;
  /**
   * enforce valid `v-else-if` directives
   * @see https://eslint.vuejs.org/rules/valid-v-else-if.html
   */
  'vue/valid-v-else-if'?: Linter.RuleEntry<[]>;
  /**
   * enforce valid `v-for` directives
   * @see https://eslint.vuejs.org/rules/valid-v-for.html
   */
  'vue/valid-v-for'?: Linter.RuleEntry<[]>;
  /**
   * enforce valid `v-html` directives
   * @see https://eslint.vuejs.org/rules/valid-v-html.html
   */
  'vue/valid-v-html'?: Linter.RuleEntry<[]>;
  /**
   * enforce valid `v-if` directives
   * @see https://eslint.vuejs.org/rules/valid-v-if.html
   */
  'vue/valid-v-if'?: Linter.RuleEntry<[]>;
  /**
   * enforce valid `v-is` directives
   * @see https://eslint.vuejs.org/rules/valid-v-is.html
   */
  'vue/valid-v-is'?: Linter.RuleEntry<[]>;
  /**
   * enforce valid `v-memo` directives
   * @see https://eslint.vuejs.org/rules/valid-v-memo.html
   */
  'vue/valid-v-memo'?: Linter.RuleEntry<[]>;
  /**
   * enforce valid `v-model` directives
   * @see https://eslint.vuejs.org/rules/valid-v-model.html
   */
  'vue/valid-v-model'?: Linter.RuleEntry<[]>;
  /**
   * enforce valid `v-on` directives
   * @see https://eslint.vuejs.org/rules/valid-v-on.html
   */
  'vue/valid-v-on'?: Linter.RuleEntry<VueValidVOn>;
  /**
   * enforce valid `v-once` directives
   * @see https://eslint.vuejs.org/rules/valid-v-once.html
   */
  'vue/valid-v-once'?: Linter.RuleEntry<[]>;
  /**
   * enforce valid `v-pre` directives
   * @see https://eslint.vuejs.org/rules/valid-v-pre.html
   */
  'vue/valid-v-pre'?: Linter.RuleEntry<[]>;
  /**
   * enforce valid `v-show` directives
   * @see https://eslint.vuejs.org/rules/valid-v-show.html
   */
  'vue/valid-v-show'?: Linter.RuleEntry<[]>;
  /**
   * enforce valid `v-slot` directives
   * @see https://eslint.vuejs.org/rules/valid-v-slot.html
   */
  'vue/valid-v-slot'?: Linter.RuleEntry<VueValidVSlot>;
  /**
   * enforce valid `v-text` directives
   * @see https://eslint.vuejs.org/rules/valid-v-text.html
   */
  'vue/valid-v-text'?: Linter.RuleEntry<[]>;
  /**
   * Require parentheses around immediate `function` invocations
   * @see https://eslint.org/docs/latest/rules/wrap-iife
   * @deprecated
   */
  'wrap-iife'?: Linter.RuleEntry<WrapIife>;
  /**
   * Require parenthesis around regex literals
   * @see https://eslint.org/docs/latest/rules/wrap-regex
   * @deprecated
   */
  'wrap-regex'?: Linter.RuleEntry<[]>;
  /**
   * require or disallow block style mappings.
   * @see https://ota-meshi.github.io/eslint-plugin-yml/rules/block-mapping.html
   */
  'yaml/block-mapping'?: Linter.RuleEntry<YamlBlockMapping>;
  /**
   * enforce consistent line breaks after `:` indicator
   * @see https://ota-meshi.github.io/eslint-plugin-yml/rules/block-mapping-colon-indicator-newline.html
   */
  'yaml/block-mapping-colon-indicator-newline'?: Linter.RuleEntry<YamlBlockMappingColonIndicatorNewline>;
  /**
   * enforce consistent line breaks after `?` indicator
   * @see https://ota-meshi.github.io/eslint-plugin-yml/rules/block-mapping-question-indicator-newline.html
   */
  'yaml/block-mapping-question-indicator-newline'?: Linter.RuleEntry<YamlBlockMappingQuestionIndicatorNewline>;
  /**
   * require or disallow block style sequences.
   * @see https://ota-meshi.github.io/eslint-plugin-yml/rules/block-sequence.html
   */
  'yaml/block-sequence'?: Linter.RuleEntry<YamlBlockSequence>;
  /**
   * enforce consistent line breaks after `-` indicator
   * @see https://ota-meshi.github.io/eslint-plugin-yml/rules/block-sequence-hyphen-indicator-newline.html
   */
  'yaml/block-sequence-hyphen-indicator-newline'?: Linter.RuleEntry<YamlBlockSequenceHyphenIndicatorNewline>;
  /**
   * enforce YAML file extension
   * @see https://ota-meshi.github.io/eslint-plugin-yml/rules/file-extension.html
   */
  'yaml/file-extension'?: Linter.RuleEntry<YamlFileExtension>;
  /**
   * enforce consistent line breaks inside braces
   * @see https://ota-meshi.github.io/eslint-plugin-yml/rules/flow-mapping-curly-newline.html
   */
  'yaml/flow-mapping-curly-newline'?: Linter.RuleEntry<YamlFlowMappingCurlyNewline>;
  /**
   * enforce consistent spacing inside braces
   * @see https://ota-meshi.github.io/eslint-plugin-yml/rules/flow-mapping-curly-spacing.html
   */
  'yaml/flow-mapping-curly-spacing'?: Linter.RuleEntry<YamlFlowMappingCurlySpacing>;
  /**
   * enforce linebreaks after opening and before closing flow sequence brackets
   * @see https://ota-meshi.github.io/eslint-plugin-yml/rules/flow-sequence-bracket-newline.html
   */
  'yaml/flow-sequence-bracket-newline'?: Linter.RuleEntry<YamlFlowSequenceBracketNewline>;
  /**
   * enforce consistent spacing inside flow sequence brackets
   * @see https://ota-meshi.github.io/eslint-plugin-yml/rules/flow-sequence-bracket-spacing.html
   */
  'yaml/flow-sequence-bracket-spacing'?: Linter.RuleEntry<YamlFlowSequenceBracketSpacing>;
  /**
   * enforce consistent indentation
   * @see https://ota-meshi.github.io/eslint-plugin-yml/rules/indent.html
   */
  'yaml/indent'?: Linter.RuleEntry<YamlIndent>;
  /**
   * enforce naming convention to key names
   * @see https://ota-meshi.github.io/eslint-plugin-yml/rules/key-name-casing.html
   */
  'yaml/key-name-casing'?: Linter.RuleEntry<YamlKeyNameCasing>;
  /**
   * enforce consistent spacing between keys and values in mapping pairs
   * @see https://ota-meshi.github.io/eslint-plugin-yml/rules/key-spacing.html
   */
  'yaml/key-spacing'?: Linter.RuleEntry<YamlKeySpacing>;
  /**
   * disallow empty document
   * @see https://ota-meshi.github.io/eslint-plugin-yml/rules/no-empty-document.html
   */
  'yaml/no-empty-document'?: Linter.RuleEntry<[]>;
  /**
   * disallow empty mapping keys
   * @see https://ota-meshi.github.io/eslint-plugin-yml/rules/no-empty-key.html
   */
  'yaml/no-empty-key'?: Linter.RuleEntry<[]>;
  /**
   * disallow empty mapping values
   * @see https://ota-meshi.github.io/eslint-plugin-yml/rules/no-empty-mapping-value.html
   */
  'yaml/no-empty-mapping-value'?: Linter.RuleEntry<[]>;
  /**
   * disallow empty sequence entries
   * @see https://ota-meshi.github.io/eslint-plugin-yml/rules/no-empty-sequence-entry.html
   */
  'yaml/no-empty-sequence-entry'?: Linter.RuleEntry<[]>;
  /**
   * disallow irregular whitespace
   * @see https://ota-meshi.github.io/eslint-plugin-yml/rules/no-irregular-whitespace.html
   */
  'yaml/no-irregular-whitespace'?: Linter.RuleEntry<YamlNoIrregularWhitespace>;
  /**
   * disallow multiple empty lines
   * @see https://ota-meshi.github.io/eslint-plugin-yml/rules/no-multiple-empty-lines.html
   */
  'yaml/no-multiple-empty-lines'?: Linter.RuleEntry<YamlNoMultipleEmptyLines>;
  /**
   * disallow tabs for indentation.
   * @see https://ota-meshi.github.io/eslint-plugin-yml/rules/no-tab-indent.html
   */
  'yaml/no-tab-indent'?: Linter.RuleEntry<[]>;
  /**
   * disallow trailing zeros for floats
   * @see https://ota-meshi.github.io/eslint-plugin-yml/rules/no-trailing-zeros.html
   */
  'yaml/no-trailing-zeros'?: Linter.RuleEntry<[]>;
  /**
   * require or disallow plain style scalar.
   * @see https://ota-meshi.github.io/eslint-plugin-yml/rules/plain-scalar.html
   */
  'yaml/plain-scalar'?: Linter.RuleEntry<YamlPlainScalar>;
  /**
   * enforce the consistent use of either double, or single quotes
   * @see https://ota-meshi.github.io/eslint-plugin-yml/rules/quotes.html
   */
  'yaml/quotes'?: Linter.RuleEntry<YamlQuotes>;
  /**
   * disallow mapping keys other than strings
   * @see https://ota-meshi.github.io/eslint-plugin-yml/rules/require-string-key.html
   */
  'yaml/require-string-key'?: Linter.RuleEntry<[]>;
  /**
   * require mapping keys to be sorted
   * @see https://ota-meshi.github.io/eslint-plugin-yml/rules/sort-keys.html
   */
  'yaml/sort-keys'?: Linter.RuleEntry<YamlSortKeys>;
  /**
   * require sequence values to be sorted
   * @see https://ota-meshi.github.io/eslint-plugin-yml/rules/sort-sequence-values.html
   */
  'yaml/sort-sequence-values'?: Linter.RuleEntry<YamlSortSequenceValues>;
  /**
   * enforce consistent spacing after the `#` in a comment
   * @see https://ota-meshi.github.io/eslint-plugin-yml/rules/spaced-comment.html
   */
  'yaml/spaced-comment'?: Linter.RuleEntry<YamlSpacedComment>;
  /**
   * disallow parsing errors in Vue custom blocks
   * @see https://ota-meshi.github.io/eslint-plugin-yml/rules/vue-custom-block/no-parsing-error.html
   */
  'yaml/vue-custom-block/no-parsing-error'?: Linter.RuleEntry<[]>;
  /**
   * Require or disallow spacing around the `*` in `yield*` expressions
   * @see https://eslint.org/docs/latest/rules/yield-star-spacing
   * @deprecated
   */
  'yield-star-spacing'?: Linter.RuleEntry<YieldStarSpacing>;
  /**
   * Require or disallow "Yoda" conditions
   * @see https://eslint.org/docs/latest/rules/yoda
   */
  'yoda'?: Linter.RuleEntry<Yoda>;
}
/* ======= Declarations ======= */
// ----- accessor-pairs -----
type AccessorPairs = [] | [{
  getWithoutSet?: boolean;
  setWithoutGet?: boolean;
  enforceForClassMembers?: boolean;
  enforceForTSTypes?: boolean;
}];
// ----- antfu/consistent-chaining -----
type AntfuConsistentChaining = [] | [{
  allowLeadingPropertyAccess?: boolean;
}];
// ----- antfu/consistent-list-newline -----
type AntfuConsistentListNewline = [] | [{
  ArrayExpression?: boolean;
  ArrayPattern?: boolean;
  ArrowFunctionExpression?: boolean;
  CallExpression?: boolean;
  ExportNamedDeclaration?: boolean;
  FunctionDeclaration?: boolean;
  FunctionExpression?: boolean;
  ImportDeclaration?: boolean;
  JSONArrayExpression?: boolean;
  JSONObjectExpression?: boolean;
  JSXOpeningElement?: boolean;
  NewExpression?: boolean;
  ObjectExpression?: boolean;
  ObjectPattern?: boolean;
  TSFunctionType?: boolean;
  TSInterfaceDeclaration?: boolean;
  TSTupleType?: boolean;
  TSTypeLiteral?: boolean;
  TSTypeParameterDeclaration?: boolean;
  TSTypeParameterInstantiation?: boolean;
}];
// ----- antfu/indent-unindent -----
type AntfuIndentUnindent = [] | [{
  indent?: number;
  tags?: string[];
}];
// ----- array-bracket-newline -----
type ArrayBracketNewline = [] | [(("always" | "never" | "consistent") | {
  multiline?: boolean;
  minItems?: (number | null);
})];
// ----- array-bracket-spacing -----
type ArrayBracketSpacing = [] | [("always" | "never")] | [("always" | "never"), {
  singleValue?: boolean;
  objectsInArrays?: boolean;
  arraysInArrays?: boolean;
}];
// ----- array-callback-return -----
type ArrayCallbackReturn = [] | [{
  allowImplicit?: boolean;
  checkForEach?: boolean;
  allowVoid?: boolean;
}];
// ----- array-element-newline -----
type ArrayElementNewline = [] | [(_ArrayElementNewlineBasicConfig | {
  ArrayExpression?: _ArrayElementNewlineBasicConfig;
  ArrayPattern?: _ArrayElementNewlineBasicConfig;
})];
type _ArrayElementNewlineBasicConfig = (("always" | "never" | "consistent") | {
  multiline?: boolean;
  minItems?: (number | null);
});
// ----- arrow-body-style -----
type ArrowBodyStyle = ([] | [("always" | "never")] | [] | ["as-needed"] | ["as-needed", {
  requireReturnForObjectLiteral?: boolean;
}]);
// ----- arrow-parens -----
type ArrowParens = [] | [("always" | "as-needed")] | [("always" | "as-needed"), {
  requireForBlockBody?: boolean;
}];
// ----- arrow-spacing -----
type ArrowSpacing = [] | [{
  before?: boolean;
  after?: boolean;
}];
// ----- astro/jsx-a11y/alt-text -----
type AstroJsxA11YAltText = [] | [{
  elements?: string[];
  img?: string[];
  object?: string[];
  area?: string[];
  "input[type=\"image\"]"?: string[];
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/anchor-ambiguous-text -----
type AstroJsxA11YAnchorAmbiguousText = [] | [{
  words?: string[];
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/anchor-has-content -----
type AstroJsxA11YAnchorHasContent = [] | [{
  components?: string[];
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/anchor-is-valid -----
type AstroJsxA11YAnchorIsValid = [] | [{
  components?: string[];
  specialLink?: string[];
  aspects?: [("noHref" | "invalidHref" | "preferButton"), ...(("noHref" | "invalidHref" | "preferButton"))[]];
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/aria-activedescendant-has-tabindex -----
type AstroJsxA11YAriaActivedescendantHasTabindex = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/aria-props -----
type AstroJsxA11YAriaProps = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/aria-proptypes -----
type AstroJsxA11YAriaProptypes = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/aria-role -----
type AstroJsxA11YAriaRole = [] | [{
  allowedInvalidRoles?: string[];
  ignoreNonDOM?: boolean;
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/aria-unsupported-elements -----
type AstroJsxA11YAriaUnsupportedElements = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/autocomplete-valid -----
type AstroJsxA11YAutocompleteValid = [] | [{
  inputComponents?: string[];
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/click-events-have-key-events -----
type AstroJsxA11YClickEventsHaveKeyEvents = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/control-has-associated-label -----
type AstroJsxA11YControlHasAssociatedLabel = [] | [{
  labelAttributes?: string[];
  controlComponents?: string[];
  ignoreElements?: string[];
  ignoreRoles?: string[];
  depth?: number;
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/heading-has-content -----
type AstroJsxA11YHeadingHasContent = [] | [{
  components?: string[];
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/html-has-lang -----
type AstroJsxA11YHtmlHasLang = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/iframe-has-title -----
type AstroJsxA11YIframeHasTitle = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/img-redundant-alt -----
type AstroJsxA11YImgRedundantAlt = [] | [{
  components?: string[];
  words?: string[];
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/interactive-supports-focus -----
type AstroJsxA11YInteractiveSupportsFocus = [] | [{
  tabbable?: ("button" | "checkbox" | "columnheader" | "combobox" | "grid" | "gridcell" | "link" | "listbox" | "menu" | "menubar" | "menuitem" | "menuitemcheckbox" | "menuitemradio" | "option" | "progressbar" | "radio" | "radiogroup" | "row" | "rowheader" | "scrollbar" | "searchbox" | "slider" | "spinbutton" | "switch" | "tab" | "tablist" | "textbox" | "tree" | "treegrid" | "treeitem" | "doc-backlink" | "doc-biblioref" | "doc-glossref" | "doc-noteref")[];
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/label-has-associated-control -----
type AstroJsxA11YLabelHasAssociatedControl = [] | [{
  labelComponents?: string[];
  labelAttributes?: string[];
  controlComponents?: string[];
  assert?: ("htmlFor" | "nesting" | "both" | "either");
  depth?: number;
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/lang -----
type AstroJsxA11YLang = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/media-has-caption -----
type AstroJsxA11YMediaHasCaption = [] | [{
  audio?: string[];
  video?: string[];
  track?: string[];
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/mouse-events-have-key-events -----
type AstroJsxA11YMouseEventsHaveKeyEvents = [] | [{
  hoverInHandlers?: string[];
  hoverOutHandlers?: string[];
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/no-access-key -----
type AstroJsxA11YNoAccessKey = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/no-aria-hidden-on-focusable -----
type AstroJsxA11YNoAriaHiddenOnFocusable = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/no-autofocus -----
type AstroJsxA11YNoAutofocus = [] | [{
  ignoreNonDOM?: boolean;
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/no-distracting-elements -----
type AstroJsxA11YNoDistractingElements = [] | [{
  elements?: ("marquee" | "blink")[];
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/no-interactive-element-to-noninteractive-role -----
type AstroJsxA11YNoInteractiveElementToNoninteractiveRole = [] | [{
  [k: string]: string[] | undefined;
}];
// ----- astro/jsx-a11y/no-noninteractive-element-interactions -----
type AstroJsxA11YNoNoninteractiveElementInteractions = [] | [{
  handlers?: string[];
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/no-noninteractive-element-to-interactive-role -----
type AstroJsxA11YNoNoninteractiveElementToInteractiveRole = [] | [{
  [k: string]: string[] | undefined;
}];
// ----- astro/jsx-a11y/no-noninteractive-tabindex -----
type AstroJsxA11YNoNoninteractiveTabindex = [] | [{
  roles?: string[];
  tags?: string[];
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/no-redundant-roles -----
type AstroJsxA11YNoRedundantRoles = [] | [{
  [k: string]: string[] | undefined;
}];
// ----- astro/jsx-a11y/no-static-element-interactions -----
type AstroJsxA11YNoStaticElementInteractions = [] | [{
  handlers?: string[];
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/prefer-tag-over-role -----
type AstroJsxA11YPreferTagOverRole = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/role-has-required-aria-props -----
type AstroJsxA11YRoleHasRequiredAriaProps = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/role-supports-aria-props -----
type AstroJsxA11YRoleSupportsAriaProps = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/scope -----
type AstroJsxA11YScope = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- astro/jsx-a11y/tabindex-no-positive -----
type AstroJsxA11YTabindexNoPositive = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- astro/no-unsafe-inline-scripts -----
type AstroNoUnsafeInlineScripts = [] | [{
  allowDefineVars?: boolean;
  allowModuleScripts?: boolean;
  allowNonExecutingTypes?: string[];
  allowNonce?: boolean;
}];
// ----- astro/prefer-split-class-list -----
type AstroPreferSplitClassList = [] | [{
  splitLiteral?: boolean;
}];
// ----- astro/semi -----
type AstroSemi = ([] | ["never"] | ["never", {
  beforeStatementContinuationChars?: ("always" | "any" | "never");
}] | [] | ["always"] | ["always", {
  omitLastInOneLineBlock?: boolean;
  omitLastInOneLineClassBody?: boolean;
}]);
// ----- astro/sort-attributes -----
type AstroSortAttributes = [] | [{
  type?: ("alphabetical" | "line-length");
  ignoreCase?: boolean;
  order?: ("asc" | "desc");
}];
// ----- block-spacing -----
type BlockSpacing = [] | [("always" | "never")];
// ----- brace-style -----
type BraceStyle = [] | [("1tbs" | "stroustrup" | "allman")] | [("1tbs" | "stroustrup" | "allman"), {
  allowSingleLine?: boolean;
}];
// ----- callback-return -----
type CallbackReturn = [] | [string[]];
// ----- camelcase -----
type Camelcase = [] | [{
  ignoreDestructuring?: boolean;
  ignoreImports?: boolean;
  ignoreGlobals?: boolean;
  properties?: ("always" | "never");
  allow?: string[];
}];
// ----- capitalized-comments -----
type CapitalizedComments = [] | [("always" | "never")] | [("always" | "never"), ({
  ignorePattern?: string;
  ignoreInlineComments?: boolean;
  ignoreConsecutiveComments?: boolean;
} | {
  line?: {
    ignorePattern?: string;
    ignoreInlineComments?: boolean;
    ignoreConsecutiveComments?: boolean;
  };
  block?: {
    ignorePattern?: string;
    ignoreInlineComments?: boolean;
    ignoreConsecutiveComments?: boolean;
  };
})];
// ----- class-methods-use-this -----
type ClassMethodsUseThis = [] | [{
  exceptMethods?: string[];
  enforceForClassFields?: boolean;
  ignoreOverrideMethods?: boolean;
  ignoreClassesWithImplements?: ("all" | "public-fields");
}];
// ----- comma-dangle -----
type CommaDangle = [] | [(_CommaDangleValue | {
  arrays?: _CommaDangleValueWithIgnore;
  objects?: _CommaDangleValueWithIgnore;
  imports?: _CommaDangleValueWithIgnore;
  exports?: _CommaDangleValueWithIgnore;
  functions?: _CommaDangleValueWithIgnore;
})];
type _CommaDangleValue = ("always-multiline" | "always" | "never" | "only-multiline");
type _CommaDangleValueWithIgnore = ("always-multiline" | "always" | "ignore" | "never" | "only-multiline");
// ----- comma-spacing -----
type CommaSpacing = [] | [{
  before?: boolean;
  after?: boolean;
}];
// ----- comma-style -----
type CommaStyle = [] | [("first" | "last")] | [("first" | "last"), {
  exceptions?: {
    [k: string]: boolean | undefined;
  };
}];
// ----- complexity -----
type Complexity = [] | [(number | {
  maximum?: number;
  max?: number;
  variant?: ("classic" | "modified");
})];
// ----- computed-property-spacing -----
type ComputedPropertySpacing = [] | [("always" | "never")] | [("always" | "never"), {
  enforceForClassMembers?: boolean;
}];
// ----- consistent-return -----
type ConsistentReturn = [] | [{
  treatUndefinedAsUnspecified?: boolean;
}];
// ----- consistent-this -----
type ConsistentThis = string[];
// ----- curly -----
type Curly = ([] | ["all"] | [] | [("multi" | "multi-line" | "multi-or-nest")] | [("multi" | "multi-line" | "multi-or-nest"), "consistent"]);
// ----- default-case -----
type DefaultCase = [] | [{
  commentPattern?: string;
}];
// ----- dot-location -----
type DotLocation = [] | [("object" | "property")];
// ----- dot-notation -----
type DotNotation = [] | [{
  allowKeywords?: boolean;
  allowPattern?: string;
}];
// ----- eol-last -----
type EolLast = [] | [("always" | "never" | "unix" | "windows")];
// ----- eqeqeq -----
type Eqeqeq = ([] | ["always"] | ["always", {
  null?: ("always" | "never" | "ignore");
}] | [] | [("smart" | "allow-null")]);
// ----- eslint-comments/disable-enable-pair -----
type EslintCommentsDisableEnablePair = [] | [{
  allowWholeFile?: boolean;
}];
// ----- eslint-comments/no-restricted-disable -----
type EslintCommentsNoRestrictedDisable = string[];
// ----- eslint-comments/no-use -----
type EslintCommentsNoUse = [] | [{
  allow?: ("eslint" | "eslint-disable" | "eslint-disable-line" | "eslint-disable-next-line" | "eslint-enable" | "eslint-env" | "exported" | "global" | "globals")[];
}];
// ----- eslint-comments/require-description -----
type EslintCommentsRequireDescription = [] | [{
  ignore?: ("eslint" | "eslint-disable" | "eslint-disable-line" | "eslint-disable-next-line" | "eslint-enable" | "eslint-env" | "exported" | "global" | "globals")[];
}];
// ----- format/dprint -----
type FormatDprint = [] | [{
  language?: string;
  languageOptions?: {
    [k: string]: unknown | undefined;
  };
  [k: string]: unknown | undefined;
}];
// ----- format/prettier -----
type FormatPrettier = [] | [{
  parser?: string;
  [k: string]: unknown | undefined;
}];
// ----- func-call-spacing -----
type FuncCallSpacing = ([] | ["never"] | [] | ["always"] | ["always", {
  allowNewlines?: boolean;
}]);
// ----- func-name-matching -----
type FuncNameMatching = ([] | [("always" | "never")] | [("always" | "never"), {
  considerPropertyDescriptor?: boolean;
  includeCommonJSModuleExports?: boolean;
}] | [] | [{
  considerPropertyDescriptor?: boolean;
  includeCommonJSModuleExports?: boolean;
}]);
// ----- func-names -----
type FuncNames = [] | [_FuncNamesValue] | [_FuncNamesValue, {
  generators?: _FuncNamesValue;
}];
type _FuncNamesValue = ("always" | "as-needed" | "never");
// ----- func-style -----
type FuncStyle = [] | [("declaration" | "expression")] | [("declaration" | "expression"), {
  allowArrowFunctions?: boolean;
  allowTypeAnnotation?: boolean;
  overrides?: {
    namedExports?: ("declaration" | "expression" | "ignore");
  };
}];
// ----- function-call-argument-newline -----
type FunctionCallArgumentNewline = [] | [("always" | "never" | "consistent")];
// ----- function-paren-newline -----
type FunctionParenNewline = [] | [(("always" | "never" | "consistent" | "multiline" | "multiline-arguments") | {
  minItems?: number;
})];
// ----- generator-star-spacing -----
type GeneratorStarSpacing = [] | [(("before" | "after" | "both" | "neither") | {
  before?: boolean;
  after?: boolean;
  named?: (("before" | "after" | "both" | "neither") | {
    before?: boolean;
    after?: boolean;
  });
  anonymous?: (("before" | "after" | "both" | "neither") | {
    before?: boolean;
    after?: boolean;
  });
  method?: (("before" | "after" | "both" | "neither") | {
    before?: boolean;
    after?: boolean;
  });
})];
// ----- getter-return -----
type GetterReturn = [] | [{
  allowImplicit?: boolean;
}];
// ----- grouped-accessor-pairs -----
type GroupedAccessorPairs = [] | [("anyOrder" | "getBeforeSet" | "setBeforeGet")] | [("anyOrder" | "getBeforeSet" | "setBeforeGet"), {
  enforceForTSTypes?: boolean;
}];
// ----- handle-callback-err -----
type HandleCallbackErr = [] | [string];
// ----- id-blacklist -----
type IdBlacklist = string[];
// ----- id-denylist -----
type IdDenylist = string[];
// ----- id-length -----
type IdLength = [] | [{
  min?: number;
  max?: number;
  exceptions?: string[];
  exceptionPatterns?: string[];
  properties?: ("always" | "never");
}];
// ----- id-match -----
type IdMatch = [] | [string] | [string, {
  properties?: boolean;
  classFields?: boolean;
  onlyDeclarations?: boolean;
  ignoreDestructuring?: boolean;
}];
// ----- implicit-arrow-linebreak -----
type ImplicitArrowLinebreak = [] | [("beside" | "below")];
// ----- import/consistent-type-specifier-style -----
type ImportConsistentTypeSpecifierStyle = [] | [("top-level" | "inline" | "prefer-top-level")];
// ----- import/first -----
type ImportFirst = [] | [("absolute-first" | "disable-absolute-first")];
// ----- import/newline-after-import -----
type ImportNewlineAfterImport = [] | [{
  count?: number;
  exactCount?: boolean;
  considerComments?: boolean;
}];
// ----- import/no-duplicates -----
type ImportNoDuplicates = [] | [{
  "prefer-inline"?: boolean;
}];
// ----- indent -----
type Indent = [] | [("tab" | number)] | [("tab" | number), {
  SwitchCase?: number;
  VariableDeclarator?: ((number | ("first" | "off")) | {
    var?: (number | ("first" | "off"));
    let?: (number | ("first" | "off"));
    const?: (number | ("first" | "off"));
  });
  outerIIFEBody?: (number | "off");
  MemberExpression?: (number | "off");
  FunctionDeclaration?: {
    parameters?: (number | ("first" | "off"));
    body?: number;
  };
  FunctionExpression?: {
    parameters?: (number | ("first" | "off"));
    body?: number;
  };
  StaticBlock?: {
    body?: number;
  };
  CallExpression?: {
    arguments?: (number | ("first" | "off"));
  };
  ArrayExpression?: (number | ("first" | "off"));
  ObjectExpression?: (number | ("first" | "off"));
  ImportDeclaration?: (number | ("first" | "off"));
  flatTernaryExpressions?: boolean;
  offsetTernaryExpressions?: boolean;
  ignoredNodes?: string[];
  ignoreComments?: boolean;
}];
// ----- indent-legacy -----
type IndentLegacy = [] | [("tab" | number)] | [("tab" | number), {
  SwitchCase?: number;
  VariableDeclarator?: (number | {
    var?: number;
    let?: number;
    const?: number;
    [k: string]: unknown | undefined;
  });
  outerIIFEBody?: number;
  MemberExpression?: number;
  FunctionDeclaration?: {
    parameters?: (number | "first");
    body?: number;
    [k: string]: unknown | undefined;
  };
  FunctionExpression?: {
    parameters?: (number | "first");
    body?: number;
    [k: string]: unknown | undefined;
  };
  CallExpression?: {
    parameters?: (number | "first");
    [k: string]: unknown | undefined;
  };
  ArrayExpression?: (number | "first");
  ObjectExpression?: (number | "first");
}];
// ----- init-declarations -----
type InitDeclarations = ([] | ["always"] | [] | ["never"] | ["never", {
  ignoreForLoopInit?: boolean;
}]);
// ----- jsdoc/check-alignment -----
type JsdocCheckAlignment = [] | [{
  innerIndent?: number;
}];
// ----- jsdoc/check-examples -----
type JsdocCheckExamples = [] | [{
  allowInlineConfig?: boolean;
  baseConfig?: {
    [k: string]: unknown | undefined;
  };
  captionRequired?: boolean;
  checkDefaults?: boolean;
  checkEslintrc?: boolean;
  checkParams?: boolean;
  checkProperties?: boolean;
  configFile?: string;
  exampleCodeRegex?: string;
  matchingFileName?: string;
  matchingFileNameDefaults?: string;
  matchingFileNameParams?: string;
  matchingFileNameProperties?: string;
  noDefaultExampleRules?: boolean;
  paddedIndent?: number;
  rejectExampleCodeRegex?: string;
  reportUnusedDisableDirectives?: boolean;
}];
// ----- jsdoc/check-indentation -----
type JsdocCheckIndentation = [] | [{
  allowIndentedSections?: boolean;
  excludeTags?: string[];
}];
// ----- jsdoc/check-line-alignment -----
type JsdocCheckLineAlignment = [] | [("always" | "never" | "any")] | [("always" | "never" | "any"), {
  customSpacings?: {
    postDelimiter?: number;
    postHyphen?: number;
    postName?: number;
    postTag?: number;
    postType?: number;
  };
  disableWrapIndent?: boolean;
  preserveMainDescriptionPostDelimiter?: boolean;
  tags?: string[];
  wrapIndent?: string;
}];
// ----- jsdoc/check-param-names -----
type JsdocCheckParamNames = [] | [{
  allowExtraTrailingParamDocs?: boolean;
  checkDestructured?: boolean;
  checkRestProperty?: boolean;
  checkTypesPattern?: string;
  disableExtraPropertyReporting?: boolean;
  disableMissingParamChecks?: boolean;
  enableFixer?: boolean;
  useDefaultObjectProperties?: boolean;
}];
// ----- jsdoc/check-property-names -----
type JsdocCheckPropertyNames = [] | [{
  enableFixer?: boolean;
}];
// ----- jsdoc/check-tag-names -----
type JsdocCheckTagNames = [] | [{
  definedTags?: string[];
  enableFixer?: boolean;
  inlineTags?: string[];
  jsxTags?: boolean;
  typed?: boolean;
}];
// ----- jsdoc/check-types -----
type JsdocCheckTypes = [] | [{
  exemptTagContexts?: {
    tag?: string;
    types?: (boolean | string[]);
  }[];
  noDefaults?: boolean;
  unifyParentAndChildTypeChecks?: boolean;
}];
// ----- jsdoc/check-values -----
type JsdocCheckValues = [] | [{
  allowedAuthors?: string[];
  allowedLicenses?: (string[] | boolean);
  licensePattern?: string;
  numericOnlyVariation?: boolean;
}];
// ----- jsdoc/convert-to-jsdoc-comments -----
type JsdocConvertToJsdocComments = [] | [{
  allowedPrefixes?: string[];
  contexts?: (string | {
    context?: string;
    inlineCommentBlock?: boolean;
  })[];
  contextsAfter?: (string | {
    context?: string;
    inlineCommentBlock?: boolean;
  })[];
  contextsBeforeAndAfter?: (string | {
    context?: string;
    inlineCommentBlock?: boolean;
  })[];
  enableFixer?: boolean;
  enforceJsdocLineStyle?: ("multi" | "single");
  lineOrBlockStyle?: ("block" | "line" | "both");
}];
// ----- jsdoc/empty-tags -----
type JsdocEmptyTags = [] | [{
  tags?: string[];
}];
// ----- jsdoc/escape-inline-tags -----
type JsdocEscapeInlineTags = [] | [{
  allowedInlineTags?: string[];
  enableFixer?: boolean;
  fixType?: ("backticks" | "backslash");
}];
// ----- jsdoc/implements-on-classes -----
type JsdocImplementsOnClasses = [] | [{
  contexts?: (string | {
    comment?: string;
    context?: string;
  })[];
}];
// ----- jsdoc/informative-docs -----
type JsdocInformativeDocs = [] | [{
  aliases?: {
    [k: string]: string[];
  };
  excludedTags?: string[];
  uselessWords?: string[];
}];
// ----- jsdoc/lines-before-block -----
type JsdocLinesBeforeBlock = [] | [{
  checkBlockStarts?: boolean;
  excludedTags?: string[];
  ignoreSameLine?: boolean;
  ignoreSingleLines?: boolean;
  lines?: number;
}];
// ----- jsdoc/match-description -----
type JsdocMatchDescription = [] | [{
  contexts?: (string | {
    comment?: string;
    context?: string;
  })[];
  mainDescription?: (string | boolean | {
    match?: (string | boolean);
    message?: string;
  });
  matchDescription?: string;
  message?: string;
  nonemptyTags?: boolean;
  tags?: {
    [k: string]: (string | true | {
      match?: (string | true);
      message?: string;
    });
  };
}];
// ----- jsdoc/match-name -----
type JsdocMatchName = [] | [{
  match: {
    allowName?: string;
    comment?: string;
    context?: string;
    disallowName?: string;
    message?: string;
    replacement?: string;
    tags?: string[];
  }[];
}];
// ----- jsdoc/multiline-blocks -----
type JsdocMultilineBlocks = [] | [{
  allowMultipleTags?: boolean;
  minimumLengthForMultiline?: number;
  multilineTags?: ("*" | string[]);
  noFinalLineText?: boolean;
  noMultilineBlocks?: boolean;
  noSingleLineBlocks?: boolean;
  noZeroLineText?: boolean;
  requireSingleLineUnderCount?: number;
  singleLineTags?: string[];
}];
// ----- jsdoc/no-bad-blocks -----
type JsdocNoBadBlocks = [] | [{
  ignore?: string[];
  preventAllMultiAsteriskBlocks?: boolean;
}];
// ----- jsdoc/no-blank-blocks -----
type JsdocNoBlankBlocks = [] | [{
  enableFixer?: boolean;
}];
// ----- jsdoc/no-defaults -----
type JsdocNoDefaults = [] | [{
  contexts?: (string | {
    comment?: string;
    context?: string;
  })[];
  noOptionalParamNames?: boolean;
}];
// ----- jsdoc/no-missing-syntax -----
type JsdocNoMissingSyntax = [] | [{
  contexts?: (string | {
    comment?: string;
    context?: string;
    message?: string;
    minimum?: number;
  })[];
}];
// ----- jsdoc/no-multi-asterisks -----
type JsdocNoMultiAsterisks = [] | [{
  allowWhitespace?: boolean;
  preventAtEnd?: boolean;
  preventAtMiddleLines?: boolean;
}];
// ----- jsdoc/no-restricted-syntax -----
type JsdocNoRestrictedSyntax = [] | [{
  contexts: (string | {
    comment?: string;
    context?: string;
    message?: string;
  })[];
}];
// ----- jsdoc/no-types -----
type JsdocNoTypes = [] | [{
  contexts?: (string | {
    comment?: string;
    context?: string;
  })[];
}];
// ----- jsdoc/no-undefined-types -----
type JsdocNoUndefinedTypes = [] | [{
  checkUsedTypedefs?: boolean;
  definedTypes?: string[];
  disableReporting?: boolean;
  markVariablesAsUsed?: boolean;
}];
// ----- jsdoc/prefer-import-tag -----
type JsdocPreferImportTag = [] | [{
  enableFixer?: boolean;
  exemptTypedefs?: boolean;
  outputType?: ("named-import" | "namespaced-import");
}];
// ----- jsdoc/require-asterisk-prefix -----
type JsdocRequireAsteriskPrefix = [] | [("always" | "never" | "any")] | [("always" | "never" | "any"), {
  tags?: {
    always?: string[];
    any?: string[];
    never?: string[];
  };
}];
// ----- jsdoc/require-description -----
type JsdocRequireDescription = [] | [{
  checkConstructors?: boolean;
  checkGetters?: boolean;
  checkSetters?: boolean;
  contexts?: (string | {
    comment?: string;
    context?: string;
  })[];
  descriptionStyle?: ("body" | "tag" | "any");
  exemptedBy?: string[];
}];
// ----- jsdoc/require-description-complete-sentence -----
type JsdocRequireDescriptionCompleteSentence = [] | [{
  abbreviations?: string[];
  newlineBeforeCapsAssumesBadSentenceEnd?: boolean;
  tags?: string[];
}];
// ----- jsdoc/require-example -----
type JsdocRequireExample = [] | [{
  checkConstructors?: boolean;
  checkGetters?: boolean;
  checkSetters?: boolean;
  contexts?: (string | {
    comment?: string;
    context?: string;
  })[];
  enableFixer?: boolean;
  exemptedBy?: string[];
  exemptNoArguments?: boolean;
}];
// ----- jsdoc/require-file-overview -----
type JsdocRequireFileOverview = [] | [{
  tags?: {
    [k: string]: {
      initialCommentsOnly?: boolean;
      mustExist?: boolean;
      preventDuplicates?: boolean;
    };
  };
}];
// ----- jsdoc/require-hyphen-before-param-description -----
type JsdocRequireHyphenBeforeParamDescription = [] | [("always" | "never")] | [("always" | "never"), {
  tags?: ({
    [k: string]: ("always" | "never");
  } | "any");
}];
// ----- jsdoc/require-jsdoc -----
type JsdocRequireJsdoc = [] | [{
  checkConstructors?: boolean;
  checkGetters?: (boolean | "no-setter");
  checkSetters?: (boolean | "no-getter");
  contexts?: (string | {
    context?: string;
    inlineCommentBlock?: boolean;
    minLineCount?: number;
  })[];
  enableFixer?: boolean;
  exemptEmptyConstructors?: boolean;
  exemptEmptyFunctions?: boolean;
  exemptOverloadedImplementations?: boolean;
  fixerMessage?: string;
  minLineCount?: number;
  publicOnly?: (boolean | {
    ancestorsOnly?: boolean;
    cjs?: boolean;
    esm?: boolean;
    window?: boolean;
  });
  require?: {
    ArrowFunctionExpression?: boolean;
    ClassDeclaration?: boolean;
    ClassExpression?: boolean;
    FunctionDeclaration?: boolean;
    FunctionExpression?: boolean;
    MethodDefinition?: boolean;
  };
  skipInterveningOverloadedDeclarations?: boolean;
}];
// ----- jsdoc/require-param -----
type JsdocRequireParam = [] | [{
  autoIncrementBase?: number;
  checkConstructors?: boolean;
  checkDestructured?: boolean;
  checkDestructuredRoots?: boolean;
  checkGetters?: boolean;
  checkRestProperty?: boolean;
  checkSetters?: boolean;
  checkTypesPattern?: string;
  contexts?: (string | {
    comment?: string;
    context?: string;
  })[];
  enableFixer?: boolean;
  enableRestElementFixer?: boolean;
  enableRootFixer?: boolean;
  exemptedBy?: string[];
  ignoreWhenAllParamsMissing?: boolean;
  interfaceExemptsParamsCheck?: boolean;
  unnamedRootBase?: string[];
  useDefaultObjectProperties?: boolean;
}];
// ----- jsdoc/require-param-description -----
type JsdocRequireParamDescription = [] | [{
  contexts?: (string | {
    comment?: string;
    context?: string;
  })[];
  defaultDestructuredRootDescription?: string;
  setDefaultDestructuredRootDescription?: boolean;
}];
// ----- jsdoc/require-param-name -----
type JsdocRequireParamName = [] | [{
  contexts?: (string | {
    comment?: string;
    context?: string;
  })[];
}];
// ----- jsdoc/require-param-type -----
type JsdocRequireParamType = [] | [{
  contexts?: (string | {
    comment?: string;
    context?: string;
  })[];
  defaultDestructuredRootType?: string;
  setDefaultDestructuredRootType?: boolean;
}];
// ----- jsdoc/require-rejects -----
type JsdocRequireRejects = [] | [{
  contexts?: (string | {
    comment?: string;
    context?: string;
  })[];
  exemptedBy?: string[];
}];
// ----- jsdoc/require-returns -----
type JsdocRequireReturns = [] | [{
  checkConstructors?: boolean;
  checkGetters?: boolean;
  contexts?: (string | {
    comment?: string;
    context?: string;
    forceRequireReturn?: boolean;
  })[];
  enableFixer?: boolean;
  exemptedBy?: string[];
  forceRequireReturn?: boolean;
  forceReturnsWithAsync?: boolean;
  publicOnly?: (boolean | {
    ancestorsOnly?: boolean;
    cjs?: boolean;
    esm?: boolean;
    window?: boolean;
  });
}];
// ----- jsdoc/require-returns-check -----
type JsdocRequireReturnsCheck = [] | [{
  exemptAsync?: boolean;
  exemptGenerators?: boolean;
  noNativeTypes?: boolean;
  reportMissingReturnForUndefinedTypes?: boolean;
}];
// ----- jsdoc/require-returns-description -----
type JsdocRequireReturnsDescription = [] | [{
  contexts?: (string | {
    comment?: string;
    context?: string;
  })[];
}];
// ----- jsdoc/require-returns-type -----
type JsdocRequireReturnsType = [] | [{
  contexts?: (string | {
    comment?: string;
    context?: string;
  })[];
}];
// ----- jsdoc/require-tags -----
type JsdocRequireTags = [] | [{
  tags?: (string | {
    context?: string;
    tag?: string;
    [k: string]: unknown | undefined;
  })[];
}];
// ----- jsdoc/require-template -----
type JsdocRequireTemplate = [] | [{
  exemptedBy?: string[];
  requireSeparateTemplates?: boolean;
}];
// ----- jsdoc/require-throws -----
type JsdocRequireThrows = [] | [{
  contexts?: (string | {
    comment?: string;
    context?: string;
  })[];
  exemptedBy?: string[];
}];
// ----- jsdoc/require-yields -----
type JsdocRequireYields = [] | [{
  contexts?: (string | {
    comment?: string;
    context?: string;
  })[];
  exemptedBy?: string[];
  forceRequireNext?: boolean;
  forceRequireYields?: boolean;
  next?: boolean;
  nextWithGeneratorTag?: boolean;
  withGeneratorTag?: boolean;
}];
// ----- jsdoc/require-yields-check -----
type JsdocRequireYieldsCheck = [] | [{
  checkGeneratorsOnly?: boolean;
  contexts?: (string | {
    comment?: string;
    context?: string;
  })[];
  next?: boolean;
}];
// ----- jsdoc/sort-tags -----
type JsdocSortTags = [] | [{
  alphabetizeExtras?: boolean;
  linesBetween?: number;
  reportIntraTagGroupSpacing?: boolean;
  reportTagGroupSpacing?: boolean;
  tagExceptions?: {
    [k: string]: number;
  };
  tagSequence?: {
    tags?: string[];
  }[];
}];
// ----- jsdoc/tag-lines -----
type JsdocTagLines = [] | [("always" | "any" | "never")] | [("always" | "any" | "never"), {
  applyToEndTag?: boolean;
  count?: number;
  endLines?: (number | null);
  maxBlockLines?: (number | null);
  startLines?: (number | null);
  tags?: {
    [k: string]: {
      count?: number;
      lines?: ("always" | "never" | "any");
    };
  };
}];
// ----- jsdoc/text-escaping -----
type JsdocTextEscaping = [] | [{
  escapeHTML?: boolean;
  escapeMarkdown?: boolean;
}];
// ----- jsdoc/ts-method-signature-style -----
type JsdocTsMethodSignatureStyle = [] | [("method" | "property")] | [("method" | "property"), {
  enableFixer?: boolean;
}];
// ----- jsdoc/ts-no-unnecessary-template-expression -----
type JsdocTsNoUnnecessaryTemplateExpression = [] | [{
  enableFixer?: boolean;
}];
// ----- jsdoc/ts-prefer-function-type -----
type JsdocTsPreferFunctionType = [] | [{
  enableFixer?: boolean;
}];
// ----- jsdoc/type-formatting -----
type JsdocTypeFormatting = [] | [{
  arrayBrackets?: ("angle" | "square");
  arrowFunctionPostReturnMarkerSpacing?: string;
  arrowFunctionPreReturnMarkerSpacing?: string;
  enableFixer?: boolean;
  functionOrClassParameterSpacing?: string;
  functionOrClassPostGenericSpacing?: string;
  functionOrClassPostReturnMarkerSpacing?: string;
  functionOrClassPreReturnMarkerSpacing?: string;
  functionOrClassTypeParameterSpacing?: string;
  genericAndTupleElementSpacing?: string;
  genericDot?: boolean;
  keyValuePostColonSpacing?: string;
  keyValuePostKeySpacing?: string;
  keyValuePostOptionalSpacing?: string;
  keyValuePostVariadicSpacing?: string;
  methodQuotes?: ("double" | "single");
  objectFieldIndent?: string;
  objectFieldQuote?: ("double" | "single" | null);
  objectFieldSeparator?: ("comma" | "comma-and-linebreak" | "linebreak" | "semicolon" | "semicolon-and-linebreak");
  objectFieldSeparatorOptionalLinebreak?: boolean;
  objectFieldSeparatorTrailingPunctuation?: boolean;
  parameterDefaultValueSpacing?: string;
  postMethodNameSpacing?: string;
  postNewSpacing?: string;
  separatorForSingleObjectField?: boolean;
  stringQuotes?: ("double" | "single");
  typeBracketSpacing?: string;
  unionSpacing?: string;
}];
// ----- jsdoc/valid-types -----
type JsdocValidTypes = [] | [{
  allowEmptyNamepaths?: boolean;
}];
// ----- jsonc/array-bracket-newline -----
type JsoncArrayBracketNewline = [] | [(("always" | "never" | "consistent") | {
  multiline?: boolean;
  minItems?: (number | null);
})];
// ----- jsonc/array-bracket-spacing -----
type JsoncArrayBracketSpacing = [] | [("always" | "never")] | [("always" | "never"), {
  singleValue?: boolean;
  objectsInArrays?: boolean;
  arraysInArrays?: boolean;
}];
// ----- jsonc/array-element-newline -----
type JsoncArrayElementNewline = [] | [(_JsoncArrayElementNewlineBasicConfig | {
  ArrayExpression?: _JsoncArrayElementNewlineBasicConfig;
  JSONArrayExpression?: _JsoncArrayElementNewlineBasicConfig;
  ArrayPattern?: _JsoncArrayElementNewlineBasicConfig;
})];
type _JsoncArrayElementNewlineBasicConfig = (("always" | "never" | "consistent") | {
  multiline?: boolean;
  minItems?: (number | null);
});
// ----- jsonc/comma-dangle -----
type JsoncCommaDangle = [] | [(_JsoncCommaDangleValue | {
  arrays?: _JsoncCommaDangleValueWithIgnore;
  objects?: _JsoncCommaDangleValueWithIgnore;
  imports?: _JsoncCommaDangleValueWithIgnore;
  exports?: _JsoncCommaDangleValueWithIgnore;
  functions?: _JsoncCommaDangleValueWithIgnore;
})];
type _JsoncCommaDangleValue = ("always-multiline" | "always" | "never" | "only-multiline");
type _JsoncCommaDangleValueWithIgnore = ("always-multiline" | "always" | "ignore" | "never" | "only-multiline");
// ----- jsonc/comma-style -----
type JsoncCommaStyle = [] | [("first" | "last")] | [("first" | "last"), {
  exceptions?: {
    [k: string]: boolean | undefined;
  };
}];
// ----- jsonc/indent -----
type JsoncIndent = [] | [("tab" | number)] | [("tab" | number), {
  SwitchCase?: number;
  VariableDeclarator?: ((number | ("first" | "off")) | {
    var?: (number | ("first" | "off"));
    let?: (number | ("first" | "off"));
    const?: (number | ("first" | "off"));
  });
  outerIIFEBody?: (number | "off");
  MemberExpression?: (number | "off");
  FunctionDeclaration?: {
    parameters?: (number | ("first" | "off"));
    body?: number;
  };
  FunctionExpression?: {
    parameters?: (number | ("first" | "off"));
    body?: number;
  };
  StaticBlock?: {
    body?: number;
  };
  CallExpression?: {
    arguments?: (number | ("first" | "off"));
  };
  ArrayExpression?: (number | ("first" | "off"));
  ObjectExpression?: (number | ("first" | "off"));
  ImportDeclaration?: (number | ("first" | "off"));
  flatTernaryExpressions?: boolean;
  offsetTernaryExpressions?: boolean;
  ignoredNodes?: string[];
  ignoreComments?: boolean;
}];
// ----- jsonc/key-name-casing -----
type JsoncKeyNameCasing = [] | [{
  camelCase?: boolean;
  PascalCase?: boolean;
  SCREAMING_SNAKE_CASE?: boolean;
  "kebab-case"?: boolean;
  snake_case?: boolean;
  ignores?: string[];
}];
// ----- jsonc/key-spacing -----
type JsoncKeySpacing = [] | [({
  align?: (("colon" | "value") | {
    mode?: ("strict" | "minimum");
    on?: ("colon" | "value");
    beforeColon?: boolean;
    afterColon?: boolean;
  });
  mode?: ("strict" | "minimum");
  beforeColon?: boolean;
  afterColon?: boolean;
} | {
  singleLine?: {
    mode?: ("strict" | "minimum");
    beforeColon?: boolean;
    afterColon?: boolean;
  };
  multiLine?: {
    align?: (("colon" | "value") | {
      mode?: ("strict" | "minimum");
      on?: ("colon" | "value");
      beforeColon?: boolean;
      afterColon?: boolean;
    });
    mode?: ("strict" | "minimum");
    beforeColon?: boolean;
    afterColon?: boolean;
  };
} | {
  singleLine?: {
    mode?: ("strict" | "minimum");
    beforeColon?: boolean;
    afterColon?: boolean;
  };
  multiLine?: {
    mode?: ("strict" | "minimum");
    beforeColon?: boolean;
    afterColon?: boolean;
  };
  align?: {
    mode?: ("strict" | "minimum");
    on?: ("colon" | "value");
    beforeColon?: boolean;
    afterColon?: boolean;
  };
})];
// ----- jsonc/no-irregular-whitespace -----
type JsoncNoIrregularWhitespace = [] | [{
  skipComments?: boolean;
  skipStrings?: boolean;
  skipTemplates?: boolean;
  skipRegExps?: boolean;
  skipJSXText?: boolean;
}];
// ----- jsonc/no-useless-escape -----
type JsoncNoUselessEscape = [] | [{
  allowRegexCharacters?: string[];
}];
// ----- jsonc/object-curly-newline -----
type JsoncObjectCurlyNewline = [] | [((("always" | "never") | {
  multiline?: boolean;
  minProperties?: number;
  consistent?: boolean;
}) | {
  ObjectExpression?: (("always" | "never") | {
    multiline?: boolean;
    minProperties?: number;
    consistent?: boolean;
  });
  ObjectPattern?: (("always" | "never") | {
    multiline?: boolean;
    minProperties?: number;
    consistent?: boolean;
  });
  ImportDeclaration?: (("always" | "never") | {
    multiline?: boolean;
    minProperties?: number;
    consistent?: boolean;
  });
  ExportDeclaration?: (("always" | "never") | {
    multiline?: boolean;
    minProperties?: number;
    consistent?: boolean;
  });
})];
// ----- jsonc/object-curly-spacing -----
type JsoncObjectCurlySpacing = [] | [("always" | "never")] | [("always" | "never"), {
  arraysInObjects?: boolean;
  objectsInObjects?: boolean;
}];
// ----- jsonc/object-property-newline -----
type JsoncObjectPropertyNewline = [] | [{
  allowAllPropertiesOnSameLine?: boolean;
  allowMultiplePropertiesPerLine?: boolean;
}];
// ----- jsonc/quote-props -----
type JsoncQuoteProps = ([] | [("always" | "as-needed" | "consistent" | "consistent-as-needed")] | [] | [("always" | "as-needed" | "consistent" | "consistent-as-needed")] | [("always" | "as-needed" | "consistent" | "consistent-as-needed"), {
  keywords?: boolean;
  unnecessary?: boolean;
  numbers?: boolean;
}]);
// ----- jsonc/quotes -----
type JsoncQuotes = [] | [("single" | "double" | "backtick")] | [("single" | "double" | "backtick"), ("avoid-escape" | {
  avoidEscape?: boolean;
  allowTemplateLiterals?: boolean;
})];
// ----- jsonc/sort-array-values -----
type JsoncSortArrayValues = [{
  pathPattern: string;
  order: ((string | {
    valuePattern?: string;
    order?: {
      type?: ("asc" | "desc");
      caseSensitive?: boolean;
      natural?: boolean;
    };
  })[] | {
    type?: ("asc" | "desc");
    caseSensitive?: boolean;
    natural?: boolean;
  });
  minValues?: number;
}, ...({
  pathPattern: string;
  order: ((string | {
    valuePattern?: string;
    order?: {
      type?: ("asc" | "desc");
      caseSensitive?: boolean;
      natural?: boolean;
    };
  })[] | {
    type?: ("asc" | "desc");
    caseSensitive?: boolean;
    natural?: boolean;
  });
  minValues?: number;
})[]];
// ----- jsonc/sort-keys -----
type JsoncSortKeys = ([{
  pathPattern: string;
  hasProperties?: string[];
  order: ((string | {
    keyPattern?: string;
    order?: {
      type?: ("asc" | "desc");
      caseSensitive?: boolean;
      natural?: boolean;
    };
  })[] | {
    type?: ("asc" | "desc");
    caseSensitive?: boolean;
    natural?: boolean;
  });
  minKeys?: number;
  allowLineSeparatedGroups?: boolean;
}, ...({
  pathPattern: string;
  hasProperties?: string[];
  order: ((string | {
    keyPattern?: string;
    order?: {
      type?: ("asc" | "desc");
      caseSensitive?: boolean;
      natural?: boolean;
    };
  })[] | {
    type?: ("asc" | "desc");
    caseSensitive?: boolean;
    natural?: boolean;
  });
  minKeys?: number;
  allowLineSeparatedGroups?: boolean;
})[]] | [] | [("asc" | "desc")] | [("asc" | "desc"), {
  caseSensitive?: boolean;
  natural?: boolean;
  minKeys?: number;
  allowLineSeparatedGroups?: boolean;
}]);
// ----- jsonc/space-unary-ops -----
type JsoncSpaceUnaryOps = [] | [{
  words?: boolean;
  nonwords?: boolean;
  overrides?: {
    [k: string]: boolean | undefined;
  };
}];
// ----- jsx-a11y/accessible-emoji -----
type JsxA11YAccessibleEmoji = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/alt-text -----
type JsxA11YAltText = [] | [{
  elements?: string[];
  img?: string[];
  object?: string[];
  area?: string[];
  "input[type=\"image\"]"?: string[];
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/anchor-ambiguous-text -----
type JsxA11YAnchorAmbiguousText = [] | [{
  words?: string[];
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/anchor-has-content -----
type JsxA11YAnchorHasContent = [] | [{
  components?: string[];
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/anchor-is-valid -----
type JsxA11YAnchorIsValid = [] | [{
  components?: string[];
  specialLink?: string[];
  aspects?: [("noHref" | "invalidHref" | "preferButton"), ...(("noHref" | "invalidHref" | "preferButton"))[]];
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/aria-activedescendant-has-tabindex -----
type JsxA11YAriaActivedescendantHasTabindex = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/aria-props -----
type JsxA11YAriaProps = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/aria-proptypes -----
type JsxA11YAriaProptypes = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/aria-role -----
type JsxA11YAriaRole = [] | [{
  allowedInvalidRoles?: string[];
  ignoreNonDOM?: boolean;
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/aria-unsupported-elements -----
type JsxA11YAriaUnsupportedElements = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/autocomplete-valid -----
type JsxA11YAutocompleteValid = [] | [{
  inputComponents?: string[];
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/click-events-have-key-events -----
type JsxA11YClickEventsHaveKeyEvents = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/control-has-associated-label -----
type JsxA11YControlHasAssociatedLabel = [] | [{
  labelAttributes?: string[];
  controlComponents?: string[];
  ignoreElements?: string[];
  ignoreRoles?: string[];
  depth?: number;
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/heading-has-content -----
type JsxA11YHeadingHasContent = [] | [{
  components?: string[];
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/html-has-lang -----
type JsxA11YHtmlHasLang = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/iframe-has-title -----
type JsxA11YIframeHasTitle = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/img-redundant-alt -----
type JsxA11YImgRedundantAlt = [] | [{
  components?: string[];
  words?: string[];
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/interactive-supports-focus -----
type JsxA11YInteractiveSupportsFocus = [] | [{
  tabbable?: ("button" | "checkbox" | "columnheader" | "combobox" | "grid" | "gridcell" | "link" | "listbox" | "menu" | "menubar" | "menuitem" | "menuitemcheckbox" | "menuitemradio" | "option" | "progressbar" | "radio" | "radiogroup" | "row" | "rowheader" | "scrollbar" | "searchbox" | "slider" | "spinbutton" | "switch" | "tab" | "tablist" | "textbox" | "tree" | "treegrid" | "treeitem" | "doc-backlink" | "doc-biblioref" | "doc-glossref" | "doc-noteref")[];
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/label-has-associated-control -----
type JsxA11YLabelHasAssociatedControl = [] | [{
  labelComponents?: string[];
  labelAttributes?: string[];
  controlComponents?: string[];
  assert?: ("htmlFor" | "nesting" | "both" | "either");
  depth?: number;
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/label-has-for -----
type JsxA11YLabelHasFor = [] | [{
  components?: string[];
  required?: (("nesting" | "id") | {
    some: ("nesting" | "id")[];
    [k: string]: unknown | undefined;
  } | {
    every: ("nesting" | "id")[];
    [k: string]: unknown | undefined;
  });
  allowChildren?: boolean;
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/lang -----
type JsxA11YLang = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/media-has-caption -----
type JsxA11YMediaHasCaption = [] | [{
  audio?: string[];
  video?: string[];
  track?: string[];
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/mouse-events-have-key-events -----
type JsxA11YMouseEventsHaveKeyEvents = [] | [{
  hoverInHandlers?: string[];
  hoverOutHandlers?: string[];
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/no-access-key -----
type JsxA11YNoAccessKey = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/no-aria-hidden-on-focusable -----
type JsxA11YNoAriaHiddenOnFocusable = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/no-autofocus -----
type JsxA11YNoAutofocus = [] | [{
  ignoreNonDOM?: boolean;
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/no-distracting-elements -----
type JsxA11YNoDistractingElements = [] | [{
  elements?: ("marquee" | "blink")[];
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/no-interactive-element-to-noninteractive-role -----
type JsxA11YNoInteractiveElementToNoninteractiveRole = [] | [{
  [k: string]: string[] | undefined;
}];
// ----- jsx-a11y/no-noninteractive-element-interactions -----
type JsxA11YNoNoninteractiveElementInteractions = [] | [{
  handlers?: string[];
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/no-noninteractive-element-to-interactive-role -----
type JsxA11YNoNoninteractiveElementToInteractiveRole = [] | [{
  [k: string]: string[] | undefined;
}];
// ----- jsx-a11y/no-noninteractive-tabindex -----
type JsxA11YNoNoninteractiveTabindex = [] | [{
  roles?: string[];
  tags?: string[];
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/no-onchange -----
type JsxA11YNoOnchange = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/no-redundant-roles -----
type JsxA11YNoRedundantRoles = [] | [{
  [k: string]: string[] | undefined;
}];
// ----- jsx-a11y/no-static-element-interactions -----
type JsxA11YNoStaticElementInteractions = [] | [{
  handlers?: string[];
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/prefer-tag-over-role -----
type JsxA11YPreferTagOverRole = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/role-has-required-aria-props -----
type JsxA11YRoleHasRequiredAriaProps = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/role-supports-aria-props -----
type JsxA11YRoleSupportsAriaProps = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/scope -----
type JsxA11YScope = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- jsx-a11y/tabindex-no-positive -----
type JsxA11YTabindexNoPositive = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- jsx-quotes -----
type JsxQuotes = [] | [("prefer-single" | "prefer-double")];
// ----- key-spacing -----
type KeySpacing = [] | [({
  align?: (("colon" | "value") | {
    mode?: ("strict" | "minimum");
    on?: ("colon" | "value");
    beforeColon?: boolean;
    afterColon?: boolean;
  });
  mode?: ("strict" | "minimum");
  beforeColon?: boolean;
  afterColon?: boolean;
} | {
  singleLine?: {
    mode?: ("strict" | "minimum");
    beforeColon?: boolean;
    afterColon?: boolean;
  };
  multiLine?: {
    align?: (("colon" | "value") | {
      mode?: ("strict" | "minimum");
      on?: ("colon" | "value");
      beforeColon?: boolean;
      afterColon?: boolean;
    });
    mode?: ("strict" | "minimum");
    beforeColon?: boolean;
    afterColon?: boolean;
  };
} | {
  singleLine?: {
    mode?: ("strict" | "minimum");
    beforeColon?: boolean;
    afterColon?: boolean;
  };
  multiLine?: {
    mode?: ("strict" | "minimum");
    beforeColon?: boolean;
    afterColon?: boolean;
  };
  align?: {
    mode?: ("strict" | "minimum");
    on?: ("colon" | "value");
    beforeColon?: boolean;
    afterColon?: boolean;
  };
})];
// ----- keyword-spacing -----
type KeywordSpacing = [] | [{
  before?: boolean;
  after?: boolean;
  overrides?: {
    abstract?: {
      before?: boolean;
      after?: boolean;
    };
    as?: {
      before?: boolean;
      after?: boolean;
    };
    async?: {
      before?: boolean;
      after?: boolean;
    };
    await?: {
      before?: boolean;
      after?: boolean;
    };
    boolean?: {
      before?: boolean;
      after?: boolean;
    };
    break?: {
      before?: boolean;
      after?: boolean;
    };
    byte?: {
      before?: boolean;
      after?: boolean;
    };
    case?: {
      before?: boolean;
      after?: boolean;
    };
    catch?: {
      before?: boolean;
      after?: boolean;
    };
    char?: {
      before?: boolean;
      after?: boolean;
    };
    class?: {
      before?: boolean;
      after?: boolean;
    };
    const?: {
      before?: boolean;
      after?: boolean;
    };
    continue?: {
      before?: boolean;
      after?: boolean;
    };
    debugger?: {
      before?: boolean;
      after?: boolean;
    };
    default?: {
      before?: boolean;
      after?: boolean;
    };
    delete?: {
      before?: boolean;
      after?: boolean;
    };
    do?: {
      before?: boolean;
      after?: boolean;
    };
    double?: {
      before?: boolean;
      after?: boolean;
    };
    else?: {
      before?: boolean;
      after?: boolean;
    };
    enum?: {
      before?: boolean;
      after?: boolean;
    };
    export?: {
      before?: boolean;
      after?: boolean;
    };
    extends?: {
      before?: boolean;
      after?: boolean;
    };
    false?: {
      before?: boolean;
      after?: boolean;
    };
    final?: {
      before?: boolean;
      after?: boolean;
    };
    finally?: {
      before?: boolean;
      after?: boolean;
    };
    float?: {
      before?: boolean;
      after?: boolean;
    };
    for?: {
      before?: boolean;
      after?: boolean;
    };
    from?: {
      before?: boolean;
      after?: boolean;
    };
    function?: {
      before?: boolean;
      after?: boolean;
    };
    get?: {
      before?: boolean;
      after?: boolean;
    };
    goto?: {
      before?: boolean;
      after?: boolean;
    };
    if?: {
      before?: boolean;
      after?: boolean;
    };
    implements?: {
      before?: boolean;
      after?: boolean;
    };
    import?: {
      before?: boolean;
      after?: boolean;
    };
    in?: {
      before?: boolean;
      after?: boolean;
    };
    instanceof?: {
      before?: boolean;
      after?: boolean;
    };
    int?: {
      before?: boolean;
      after?: boolean;
    };
    interface?: {
      before?: boolean;
      after?: boolean;
    };
    let?: {
      before?: boolean;
      after?: boolean;
    };
    long?: {
      before?: boolean;
      after?: boolean;
    };
    native?: {
      before?: boolean;
      after?: boolean;
    };
    new?: {
      before?: boolean;
      after?: boolean;
    };
    null?: {
      before?: boolean;
      after?: boolean;
    };
    of?: {
      before?: boolean;
      after?: boolean;
    };
    package?: {
      before?: boolean;
      after?: boolean;
    };
    private?: {
      before?: boolean;
      after?: boolean;
    };
    protected?: {
      before?: boolean;
      after?: boolean;
    };
    public?: {
      before?: boolean;
      after?: boolean;
    };
    return?: {
      before?: boolean;
      after?: boolean;
    };
    set?: {
      before?: boolean;
      after?: boolean;
    };
    short?: {
      before?: boolean;
      after?: boolean;
    };
    static?: {
      before?: boolean;
      after?: boolean;
    };
    super?: {
      before?: boolean;
      after?: boolean;
    };
    switch?: {
      before?: boolean;
      after?: boolean;
    };
    synchronized?: {
      before?: boolean;
      after?: boolean;
    };
    this?: {
      before?: boolean;
      after?: boolean;
    };
    throw?: {
      before?: boolean;
      after?: boolean;
    };
    throws?: {
      before?: boolean;
      after?: boolean;
    };
    transient?: {
      before?: boolean;
      after?: boolean;
    };
    true?: {
      before?: boolean;
      after?: boolean;
    };
    try?: {
      before?: boolean;
      after?: boolean;
    };
    typeof?: {
      before?: boolean;
      after?: boolean;
    };
    var?: {
      before?: boolean;
      after?: boolean;
    };
    void?: {
      before?: boolean;
      after?: boolean;
    };
    volatile?: {
      before?: boolean;
      after?: boolean;
    };
    while?: {
      before?: boolean;
      after?: boolean;
    };
    with?: {
      before?: boolean;
      after?: boolean;
    };
    yield?: {
      before?: boolean;
      after?: boolean;
    };
  };
}];
// ----- line-comment-position -----
type LineCommentPosition = [] | [(("above" | "beside") | {
  position?: ("above" | "beside");
  ignorePattern?: string;
  applyDefaultPatterns?: boolean;
  applyDefaultIgnorePatterns?: boolean;
})];
// ----- linebreak-style -----
type LinebreakStyle = [] | [("unix" | "windows")];
// ----- lines-around-comment -----
type LinesAroundComment = [] | [{
  beforeBlockComment?: boolean;
  afterBlockComment?: boolean;
  beforeLineComment?: boolean;
  afterLineComment?: boolean;
  allowBlockStart?: boolean;
  allowBlockEnd?: boolean;
  allowClassStart?: boolean;
  allowClassEnd?: boolean;
  allowObjectStart?: boolean;
  allowObjectEnd?: boolean;
  allowArrayStart?: boolean;
  allowArrayEnd?: boolean;
  ignorePattern?: string;
  applyDefaultIgnorePatterns?: boolean;
  afterHashbangComment?: boolean;
}];
// ----- lines-around-directive -----
type LinesAroundDirective = [] | [(("always" | "never") | {
  before?: ("always" | "never");
  after?: ("always" | "never");
})];
// ----- lines-between-class-members -----
type LinesBetweenClassMembers = [] | [({
  enforce: [{
    blankLine: ("always" | "never");
    prev: ("method" | "field" | "*");
    next: ("method" | "field" | "*");
  }, ...({
    blankLine: ("always" | "never");
    prev: ("method" | "field" | "*");
    next: ("method" | "field" | "*");
  })[]];
} | ("always" | "never"))] | [({
  enforce: [{
    blankLine: ("always" | "never");
    prev: ("method" | "field" | "*");
    next: ("method" | "field" | "*");
  }, ...({
    blankLine: ("always" | "never");
    prev: ("method" | "field" | "*");
    next: ("method" | "field" | "*");
  })[]];
} | ("always" | "never")), {
  exceptAfterSingleLine?: boolean;
}];
// ----- logical-assignment-operators -----
type LogicalAssignmentOperators = (([] | ["always"] | ["always", {
  enforceForIfStatements?: boolean;
}] | ["never"]) & unknown[]);
// ----- markdown/fenced-code-language -----
type MarkdownFencedCodeLanguage = [] | [{
  required?: string[];
}];
// ----- markdown/heading-increment -----
type MarkdownHeadingIncrement = [] | [{
  frontmatterTitle?: string;
}];
// ----- markdown/no-duplicate-definitions -----
type MarkdownNoDuplicateDefinitions = [] | [{
  allowDefinitions?: string[];
  allowFootnoteDefinitions?: string[];
}];
// ----- markdown/no-duplicate-headings -----
type MarkdownNoDuplicateHeadings = [] | [{
  checkSiblingsOnly?: boolean;
}];
// ----- markdown/no-empty-definitions -----
type MarkdownNoEmptyDefinitions = [] | [{
  allowDefinitions?: string[];
  allowFootnoteDefinitions?: string[];
  checkFootnoteDefinitions?: boolean;
}];
// ----- markdown/no-html -----
type MarkdownNoHtml = [] | [{
  allowed?: string[];
  allowedIgnoreCase?: boolean;
}];
// ----- markdown/no-missing-atx-heading-space -----
type MarkdownNoMissingAtxHeadingSpace = [] | [{
  checkClosedHeadings?: boolean;
}];
// ----- markdown/no-missing-label-refs -----
type MarkdownNoMissingLabelRefs = [] | [{
  allowLabels?: string[];
}];
// ----- markdown/no-missing-link-fragments -----
type MarkdownNoMissingLinkFragments = [] | [{
  ignoreCase?: boolean;
  allowPattern?: string;
}];
// ----- markdown/no-multiple-h1 -----
type MarkdownNoMultipleH1 = [] | [{
  frontmatterTitle?: string;
}];
// ----- markdown/no-space-in-emphasis -----
type MarkdownNoSpaceInEmphasis = [] | [{
  checkStrikethrough?: boolean;
}];
// ----- markdown/no-unused-definitions -----
type MarkdownNoUnusedDefinitions = [] | [{
  allowDefinitions?: string[];
  allowFootnoteDefinitions?: string[];
}];
// ----- markdown/table-column-count -----
type MarkdownTableColumnCount = [] | [{
  checkMissingCells?: boolean;
}];
// ----- max-classes-per-file -----
type MaxClassesPerFile = [] | [(number | {
  ignoreExpressions?: boolean;
  max?: number;
})];
// ----- max-depth -----
type MaxDepth = [] | [(number | {
  maximum?: number;
  max?: number;
})];
// ----- max-len -----
type MaxLen = [] | [({
  code?: number;
  comments?: number;
  tabWidth?: number;
  ignorePattern?: string;
  ignoreComments?: boolean;
  ignoreStrings?: boolean;
  ignoreUrls?: boolean;
  ignoreTemplateLiterals?: boolean;
  ignoreRegExpLiterals?: boolean;
  ignoreTrailingComments?: boolean;
} | number)] | [({
  code?: number;
  comments?: number;
  tabWidth?: number;
  ignorePattern?: string;
  ignoreComments?: boolean;
  ignoreStrings?: boolean;
  ignoreUrls?: boolean;
  ignoreTemplateLiterals?: boolean;
  ignoreRegExpLiterals?: boolean;
  ignoreTrailingComments?: boolean;
} | number), ({
  code?: number;
  comments?: number;
  tabWidth?: number;
  ignorePattern?: string;
  ignoreComments?: boolean;
  ignoreStrings?: boolean;
  ignoreUrls?: boolean;
  ignoreTemplateLiterals?: boolean;
  ignoreRegExpLiterals?: boolean;
  ignoreTrailingComments?: boolean;
} | number)] | [({
  code?: number;
  comments?: number;
  tabWidth?: number;
  ignorePattern?: string;
  ignoreComments?: boolean;
  ignoreStrings?: boolean;
  ignoreUrls?: boolean;
  ignoreTemplateLiterals?: boolean;
  ignoreRegExpLiterals?: boolean;
  ignoreTrailingComments?: boolean;
} | number), ({
  code?: number;
  comments?: number;
  tabWidth?: number;
  ignorePattern?: string;
  ignoreComments?: boolean;
  ignoreStrings?: boolean;
  ignoreUrls?: boolean;
  ignoreTemplateLiterals?: boolean;
  ignoreRegExpLiterals?: boolean;
  ignoreTrailingComments?: boolean;
} | number), {
  code?: number;
  comments?: number;
  tabWidth?: number;
  ignorePattern?: string;
  ignoreComments?: boolean;
  ignoreStrings?: boolean;
  ignoreUrls?: boolean;
  ignoreTemplateLiterals?: boolean;
  ignoreRegExpLiterals?: boolean;
  ignoreTrailingComments?: boolean;
}];
// ----- max-lines -----
type MaxLines = [] | [(number | {
  max?: number;
  skipComments?: boolean;
  skipBlankLines?: boolean;
})];
// ----- max-lines-per-function -----
type MaxLinesPerFunction = [] | [({
  max?: number;
  skipComments?: boolean;
  skipBlankLines?: boolean;
  IIFEs?: boolean;
} | number)];
// ----- max-nested-callbacks -----
type MaxNestedCallbacks = [] | [(number | {
  maximum?: number;
  max?: number;
})];
// ----- max-params -----
type MaxParams = [] | [(number | {
  maximum?: number;
  max?: number;
  countVoidThis?: boolean;
})];
// ----- max-statements -----
type MaxStatements = [] | [(number | {
  maximum?: number;
  max?: number;
})] | [(number | {
  maximum?: number;
  max?: number;
}), {
  ignoreTopLevelFunctions?: boolean;
}];
// ----- max-statements-per-line -----
type MaxStatementsPerLine = [] | [{
  max?: number;
}];
// ----- multiline-comment-style -----
type MultilineCommentStyle = ([] | [("starred-block" | "bare-block")] | [] | ["separate-lines"] | ["separate-lines", {
  checkJSDoc?: boolean;
}]);
// ----- multiline-ternary -----
type MultilineTernary = [] | [("always" | "always-multiline" | "never")];
// ----- new-cap -----
type NewCap = [] | [{
  newIsCap?: boolean;
  capIsNew?: boolean;
  newIsCapExceptions?: string[];
  newIsCapExceptionPattern?: string;
  capIsNewExceptions?: string[];
  capIsNewExceptionPattern?: string;
  properties?: boolean;
}];
// ----- new-parens -----
type NewParens = [] | [("always" | "never")];
// ----- newline-after-var -----
type NewlineAfterVar = [] | [("never" | "always")];
// ----- newline-per-chained-call -----
type NewlinePerChainedCall = [] | [{
  ignoreChainWithDepth?: number;
}];
// ----- next/no-html-link-for-pages -----
type NextNoHtmlLinkForPages = [] | [(string | string[])];
// ----- no-bitwise -----
type NoBitwise = [] | [{
  allow?: ("^" | "|" | "&" | "<<" | ">>" | ">>>" | "^=" | "|=" | "&=" | "<<=" | ">>=" | ">>>=" | "~")[];
  int32Hint?: boolean;
}];
// ----- no-cond-assign -----
type NoCondAssign = [] | [("except-parens" | "always")];
// ----- no-confusing-arrow -----
type NoConfusingArrow = [] | [{
  allowParens?: boolean;
  onlyOneSimpleParam?: boolean;
}];
// ----- no-console -----
type NoConsole = [] | [{
  allow?: [string, ...(string)[]];
}];
// ----- no-constant-condition -----
type NoConstantCondition = [] | [{
  checkLoops?: ("all" | "allExceptWhileTrue" | "none" | true | false);
}];
// ----- no-duplicate-imports -----
type NoDuplicateImports = [] | [{
  includeExports?: boolean;
  allowSeparateTypeImports?: boolean;
}];
// ----- no-else-return -----
type NoElseReturn = [] | [{
  allowElseIf?: boolean;
}];
// ----- no-empty -----
type NoEmpty = [] | [{
  allowEmptyCatch?: boolean;
}];
// ----- no-empty-function -----
type NoEmptyFunction = [] | [{
  allow?: ("functions" | "arrowFunctions" | "generatorFunctions" | "methods" | "generatorMethods" | "getters" | "setters" | "constructors" | "asyncFunctions" | "asyncMethods" | "privateConstructors" | "protectedConstructors" | "decoratedFunctions" | "overrideMethods")[];
}];
// ----- no-empty-pattern -----
type NoEmptyPattern = [] | [{
  allowObjectPatternsAsParameters?: boolean;
}];
// ----- no-eval -----
type NoEval = [] | [{
  allowIndirect?: boolean;
}];
// ----- no-extend-native -----
type NoExtendNative = [] | [{
  exceptions?: string[];
}];
// ----- no-extra-boolean-cast -----
type NoExtraBooleanCast = [] | [({
  enforceForInnerExpressions?: boolean;
} | {
  enforceForLogicalOperands?: boolean;
})];
// ----- no-extra-parens -----
type NoExtraParens = ([] | ["functions"] | [] | ["all"] | ["all", {
  conditionalAssign?: boolean;
  ternaryOperandBinaryExpressions?: boolean;
  nestedBinaryExpressions?: boolean;
  returnAssign?: boolean;
  ignoreJSX?: ("none" | "all" | "single-line" | "multi-line");
  enforceForArrowConditionals?: boolean;
  enforceForSequenceExpressions?: boolean;
  enforceForNewInMemberExpressions?: boolean;
  enforceForFunctionPrototypeMethods?: boolean;
  allowParensAfterCommentPattern?: string;
}]);
// ----- no-fallthrough -----
type NoFallthrough = [] | [{
  commentPattern?: string;
  allowEmptyCase?: boolean;
  reportUnusedFallthroughComment?: boolean;
}];
// ----- no-global-assign -----
type NoGlobalAssign = [] | [{
  exceptions?: string[];
}];
// ----- no-implicit-coercion -----
type NoImplicitCoercion = [] | [{
  boolean?: boolean;
  number?: boolean;
  string?: boolean;
  disallowTemplateShorthand?: boolean;
  allow?: ("~" | "!!" | "+" | "- -" | "-" | "*")[];
}];
// ----- no-implicit-globals -----
type NoImplicitGlobals = [] | [{
  lexicalBindings?: boolean;
}];
// ----- no-inline-comments -----
type NoInlineComments = [] | [{
  ignorePattern?: string;
}];
// ----- no-inner-declarations -----
type NoInnerDeclarations = [] | [("functions" | "both")] | [("functions" | "both"), {
  blockScopedFunctions?: ("allow" | "disallow");
}];
// ----- no-invalid-regexp -----
type NoInvalidRegexp = [] | [{
  allowConstructorFlags?: string[];
}];
// ----- no-invalid-this -----
type NoInvalidThis = [] | [{
  capIsConstructor?: boolean;
}];
// ----- no-irregular-whitespace -----
type NoIrregularWhitespace = [] | [{
  skipComments?: boolean;
  skipStrings?: boolean;
  skipTemplates?: boolean;
  skipRegExps?: boolean;
  skipJSXText?: boolean;
}];
// ----- no-labels -----
type NoLabels = [] | [{
  allowLoop?: boolean;
  allowSwitch?: boolean;
}];
// ----- no-magic-numbers -----
type NoMagicNumbers = [] | [{
  detectObjects?: boolean;
  enforceConst?: boolean;
  ignore?: (number | string)[];
  ignoreArrayIndexes?: boolean;
  ignoreDefaultValues?: boolean;
  ignoreClassFieldInitialValues?: boolean;
  ignoreEnums?: boolean;
  ignoreNumericLiteralTypes?: boolean;
  ignoreReadonlyClassProperties?: boolean;
  ignoreTypeIndexes?: boolean;
}];
// ----- no-misleading-character-class -----
type NoMisleadingCharacterClass = [] | [{
  allowEscape?: boolean;
}];
// ----- no-mixed-operators -----
type NoMixedOperators = [] | [{
  groups?: [("+" | "-" | "*" | "/" | "%" | "**" | "&" | "|" | "^" | "~" | "<<" | ">>" | ">>>" | "==" | "!=" | "===" | "!==" | ">" | ">=" | "<" | "<=" | "&&" | "||" | "in" | "instanceof" | "?:" | "??"), ("+" | "-" | "*" | "/" | "%" | "**" | "&" | "|" | "^" | "~" | "<<" | ">>" | ">>>" | "==" | "!=" | "===" | "!==" | ">" | ">=" | "<" | "<=" | "&&" | "||" | "in" | "instanceof" | "?:" | "??"), ...(("+" | "-" | "*" | "/" | "%" | "**" | "&" | "|" | "^" | "~" | "<<" | ">>" | ">>>" | "==" | "!=" | "===" | "!==" | ">" | ">=" | "<" | "<=" | "&&" | "||" | "in" | "instanceof" | "?:" | "??"))[]][];
  allowSamePrecedence?: boolean;
}];
// ----- no-mixed-requires -----
type NoMixedRequires = [] | [(boolean | {
  grouping?: boolean;
  allowCall?: boolean;
})];
// ----- no-mixed-spaces-and-tabs -----
type NoMixedSpacesAndTabs = [] | [("smart-tabs" | true | false)];
// ----- no-multi-assign -----
type NoMultiAssign = [] | [{
  ignoreNonDeclaration?: boolean;
}];
// ----- no-multi-spaces -----
type NoMultiSpaces = [] | [{
  exceptions?: {
    [k: string]: boolean;
  };
  ignoreEOLComments?: boolean;
}];
// ----- no-multiple-empty-lines -----
type NoMultipleEmptyLines = [] | [{
  max: number;
  maxEOF?: number;
  maxBOF?: number;
}];
// ----- no-native-reassign -----
type NoNativeReassign = [] | [{
  exceptions?: string[];
}];
// ----- no-param-reassign -----
type NoParamReassign = [] | [({
  props?: false;
} | {
  props?: true;
  ignorePropertyModificationsFor?: string[];
  ignorePropertyModificationsForRegex?: string[];
})];
// ----- no-plusplus -----
type NoPlusplus = [] | [{
  allowForLoopAfterthoughts?: boolean;
}];
// ----- no-promise-executor-return -----
type NoPromiseExecutorReturn = [] | [{
  allowVoid?: boolean;
}];
// ----- no-redeclare -----
type NoRedeclare = [] | [{
  builtinGlobals?: boolean;
}];
// ----- no-restricted-exports -----
type NoRestrictedExports = [] | [({
  restrictedNamedExports?: string[];
  restrictedNamedExportsPattern?: string;
} | {
  restrictedNamedExports?: string[];
  restrictedNamedExportsPattern?: string;
  restrictDefaultExports?: {
    direct?: boolean;
    named?: boolean;
    defaultFrom?: boolean;
    namedFrom?: boolean;
    namespaceFrom?: boolean;
  };
})];
// ----- no-restricted-globals -----
type NoRestrictedGlobals = ((string | {
  name: string;
  message?: string;
})[] | [] | [{
  globals: (string | {
    name: string;
    message?: string;
  })[];
  checkGlobalObject?: boolean;
  globalObjects?: string[];
}]);
// ----- no-restricted-imports -----
type NoRestrictedImports = ((string | {
  name: string;
  message?: string;
  importNames?: string[];
  allowImportNames?: string[];
  allowTypeImports?: boolean;
})[] | [] | [{
  paths?: (string | {
    name: string;
    message?: string;
    importNames?: string[];
    allowImportNames?: string[];
    allowTypeImports?: boolean;
  })[];
  patterns?: (string[] | ({
    [k: string]: unknown | undefined;
  } | {
    [k: string]: unknown | undefined;
  })[]);
}]);
// ----- no-restricted-modules -----
type NoRestrictedModules = ((string | {
  name: string;
  message?: string;
})[] | {
  paths?: (string | {
    name: string;
    message?: string;
  })[];
  patterns?: string[];
}[]);
// ----- no-restricted-properties -----
type NoRestrictedProperties = ({
  [k: string]: unknown | undefined;
} | {
  [k: string]: unknown | undefined;
})[];
// ----- no-restricted-syntax -----
type NoRestrictedSyntax = (string | {
  selector: string;
  message?: string;
})[];
// ----- no-return-assign -----
type NoReturnAssign = [] | [("except-parens" | "always")];
// ----- no-self-assign -----
type NoSelfAssign = [] | [{
  props?: boolean;
}];
// ----- no-sequences -----
type NoSequences = [] | [{
  allowInParentheses?: boolean;
}];
// ----- no-shadow -----
type NoShadow = [] | [{
  builtinGlobals?: boolean;
  hoist?: ("all" | "functions" | "never" | "types" | "functions-and-types");
  allow?: string[];
  ignoreOnInitialization?: boolean;
  ignoreTypeValueShadow?: boolean;
  ignoreFunctionTypeParameterNameValueShadow?: boolean;
}];
// ----- no-shadow-restricted-names -----
type NoShadowRestrictedNames = [] | [{
  reportGlobalThis?: boolean;
}];
// ----- no-sync -----
type NoSync = [] | [{
  allowAtRootLevel?: boolean;
}];
// ----- no-tabs -----
type NoTabs = [] | [{
  allowIndentationTabs?: boolean;
}];
// ----- no-trailing-spaces -----
type NoTrailingSpaces = [] | [{
  skipBlankLines?: boolean;
  ignoreComments?: boolean;
}];
// ----- no-undef -----
type NoUndef = [] | [{
  typeof?: boolean;
}];
// ----- no-underscore-dangle -----
type NoUnderscoreDangle = [] | [{
  allow?: string[];
  allowAfterThis?: boolean;
  allowAfterSuper?: boolean;
  allowAfterThisConstructor?: boolean;
  enforceInMethodNames?: boolean;
  allowFunctionParams?: boolean;
  enforceInClassFields?: boolean;
  allowInArrayDestructuring?: boolean;
  allowInObjectDestructuring?: boolean;
}];
// ----- no-unneeded-ternary -----
type NoUnneededTernary = [] | [{
  defaultAssignment?: boolean;
}];
// ----- no-unreachable-loop -----
type NoUnreachableLoop = [] | [{
  ignore?: ("WhileStatement" | "DoWhileStatement" | "ForStatement" | "ForInStatement" | "ForOfStatement")[];
}];
// ----- no-unsafe-negation -----
type NoUnsafeNegation = [] | [{
  enforceForOrderingRelations?: boolean;
}];
// ----- no-unsafe-optional-chaining -----
type NoUnsafeOptionalChaining = [] | [{
  disallowArithmeticOperators?: boolean;
}];
// ----- no-unused-expressions -----
type NoUnusedExpressions = [] | [{
  allowShortCircuit?: boolean;
  allowTernary?: boolean;
  allowTaggedTemplates?: boolean;
  enforceForJSX?: boolean;
  ignoreDirectives?: boolean;
}];
// ----- no-unused-vars -----
type NoUnusedVars = [] | [(("all" | "local") | {
  vars?: ("all" | "local");
  varsIgnorePattern?: string;
  args?: ("all" | "after-used" | "none");
  ignoreRestSiblings?: boolean;
  argsIgnorePattern?: string;
  caughtErrors?: ("all" | "none");
  caughtErrorsIgnorePattern?: string;
  destructuredArrayIgnorePattern?: string;
  ignoreClassWithStaticInitBlock?: boolean;
  ignoreUsingDeclarations?: boolean;
  reportUsedIgnorePattern?: boolean;
})];
// ----- no-use-before-define -----
type NoUseBeforeDefine = [] | [("nofunc" | {
  functions?: boolean;
  classes?: boolean;
  variables?: boolean;
  allowNamedExports?: boolean;
  enums?: boolean;
  typedefs?: boolean;
  ignoreTypeReferences?: boolean;
})];
// ----- no-useless-computed-key -----
type NoUselessComputedKey = [] | [{
  enforceForClassMembers?: boolean;
}];
// ----- no-useless-escape -----
type NoUselessEscape = [] | [{
  allowRegexCharacters?: string[];
}];
// ----- no-useless-rename -----
type NoUselessRename = [] | [{
  ignoreDestructuring?: boolean;
  ignoreImport?: boolean;
  ignoreExport?: boolean;
}];
// ----- no-void -----
type NoVoid = [] | [{
  allowAsStatement?: boolean;
}];
// ----- no-warning-comments -----
type NoWarningComments = [] | [{
  terms?: string[];
  location?: ("start" | "anywhere");
  decoration?: [string, ...(string)[]];
}];
// ----- node/callback-return -----
type NodeCallbackReturn = [] | [string[]];
// ----- node/exports-style -----
type NodeExportsStyle = [] | [("module.exports" | "exports")] | [("module.exports" | "exports"), {
  allowBatchAssign?: boolean;
}];
// ----- node/file-extension-in-import -----
type NodeFileExtensionInImport = [] | [("always" | "never")] | [("always" | "never"), {
  [k: string]: ("always" | "never") | undefined;
}];
// ----- node/handle-callback-err -----
type NodeHandleCallbackErr = [] | [string];
// ----- node/hashbang -----
type NodeHashbang = [] | [{
  convertPath?: ({
    [k: string]: [string, string];
  } | [{
    include: [string, ...(string)[]];
    exclude?: string[];
    replace: [string, string];
  }, ...({
    include: [string, ...(string)[]];
    exclude?: string[];
    replace: [string, string];
  })[]]);
  ignoreUnpublished?: boolean;
  additionalExecutables?: string[];
  executableMap?: {
    [k: string]: string;
  };
}];
// ----- node/no-deprecated-api -----
type NodeNoDeprecatedApi = [] | [{
  version?: string;
  ignoreModuleItems?: ("_linklist" | "_stream_wrap" | "async_hooks.currentId" | "async_hooks.triggerId" | "buffer.Buffer()" | "new buffer.Buffer()" | "buffer.SlowBuffer" | "constants" | "crypto._toBuf" | "crypto.Credentials" | "crypto.DEFAULT_ENCODING" | "crypto.createCipher" | "crypto.createCredentials" | "crypto.createDecipher" | "crypto.fips" | "crypto.prng" | "crypto.pseudoRandomBytes" | "crypto.rng" | "domain" | "events.EventEmitter.listenerCount" | "events.listenerCount" | "freelist" | "fs.SyncWriteStream" | "fs.exists" | "fs.lchmod" | "fs.lchmodSync" | "http.createClient" | "module.Module.createRequireFromPath" | "module.Module.requireRepl" | "module.Module._debug" | "module.createRequireFromPath" | "module.requireRepl" | "module._debug" | "net._setSimultaneousAccepts" | "os.getNetworkInterfaces" | "os.tmpDir" | "path._makeLong" | "process.EventEmitter" | "process.assert" | "process.binding" | "process.env.NODE_REPL_HISTORY_FILE" | "process.report.triggerReport" | "punycode" | "readline.codePointAt" | "readline.getStringWidth" | "readline.isFullWidthCodePoint" | "readline.stripVTControlCharacters" | "repl.REPLServer" | "repl.Recoverable" | "repl.REPL_MODE_MAGIC" | "repl.builtinModules" | "safe-buffer.Buffer()" | "new safe-buffer.Buffer()" | "safe-buffer.SlowBuffer" | "sys" | "timers.enroll" | "timers.unenroll" | "tls.CleartextStream" | "tls.CryptoStream" | "tls.SecurePair" | "tls.convertNPNProtocols" | "tls.createSecurePair" | "tls.parseCertString" | "tty.setRawMode" | "url.parse" | "url.resolve" | "util.debug" | "util.error" | "util.isArray" | "util.isBoolean" | "util.isBuffer" | "util.isDate" | "util.isError" | "util.isFunction" | "util.isNull" | "util.isNullOrUndefined" | "util.isNumber" | "util.isObject" | "util.isPrimitive" | "util.isRegExp" | "util.isString" | "util.isSymbol" | "util.isUndefined" | "util.log" | "util.print" | "util.pump" | "util.puts" | "util._extend" | "vm.runInDebugContext" | "zlib.BrotliCompress()" | "zlib.BrotliDecompress()" | "zlib.Deflate()" | "zlib.DeflateRaw()" | "zlib.Gunzip()" | "zlib.Gzip()" | "zlib.Inflate()" | "zlib.InflateRaw()" | "zlib.Unzip()")[];
  ignoreGlobalItems?: ("Buffer()" | "new Buffer()" | "COUNTER_NET_SERVER_CONNECTION" | "COUNTER_NET_SERVER_CONNECTION_CLOSE" | "COUNTER_HTTP_SERVER_REQUEST" | "COUNTER_HTTP_SERVER_RESPONSE" | "COUNTER_HTTP_CLIENT_REQUEST" | "COUNTER_HTTP_CLIENT_RESPONSE" | "GLOBAL" | "Intl.v8BreakIterator" | "require.extensions" | "root" | "process.EventEmitter" | "process.assert" | "process.binding" | "process.env.NODE_REPL_HISTORY_FILE" | "process.report.triggerReport")[];
  ignoreIndirectDependencies?: boolean;
}];
// ----- node/no-extraneous-import -----
type NodeNoExtraneousImport = [] | [{
  allowModules?: string[];
  convertPath?: ({
    [k: string]: [string, string];
  } | [{
    include: [string, ...(string)[]];
    exclude?: string[];
    replace: [string, string];
  }, ...({
    include: [string, ...(string)[]];
    exclude?: string[];
    replace: [string, string];
  })[]]);
  resolvePaths?: string[];
  resolverConfig?: {
    [k: string]: unknown | undefined;
  };
}];
// ----- node/no-extraneous-require -----
type NodeNoExtraneousRequire = [] | [{
  allowModules?: string[];
  convertPath?: ({
    [k: string]: [string, string];
  } | [{
    include: [string, ...(string)[]];
    exclude?: string[];
    replace: [string, string];
  }, ...({
    include: [string, ...(string)[]];
    exclude?: string[];
    replace: [string, string];
  })[]]);
  resolvePaths?: string[];
  resolverConfig?: {
    [k: string]: unknown | undefined;
  };
  tryExtensions?: string[];
}];
// ----- node/no-hide-core-modules -----
type NodeNoHideCoreModules = [] | [{
  allow?: ("assert" | "buffer" | "child_process" | "cluster" | "console" | "constants" | "crypto" | "dgram" | "dns" | "events" | "fs" | "http" | "https" | "module" | "net" | "os" | "path" | "querystring" | "readline" | "repl" | "stream" | "string_decoder" | "timers" | "tls" | "tty" | "url" | "util" | "vm" | "zlib")[];
  ignoreDirectDependencies?: boolean;
  ignoreIndirectDependencies?: boolean;
}];
// ----- node/no-missing-import -----
type NodeNoMissingImport = [] | [{
  allowModules?: string[];
  resolvePaths?: string[];
  resolverConfig?: {
    [k: string]: unknown | undefined;
  };
  tryExtensions?: string[];
  ignoreTypeImport?: boolean;
  tsconfigPath?: string;
  typescriptExtensionMap?: (unknown[][] | ("react" | "react-jsx" | "react-jsxdev" | "react-native" | "preserve"));
}];
// ----- node/no-missing-require -----
type NodeNoMissingRequire = [] | [{
  allowModules?: string[];
  tryExtensions?: string[];
  resolvePaths?: string[];
  resolverConfig?: {
    [k: string]: unknown | undefined;
  };
  typescriptExtensionMap?: (unknown[][] | ("react" | "react-jsx" | "react-jsxdev" | "react-native" | "preserve"));
  tsconfigPath?: string;
}];
// ----- node/no-mixed-requires -----
type NodeNoMixedRequires = [] | [(boolean | {
  grouping?: boolean;
  allowCall?: boolean;
})];
// ----- node/no-process-env -----
type NodeNoProcessEnv = [] | [{
  allowedVariables?: string[];
}];
// ----- node/no-restricted-import -----
type NodeNoRestrictedImport = [] | [(string | {
  name: (string | string[]);
  message?: string;
})[]];
// ----- node/no-restricted-require -----
type NodeNoRestrictedRequire = [] | [(string | {
  name: (string | string[]);
  message?: string;
})[]];
// ----- node/no-sync -----
type NodeNoSync = [] | [{
  allowAtRootLevel?: boolean;
  ignores?: (string | {
    from?: "file";
    path?: string;
    name?: string[];
  } | {
    from?: "lib";
    name?: string[];
  } | {
    from?: "package";
    package?: string;
    name?: string[];
  })[];
}];
// ----- node/no-top-level-await -----
type NodeNoTopLevelAwait = [] | [{
  ignoreBin?: boolean;
  convertPath?: ({
    [k: string]: [string, string];
  } | [{
    include: [string, ...(string)[]];
    exclude?: string[];
    replace: [string, string];
  }, ...({
    include: [string, ...(string)[]];
    exclude?: string[];
    replace: [string, string];
  })[]]);
}];
// ----- node/no-unpublished-bin -----
type NodeNoUnpublishedBin = [] | [{
  convertPath?: ({
    [k: string]: [string, string];
  } | [{
    include: [string, ...(string)[]];
    exclude?: string[];
    replace: [string, string];
  }, ...({
    include: [string, ...(string)[]];
    exclude?: string[];
    replace: [string, string];
  })[]]);
  [k: string]: unknown | undefined;
}];
// ----- node/no-unpublished-import -----
type NodeNoUnpublishedImport = [] | [{
  allowModules?: string[];
  convertPath?: ({
    [k: string]: [string, string];
  } | [{
    include: [string, ...(string)[]];
    exclude?: string[];
    replace: [string, string];
  }, ...({
    include: [string, ...(string)[]];
    exclude?: string[];
    replace: [string, string];
  })[]]);
  resolvePaths?: string[];
  resolverConfig?: {
    [k: string]: unknown | undefined;
  };
  tryExtensions?: string[];
  ignoreTypeImport?: boolean;
  ignorePrivate?: boolean;
}];
// ----- node/no-unpublished-require -----
type NodeNoUnpublishedRequire = [] | [{
  allowModules?: string[];
  convertPath?: ({
    [k: string]: [string, string];
  } | [{
    include: [string, ...(string)[]];
    exclude?: string[];
    replace: [string, string];
  }, ...({
    include: [string, ...(string)[]];
    exclude?: string[];
    replace: [string, string];
  })[]]);
  resolvePaths?: string[];
  resolverConfig?: {
    [k: string]: unknown | undefined;
  };
  tryExtensions?: string[];
  ignorePrivate?: boolean;
}];
// ----- node/no-unsupported-features/es-builtins -----
type NodeNoUnsupportedFeaturesEsBuiltins = [] | [{
  version?: string;
  ignores?: ("AggregateError" | "Array" | "Array.from" | "Array.isArray" | "Array.length" | "Array.of" | "Array.toLocaleString" | "ArrayBuffer" | "ArrayBuffer.isView" | "Atomics" | "Atomics.add" | "Atomics.and" | "Atomics.compareExchange" | "Atomics.exchange" | "Atomics.isLockFree" | "Atomics.load" | "Atomics.notify" | "Atomics.or" | "Atomics.store" | "Atomics.sub" | "Atomics.wait" | "Atomics.waitAsync" | "Atomics.xor" | "BigInt" | "BigInt.asIntN" | "BigInt.asUintN" | "BigInt64Array" | "BigInt64Array.BYTES_PER_ELEMENT" | "BigInt64Array.from" | "BigInt64Array.name" | "BigInt64Array.of" | "BigUint64Array" | "BigUint64Array.BYTES_PER_ELEMENT" | "BigUint64Array.from" | "BigUint64Array.name" | "BigUint64Array.of" | "Boolean" | "DataView" | "Date" | "Date.UTC" | "Date.now" | "Date.parse" | "Date.toLocaleDateString" | "Date.toLocaleString" | "Date.toLocaleTimeString" | "Error" | "Error.cause" | "EvalError" | "FinalizationRegistry" | "Float32Array" | "Float32Array.BYTES_PER_ELEMENT" | "Float32Array.from" | "Float32Array.name" | "Float32Array.of" | "Float64Array" | "Float64Array.BYTES_PER_ELEMENT" | "Float64Array.from" | "Float64Array.name" | "Float64Array.of" | "Function" | "Function.length" | "Function.name" | "Infinity" | "Int16Array" | "Int16Array.BYTES_PER_ELEMENT" | "Int16Array.from" | "Int16Array.name" | "Int16Array.of" | "Int32Array" | "Int32Array.BYTES_PER_ELEMENT" | "Int32Array.from" | "Int32Array.name" | "Int32Array.of" | "Int8Array" | "Int8Array.BYTES_PER_ELEMENT" | "Int8Array.from" | "Int8Array.name" | "Int8Array.of" | "Intl" | "Intl.Collator" | "Intl.DateTimeFormat" | "Intl.DisplayNames" | "Intl.ListFormat" | "Intl.Locale" | "Intl.NumberFormat" | "Intl.PluralRules" | "Intl.RelativeTimeFormat" | "Intl.Segmenter" | "Intl.Segments" | "Intl.getCanonicalLocales" | "Intl.supportedValuesOf" | "JSON" | "JSON.parse" | "JSON.stringify" | "Map" | "Map.groupBy" | "Math" | "Math.E" | "Math.LN10" | "Math.LN2" | "Math.LOG10E" | "Math.LOG2E" | "Math.PI" | "Math.SQRT1_2" | "Math.SQRT2" | "Math.abs" | "Math.acos" | "Math.acosh" | "Math.asin" | "Math.asinh" | "Math.atan" | "Math.atan2" | "Math.atanh" | "Math.cbrt" | "Math.ceil" | "Math.clz32" | "Math.cos" | "Math.cosh" | "Math.exp" | "Math.expm1" | "Math.floor" | "Math.fround" | "Math.hypot" | "Math.imul" | "Math.log" | "Math.log10" | "Math.log1p" | "Math.log2" | "Math.max" | "Math.min" | "Math.pow" | "Math.random" | "Math.round" | "Math.sign" | "Math.sin" | "Math.sinh" | "Math.sqrt" | "Math.tan" | "Math.tanh" | "Math.trunc" | "NaN" | "Number.EPSILON" | "Number.MAX_SAFE_INTEGER" | "Number.MAX_VALUE" | "Number.MIN_SAFE_INTEGER" | "Number.MIN_VALUE" | "Number.NEGATIVE_INFINITY" | "Number.NaN" | "Number.POSITIVE_INFINITY" | "Number.isFinite" | "Number.isInteger" | "Number.isNaN" | "Number.isSafeInteger" | "Number.parseFloat" | "Number.parseInt" | "Number.toLocaleString" | "Object.assign" | "Object.create" | "Object.defineGetter" | "Object.defineProperties" | "Object.defineProperty" | "Object.defineSetter" | "Object.entries" | "Object.freeze" | "Object.fromEntries" | "Object.getOwnPropertyDescriptor" | "Object.getOwnPropertyDescriptors" | "Object.getOwnPropertyNames" | "Object.getOwnPropertySymbols" | "Object.getPrototypeOf" | "Object.groupBy" | "Object.hasOwn" | "Object.is" | "Object.isExtensible" | "Object.isFrozen" | "Object.isSealed" | "Object.keys" | "Object.lookupGetter" | "Object.lookupSetter" | "Object.preventExtensions" | "Object.proto" | "Object.seal" | "Object.setPrototypeOf" | "Object.values" | "Promise" | "Promise.all" | "Promise.allSettled" | "Promise.any" | "Promise.race" | "Promise.reject" | "Promise.resolve" | "Proxy" | "Proxy.revocable" | "RangeError" | "ReferenceError" | "Reflect" | "Reflect.apply" | "Reflect.construct" | "Reflect.defineProperty" | "Reflect.deleteProperty" | "Reflect.get" | "Reflect.getOwnPropertyDescriptor" | "Reflect.getPrototypeOf" | "Reflect.has" | "Reflect.isExtensible" | "Reflect.ownKeys" | "Reflect.preventExtensions" | "Reflect.set" | "Reflect.setPrototypeOf" | "RegExp" | "RegExp.dotAll" | "RegExp.hasIndices" | "RegExp.input" | "RegExp.lastIndex" | "RegExp.lastMatch" | "RegExp.lastParen" | "RegExp.leftContext" | "RegExp.n" | "RegExp.rightContext" | "Set" | "SharedArrayBuffer" | "String" | "String.fromCharCode" | "String.fromCodePoint" | "String.length" | "String.localeCompare" | "String.raw" | "String.toLocaleLowerCase" | "String.toLocaleUpperCase" | "Symbol" | "Symbol.asyncIterator" | "Symbol.for" | "Symbol.hasInstance" | "Symbol.isConcatSpreadable" | "Symbol.iterator" | "Symbol.keyFor" | "Symbol.match" | "Symbol.matchAll" | "Symbol.replace" | "Symbol.search" | "Symbol.species" | "Symbol.split" | "Symbol.toPrimitive" | "Symbol.toStringTag" | "Symbol.unscopables" | "SyntaxError" | "TypeError" | "URIError" | "Uint16Array" | "Uint16Array.BYTES_PER_ELEMENT" | "Uint16Array.from" | "Uint16Array.name" | "Uint16Array.of" | "Uint32Array" | "Uint32Array.BYTES_PER_ELEMENT" | "Uint32Array.from" | "Uint32Array.name" | "Uint32Array.of" | "Uint8Array" | "Uint8Array.BYTES_PER_ELEMENT" | "Uint8Array.from" | "Uint8Array.name" | "Uint8Array.of" | "Uint8ClampedArray" | "Uint8ClampedArray.BYTES_PER_ELEMENT" | "Uint8ClampedArray.from" | "Uint8ClampedArray.name" | "Uint8ClampedArray.of" | "WeakMap" | "WeakRef" | "WeakSet" | "decodeURI" | "decodeURIComponent" | "encodeURI" | "encodeURIComponent" | "escape" | "eval" | "globalThis" | "isFinite" | "isNaN" | "parseFloat" | "parseInt" | "unescape")[];
}];
// ----- node/no-unsupported-features/es-syntax -----
type NodeNoUnsupportedFeaturesEsSyntax = [] | [{
  version?: string;
  ignores?: ("no-accessor-properties" | "accessor-properties" | "accessorProperties" | "no-arbitrary-module-namespace-names" | "arbitrary-module-namespace-names" | "arbitraryModuleNamespaceNames" | "no-array-from" | "array-from" | "arrayFrom" | "no-array-isarray" | "array-isarray" | "arrayIsarray" | "no-array-of" | "array-of" | "arrayOf" | "no-array-prototype-copywithin" | "array-prototype-copywithin" | "arrayPrototypeCopywithin" | "no-array-prototype-entries" | "array-prototype-entries" | "arrayPrototypeEntries" | "no-array-prototype-every" | "array-prototype-every" | "arrayPrototypeEvery" | "no-array-prototype-fill" | "array-prototype-fill" | "arrayPrototypeFill" | "no-array-prototype-filter" | "array-prototype-filter" | "arrayPrototypeFilter" | "no-array-prototype-find" | "array-prototype-find" | "arrayPrototypeFind" | "no-array-prototype-findindex" | "array-prototype-findindex" | "arrayPrototypeFindindex" | "no-array-prototype-findlast-findlastindex" | "array-prototype-findlast-findlastindex" | "arrayPrototypeFindlastFindlastindex" | "no-array-prototype-flat" | "array-prototype-flat" | "arrayPrototypeFlat" | "no-array-prototype-foreach" | "array-prototype-foreach" | "arrayPrototypeForeach" | "no-array-prototype-includes" | "array-prototype-includes" | "arrayPrototypeIncludes" | "no-array-prototype-indexof" | "array-prototype-indexof" | "arrayPrototypeIndexof" | "no-array-prototype-keys" | "array-prototype-keys" | "arrayPrototypeKeys" | "no-array-prototype-lastindexof" | "array-prototype-lastindexof" | "arrayPrototypeLastindexof" | "no-array-prototype-map" | "array-prototype-map" | "arrayPrototypeMap" | "no-array-prototype-reduce" | "array-prototype-reduce" | "arrayPrototypeReduce" | "no-array-prototype-reduceright" | "array-prototype-reduceright" | "arrayPrototypeReduceright" | "no-array-prototype-some" | "array-prototype-some" | "arrayPrototypeSome" | "no-array-prototype-toreversed" | "array-prototype-toreversed" | "arrayPrototypeToreversed" | "no-array-prototype-tosorted" | "array-prototype-tosorted" | "arrayPrototypeTosorted" | "no-array-prototype-tospliced" | "array-prototype-tospliced" | "arrayPrototypeTospliced" | "no-array-prototype-values" | "array-prototype-values" | "arrayPrototypeValues" | "no-array-prototype-with" | "array-prototype-with" | "arrayPrototypeWith" | "no-array-string-prototype-at" | "array-string-prototype-at" | "arrayStringPrototypeAt" | "no-arrow-functions" | "arrow-functions" | "arrowFunctions" | "no-async-functions" | "async-functions" | "asyncFunctions" | "no-async-iteration" | "async-iteration" | "asyncIteration" | "no-atomics-waitasync" | "atomics-waitasync" | "atomicsWaitasync" | "no-atomics" | "atomics" | "no-bigint" | "bigint" | "no-binary-numeric-literals" | "binary-numeric-literals" | "binaryNumericLiterals" | "no-block-scoped-functions" | "block-scoped-functions" | "blockScopedFunctions" | "no-block-scoped-variables" | "block-scoped-variables" | "blockScopedVariables" | "no-class-fields" | "class-fields" | "classFields" | "no-class-static-block" | "class-static-block" | "classStaticBlock" | "no-classes" | "classes" | "no-computed-properties" | "computed-properties" | "computedProperties" | "no-date-now" | "date-now" | "dateNow" | "no-date-prototype-getyear-setyear" | "date-prototype-getyear-setyear" | "datePrototypeGetyearSetyear" | "no-date-prototype-togmtstring" | "date-prototype-togmtstring" | "datePrototypeTogmtstring" | "no-default-parameters" | "default-parameters" | "defaultParameters" | "no-destructuring" | "destructuring" | "no-dynamic-import" | "dynamic-import" | "dynamicImport" | "no-error-cause" | "error-cause" | "errorCause" | "no-escape-unescape" | "escape-unescape" | "escapeUnescape" | "no-exponential-operators" | "exponential-operators" | "exponentialOperators" | "no-export-ns-from" | "export-ns-from" | "exportNsFrom" | "no-for-of-loops" | "for-of-loops" | "forOfLoops" | "no-function-declarations-in-if-statement-clauses-without-block" | "function-declarations-in-if-statement-clauses-without-block" | "functionDeclarationsInIfStatementClausesWithoutBlock" | "no-function-prototype-bind" | "function-prototype-bind" | "functionPrototypeBind" | "no-generators" | "generators" | "no-global-this" | "global-this" | "globalThis" | "no-hashbang" | "hashbang" | "no-import-meta" | "import-meta" | "importMeta" | "no-initializers-in-for-in" | "initializers-in-for-in" | "initializersInForIn" | "no-intl-datetimeformat-prototype-formatrange" | "intl-datetimeformat-prototype-formatrange" | "intlDatetimeformatPrototypeFormatrange" | "no-intl-datetimeformat-prototype-formattoparts" | "intl-datetimeformat-prototype-formattoparts" | "intlDatetimeformatPrototypeFormattoparts" | "no-intl-displaynames" | "intl-displaynames" | "intlDisplaynames" | "no-intl-getcanonicallocales" | "intl-getcanonicallocales" | "intlGetcanonicallocales" | "no-intl-listformat" | "intl-listformat" | "intlListformat" | "no-intl-locale" | "intl-locale" | "intlLocale" | "no-intl-numberformat-prototype-formatrange" | "intl-numberformat-prototype-formatrange" | "intlNumberformatPrototypeFormatrange" | "no-intl-numberformat-prototype-formatrangetoparts" | "intl-numberformat-prototype-formatrangetoparts" | "intlNumberformatPrototypeFormatrangetoparts" | "no-intl-numberformat-prototype-formattoparts" | "intl-numberformat-prototype-formattoparts" | "intlNumberformatPrototypeFormattoparts" | "no-intl-pluralrules-prototype-selectrange" | "intl-pluralrules-prototype-selectrange" | "intlPluralrulesPrototypeSelectrange" | "no-intl-pluralrules" | "intl-pluralrules" | "intlPluralrules" | "no-intl-relativetimeformat" | "intl-relativetimeformat" | "intlRelativetimeformat" | "no-intl-segmenter" | "intl-segmenter" | "intlSegmenter" | "no-intl-supportedvaluesof" | "intl-supportedvaluesof" | "intlSupportedvaluesof" | "no-json-superset" | "json-superset" | "jsonSuperset" | "no-json" | "json" | "no-keyword-properties" | "keyword-properties" | "keywordProperties" | "no-labelled-function-declarations" | "labelled-function-declarations" | "labelledFunctionDeclarations" | "no-legacy-object-prototype-accessor-methods" | "legacy-object-prototype-accessor-methods" | "legacyObjectPrototypeAccessorMethods" | "no-logical-assignment-operators" | "logical-assignment-operators" | "logicalAssignmentOperators" | "no-malformed-template-literals" | "malformed-template-literals" | "malformedTemplateLiterals" | "no-map" | "map" | "no-math-acosh" | "math-acosh" | "mathAcosh" | "no-math-asinh" | "math-asinh" | "mathAsinh" | "no-math-atanh" | "math-atanh" | "mathAtanh" | "no-math-cbrt" | "math-cbrt" | "mathCbrt" | "no-math-clz32" | "math-clz32" | "mathClz32" | "no-math-cosh" | "math-cosh" | "mathCosh" | "no-math-expm1" | "math-expm1" | "mathExpm1" | "no-math-fround" | "math-fround" | "mathFround" | "no-math-hypot" | "math-hypot" | "mathHypot" | "no-math-imul" | "math-imul" | "mathImul" | "no-math-log10" | "math-log10" | "mathLog10" | "no-math-log1p" | "math-log1p" | "mathLog1p" | "no-math-log2" | "math-log2" | "mathLog2" | "no-math-sign" | "math-sign" | "mathSign" | "no-math-sinh" | "math-sinh" | "mathSinh" | "no-math-tanh" | "math-tanh" | "mathTanh" | "no-math-trunc" | "math-trunc" | "mathTrunc" | "no-modules" | "modules" | "no-new-target" | "new-target" | "newTarget" | "new.target" | "no-nullish-coalescing-operators" | "nullish-coalescing-operators" | "nullishCoalescingOperators" | "no-number-epsilon" | "number-epsilon" | "numberEpsilon" | "no-number-isfinite" | "number-isfinite" | "numberIsfinite" | "no-number-isinteger" | "number-isinteger" | "numberIsinteger" | "no-number-isnan" | "number-isnan" | "numberIsnan" | "no-number-issafeinteger" | "number-issafeinteger" | "numberIssafeinteger" | "no-number-maxsafeinteger" | "number-maxsafeinteger" | "numberMaxsafeinteger" | "no-number-minsafeinteger" | "number-minsafeinteger" | "numberMinsafeinteger" | "no-number-parsefloat" | "number-parsefloat" | "numberParsefloat" | "no-number-parseint" | "number-parseint" | "numberParseint" | "no-numeric-separators" | "numeric-separators" | "numericSeparators" | "no-object-assign" | "object-assign" | "objectAssign" | "no-object-create" | "object-create" | "objectCreate" | "no-object-defineproperties" | "object-defineproperties" | "objectDefineproperties" | "no-object-defineproperty" | "object-defineproperty" | "objectDefineproperty" | "no-object-entries" | "object-entries" | "objectEntries" | "no-object-freeze" | "object-freeze" | "objectFreeze" | "no-object-fromentries" | "object-fromentries" | "objectFromentries" | "no-object-getownpropertydescriptor" | "object-getownpropertydescriptor" | "objectGetownpropertydescriptor" | "no-object-getownpropertydescriptors" | "object-getownpropertydescriptors" | "objectGetownpropertydescriptors" | "no-object-getownpropertynames" | "object-getownpropertynames" | "objectGetownpropertynames" | "no-object-getownpropertysymbols" | "object-getownpropertysymbols" | "objectGetownpropertysymbols" | "no-object-getprototypeof" | "object-getprototypeof" | "objectGetprototypeof" | "no-object-hasown" | "object-hasown" | "objectHasown" | "no-object-is" | "object-is" | "objectIs" | "no-object-isextensible" | "object-isextensible" | "objectIsextensible" | "no-object-isfrozen" | "object-isfrozen" | "objectIsfrozen" | "no-object-issealed" | "object-issealed" | "objectIssealed" | "no-object-keys" | "object-keys" | "objectKeys" | "no-object-map-groupby" | "object-map-groupby" | "objectMapGroupby" | "no-object-preventextensions" | "object-preventextensions" | "objectPreventextensions" | "no-object-seal" | "object-seal" | "objectSeal" | "no-object-setprototypeof" | "object-setprototypeof" | "objectSetprototypeof" | "no-object-super-properties" | "object-super-properties" | "objectSuperProperties" | "no-object-values" | "object-values" | "objectValues" | "no-octal-numeric-literals" | "octal-numeric-literals" | "octalNumericLiterals" | "no-optional-catch-binding" | "optional-catch-binding" | "optionalCatchBinding" | "no-optional-chaining" | "optional-chaining" | "optionalChaining" | "no-private-in" | "private-in" | "privateIn" | "no-promise-all-settled" | "promise-all-settled" | "promiseAllSettled" | "no-promise-any" | "promise-any" | "promiseAny" | "no-promise-prototype-finally" | "promise-prototype-finally" | "promisePrototypeFinally" | "no-promise-withresolvers" | "promise-withresolvers" | "promiseWithresolvers" | "no-promise" | "promise" | "no-property-shorthands" | "property-shorthands" | "propertyShorthands" | "no-proxy" | "proxy" | "no-reflect" | "reflect" | "no-regexp-d-flag" | "regexp-d-flag" | "regexpDFlag" | "no-regexp-lookbehind-assertions" | "regexp-lookbehind-assertions" | "regexpLookbehindAssertions" | "regexpLookbehind" | "no-regexp-named-capture-groups" | "regexp-named-capture-groups" | "regexpNamedCaptureGroups" | "no-regexp-prototype-compile" | "regexp-prototype-compile" | "regexpPrototypeCompile" | "no-regexp-prototype-flags" | "regexp-prototype-flags" | "regexpPrototypeFlags" | "no-regexp-s-flag" | "regexp-s-flag" | "regexpSFlag" | "regexpS" | "no-regexp-u-flag" | "regexp-u-flag" | "regexpUFlag" | "regexpU" | "no-regexp-unicode-property-escapes-2019" | "regexp-unicode-property-escapes-2019" | "regexpUnicodePropertyEscapes2019" | "no-regexp-unicode-property-escapes-2020" | "regexp-unicode-property-escapes-2020" | "regexpUnicodePropertyEscapes2020" | "no-regexp-unicode-property-escapes-2021" | "regexp-unicode-property-escapes-2021" | "regexpUnicodePropertyEscapes2021" | "no-regexp-unicode-property-escapes-2022" | "regexp-unicode-property-escapes-2022" | "regexpUnicodePropertyEscapes2022" | "no-regexp-unicode-property-escapes-2023" | "regexp-unicode-property-escapes-2023" | "regexpUnicodePropertyEscapes2023" | "no-regexp-unicode-property-escapes" | "regexp-unicode-property-escapes" | "regexpUnicodePropertyEscapes" | "regexpUnicodeProperties" | "no-regexp-v-flag" | "regexp-v-flag" | "regexpVFlag" | "no-regexp-y-flag" | "regexp-y-flag" | "regexpYFlag" | "regexpY" | "no-resizable-and-growable-arraybuffers" | "resizable-and-growable-arraybuffers" | "resizableAndGrowableArraybuffers" | "no-rest-parameters" | "rest-parameters" | "restParameters" | "no-rest-spread-properties" | "rest-spread-properties" | "restSpreadProperties" | "no-set" | "set" | "no-shadow-catch-param" | "shadow-catch-param" | "shadowCatchParam" | "no-shared-array-buffer" | "shared-array-buffer" | "sharedArrayBuffer" | "no-spread-elements" | "spread-elements" | "spreadElements" | "no-string-create-html-methods" | "string-create-html-methods" | "stringCreateHtmlMethods" | "no-string-fromcodepoint" | "string-fromcodepoint" | "stringFromcodepoint" | "no-string-prototype-codepointat" | "string-prototype-codepointat" | "stringPrototypeCodepointat" | "no-string-prototype-endswith" | "string-prototype-endswith" | "stringPrototypeEndswith" | "no-string-prototype-includes" | "string-prototype-includes" | "stringPrototypeIncludes" | "no-string-prototype-iswellformed-towellformed" | "string-prototype-iswellformed-towellformed" | "stringPrototypeIswellformedTowellformed" | "no-string-prototype-matchall" | "string-prototype-matchall" | "stringPrototypeMatchall" | "no-string-prototype-normalize" | "string-prototype-normalize" | "stringPrototypeNormalize" | "no-string-prototype-padstart-padend" | "string-prototype-padstart-padend" | "stringPrototypePadstartPadend" | "no-string-prototype-repeat" | "string-prototype-repeat" | "stringPrototypeRepeat" | "no-string-prototype-replaceall" | "string-prototype-replaceall" | "stringPrototypeReplaceall" | "no-string-prototype-startswith" | "string-prototype-startswith" | "stringPrototypeStartswith" | "no-string-prototype-substr" | "string-prototype-substr" | "stringPrototypeSubstr" | "no-string-prototype-trim" | "string-prototype-trim" | "stringPrototypeTrim" | "no-string-prototype-trimleft-trimright" | "string-prototype-trimleft-trimright" | "stringPrototypeTrimleftTrimright" | "no-string-prototype-trimstart-trimend" | "string-prototype-trimstart-trimend" | "stringPrototypeTrimstartTrimend" | "no-string-raw" | "string-raw" | "stringRaw" | "no-subclassing-builtins" | "subclassing-builtins" | "subclassingBuiltins" | "no-symbol-prototype-description" | "symbol-prototype-description" | "symbolPrototypeDescription" | "no-symbol" | "symbol" | "no-template-literals" | "template-literals" | "templateLiterals" | "no-top-level-await" | "top-level-await" | "topLevelAwait" | "no-trailing-commas" | "trailing-commas" | "trailingCommas" | "no-trailing-function-commas" | "trailing-function-commas" | "trailingFunctionCommas" | "trailingCommasInFunctions" | "no-typed-arrays" | "typed-arrays" | "typedArrays" | "no-unicode-codepoint-escapes" | "unicode-codepoint-escapes" | "unicodeCodepointEscapes" | "unicodeCodePointEscapes" | "no-weak-map" | "weak-map" | "weakMap" | "no-weak-set" | "weak-set" | "weakSet" | "no-weakrefs" | "weakrefs")[];
}];
// ----- node/no-unsupported-features/node-builtins -----
type NodeNoUnsupportedFeaturesNodeBuiltins = [] | [{
  version?: string;
  allowExperimental?: boolean;
  ignores?: ("__filename" | "__dirname" | "require" | "require.cache" | "require.extensions" | "require.main" | "require.resolve" | "require.resolve.paths" | "module" | "module.children" | "module.exports" | "module.filename" | "module.id" | "module.isPreloading" | "module.loaded" | "module.parent" | "module.path" | "module.paths" | "module.require" | "exports" | "AbortController" | "AbortSignal" | "AbortSignal.abort" | "AbortSignal.timeout" | "AbortSignal.any" | "DOMException" | "FormData" | "Headers" | "MessageEvent" | "Navigator" | "Request" | "Response" | "WebAssembly" | "WebSocket" | "fetch" | "global" | "queueMicrotask" | "navigator" | "navigator.hardwareConcurrency" | "navigator.language" | "navigator.languages" | "navigator.platform" | "navigator.userAgent" | "structuredClone" | "localStorage" | "sessionStorage" | "Storage" | "Blob" | "new Buffer()" | "Buffer" | "Buffer.alloc" | "Buffer.allocUnsafe" | "Buffer.allocUnsafeSlow" | "Buffer.byteLength" | "Buffer.compare" | "Buffer.concat" | "Buffer.copyBytesFrom" | "Buffer.from" | "Buffer.isBuffer" | "Buffer.isEncoding" | "File" | "atob" | "btoa" | "console" | "console.profile" | "console.profileEnd" | "console.timeStamp" | "console.Console" | "console.assert" | "console.clear" | "console.count" | "console.countReset" | "console.debug" | "console.dir" | "console.dirxml" | "console.error" | "console.group" | "console.groupCollapsed" | "console.groupEnd" | "console.info" | "console.log" | "console.table" | "console.time" | "console.timeEnd" | "console.timeLog" | "console.trace" | "console.warn" | "crypto" | "crypto.subtle" | "crypto.subtle.decrypt" | "crypto.subtle.deriveBits" | "crypto.subtle.deriveKey" | "crypto.subtle.digest" | "crypto.subtle.encrypt" | "crypto.subtle.exportKey" | "crypto.subtle.generateKey" | "crypto.subtle.importKey" | "crypto.subtle.sign" | "crypto.subtle.unwrapKey" | "crypto.subtle.verify" | "crypto.subtle.wrapKey" | "crypto.getRandomValues" | "crypto.randomUUID" | "Crypto" | "CryptoKey" | "SubtleCrypto" | "CloseEvent" | "CustomEvent" | "Event" | "EventSource" | "EventTarget" | "PerformanceEntry" | "PerformanceMark" | "PerformanceMeasure" | "PerformanceObserver" | "PerformanceObserverEntryList" | "PerformanceResourceTiming" | "performance" | "performance.clearMarks" | "performance.clearMeasures" | "performance.clearResourceTimings" | "performance.eventLoopUtilization" | "performance.getEntries" | "performance.getEntriesByName" | "performance.getEntriesByType" | "performance.mark" | "performance.markResourceTiming" | "performance.measure" | "performance.nodeTiming" | "performance.nodeTiming.bootstrapComplete" | "performance.nodeTiming.environment" | "performance.nodeTiming.idleTime" | "performance.nodeTiming.loopExit" | "performance.nodeTiming.loopStart" | "performance.nodeTiming.nodeStart" | "performance.nodeTiming.uvMetricsInfo" | "performance.nodeTiming.v8Start" | "performance.now" | "performance.onresourcetimingbufferfull" | "performance.setResourceTimingBufferSize" | "performance.timeOrigin" | "performance.timerify" | "performance.toJSON" | "process" | "process.allowedNodeEnvironmentFlags" | "process.availableMemory" | "process.arch" | "process.argv" | "process.argv0" | "process.channel" | "process.config" | "process.connected" | "process.debugPort" | "process.env" | "process.execArgv" | "process.execPath" | "process.execve" | "process.exitCode" | "process.features.cached_builtins" | "process.features.debug" | "process.features.inspector" | "process.features.ipv6" | "process.features.require_module" | "process.features.tls" | "process.features.tls_alpn" | "process.features.tls_ocsp" | "process.features.tls_sni" | "process.features.typescript" | "process.features.uv" | "process.finalization.register" | "process.finalization.registerBeforeExit" | "process.finalization.unregister" | "process.getBuiltinModule" | "process.mainModule" | "process.noDeprecation" | "process.permission" | "process.pid" | "process.platform" | "process.ppid" | "process.ref" | "process.release" | "process.report" | "process.report.excludeEnv" | "process.sourceMapsEnabled" | "process.stdin" | "process.stdin.isRaw" | "process.stdin.isTTY" | "process.stdin.setRawMode" | "process.stdout" | "process.stdout.clearLine" | "process.stdout.clearScreenDown" | "process.stdout.columns" | "process.stdout.cursorTo" | "process.stdout.getColorDepth" | "process.stdout.getWindowSize" | "process.stdout.hasColors" | "process.stdout.isTTY" | "process.stdout.moveCursor" | "process.stdout.rows" | "process.stderr" | "process.stderr.clearLine" | "process.stderr.clearScreenDown" | "process.stderr.columns" | "process.stderr.cursorTo" | "process.stderr.getColorDepth" | "process.stderr.getWindowSize" | "process.stderr.hasColors" | "process.stderr.isTTY" | "process.stderr.moveCursor" | "process.stderr.rows" | "process.threadCpuUsage" | "process.throwDeprecation" | "process.title" | "process.traceDeprecation" | "process.version" | "process.versions" | "process.abort" | "process.chdir" | "process.constrainedMemory" | "process.cpuUsage" | "process.cwd" | "process.disconnect" | "process.dlopen" | "process.emitWarning" | "process.exit" | "process.getActiveResourcesInfo" | "process.getegid" | "process.geteuid" | "process.getgid" | "process.getgroups" | "process.getuid" | "process.hasUncaughtExceptionCaptureCallback" | "process.hrtime" | "process.hrtime.bigint" | "process.initgroups" | "process.kill" | "process.loadEnvFile" | "process.memoryUsage" | "process.rss" | "process.nextTick" | "process.resourceUsage" | "process.send" | "process.setegid" | "process.seteuid" | "process.setgid" | "process.setgroups" | "process.setuid" | "process.setSourceMapsEnabled" | "process.setUncaughtExceptionCaptureCallback" | "process.umask" | "process.unref" | "process.uptime" | "ReadableStream" | "ReadableStream.from" | "ReadableStreamDefaultReader" | "ReadableStreamBYOBReader" | "ReadableStreamDefaultController" | "ReadableByteStreamController" | "ReadableStreamBYOBRequest" | "WritableStream" | "WritableStreamDefaultWriter" | "WritableStreamDefaultController" | "TransformStream" | "TransformStreamDefaultController" | "ByteLengthQueuingStrategy" | "CountQueuingStrategy" | "TextEncoderStream" | "TextDecoderStream" | "CompressionStream" | "DecompressionStream" | "setInterval" | "clearInterval" | "setTimeout" | "clearTimeout" | "setImmediate" | "clearImmediate" | "URL" | "URL.canParse" | "URL.createObjectURL" | "URL.revokeObjectURL" | "URLSearchParams" | "TextDecoder" | "TextEncoder" | "BroadcastChannel" | "MessageChannel" | "MessagePort" | "assert" | "assert.Assert" | "assert.assert" | "assert.deepEqual" | "assert.deepStrictEqual" | "assert.doesNotMatch" | "assert.doesNotReject" | "assert.doesNotThrow" | "assert.equal" | "assert.fail" | "assert.ifError" | "assert.match" | "assert.notDeepEqual" | "assert.notDeepStrictEqual" | "assert.notEqual" | "assert.notStrictEqual" | "assert.ok" | "assert.partialDeepStrictEqual" | "assert.rejects" | "assert.strictEqual" | "assert.throws" | "assert.CallTracker" | "assert.strict" | "assert.strict.Assert" | "assert.strict.assert" | "assert.strict.deepEqual" | "assert.strict.deepStrictEqual" | "assert.strict.doesNotMatch" | "assert.strict.doesNotReject" | "assert.strict.doesNotThrow" | "assert.strict.equal" | "assert.strict.fail" | "assert.strict.ifError" | "assert.strict.match" | "assert.strict.notDeepEqual" | "assert.strict.notDeepStrictEqual" | "assert.strict.notEqual" | "assert.strict.notStrictEqual" | "assert.strict.ok" | "assert.strict.partialDeepStrictEqual" | "assert.strict.rejects" | "assert.strict.strictEqual" | "assert.strict.throws" | "assert.strict.CallTracker" | "assert/strict" | "assert/strict.Assert" | "assert/strict.assert" | "assert/strict.deepEqual" | "assert/strict.deepStrictEqual" | "assert/strict.doesNotMatch" | "assert/strict.doesNotReject" | "assert/strict.doesNotThrow" | "assert/strict.equal" | "assert/strict.fail" | "assert/strict.ifError" | "assert/strict.match" | "assert/strict.notDeepEqual" | "assert/strict.notDeepStrictEqual" | "assert/strict.notEqual" | "assert/strict.notStrictEqual" | "assert/strict.ok" | "assert/strict.partialDeepStrictEqual" | "assert/strict.rejects" | "assert/strict.strictEqual" | "assert/strict.throws" | "assert/strict.CallTracker" | "async_hooks" | "async_hooks.createHook" | "async_hooks.executionAsyncResource" | "async_hooks.executionAsyncId" | "async_hooks.triggerAsyncId" | "async_hooks.AsyncLocalStorage" | "async_hooks.AsyncLocalStorage.bind" | "async_hooks.AsyncLocalStorage.snapshot" | "async_hooks.AsyncResource" | "async_hooks.AsyncResource.bind" | "buffer" | "buffer.constants" | "buffer.INSPECT_MAX_BYTES" | "buffer.kMaxLength" | "buffer.kStringMaxLength" | "buffer.atob" | "buffer.btoa" | "buffer.isAscii" | "buffer.isUtf8" | "buffer.resolveObjectURL" | "buffer.transcode" | "buffer.SlowBuffer" | "buffer.Blob" | "new buffer.Buffer()" | "buffer.Buffer" | "buffer.Buffer.alloc" | "buffer.Buffer.allocUnsafe" | "buffer.Buffer.allocUnsafeSlow" | "buffer.Buffer.byteLength" | "buffer.Buffer.compare" | "buffer.Buffer.concat" | "buffer.Buffer.copyBytesFrom" | "buffer.Buffer.from" | "buffer.Buffer.isBuffer" | "buffer.Buffer.isEncoding" | "buffer.File" | "child_process" | "child_process.exec" | "child_process.execFile" | "child_process.fork" | "child_process.spawn" | "child_process.execFileSync" | "child_process.execSync" | "child_process.spawnSync" | "child_process.ChildProcess" | "cluster" | "cluster.isMaster" | "cluster.isPrimary" | "cluster.isWorker" | "cluster.schedulingPolicy" | "cluster.settings" | "cluster.worker" | "cluster.workers" | "cluster.disconnect" | "cluster.fork" | "cluster.setupMaster" | "cluster.setupPrimary" | "cluster.Worker" | "crypto.constants" | "crypto.fips" | "crypto.webcrypto" | "crypto.webcrypto.subtle" | "crypto.webcrypto.subtle.decrypt" | "crypto.webcrypto.subtle.deriveBits" | "crypto.webcrypto.subtle.deriveKey" | "crypto.webcrypto.subtle.digest" | "crypto.webcrypto.subtle.encrypt" | "crypto.webcrypto.subtle.exportKey" | "crypto.webcrypto.subtle.generateKey" | "crypto.webcrypto.subtle.importKey" | "crypto.webcrypto.subtle.sign" | "crypto.webcrypto.subtle.unwrapKey" | "crypto.webcrypto.subtle.verify" | "crypto.webcrypto.subtle.wrapKey" | "crypto.webcrypto.getRandomValues" | "crypto.webcrypto.randomUUID" | "crypto.checkPrime" | "crypto.checkPrimeSync" | "crypto.createCipher" | "crypto.createCipheriv" | "crypto.createDecipher" | "crypto.createDecipheriv" | "crypto.createDiffieHellman" | "crypto.createDiffieHellmanGroup" | "crypto.createECDH" | "crypto.createHash" | "crypto.createHmac" | "crypto.createPrivateKey" | "crypto.createPublicKey" | "crypto.createSecretKey" | "crypto.createSign" | "crypto.createVerify" | "crypto.diffieHellman" | "crypto.generateKey" | "crypto.generateKeyPair" | "crypto.generateKeyPairSync" | "crypto.generateKeySync" | "crypto.generatePrime" | "crypto.generatePrimeSync" | "crypto.getCipherInfo" | "crypto.getCiphers" | "crypto.getCurves" | "crypto.getDiffieHellman" | "crypto.getFips" | "crypto.getHashes" | "crypto.hash" | "crypto.hkdf" | "crypto.hkdfSync" | "crypto.pbkdf2" | "crypto.pbkdf2Sync" | "crypto.privateDecrypt" | "crypto.privateEncrypt" | "crypto.publicDecrypt" | "crypto.publicEncrypt" | "crypto.randomBytes" | "crypto.randomFillSync" | "crypto.randomFill" | "crypto.randomInt" | "crypto.scrypt" | "crypto.scryptSync" | "crypto.secureHeapUsed" | "crypto.setEngine" | "crypto.setFips" | "crypto.sign" | "crypto.timingSafeEqual" | "crypto.verify" | "crypto.Certificate" | "crypto.Certificate.exportChallenge" | "crypto.Certificate.exportPublicKey" | "crypto.Certificate.verifySpkac" | "crypto.Cipher" | "crypto.Decipher" | "crypto.DiffieHellman" | "crypto.DiffieHellmanGroup" | "crypto.ECDH" | "crypto.ECDH.convertKey" | "crypto.Hash()" | "new crypto.Hash()" | "crypto.Hash" | "crypto.Hmac()" | "new crypto.Hmac()" | "crypto.Hmac" | "crypto.KeyObject" | "crypto.KeyObject.from" | "crypto.Sign" | "crypto.Verify" | "crypto.X509Certificate" | "dgram" | "dgram.createSocket" | "dgram.Socket" | "diagnostics_channel" | "diagnostics_channel.hasSubscribers" | "diagnostics_channel.channel" | "diagnostics_channel.subscribe" | "diagnostics_channel.unsubscribe" | "diagnostics_channel.tracingChannel" | "diagnostics_channel.Channel" | "diagnostics_channel.TracingChannel" | "dns" | "dns.Resolver" | "dns.getServers" | "dns.lookup" | "dns.lookupService" | "dns.resolve" | "dns.resolve4" | "dns.resolve6" | "dns.resolveAny" | "dns.resolveCname" | "dns.resolveCaa" | "dns.resolveMx" | "dns.resolveNaptr" | "dns.resolveNs" | "dns.resolvePtr" | "dns.resolveSoa" | "dns.resolveSrv" | "dns.resolveTlsa" | "dns.resolveTxt" | "dns.reverse" | "dns.setDefaultResultOrder" | "dns.getDefaultResultOrder" | "dns.setServers" | "dns.promises" | "dns.promises.Resolver" | "dns.promises.cancel" | "dns.promises.getServers" | "dns.promises.lookup" | "dns.promises.lookupService" | "dns.promises.resolve" | "dns.promises.resolve4" | "dns.promises.resolve6" | "dns.promises.resolveAny" | "dns.promises.resolveCaa" | "dns.promises.resolveCname" | "dns.promises.resolveMx" | "dns.promises.resolveNaptr" | "dns.promises.resolveNs" | "dns.promises.resolvePtr" | "dns.promises.resolveSoa" | "dns.promises.resolveSrv" | "dns.promises.resolveTlsa" | "dns.promises.resolveTxt" | "dns.promises.reverse" | "dns.promises.setDefaultResultOrder" | "dns.promises.getDefaultResultOrder" | "dns.promises.setServers" | "dns/promises" | "dns/promises.Resolver" | "dns/promises.cancel" | "dns/promises.getServers" | "dns/promises.lookup" | "dns/promises.lookupService" | "dns/promises.resolve" | "dns/promises.resolve4" | "dns/promises.resolve6" | "dns/promises.resolveAny" | "dns/promises.resolveCaa" | "dns/promises.resolveCname" | "dns/promises.resolveMx" | "dns/promises.resolveNaptr" | "dns/promises.resolveNs" | "dns/promises.resolvePtr" | "dns/promises.resolveSoa" | "dns/promises.resolveSrv" | "dns/promises.resolveTlsa" | "dns/promises.resolveTxt" | "dns/promises.reverse" | "dns/promises.setDefaultResultOrder" | "dns/promises.getDefaultResultOrder" | "dns/promises.setServers" | "domain" | "domain.create" | "domain.Domain" | "events" | "events.Event" | "events.EventTarget" | "events.CustomEvent" | "events.NodeEventTarget" | "events.EventEmitter" | "events.EventEmitter.defaultMaxListeners" | "events.EventEmitter.errorMonitor" | "events.EventEmitter.captureRejections" | "events.EventEmitter.captureRejectionSymbol" | "events.EventEmitter.getEventListeners" | "events.EventEmitter.getMaxListeners" | "events.EventEmitter.once" | "events.EventEmitter.listenerCount" | "events.EventEmitter.on" | "events.EventEmitter.setMaxListeners" | "events.EventEmitter.addAbortListener" | "events.EventEmitterAsyncResource" | "events.EventEmitterAsyncResource.defaultMaxListeners" | "events.EventEmitterAsyncResource.errorMonitor" | "events.EventEmitterAsyncResource.captureRejections" | "events.EventEmitterAsyncResource.captureRejectionSymbol" | "events.EventEmitterAsyncResource.getEventListeners" | "events.EventEmitterAsyncResource.getMaxListeners" | "events.EventEmitterAsyncResource.once" | "events.EventEmitterAsyncResource.listenerCount" | "events.EventEmitterAsyncResource.on" | "events.EventEmitterAsyncResource.setMaxListeners" | "events.EventEmitterAsyncResource.addAbortListener" | "events.defaultMaxListeners" | "events.errorMonitor" | "events.captureRejections" | "events.captureRejectionSymbol" | "events.getEventListeners" | "events.getMaxListeners" | "events.once" | "events.listenerCount" | "events.on" | "events.setMaxListeners" | "events.addAbortListener" | "fs" | "fs.promises" | "fs.promises.FileHandle" | "fs.promises.access" | "fs.promises.appendFile" | "fs.promises.chmod" | "fs.promises.chown" | "fs.promises.constants" | "fs.promises.copyFile" | "fs.promises.cp" | "fs.promises.glob" | "fs.promises.lchmod" | "fs.promises.lchown" | "fs.promises.link" | "fs.promises.lstat" | "fs.promises.lutimes" | "fs.promises.mkdir" | "fs.promises.mkdtemp" | "fs.promises.open" | "fs.promises.opendir" | "fs.promises.readFile" | "fs.promises.readdir" | "fs.promises.readlink" | "fs.promises.realpath" | "fs.promises.rename" | "fs.promises.rm" | "fs.promises.rmdir" | "fs.promises.stat" | "fs.promises.statfs" | "fs.promises.symlink" | "fs.promises.truncate" | "fs.promises.unlink" | "fs.promises.utimes" | "fs.promises.watch" | "fs.promises.writeFile" | "fs.access" | "fs.appendFile" | "fs.chmod" | "fs.chown" | "fs.close" | "fs.copyFile" | "fs.cp" | "fs.createReadStream" | "fs.createWriteStream" | "fs.exists" | "fs.fchmod" | "fs.fchown" | "fs.fdatasync" | "fs.fstat" | "fs.fsync" | "fs.ftruncate" | "fs.futimes" | "fs.glob" | "fs.lchmod" | "fs.lchown" | "fs.link" | "fs.lstat" | "fs.lutimes" | "fs.mkdir" | "fs.mkdtemp" | "fs.native" | "fs.open" | "fs.openAsBlob" | "fs.opendir" | "fs.read" | "fs.readdir" | "fs.readFile" | "fs.readlink" | "fs.readv" | "fs.realpath" | "fs.realpath.native" | "fs.rename" | "fs.rm" | "fs.rmdir" | "fs.stat" | "fs.statfs" | "fs.symlink" | "fs.truncate" | "fs.unlink" | "fs.unwatchFile" | "fs.utimes" | "fs.watch" | "fs.watchFile" | "fs.write" | "fs.writeFile" | "fs.writev" | "fs.accessSync" | "fs.appendFileSync" | "fs.chmodSync" | "fs.chownSync" | "fs.closeSync" | "fs.copyFileSync" | "fs.cpSync" | "fs.existsSync" | "fs.fchmodSync" | "fs.fchownSync" | "fs.fdatasyncSync" | "fs.fstatSync" | "fs.fsyncSync" | "fs.ftruncateSync" | "fs.futimesSync" | "fs.globSync" | "fs.lchmodSync" | "fs.lchownSync" | "fs.linkSync" | "fs.lstatSync" | "fs.lutimesSync" | "fs.mkdirSync" | "fs.mkdtempSync" | "fs.opendirSync" | "fs.openSync" | "fs.readdirSync" | "fs.readFileSync" | "fs.readlinkSync" | "fs.readSync" | "fs.readvSync" | "fs.realpathSync" | "fs.realpathSync.native" | "fs.renameSync" | "fs.rmdirSync" | "fs.rmSync" | "fs.statfsSync" | "fs.statSync" | "fs.symlinkSync" | "fs.truncateSync" | "fs.unlinkSync" | "fs.utimesSync" | "fs.writeFileSync" | "fs.writeSync" | "fs.writevSync" | "fs.constants" | "fs.Dir" | "fs.Dirent" | "fs.FSWatcher" | "fs.StatWatcher" | "fs.ReadStream" | "fs.Stats()" | "new fs.Stats()" | "fs.Stats" | "fs.StatFs" | "fs.WriteStream" | "fs.common_objects" | "fs/promises" | "fs/promises.FileHandle" | "fs/promises.access" | "fs/promises.appendFile" | "fs/promises.chmod" | "fs/promises.chown" | "fs/promises.constants" | "fs/promises.copyFile" | "fs/promises.cp" | "fs/promises.glob" | "fs/promises.lchmod" | "fs/promises.lchown" | "fs/promises.link" | "fs/promises.lstat" | "fs/promises.lutimes" | "fs/promises.mkdir" | "fs/promises.mkdtemp" | "fs/promises.open" | "fs/promises.opendir" | "fs/promises.readFile" | "fs/promises.readdir" | "fs/promises.readlink" | "fs/promises.realpath" | "fs/promises.rename" | "fs/promises.rm" | "fs/promises.rmdir" | "fs/promises.stat" | "fs/promises.statfs" | "fs/promises.symlink" | "fs/promises.truncate" | "fs/promises.unlink" | "fs/promises.utimes" | "fs/promises.watch" | "fs/promises.writeFile" | "http2" | "http2.constants" | "http2.sensitiveHeaders" | "http2.createServer" | "http2.createSecureServer" | "http2.connect" | "http2.getDefaultSettings" | "http2.getPackedSettings" | "http2.getUnpackedSettings" | "http2.performServerHandshake" | "http2.Http2Session" | "http2.ServerHttp2Session" | "http2.ClientHttp2Session" | "http2.Http2Stream" | "http2.ClientHttp2Stream" | "http2.ServerHttp2Stream" | "http2.Http2Server" | "http2.Http2SecureServer" | "http2.Http2ServerRequest" | "http2.Http2ServerResponse" | "http" | "http.METHODS" | "http.STATUS_CODES" | "http.globalAgent" | "http.maxHeaderSize" | "http.createServer" | "http.get" | "http.request" | "http.validateHeaderName" | "http.validateHeaderValue" | "http.setMaxIdleHTTPParsers" | "http.Agent" | "http.ClientRequest" | "http.Server" | "http.ServerResponse" | "http.IncomingMessage" | "http.OutgoingMessage" | "http.WebSocket" | "_http_agent" | "_http_client" | "_http_common" | "_http_incoming" | "_http_outgoing" | "_http_server" | "https" | "https.globalAgent" | "https.createServer" | "https.get" | "https.request" | "https.Agent" | "https.Server" | "inspector" | "inspector.Session" | "inspector.Network.dataReceived" | "inspector.Network.dataSent" | "inspector.Network.loadingFailed" | "inspector.Network.loadingFinished" | "inspector.Network.requestWillBeSent" | "inspector.Network.responseReceived" | "inspector.NetworkResources.put" | "inspector.console" | "inspector.close" | "inspector.open" | "inspector.url" | "inspector.waitForDebugger" | "inspector/promises" | "inspector/promises.Session" | "inspector/promises.Network.dataReceived" | "inspector/promises.Network.dataSent" | "inspector/promises.Network.loadingFailed" | "inspector/promises.Network.loadingFinished" | "inspector/promises.Network.requestWillBeSent" | "inspector/promises.Network.responseReceived" | "inspector/promises.NetworkResources.put" | "inspector/promises.console" | "inspector/promises.close" | "inspector/promises.open" | "inspector/promises.url" | "inspector/promises.waitForDebugger" | "module.builtinModules" | "module.constants.compileCacheStatus" | "module.createRequire" | "module.createRequireFromPath" | "module.enableCompileCache" | "module.findPackageJSON" | "module.flushCompileCache" | "module.getCompileCacheDir" | "module.getSourceMapsSupport" | "module.isBuiltin" | "module.registerHooks" | "module.register" | "module.setSourceMapsSupport" | "module.stripTypeScriptTypes" | "module.syncBuiltinESMExports" | "module.findSourceMap" | "module.SourceMap" | "module.Module.builtinModules" | "module.Module.createRequire" | "module.Module.createRequireFromPath" | "module.Module.enableCompileCache" | "module.Module.findPackageJSON" | "module.Module.flushCompileCache" | "module.Module.getCompileCacheDir" | "module.Module.getSourceMapsSupport" | "module.Module.isBuiltin" | "module.Module.registerHooks" | "module.Module.register" | "module.Module.setSourceMapsSupport" | "module.Module.stripTypeScriptTypes" | "module.Module.syncBuiltinESMExports" | "module.Module.findSourceMap" | "module.Module.SourceMap" | "net" | "net.connect" | "net.createConnection" | "net.createServer" | "net.getDefaultAutoSelectFamily" | "net.setDefaultAutoSelectFamily" | "net.getDefaultAutoSelectFamilyAttemptTimeout" | "net.setDefaultAutoSelectFamilyAttemptTimeout" | "net.isIP" | "net.isIPv4" | "net.isIPv6" | "net.BlockList" | "net.BlockList.isBlockList" | "net.SocketAddress" | "net.SocketAddress.parse" | "net.Server" | "net.Socket" | "os" | "os.EOL" | "os.constants" | "os.constants.priority" | "os.devNull" | "os.availableParallelism" | "os.arch" | "os.cpus" | "os.endianness" | "os.freemem" | "os.getPriority" | "os.homedir" | "os.hostname" | "os.loadavg" | "os.machine" | "os.networkInterfaces" | "os.platform" | "os.release" | "os.setPriority" | "os.tmpdir" | "os.totalmem" | "os.type" | "os.uptime" | "os.userInfo" | "os.version" | "path" | "path.posix" | "path.posix.delimiter" | "path.posix.sep" | "path.posix.basename" | "path.posix.dirname" | "path.posix.extname" | "path.posix.format" | "path.posix.matchesGlob" | "path.posix.isAbsolute" | "path.posix.join" | "path.posix.normalize" | "path.posix.parse" | "path.posix.relative" | "path.posix.resolve" | "path.posix.toNamespacedPath" | "path.win32" | "path.win32.delimiter" | "path.win32.sep" | "path.win32.basename" | "path.win32.dirname" | "path.win32.extname" | "path.win32.format" | "path.win32.matchesGlob" | "path.win32.isAbsolute" | "path.win32.join" | "path.win32.normalize" | "path.win32.parse" | "path.win32.relative" | "path.win32.resolve" | "path.win32.toNamespacedPath" | "path.delimiter" | "path.sep" | "path.basename" | "path.dirname" | "path.extname" | "path.format" | "path.matchesGlob" | "path.isAbsolute" | "path.join" | "path.normalize" | "path.parse" | "path.relative" | "path.resolve" | "path.toNamespacedPath" | "path/posix" | "path/posix.delimiter" | "path/posix.sep" | "path/posix.basename" | "path/posix.dirname" | "path/posix.extname" | "path/posix.format" | "path/posix.matchesGlob" | "path/posix.isAbsolute" | "path/posix.join" | "path/posix.normalize" | "path/posix.parse" | "path/posix.relative" | "path/posix.resolve" | "path/posix.toNamespacedPath" | "path/win32" | "path/win32.delimiter" | "path/win32.sep" | "path/win32.basename" | "path/win32.dirname" | "path/win32.extname" | "path/win32.format" | "path/win32.matchesGlob" | "path/win32.isAbsolute" | "path/win32.join" | "path/win32.normalize" | "path/win32.parse" | "path/win32.relative" | "path/win32.resolve" | "path/win32.toNamespacedPath" | "perf_hooks" | "perf_hooks.performance" | "perf_hooks.performance.clearMarks" | "perf_hooks.performance.clearMeasures" | "perf_hooks.performance.clearResourceTimings" | "perf_hooks.performance.eventLoopUtilization" | "perf_hooks.performance.getEntries" | "perf_hooks.performance.getEntriesByName" | "perf_hooks.performance.getEntriesByType" | "perf_hooks.performance.mark" | "perf_hooks.performance.markResourceTiming" | "perf_hooks.performance.measure" | "perf_hooks.performance.nodeTiming" | "perf_hooks.performance.nodeTiming.bootstrapComplete" | "perf_hooks.performance.nodeTiming.environment" | "perf_hooks.performance.nodeTiming.idleTime" | "perf_hooks.performance.nodeTiming.loopExit" | "perf_hooks.performance.nodeTiming.loopStart" | "perf_hooks.performance.nodeTiming.nodeStart" | "perf_hooks.performance.nodeTiming.uvMetricsInfo" | "perf_hooks.performance.nodeTiming.v8Start" | "perf_hooks.performance.now" | "perf_hooks.performance.onresourcetimingbufferfull" | "perf_hooks.performance.setResourceTimingBufferSize" | "perf_hooks.performance.timeOrigin" | "perf_hooks.performance.timerify" | "perf_hooks.performance.toJSON" | "perf_hooks.createHistogram" | "perf_hooks.monitorEventLoopDelay" | "perf_hooks.PerformanceEntry" | "perf_hooks.PerformanceMark" | "perf_hooks.PerformanceMeasure" | "perf_hooks.PerformanceNodeEntry" | "perf_hooks.PerformanceNodeTiming" | "perf_hooks.PerformanceResourceTiming" | "perf_hooks.PerformanceObserver" | "perf_hooks.PerformanceObserverEntryList" | "perf_hooks.Histogram" | "perf_hooks.IntervalHistogram" | "perf_hooks.RecordableHistogram" | "punycode" | "punycode.ucs2" | "punycode.version" | "punycode.decode" | "punycode.encode" | "punycode.toASCII" | "punycode.toUnicode" | "querystring" | "querystring.decode" | "querystring.encode" | "querystring.escape" | "querystring.parse" | "querystring.stringify" | "querystring.unescape" | "readline" | "readline.promises" | "readline.promises.createInterface" | "readline.promises.Interface" | "readline.promises.Readline" | "readline.clearLine" | "readline.clearScreenDown" | "readline.createInterface" | "readline.cursorTo" | "readline.moveCursor" | "readline.Interface" | "readline.emitKeypressEvents" | "readline.InterfaceConstructor" | "readline/promises" | "readline/promises.createInterface" | "readline/promises.Interface" | "readline/promises.Readline" | "repl" | "repl.start" | "repl.writer" | "repl.REPLServer()" | "repl.REPLServer" | "repl.REPL_MODE_MAGIC" | "repl.REPL_MODE_SLOPPY" | "repl.REPL_MODE_STRICT" | "repl.Recoverable()" | "repl.Recoverable" | "repl.builtinModules" | "sea" | "sea.isSea" | "sea.getAsset" | "sea.getAssetAsBlob" | "sea.getRawAsset" | "sea.sea.isSea" | "sea.sea.getAsset" | "sea.sea.getAssetAsBlob" | "sea.sea.getRawAsset" | "stream" | "stream.promises" | "stream.promises.pipeline" | "stream.promises.finished" | "stream.finished" | "stream.pipeline" | "stream.compose" | "stream.duplexPair" | "stream.Readable" | "stream.Readable.from" | "stream.Readable.isDisturbed" | "stream.Readable.fromWeb" | "stream.Readable.toWeb" | "stream.Writable" | "stream.Writable.fromWeb" | "stream.Writable.toWeb" | "stream.Duplex" | "stream.Duplex.from" | "stream.Duplex.fromWeb" | "stream.Duplex.toWeb" | "stream.Transform" | "stream.isErrored" | "stream.isReadable" | "stream.addAbortSignal" | "stream.getDefaultHighWaterMark" | "stream.setDefaultHighWaterMark" | "stream/promises.pipeline" | "stream/promises.finished" | "stream/web" | "stream/web.ReadableStream" | "stream/web.ReadableStream.from" | "stream/web.ReadableStreamDefaultReader" | "stream/web.ReadableStreamBYOBReader" | "stream/web.ReadableStreamDefaultController" | "stream/web.ReadableByteStreamController" | "stream/web.ReadableStreamBYOBRequest" | "stream/web.WritableStream" | "stream/web.WritableStreamDefaultWriter" | "stream/web.WritableStreamDefaultController" | "stream/web.TransformStream" | "stream/web.TransformStreamDefaultController" | "stream/web.ByteLengthQueuingStrategy" | "stream/web.CountQueuingStrategy" | "stream/web.TextEncoderStream" | "stream/web.TextDecoderStream" | "stream/web.CompressionStream" | "stream/web.DecompressionStream" | "stream/consumers" | "stream/consumers.arrayBuffer" | "stream/consumers.blob" | "stream/consumers.buffer" | "stream/consumers.json" | "stream/consumers.text" | "string_decoder" | "string_decoder.StringDecoder" | "sqlite" | "sqlite.constants" | "sqlite.constants.SQLITE_CHANGESET_OMIT" | "sqlite.constants.SQLITE_CHANGESET_REPLACE" | "sqlite.constants.SQLITE_CHANGESET_ABORT" | "sqlite.backup" | "sqlite.DatabaseSync" | "sqlite.StatementSync" | "sqlite.SQLITE_CHANGESET_OMIT" | "sqlite.SQLITE_CHANGESET_REPLACE" | "sqlite.SQLITE_CHANGESET_ABORT" | "test" | "test.after" | "test.afterEach" | "test.assert" | "test.assert.register" | "test.before" | "test.beforeEach" | "test.describe" | "test.describe.only" | "test.describe.skip" | "test.describe.todo" | "test.it" | "test.it.only" | "test.it.skip" | "test.it.todo" | "test.mock" | "test.mock.fn" | "test.mock.getter" | "test.mock.method" | "test.mock.module" | "test.mock.reset" | "test.mock.restoreAll" | "test.mock.setter" | "test.mock.timers" | "test.mock.timers.enable" | "test.mock.timers.reset" | "test.mock.timers.tick" | "test.only" | "test.run" | "test.snapshot" | "test.snapshot.setDefaultSnapshotSerializers" | "test.snapshot.setResolveSnapshotPath" | "test.skip" | "test.suite" | "test.test" | "test.test.only" | "test.test.skip" | "test.test.todo" | "test.todo" | "timers" | "timers.Immediate" | "timers.Timeout" | "timers.setImmediate" | "timers.clearImmediate" | "timers.setInterval" | "timers.clearInterval" | "timers.setTimeout" | "timers.clearTimeout" | "timers.promises" | "timers.promises.setTimeout" | "timers.promises.setImmediate" | "timers.promises.setInterval" | "timers.promises.scheduler.wait" | "timers.promises.scheduler.yield" | "timers/promises" | "timers/promises.setTimeout" | "timers/promises.setImmediate" | "timers/promises.setInterval" | "timers/promises.scheduler.wait" | "timers/promises.scheduler.yield" | "tls" | "tls.checkServerIdentity" | "tls.connect" | "tls.createSecureContext" | "tls.createSecurePair" | "tls.createServer" | "tls.CryptoStream" | "tls.DEFAULT_CIPHERS" | "tls.DEFAULT_ECDH_CURVE" | "tls.DEFAULT_MAX_VERSION" | "tls.DEFAULT_MIN_VERSION" | "tls.getCACertificates" | "tls.getCiphers" | "tls.rootCertificates" | "tls.SecureContext" | "tls.SecurePair" | "tls.Server" | "tls.setDefaultCACertificates" | "tls.TLSSocket" | "trace_events" | "trace_events.createTracing" | "trace_events.getEnabledCategories" | "tty" | "tty.isatty" | "tty.ReadStream" | "tty.WriteStream" | "url" | "url.domainToASCII" | "url.domainToUnicode" | "url.fileURLToPath" | "url.format" | "url.pathToFileURL" | "url.urlToHttpOptions" | "url.URL" | "url.URL.canParse" | "url.URL.createObjectURL" | "url.URL.revokeObjectURL" | "url.URLPattern" | "url.URLSearchParams" | "url.Url" | "util.promisify" | "util.promisify.custom" | "util.callbackify" | "util.debuglog" | "util.debug" | "util.deprecate" | "util.diff" | "util.format" | "util.formatWithOptions" | "util.getCallSite" | "util.getCallSites" | "util.getSystemErrorName" | "util.getSystemErrorMap" | "util.getSystemErrorMessage" | "util.inherits" | "util.inspect" | "util.inspect.custom" | "util.inspect.defaultOptions" | "util.inspect.replDefaults" | "util.isDeepStrictEqual" | "util.parseArgs" | "util.parseEnv" | "util.setTraceSigInt" | "util.stripVTControlCharacters" | "util.styleText" | "util.toUSVString" | "util.transferableAbortController" | "util.transferableAbortSignal" | "util.aborted" | "util.MIMEType" | "util.MIMEParams" | "util.TextDecoder" | "util.TextEncoder" | "util.types" | "util.types.isExternal" | "util.types.isDate" | "util.types.isArgumentsObject" | "util.types.isBigIntObject" | "util.types.isBooleanObject" | "util.types.isNumberObject" | "util.types.isStringObject" | "util.types.isSymbolObject" | "util.types.isNativeError" | "util.types.isRegExp" | "util.types.isAsyncFunction" | "util.types.isGeneratorFunction" | "util.types.isGeneratorObject" | "util.types.isPromise" | "util.types.isMap" | "util.types.isSet" | "util.types.isMapIterator" | "util.types.isSetIterator" | "util.types.isWeakMap" | "util.types.isWeakSet" | "util.types.isArrayBuffer" | "util.types.isDataView" | "util.types.isSharedArrayBuffer" | "util.types.isProxy" | "util.types.isModuleNamespaceObject" | "util.types.isAnyArrayBuffer" | "util.types.isBoxedPrimitive" | "util.types.isArrayBufferView" | "util.types.isTypedArray" | "util.types.isUint8Array" | "util.types.isUint8ClampedArray" | "util.types.isUint16Array" | "util.types.isUint32Array" | "util.types.isInt8Array" | "util.types.isInt16Array" | "util.types.isInt32Array" | "util.types.isFloat16Array" | "util.types.isFloat32Array" | "util.types.isFloat64Array" | "util.types.isBigInt64Array" | "util.types.isBigUint64Array" | "util.types.isKeyObject" | "util.types.isCryptoKey" | "util.types.isWebAssemblyCompiledModule" | "util._extend" | "util.isArray" | "util.isBoolean" | "util.isBuffer" | "util.isDate" | "util.isError" | "util.isFunction" | "util.isNull" | "util.isNullOrUndefined" | "util.isNumber" | "util.isObject" | "util.isPrimitive" | "util.isRegExp" | "util.isString" | "util.isSymbol" | "util.isUndefined" | "util.log" | "util" | "util/types" | "util/types.isExternal" | "util/types.isDate" | "util/types.isArgumentsObject" | "util/types.isBigIntObject" | "util/types.isBooleanObject" | "util/types.isNumberObject" | "util/types.isStringObject" | "util/types.isSymbolObject" | "util/types.isNativeError" | "util/types.isRegExp" | "util/types.isAsyncFunction" | "util/types.isGeneratorFunction" | "util/types.isGeneratorObject" | "util/types.isPromise" | "util/types.isMap" | "util/types.isSet" | "util/types.isMapIterator" | "util/types.isSetIterator" | "util/types.isWeakMap" | "util/types.isWeakSet" | "util/types.isArrayBuffer" | "util/types.isDataView" | "util/types.isSharedArrayBuffer" | "util/types.isProxy" | "util/types.isModuleNamespaceObject" | "util/types.isAnyArrayBuffer" | "util/types.isBoxedPrimitive" | "util/types.isArrayBufferView" | "util/types.isTypedArray" | "util/types.isUint8Array" | "util/types.isUint8ClampedArray" | "util/types.isUint16Array" | "util/types.isUint32Array" | "util/types.isInt8Array" | "util/types.isInt16Array" | "util/types.isInt32Array" | "util/types.isFloat16Array" | "util/types.isFloat32Array" | "util/types.isFloat64Array" | "util/types.isBigInt64Array" | "util/types.isBigUint64Array" | "util/types.isKeyObject" | "util/types.isCryptoKey" | "util/types.isWebAssemblyCompiledModule" | "v8" | "v8.serialize" | "v8.deserialize" | "v8.Serializer" | "v8.Deserializer" | "v8.DefaultSerializer" | "v8.DefaultDeserializer" | "v8.promiseHooks" | "v8.promiseHooks.onInit" | "v8.promiseHooks.onSettled" | "v8.promiseHooks.onBefore" | "v8.promiseHooks.onAfter" | "v8.promiseHooks.createHook" | "v8.startupSnapshot" | "v8.startupSnapshot.addSerializeCallback" | "v8.startupSnapshot.addDeserializeCallback" | "v8.startupSnapshot.setDeserializeMainFunction" | "v8.startupSnapshot.isBuildingSnapshot" | "v8.cachedDataVersionTag" | "v8.getHeapCodeStatistics" | "v8.getHeapSnapshot" | "v8.getHeapSpaceStatistics" | "v8.getHeapStatistics" | "v8.isStringOneByteRepresentation" | "v8.queryObjects" | "v8.setFlagsFromString" | "v8.stopCoverage" | "v8.takeCoverage" | "v8.writeHeapSnapshot" | "v8.setHeapSnapshotNearHeapLimit" | "v8.GCProfiler" | "vm.constants" | "vm.compileFunction" | "vm.createContext" | "vm.isContext" | "vm.measureMemory" | "vm.runInContext" | "vm.runInNewContext" | "vm.runInThisContext" | "vm.Script" | "vm.Module" | "vm.SourceTextModule" | "vm.SyntheticModule" | "vm" | "wasi.WASI" | "wasi" | "worker_threads" | "worker_threads.parentPort" | "worker_threads.resourceLimits" | "worker_threads.SHARE_ENV" | "worker_threads.threadId" | "worker_threads.workerData" | "worker_threads.getEnvironmentData" | "worker_threads.getHeapStatistics" | "worker_threads.markAsUncloneable" | "worker_threads.markAsUntransferable" | "worker_threads.isInternalThread" | "worker_threads.isMainThread" | "worker_threads.isMarkedAsUntransferable" | "worker_threads.moveMessagePortToContext" | "worker_threads.postMessageToThread" | "worker_threads.receiveMessageOnPort" | "worker_threads.setEnvironmentData" | "worker_threads.BroadcastChannel" | "worker_threads.MessageChannel" | "worker_threads.MessagePort" | "worker_threads.Worker" | "zlib.brotliCompress" | "zlib.brotliCompressSync" | "zlib.brotliDecompress" | "zlib.brotliDecompressSync" | "zlib.constants" | "zlib.constants.ZSTD_e_continue" | "zlib.constants.ZSTD_e_flush" | "zlib.constants.ZSTD_e_end" | "zlib.constants.ZSTD_fast" | "zlib.constants.ZSTD_dfast" | "zlib.constants.ZSTD_greedy" | "zlib.constants.ZSTD_lazy" | "zlib.constants.ZSTD_lazy2" | "zlib.constants.ZSTD_btlazy2" | "zlib.constants.ZSTD_btopt" | "zlib.constants.ZSTD_btultra" | "zlib.constants.ZSTD_btultra2" | "zlib.constants.ZSTD_c_compressionLevel" | "zlib.constants.ZSTD_c_windowLog" | "zlib.constants.ZSTD_c_hashLog" | "zlib.constants.ZSTD_c_chainLog" | "zlib.constants.ZSTD_c_searchLog" | "zlib.constants.ZSTD_c_minMatch" | "zlib.constants.ZSTD_c_targetLength" | "zlib.constants.ZSTD_c_strategy" | "zlib.constants.ZSTD_c_enableLongDistanceMatching" | "zlib.constants.ZSTD_c_ldmHashLog" | "zlib.constants.ZSTD_c_ldmMinMatch" | "zlib.constants.ZSTD_c_ldmBucketSizeLog" | "zlib.constants.ZSTD_c_ldmHashRateLog" | "zlib.constants.ZSTD_c_contentSizeFlag" | "zlib.constants.ZSTD_c_checksumFlag" | "zlib.constants.ZSTD_c_dictIDFlag" | "zlib.constants.ZSTD_c_nbWorkers" | "zlib.constants.ZSTD_c_jobSize" | "zlib.constants.ZSTD_c_overlapLog" | "zlib.constants.ZSTD_d_windowLogMax" | "zlib.constants.ZSTD_CLEVEL_DEFAULT" | "zlib.constants.ZSTD_error_no_error" | "zlib.constants.ZSTD_error_GENERIC" | "zlib.constants.ZSTD_error_prefix_unknown" | "zlib.constants.ZSTD_error_version_unsupported" | "zlib.constants.ZSTD_error_frameParameter_unsupported" | "zlib.constants.ZSTD_error_frameParameter_windowTooLarge" | "zlib.constants.ZSTD_error_corruption_detected" | "zlib.constants.ZSTD_error_checksum_wrong" | "zlib.constants.ZSTD_error_literals_headerWrong" | "zlib.constants.ZSTD_error_dictionary_corrupted" | "zlib.constants.ZSTD_error_dictionary_wrong" | "zlib.constants.ZSTD_error_dictionaryCreation_failed" | "zlib.constants.ZSTD_error_parameter_unsupported" | "zlib.constants.ZSTD_error_parameter_combination_unsupported" | "zlib.constants.ZSTD_error_parameter_outOfBound" | "zlib.constants.ZSTD_error_tableLog_tooLarge" | "zlib.constants.ZSTD_error_maxSymbolValue_tooLarge" | "zlib.constants.ZSTD_error_maxSymbolValue_tooSmall" | "zlib.constants.ZSTD_error_stabilityCondition_notRespected" | "zlib.constants.ZSTD_error_stage_wrong" | "zlib.constants.ZSTD_error_init_missing" | "zlib.constants.ZSTD_error_memory_allocation" | "zlib.constants.ZSTD_error_workSpace_tooSmall" | "zlib.constants.ZSTD_error_dstSize_tooSmall" | "zlib.constants.ZSTD_error_srcSize_wrong" | "zlib.constants.ZSTD_error_dstBuffer_null" | "zlib.constants.ZSTD_error_noForwardProgress_destFull" | "zlib.constants.ZSTD_error_noForwardProgress_inputEmpty" | "zlib.crc32" | "zlib.createBrotliCompress" | "zlib.createBrotliDecompress" | "zlib.createDeflate" | "zlib.createDeflateRaw" | "zlib.createGunzip" | "zlib.createGzip" | "zlib.createInflate" | "zlib.createInflateRaw" | "zlib.createUnzip" | "zlib.createZstdCompress" | "zlib.createZstdDecompress" | "zlib.deflate" | "zlib.deflateRaw" | "zlib.deflateRawSync" | "zlib.deflateSync" | "zlib.gunzip" | "zlib.gunzipSync" | "zlib.gzip" | "zlib.gzipSync" | "zlib.inflate" | "zlib.inflateRaw" | "zlib.inflateRawSync" | "zlib.inflateSync" | "zlib.unzip" | "zlib.unzipSync" | "zlib.zstdCompress" | "zlib.zstdCompressSync" | "zlib.zstdDecompress" | "zlib.zstdDecompressSync" | "zlib.BrotliCompress()" | "zlib.BrotliCompress" | "zlib.BrotliDecompress()" | "zlib.BrotliDecompress" | "zlib.Deflate()" | "zlib.Deflate" | "zlib.DeflateRaw()" | "zlib.DeflateRaw" | "zlib.Gunzip()" | "zlib.Gunzip" | "zlib.Gzip()" | "zlib.Gzip" | "zlib.Inflate()" | "zlib.Inflate" | "zlib.InflateRaw()" | "zlib.InflateRaw" | "zlib.Unzip()" | "zlib.Unzip" | "zlib.ZstdCompress" | "zlib.ZstdDecompress" | "zlib.ZstdOptions" | "zlib" | "import.meta.resolve" | "import.meta.dirname" | "import.meta.filename" | "import.meta.main")[];
}];
// ----- node/prefer-global/buffer -----
type NodePreferGlobalBuffer = [] | [("always" | "never")];
// ----- node/prefer-global/console -----
type NodePreferGlobalConsole = [] | [("always" | "never")];
// ----- node/prefer-global/process -----
type NodePreferGlobalProcess = [] | [("always" | "never")];
// ----- node/prefer-global/text-decoder -----
type NodePreferGlobalTextDecoder = [] | [("always" | "never")];
// ----- node/prefer-global/text-encoder -----
type NodePreferGlobalTextEncoder = [] | [("always" | "never")];
// ----- node/prefer-global/url -----
type NodePreferGlobalUrl = [] | [("always" | "never")];
// ----- node/prefer-global/url-search-params -----
type NodePreferGlobalUrlSearchParams = [] | [("always" | "never")];
// ----- node/prefer-node-protocol -----
type NodePreferNodeProtocol = [] | [{
  version?: string;
}];
// ----- node/shebang -----
type NodeShebang = [] | [{
  convertPath?: ({
    [k: string]: [string, string];
  } | [{
    include: [string, ...(string)[]];
    exclude?: string[];
    replace: [string, string];
  }, ...({
    include: [string, ...(string)[]];
    exclude?: string[];
    replace: [string, string];
  })[]]);
  ignoreUnpublished?: boolean;
  additionalExecutables?: string[];
  executableMap?: {
    [k: string]: string;
  };
}];
// ----- nonblock-statement-body-position -----
type NonblockStatementBodyPosition = [] | [("beside" | "below" | "any")] | [("beside" | "below" | "any"), {
  overrides?: {
    if?: ("beside" | "below" | "any");
    else?: ("beside" | "below" | "any");
    while?: ("beside" | "below" | "any");
    do?: ("beside" | "below" | "any");
    for?: ("beside" | "below" | "any");
  };
}];
// ----- object-curly-newline -----
type ObjectCurlyNewline = [] | [((("always" | "never") | {
  multiline?: boolean;
  minProperties?: number;
  consistent?: boolean;
}) | {
  ObjectExpression?: (("always" | "never") | {
    multiline?: boolean;
    minProperties?: number;
    consistent?: boolean;
  });
  ObjectPattern?: (("always" | "never") | {
    multiline?: boolean;
    minProperties?: number;
    consistent?: boolean;
  });
  ImportDeclaration?: (("always" | "never") | {
    multiline?: boolean;
    minProperties?: number;
    consistent?: boolean;
  });
  ExportDeclaration?: (("always" | "never") | {
    multiline?: boolean;
    minProperties?: number;
    consistent?: boolean;
  });
})];
// ----- object-curly-spacing -----
type ObjectCurlySpacing = [] | [("always" | "never")] | [("always" | "never"), {
  arraysInObjects?: boolean;
  objectsInObjects?: boolean;
}];
// ----- object-property-newline -----
type ObjectPropertyNewline = [] | [{
  allowAllPropertiesOnSameLine?: boolean;
  allowMultiplePropertiesPerLine?: boolean;
}];
// ----- object-shorthand -----
type ObjectShorthand = ([] | [("always" | "methods" | "properties" | "never" | "consistent" | "consistent-as-needed")] | [] | [("always" | "methods" | "properties")] | [("always" | "methods" | "properties"), {
  avoidQuotes?: boolean;
}] | [] | [("always" | "methods")] | [("always" | "methods"), {
  ignoreConstructors?: boolean;
  methodsIgnorePattern?: string;
  avoidQuotes?: boolean;
  avoidExplicitReturnArrows?: boolean;
}]);
// ----- one-var -----
type OneVar = [] | [(("always" | "never" | "consecutive") | {
  separateRequires?: boolean;
  var?: ("always" | "never" | "consecutive");
  let?: ("always" | "never" | "consecutive");
  const?: ("always" | "never" | "consecutive");
  using?: ("always" | "never" | "consecutive");
  awaitUsing?: ("always" | "never" | "consecutive");
} | {
  initialized?: ("always" | "never" | "consecutive");
  uninitialized?: ("always" | "never" | "consecutive");
})];
// ----- one-var-declaration-per-line -----
type OneVarDeclarationPerLine = [] | [("always" | "initializations")];
// ----- operator-assignment -----
type OperatorAssignment = [] | [("always" | "never")];
// ----- operator-linebreak -----
type OperatorLinebreak = [] | [("after" | "before" | "none" | null)] | [("after" | "before" | "none" | null), {
  overrides?: {
    [k: string]: ("after" | "before" | "none" | "ignore") | undefined;
  };
}];
// ----- padded-blocks -----
type PaddedBlocks = [] | [(("always" | "never") | {
  blocks?: ("always" | "never");
  switches?: ("always" | "never");
  classes?: ("always" | "never");
})] | [(("always" | "never") | {
  blocks?: ("always" | "never");
  switches?: ("always" | "never");
  classes?: ("always" | "never");
}), {
  allowSingleLineBlocks?: boolean;
}];
// ----- padding-line-between-statements -----
type _PaddingLineBetweenStatementsPaddingType = ("any" | "never" | "always");
type _PaddingLineBetweenStatementsStatementType = (("*" | "block-like" | "cjs-export" | "cjs-import" | "directive" | "expression" | "iife" | "multiline-block-like" | "multiline-expression" | "multiline-const" | "multiline-let" | "multiline-var" | "singleline-const" | "singleline-let" | "singleline-var" | "block" | "empty" | "function" | "break" | "case" | "class" | "const" | "continue" | "debugger" | "default" | "do" | "export" | "for" | "if" | "import" | "let" | "return" | "switch" | "throw" | "try" | "var" | "while" | "with") | [("*" | "block-like" | "cjs-export" | "cjs-import" | "directive" | "expression" | "iife" | "multiline-block-like" | "multiline-expression" | "multiline-const" | "multiline-let" | "multiline-var" | "singleline-const" | "singleline-let" | "singleline-var" | "block" | "empty" | "function" | "break" | "case" | "class" | "const" | "continue" | "debugger" | "default" | "do" | "export" | "for" | "if" | "import" | "let" | "return" | "switch" | "throw" | "try" | "var" | "while" | "with"), ...(("*" | "block-like" | "cjs-export" | "cjs-import" | "directive" | "expression" | "iife" | "multiline-block-like" | "multiline-expression" | "multiline-const" | "multiline-let" | "multiline-var" | "singleline-const" | "singleline-let" | "singleline-var" | "block" | "empty" | "function" | "break" | "case" | "class" | "const" | "continue" | "debugger" | "default" | "do" | "export" | "for" | "if" | "import" | "let" | "return" | "switch" | "throw" | "try" | "var" | "while" | "with"))[]]);
type PaddingLineBetweenStatements = {
  blankLine: _PaddingLineBetweenStatementsPaddingType;
  prev: _PaddingLineBetweenStatementsStatementType;
  next: _PaddingLineBetweenStatementsStatementType;
}[];
// ----- perfectionist/sort-array-includes -----
type PerfectionistSortArrayIncludes = {
  fallbackSort?: {
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  };
  specialCharacters?: ("remove" | "trim" | "keep");
  ignoreCase?: boolean;
  alphabet?: string;
  locales?: (string | string[]);
  order?: ("asc" | "desc");
  type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  groupKind?: ("mixed" | "literals-first" | "spreads-first");
  customGroups?: ({
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    anyOf?: {
      selector?: ("literal" | "spread");
      elementNamePattern?: (({
        pattern: string;
        flags?: string;
      } | string)[] | ({
        pattern: string;
        flags?: string;
      } | string));
    }[];
  } | {
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    selector?: ("literal" | "spread");
    elementNamePattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
  })[];
  useConfigurationIf?: {
    allNamesMatchPattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
  };
  partitionByComment?: (boolean | (({
    pattern: string;
    flags?: string;
  } | string)[] | ({
    pattern: string;
    flags?: string;
  } | string)) | {
    block?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
    line?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
  });
  partitionByNewLine?: boolean;
  newlinesBetween?: (("ignore" | "always" | "never") | number);
  groups?: (string | string[] | {
    newlinesBetween?: (("ignore" | "always" | "never") | number);
    commentAbove?: string;
  })[];
}[];
// ----- perfectionist/sort-classes -----
type PerfectionistSortClasses = [] | [{
  fallbackSort?: {
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  };
  specialCharacters?: ("remove" | "trim" | "keep");
  ignoreCase?: boolean;
  alphabet?: string;
  locales?: (string | string[]);
  order?: ("asc" | "desc");
  type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  customGroups?: ({
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    anyOf?: {
      modifiers?: ("async" | "protected" | "private" | "public" | "static" | "abstract" | "override" | "readonly" | "decorated" | "declare" | "optional")[];
      selector?: ("accessor-property" | "index-signature" | "constructor" | "static-block" | "get-method" | "set-method" | "function-property" | "property" | "method");
      decoratorNamePattern?: (({
        pattern: string;
        flags?: string;
      } | string)[] | ({
        pattern: string;
        flags?: string;
      } | string));
      elementValuePattern?: (({
        pattern: string;
        flags?: string;
      } | string)[] | ({
        pattern: string;
        flags?: string;
      } | string));
      elementNamePattern?: (({
        pattern: string;
        flags?: string;
      } | string)[] | ({
        pattern: string;
        flags?: string;
      } | string));
    }[];
  } | {
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    modifiers?: ("async" | "protected" | "private" | "public" | "static" | "abstract" | "override" | "readonly" | "decorated" | "declare" | "optional")[];
    selector?: ("accessor-property" | "index-signature" | "constructor" | "static-block" | "get-method" | "set-method" | "function-property" | "property" | "method");
    decoratorNamePattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
    elementValuePattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
    elementNamePattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
  })[];
  ignoreCallbackDependenciesPatterns?: (({
    pattern: string;
    flags?: string;
  } | string)[] | ({
    pattern: string;
    flags?: string;
  } | string));
  partitionByComment?: (boolean | (({
    pattern: string;
    flags?: string;
  } | string)[] | ({
    pattern: string;
    flags?: string;
  } | string)) | {
    block?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
    line?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
  });
  partitionByNewLine?: boolean;
  newlinesBetween?: (("ignore" | "always" | "never") | number);
  groups?: (string | string[] | {
    newlinesBetween?: (("ignore" | "always" | "never") | number);
    commentAbove?: string;
  })[];
}];
// ----- perfectionist/sort-decorators -----
type PerfectionistSortDecorators = [] | [{
  fallbackSort?: {
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  };
  specialCharacters?: ("remove" | "trim" | "keep");
  ignoreCase?: boolean;
  alphabet?: string;
  locales?: (string | string[]);
  order?: ("asc" | "desc");
  type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  sortOnParameters?: boolean;
  sortOnProperties?: boolean;
  sortOnAccessors?: boolean;
  sortOnMethods?: boolean;
  sortOnClasses?: boolean;
  partitionByComment?: (boolean | (({
    pattern: string;
    flags?: string;
  } | string)[] | ({
    pattern: string;
    flags?: string;
  } | string)) | {
    block?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
    line?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
  });
  customGroups?: {
    [k: string]: (string | string[]) | undefined;
  };
  groups?: (string | string[] | {
    newlinesBetween?: (("ignore" | "always" | "never") | number);
    commentAbove?: string;
  })[];
}];
// ----- perfectionist/sort-enums -----
type PerfectionistSortEnums = [] | [{
  fallbackSort?: {
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  };
  specialCharacters?: ("remove" | "trim" | "keep");
  ignoreCase?: boolean;
  alphabet?: string;
  locales?: (string | string[]);
  order?: ("asc" | "desc");
  type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  customGroups?: ({
    [k: string]: (string | string[]) | undefined;
  } | ({
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    anyOf?: {
      elementValuePattern?: (({
        pattern: string;
        flags?: string;
      } | string)[] | ({
        pattern: string;
        flags?: string;
      } | string));
      elementNamePattern?: (({
        pattern: string;
        flags?: string;
      } | string)[] | ({
        pattern: string;
        flags?: string;
      } | string));
    }[];
  } | {
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    elementValuePattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
    elementNamePattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
  })[]);
  forceNumericSort?: boolean;
  sortByValue?: boolean;
  partitionByComment?: (boolean | (({
    pattern: string;
    flags?: string;
  } | string)[] | ({
    pattern: string;
    flags?: string;
  } | string)) | {
    block?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
    line?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
  });
  partitionByNewLine?: boolean;
  newlinesBetween?: (("ignore" | "always" | "never") | number);
  groups?: (string | string[] | {
    newlinesBetween?: (("ignore" | "always" | "never") | number);
    commentAbove?: string;
  })[];
}];
// ----- perfectionist/sort-exports -----
type PerfectionistSortExports = {
  fallbackSort?: {
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  };
  specialCharacters?: ("remove" | "trim" | "keep");
  ignoreCase?: boolean;
  alphabet?: string;
  locales?: (string | string[]);
  order?: ("asc" | "desc");
  type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  groupKind?: ("mixed" | "values-first" | "types-first");
  customGroups?: ({
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    anyOf?: {
      modifiers?: ("value" | "type")[];
      selector?: "export";
      elementNamePattern?: (({
        pattern: string;
        flags?: string;
      } | string)[] | ({
        pattern: string;
        flags?: string;
      } | string));
    }[];
  } | {
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    modifiers?: ("value" | "type")[];
    selector?: "export";
    elementNamePattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
  })[];
  partitionByComment?: (boolean | (({
    pattern: string;
    flags?: string;
  } | string)[] | ({
    pattern: string;
    flags?: string;
  } | string)) | {
    block?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
    line?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
  });
  partitionByNewLine?: boolean;
  newlinesBetween?: (("ignore" | "always" | "never") | number);
  groups?: (string | string[] | {
    newlinesBetween?: (("ignore" | "always" | "never") | number);
    commentAbove?: string;
  })[];
}[];
// ----- perfectionist/sort-heritage-clauses -----
type PerfectionistSortHeritageClauses = [] | [{
  fallbackSort?: {
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  };
  specialCharacters?: ("remove" | "trim" | "keep");
  ignoreCase?: boolean;
  alphabet?: string;
  locales?: (string | string[]);
  order?: ("asc" | "desc");
  type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  customGroups?: {
    [k: string]: (string | string[]) | undefined;
  };
  groups?: (string | string[] | {
    newlinesBetween?: (("ignore" | "always" | "never") | number);
    commentAbove?: string;
  })[];
}];
// ----- perfectionist/sort-imports -----
type PerfectionistSortImports = {
  fallbackSort?: {
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  };
  specialCharacters?: ("remove" | "trim" | "keep");
  ignoreCase?: boolean;
  alphabet?: string;
  locales?: (string | string[]);
  order?: ("asc" | "desc");
  type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  customGroups?: ({
    value?: {
      [k: string]: (string | string[]) | undefined;
    };
    type?: {
      [k: string]: (string | string[]) | undefined;
    };
  } | ({
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    anyOf?: {
      modifiers?: ("default" | "named" | "require" | "side-effect" | "ts-equals" | "type" | "value" | "wildcard")[];
      selector?: ("side-effect-style" | "tsconfig-path" | "side-effect" | "external" | "internal" | "builtin" | "sibling" | "subpath" | "import" | "parent" | "index" | "style" | "type");
      elementValuePattern?: (({
        pattern: string;
        flags?: string;
      } | string)[] | ({
        pattern: string;
        flags?: string;
      } | string));
      elementNamePattern?: (({
        pattern: string;
        flags?: string;
      } | string)[] | ({
        pattern: string;
        flags?: string;
      } | string));
    }[];
  } | {
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    modifiers?: ("default" | "named" | "require" | "side-effect" | "ts-equals" | "type" | "value" | "wildcard")[];
    selector?: ("side-effect-style" | "tsconfig-path" | "side-effect" | "external" | "internal" | "builtin" | "sibling" | "subpath" | "import" | "parent" | "index" | "style" | "type");
    elementValuePattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
    elementNamePattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
  })[]);
  tsconfig?: {
    rootDir: string;
    filename?: string;
  };
  maxLineLength?: number;
  sortSideEffects?: boolean;
  environment?: ("node" | "bun");
  tsconfigRootDir?: string;
  partitionByComment?: (boolean | (({
    pattern: string;
    flags?: string;
  } | string)[] | ({
    pattern: string;
    flags?: string;
  } | string)) | {
    block?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
    line?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
  });
  partitionByNewLine?: boolean;
  newlinesBetween?: (("ignore" | "always" | "never") | number);
  internalPattern?: (({
    pattern: string;
    flags?: string;
  } | string)[] | ({
    pattern: string;
    flags?: string;
  } | string));
  groups?: (string | string[] | {
    newlinesBetween?: (("ignore" | "always" | "never") | number);
    commentAbove?: string;
  })[];
}[];
// ----- perfectionist/sort-interfaces -----
type PerfectionistSortInterfaces = {
  fallbackSort?: {
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    sortBy?: ("name" | "value");
  };
  specialCharacters?: ("remove" | "trim" | "keep");
  ignoreCase?: boolean;
  alphabet?: string;
  locales?: (string | string[]);
  order?: ("asc" | "desc");
  type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  customGroups?: ({
    [k: string]: (string | string[]) | undefined;
  } | ({
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
      sortBy?: ("name" | "value");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    anyOf?: {
      modifiers?: ("optional" | "required" | "multiline")[];
      selector?: ("index-signature" | "member" | "method" | "multiline" | "property");
      elementValuePattern?: (({
        pattern: string;
        flags?: string;
      } | string)[] | ({
        pattern: string;
        flags?: string;
      } | string));
      elementNamePattern?: (({
        pattern: string;
        flags?: string;
      } | string)[] | ({
        pattern: string;
        flags?: string;
      } | string));
      sortBy?: ("name" | "value");
    }[];
  } | {
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
      sortBy?: ("name" | "value");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    modifiers?: ("optional" | "required" | "multiline")[];
    selector?: ("index-signature" | "member" | "method" | "multiline" | "property");
    elementValuePattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
    elementNamePattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
    sortBy?: ("name" | "value");
  })[]);
  groupKind?: ("mixed" | "required-first" | "optional-first");
  useConfigurationIf?: {
    allNamesMatchPattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
    declarationMatchesPattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
  };
  partitionByComment?: (boolean | (({
    pattern: string;
    flags?: string;
  } | string)[] | ({
    pattern: string;
    flags?: string;
  } | string)) | {
    block?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
    line?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
  });
  partitionByNewLine?: boolean;
  newlinesBetween?: (("ignore" | "always" | "never") | number);
  ignorePattern?: (({
    pattern: string;
    flags?: string;
  } | string)[] | ({
    pattern: string;
    flags?: string;
  } | string));
  sortBy?: ("name" | "value");
  groups?: (string | string[] | {
    newlinesBetween?: (("ignore" | "always" | "never") | number);
    commentAbove?: string;
  })[];
}[];
// ----- perfectionist/sort-intersection-types -----
type PerfectionistSortIntersectionTypes = {
  fallbackSort?: {
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  };
  specialCharacters?: ("remove" | "trim" | "keep");
  ignoreCase?: boolean;
  alphabet?: string;
  locales?: (string | string[]);
  order?: ("asc" | "desc");
  type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  customGroups?: ({
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    anyOf?: {
      selector?: ("intersection" | "conditional" | "function" | "operator" | "keyword" | "literal" | "nullish" | "import" | "object" | "named" | "tuple" | "union");
      elementNamePattern?: (({
        pattern: string;
        flags?: string;
      } | string)[] | ({
        pattern: string;
        flags?: string;
      } | string));
    }[];
  } | {
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    selector?: ("intersection" | "conditional" | "function" | "operator" | "keyword" | "literal" | "nullish" | "import" | "object" | "named" | "tuple" | "union");
    elementNamePattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
  })[];
  partitionByComment?: (boolean | (({
    pattern: string;
    flags?: string;
  } | string)[] | ({
    pattern: string;
    flags?: string;
  } | string)) | {
    block?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
    line?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
  });
  partitionByNewLine?: boolean;
  newlinesBetween?: (("ignore" | "always" | "never") | number);
  groups?: (string | string[] | {
    newlinesBetween?: (("ignore" | "always" | "never") | number);
    commentAbove?: string;
  })[];
}[];
// ----- perfectionist/sort-jsx-props -----
type PerfectionistSortJsxProps = {
  fallbackSort?: {
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  };
  specialCharacters?: ("remove" | "trim" | "keep");
  ignoreCase?: boolean;
  alphabet?: string;
  locales?: (string | string[]);
  order?: ("asc" | "desc");
  type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  customGroups?: ({
    [k: string]: (string | string[]) | undefined;
  } | ({
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    anyOf?: {
      modifiers?: ("shorthand" | "multiline")[];
      selector?: ("multiline" | "prop" | "shorthand");
      elementValuePattern?: (({
        pattern: string;
        flags?: string;
      } | string)[] | ({
        pattern: string;
        flags?: string;
      } | string));
      elementNamePattern?: (({
        pattern: string;
        flags?: string;
      } | string)[] | ({
        pattern: string;
        flags?: string;
      } | string));
    }[];
  } | {
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    modifiers?: ("shorthand" | "multiline")[];
    selector?: ("multiline" | "prop" | "shorthand");
    elementValuePattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
    elementNamePattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
  })[]);
  useConfigurationIf?: {
    allNamesMatchPattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
    tagMatchesPattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
  };
  partitionByNewLine?: boolean;
  newlinesBetween?: (("ignore" | "always" | "never") | number);
  ignorePattern?: (({
    pattern: string;
    flags?: string;
  } | string)[] | ({
    pattern: string;
    flags?: string;
  } | string));
  groups?: (string | string[] | {
    newlinesBetween?: (("ignore" | "always" | "never") | number);
    commentAbove?: string;
  })[];
}[];
// ----- perfectionist/sort-maps -----
type PerfectionistSortMaps = {
  fallbackSort?: {
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  };
  specialCharacters?: ("remove" | "trim" | "keep");
  ignoreCase?: boolean;
  alphabet?: string;
  locales?: (string | string[]);
  order?: ("asc" | "desc");
  type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  customGroups?: ({
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    anyOf?: {
      elementNamePattern?: (({
        pattern: string;
        flags?: string;
      } | string)[] | ({
        pattern: string;
        flags?: string;
      } | string));
    }[];
  } | {
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    elementNamePattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
  })[];
  useConfigurationIf?: {
    allNamesMatchPattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
  };
  partitionByComment?: (boolean | (({
    pattern: string;
    flags?: string;
  } | string)[] | ({
    pattern: string;
    flags?: string;
  } | string)) | {
    block?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
    line?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
  });
  partitionByNewLine?: boolean;
  newlinesBetween?: (("ignore" | "always" | "never") | number);
  groups?: (string | string[] | {
    newlinesBetween?: (("ignore" | "always" | "never") | number);
    commentAbove?: string;
  })[];
}[];
// ----- perfectionist/sort-modules -----
type PerfectionistSortModules = [] | [{
  fallbackSort?: {
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  };
  specialCharacters?: ("remove" | "trim" | "keep");
  ignoreCase?: boolean;
  alphabet?: string;
  locales?: (string | string[]);
  order?: ("asc" | "desc");
  type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  customGroups?: ({
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    anyOf?: {
      modifiers?: ("async" | "declare" | "decorated" | "default" | "export")[];
      selector?: ("enum" | "function" | "interface" | "type" | "class");
      decoratorNamePattern?: (({
        pattern: string;
        flags?: string;
      } | string)[] | ({
        pattern: string;
        flags?: string;
      } | string));
      elementNamePattern?: (({
        pattern: string;
        flags?: string;
      } | string)[] | ({
        pattern: string;
        flags?: string;
      } | string));
    }[];
  } | {
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    modifiers?: ("async" | "declare" | "decorated" | "default" | "export")[];
    selector?: ("enum" | "function" | "interface" | "type" | "class");
    decoratorNamePattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
    elementNamePattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
  })[];
  partitionByComment?: (boolean | (({
    pattern: string;
    flags?: string;
  } | string)[] | ({
    pattern: string;
    flags?: string;
  } | string)) | {
    block?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
    line?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
  });
  partitionByNewLine?: boolean;
  newlinesBetween?: (("ignore" | "always" | "never") | number);
  groups?: (string | string[] | {
    newlinesBetween?: (("ignore" | "always" | "never") | number);
    commentAbove?: string;
  })[];
}];
// ----- perfectionist/sort-named-exports -----
type PerfectionistSortNamedExports = {
  fallbackSort?: {
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  };
  specialCharacters?: ("remove" | "trim" | "keep");
  ignoreCase?: boolean;
  alphabet?: string;
  locales?: (string | string[]);
  order?: ("asc" | "desc");
  type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  groupKind?: ("mixed" | "values-first" | "types-first");
  ignoreAlias?: boolean;
  customGroups?: ({
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    anyOf?: {
      modifiers?: ("value" | "type")[];
      selector?: "export";
      elementNamePattern?: (({
        pattern: string;
        flags?: string;
      } | string)[] | ({
        pattern: string;
        flags?: string;
      } | string));
    }[];
  } | {
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    modifiers?: ("value" | "type")[];
    selector?: "export";
    elementNamePattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
  })[];
  partitionByComment?: (boolean | (({
    pattern: string;
    flags?: string;
  } | string)[] | ({
    pattern: string;
    flags?: string;
  } | string)) | {
    block?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
    line?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
  });
  partitionByNewLine?: boolean;
  newlinesBetween?: (("ignore" | "always" | "never") | number);
  groups?: (string | string[] | {
    newlinesBetween?: (("ignore" | "always" | "never") | number);
    commentAbove?: string;
  })[];
}[];
// ----- perfectionist/sort-named-imports -----
type PerfectionistSortNamedImports = {
  fallbackSort?: {
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  };
  specialCharacters?: ("remove" | "trim" | "keep");
  ignoreCase?: boolean;
  alphabet?: string;
  locales?: (string | string[]);
  order?: ("asc" | "desc");
  type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  groupKind?: ("mixed" | "values-first" | "types-first");
  ignoreAlias?: boolean;
  customGroups?: ({
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    anyOf?: {
      modifiers?: ("value" | "type")[];
      selector?: "import";
      elementNamePattern?: (({
        pattern: string;
        flags?: string;
      } | string)[] | ({
        pattern: string;
        flags?: string;
      } | string));
    }[];
  } | {
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    modifiers?: ("value" | "type")[];
    selector?: "import";
    elementNamePattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
  })[];
  partitionByComment?: (boolean | (({
    pattern: string;
    flags?: string;
  } | string)[] | ({
    pattern: string;
    flags?: string;
  } | string)) | {
    block?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
    line?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
  });
  partitionByNewLine?: boolean;
  newlinesBetween?: (("ignore" | "always" | "never") | number);
  groups?: (string | string[] | {
    newlinesBetween?: (("ignore" | "always" | "never") | number);
    commentAbove?: string;
  })[];
}[];
// ----- perfectionist/sort-object-types -----
type PerfectionistSortObjectTypes = {
  fallbackSort?: {
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    sortBy?: ("name" | "value");
  };
  specialCharacters?: ("remove" | "trim" | "keep");
  ignoreCase?: boolean;
  alphabet?: string;
  locales?: (string | string[]);
  order?: ("asc" | "desc");
  type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  customGroups?: ({
    [k: string]: (string | string[]) | undefined;
  } | ({
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
      sortBy?: ("name" | "value");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    anyOf?: {
      modifiers?: ("optional" | "required" | "multiline")[];
      selector?: ("index-signature" | "member" | "method" | "multiline" | "property");
      elementValuePattern?: (({
        pattern: string;
        flags?: string;
      } | string)[] | ({
        pattern: string;
        flags?: string;
      } | string));
      elementNamePattern?: (({
        pattern: string;
        flags?: string;
      } | string)[] | ({
        pattern: string;
        flags?: string;
      } | string));
      sortBy?: ("name" | "value");
    }[];
  } | {
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
      sortBy?: ("name" | "value");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    modifiers?: ("optional" | "required" | "multiline")[];
    selector?: ("index-signature" | "member" | "method" | "multiline" | "property");
    elementValuePattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
    elementNamePattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
    sortBy?: ("name" | "value");
  })[]);
  groupKind?: ("mixed" | "required-first" | "optional-first");
  useConfigurationIf?: {
    allNamesMatchPattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
    declarationMatchesPattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
  };
  partitionByComment?: (boolean | (({
    pattern: string;
    flags?: string;
  } | string)[] | ({
    pattern: string;
    flags?: string;
  } | string)) | {
    block?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
    line?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
  });
  partitionByNewLine?: boolean;
  newlinesBetween?: (("ignore" | "always" | "never") | number);
  ignorePattern?: (({
    pattern: string;
    flags?: string;
  } | string)[] | ({
    pattern: string;
    flags?: string;
  } | string));
  sortBy?: ("name" | "value");
  groups?: (string | string[] | {
    newlinesBetween?: (("ignore" | "always" | "never") | number);
    commentAbove?: string;
  })[];
}[];
// ----- perfectionist/sort-objects -----
type PerfectionistSortObjects = {
  fallbackSort?: {
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  };
  specialCharacters?: ("remove" | "trim" | "keep");
  ignoreCase?: boolean;
  alphabet?: string;
  locales?: (string | string[]);
  order?: ("asc" | "desc");
  type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  destructuredObjects?: (boolean | {
    groups?: boolean;
  });
  customGroups?: ({
    [k: string]: (string | string[]) | undefined;
  } | ({
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    anyOf?: {
      modifiers?: ("optional" | "required" | "multiline")[];
      selector?: ("member" | "method" | "multiline" | "property");
      elementValuePattern?: (({
        pattern: string;
        flags?: string;
      } | string)[] | ({
        pattern: string;
        flags?: string;
      } | string));
      elementNamePattern?: (({
        pattern: string;
        flags?: string;
      } | string)[] | ({
        pattern: string;
        flags?: string;
      } | string));
    }[];
  } | {
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    modifiers?: ("optional" | "required" | "multiline")[];
    selector?: ("member" | "method" | "multiline" | "property");
    elementValuePattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
    elementNamePattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
  })[]);
  useConfigurationIf?: {
    allNamesMatchPattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
    callingFunctionNamePattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
  };
  destructureOnly?: boolean;
  objectDeclarations?: boolean;
  styledComponents?: boolean;
  partitionByComment?: (boolean | (({
    pattern: string;
    flags?: string;
  } | string)[] | ({
    pattern: string;
    flags?: string;
  } | string)) | {
    block?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
    line?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
  });
  partitionByNewLine?: boolean;
  newlinesBetween?: (("ignore" | "always" | "never") | number);
  ignorePattern?: (({
    pattern: string;
    flags?: string;
  } | string)[] | ({
    pattern: string;
    flags?: string;
  } | string));
  groups?: (string | string[] | {
    newlinesBetween?: (("ignore" | "always" | "never") | number);
    commentAbove?: string;
  })[];
}[];
// ----- perfectionist/sort-sets -----
type PerfectionistSortSets = {
  fallbackSort?: {
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  };
  specialCharacters?: ("remove" | "trim" | "keep");
  ignoreCase?: boolean;
  alphabet?: string;
  locales?: (string | string[]);
  order?: ("asc" | "desc");
  type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  groupKind?: ("mixed" | "literals-first" | "spreads-first");
  customGroups?: ({
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    anyOf?: {
      selector?: ("literal" | "spread");
      elementNamePattern?: (({
        pattern: string;
        flags?: string;
      } | string)[] | ({
        pattern: string;
        flags?: string;
      } | string));
    }[];
  } | {
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    selector?: ("literal" | "spread");
    elementNamePattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
  })[];
  useConfigurationIf?: {
    allNamesMatchPattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
  };
  partitionByComment?: (boolean | (({
    pattern: string;
    flags?: string;
  } | string)[] | ({
    pattern: string;
    flags?: string;
  } | string)) | {
    block?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
    line?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
  });
  partitionByNewLine?: boolean;
  newlinesBetween?: (("ignore" | "always" | "never") | number);
  groups?: (string | string[] | {
    newlinesBetween?: (("ignore" | "always" | "never") | number);
    commentAbove?: string;
  })[];
}[];
// ----- perfectionist/sort-switch-case -----
type PerfectionistSortSwitchCase = [] | [{
  fallbackSort?: {
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  };
  specialCharacters?: ("remove" | "trim" | "keep");
  ignoreCase?: boolean;
  alphabet?: string;
  locales?: (string | string[]);
  order?: ("asc" | "desc");
  type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
}];
// ----- perfectionist/sort-union-types -----
type PerfectionistSortUnionTypes = {
  fallbackSort?: {
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  };
  specialCharacters?: ("remove" | "trim" | "keep");
  ignoreCase?: boolean;
  alphabet?: string;
  locales?: (string | string[]);
  order?: ("asc" | "desc");
  type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  customGroups?: ({
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    anyOf?: {
      selector?: ("intersection" | "conditional" | "function" | "operator" | "keyword" | "literal" | "nullish" | "import" | "object" | "named" | "tuple" | "union");
      elementNamePattern?: (({
        pattern: string;
        flags?: string;
      } | string)[] | ({
        pattern: string;
        flags?: string;
      } | string));
    }[];
  } | {
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    selector?: ("intersection" | "conditional" | "function" | "operator" | "keyword" | "literal" | "nullish" | "import" | "object" | "named" | "tuple" | "union");
    elementNamePattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
  })[];
  partitionByComment?: (boolean | (({
    pattern: string;
    flags?: string;
  } | string)[] | ({
    pattern: string;
    flags?: string;
  } | string)) | {
    block?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
    line?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
  });
  partitionByNewLine?: boolean;
  newlinesBetween?: (("ignore" | "always" | "never") | number);
  groups?: (string | string[] | {
    newlinesBetween?: (("ignore" | "always" | "never") | number);
    commentAbove?: string;
  })[];
}[];
// ----- perfectionist/sort-variable-declarations -----
type PerfectionistSortVariableDeclarations = [] | [{
  fallbackSort?: {
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  };
  specialCharacters?: ("remove" | "trim" | "keep");
  ignoreCase?: boolean;
  alphabet?: string;
  locales?: (string | string[]);
  order?: ("asc" | "desc");
  type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
  customGroups?: ({
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    anyOf?: {
      selector?: ("initialized" | "uninitialized");
      elementNamePattern?: (({
        pattern: string;
        flags?: string;
      } | string)[] | ({
        pattern: string;
        flags?: string;
      } | string));
    }[];
  } | {
    newlinesInside?: (("always" | "never") | number);
    fallbackSort?: {
      order?: ("asc" | "desc");
      type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    };
    groupName: string;
    order?: ("asc" | "desc");
    type?: ("alphabetical" | "natural" | "line-length" | "custom" | "unsorted");
    selector?: ("initialized" | "uninitialized");
    elementNamePattern?: (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string));
  })[];
  partitionByComment?: (boolean | (({
    pattern: string;
    flags?: string;
  } | string)[] | ({
    pattern: string;
    flags?: string;
  } | string)) | {
    block?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
    line?: (boolean | (({
      pattern: string;
      flags?: string;
    } | string)[] | ({
      pattern: string;
      flags?: string;
    } | string)));
  });
  partitionByNewLine?: boolean;
  newlinesBetween?: (("ignore" | "always" | "never") | number);
  groups?: (string | string[] | {
    newlinesBetween?: (("ignore" | "always" | "never") | number);
    commentAbove?: string;
  })[];
}];
// ----- pnpm/json-enforce-catalog -----
type PnpmJsonEnforceCatalog = [] | [{
  allowedProtocols?: string[];
  autofix?: boolean;
  defaultCatalog?: string;
  reuseExistingCatalog?: boolean;
  conflicts?: ("new-catalog" | "overrides" | "error");
  fields?: string[];
  ignores?: string[];
}];
// ----- pnpm/json-prefer-workspace-settings -----
type PnpmJsonPreferWorkspaceSettings = [] | [{
  autofix?: boolean;
}];
// ----- pnpm/json-valid-catalog -----
type PnpmJsonValidCatalog = [] | [{
  autoInsert?: boolean;
  autoInsertDefaultSpecifier?: string;
  autofix?: boolean;
  enforceNoConflict?: boolean;
  fields?: unknown[];
}];
// ----- pnpm/yaml-enforce-settings -----
type PnpmYamlEnforceSettings = [] | [{
  autofix?: boolean;
  settings?: {
    [k: string]: unknown | undefined;
  };
  requiredFields?: string[];
  forbiddenFields?: string[];
}];
// ----- pnpm/yaml-no-duplicate-catalog-item -----
type PnpmYamlNoDuplicateCatalogItem = [] | [{
  allow?: string[];
  checkDuplicates?: ("name-only" | "exact-version");
}];
// ----- prefer-arrow-callback -----
type PreferArrowCallback = [] | [{
  allowNamedFunctions?: boolean;
  allowUnboundThis?: boolean;
}];
// ----- prefer-const -----
type PreferConst = [] | [{
  destructuring?: ("any" | "all");
  ignoreReadBeforeAssign?: boolean;
}];
// ----- prefer-destructuring -----
type PreferDestructuring = [] | [({
  VariableDeclarator?: {
    array?: boolean;
    object?: boolean;
  };
  AssignmentExpression?: {
    array?: boolean;
    object?: boolean;
  };
} | {
  array?: boolean;
  object?: boolean;
})] | [({
  VariableDeclarator?: {
    array?: boolean;
    object?: boolean;
  };
  AssignmentExpression?: {
    array?: boolean;
    object?: boolean;
  };
} | {
  array?: boolean;
  object?: boolean;
}), {
  enforceForRenamedProperties?: boolean;
}];
// ----- prefer-promise-reject-errors -----
type PreferPromiseRejectErrors = [] | [{
  allowEmptyReject?: boolean;
}];
// ----- prefer-reflect -----
type PreferReflect = [] | [{
  exceptions?: ("apply" | "call" | "delete" | "defineProperty" | "getOwnPropertyDescriptor" | "getPrototypeOf" | "setPrototypeOf" | "isExtensible" | "getOwnPropertyNames" | "preventExtensions")[];
}];
// ----- prefer-regex-literals -----
type PreferRegexLiterals = [] | [{
  disallowRedundantWrapping?: boolean;
}];
// ----- preserve-caught-error -----
type PreserveCaughtError = [] | [{
  requireCatchParameter?: boolean;
}];
// ----- quote-props -----
type QuoteProps = ([] | [("always" | "as-needed" | "consistent" | "consistent-as-needed")] | [] | [("always" | "as-needed" | "consistent" | "consistent-as-needed")] | [("always" | "as-needed" | "consistent" | "consistent-as-needed"), {
  keywords?: boolean;
  unnecessary?: boolean;
  numbers?: boolean;
}]);
// ----- quotes -----
type Quotes = [] | [("single" | "double" | "backtick")] | [("single" | "double" | "backtick"), ("avoid-escape" | {
  avoidEscape?: boolean;
  allowTemplateLiterals?: boolean;
})];
// ----- radix -----
type Radix = [] | [("always" | "as-needed")];
// ----- react-dom/no-unknown-property -----
type ReactDomNoUnknownProperty = [] | [{
  ignore?: string[];
  requireDataLowercase?: boolean;
}];
// ----- react-hooks/automatic-effect-dependencies -----
type ReactHooksAutomaticEffectDependencies = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- react-hooks/capitalized-calls -----
type ReactHooksCapitalizedCalls = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- react-hooks/component-hook-factories -----
type ReactHooksComponentHookFactories = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- react-hooks/config -----
type ReactHooksConfig = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- react-hooks/error-boundaries -----
type ReactHooksErrorBoundaries = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- react-hooks/exhaustive-deps -----
type ReactHooksExhaustiveDeps = [] | [{
  additionalHooks?: string;
  enableDangerousAutofixThisMayCauseInfiniteLoops?: boolean;
  experimental_autoDependenciesHooks?: string[];
  requireExplicitEffectDeps?: boolean;
}];
// ----- react-hooks/fbt -----
type ReactHooksFbt = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- react-hooks/fire -----
type ReactHooksFire = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- react-hooks/gating -----
type ReactHooksGating = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- react-hooks/globals -----
type ReactHooksGlobals = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- react-hooks/hooks -----
type ReactHooksHooks = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- react-hooks/immutability -----
type ReactHooksImmutability = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- react-hooks/incompatible-library -----
type ReactHooksIncompatibleLibrary = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- react-hooks/invariant -----
type ReactHooksInvariant = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- react-hooks/memoized-effect-dependencies -----
type ReactHooksMemoizedEffectDependencies = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- react-hooks/no-deriving-state-in-effects -----
type ReactHooksNoDerivingStateInEffects = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- react-hooks/preserve-manual-memoization -----
type ReactHooksPreserveManualMemoization = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- react-hooks/purity -----
type ReactHooksPurity = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- react-hooks/refs -----
type ReactHooksRefs = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- react-hooks/rule-suppression -----
type ReactHooksRuleSuppression = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- react-hooks/rules-of-hooks -----
type ReactHooksRulesOfHooks = [] | [{
  additionalHooks?: string;
}];
// ----- react-hooks/set-state-in-effect -----
type ReactHooksSetStateInEffect = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- react-hooks/set-state-in-render -----
type ReactHooksSetStateInRender = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- react-hooks/static-components -----
type ReactHooksStaticComponents = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- react-hooks/syntax -----
type ReactHooksSyntax = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- react-hooks/todo -----
type ReactHooksTodo = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- react-hooks/unsupported-syntax -----
type ReactHooksUnsupportedSyntax = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- react-hooks/use-memo -----
type ReactHooksUseMemo = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- react-hooks/void-use-memo -----
type ReactHooksVoidUseMemo = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- react-naming-convention/component-name -----
type ReactNamingConventionComponentName = [] | [(("PascalCase" | "CONSTANT_CASE") | {
  allowAllCaps?: boolean;
  excepts?: string[];
  rule?: ("PascalCase" | "CONSTANT_CASE");
})];
// ----- react-naming-convention/filename -----
type ReactNamingConventionFilename = [] | [(("PascalCase" | "camelCase" | "kebab-case" | "snake_case") | {
  excepts?: string[];
  extensions?: string[];
  rule?: ("PascalCase" | "camelCase" | "kebab-case" | "snake_case");
})];
// ----- react-naming-convention/filename-extension -----
type ReactNamingConventionFilenameExtension = [] | [(("always" | "as-needed") | {
  allow?: ("always" | "as-needed");
  extensions?: string[];
  ignoreFilesWithoutCode?: boolean;
})];
// ----- react-refresh/only-export-components -----
type ReactRefreshOnlyExportComponents = [] | [{
  allowExportNames?: string[];
  allowConstantExport?: boolean;
  customHOCs?: string[];
  checkJS?: boolean;
}];
// ----- react/jsx-shorthand-boolean -----
type ReactJsxShorthandBoolean = [] | [(-1 | 1)];
// ----- react/jsx-shorthand-fragment -----
type ReactJsxShorthandFragment = [] | [(-1 | 1)];
// ----- react/no-forbidden-props -----
type ReactNoForbiddenProps = [] | [{
  forbid?: (string | {
    excludedNodes?: string[];
    prop: string;
  } | {
    includedNodes?: string[];
    prop: string;
  })[];
}];
// ----- react/no-unstable-default-props -----
type ReactNoUnstableDefaultProps = [] | [{
  safeDefaultProps?: string[];
}];
// ----- react/no-useless-fragment -----
type ReactNoUselessFragment = [] | [{
  allowEmptyFragment?: boolean;
  allowExpressions?: boolean;
}];
// ----- regexp/hexadecimal-escape -----
type RegexpHexadecimalEscape = [] | [("always" | "never")];
// ----- regexp/letter-case -----
type RegexpLetterCase = [] | [{
  caseInsensitive?: ("lowercase" | "uppercase" | "ignore");
  unicodeEscape?: ("lowercase" | "uppercase" | "ignore");
  hexadecimalEscape?: ("lowercase" | "uppercase" | "ignore");
  controlEscape?: ("lowercase" | "uppercase" | "ignore");
}];
// ----- regexp/match-any -----
type RegexpMatchAny = [] | [{
  allows?: [("[\\s\\S]" | "[\\S\\s]" | "[^]" | "dotAll"), ...(("[\\s\\S]" | "[\\S\\s]" | "[^]" | "dotAll"))[]];
}];
// ----- regexp/no-dupe-disjunctions -----
type RegexpNoDupeDisjunctions = [] | [{
  report?: ("all" | "trivial" | "interesting");
  reportExponentialBacktracking?: ("none" | "certain" | "potential");
  reportUnreachable?: ("certain" | "potential");
}];
// ----- regexp/no-lazy-ends -----
type RegexpNoLazyEnds = [] | [{
  ignorePartial?: boolean;
}];
// ----- regexp/no-legacy-features -----
type RegexpNoLegacyFeatures = [] | [{
  staticProperties?: ("input" | "$_" | "lastMatch" | "$&" | "lastParen" | "$+" | "leftContext" | "$`" | "rightContext" | "$'" | "$1" | "$2" | "$3" | "$4" | "$5" | "$6" | "$7" | "$8" | "$9")[];
  prototypeMethods?: ("compile")[];
}];
// ----- regexp/no-misleading-capturing-group -----
type RegexpNoMisleadingCapturingGroup = [] | [{
  reportBacktrackingEnds?: boolean;
}];
// ----- regexp/no-misleading-unicode-character -----
type RegexpNoMisleadingUnicodeCharacter = [] | [{
  fixable?: boolean;
}];
// ----- regexp/no-missing-g-flag -----
type RegexpNoMissingGFlag = [] | [{
  strictTypes?: boolean;
}];
// ----- regexp/no-obscure-range -----
type RegexpNoObscureRange = [] | [{
  allowed?: (("all" | "alphanumeric") | [("all" | "alphanumeric")] | [("alphanumeric" | string), ...(("alphanumeric" | string))[]]);
}];
// ----- regexp/no-super-linear-backtracking -----
type RegexpNoSuperLinearBacktracking = [] | [{
  report?: ("certain" | "potential");
}];
// ----- regexp/no-super-linear-move -----
type RegexpNoSuperLinearMove = [] | [{
  report?: ("certain" | "potential");
  ignoreSticky?: boolean;
  ignorePartial?: boolean;
}];
// ----- regexp/no-unused-capturing-group -----
type RegexpNoUnusedCapturingGroup = [] | [{
  fixable?: boolean;
  allowNamed?: boolean;
}];
// ----- regexp/no-useless-character-class -----
type RegexpNoUselessCharacterClass = [] | [{
  ignores?: string[];
}];
// ----- regexp/no-useless-flag -----
type RegexpNoUselessFlag = [] | [{
  ignore?: ("i" | "m" | "s" | "g" | "y")[];
  strictTypes?: boolean;
}];
// ----- regexp/no-useless-non-capturing-group -----
type RegexpNoUselessNonCapturingGroup = [] | [{
  allowTop?: (boolean | ("always" | "never" | "partial"));
}];
// ----- regexp/optimal-quantifier-concatenation -----
type RegexpOptimalQuantifierConcatenation = [] | [{
  capturingGroups?: ("ignore" | "report");
}];
// ----- regexp/prefer-character-class -----
type RegexpPreferCharacterClass = [] | [{
  minAlternatives?: number;
}];
// ----- regexp/prefer-d -----
type RegexpPreferD = [] | [{
  insideCharacterClass?: ("ignore" | "range" | "d");
}];
// ----- regexp/prefer-lookaround -----
type RegexpPreferLookaround = [] | [{
  lookbehind?: boolean;
  strictTypes?: boolean;
}];
// ----- regexp/prefer-named-replacement -----
type RegexpPreferNamedReplacement = [] | [{
  strictTypes?: boolean;
}];
// ----- regexp/prefer-quantifier -----
type RegexpPreferQuantifier = [] | [{
  allows?: string[];
}];
// ----- regexp/prefer-range -----
type RegexpPreferRange = [] | [{
  target?: (("all" | "alphanumeric") | [("all" | "alphanumeric")] | [("alphanumeric" | string), ...(("alphanumeric" | string))[]]);
}];
// ----- regexp/prefer-result-array-groups -----
type RegexpPreferResultArrayGroups = [] | [{
  strictTypes?: boolean;
}];
// ----- regexp/sort-character-class-elements -----
type RegexpSortCharacterClassElements = [] | [{
  order?: ("\\s" | "\\w" | "\\d" | "\\p" | "*" | "\\q" | "[]")[];
}];
// ----- regexp/unicode-escape -----
type RegexpUnicodeEscape = [] | [("unicodeCodePointEscape" | "unicodeEscape")];
// ----- regexp/unicode-property -----
type RegexpUnicodeProperty = [] | [{
  generalCategory?: ("always" | "never" | "ignore");
  key?: ("short" | "long" | "ignore");
  property?: (("short" | "long" | "ignore") | {
    binary?: ("short" | "long" | "ignore");
    generalCategory?: ("short" | "long" | "ignore");
    script?: ("short" | "long" | "ignore");
  });
}];
// ----- require-atomic-updates -----
type RequireAtomicUpdates = [] | [{
  allowProperties?: boolean;
}];
// ----- require-unicode-regexp -----
type RequireUnicodeRegexp = [] | [{
  requireFlag?: ("u" | "v");
}];
// ----- rest-spread-spacing -----
type RestSpreadSpacing = [] | [("always" | "never")];
// ----- semi -----
type Semi = ([] | ["never"] | ["never", {
  beforeStatementContinuationChars?: ("always" | "any" | "never");
}] | [] | ["always"] | ["always", {
  omitLastInOneLineBlock?: boolean;
  omitLastInOneLineClassBody?: boolean;
}]);
// ----- semi-spacing -----
type SemiSpacing = [] | [{
  before?: boolean;
  after?: boolean;
}];
// ----- semi-style -----
type SemiStyle = [] | [("last" | "first")];
// ----- solid/event-handlers -----
type SolidEventHandlers = [] | [{
  ignoreCase?: boolean;
  warnOnSpread?: boolean;
}];
// ----- solid/jsx-no-duplicate-props -----
type SolidJsxNoDuplicateProps = [] | [{
  ignoreCase?: boolean;
  [k: string]: unknown | undefined;
}];
// ----- solid/jsx-no-undef -----
type SolidJsxNoUndef = [] | [{
  allowGlobals?: boolean;
  autoImport?: boolean;
  typescriptEnabled?: boolean;
}];
// ----- solid/no-innerhtml -----
type SolidNoInnerhtml = [] | [{
  allowStatic?: boolean;
}];
// ----- solid/no-unknown-namespaces -----
type SolidNoUnknownNamespaces = [] | [{
  allowedNamespaces?: [string, ...(string)[]];
}];
// ----- solid/prefer-classlist -----
type SolidPreferClasslist = [] | [{
  classnames?: [string, ...(string)[]];
}];
// ----- solid/reactivity -----
type SolidReactivity = [] | [{
  customReactiveFunctions?: string[];
}];
// ----- solid/self-closing-comp -----
type SolidSelfClosingComp = [] | [{
  component?: ("all" | "none");
  html?: ("all" | "void" | "none");
}];
// ----- solid/style-prop -----
type SolidStyleProp = [] | [{
  styleProps?: [string, ...(string)[]];
  allowString?: boolean;
}];
// ----- sort-imports -----
type SortImports = [] | [{
  ignoreCase?: boolean;
  memberSyntaxSortOrder?: [("none" | "all" | "multiple" | "single"), ("none" | "all" | "multiple" | "single"), ("none" | "all" | "multiple" | "single"), ("none" | "all" | "multiple" | "single")];
  ignoreDeclarationSort?: boolean;
  ignoreMemberSort?: boolean;
  allowSeparatedGroups?: boolean;
}];
// ----- sort-keys -----
type SortKeys = [] | [("asc" | "desc")] | [("asc" | "desc"), {
  caseSensitive?: boolean;
  natural?: boolean;
  minKeys?: number;
  allowLineSeparatedGroups?: boolean;
  ignoreComputedKeys?: boolean;
}];
// ----- sort-vars -----
type SortVars = [] | [{
  ignoreCase?: boolean;
}];
// ----- space-before-blocks -----
type SpaceBeforeBlocks = [] | [(("always" | "never") | {
  keywords?: ("always" | "never" | "off");
  functions?: ("always" | "never" | "off");
  classes?: ("always" | "never" | "off");
})];
// ----- space-before-function-paren -----
type SpaceBeforeFunctionParen = [] | [(("always" | "never") | {
  anonymous?: ("always" | "never" | "ignore");
  named?: ("always" | "never" | "ignore");
  asyncArrow?: ("always" | "never" | "ignore");
})];
// ----- space-in-parens -----
type SpaceInParens = [] | [("always" | "never")] | [("always" | "never"), {
  exceptions?: ("{}" | "[]" | "()" | "empty")[];
}];
// ----- space-infix-ops -----
type SpaceInfixOps = [] | [{
  int32Hint?: boolean;
}];
// ----- space-unary-ops -----
type SpaceUnaryOps = [] | [{
  words?: boolean;
  nonwords?: boolean;
  overrides?: {
    [k: string]: boolean | undefined;
  };
}];
// ----- spaced-comment -----
type SpacedComment = [] | [("always" | "never")] | [("always" | "never"), {
  exceptions?: string[];
  markers?: string[];
  line?: {
    exceptions?: string[];
    markers?: string[];
  };
  block?: {
    exceptions?: string[];
    markers?: string[];
    balanced?: boolean;
  };
}];
// ----- strict -----
type Strict = [] | [("never" | "global" | "function" | "safe")];
// ----- style/array-bracket-newline -----
type StyleArrayBracketNewline = [] | [(("always" | "never" | "consistent") | {
  multiline?: boolean;
  minItems?: (number | null);
})];
// ----- style/array-bracket-spacing -----
type StyleArrayBracketSpacing = [] | [("always" | "never")] | [("always" | "never"), {
  singleValue?: boolean;
  objectsInArrays?: boolean;
  arraysInArrays?: boolean;
}];
// ----- style/array-element-newline -----
type StyleArrayElementNewline = [] | [(_StyleArrayElementNewlineBasicConfig | {
  ArrayExpression?: _StyleArrayElementNewlineBasicConfig;
  ArrayPattern?: _StyleArrayElementNewlineBasicConfig;
})];
type _StyleArrayElementNewlineBasicConfig = (("always" | "never" | "consistent") | {
  consistent?: boolean;
  multiline?: boolean;
  minItems?: (number | null);
});
// ----- style/arrow-parens -----
type StyleArrowParens = [] | [("always" | "as-needed")] | [("always" | "as-needed"), {
  requireForBlockBody?: boolean;
}];
// ----- style/arrow-spacing -----
type StyleArrowSpacing = [] | [{
  before?: boolean;
  after?: boolean;
}];
// ----- style/block-spacing -----
type StyleBlockSpacing = [] | [("always" | "never")];
// ----- style/brace-style -----
type StyleBraceStyle = [] | [("1tbs" | "stroustrup" | "allman")] | [("1tbs" | "stroustrup" | "allman"), {
  allowSingleLine?: boolean;
}];
// ----- style/comma-dangle -----
type StyleCommaDangle = [] | [(_StyleCommaDangleValue | {
  arrays?: _StyleCommaDangleValueWithIgnore;
  objects?: _StyleCommaDangleValueWithIgnore;
  imports?: _StyleCommaDangleValueWithIgnore;
  exports?: _StyleCommaDangleValueWithIgnore;
  functions?: _StyleCommaDangleValueWithIgnore;
  importAttributes?: _StyleCommaDangleValueWithIgnore;
  dynamicImports?: _StyleCommaDangleValueWithIgnore;
  enums?: _StyleCommaDangleValueWithIgnore;
  generics?: _StyleCommaDangleValueWithIgnore;
  tuples?: _StyleCommaDangleValueWithIgnore;
})];
type _StyleCommaDangleValue = ("always-multiline" | "always" | "never" | "only-multiline");
type _StyleCommaDangleValueWithIgnore = ("always-multiline" | "always" | "never" | "only-multiline" | "ignore");
// ----- style/comma-spacing -----
type StyleCommaSpacing = [] | [{
  before?: boolean;
  after?: boolean;
}];
// ----- style/comma-style -----
type StyleCommaStyle = [] | [("first" | "last")] | [("first" | "last"), {
  exceptions?: {
    [k: string]: boolean | undefined;
  };
}];
// ----- style/computed-property-spacing -----
type StyleComputedPropertySpacing = [] | [("always" | "never")] | [("always" | "never"), {
  enforceForClassMembers?: boolean;
}];
// ----- style/curly-newline -----
type StyleCurlyNewline = [] | [(("always" | "never") | {
  IfStatementConsequent?: (("always" | "never") | {
    multiline?: boolean;
    minElements?: number;
    consistent?: boolean;
  });
  IfStatementAlternative?: (("always" | "never") | {
    multiline?: boolean;
    minElements?: number;
    consistent?: boolean;
  });
  DoWhileStatement?: (("always" | "never") | {
    multiline?: boolean;
    minElements?: number;
    consistent?: boolean;
  });
  ForInStatement?: (("always" | "never") | {
    multiline?: boolean;
    minElements?: number;
    consistent?: boolean;
  });
  ForOfStatement?: (("always" | "never") | {
    multiline?: boolean;
    minElements?: number;
    consistent?: boolean;
  });
  ForStatement?: (("always" | "never") | {
    multiline?: boolean;
    minElements?: number;
    consistent?: boolean;
  });
  WhileStatement?: (("always" | "never") | {
    multiline?: boolean;
    minElements?: number;
    consistent?: boolean;
  });
  SwitchStatement?: (("always" | "never") | {
    multiline?: boolean;
    minElements?: number;
    consistent?: boolean;
  });
  SwitchCase?: (("always" | "never") | {
    multiline?: boolean;
    minElements?: number;
    consistent?: boolean;
  });
  TryStatementBlock?: (("always" | "never") | {
    multiline?: boolean;
    minElements?: number;
    consistent?: boolean;
  });
  TryStatementHandler?: (("always" | "never") | {
    multiline?: boolean;
    minElements?: number;
    consistent?: boolean;
  });
  TryStatementFinalizer?: (("always" | "never") | {
    multiline?: boolean;
    minElements?: number;
    consistent?: boolean;
  });
  BlockStatement?: (("always" | "never") | {
    multiline?: boolean;
    minElements?: number;
    consistent?: boolean;
  });
  ArrowFunctionExpression?: (("always" | "never") | {
    multiline?: boolean;
    minElements?: number;
    consistent?: boolean;
  });
  FunctionDeclaration?: (("always" | "never") | {
    multiline?: boolean;
    minElements?: number;
    consistent?: boolean;
  });
  FunctionExpression?: (("always" | "never") | {
    multiline?: boolean;
    minElements?: number;
    consistent?: boolean;
  });
  Property?: (("always" | "never") | {
    multiline?: boolean;
    minElements?: number;
    consistent?: boolean;
  });
  ClassBody?: (("always" | "never") | {
    multiline?: boolean;
    minElements?: number;
    consistent?: boolean;
  });
  StaticBlock?: (("always" | "never") | {
    multiline?: boolean;
    minElements?: number;
    consistent?: boolean;
  });
  WithStatement?: (("always" | "never") | {
    multiline?: boolean;
    minElements?: number;
    consistent?: boolean;
  });
  TSModuleBlock?: (("always" | "never") | {
    multiline?: boolean;
    minElements?: number;
    consistent?: boolean;
  });
  multiline?: boolean;
  minElements?: number;
  consistent?: boolean;
})];
// ----- style/dot-location -----
type StyleDotLocation = [] | [("object" | "property")];
// ----- style/eol-last -----
type StyleEolLast = [] | [("always" | "never" | "unix" | "windows")];
// ----- style/exp-list-style -----
type StyleExpListStyle = [] | [{
  singleLine?: _StyleExpListStyle_SingleLineConfig;
  multiLine?: _StyleExpListStyle_MultiLineConfig;
  overrides?: {
    "[]"?: _StyleExpListStyle_BaseConfig;
    "{}"?: _StyleExpListStyle_BaseConfig;
    "<>"?: _StyleExpListStyle_BaseConfig;
    "()"?: _StyleExpListStyle_BaseConfig;
    ArrayExpression?: _StyleExpListStyle_BaseConfig;
    ArrayPattern?: _StyleExpListStyle_BaseConfig;
    ArrowFunctionExpression?: _StyleExpListStyle_BaseConfig;
    CallExpression?: _StyleExpListStyle_BaseConfig;
    ExportNamedDeclaration?: _StyleExpListStyle_BaseConfig;
    FunctionDeclaration?: _StyleExpListStyle_BaseConfig;
    FunctionExpression?: _StyleExpListStyle_BaseConfig;
    ImportDeclaration?: _StyleExpListStyle_BaseConfig;
    ImportAttributes?: _StyleExpListStyle_BaseConfig;
    NewExpression?: _StyleExpListStyle_BaseConfig;
    ObjectExpression?: _StyleExpListStyle_BaseConfig;
    ObjectPattern?: _StyleExpListStyle_BaseConfig;
    TSDeclareFunction?: _StyleExpListStyle_BaseConfig;
    TSFunctionType?: _StyleExpListStyle_BaseConfig;
    TSInterfaceBody?: _StyleExpListStyle_BaseConfig;
    TSEnumBody?: _StyleExpListStyle_BaseConfig;
    TSTupleType?: _StyleExpListStyle_BaseConfig;
    TSTypeLiteral?: _StyleExpListStyle_BaseConfig;
    TSTypeParameterDeclaration?: _StyleExpListStyle_BaseConfig;
    TSTypeParameterInstantiation?: _StyleExpListStyle_BaseConfig;
    JSONArrayExpression?: _StyleExpListStyle_BaseConfig;
    JSONObjectExpression?: _StyleExpListStyle_BaseConfig;
  };
}];
interface _StyleExpListStyle_SingleLineConfig {
  spacing?: ("always" | "never");
  maxItems?: number;
}
interface _StyleExpListStyle_MultiLineConfig {
  minItems?: number;
}
interface _StyleExpListStyle_BaseConfig {
  singleLine?: _StyleExpListStyle_SingleLineConfig;
  multiline?: _StyleExpListStyle_MultiLineConfig;
}
// ----- style/function-call-argument-newline -----
type StyleFunctionCallArgumentNewline = [] | [("always" | "never" | "consistent")];
// ----- style/function-call-spacing -----
type StyleFunctionCallSpacing = ([] | ["never"] | [] | ["always"] | ["always", {
  allowNewlines?: boolean;
  optionalChain?: {
    before?: boolean;
    after?: boolean;
  };
}]);
// ----- style/function-paren-newline -----
type StyleFunctionParenNewline = [] | [(("always" | "never" | "consistent" | "multiline" | "multiline-arguments") | {
  minItems?: number;
})];
// ----- style/generator-star-spacing -----
type StyleGeneratorStarSpacing = [] | [(("before" | "after" | "both" | "neither") | {
  before?: boolean;
  after?: boolean;
  named?: (("before" | "after" | "both" | "neither") | {
    before?: boolean;
    after?: boolean;
  });
  anonymous?: (("before" | "after" | "both" | "neither") | {
    before?: boolean;
    after?: boolean;
  });
  method?: (("before" | "after" | "both" | "neither") | {
    before?: boolean;
    after?: boolean;
  });
  shorthand?: (("before" | "after" | "both" | "neither") | {
    before?: boolean;
    after?: boolean;
  });
})];
// ----- style/implicit-arrow-linebreak -----
type StyleImplicitArrowLinebreak = [] | [("beside" | "below")];
// ----- style/indent -----
type StyleIndent = [] | [("tab" | number)] | [("tab" | number), {
  SwitchCase?: number;
  VariableDeclarator?: ((number | ("first" | "off")) | {
    var?: (number | ("first" | "off"));
    let?: (number | ("first" | "off"));
    const?: (number | ("first" | "off"));
    using?: (number | ("first" | "off"));
  });
  assignmentOperator?: (number | "off");
  outerIIFEBody?: (number | "off");
  MemberExpression?: (number | "off");
  FunctionDeclaration?: {
    parameters?: (number | ("first" | "off"));
    body?: number;
    returnType?: number;
  };
  FunctionExpression?: {
    parameters?: (number | ("first" | "off"));
    body?: number;
    returnType?: number;
  };
  StaticBlock?: {
    body?: number;
  };
  CallExpression?: {
    arguments?: (number | ("first" | "off"));
  };
  ArrayExpression?: (number | ("first" | "off"));
  ObjectExpression?: (number | ("first" | "off"));
  ImportDeclaration?: (number | ("first" | "off"));
  flatTernaryExpressions?: boolean;
  offsetTernaryExpressions?: (boolean | {
    CallExpression?: boolean;
    AwaitExpression?: boolean;
    NewExpression?: boolean;
  });
  offsetTernaryExpressionsOffsetCallExpressions?: boolean;
  ignoredNodes?: string[];
  ignoreComments?: boolean;
  tabLength?: number;
}];
// ----- style/indent-binary-ops -----
type StyleIndentBinaryOps = [] | [(number | "tab")];
// ----- style/jsx-closing-bracket-location -----
type StyleJsxClosingBracketLocation = [] | [(("after-props" | "props-aligned" | "tag-aligned" | "line-aligned") | {
  location?: ("after-props" | "props-aligned" | "tag-aligned" | "line-aligned");
} | {
  nonEmpty?: (("after-props" | "props-aligned" | "tag-aligned" | "line-aligned") | false);
  selfClosing?: (("after-props" | "props-aligned" | "tag-aligned" | "line-aligned") | false);
})];
// ----- style/jsx-closing-tag-location -----
type StyleJsxClosingTagLocation = [] | [("tag-aligned" | "line-aligned")];
// ----- style/jsx-curly-brace-presence -----
type StyleJsxCurlyBracePresence = [] | [({
  props?: ("always" | "never" | "ignore");
  children?: ("always" | "never" | "ignore");
  propElementValues?: ("always" | "never" | "ignore");
} | ("always" | "never" | "ignore"))];
// ----- style/jsx-curly-newline -----
type StyleJsxCurlyNewline = [] | [(("consistent" | "never") | {
  singleline?: ("consistent" | "require" | "forbid");
  multiline?: ("consistent" | "require" | "forbid");
})];
// ----- style/jsx-curly-spacing -----
type StyleJsxCurlySpacing = [] | [({
  when?: ("always" | "never");
  allowMultiline?: boolean;
  spacing?: {
    objectLiterals?: ("always" | "never");
  };
  attributes?: ({
    when?: ("always" | "never");
    allowMultiline?: boolean;
    spacing?: {
      objectLiterals?: ("always" | "never");
    };
  } | boolean);
  children?: ({
    when?: ("always" | "never");
    allowMultiline?: boolean;
    spacing?: {
      objectLiterals?: ("always" | "never");
    };
  } | boolean);
} | ("always" | "never"))] | [({
  when?: ("always" | "never");
  allowMultiline?: boolean;
  spacing?: {
    objectLiterals?: ("always" | "never");
  };
  attributes?: ({
    when?: ("always" | "never");
    allowMultiline?: boolean;
    spacing?: {
      objectLiterals?: ("always" | "never");
    };
  } | boolean);
  children?: ({
    when?: ("always" | "never");
    allowMultiline?: boolean;
    spacing?: {
      objectLiterals?: ("always" | "never");
    };
  } | boolean);
} | ("always" | "never")), {
  allowMultiline?: boolean;
  spacing?: {
    objectLiterals?: ("always" | "never");
  };
}];
// ----- style/jsx-equals-spacing -----
type StyleJsxEqualsSpacing = [] | [("always" | "never")];
// ----- style/jsx-first-prop-new-line -----
type StyleJsxFirstPropNewLine = [] | [("always" | "never" | "multiline" | "multiline-multiprop" | "multiprop")];
// ----- style/jsx-function-call-newline -----
type StyleJsxFunctionCallNewline = [] | [("always" | "multiline")];
// ----- style/jsx-indent -----
type StyleJsxIndent = [] | [("tab" | number)] | [("tab" | number), {
  checkAttributes?: boolean;
  indentLogicalExpressions?: boolean;
}];
// ----- style/jsx-indent-props -----
type StyleJsxIndentProps = [] | [(("tab" | "first") | number | {
  indentMode?: (("tab" | "first") | number);
  ignoreTernaryOperator?: boolean;
})];
// ----- style/jsx-max-props-per-line -----
type StyleJsxMaxPropsPerLine = [] | [({
  maximum?: {
    single?: number;
    multi?: number;
  };
} | {
  maximum?: number;
  when?: ("always" | "multiline");
})];
// ----- style/jsx-newline -----
type StyleJsxNewline = [] | [{
  prevent?: boolean;
  allowMultilines?: boolean;
}];
// ----- style/jsx-one-expression-per-line -----
type StyleJsxOneExpressionPerLine = [] | [{
  allow?: ("none" | "literal" | "single-child" | "single-line" | "non-jsx");
}];
// ----- style/jsx-pascal-case -----
type StyleJsxPascalCase = [] | [{
  allowAllCaps?: boolean;
  allowLeadingUnderscore?: boolean;
  allowNamespace?: boolean;
  ignore?: string[];
}];
// ----- style/jsx-quotes -----
type StyleJsxQuotes = [] | [("prefer-single" | "prefer-double")];
// ----- style/jsx-self-closing-comp -----
type StyleJsxSelfClosingComp = [] | [{
  component?: boolean;
  html?: boolean;
}];
// ----- style/jsx-sort-props -----
type StyleJsxSortProps = [] | [{
  callbacksLast?: boolean;
  shorthandFirst?: boolean;
  shorthandLast?: boolean;
  multiline?: ("ignore" | "first" | "last");
  ignoreCase?: boolean;
  noSortAlphabetically?: boolean;
  reservedFirst?: (string[] | boolean);
  reservedLast?: string[];
  locale?: string;
}];
// ----- style/jsx-tag-spacing -----
type StyleJsxTagSpacing = [] | [{
  closingSlash?: ("always" | "never" | "allow");
  beforeSelfClosing?: ("always" | "proportional-always" | "never" | "allow");
  afterOpening?: ("always" | "allow-multiline" | "never" | "allow");
  beforeClosing?: ("always" | "proportional-always" | "never" | "allow");
}];
// ----- style/jsx-wrap-multilines -----
type StyleJsxWrapMultilines = [] | [{
  declaration?: ((true | false | "ignore" | "parens" | "parens-new-line") | (true | false | "ignore" | "parens" | "parens-new-line"));
  assignment?: ((true | false | "ignore" | "parens" | "parens-new-line") | (true | false | "ignore" | "parens" | "parens-new-line"));
  return?: ((true | false | "ignore" | "parens" | "parens-new-line") | (true | false | "ignore" | "parens" | "parens-new-line"));
  arrow?: ((true | false | "ignore" | "parens" | "parens-new-line") | (true | false | "ignore" | "parens" | "parens-new-line"));
  condition?: ((true | false | "ignore" | "parens" | "parens-new-line") | (true | false | "ignore" | "parens" | "parens-new-line"));
  logical?: ((true | false | "ignore" | "parens" | "parens-new-line") | (true | false | "ignore" | "parens" | "parens-new-line"));
  prop?: ((true | false | "ignore" | "parens" | "parens-new-line") | (true | false | "ignore" | "parens" | "parens-new-line"));
  propertyValue?: ((true | false | "ignore" | "parens" | "parens-new-line") | (true | false | "ignore" | "parens" | "parens-new-line"));
}];
// ----- style/key-spacing -----
type StyleKeySpacing = [] | [({
  align?: (("colon" | "value") | {
    mode?: ("strict" | "minimum");
    on?: ("colon" | "value");
    beforeColon?: boolean;
    afterColon?: boolean;
  });
  mode?: ("strict" | "minimum");
  beforeColon?: boolean;
  afterColon?: boolean;
  ignoredNodes?: ("ObjectExpression" | "ObjectPattern" | "ImportDeclaration" | "ExportNamedDeclaration" | "ExportAllDeclaration" | "TSTypeLiteral" | "TSInterfaceBody" | "ClassBody")[];
} | {
  singleLine?: {
    mode?: ("strict" | "minimum");
    beforeColon?: boolean;
    afterColon?: boolean;
  };
  multiLine?: {
    align?: (("colon" | "value") | {
      mode?: ("strict" | "minimum");
      on?: ("colon" | "value");
      beforeColon?: boolean;
      afterColon?: boolean;
    });
    mode?: ("strict" | "minimum");
    beforeColon?: boolean;
    afterColon?: boolean;
  };
} | {
  singleLine?: {
    mode?: ("strict" | "minimum");
    beforeColon?: boolean;
    afterColon?: boolean;
  };
  multiLine?: {
    mode?: ("strict" | "minimum");
    beforeColon?: boolean;
    afterColon?: boolean;
  };
  align?: {
    mode?: ("strict" | "minimum");
    on?: ("colon" | "value");
    beforeColon?: boolean;
    afterColon?: boolean;
  };
})];
// ----- style/keyword-spacing -----
type StyleKeywordSpacing = [] | [{
  before?: boolean;
  after?: boolean;
  overrides?: {
    abstract?: {
      before?: boolean;
      after?: boolean;
    };
    boolean?: {
      before?: boolean;
      after?: boolean;
    };
    break?: {
      before?: boolean;
      after?: boolean;
    };
    byte?: {
      before?: boolean;
      after?: boolean;
    };
    case?: {
      before?: boolean;
      after?: boolean;
    };
    catch?: {
      before?: boolean;
      after?: boolean;
    };
    char?: {
      before?: boolean;
      after?: boolean;
    };
    class?: {
      before?: boolean;
      after?: boolean;
    };
    const?: {
      before?: boolean;
      after?: boolean;
    };
    continue?: {
      before?: boolean;
      after?: boolean;
    };
    debugger?: {
      before?: boolean;
      after?: boolean;
    };
    default?: {
      before?: boolean;
      after?: boolean;
    };
    delete?: {
      before?: boolean;
      after?: boolean;
    };
    do?: {
      before?: boolean;
      after?: boolean;
    };
    double?: {
      before?: boolean;
      after?: boolean;
    };
    else?: {
      before?: boolean;
      after?: boolean;
    };
    enum?: {
      before?: boolean;
      after?: boolean;
    };
    export?: {
      before?: boolean;
      after?: boolean;
    };
    extends?: {
      before?: boolean;
      after?: boolean;
    };
    false?: {
      before?: boolean;
      after?: boolean;
    };
    final?: {
      before?: boolean;
      after?: boolean;
    };
    finally?: {
      before?: boolean;
      after?: boolean;
    };
    float?: {
      before?: boolean;
      after?: boolean;
    };
    for?: {
      before?: boolean;
      after?: boolean;
    };
    function?: {
      before?: boolean;
      after?: boolean;
    };
    goto?: {
      before?: boolean;
      after?: boolean;
    };
    if?: {
      before?: boolean;
      after?: boolean;
    };
    implements?: {
      before?: boolean;
      after?: boolean;
    };
    import?: {
      before?: boolean;
      after?: boolean;
    };
    in?: {
      before?: boolean;
      after?: boolean;
    };
    instanceof?: {
      before?: boolean;
      after?: boolean;
    };
    int?: {
      before?: boolean;
      after?: boolean;
    };
    interface?: {
      before?: boolean;
      after?: boolean;
    };
    long?: {
      before?: boolean;
      after?: boolean;
    };
    native?: {
      before?: boolean;
      after?: boolean;
    };
    new?: {
      before?: boolean;
      after?: boolean;
    };
    null?: {
      before?: boolean;
      after?: boolean;
    };
    package?: {
      before?: boolean;
      after?: boolean;
    };
    private?: {
      before?: boolean;
      after?: boolean;
    };
    protected?: {
      before?: boolean;
      after?: boolean;
    };
    public?: {
      before?: boolean;
      after?: boolean;
    };
    return?: {
      before?: boolean;
      after?: boolean;
    };
    short?: {
      before?: boolean;
      after?: boolean;
    };
    static?: {
      before?: boolean;
      after?: boolean;
    };
    super?: {
      before?: boolean;
      after?: boolean;
    };
    switch?: {
      before?: boolean;
      after?: boolean;
    };
    synchronized?: {
      before?: boolean;
      after?: boolean;
    };
    this?: {
      before?: boolean;
      after?: boolean;
    };
    throw?: {
      before?: boolean;
      after?: boolean;
    };
    throws?: {
      before?: boolean;
      after?: boolean;
    };
    transient?: {
      before?: boolean;
      after?: boolean;
    };
    true?: {
      before?: boolean;
      after?: boolean;
    };
    try?: {
      before?: boolean;
      after?: boolean;
    };
    typeof?: {
      before?: boolean;
      after?: boolean;
    };
    var?: {
      before?: boolean;
      after?: boolean;
    };
    void?: {
      before?: boolean;
      after?: boolean;
    };
    volatile?: {
      before?: boolean;
      after?: boolean;
    };
    while?: {
      before?: boolean;
      after?: boolean;
    };
    with?: {
      before?: boolean;
      after?: boolean;
    };
    arguments?: {
      before?: boolean;
      after?: boolean;
    };
    as?: {
      before?: boolean;
      after?: boolean;
    };
    async?: {
      before?: boolean;
      after?: boolean;
    };
    await?: {
      before?: boolean;
      after?: boolean;
    };
    eval?: {
      before?: boolean;
      after?: boolean;
    };
    from?: {
      before?: boolean;
      after?: boolean;
    };
    get?: {
      before?: boolean;
      after?: boolean;
    };
    let?: {
      before?: boolean;
      after?: boolean;
    };
    of?: {
      before?: boolean;
      after?: boolean;
    };
    set?: {
      before?: boolean;
      after?: boolean;
    };
    type?: {
      before?: boolean;
      after?: boolean;
    };
    using?: {
      before?: boolean;
      after?: boolean;
    };
    yield?: {
      before?: boolean;
      after?: boolean;
    };
    accessor?: {
      before?: boolean;
      after?: boolean;
    };
    satisfies?: {
      before?: boolean;
      after?: boolean;
    };
  };
}];
// ----- style/line-comment-position -----
type StyleLineCommentPosition = [] | [(("above" | "beside") | {
  position?: ("above" | "beside");
  ignorePattern?: string;
  applyDefaultPatterns?: boolean;
  applyDefaultIgnorePatterns?: boolean;
})];
// ----- style/linebreak-style -----
type StyleLinebreakStyle = [] | [("unix" | "windows")];
// ----- style/lines-around-comment -----
type StyleLinesAroundComment = [] | [{
  beforeBlockComment?: boolean;
  afterBlockComment?: boolean;
  beforeLineComment?: boolean;
  afterLineComment?: boolean;
  allowBlockStart?: boolean;
  allowBlockEnd?: boolean;
  allowClassStart?: boolean;
  allowClassEnd?: boolean;
  allowObjectStart?: boolean;
  allowObjectEnd?: boolean;
  allowArrayStart?: boolean;
  allowArrayEnd?: boolean;
  allowInterfaceStart?: boolean;
  allowInterfaceEnd?: boolean;
  allowTypeStart?: boolean;
  allowTypeEnd?: boolean;
  allowEnumStart?: boolean;
  allowEnumEnd?: boolean;
  allowModuleStart?: boolean;
  allowModuleEnd?: boolean;
  ignorePattern?: string;
  applyDefaultIgnorePatterns?: boolean;
  afterHashbangComment?: boolean;
}];
// ----- style/lines-between-class-members -----
type StyleLinesBetweenClassMembers = [] | [({
  enforce: [{
    blankLine: ("always" | "never");
    prev: ("method" | "field" | "*");
    next: ("method" | "field" | "*");
  }, ...({
    blankLine: ("always" | "never");
    prev: ("method" | "field" | "*");
    next: ("method" | "field" | "*");
  })[]];
} | ("always" | "never"))] | [({
  enforce: [{
    blankLine: ("always" | "never");
    prev: ("method" | "field" | "*");
    next: ("method" | "field" | "*");
  }, ...({
    blankLine: ("always" | "never");
    prev: ("method" | "field" | "*");
    next: ("method" | "field" | "*");
  })[]];
} | ("always" | "never")), {
  exceptAfterSingleLine?: boolean;
  exceptAfterOverload?: boolean;
}];
// ----- style/max-len -----
type StyleMaxLen = [] | [({
  code?: number;
  comments?: number;
  tabWidth?: number;
  ignorePattern?: string;
  ignoreComments?: boolean;
  ignoreStrings?: boolean;
  ignoreUrls?: boolean;
  ignoreTemplateLiterals?: boolean;
  ignoreRegExpLiterals?: boolean;
  ignoreTrailingComments?: boolean;
} | number)] | [({
  code?: number;
  comments?: number;
  tabWidth?: number;
  ignorePattern?: string;
  ignoreComments?: boolean;
  ignoreStrings?: boolean;
  ignoreUrls?: boolean;
  ignoreTemplateLiterals?: boolean;
  ignoreRegExpLiterals?: boolean;
  ignoreTrailingComments?: boolean;
} | number), ({
  code?: number;
  comments?: number;
  tabWidth?: number;
  ignorePattern?: string;
  ignoreComments?: boolean;
  ignoreStrings?: boolean;
  ignoreUrls?: boolean;
  ignoreTemplateLiterals?: boolean;
  ignoreRegExpLiterals?: boolean;
  ignoreTrailingComments?: boolean;
} | number)] | [({
  code?: number;
  comments?: number;
  tabWidth?: number;
  ignorePattern?: string;
  ignoreComments?: boolean;
  ignoreStrings?: boolean;
  ignoreUrls?: boolean;
  ignoreTemplateLiterals?: boolean;
  ignoreRegExpLiterals?: boolean;
  ignoreTrailingComments?: boolean;
} | number), ({
  code?: number;
  comments?: number;
  tabWidth?: number;
  ignorePattern?: string;
  ignoreComments?: boolean;
  ignoreStrings?: boolean;
  ignoreUrls?: boolean;
  ignoreTemplateLiterals?: boolean;
  ignoreRegExpLiterals?: boolean;
  ignoreTrailingComments?: boolean;
} | number), {
  code?: number;
  comments?: number;
  tabWidth?: number;
  ignorePattern?: string;
  ignoreComments?: boolean;
  ignoreStrings?: boolean;
  ignoreUrls?: boolean;
  ignoreTemplateLiterals?: boolean;
  ignoreRegExpLiterals?: boolean;
  ignoreTrailingComments?: boolean;
}];
// ----- style/max-statements-per-line -----
type StyleMaxStatementsPerLine = [] | [{
  max?: number;
  ignoredNodes?: ("BreakStatement" | "ClassDeclaration" | "ContinueStatement" | "DebuggerStatement" | "DoWhileStatement" | "ExpressionStatement" | "ForInStatement" | "ForOfStatement" | "ForStatement" | "FunctionDeclaration" | "IfStatement" | "ImportDeclaration" | "LabeledStatement" | "ReturnStatement" | "SwitchStatement" | "ThrowStatement" | "TryStatement" | "VariableDeclaration" | "WhileStatement" | "WithStatement" | "ExportNamedDeclaration" | "ExportDefaultDeclaration" | "ExportAllDeclaration")[];
}];
// ----- style/member-delimiter-style -----
type StyleMemberDelimiterStyle = [] | [{
  multiline?: {
    delimiter?: ("none" | "semi" | "comma");
    requireLast?: boolean;
  };
  singleline?: {
    delimiter?: ("semi" | "comma");
    requireLast?: boolean;
  };
  overrides?: {
    interface?: _StyleMemberDelimiterStyle_DelimiterConfig;
    typeLiteral?: _StyleMemberDelimiterStyle_DelimiterConfig;
  };
  multilineDetection?: ("brackets" | "last-member");
}];
interface _StyleMemberDelimiterStyle_DelimiterConfig {
  multiline?: {
    delimiter?: ("none" | "semi" | "comma");
    requireLast?: boolean;
  };
  singleline?: {
    delimiter?: ("semi" | "comma");
    requireLast?: boolean;
  };
}
// ----- style/multiline-comment-style -----
type StyleMultilineCommentStyle = ([] | [("starred-block" | "bare-block")] | [] | ["separate-lines"] | ["separate-lines", {
  checkJSDoc?: boolean;
  checkExclamation?: boolean;
}]);
// ----- style/multiline-ternary -----
type StyleMultilineTernary = [] | [("always" | "always-multiline" | "never")] | [("always" | "always-multiline" | "never"), {
  ignoreJSX?: boolean;
}];
// ----- style/new-parens -----
type StyleNewParens = [] | [("always" | "never")];
// ----- style/newline-per-chained-call -----
type StyleNewlinePerChainedCall = [] | [{
  ignoreChainWithDepth?: number;
}];
// ----- style/no-confusing-arrow -----
type StyleNoConfusingArrow = [] | [{
  allowParens?: boolean;
  onlyOneSimpleParam?: boolean;
}];
// ----- style/no-extra-parens -----
type StyleNoExtraParens = ([] | ["functions"] | [] | ["all"] | ["all", {
  conditionalAssign?: boolean;
  ternaryOperandBinaryExpressions?: boolean;
  nestedBinaryExpressions?: boolean;
  returnAssign?: boolean;
  ignoreJSX?: ("none" | "all" | "single-line" | "multi-line");
  enforceForArrowConditionals?: boolean;
  enforceForSequenceExpressions?: boolean;
  enforceForNewInMemberExpressions?: boolean;
  enforceForFunctionPrototypeMethods?: boolean;
  allowParensAfterCommentPattern?: string;
  nestedConditionalExpressions?: boolean;
  allowNodesInSpreadElement?: {
    ConditionalExpression?: boolean;
    LogicalExpression?: boolean;
    AwaitExpression?: boolean;
  };
  ignoredNodes?: string[];
}]);
// ----- style/no-mixed-operators -----
type StyleNoMixedOperators = [] | [{
  groups?: [("+" | "-" | "*" | "/" | "%" | "**" | "&" | "|" | "^" | "~" | "<<" | ">>" | ">>>" | "==" | "!=" | "===" | "!==" | ">" | ">=" | "<" | "<=" | "&&" | "||" | "in" | "instanceof" | "?:" | "??"), ("+" | "-" | "*" | "/" | "%" | "**" | "&" | "|" | "^" | "~" | "<<" | ">>" | ">>>" | "==" | "!=" | "===" | "!==" | ">" | ">=" | "<" | "<=" | "&&" | "||" | "in" | "instanceof" | "?:" | "??"), ...(("+" | "-" | "*" | "/" | "%" | "**" | "&" | "|" | "^" | "~" | "<<" | ">>" | ">>>" | "==" | "!=" | "===" | "!==" | ">" | ">=" | "<" | "<=" | "&&" | "||" | "in" | "instanceof" | "?:" | "??"))[]][];
  allowSamePrecedence?: boolean;
}];
// ----- style/no-mixed-spaces-and-tabs -----
type StyleNoMixedSpacesAndTabs = [] | [("smart-tabs" | boolean)];
// ----- style/no-multi-spaces -----
type StyleNoMultiSpaces = [] | [{
  exceptions?: {
    [k: string]: boolean;
  };
  ignoreEOLComments?: boolean;
  includeTabs?: boolean;
}];
// ----- style/no-multiple-empty-lines -----
type StyleNoMultipleEmptyLines = [] | [{
  max: number;
  maxEOF?: number;
  maxBOF?: number;
}];
// ----- style/no-tabs -----
type StyleNoTabs = [] | [{
  allowIndentationTabs?: boolean;
}];
// ----- style/no-trailing-spaces -----
type StyleNoTrailingSpaces = [] | [{
  skipBlankLines?: boolean;
  ignoreComments?: boolean;
}];
// ----- style/nonblock-statement-body-position -----
type StyleNonblockStatementBodyPosition = [] | [("beside" | "below" | "any")] | [("beside" | "below" | "any"), {
  overrides?: {
    if?: ("beside" | "below" | "any");
    else?: ("beside" | "below" | "any");
    while?: ("beside" | "below" | "any");
    do?: ("beside" | "below" | "any");
    for?: ("beside" | "below" | "any");
  };
}];
// ----- style/object-curly-newline -----
type StyleObjectCurlyNewline = [] | [((("always" | "never") | {
  multiline?: boolean;
  minProperties?: number;
  consistent?: boolean;
}) | {
  ObjectExpression?: (("always" | "never") | {
    multiline?: boolean;
    minProperties?: number;
    consistent?: boolean;
  });
  ObjectPattern?: (("always" | "never") | {
    multiline?: boolean;
    minProperties?: number;
    consistent?: boolean;
  });
  ImportDeclaration?: (("always" | "never") | {
    multiline?: boolean;
    minProperties?: number;
    consistent?: boolean;
  });
  ExportDeclaration?: (("always" | "never") | {
    multiline?: boolean;
    minProperties?: number;
    consistent?: boolean;
  });
  TSTypeLiteral?: (("always" | "never") | {
    multiline?: boolean;
    minProperties?: number;
    consistent?: boolean;
  });
  TSInterfaceBody?: (("always" | "never") | {
    multiline?: boolean;
    minProperties?: number;
    consistent?: boolean;
  });
  TSEnumBody?: (("always" | "never") | {
    multiline?: boolean;
    minProperties?: number;
    consistent?: boolean;
  });
})];
// ----- style/object-curly-spacing -----
type StyleObjectCurlySpacing = [] | [("always" | "never")] | [("always" | "never"), {
  arraysInObjects?: boolean;
  objectsInObjects?: boolean;
  overrides?: {
    ObjectPattern?: ("always" | "never");
    ObjectExpression?: ("always" | "never");
    ImportDeclaration?: ("always" | "never");
    ImportAttributes?: ("always" | "never");
    ExportNamedDeclaration?: ("always" | "never");
    ExportAllDeclaration?: ("always" | "never");
    TSMappedType?: ("always" | "never");
    TSTypeLiteral?: ("always" | "never");
    TSInterfaceBody?: ("always" | "never");
    TSEnumBody?: ("always" | "never");
  };
  emptyObjects?: ("ignore" | "always" | "never");
}];
// ----- style/object-property-newline -----
type StyleObjectPropertyNewline = [] | [{
  allowAllPropertiesOnSameLine?: boolean;
}];
// ----- style/one-var-declaration-per-line -----
type StyleOneVarDeclarationPerLine = [] | [("always" | "initializations")];
// ----- style/operator-linebreak -----
type StyleOperatorLinebreak = [] | [(("after" | "before" | "none") | null)] | [(("after" | "before" | "none") | null), {
  overrides?: {
    [k: string]: ("after" | "before" | "none" | "ignore") | undefined;
  };
}];
// ----- style/padded-blocks -----
type StylePaddedBlocks = [] | [(("always" | "never" | "start" | "end") | {
  blocks?: ("always" | "never" | "start" | "end");
  switches?: ("always" | "never" | "start" | "end");
  classes?: ("always" | "never" | "start" | "end");
})] | [(("always" | "never" | "start" | "end") | {
  blocks?: ("always" | "never" | "start" | "end");
  switches?: ("always" | "never" | "start" | "end");
  classes?: ("always" | "never" | "start" | "end");
}), {
  allowSingleLineBlocks?: boolean;
}];
// ----- style/padding-line-between-statements -----
type _StylePaddingLineBetweenStatementsPaddingType = ("any" | "never" | "always");
type _StylePaddingLineBetweenStatementsStatementOption = (_StylePaddingLineBetweenStatementsStatementType | [_StylePaddingLineBetweenStatementsStatementType, ...(_StylePaddingLineBetweenStatementsStatementType)[]]);
type _StylePaddingLineBetweenStatementsStatementType = ("*" | "exports" | "require" | "directive" | "iife" | "block" | "empty" | "function" | "ts-method" | "break" | "case" | "class" | "continue" | "debugger" | "default" | "do" | "for" | "if" | "import" | "switch" | "throw" | "try" | "while" | "with" | "cjs-export" | "cjs-import" | "enum" | "interface" | "function-overload" | "block-like" | "singleline-block-like" | "multiline-block-like" | "expression" | "singleline-expression" | "multiline-expression" | "return" | "singleline-return" | "multiline-return" | "export" | "singleline-export" | "multiline-export" | "var" | "singleline-var" | "multiline-var" | "let" | "singleline-let" | "multiline-let" | "const" | "singleline-const" | "multiline-const" | "using" | "singleline-using" | "multiline-using" | "type" | "singleline-type" | "multiline-type");
type StylePaddingLineBetweenStatements = {
  blankLine: _StylePaddingLineBetweenStatementsPaddingType;
  prev: _StylePaddingLineBetweenStatementsStatementOption;
  next: _StylePaddingLineBetweenStatementsStatementOption;
}[];
// ----- style/quote-props -----
type StyleQuoteProps = ([] | [("always" | "as-needed" | "consistent" | "consistent-as-needed")] | [] | [("always" | "as-needed" | "consistent" | "consistent-as-needed")] | [("always" | "as-needed" | "consistent" | "consistent-as-needed"), {
  keywords?: boolean;
  unnecessary?: boolean;
  numbers?: boolean;
}]);
// ----- style/quotes -----
type StyleQuotes = [] | [("single" | "double" | "backtick")] | [("single" | "double" | "backtick"), ("avoid-escape" | {
  avoidEscape?: boolean;
  allowTemplateLiterals?: (boolean | ("never" | "avoidEscape" | "always"));
  ignoreStringLiterals?: boolean;
})];
// ----- style/rest-spread-spacing -----
type StyleRestSpreadSpacing = [] | [("always" | "never")];
// ----- style/semi -----
type StyleSemi = ([] | ["never"] | ["never", {
  beforeStatementContinuationChars?: ("always" | "any" | "never");
}] | [] | ["always"] | ["always", {
  omitLastInOneLineBlock?: boolean;
  omitLastInOneLineClassBody?: boolean;
}]);
// ----- style/semi-spacing -----
type StyleSemiSpacing = [] | [{
  before?: boolean;
  after?: boolean;
}];
// ----- style/semi-style -----
type StyleSemiStyle = [] | [("last" | "first")];
// ----- style/space-before-blocks -----
type StyleSpaceBeforeBlocks = [] | [(("always" | "never") | {
  keywords?: ("always" | "never" | "off");
  functions?: ("always" | "never" | "off");
  classes?: ("always" | "never" | "off");
  modules?: ("always" | "never" | "off");
})];
// ----- style/space-before-function-paren -----
type StyleSpaceBeforeFunctionParen = [] | [(("always" | "never") | {
  anonymous?: ("always" | "never" | "ignore");
  named?: ("always" | "never" | "ignore");
  asyncArrow?: ("always" | "never" | "ignore");
  catch?: ("always" | "never" | "ignore");
})];
// ----- style/space-in-parens -----
type StyleSpaceInParens = [] | [("always" | "never")] | [("always" | "never"), {
  exceptions?: ("{}" | "[]" | "()" | "empty")[];
}];
// ----- style/space-infix-ops -----
type StyleSpaceInfixOps = [] | [{
  int32Hint?: boolean;
  ignoreTypes?: boolean;
}];
// ----- style/space-unary-ops -----
type StyleSpaceUnaryOps = [] | [{
  words?: boolean;
  nonwords?: boolean;
  overrides?: {
    [k: string]: boolean | undefined;
  };
}];
// ----- style/spaced-comment -----
type StyleSpacedComment = [] | [("always" | "never")] | [("always" | "never"), {
  exceptions?: string[];
  markers?: string[];
  line?: {
    exceptions?: string[];
    markers?: string[];
  };
  block?: {
    exceptions?: string[];
    markers?: string[];
    balanced?: boolean;
  };
}];
// ----- style/switch-colon-spacing -----
type StyleSwitchColonSpacing = [] | [{
  before?: boolean;
  after?: boolean;
}];
// ----- style/template-curly-spacing -----
type StyleTemplateCurlySpacing = [] | [("always" | "never")];
// ----- style/template-tag-spacing -----
type StyleTemplateTagSpacing = [] | [("always" | "never")];
// ----- style/type-annotation-spacing -----
type StyleTypeAnnotationSpacing = [] | [{
  before?: boolean;
  after?: boolean;
  overrides?: {
    colon?: _StyleTypeAnnotationSpacing_SpacingConfig;
    arrow?: _StyleTypeAnnotationSpacing_SpacingConfig;
    variable?: _StyleTypeAnnotationSpacing_SpacingConfig;
    parameter?: _StyleTypeAnnotationSpacing_SpacingConfig;
    property?: _StyleTypeAnnotationSpacing_SpacingConfig;
    returnType?: _StyleTypeAnnotationSpacing_SpacingConfig;
  };
}];
interface _StyleTypeAnnotationSpacing_SpacingConfig {
  before?: boolean;
  after?: boolean;
}
// ----- style/wrap-iife -----
type StyleWrapIife = [] | [("outside" | "inside" | "any")] | [("outside" | "inside" | "any"), {
  functionPrototypeMethods?: boolean;
}];
// ----- style/yield-star-spacing -----
type StyleYieldStarSpacing = [] | [(("before" | "after" | "both" | "neither") | {
  before?: boolean;
  after?: boolean;
})];
// ----- svelte/@typescript-eslint/no-unnecessary-condition -----
type SvelteTypescriptEslintNoUnnecessaryCondition = [] | [{
  allowConstantLoopConditions?: boolean;
  allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing?: boolean;
}];
// ----- svelte/block-lang -----
type SvelteBlockLang = [] | [{
  enforceScriptPresent?: boolean;
  enforceStylePresent?: boolean;
  script?: ((string | null) | [(string | null), ...((string | null))[]]);
  style?: ((string | null) | [(string | null), ...((string | null))[]]);
}];
// ----- svelte/button-has-type -----
type SvelteButtonHasType = [] | [{
  button?: boolean;
  submit?: boolean;
  reset?: boolean;
}];
// ----- svelte/comment-directive -----
type SvelteCommentDirective = [] | [{
  reportUnusedDisableDirectives?: boolean;
}];
// ----- svelte/consistent-selector-style -----
type SvelteConsistentSelectorStyle = [] | [{
  checkGlobal?: boolean;
  style?: [] | [("class" | "id" | "type")] | [("class" | "id" | "type"), ("class" | "id" | "type")] | [("class" | "id" | "type"), ("class" | "id" | "type"), ("class" | "id" | "type")];
}];
// ----- svelte/first-attribute-linebreak -----
type SvelteFirstAttributeLinebreak = [] | [{
  multiline?: ("below" | "beside");
  singleline?: ("below" | "beside");
}];
// ----- svelte/html-closing-bracket-new-line -----
type SvelteHtmlClosingBracketNewLine = [] | [{
  singleline?: ("always" | "never");
  multiline?: ("always" | "never");
  selfClosingTag?: {
    singleline?: ("always" | "never");
    multiline?: ("always" | "never");
  };
}];
// ----- svelte/html-closing-bracket-spacing -----
type SvelteHtmlClosingBracketSpacing = [] | [{
  startTag?: ("always" | "never" | "ignore");
  endTag?: ("always" | "never" | "ignore");
  selfClosingTag?: ("always" | "never" | "ignore");
}];
// ----- svelte/html-quotes -----
type SvelteHtmlQuotes = [] | [{
  prefer?: ("double" | "single");
  dynamic?: {
    quoted?: boolean;
    avoidInvalidUnquotedInHTML?: boolean;
  };
}];
// ----- svelte/html-self-closing -----
type SvelteHtmlSelfClosing = [] | [({
  void?: ("never" | "always" | "ignore");
  normal?: ("never" | "always" | "ignore");
  svg?: ("never" | "always" | "ignore");
  math?: ("never" | "always" | "ignore");
  component?: ("never" | "always" | "ignore");
  svelte?: ("never" | "always" | "ignore");
} | ("all" | "html" | "none"))];
// ----- svelte/indent -----
type SvelteIndent = [] | [{
  indent?: (number | "tab");
  indentScript?: boolean;
  switchCase?: number;
  alignAttributesVertically?: boolean;
  ignoredNodes?: (string & {
    [k: string]: unknown | undefined;
  } & {
    [k: string]: unknown | undefined;
  })[];
}];
// ----- svelte/max-attributes-per-line -----
type SvelteMaxAttributesPerLine = [] | [{
  multiline?: number;
  singleline?: number;
}];
// ----- svelte/mustache-spacing -----
type SvelteMustacheSpacing = [] | [{
  textExpressions?: ("never" | "always");
  attributesAndProps?: ("never" | "always");
  directiveExpressions?: ("never" | "always");
  tags?: {
    openingBrace?: ("never" | "always");
    closingBrace?: ("never" | "always" | "always-after-expression");
  };
}];
// ----- svelte/no-inline-styles -----
type SvelteNoInlineStyles = [] | [{
  allowTransitions?: boolean;
}];
// ----- svelte/no-inner-declarations -----
type SvelteNoInnerDeclarations = [] | [("functions" | "both")] | [("functions" | "both"), {
  blockScopedFunctions?: ("allow" | "disallow");
}];
// ----- svelte/no-navigation-without-base -----
type SvelteNoNavigationWithoutBase = [] | [{
  ignoreGoto?: boolean;
  ignoreLinks?: boolean;
  ignorePushState?: boolean;
  ignoreReplaceState?: boolean;
}];
// ----- svelte/no-navigation-without-resolve -----
type SvelteNoNavigationWithoutResolve = [] | [{
  ignoreGoto?: boolean;
  ignoreLinks?: boolean;
  ignorePushState?: boolean;
  ignoreReplaceState?: boolean;
}];
// ----- svelte/no-reactive-reassign -----
type SvelteNoReactiveReassign = [] | [{
  props?: boolean;
}];
// ----- svelte/no-restricted-html-elements -----
type SvelteNoRestrictedHtmlElements = [(string | {
  elements?: [string, ...(string)[]];
  message?: string;
}), ...((string | {
  elements?: [string, ...(string)[]];
  message?: string;
}))[]];
// ----- svelte/no-target-blank -----
type SvelteNoTargetBlank = [] | [{
  allowReferrer?: boolean;
  enforceDynamicLinks?: ("always" | "never");
}];
// ----- svelte/no-trailing-spaces -----
type SvelteNoTrailingSpaces = [] | [{
  skipBlankLines?: boolean;
  ignoreComments?: boolean;
}];
// ----- svelte/no-unknown-style-directive-property -----
type SvelteNoUnknownStyleDirectiveProperty = [] | [{
  ignoreProperties?: [string, ...(string)[]];
  ignorePrefixed?: boolean;
}];
// ----- svelte/no-unnecessary-state-wrap -----
type SvelteNoUnnecessaryStateWrap = [] | [{
  additionalReactiveClasses?: string[];
  allowReassign?: boolean;
}];
// ----- svelte/no-unused-class-name -----
type SvelteNoUnusedClassName = [] | [{
  allowedClassNames?: string[];
}];
// ----- svelte/no-unused-props -----
type SvelteNoUnusedProps = [] | [{
  checkImportedTypes?: boolean;
  ignoreTypePatterns?: string[];
  ignorePropertyPatterns?: string[];
  allowUnusedNestedProperties?: boolean;
}];
// ----- svelte/no-useless-mustaches -----
type SvelteNoUselessMustaches = [] | [{
  ignoreIncludesComment?: boolean;
  ignoreStringEscape?: boolean;
}];
// ----- svelte/prefer-class-directive -----
type SveltePreferClassDirective = [] | [{
  prefer?: ("always" | "empty");
}];
// ----- svelte/prefer-const -----
type SveltePreferConst = [] | [{
  destructuring?: ("any" | "all");
  ignoreReadBeforeAssign?: boolean;
  excludedRunes?: string[];
  [k: string]: unknown | undefined;
}];
// ----- svelte/require-event-prefix -----
type SvelteRequireEventPrefix = [] | [{
  checkAsyncFunctions?: boolean;
}];
// ----- svelte/shorthand-attribute -----
type SvelteShorthandAttribute = [] | [{
  prefer?: ("always" | "never");
}];
// ----- svelte/shorthand-directive -----
type SvelteShorthandDirective = [] | [{
  prefer?: ("always" | "never");
}];
// ----- svelte/sort-attributes -----
type SvelteSortAttributes = [] | [{
  order?: (string | [string, ...(string)[]] | {
    match: (string | [string, ...(string)[]]);
    sort: ("alphabetical" | "ignore");
  })[];
  alphabetical?: boolean;
}];
// ----- svelte/spaced-html-comment -----
type SvelteSpacedHtmlComment = [] | [("always" | "never")];
// ----- svelte/valid-compile -----
type SvelteValidCompile = [] | [{
  ignoreWarnings?: boolean;
}];
// ----- switch-colon-spacing -----
type SwitchColonSpacing = [] | [{
  before?: boolean;
  after?: boolean;
}];
// ----- template-curly-spacing -----
type TemplateCurlySpacing = [] | [("always" | "never")];
// ----- template-tag-spacing -----
type TemplateTagSpacing = [] | [("always" | "never")];
// ----- test/consistent-each-for -----
type TestConsistentEachFor = [] | [{
  test?: ("each" | "for");
  it?: ("each" | "for");
  describe?: ("each" | "for");
  suite?: ("each" | "for");
}];
// ----- test/consistent-test-filename -----
type TestConsistentTestFilename = [] | [{
  pattern?: string;
  allTestPattern?: string;
}];
// ----- test/consistent-test-it -----
type TestConsistentTestIt = [] | [{
  fn?: ("test" | "it");
  withinDescribe?: ("test" | "it");
}];
// ----- test/consistent-vitest-vi -----
type TestConsistentVitestVi = [] | [{
  fn?: ("vi" | "vitest");
}];
// ----- test/expect-expect -----
type TestExpectExpect = [] | [{
  assertFunctionNames?: string[];
  additionalTestBlockFunctions?: string[];
}];
// ----- test/max-expects -----
type TestMaxExpects = [] | [{
  max?: number;
}];
// ----- test/max-nested-describe -----
type TestMaxNestedDescribe = [] | [{
  max?: number;
}];
// ----- test/no-focused-tests -----
type TestNoFocusedTests = [] | [{
  fixable?: boolean;
}];
// ----- test/no-hooks -----
type TestNoHooks = [] | [{
  allow?: ("beforeAll" | "beforeEach" | "afterAll" | "afterEach")[];
}];
// ----- test/no-large-snapshots -----
type TestNoLargeSnapshots = [] | [{
  maxSize?: number;
  inlineMaxSize?: number;
  allowedSnapshots?: {
    [k: string]: unknown[] | undefined;
  };
}];
// ----- test/no-only-tests -----
type TestNoOnlyTests = [] | [{
  block?: string[];
  focus?: string[];
  functions?: string[];
  fix?: boolean;
}];
// ----- test/no-restricted-matchers -----
type TestNoRestrictedMatchers = [] | [{
  [k: string]: (string | null) | undefined;
}];
// ----- test/no-restricted-vi-methods -----
type TestNoRestrictedViMethods = [] | [{
  [k: string]: (string | null) | undefined;
}];
// ----- test/no-standalone-expect -----
type TestNoStandaloneExpect = [] | [{
  additionalTestBlockFunctions?: string[];
}];
// ----- test/prefer-expect-assertions -----
type TestPreferExpectAssertions = [] | [{
  onlyFunctionsWithAsyncKeyword?: boolean;
  onlyFunctionsWithExpectInLoop?: boolean;
  onlyFunctionsWithExpectInCallback?: boolean;
}];
// ----- test/prefer-lowercase-title -----
type TestPreferLowercaseTitle = [] | [{
  ignore?: ("describe" | "test" | "it")[];
  allowedPrefixes?: string[];
  ignoreTopLevelDescribe?: boolean;
  lowercaseFirstCharacterOnly?: boolean;
}];
// ----- test/prefer-snapshot-hint -----
type TestPreferSnapshotHint = [] | [("always" | "multi")];
// ----- test/require-hook -----
type TestRequireHook = [] | [{
  allowedFunctionCalls?: string[];
}];
// ----- test/require-mock-type-parameters -----
type TestRequireMockTypeParameters = [] | [{
  checkImportFunctions?: boolean;
}];
// ----- test/require-top-level-describe -----
type TestRequireTopLevelDescribe = [] | [{
  maxNumberOfTopLevelDescribes?: number;
}];
// ----- test/valid-expect -----
type TestValidExpect = [] | [{
  alwaysAwait?: boolean;
  asyncMatchers?: string[];
  minArgs?: number;
  maxArgs?: number;
}];
// ----- test/valid-title -----
type TestValidTitle = [] | [{
  ignoreTypeOfDescribeName?: boolean;
  allowArguments?: boolean;
  disallowedWords?: string[];
  [k: string]: (string | [string] | [string, string] | {
    [k: string]: (string | [string] | [string, string]) | undefined;
  });
}];
// ----- toml/array-bracket-newline -----
type TomlArrayBracketNewline = [] | [(("always" | "never" | "consistent") | {
  multiline?: boolean;
  minItems?: (number | null);
})];
// ----- toml/array-bracket-spacing -----
type TomlArrayBracketSpacing = [] | [("always" | "never")] | [("always" | "never"), {
  singleValue?: boolean;
  objectsInArrays?: boolean;
  arraysInArrays?: boolean;
}];
// ----- toml/array-element-newline -----
type TomlArrayElementNewline = [] | [(_TomlArrayElementNewlineBasicConfig | {
  ArrayExpression?: _TomlArrayElementNewlineBasicConfig;
  ArrayPattern?: _TomlArrayElementNewlineBasicConfig;
  TOMLArray?: _TomlArrayElementNewlineBasicConfig;
})];
type _TomlArrayElementNewlineBasicConfig = (("always" | "never" | "consistent") | {
  multiline?: boolean;
  minItems?: (number | null);
});
// ----- toml/comma-style -----
type TomlCommaStyle = [] | [("first" | "last")] | [("first" | "last"), {
  exceptions?: {
    [k: string]: boolean | undefined;
  };
}];
// ----- toml/indent -----
type TomlIndent = [] | [("tab" | number)] | [("tab" | number), {
  subTables?: number;
  keyValuePairs?: number;
}];
// ----- toml/inline-table-curly-spacing -----
type TomlInlineTableCurlySpacing = [] | [("always" | "never")] | [("always" | "never"), {
  arraysInObjects?: boolean;
  objectsInObjects?: boolean;
}];
// ----- toml/key-spacing -----
type TomlKeySpacing = [] | [({
  align?: (("equal" | "value") | {
    on?: ("equal" | "value");
    mode?: ("strict" | "minimum");
    beforeEqual?: boolean;
    afterEqual?: boolean;
  });
  mode?: ("strict" | "minimum");
  beforeEqual?: boolean;
  afterEqual?: boolean;
} | {
  singleLine?: {
    mode?: ("strict" | "minimum");
    beforeEqual?: boolean;
    afterEqual?: boolean;
  };
  multiLine?: {
    align?: (("equal" | "value") | {
      on?: ("equal" | "value");
      mode?: ("strict" | "minimum");
      beforeEqual?: boolean;
      afterEqual?: boolean;
    });
    mode?: ("strict" | "minimum");
    beforeEqual?: boolean;
    afterEqual?: boolean;
  };
} | {
  singleLine?: {
    mode?: ("strict" | "minimum");
    beforeEqual?: boolean;
    afterEqual?: boolean;
  };
  multiLine?: {
    mode?: ("strict" | "minimum");
    beforeEqual?: boolean;
    afterEqual?: boolean;
  };
  align?: {
    on?: ("equal" | "value");
    mode?: ("strict" | "minimum");
    beforeEqual?: boolean;
    afterEqual?: boolean;
  };
})];
// ----- toml/no-mixed-type-in-array -----
type TomlNoMixedTypeInArray = [] | [{
  typeMap?: {
    string?: string;
    boolean?: string;
    integer?: string;
    float?: string;
    offsetDateTime?: string;
    localDateTime?: string;
    localDate?: string;
    localTime?: string;
    array?: string;
    inlineTable?: string;
  };
}];
// ----- toml/no-non-decimal-integer -----
type TomlNoNonDecimalInteger = [] | [{
  allowHexadecimal?: boolean;
  allowOctal?: boolean;
  allowBinary?: boolean;
}];
// ----- toml/precision-of-fractional-seconds -----
type TomlPrecisionOfFractionalSeconds = [] | [{
  max?: number;
}];
// ----- toml/precision-of-integer -----
type TomlPrecisionOfInteger = [] | [{
  maxBit?: number;
}];
// ----- toml/quoted-keys -----
type TomlQuotedKeys = [] | [{
  prefer?: ("as-needed" | "always");
  numbers?: boolean;
}];
// ----- toml/spaced-comment -----
type TomlSpacedComment = [] | [("always" | "never")] | [("always" | "never"), {
  exceptions?: string[];
  markers?: string[];
}];
// ----- toml/table-bracket-spacing -----
type TomlTableBracketSpacing = [] | [("always" | "never")];
// ----- ts/array-type -----
type TsArrayType = [] | [{
  default?: ("array" | "generic" | "array-simple");
  readonly?: ("array" | "generic" | "array-simple");
}];
// ----- ts/ban-ts-comment -----
type TsBanTsComment = [] | [{
  minimumDescriptionLength?: number;
  "ts-check"?: (boolean | "allow-with-description" | {
    descriptionFormat?: string;
  });
  "ts-expect-error"?: (boolean | "allow-with-description" | {
    descriptionFormat?: string;
  });
  "ts-ignore"?: (boolean | "allow-with-description" | {
    descriptionFormat?: string;
  });
  "ts-nocheck"?: (boolean | "allow-with-description" | {
    descriptionFormat?: string;
  });
}];
// ----- ts/class-literal-property-style -----
type TsClassLiteralPropertyStyle = [] | [("fields" | "getters")];
// ----- ts/class-methods-use-this -----
type TsClassMethodsUseThis = [] | [{
  enforceForClassFields?: boolean;
  exceptMethods?: string[];
  ignoreClassesThatImplementAnInterface?: (boolean | "public-fields");
  ignoreOverrideMethods?: boolean;
}];
// ----- ts/consistent-generic-constructors -----
type TsConsistentGenericConstructors = [] | [("type-annotation" | "constructor")];
// ----- ts/consistent-indexed-object-style -----
type TsConsistentIndexedObjectStyle = [] | [("record" | "index-signature")];
// ----- ts/consistent-return -----
type TsConsistentReturn = [] | [{
  treatUndefinedAsUnspecified?: boolean;
}];
// ----- ts/consistent-type-assertions -----
type TsConsistentTypeAssertions = [] | [({
  assertionStyle: "never";
} | {
  arrayLiteralTypeAssertions?: ("allow" | "allow-as-parameter" | "never");
  assertionStyle?: ("as" | "angle-bracket");
  objectLiteralTypeAssertions?: ("allow" | "allow-as-parameter" | "never");
})];
// ----- ts/consistent-type-definitions -----
type TsConsistentTypeDefinitions = [] | [("interface" | "type")];
// ----- ts/consistent-type-exports -----
type TsConsistentTypeExports = [] | [{
  fixMixedExportsWithInlineTypeSpecifier?: boolean;
}];
// ----- ts/consistent-type-imports -----
type TsConsistentTypeImports = [] | [{
  disallowTypeAnnotations?: boolean;
  fixStyle?: ("separate-type-imports" | "inline-type-imports");
  prefer?: ("type-imports" | "no-type-imports");
}];
// ----- ts/dot-notation -----
type TsDotNotation = [] | [{
  allowIndexSignaturePropertyAccess?: boolean;
  allowKeywords?: boolean;
  allowPattern?: string;
  allowPrivateClassPropertyAccess?: boolean;
  allowProtectedClassPropertyAccess?: boolean;
}];
// ----- ts/explicit-function-return-type -----
type TsExplicitFunctionReturnType = [] | [{
  allowConciseArrowFunctionExpressionsStartingWithVoid?: boolean;
  allowDirectConstAssertionInArrowFunctions?: boolean;
  allowedNames?: string[];
  allowExpressions?: boolean;
  allowFunctionsWithoutTypeParameters?: boolean;
  allowHigherOrderFunctions?: boolean;
  allowIIFEs?: boolean;
  allowTypedFunctionExpressions?: boolean;
}];
// ----- ts/explicit-member-accessibility -----
type TsExplicitMemberAccessibility = [] | [{
  accessibility?: ("explicit" | "no-public" | "off");
  ignoredMethodNames?: string[];
  overrides?: {
    accessors?: ("explicit" | "no-public" | "off");
    constructors?: ("explicit" | "no-public" | "off");
    methods?: ("explicit" | "no-public" | "off");
    parameterProperties?: ("explicit" | "no-public" | "off");
    properties?: ("explicit" | "no-public" | "off");
  };
}];
// ----- ts/explicit-module-boundary-types -----
type TsExplicitModuleBoundaryTypes = [] | [{
  allowArgumentsExplicitlyTypedAsAny?: boolean;
  allowDirectConstAssertionInArrowFunctions?: boolean;
  allowedNames?: string[];
  allowHigherOrderFunctions?: boolean;
  allowOverloadFunctions?: boolean;
  allowTypedFunctionExpressions?: boolean;
}];
// ----- ts/init-declarations -----
type TsInitDeclarations = ([] | ["always"] | [] | ["never"] | ["never", {
  ignoreForLoopInit?: boolean;
}]);
// ----- ts/max-params -----
type TsMaxParams = [] | [{
  countVoidThis?: boolean;
  max?: number;
  maximum?: number;
}];
// ----- ts/member-ordering -----
type TsMemberOrdering = [] | [{
  classes?: ("never" | (("readonly-signature" | "signature" | "readonly-field" | "public-readonly-field" | "public-decorated-readonly-field" | "decorated-readonly-field" | "static-readonly-field" | "public-static-readonly-field" | "instance-readonly-field" | "public-instance-readonly-field" | "abstract-readonly-field" | "public-abstract-readonly-field" | "protected-readonly-field" | "protected-decorated-readonly-field" | "protected-static-readonly-field" | "protected-instance-readonly-field" | "protected-abstract-readonly-field" | "private-readonly-field" | "private-decorated-readonly-field" | "private-static-readonly-field" | "private-instance-readonly-field" | "#private-readonly-field" | "#private-static-readonly-field" | "#private-instance-readonly-field" | "field" | "public-field" | "public-decorated-field" | "decorated-field" | "static-field" | "public-static-field" | "instance-field" | "public-instance-field" | "abstract-field" | "public-abstract-field" | "protected-field" | "protected-decorated-field" | "protected-static-field" | "protected-instance-field" | "protected-abstract-field" | "private-field" | "private-decorated-field" | "private-static-field" | "private-instance-field" | "#private-field" | "#private-static-field" | "#private-instance-field" | "method" | "public-method" | "public-decorated-method" | "decorated-method" | "static-method" | "public-static-method" | "instance-method" | "public-instance-method" | "abstract-method" | "public-abstract-method" | "protected-method" | "protected-decorated-method" | "protected-static-method" | "protected-instance-method" | "protected-abstract-method" | "private-method" | "private-decorated-method" | "private-static-method" | "private-instance-method" | "#private-method" | "#private-static-method" | "#private-instance-method" | "call-signature" | "constructor" | "public-constructor" | "protected-constructor" | "private-constructor" | "accessor" | "public-accessor" | "public-decorated-accessor" | "decorated-accessor" | "static-accessor" | "public-static-accessor" | "instance-accessor" | "public-instance-accessor" | "abstract-accessor" | "public-abstract-accessor" | "protected-accessor" | "protected-decorated-accessor" | "protected-static-accessor" | "protected-instance-accessor" | "protected-abstract-accessor" | "private-accessor" | "private-decorated-accessor" | "private-static-accessor" | "private-instance-accessor" | "#private-accessor" | "#private-static-accessor" | "#private-instance-accessor" | "get" | "public-get" | "public-decorated-get" | "decorated-get" | "static-get" | "public-static-get" | "instance-get" | "public-instance-get" | "abstract-get" | "public-abstract-get" | "protected-get" | "protected-decorated-get" | "protected-static-get" | "protected-instance-get" | "protected-abstract-get" | "private-get" | "private-decorated-get" | "private-static-get" | "private-instance-get" | "#private-get" | "#private-static-get" | "#private-instance-get" | "set" | "public-set" | "public-decorated-set" | "decorated-set" | "static-set" | "public-static-set" | "instance-set" | "public-instance-set" | "abstract-set" | "public-abstract-set" | "protected-set" | "protected-decorated-set" | "protected-static-set" | "protected-instance-set" | "protected-abstract-set" | "private-set" | "private-decorated-set" | "private-static-set" | "private-instance-set" | "#private-set" | "#private-static-set" | "#private-instance-set" | "static-initialization" | "static-static-initialization" | "public-static-static-initialization" | "instance-static-initialization" | "public-instance-static-initialization" | "abstract-static-initialization" | "public-abstract-static-initialization" | "protected-static-static-initialization" | "protected-instance-static-initialization" | "protected-abstract-static-initialization" | "private-static-static-initialization" | "private-instance-static-initialization" | "#private-static-static-initialization" | "#private-instance-static-initialization") | ("readonly-signature" | "signature" | "readonly-field" | "public-readonly-field" | "public-decorated-readonly-field" | "decorated-readonly-field" | "static-readonly-field" | "public-static-readonly-field" | "instance-readonly-field" | "public-instance-readonly-field" | "abstract-readonly-field" | "public-abstract-readonly-field" | "protected-readonly-field" | "protected-decorated-readonly-field" | "protected-static-readonly-field" | "protected-instance-readonly-field" | "protected-abstract-readonly-field" | "private-readonly-field" | "private-decorated-readonly-field" | "private-static-readonly-field" | "private-instance-readonly-field" | "#private-readonly-field" | "#private-static-readonly-field" | "#private-instance-readonly-field" | "field" | "public-field" | "public-decorated-field" | "decorated-field" | "static-field" | "public-static-field" | "instance-field" | "public-instance-field" | "abstract-field" | "public-abstract-field" | "protected-field" | "protected-decorated-field" | "protected-static-field" | "protected-instance-field" | "protected-abstract-field" | "private-field" | "private-decorated-field" | "private-static-field" | "private-instance-field" | "#private-field" | "#private-static-field" | "#private-instance-field" | "method" | "public-method" | "public-decorated-method" | "decorated-method" | "static-method" | "public-static-method" | "instance-method" | "public-instance-method" | "abstract-method" | "public-abstract-method" | "protected-method" | "protected-decorated-method" | "protected-static-method" | "protected-instance-method" | "protected-abstract-method" | "private-method" | "private-decorated-method" | "private-static-method" | "private-instance-method" | "#private-method" | "#private-static-method" | "#private-instance-method" | "call-signature" | "constructor" | "public-constructor" | "protected-constructor" | "private-constructor" | "accessor" | "public-accessor" | "public-decorated-accessor" | "decorated-accessor" | "static-accessor" | "public-static-accessor" | "instance-accessor" | "public-instance-accessor" | "abstract-accessor" | "public-abstract-accessor" | "protected-accessor" | "protected-decorated-accessor" | "protected-static-accessor" | "protected-instance-accessor" | "protected-abstract-accessor" | "private-accessor" | "private-decorated-accessor" | "private-static-accessor" | "private-instance-accessor" | "#private-accessor" | "#private-static-accessor" | "#private-instance-accessor" | "get" | "public-get" | "public-decorated-get" | "decorated-get" | "static-get" | "public-static-get" | "instance-get" | "public-instance-get" | "abstract-get" | "public-abstract-get" | "protected-get" | "protected-decorated-get" | "protected-static-get" | "protected-instance-get" | "protected-abstract-get" | "private-get" | "private-decorated-get" | "private-static-get" | "private-instance-get" | "#private-get" | "#private-static-get" | "#private-instance-get" | "set" | "public-set" | "public-decorated-set" | "decorated-set" | "static-set" | "public-static-set" | "instance-set" | "public-instance-set" | "abstract-set" | "public-abstract-set" | "protected-set" | "protected-decorated-set" | "protected-static-set" | "protected-instance-set" | "protected-abstract-set" | "private-set" | "private-decorated-set" | "private-static-set" | "private-instance-set" | "#private-set" | "#private-static-set" | "#private-instance-set" | "static-initialization" | "static-static-initialization" | "public-static-static-initialization" | "instance-static-initialization" | "public-instance-static-initialization" | "abstract-static-initialization" | "public-abstract-static-initialization" | "protected-static-static-initialization" | "protected-instance-static-initialization" | "protected-abstract-static-initialization" | "private-static-static-initialization" | "private-instance-static-initialization" | "#private-static-static-initialization" | "#private-instance-static-initialization")[])[] | {
    memberTypes?: ((("readonly-signature" | "signature" | "readonly-field" | "public-readonly-field" | "public-decorated-readonly-field" | "decorated-readonly-field" | "static-readonly-field" | "public-static-readonly-field" | "instance-readonly-field" | "public-instance-readonly-field" | "abstract-readonly-field" | "public-abstract-readonly-field" | "protected-readonly-field" | "protected-decorated-readonly-field" | "protected-static-readonly-field" | "protected-instance-readonly-field" | "protected-abstract-readonly-field" | "private-readonly-field" | "private-decorated-readonly-field" | "private-static-readonly-field" | "private-instance-readonly-field" | "#private-readonly-field" | "#private-static-readonly-field" | "#private-instance-readonly-field" | "field" | "public-field" | "public-decorated-field" | "decorated-field" | "static-field" | "public-static-field" | "instance-field" | "public-instance-field" | "abstract-field" | "public-abstract-field" | "protected-field" | "protected-decorated-field" | "protected-static-field" | "protected-instance-field" | "protected-abstract-field" | "private-field" | "private-decorated-field" | "private-static-field" | "private-instance-field" | "#private-field" | "#private-static-field" | "#private-instance-field" | "method" | "public-method" | "public-decorated-method" | "decorated-method" | "static-method" | "public-static-method" | "instance-method" | "public-instance-method" | "abstract-method" | "public-abstract-method" | "protected-method" | "protected-decorated-method" | "protected-static-method" | "protected-instance-method" | "protected-abstract-method" | "private-method" | "private-decorated-method" | "private-static-method" | "private-instance-method" | "#private-method" | "#private-static-method" | "#private-instance-method" | "call-signature" | "constructor" | "public-constructor" | "protected-constructor" | "private-constructor" | "accessor" | "public-accessor" | "public-decorated-accessor" | "decorated-accessor" | "static-accessor" | "public-static-accessor" | "instance-accessor" | "public-instance-accessor" | "abstract-accessor" | "public-abstract-accessor" | "protected-accessor" | "protected-decorated-accessor" | "protected-static-accessor" | "protected-instance-accessor" | "protected-abstract-accessor" | "private-accessor" | "private-decorated-accessor" | "private-static-accessor" | "private-instance-accessor" | "#private-accessor" | "#private-static-accessor" | "#private-instance-accessor" | "get" | "public-get" | "public-decorated-get" | "decorated-get" | "static-get" | "public-static-get" | "instance-get" | "public-instance-get" | "abstract-get" | "public-abstract-get" | "protected-get" | "protected-decorated-get" | "protected-static-get" | "protected-instance-get" | "protected-abstract-get" | "private-get" | "private-decorated-get" | "private-static-get" | "private-instance-get" | "#private-get" | "#private-static-get" | "#private-instance-get" | "set" | "public-set" | "public-decorated-set" | "decorated-set" | "static-set" | "public-static-set" | "instance-set" | "public-instance-set" | "abstract-set" | "public-abstract-set" | "protected-set" | "protected-decorated-set" | "protected-static-set" | "protected-instance-set" | "protected-abstract-set" | "private-set" | "private-decorated-set" | "private-static-set" | "private-instance-set" | "#private-set" | "#private-static-set" | "#private-instance-set" | "static-initialization" | "static-static-initialization" | "public-static-static-initialization" | "instance-static-initialization" | "public-instance-static-initialization" | "abstract-static-initialization" | "public-abstract-static-initialization" | "protected-static-static-initialization" | "protected-instance-static-initialization" | "protected-abstract-static-initialization" | "private-static-static-initialization" | "private-instance-static-initialization" | "#private-static-static-initialization" | "#private-instance-static-initialization") | ("readonly-signature" | "signature" | "readonly-field" | "public-readonly-field" | "public-decorated-readonly-field" | "decorated-readonly-field" | "static-readonly-field" | "public-static-readonly-field" | "instance-readonly-field" | "public-instance-readonly-field" | "abstract-readonly-field" | "public-abstract-readonly-field" | "protected-readonly-field" | "protected-decorated-readonly-field" | "protected-static-readonly-field" | "protected-instance-readonly-field" | "protected-abstract-readonly-field" | "private-readonly-field" | "private-decorated-readonly-field" | "private-static-readonly-field" | "private-instance-readonly-field" | "#private-readonly-field" | "#private-static-readonly-field" | "#private-instance-readonly-field" | "field" | "public-field" | "public-decorated-field" | "decorated-field" | "static-field" | "public-static-field" | "instance-field" | "public-instance-field" | "abstract-field" | "public-abstract-field" | "protected-field" | "protected-decorated-field" | "protected-static-field" | "protected-instance-field" | "protected-abstract-field" | "private-field" | "private-decorated-field" | "private-static-field" | "private-instance-field" | "#private-field" | "#private-static-field" | "#private-instance-field" | "method" | "public-method" | "public-decorated-method" | "decorated-method" | "static-method" | "public-static-method" | "instance-method" | "public-instance-method" | "abstract-method" | "public-abstract-method" | "protected-method" | "protected-decorated-method" | "protected-static-method" | "protected-instance-method" | "protected-abstract-method" | "private-method" | "private-decorated-method" | "private-static-method" | "private-instance-method" | "#private-method" | "#private-static-method" | "#private-instance-method" | "call-signature" | "constructor" | "public-constructor" | "protected-constructor" | "private-constructor" | "accessor" | "public-accessor" | "public-decorated-accessor" | "decorated-accessor" | "static-accessor" | "public-static-accessor" | "instance-accessor" | "public-instance-accessor" | "abstract-accessor" | "public-abstract-accessor" | "protected-accessor" | "protected-decorated-accessor" | "protected-static-accessor" | "protected-instance-accessor" | "protected-abstract-accessor" | "private-accessor" | "private-decorated-accessor" | "private-static-accessor" | "private-instance-accessor" | "#private-accessor" | "#private-static-accessor" | "#private-instance-accessor" | "get" | "public-get" | "public-decorated-get" | "decorated-get" | "static-get" | "public-static-get" | "instance-get" | "public-instance-get" | "abstract-get" | "public-abstract-get" | "protected-get" | "protected-decorated-get" | "protected-static-get" | "protected-instance-get" | "protected-abstract-get" | "private-get" | "private-decorated-get" | "private-static-get" | "private-instance-get" | "#private-get" | "#private-static-get" | "#private-instance-get" | "set" | "public-set" | "public-decorated-set" | "decorated-set" | "static-set" | "public-static-set" | "instance-set" | "public-instance-set" | "abstract-set" | "public-abstract-set" | "protected-set" | "protected-decorated-set" | "protected-static-set" | "protected-instance-set" | "protected-abstract-set" | "private-set" | "private-decorated-set" | "private-static-set" | "private-instance-set" | "#private-set" | "#private-static-set" | "#private-instance-set" | "static-initialization" | "static-static-initialization" | "public-static-static-initialization" | "instance-static-initialization" | "public-instance-static-initialization" | "abstract-static-initialization" | "public-abstract-static-initialization" | "protected-static-static-initialization" | "protected-instance-static-initialization" | "protected-abstract-static-initialization" | "private-static-static-initialization" | "private-instance-static-initialization" | "#private-static-static-initialization" | "#private-instance-static-initialization")[])[] | "never");
    optionalityOrder?: ("optional-first" | "required-first");
    order?: ("alphabetically" | "alphabetically-case-insensitive" | "as-written" | "natural" | "natural-case-insensitive");
  });
  classExpressions?: ("never" | (("readonly-signature" | "signature" | "readonly-field" | "public-readonly-field" | "public-decorated-readonly-field" | "decorated-readonly-field" | "static-readonly-field" | "public-static-readonly-field" | "instance-readonly-field" | "public-instance-readonly-field" | "abstract-readonly-field" | "public-abstract-readonly-field" | "protected-readonly-field" | "protected-decorated-readonly-field" | "protected-static-readonly-field" | "protected-instance-readonly-field" | "protected-abstract-readonly-field" | "private-readonly-field" | "private-decorated-readonly-field" | "private-static-readonly-field" | "private-instance-readonly-field" | "#private-readonly-field" | "#private-static-readonly-field" | "#private-instance-readonly-field" | "field" | "public-field" | "public-decorated-field" | "decorated-field" | "static-field" | "public-static-field" | "instance-field" | "public-instance-field" | "abstract-field" | "public-abstract-field" | "protected-field" | "protected-decorated-field" | "protected-static-field" | "protected-instance-field" | "protected-abstract-field" | "private-field" | "private-decorated-field" | "private-static-field" | "private-instance-field" | "#private-field" | "#private-static-field" | "#private-instance-field" | "method" | "public-method" | "public-decorated-method" | "decorated-method" | "static-method" | "public-static-method" | "instance-method" | "public-instance-method" | "abstract-method" | "public-abstract-method" | "protected-method" | "protected-decorated-method" | "protected-static-method" | "protected-instance-method" | "protected-abstract-method" | "private-method" | "private-decorated-method" | "private-static-method" | "private-instance-method" | "#private-method" | "#private-static-method" | "#private-instance-method" | "call-signature" | "constructor" | "public-constructor" | "protected-constructor" | "private-constructor" | "accessor" | "public-accessor" | "public-decorated-accessor" | "decorated-accessor" | "static-accessor" | "public-static-accessor" | "instance-accessor" | "public-instance-accessor" | "abstract-accessor" | "public-abstract-accessor" | "protected-accessor" | "protected-decorated-accessor" | "protected-static-accessor" | "protected-instance-accessor" | "protected-abstract-accessor" | "private-accessor" | "private-decorated-accessor" | "private-static-accessor" | "private-instance-accessor" | "#private-accessor" | "#private-static-accessor" | "#private-instance-accessor" | "get" | "public-get" | "public-decorated-get" | "decorated-get" | "static-get" | "public-static-get" | "instance-get" | "public-instance-get" | "abstract-get" | "public-abstract-get" | "protected-get" | "protected-decorated-get" | "protected-static-get" | "protected-instance-get" | "protected-abstract-get" | "private-get" | "private-decorated-get" | "private-static-get" | "private-instance-get" | "#private-get" | "#private-static-get" | "#private-instance-get" | "set" | "public-set" | "public-decorated-set" | "decorated-set" | "static-set" | "public-static-set" | "instance-set" | "public-instance-set" | "abstract-set" | "public-abstract-set" | "protected-set" | "protected-decorated-set" | "protected-static-set" | "protected-instance-set" | "protected-abstract-set" | "private-set" | "private-decorated-set" | "private-static-set" | "private-instance-set" | "#private-set" | "#private-static-set" | "#private-instance-set" | "static-initialization" | "static-static-initialization" | "public-static-static-initialization" | "instance-static-initialization" | "public-instance-static-initialization" | "abstract-static-initialization" | "public-abstract-static-initialization" | "protected-static-static-initialization" | "protected-instance-static-initialization" | "protected-abstract-static-initialization" | "private-static-static-initialization" | "private-instance-static-initialization" | "#private-static-static-initialization" | "#private-instance-static-initialization") | ("readonly-signature" | "signature" | "readonly-field" | "public-readonly-field" | "public-decorated-readonly-field" | "decorated-readonly-field" | "static-readonly-field" | "public-static-readonly-field" | "instance-readonly-field" | "public-instance-readonly-field" | "abstract-readonly-field" | "public-abstract-readonly-field" | "protected-readonly-field" | "protected-decorated-readonly-field" | "protected-static-readonly-field" | "protected-instance-readonly-field" | "protected-abstract-readonly-field" | "private-readonly-field" | "private-decorated-readonly-field" | "private-static-readonly-field" | "private-instance-readonly-field" | "#private-readonly-field" | "#private-static-readonly-field" | "#private-instance-readonly-field" | "field" | "public-field" | "public-decorated-field" | "decorated-field" | "static-field" | "public-static-field" | "instance-field" | "public-instance-field" | "abstract-field" | "public-abstract-field" | "protected-field" | "protected-decorated-field" | "protected-static-field" | "protected-instance-field" | "protected-abstract-field" | "private-field" | "private-decorated-field" | "private-static-field" | "private-instance-field" | "#private-field" | "#private-static-field" | "#private-instance-field" | "method" | "public-method" | "public-decorated-method" | "decorated-method" | "static-method" | "public-static-method" | "instance-method" | "public-instance-method" | "abstract-method" | "public-abstract-method" | "protected-method" | "protected-decorated-method" | "protected-static-method" | "protected-instance-method" | "protected-abstract-method" | "private-method" | "private-decorated-method" | "private-static-method" | "private-instance-method" | "#private-method" | "#private-static-method" | "#private-instance-method" | "call-signature" | "constructor" | "public-constructor" | "protected-constructor" | "private-constructor" | "accessor" | "public-accessor" | "public-decorated-accessor" | "decorated-accessor" | "static-accessor" | "public-static-accessor" | "instance-accessor" | "public-instance-accessor" | "abstract-accessor" | "public-abstract-accessor" | "protected-accessor" | "protected-decorated-accessor" | "protected-static-accessor" | "protected-instance-accessor" | "protected-abstract-accessor" | "private-accessor" | "private-decorated-accessor" | "private-static-accessor" | "private-instance-accessor" | "#private-accessor" | "#private-static-accessor" | "#private-instance-accessor" | "get" | "public-get" | "public-decorated-get" | "decorated-get" | "static-get" | "public-static-get" | "instance-get" | "public-instance-get" | "abstract-get" | "public-abstract-get" | "protected-get" | "protected-decorated-get" | "protected-static-get" | "protected-instance-get" | "protected-abstract-get" | "private-get" | "private-decorated-get" | "private-static-get" | "private-instance-get" | "#private-get" | "#private-static-get" | "#private-instance-get" | "set" | "public-set" | "public-decorated-set" | "decorated-set" | "static-set" | "public-static-set" | "instance-set" | "public-instance-set" | "abstract-set" | "public-abstract-set" | "protected-set" | "protected-decorated-set" | "protected-static-set" | "protected-instance-set" | "protected-abstract-set" | "private-set" | "private-decorated-set" | "private-static-set" | "private-instance-set" | "#private-set" | "#private-static-set" | "#private-instance-set" | "static-initialization" | "static-static-initialization" | "public-static-static-initialization" | "instance-static-initialization" | "public-instance-static-initialization" | "abstract-static-initialization" | "public-abstract-static-initialization" | "protected-static-static-initialization" | "protected-instance-static-initialization" | "protected-abstract-static-initialization" | "private-static-static-initialization" | "private-instance-static-initialization" | "#private-static-static-initialization" | "#private-instance-static-initialization")[])[] | {
    memberTypes?: ((("readonly-signature" | "signature" | "readonly-field" | "public-readonly-field" | "public-decorated-readonly-field" | "decorated-readonly-field" | "static-readonly-field" | "public-static-readonly-field" | "instance-readonly-field" | "public-instance-readonly-field" | "abstract-readonly-field" | "public-abstract-readonly-field" | "protected-readonly-field" | "protected-decorated-readonly-field" | "protected-static-readonly-field" | "protected-instance-readonly-field" | "protected-abstract-readonly-field" | "private-readonly-field" | "private-decorated-readonly-field" | "private-static-readonly-field" | "private-instance-readonly-field" | "#private-readonly-field" | "#private-static-readonly-field" | "#private-instance-readonly-field" | "field" | "public-field" | "public-decorated-field" | "decorated-field" | "static-field" | "public-static-field" | "instance-field" | "public-instance-field" | "abstract-field" | "public-abstract-field" | "protected-field" | "protected-decorated-field" | "protected-static-field" | "protected-instance-field" | "protected-abstract-field" | "private-field" | "private-decorated-field" | "private-static-field" | "private-instance-field" | "#private-field" | "#private-static-field" | "#private-instance-field" | "method" | "public-method" | "public-decorated-method" | "decorated-method" | "static-method" | "public-static-method" | "instance-method" | "public-instance-method" | "abstract-method" | "public-abstract-method" | "protected-method" | "protected-decorated-method" | "protected-static-method" | "protected-instance-method" | "protected-abstract-method" | "private-method" | "private-decorated-method" | "private-static-method" | "private-instance-method" | "#private-method" | "#private-static-method" | "#private-instance-method" | "call-signature" | "constructor" | "public-constructor" | "protected-constructor" | "private-constructor" | "accessor" | "public-accessor" | "public-decorated-accessor" | "decorated-accessor" | "static-accessor" | "public-static-accessor" | "instance-accessor" | "public-instance-accessor" | "abstract-accessor" | "public-abstract-accessor" | "protected-accessor" | "protected-decorated-accessor" | "protected-static-accessor" | "protected-instance-accessor" | "protected-abstract-accessor" | "private-accessor" | "private-decorated-accessor" | "private-static-accessor" | "private-instance-accessor" | "#private-accessor" | "#private-static-accessor" | "#private-instance-accessor" | "get" | "public-get" | "public-decorated-get" | "decorated-get" | "static-get" | "public-static-get" | "instance-get" | "public-instance-get" | "abstract-get" | "public-abstract-get" | "protected-get" | "protected-decorated-get" | "protected-static-get" | "protected-instance-get" | "protected-abstract-get" | "private-get" | "private-decorated-get" | "private-static-get" | "private-instance-get" | "#private-get" | "#private-static-get" | "#private-instance-get" | "set" | "public-set" | "public-decorated-set" | "decorated-set" | "static-set" | "public-static-set" | "instance-set" | "public-instance-set" | "abstract-set" | "public-abstract-set" | "protected-set" | "protected-decorated-set" | "protected-static-set" | "protected-instance-set" | "protected-abstract-set" | "private-set" | "private-decorated-set" | "private-static-set" | "private-instance-set" | "#private-set" | "#private-static-set" | "#private-instance-set" | "static-initialization" | "static-static-initialization" | "public-static-static-initialization" | "instance-static-initialization" | "public-instance-static-initialization" | "abstract-static-initialization" | "public-abstract-static-initialization" | "protected-static-static-initialization" | "protected-instance-static-initialization" | "protected-abstract-static-initialization" | "private-static-static-initialization" | "private-instance-static-initialization" | "#private-static-static-initialization" | "#private-instance-static-initialization") | ("readonly-signature" | "signature" | "readonly-field" | "public-readonly-field" | "public-decorated-readonly-field" | "decorated-readonly-field" | "static-readonly-field" | "public-static-readonly-field" | "instance-readonly-field" | "public-instance-readonly-field" | "abstract-readonly-field" | "public-abstract-readonly-field" | "protected-readonly-field" | "protected-decorated-readonly-field" | "protected-static-readonly-field" | "protected-instance-readonly-field" | "protected-abstract-readonly-field" | "private-readonly-field" | "private-decorated-readonly-field" | "private-static-readonly-field" | "private-instance-readonly-field" | "#private-readonly-field" | "#private-static-readonly-field" | "#private-instance-readonly-field" | "field" | "public-field" | "public-decorated-field" | "decorated-field" | "static-field" | "public-static-field" | "instance-field" | "public-instance-field" | "abstract-field" | "public-abstract-field" | "protected-field" | "protected-decorated-field" | "protected-static-field" | "protected-instance-field" | "protected-abstract-field" | "private-field" | "private-decorated-field" | "private-static-field" | "private-instance-field" | "#private-field" | "#private-static-field" | "#private-instance-field" | "method" | "public-method" | "public-decorated-method" | "decorated-method" | "static-method" | "public-static-method" | "instance-method" | "public-instance-method" | "abstract-method" | "public-abstract-method" | "protected-method" | "protected-decorated-method" | "protected-static-method" | "protected-instance-method" | "protected-abstract-method" | "private-method" | "private-decorated-method" | "private-static-method" | "private-instance-method" | "#private-method" | "#private-static-method" | "#private-instance-method" | "call-signature" | "constructor" | "public-constructor" | "protected-constructor" | "private-constructor" | "accessor" | "public-accessor" | "public-decorated-accessor" | "decorated-accessor" | "static-accessor" | "public-static-accessor" | "instance-accessor" | "public-instance-accessor" | "abstract-accessor" | "public-abstract-accessor" | "protected-accessor" | "protected-decorated-accessor" | "protected-static-accessor" | "protected-instance-accessor" | "protected-abstract-accessor" | "private-accessor" | "private-decorated-accessor" | "private-static-accessor" | "private-instance-accessor" | "#private-accessor" | "#private-static-accessor" | "#private-instance-accessor" | "get" | "public-get" | "public-decorated-get" | "decorated-get" | "static-get" | "public-static-get" | "instance-get" | "public-instance-get" | "abstract-get" | "public-abstract-get" | "protected-get" | "protected-decorated-get" | "protected-static-get" | "protected-instance-get" | "protected-abstract-get" | "private-get" | "private-decorated-get" | "private-static-get" | "private-instance-get" | "#private-get" | "#private-static-get" | "#private-instance-get" | "set" | "public-set" | "public-decorated-set" | "decorated-set" | "static-set" | "public-static-set" | "instance-set" | "public-instance-set" | "abstract-set" | "public-abstract-set" | "protected-set" | "protected-decorated-set" | "protected-static-set" | "protected-instance-set" | "protected-abstract-set" | "private-set" | "private-decorated-set" | "private-static-set" | "private-instance-set" | "#private-set" | "#private-static-set" | "#private-instance-set" | "static-initialization" | "static-static-initialization" | "public-static-static-initialization" | "instance-static-initialization" | "public-instance-static-initialization" | "abstract-static-initialization" | "public-abstract-static-initialization" | "protected-static-static-initialization" | "protected-instance-static-initialization" | "protected-abstract-static-initialization" | "private-static-static-initialization" | "private-instance-static-initialization" | "#private-static-static-initialization" | "#private-instance-static-initialization")[])[] | "never");
    optionalityOrder?: ("optional-first" | "required-first");
    order?: ("alphabetically" | "alphabetically-case-insensitive" | "as-written" | "natural" | "natural-case-insensitive");
  });
  default?: ("never" | (("readonly-signature" | "signature" | "readonly-field" | "public-readonly-field" | "public-decorated-readonly-field" | "decorated-readonly-field" | "static-readonly-field" | "public-static-readonly-field" | "instance-readonly-field" | "public-instance-readonly-field" | "abstract-readonly-field" | "public-abstract-readonly-field" | "protected-readonly-field" | "protected-decorated-readonly-field" | "protected-static-readonly-field" | "protected-instance-readonly-field" | "protected-abstract-readonly-field" | "private-readonly-field" | "private-decorated-readonly-field" | "private-static-readonly-field" | "private-instance-readonly-field" | "#private-readonly-field" | "#private-static-readonly-field" | "#private-instance-readonly-field" | "field" | "public-field" | "public-decorated-field" | "decorated-field" | "static-field" | "public-static-field" | "instance-field" | "public-instance-field" | "abstract-field" | "public-abstract-field" | "protected-field" | "protected-decorated-field" | "protected-static-field" | "protected-instance-field" | "protected-abstract-field" | "private-field" | "private-decorated-field" | "private-static-field" | "private-instance-field" | "#private-field" | "#private-static-field" | "#private-instance-field" | "method" | "public-method" | "public-decorated-method" | "decorated-method" | "static-method" | "public-static-method" | "instance-method" | "public-instance-method" | "abstract-method" | "public-abstract-method" | "protected-method" | "protected-decorated-method" | "protected-static-method" | "protected-instance-method" | "protected-abstract-method" | "private-method" | "private-decorated-method" | "private-static-method" | "private-instance-method" | "#private-method" | "#private-static-method" | "#private-instance-method" | "call-signature" | "constructor" | "public-constructor" | "protected-constructor" | "private-constructor" | "accessor" | "public-accessor" | "public-decorated-accessor" | "decorated-accessor" | "static-accessor" | "public-static-accessor" | "instance-accessor" | "public-instance-accessor" | "abstract-accessor" | "public-abstract-accessor" | "protected-accessor" | "protected-decorated-accessor" | "protected-static-accessor" | "protected-instance-accessor" | "protected-abstract-accessor" | "private-accessor" | "private-decorated-accessor" | "private-static-accessor" | "private-instance-accessor" | "#private-accessor" | "#private-static-accessor" | "#private-instance-accessor" | "get" | "public-get" | "public-decorated-get" | "decorated-get" | "static-get" | "public-static-get" | "instance-get" | "public-instance-get" | "abstract-get" | "public-abstract-get" | "protected-get" | "protected-decorated-get" | "protected-static-get" | "protected-instance-get" | "protected-abstract-get" | "private-get" | "private-decorated-get" | "private-static-get" | "private-instance-get" | "#private-get" | "#private-static-get" | "#private-instance-get" | "set" | "public-set" | "public-decorated-set" | "decorated-set" | "static-set" | "public-static-set" | "instance-set" | "public-instance-set" | "abstract-set" | "public-abstract-set" | "protected-set" | "protected-decorated-set" | "protected-static-set" | "protected-instance-set" | "protected-abstract-set" | "private-set" | "private-decorated-set" | "private-static-set" | "private-instance-set" | "#private-set" | "#private-static-set" | "#private-instance-set" | "static-initialization" | "static-static-initialization" | "public-static-static-initialization" | "instance-static-initialization" | "public-instance-static-initialization" | "abstract-static-initialization" | "public-abstract-static-initialization" | "protected-static-static-initialization" | "protected-instance-static-initialization" | "protected-abstract-static-initialization" | "private-static-static-initialization" | "private-instance-static-initialization" | "#private-static-static-initialization" | "#private-instance-static-initialization") | ("readonly-signature" | "signature" | "readonly-field" | "public-readonly-field" | "public-decorated-readonly-field" | "decorated-readonly-field" | "static-readonly-field" | "public-static-readonly-field" | "instance-readonly-field" | "public-instance-readonly-field" | "abstract-readonly-field" | "public-abstract-readonly-field" | "protected-readonly-field" | "protected-decorated-readonly-field" | "protected-static-readonly-field" | "protected-instance-readonly-field" | "protected-abstract-readonly-field" | "private-readonly-field" | "private-decorated-readonly-field" | "private-static-readonly-field" | "private-instance-readonly-field" | "#private-readonly-field" | "#private-static-readonly-field" | "#private-instance-readonly-field" | "field" | "public-field" | "public-decorated-field" | "decorated-field" | "static-field" | "public-static-field" | "instance-field" | "public-instance-field" | "abstract-field" | "public-abstract-field" | "protected-field" | "protected-decorated-field" | "protected-static-field" | "protected-instance-field" | "protected-abstract-field" | "private-field" | "private-decorated-field" | "private-static-field" | "private-instance-field" | "#private-field" | "#private-static-field" | "#private-instance-field" | "method" | "public-method" | "public-decorated-method" | "decorated-method" | "static-method" | "public-static-method" | "instance-method" | "public-instance-method" | "abstract-method" | "public-abstract-method" | "protected-method" | "protected-decorated-method" | "protected-static-method" | "protected-instance-method" | "protected-abstract-method" | "private-method" | "private-decorated-method" | "private-static-method" | "private-instance-method" | "#private-method" | "#private-static-method" | "#private-instance-method" | "call-signature" | "constructor" | "public-constructor" | "protected-constructor" | "private-constructor" | "accessor" | "public-accessor" | "public-decorated-accessor" | "decorated-accessor" | "static-accessor" | "public-static-accessor" | "instance-accessor" | "public-instance-accessor" | "abstract-accessor" | "public-abstract-accessor" | "protected-accessor" | "protected-decorated-accessor" | "protected-static-accessor" | "protected-instance-accessor" | "protected-abstract-accessor" | "private-accessor" | "private-decorated-accessor" | "private-static-accessor" | "private-instance-accessor" | "#private-accessor" | "#private-static-accessor" | "#private-instance-accessor" | "get" | "public-get" | "public-decorated-get" | "decorated-get" | "static-get" | "public-static-get" | "instance-get" | "public-instance-get" | "abstract-get" | "public-abstract-get" | "protected-get" | "protected-decorated-get" | "protected-static-get" | "protected-instance-get" | "protected-abstract-get" | "private-get" | "private-decorated-get" | "private-static-get" | "private-instance-get" | "#private-get" | "#private-static-get" | "#private-instance-get" | "set" | "public-set" | "public-decorated-set" | "decorated-set" | "static-set" | "public-static-set" | "instance-set" | "public-instance-set" | "abstract-set" | "public-abstract-set" | "protected-set" | "protected-decorated-set" | "protected-static-set" | "protected-instance-set" | "protected-abstract-set" | "private-set" | "private-decorated-set" | "private-static-set" | "private-instance-set" | "#private-set" | "#private-static-set" | "#private-instance-set" | "static-initialization" | "static-static-initialization" | "public-static-static-initialization" | "instance-static-initialization" | "public-instance-static-initialization" | "abstract-static-initialization" | "public-abstract-static-initialization" | "protected-static-static-initialization" | "protected-instance-static-initialization" | "protected-abstract-static-initialization" | "private-static-static-initialization" | "private-instance-static-initialization" | "#private-static-static-initialization" | "#private-instance-static-initialization")[])[] | {
    memberTypes?: ((("readonly-signature" | "signature" | "readonly-field" | "public-readonly-field" | "public-decorated-readonly-field" | "decorated-readonly-field" | "static-readonly-field" | "public-static-readonly-field" | "instance-readonly-field" | "public-instance-readonly-field" | "abstract-readonly-field" | "public-abstract-readonly-field" | "protected-readonly-field" | "protected-decorated-readonly-field" | "protected-static-readonly-field" | "protected-instance-readonly-field" | "protected-abstract-readonly-field" | "private-readonly-field" | "private-decorated-readonly-field" | "private-static-readonly-field" | "private-instance-readonly-field" | "#private-readonly-field" | "#private-static-readonly-field" | "#private-instance-readonly-field" | "field" | "public-field" | "public-decorated-field" | "decorated-field" | "static-field" | "public-static-field" | "instance-field" | "public-instance-field" | "abstract-field" | "public-abstract-field" | "protected-field" | "protected-decorated-field" | "protected-static-field" | "protected-instance-field" | "protected-abstract-field" | "private-field" | "private-decorated-field" | "private-static-field" | "private-instance-field" | "#private-field" | "#private-static-field" | "#private-instance-field" | "method" | "public-method" | "public-decorated-method" | "decorated-method" | "static-method" | "public-static-method" | "instance-method" | "public-instance-method" | "abstract-method" | "public-abstract-method" | "protected-method" | "protected-decorated-method" | "protected-static-method" | "protected-instance-method" | "protected-abstract-method" | "private-method" | "private-decorated-method" | "private-static-method" | "private-instance-method" | "#private-method" | "#private-static-method" | "#private-instance-method" | "call-signature" | "constructor" | "public-constructor" | "protected-constructor" | "private-constructor" | "accessor" | "public-accessor" | "public-decorated-accessor" | "decorated-accessor" | "static-accessor" | "public-static-accessor" | "instance-accessor" | "public-instance-accessor" | "abstract-accessor" | "public-abstract-accessor" | "protected-accessor" | "protected-decorated-accessor" | "protected-static-accessor" | "protected-instance-accessor" | "protected-abstract-accessor" | "private-accessor" | "private-decorated-accessor" | "private-static-accessor" | "private-instance-accessor" | "#private-accessor" | "#private-static-accessor" | "#private-instance-accessor" | "get" | "public-get" | "public-decorated-get" | "decorated-get" | "static-get" | "public-static-get" | "instance-get" | "public-instance-get" | "abstract-get" | "public-abstract-get" | "protected-get" | "protected-decorated-get" | "protected-static-get" | "protected-instance-get" | "protected-abstract-get" | "private-get" | "private-decorated-get" | "private-static-get" | "private-instance-get" | "#private-get" | "#private-static-get" | "#private-instance-get" | "set" | "public-set" | "public-decorated-set" | "decorated-set" | "static-set" | "public-static-set" | "instance-set" | "public-instance-set" | "abstract-set" | "public-abstract-set" | "protected-set" | "protected-decorated-set" | "protected-static-set" | "protected-instance-set" | "protected-abstract-set" | "private-set" | "private-decorated-set" | "private-static-set" | "private-instance-set" | "#private-set" | "#private-static-set" | "#private-instance-set" | "static-initialization" | "static-static-initialization" | "public-static-static-initialization" | "instance-static-initialization" | "public-instance-static-initialization" | "abstract-static-initialization" | "public-abstract-static-initialization" | "protected-static-static-initialization" | "protected-instance-static-initialization" | "protected-abstract-static-initialization" | "private-static-static-initialization" | "private-instance-static-initialization" | "#private-static-static-initialization" | "#private-instance-static-initialization") | ("readonly-signature" | "signature" | "readonly-field" | "public-readonly-field" | "public-decorated-readonly-field" | "decorated-readonly-field" | "static-readonly-field" | "public-static-readonly-field" | "instance-readonly-field" | "public-instance-readonly-field" | "abstract-readonly-field" | "public-abstract-readonly-field" | "protected-readonly-field" | "protected-decorated-readonly-field" | "protected-static-readonly-field" | "protected-instance-readonly-field" | "protected-abstract-readonly-field" | "private-readonly-field" | "private-decorated-readonly-field" | "private-static-readonly-field" | "private-instance-readonly-field" | "#private-readonly-field" | "#private-static-readonly-field" | "#private-instance-readonly-field" | "field" | "public-field" | "public-decorated-field" | "decorated-field" | "static-field" | "public-static-field" | "instance-field" | "public-instance-field" | "abstract-field" | "public-abstract-field" | "protected-field" | "protected-decorated-field" | "protected-static-field" | "protected-instance-field" | "protected-abstract-field" | "private-field" | "private-decorated-field" | "private-static-field" | "private-instance-field" | "#private-field" | "#private-static-field" | "#private-instance-field" | "method" | "public-method" | "public-decorated-method" | "decorated-method" | "static-method" | "public-static-method" | "instance-method" | "public-instance-method" | "abstract-method" | "public-abstract-method" | "protected-method" | "protected-decorated-method" | "protected-static-method" | "protected-instance-method" | "protected-abstract-method" | "private-method" | "private-decorated-method" | "private-static-method" | "private-instance-method" | "#private-method" | "#private-static-method" | "#private-instance-method" | "call-signature" | "constructor" | "public-constructor" | "protected-constructor" | "private-constructor" | "accessor" | "public-accessor" | "public-decorated-accessor" | "decorated-accessor" | "static-accessor" | "public-static-accessor" | "instance-accessor" | "public-instance-accessor" | "abstract-accessor" | "public-abstract-accessor" | "protected-accessor" | "protected-decorated-accessor" | "protected-static-accessor" | "protected-instance-accessor" | "protected-abstract-accessor" | "private-accessor" | "private-decorated-accessor" | "private-static-accessor" | "private-instance-accessor" | "#private-accessor" | "#private-static-accessor" | "#private-instance-accessor" | "get" | "public-get" | "public-decorated-get" | "decorated-get" | "static-get" | "public-static-get" | "instance-get" | "public-instance-get" | "abstract-get" | "public-abstract-get" | "protected-get" | "protected-decorated-get" | "protected-static-get" | "protected-instance-get" | "protected-abstract-get" | "private-get" | "private-decorated-get" | "private-static-get" | "private-instance-get" | "#private-get" | "#private-static-get" | "#private-instance-get" | "set" | "public-set" | "public-decorated-set" | "decorated-set" | "static-set" | "public-static-set" | "instance-set" | "public-instance-set" | "abstract-set" | "public-abstract-set" | "protected-set" | "protected-decorated-set" | "protected-static-set" | "protected-instance-set" | "protected-abstract-set" | "private-set" | "private-decorated-set" | "private-static-set" | "private-instance-set" | "#private-set" | "#private-static-set" | "#private-instance-set" | "static-initialization" | "static-static-initialization" | "public-static-static-initialization" | "instance-static-initialization" | "public-instance-static-initialization" | "abstract-static-initialization" | "public-abstract-static-initialization" | "protected-static-static-initialization" | "protected-instance-static-initialization" | "protected-abstract-static-initialization" | "private-static-static-initialization" | "private-instance-static-initialization" | "#private-static-static-initialization" | "#private-instance-static-initialization")[])[] | "never");
    optionalityOrder?: ("optional-first" | "required-first");
    order?: ("alphabetically" | "alphabetically-case-insensitive" | "as-written" | "natural" | "natural-case-insensitive");
  });
  interfaces?: ("never" | (("readonly-signature" | "signature" | "readonly-field" | "field" | "method" | "constructor") | ("readonly-signature" | "signature" | "readonly-field" | "field" | "method" | "constructor")[])[] | {
    memberTypes?: ((("readonly-signature" | "signature" | "readonly-field" | "field" | "method" | "constructor") | ("readonly-signature" | "signature" | "readonly-field" | "field" | "method" | "constructor")[])[] | "never");
    optionalityOrder?: ("optional-first" | "required-first");
    order?: ("alphabetically" | "alphabetically-case-insensitive" | "as-written" | "natural" | "natural-case-insensitive");
  });
  typeLiterals?: ("never" | (("readonly-signature" | "signature" | "readonly-field" | "field" | "method" | "constructor") | ("readonly-signature" | "signature" | "readonly-field" | "field" | "method" | "constructor")[])[] | {
    memberTypes?: ((("readonly-signature" | "signature" | "readonly-field" | "field" | "method" | "constructor") | ("readonly-signature" | "signature" | "readonly-field" | "field" | "method" | "constructor")[])[] | "never");
    optionalityOrder?: ("optional-first" | "required-first");
    order?: ("alphabetically" | "alphabetically-case-insensitive" | "as-written" | "natural" | "natural-case-insensitive");
  });
}];
// ----- ts/method-signature-style -----
type TsMethodSignatureStyle = [] | [("property" | "method")];
// ----- ts/naming-convention -----
type _TsNamingConventionFormatOptionsConfig = (_TsNamingConventionPredefinedFormats[] | null);
type _TsNamingConventionPredefinedFormats = ("camelCase" | "strictCamelCase" | "PascalCase" | "StrictPascalCase" | "snake_case" | "UPPER_CASE");
type _TsNamingConventionUnderscoreOptions = ("forbid" | "allow" | "require" | "requireDouble" | "allowDouble" | "allowSingleOrDouble");
type _TsNamingConvention_PrefixSuffixConfig = string[];
type _TsNamingConventionTypeModifiers = ("boolean" | "string" | "number" | "function" | "array");
type TsNamingConvention = ({
  custom?: _TsNamingConvention_MatchRegexConfig;
  failureMessage?: string;
  format: _TsNamingConventionFormatOptionsConfig;
  leadingUnderscore?: _TsNamingConventionUnderscoreOptions;
  prefix?: _TsNamingConvention_PrefixSuffixConfig;
  suffix?: _TsNamingConvention_PrefixSuffixConfig;
  trailingUnderscore?: _TsNamingConventionUnderscoreOptions;
  filter?: (string | _TsNamingConvention_MatchRegexConfig);
  modifiers?: ("const" | "readonly" | "static" | "public" | "protected" | "private" | "#private" | "abstract" | "destructured" | "global" | "exported" | "unused" | "requiresQuotes" | "override" | "async" | "default" | "namespace")[];
  selector: ("default" | "variableLike" | "memberLike" | "typeLike" | "method" | "property" | "accessor" | "variable" | "function" | "parameter" | "parameterProperty" | "classicAccessor" | "enumMember" | "classMethod" | "objectLiteralMethod" | "typeMethod" | "classProperty" | "objectLiteralProperty" | "typeProperty" | "autoAccessor" | "class" | "interface" | "typeAlias" | "enum" | "typeParameter" | "import")[];
  types?: _TsNamingConventionTypeModifiers[];
} | {
  custom?: _TsNamingConvention_MatchRegexConfig;
  failureMessage?: string;
  format: _TsNamingConventionFormatOptionsConfig;
  leadingUnderscore?: _TsNamingConventionUnderscoreOptions;
  prefix?: _TsNamingConvention_PrefixSuffixConfig;
  suffix?: _TsNamingConvention_PrefixSuffixConfig;
  trailingUnderscore?: _TsNamingConventionUnderscoreOptions;
  filter?: (string | _TsNamingConvention_MatchRegexConfig);
  selector: "default";
  modifiers?: ("const" | "readonly" | "static" | "public" | "protected" | "private" | "#private" | "abstract" | "destructured" | "global" | "exported" | "unused" | "requiresQuotes" | "override" | "async" | "default" | "namespace")[];
} | {
  custom?: _TsNamingConvention_MatchRegexConfig;
  failureMessage?: string;
  format: _TsNamingConventionFormatOptionsConfig;
  leadingUnderscore?: _TsNamingConventionUnderscoreOptions;
  prefix?: _TsNamingConvention_PrefixSuffixConfig;
  suffix?: _TsNamingConvention_PrefixSuffixConfig;
  trailingUnderscore?: _TsNamingConventionUnderscoreOptions;
  filter?: (string | _TsNamingConvention_MatchRegexConfig);
  selector: "variableLike";
  modifiers?: ("unused" | "async")[];
} | {
  custom?: _TsNamingConvention_MatchRegexConfig;
  failureMessage?: string;
  format: _TsNamingConventionFormatOptionsConfig;
  leadingUnderscore?: _TsNamingConventionUnderscoreOptions;
  prefix?: _TsNamingConvention_PrefixSuffixConfig;
  suffix?: _TsNamingConvention_PrefixSuffixConfig;
  trailingUnderscore?: _TsNamingConventionUnderscoreOptions;
  filter?: (string | _TsNamingConvention_MatchRegexConfig);
  selector: "variable";
  modifiers?: ("const" | "destructured" | "exported" | "global" | "unused" | "async")[];
  types?: _TsNamingConventionTypeModifiers[];
} | {
  custom?: _TsNamingConvention_MatchRegexConfig;
  failureMessage?: string;
  format: _TsNamingConventionFormatOptionsConfig;
  leadingUnderscore?: _TsNamingConventionUnderscoreOptions;
  prefix?: _TsNamingConvention_PrefixSuffixConfig;
  suffix?: _TsNamingConvention_PrefixSuffixConfig;
  trailingUnderscore?: _TsNamingConventionUnderscoreOptions;
  filter?: (string | _TsNamingConvention_MatchRegexConfig);
  selector: "function";
  modifiers?: ("exported" | "global" | "unused" | "async")[];
} | {
  custom?: _TsNamingConvention_MatchRegexConfig;
  failureMessage?: string;
  format: _TsNamingConventionFormatOptionsConfig;
  leadingUnderscore?: _TsNamingConventionUnderscoreOptions;
  prefix?: _TsNamingConvention_PrefixSuffixConfig;
  suffix?: _TsNamingConvention_PrefixSuffixConfig;
  trailingUnderscore?: _TsNamingConventionUnderscoreOptions;
  filter?: (string | _TsNamingConvention_MatchRegexConfig);
  selector: "parameter";
  modifiers?: ("destructured" | "unused")[];
  types?: _TsNamingConventionTypeModifiers[];
} | {
  custom?: _TsNamingConvention_MatchRegexConfig;
  failureMessage?: string;
  format: _TsNamingConventionFormatOptionsConfig;
  leadingUnderscore?: _TsNamingConventionUnderscoreOptions;
  prefix?: _TsNamingConvention_PrefixSuffixConfig;
  suffix?: _TsNamingConvention_PrefixSuffixConfig;
  trailingUnderscore?: _TsNamingConventionUnderscoreOptions;
  filter?: (string | _TsNamingConvention_MatchRegexConfig);
  selector: "memberLike";
  modifiers?: ("abstract" | "private" | "#private" | "protected" | "public" | "readonly" | "requiresQuotes" | "static" | "override" | "async")[];
} | {
  custom?: _TsNamingConvention_MatchRegexConfig;
  failureMessage?: string;
  format: _TsNamingConventionFormatOptionsConfig;
  leadingUnderscore?: _TsNamingConventionUnderscoreOptions;
  prefix?: _TsNamingConvention_PrefixSuffixConfig;
  suffix?: _TsNamingConvention_PrefixSuffixConfig;
  trailingUnderscore?: _TsNamingConventionUnderscoreOptions;
  filter?: (string | _TsNamingConvention_MatchRegexConfig);
  selector: "classProperty";
  modifiers?: ("abstract" | "private" | "#private" | "protected" | "public" | "readonly" | "requiresQuotes" | "static" | "override")[];
  types?: _TsNamingConventionTypeModifiers[];
} | {
  custom?: _TsNamingConvention_MatchRegexConfig;
  failureMessage?: string;
  format: _TsNamingConventionFormatOptionsConfig;
  leadingUnderscore?: _TsNamingConventionUnderscoreOptions;
  prefix?: _TsNamingConvention_PrefixSuffixConfig;
  suffix?: _TsNamingConvention_PrefixSuffixConfig;
  trailingUnderscore?: _TsNamingConventionUnderscoreOptions;
  filter?: (string | _TsNamingConvention_MatchRegexConfig);
  selector: "objectLiteralProperty";
  modifiers?: ("public" | "requiresQuotes")[];
  types?: _TsNamingConventionTypeModifiers[];
} | {
  custom?: _TsNamingConvention_MatchRegexConfig;
  failureMessage?: string;
  format: _TsNamingConventionFormatOptionsConfig;
  leadingUnderscore?: _TsNamingConventionUnderscoreOptions;
  prefix?: _TsNamingConvention_PrefixSuffixConfig;
  suffix?: _TsNamingConvention_PrefixSuffixConfig;
  trailingUnderscore?: _TsNamingConventionUnderscoreOptions;
  filter?: (string | _TsNamingConvention_MatchRegexConfig);
  selector: "typeProperty";
  modifiers?: ("public" | "readonly" | "requiresQuotes")[];
  types?: _TsNamingConventionTypeModifiers[];
} | {
  custom?: _TsNamingConvention_MatchRegexConfig;
  failureMessage?: string;
  format: _TsNamingConventionFormatOptionsConfig;
  leadingUnderscore?: _TsNamingConventionUnderscoreOptions;
  prefix?: _TsNamingConvention_PrefixSuffixConfig;
  suffix?: _TsNamingConvention_PrefixSuffixConfig;
  trailingUnderscore?: _TsNamingConventionUnderscoreOptions;
  filter?: (string | _TsNamingConvention_MatchRegexConfig);
  selector: "parameterProperty";
  modifiers?: ("private" | "protected" | "public" | "readonly")[];
  types?: _TsNamingConventionTypeModifiers[];
} | {
  custom?: _TsNamingConvention_MatchRegexConfig;
  failureMessage?: string;
  format: _TsNamingConventionFormatOptionsConfig;
  leadingUnderscore?: _TsNamingConventionUnderscoreOptions;
  prefix?: _TsNamingConvention_PrefixSuffixConfig;
  suffix?: _TsNamingConvention_PrefixSuffixConfig;
  trailingUnderscore?: _TsNamingConventionUnderscoreOptions;
  filter?: (string | _TsNamingConvention_MatchRegexConfig);
  selector: "property";
  modifiers?: ("abstract" | "private" | "#private" | "protected" | "public" | "readonly" | "requiresQuotes" | "static" | "override" | "async")[];
  types?: _TsNamingConventionTypeModifiers[];
} | {
  custom?: _TsNamingConvention_MatchRegexConfig;
  failureMessage?: string;
  format: _TsNamingConventionFormatOptionsConfig;
  leadingUnderscore?: _TsNamingConventionUnderscoreOptions;
  prefix?: _TsNamingConvention_PrefixSuffixConfig;
  suffix?: _TsNamingConvention_PrefixSuffixConfig;
  trailingUnderscore?: _TsNamingConventionUnderscoreOptions;
  filter?: (string | _TsNamingConvention_MatchRegexConfig);
  selector: "classMethod";
  modifiers?: ("abstract" | "private" | "#private" | "protected" | "public" | "requiresQuotes" | "static" | "override" | "async")[];
} | {
  custom?: _TsNamingConvention_MatchRegexConfig;
  failureMessage?: string;
  format: _TsNamingConventionFormatOptionsConfig;
  leadingUnderscore?: _TsNamingConventionUnderscoreOptions;
  prefix?: _TsNamingConvention_PrefixSuffixConfig;
  suffix?: _TsNamingConvention_PrefixSuffixConfig;
  trailingUnderscore?: _TsNamingConventionUnderscoreOptions;
  filter?: (string | _TsNamingConvention_MatchRegexConfig);
  selector: "objectLiteralMethod";
  modifiers?: ("public" | "requiresQuotes" | "async")[];
} | {
  custom?: _TsNamingConvention_MatchRegexConfig;
  failureMessage?: string;
  format: _TsNamingConventionFormatOptionsConfig;
  leadingUnderscore?: _TsNamingConventionUnderscoreOptions;
  prefix?: _TsNamingConvention_PrefixSuffixConfig;
  suffix?: _TsNamingConvention_PrefixSuffixConfig;
  trailingUnderscore?: _TsNamingConventionUnderscoreOptions;
  filter?: (string | _TsNamingConvention_MatchRegexConfig);
  selector: "typeMethod";
  modifiers?: ("public" | "requiresQuotes")[];
} | {
  custom?: _TsNamingConvention_MatchRegexConfig;
  failureMessage?: string;
  format: _TsNamingConventionFormatOptionsConfig;
  leadingUnderscore?: _TsNamingConventionUnderscoreOptions;
  prefix?: _TsNamingConvention_PrefixSuffixConfig;
  suffix?: _TsNamingConvention_PrefixSuffixConfig;
  trailingUnderscore?: _TsNamingConventionUnderscoreOptions;
  filter?: (string | _TsNamingConvention_MatchRegexConfig);
  selector: "method";
  modifiers?: ("abstract" | "private" | "#private" | "protected" | "public" | "requiresQuotes" | "static" | "override" | "async")[];
} | {
  custom?: _TsNamingConvention_MatchRegexConfig;
  failureMessage?: string;
  format: _TsNamingConventionFormatOptionsConfig;
  leadingUnderscore?: _TsNamingConventionUnderscoreOptions;
  prefix?: _TsNamingConvention_PrefixSuffixConfig;
  suffix?: _TsNamingConvention_PrefixSuffixConfig;
  trailingUnderscore?: _TsNamingConventionUnderscoreOptions;
  filter?: (string | _TsNamingConvention_MatchRegexConfig);
  selector: "classicAccessor";
  modifiers?: ("abstract" | "private" | "protected" | "public" | "requiresQuotes" | "static" | "override")[];
  types?: _TsNamingConventionTypeModifiers[];
} | {
  custom?: _TsNamingConvention_MatchRegexConfig;
  failureMessage?: string;
  format: _TsNamingConventionFormatOptionsConfig;
  leadingUnderscore?: _TsNamingConventionUnderscoreOptions;
  prefix?: _TsNamingConvention_PrefixSuffixConfig;
  suffix?: _TsNamingConvention_PrefixSuffixConfig;
  trailingUnderscore?: _TsNamingConventionUnderscoreOptions;
  filter?: (string | _TsNamingConvention_MatchRegexConfig);
  selector: "autoAccessor";
  modifiers?: ("abstract" | "private" | "protected" | "public" | "requiresQuotes" | "static" | "override")[];
  types?: _TsNamingConventionTypeModifiers[];
} | {
  custom?: _TsNamingConvention_MatchRegexConfig;
  failureMessage?: string;
  format: _TsNamingConventionFormatOptionsConfig;
  leadingUnderscore?: _TsNamingConventionUnderscoreOptions;
  prefix?: _TsNamingConvention_PrefixSuffixConfig;
  suffix?: _TsNamingConvention_PrefixSuffixConfig;
  trailingUnderscore?: _TsNamingConventionUnderscoreOptions;
  filter?: (string | _TsNamingConvention_MatchRegexConfig);
  selector: "accessor";
  modifiers?: ("abstract" | "private" | "protected" | "public" | "requiresQuotes" | "static" | "override")[];
  types?: _TsNamingConventionTypeModifiers[];
} | {
  custom?: _TsNamingConvention_MatchRegexConfig;
  failureMessage?: string;
  format: _TsNamingConventionFormatOptionsConfig;
  leadingUnderscore?: _TsNamingConventionUnderscoreOptions;
  prefix?: _TsNamingConvention_PrefixSuffixConfig;
  suffix?: _TsNamingConvention_PrefixSuffixConfig;
  trailingUnderscore?: _TsNamingConventionUnderscoreOptions;
  filter?: (string | _TsNamingConvention_MatchRegexConfig);
  selector: "enumMember";
  modifiers?: ("requiresQuotes")[];
} | {
  custom?: _TsNamingConvention_MatchRegexConfig;
  failureMessage?: string;
  format: _TsNamingConventionFormatOptionsConfig;
  leadingUnderscore?: _TsNamingConventionUnderscoreOptions;
  prefix?: _TsNamingConvention_PrefixSuffixConfig;
  suffix?: _TsNamingConvention_PrefixSuffixConfig;
  trailingUnderscore?: _TsNamingConventionUnderscoreOptions;
  filter?: (string | _TsNamingConvention_MatchRegexConfig);
  selector: "typeLike";
  modifiers?: ("abstract" | "exported" | "unused")[];
} | {
  custom?: _TsNamingConvention_MatchRegexConfig;
  failureMessage?: string;
  format: _TsNamingConventionFormatOptionsConfig;
  leadingUnderscore?: _TsNamingConventionUnderscoreOptions;
  prefix?: _TsNamingConvention_PrefixSuffixConfig;
  suffix?: _TsNamingConvention_PrefixSuffixConfig;
  trailingUnderscore?: _TsNamingConventionUnderscoreOptions;
  filter?: (string | _TsNamingConvention_MatchRegexConfig);
  selector: "class";
  modifiers?: ("abstract" | "exported" | "unused")[];
} | {
  custom?: _TsNamingConvention_MatchRegexConfig;
  failureMessage?: string;
  format: _TsNamingConventionFormatOptionsConfig;
  leadingUnderscore?: _TsNamingConventionUnderscoreOptions;
  prefix?: _TsNamingConvention_PrefixSuffixConfig;
  suffix?: _TsNamingConvention_PrefixSuffixConfig;
  trailingUnderscore?: _TsNamingConventionUnderscoreOptions;
  filter?: (string | _TsNamingConvention_MatchRegexConfig);
  selector: "interface";
  modifiers?: ("exported" | "unused")[];
} | {
  custom?: _TsNamingConvention_MatchRegexConfig;
  failureMessage?: string;
  format: _TsNamingConventionFormatOptionsConfig;
  leadingUnderscore?: _TsNamingConventionUnderscoreOptions;
  prefix?: _TsNamingConvention_PrefixSuffixConfig;
  suffix?: _TsNamingConvention_PrefixSuffixConfig;
  trailingUnderscore?: _TsNamingConventionUnderscoreOptions;
  filter?: (string | _TsNamingConvention_MatchRegexConfig);
  selector: "typeAlias";
  modifiers?: ("exported" | "unused")[];
} | {
  custom?: _TsNamingConvention_MatchRegexConfig;
  failureMessage?: string;
  format: _TsNamingConventionFormatOptionsConfig;
  leadingUnderscore?: _TsNamingConventionUnderscoreOptions;
  prefix?: _TsNamingConvention_PrefixSuffixConfig;
  suffix?: _TsNamingConvention_PrefixSuffixConfig;
  trailingUnderscore?: _TsNamingConventionUnderscoreOptions;
  filter?: (string | _TsNamingConvention_MatchRegexConfig);
  selector: "enum";
  modifiers?: ("exported" | "unused")[];
} | {
  custom?: _TsNamingConvention_MatchRegexConfig;
  failureMessage?: string;
  format: _TsNamingConventionFormatOptionsConfig;
  leadingUnderscore?: _TsNamingConventionUnderscoreOptions;
  prefix?: _TsNamingConvention_PrefixSuffixConfig;
  suffix?: _TsNamingConvention_PrefixSuffixConfig;
  trailingUnderscore?: _TsNamingConventionUnderscoreOptions;
  filter?: (string | _TsNamingConvention_MatchRegexConfig);
  selector: "typeParameter";
  modifiers?: ("unused")[];
} | {
  custom?: _TsNamingConvention_MatchRegexConfig;
  failureMessage?: string;
  format: _TsNamingConventionFormatOptionsConfig;
  leadingUnderscore?: _TsNamingConventionUnderscoreOptions;
  prefix?: _TsNamingConvention_PrefixSuffixConfig;
  suffix?: _TsNamingConvention_PrefixSuffixConfig;
  trailingUnderscore?: _TsNamingConventionUnderscoreOptions;
  filter?: (string | _TsNamingConvention_MatchRegexConfig);
  selector: "import";
  modifiers?: ("default" | "namespace")[];
})[];
interface _TsNamingConvention_MatchRegexConfig {
  match: boolean;
  regex: string;
}
// ----- ts/no-base-to-string -----
type TsNoBaseToString = [] | [{
  checkUnknown?: boolean;
  ignoredTypeNames?: string[];
}];
// ----- ts/no-confusing-void-expression -----
type TsNoConfusingVoidExpression = [] | [{
  ignoreArrowShorthand?: boolean;
  ignoreVoidOperator?: boolean;
  ignoreVoidReturningFunctions?: boolean;
}];
// ----- ts/no-deprecated -----
type TsNoDeprecated = [] | [{
  allow?: (string | {
    from: "file";
    name: (string | [string, ...(string)[]]);
    path?: string;
  } | {
    from: "lib";
    name: (string | [string, ...(string)[]]);
  } | {
    from: "package";
    name: (string | [string, ...(string)[]]);
    package: string;
  })[];
}];
// ----- ts/no-duplicate-type-constituents -----
type TsNoDuplicateTypeConstituents = [] | [{
  ignoreIntersections?: boolean;
  ignoreUnions?: boolean;
}];
// ----- ts/no-empty-function -----
type TsNoEmptyFunction = [] | [{
  allow?: ("functions" | "arrowFunctions" | "generatorFunctions" | "methods" | "generatorMethods" | "getters" | "setters" | "constructors" | "private-constructors" | "protected-constructors" | "asyncFunctions" | "asyncMethods" | "decoratedFunctions" | "overrideMethods")[];
}];
// ----- ts/no-empty-interface -----
type TsNoEmptyInterface = [] | [{
  allowSingleExtends?: boolean;
}];
// ----- ts/no-empty-object-type -----
type TsNoEmptyObjectType = [] | [{
  allowInterfaces?: ("always" | "never" | "with-single-extends");
  allowObjectTypes?: ("always" | "never");
  allowWithName?: string;
}];
// ----- ts/no-explicit-any -----
type TsNoExplicitAny = [] | [{
  fixToUnknown?: boolean;
  ignoreRestArgs?: boolean;
}];
// ----- ts/no-extraneous-class -----
type TsNoExtraneousClass = [] | [{
  allowConstructorOnly?: boolean;
  allowEmpty?: boolean;
  allowStaticOnly?: boolean;
  allowWithDecorator?: boolean;
}];
// ----- ts/no-floating-promises -----
type TsNoFloatingPromises = [] | [{
  allowForKnownSafeCalls?: (string | {
    from: "file";
    name: (string | [string, ...(string)[]]);
    path?: string;
  } | {
    from: "lib";
    name: (string | [string, ...(string)[]]);
  } | {
    from: "package";
    name: (string | [string, ...(string)[]]);
    package: string;
  })[];
  allowForKnownSafePromises?: (string | {
    from: "file";
    name: (string | [string, ...(string)[]]);
    path?: string;
  } | {
    from: "lib";
    name: (string | [string, ...(string)[]]);
  } | {
    from: "package";
    name: (string | [string, ...(string)[]]);
    package: string;
  })[];
  checkThenables?: boolean;
  ignoreIIFE?: boolean;
  ignoreVoid?: boolean;
}];
// ----- ts/no-inferrable-types -----
type TsNoInferrableTypes = [] | [{
  ignoreParameters?: boolean;
  ignoreProperties?: boolean;
}];
// ----- ts/no-invalid-this -----
type TsNoInvalidThis = [] | [{
  capIsConstructor?: boolean;
}];
// ----- ts/no-invalid-void-type -----
type TsNoInvalidVoidType = [] | [{
  allowAsThisParameter?: boolean;
  allowInGenericTypeArguments?: (boolean | [string, ...(string)[]]);
}];
// ----- ts/no-magic-numbers -----
type TsNoMagicNumbers = [] | [{
  detectObjects?: boolean;
  enforceConst?: boolean;
  ignore?: (number | string)[];
  ignoreArrayIndexes?: boolean;
  ignoreDefaultValues?: boolean;
  ignoreClassFieldInitialValues?: boolean;
  ignoreEnums?: boolean;
  ignoreNumericLiteralTypes?: boolean;
  ignoreReadonlyClassProperties?: boolean;
  ignoreTypeIndexes?: boolean;
}];
// ----- ts/no-meaningless-void-operator -----
type TsNoMeaninglessVoidOperator = [] | [{
  checkNever?: boolean;
}];
// ----- ts/no-misused-promises -----
type TsNoMisusedPromises = [] | [{
  checksConditionals?: boolean;
  checksSpreads?: boolean;
  checksVoidReturn?: (boolean | {
    arguments?: boolean;
    attributes?: boolean;
    inheritedMethods?: boolean;
    properties?: boolean;
    returns?: boolean;
    variables?: boolean;
  });
}];
// ----- ts/no-misused-spread -----
type TsNoMisusedSpread = [] | [{
  allow?: (string | {
    from: "file";
    name: (string | [string, ...(string)[]]);
    path?: string;
  } | {
    from: "lib";
    name: (string | [string, ...(string)[]]);
  } | {
    from: "package";
    name: (string | [string, ...(string)[]]);
    package: string;
  })[];
}];
// ----- ts/no-namespace -----
type TsNoNamespace = [] | [{
  allowDeclarations?: boolean;
  allowDefinitionFiles?: boolean;
}];
// ----- ts/no-redeclare -----
type TsNoRedeclare = [] | [{
  builtinGlobals?: boolean;
  ignoreDeclarationMerge?: boolean;
}];
// ----- ts/no-require-imports -----
type TsNoRequireImports = [] | [{
  allow?: string[];
  allowAsImport?: boolean;
}];
// ----- ts/no-restricted-imports -----
type TsNoRestrictedImports = ((string | {
  name: string;
  message?: string;
  importNames?: string[];
  allowImportNames?: string[];
  allowTypeImports?: boolean;
})[] | [] | [{
  paths?: (string | {
    name: string;
    message?: string;
    importNames?: string[];
    allowImportNames?: string[];
    allowTypeImports?: boolean;
  })[];
  patterns?: (string[] | {
    importNames?: [string, ...(string)[]];
    allowImportNames?: [string, ...(string)[]];
    group?: [string, ...(string)[]];
    regex?: string;
    importNamePattern?: string;
    allowImportNamePattern?: string;
    message?: string;
    caseSensitive?: boolean;
    allowTypeImports?: boolean;
  }[]);
}]);
// ----- ts/no-restricted-types -----
type TsNoRestrictedTypes = [] | [{
  types?: {
    [k: string]: (true | string | {
      fixWith?: string;
      message?: string;
      suggest?: string[];
    }) | undefined;
  };
}];
// ----- ts/no-shadow -----
type TsNoShadow = [] | [{
  allow?: string[];
  builtinGlobals?: boolean;
  hoist?: ("all" | "functions" | "functions-and-types" | "never" | "types");
  ignoreFunctionTypeParameterNameValueShadow?: boolean;
  ignoreOnInitialization?: boolean;
  ignoreTypeValueShadow?: boolean;
}];
// ----- ts/no-this-alias -----
type TsNoThisAlias = [] | [{
  allowDestructuring?: boolean;
  allowedNames?: string[];
}];
// ----- ts/no-type-alias -----
type TsNoTypeAlias = [] | [{
  allowAliases?: ("always" | "never" | "in-unions" | "in-intersections" | "in-unions-and-intersections");
  allowCallbacks?: ("always" | "never");
  allowConditionalTypes?: ("always" | "never");
  allowConstructors?: ("always" | "never");
  allowGenerics?: ("always" | "never");
  allowLiterals?: ("always" | "never" | "in-unions" | "in-intersections" | "in-unions-and-intersections");
  allowMappedTypes?: ("always" | "never" | "in-unions" | "in-intersections" | "in-unions-and-intersections");
  allowTupleTypes?: ("always" | "never" | "in-unions" | "in-intersections" | "in-unions-and-intersections");
}];
// ----- ts/no-unnecessary-boolean-literal-compare -----
type TsNoUnnecessaryBooleanLiteralCompare = [] | [{
  allowComparingNullableBooleansToFalse?: boolean;
  allowComparingNullableBooleansToTrue?: boolean;
  allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing?: boolean;
}];
// ----- ts/no-unnecessary-condition -----
type TsNoUnnecessaryCondition = [] | [{
  allowConstantLoopConditions?: (boolean | ("always" | "never" | "only-allowed-literals"));
  allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing?: boolean;
  checkTypePredicates?: boolean;
}];
// ----- ts/no-unnecessary-type-assertion -----
type TsNoUnnecessaryTypeAssertion = [] | [{
  checkLiteralConstAssertions?: boolean;
  typesToIgnore?: string[];
}];
// ----- ts/no-unsafe-member-access -----
type TsNoUnsafeMemberAccess = [] | [{
  allowOptionalChaining?: boolean;
}];
// ----- ts/no-unused-expressions -----
type TsNoUnusedExpressions = [] | [{
  allowShortCircuit?: boolean;
  allowTernary?: boolean;
  allowTaggedTemplates?: boolean;
  enforceForJSX?: boolean;
  ignoreDirectives?: boolean;
}];
// ----- ts/no-unused-vars -----
type TsNoUnusedVars = [] | [(("all" | "local") | {
  args?: ("all" | "after-used" | "none");
  argsIgnorePattern?: string;
  caughtErrors?: ("all" | "none");
  caughtErrorsIgnorePattern?: string;
  destructuredArrayIgnorePattern?: string;
  ignoreClassWithStaticInitBlock?: boolean;
  ignoreRestSiblings?: boolean;
  ignoreUsingDeclarations?: boolean;
  reportUsedIgnorePattern?: boolean;
  vars?: ("all" | "local");
  varsIgnorePattern?: string;
})];
// ----- ts/no-use-before-define -----
type TsNoUseBeforeDefine = [] | [("nofunc" | {
  allowNamedExports?: boolean;
  classes?: boolean;
  enums?: boolean;
  functions?: boolean;
  ignoreTypeReferences?: boolean;
  typedefs?: boolean;
  variables?: boolean;
})];
// ----- ts/no-var-requires -----
type TsNoVarRequires = [] | [{
  allow?: string[];
}];
// ----- ts/only-throw-error -----
type TsOnlyThrowError = [] | [{
  allow?: (string | {
    from: "file";
    name: (string | [string, ...(string)[]]);
    path?: string;
  } | {
    from: "lib";
    name: (string | [string, ...(string)[]]);
  } | {
    from: "package";
    name: (string | [string, ...(string)[]]);
    package: string;
  })[];
  allowRethrowing?: boolean;
  allowThrowingAny?: boolean;
  allowThrowingUnknown?: boolean;
}];
// ----- ts/parameter-properties -----
type TsParameterProperties = [] | [{
  allow?: ("readonly" | "private" | "protected" | "public" | "private readonly" | "protected readonly" | "public readonly")[];
  prefer?: ("class-property" | "parameter-property");
}];
// ----- ts/prefer-destructuring -----
type TsPreferDestructuring = [] | [({
  AssignmentExpression?: {
    array?: boolean;
    object?: boolean;
  };
  VariableDeclarator?: {
    array?: boolean;
    object?: boolean;
  };
} | {
  array?: boolean;
  object?: boolean;
})] | [({
  AssignmentExpression?: {
    array?: boolean;
    object?: boolean;
  };
  VariableDeclarator?: {
    array?: boolean;
    object?: boolean;
  };
} | {
  array?: boolean;
  object?: boolean;
}), {
  enforceForDeclarationWithTypeAnnotation?: boolean;
  enforceForRenamedProperties?: boolean;
}];
// ----- ts/prefer-literal-enum-member -----
type TsPreferLiteralEnumMember = [] | [{
  allowBitwiseExpressions?: boolean;
}];
// ----- ts/prefer-nullish-coalescing -----
type TsPreferNullishCoalescing = [] | [{
  allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing?: boolean;
  ignoreBooleanCoercion?: boolean;
  ignoreConditionalTests?: boolean;
  ignoreIfStatements?: boolean;
  ignoreMixedLogicalExpressions?: boolean;
  ignorePrimitives?: ({
    bigint?: boolean;
    boolean?: boolean;
    number?: boolean;
    string?: boolean;
  } | true);
  ignoreTernaryTests?: boolean;
}];
// ----- ts/prefer-optional-chain -----
type TsPreferOptionalChain = [] | [{
  allowPotentiallyUnsafeFixesThatModifyTheReturnTypeIKnowWhatImDoing?: boolean;
  checkAny?: boolean;
  checkBigInt?: boolean;
  checkBoolean?: boolean;
  checkNumber?: boolean;
  checkString?: boolean;
  checkUnknown?: boolean;
  requireNullish?: boolean;
}];
// ----- ts/prefer-promise-reject-errors -----
type TsPreferPromiseRejectErrors = [] | [{
  allowEmptyReject?: boolean;
  allowThrowingAny?: boolean;
  allowThrowingUnknown?: boolean;
}];
// ----- ts/prefer-readonly -----
type TsPreferReadonly = [] | [{
  onlyInlineLambdas?: boolean;
}];
// ----- ts/prefer-readonly-parameter-types -----
type TsPreferReadonlyParameterTypes = [] | [{
  allow?: (string | {
    from: "file";
    name: (string | [string, ...(string)[]]);
    path?: string;
  } | {
    from: "lib";
    name: (string | [string, ...(string)[]]);
  } | {
    from: "package";
    name: (string | [string, ...(string)[]]);
    package: string;
  })[];
  checkParameterProperties?: boolean;
  ignoreInferredTypes?: boolean;
  treatMethodsAsReadonly?: boolean;
}];
// ----- ts/prefer-string-starts-ends-with -----
type TsPreferStringStartsEndsWith = [] | [{
  allowSingleElementEquality?: ("always" | "never");
}];
// ----- ts/promise-function-async -----
type TsPromiseFunctionAsync = [] | [{
  allowAny?: boolean;
  allowedPromiseNames?: string[];
  checkArrowFunctions?: boolean;
  checkFunctionDeclarations?: boolean;
  checkFunctionExpressions?: boolean;
  checkMethodDeclarations?: boolean;
}];
// ----- ts/require-array-sort-compare -----
type TsRequireArraySortCompare = [] | [{
  ignoreStringArrays?: boolean;
}];
// ----- ts/restrict-plus-operands -----
type TsRestrictPlusOperands = [] | [{
  allowAny?: boolean;
  allowBoolean?: boolean;
  allowNullish?: boolean;
  allowNumberAndString?: boolean;
  allowRegExp?: boolean;
  skipCompoundAssignments?: boolean;
}];
// ----- ts/restrict-template-expressions -----
type TsRestrictTemplateExpressions = [] | [{
  allowAny?: boolean;
  allowArray?: boolean;
  allowBoolean?: boolean;
  allowNullish?: boolean;
  allowNumber?: boolean;
  allowRegExp?: boolean;
  allowNever?: boolean;
  allow?: (string | {
    from: "file";
    name: (string | [string, ...(string)[]]);
    path?: string;
  } | {
    from: "lib";
    name: (string | [string, ...(string)[]]);
  } | {
    from: "package";
    name: (string | [string, ...(string)[]]);
    package: string;
  })[];
}];
// ----- ts/return-await -----
type TsReturnAwait = [] | [(("always" | "error-handling-correctness-only" | "in-try-catch" | "never") & string)];
// ----- ts/sort-type-constituents -----
type TsSortTypeConstituents = [] | [{
  caseSensitive?: boolean;
  checkIntersections?: boolean;
  checkUnions?: boolean;
  groupOrder?: ("conditional" | "function" | "import" | "intersection" | "keyword" | "nullish" | "literal" | "named" | "object" | "operator" | "tuple" | "union")[];
}];
// ----- ts/strict-boolean-expressions -----
type TsStrictBooleanExpressions = [] | [{
  allowAny?: boolean;
  allowNullableBoolean?: boolean;
  allowNullableEnum?: boolean;
  allowNullableNumber?: boolean;
  allowNullableObject?: boolean;
  allowNullableString?: boolean;
  allowNumber?: boolean;
  allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing?: boolean;
  allowString?: boolean;
}];
// ----- ts/switch-exhaustiveness-check -----
type TsSwitchExhaustivenessCheck = [] | [{
  allowDefaultCaseForExhaustiveSwitch?: boolean;
  considerDefaultExhaustiveForUnions?: boolean;
  defaultCaseCommentPattern?: string;
  requireDefaultForNonUnion?: boolean;
}];
// ----- ts/triple-slash-reference -----
type TsTripleSlashReference = [] | [{
  lib?: ("always" | "never");
  path?: ("always" | "never");
  types?: ("always" | "never" | "prefer-import");
}];
// ----- ts/typedef -----
type TsTypedef = [] | [{
  arrayDestructuring?: boolean;
  arrowParameter?: boolean;
  memberVariableDeclaration?: boolean;
  objectDestructuring?: boolean;
  parameter?: boolean;
  propertyDeclaration?: boolean;
  variableDeclaration?: boolean;
  variableDeclarationIgnoreFunction?: boolean;
}];
// ----- ts/unbound-method -----
type TsUnboundMethod = [] | [{
  ignoreStatic?: boolean;
}];
// ----- ts/unified-signatures -----
type TsUnifiedSignatures = [] | [{
  ignoreDifferentlyNamedParameters?: boolean;
  ignoreOverloadsWithDifferentJSDoc?: boolean;
}];
// ----- unicode-bom -----
type UnicodeBom = [] | [("always" | "never")];
// ----- unicorn/better-regex -----
type UnicornBetterRegex = [] | [{
  sortCharacterClasses?: boolean;
}];
// ----- unicorn/catch-error-name -----
type UnicornCatchErrorName = [] | [{
  name?: string;
  ignore?: unknown[];
}];
// ----- unicorn/consistent-function-scoping -----
type UnicornConsistentFunctionScoping = [] | [{
  checkArrowFunctions?: boolean;
}];
// ----- unicorn/escape-case -----
type UnicornEscapeCase = [] | [("uppercase" | "lowercase")];
// ----- unicorn/expiring-todo-comments -----
type UnicornExpiringTodoComments = [] | [{
  terms?: string[];
  ignore?: unknown[];
  ignoreDatesOnPullRequests?: boolean;
  allowWarningComments?: boolean;
  date?: string;
}];
// ----- unicorn/explicit-length-check -----
type UnicornExplicitLengthCheck = [] | [{
  "non-zero"?: ("greater-than" | "not-equal");
}];
// ----- unicorn/filename-case -----
type UnicornFilenameCase = [] | [({
  case?: ("camelCase" | "snakeCase" | "kebabCase" | "pascalCase");
  ignore?: unknown[];
  multipleFileExtensions?: boolean;
} | {
  cases?: {
    camelCase?: boolean;
    snakeCase?: boolean;
    kebabCase?: boolean;
    pascalCase?: boolean;
  };
  ignore?: unknown[];
  multipleFileExtensions?: boolean;
})];
// ----- unicorn/import-style -----
type UnicornImportStyle = [] | [{
  checkImport?: boolean;
  checkDynamicImport?: boolean;
  checkExportFrom?: boolean;
  checkRequire?: boolean;
  extendDefaultStyles?: boolean;
  styles?: _UnicornImportStyle_ModuleStyles;
}];
type _UnicornImportStyleStyles = (false | _UnicornImportStyle_BooleanObject) | undefined;
interface _UnicornImportStyle_ModuleStyles {
  [k: string]: _UnicornImportStyleStyles | undefined;
}
interface _UnicornImportStyle_BooleanObject {
  [k: string]: boolean | undefined;
}
// ----- unicorn/no-array-reduce -----
type UnicornNoArrayReduce = [] | [{
  allowSimpleOperations?: boolean;
}];
// ----- unicorn/no-array-reverse -----
type UnicornNoArrayReverse = [] | [{
  allowExpressionStatement?: boolean;
}];
// ----- unicorn/no-array-sort -----
type UnicornNoArraySort = [] | [{
  allowExpressionStatement?: boolean;
}];
// ----- unicorn/no-instanceof-builtins -----
type UnicornNoInstanceofBuiltins = [] | [{
  useErrorIsError?: boolean;
  strategy?: ("loose" | "strict");
  include?: string[];
  exclude?: string[];
}];
// ----- unicorn/no-keyword-prefix -----
type UnicornNoKeywordPrefix = [] | [{
  disallowedPrefixes?: [] | [string];
  checkProperties?: boolean;
  onlyCamelCase?: boolean;
}];
// ----- unicorn/no-null -----
type UnicornNoNull = [] | [{
  checkStrictEquality?: boolean;
}];
// ----- unicorn/no-typeof-undefined -----
type UnicornNoTypeofUndefined = [] | [{
  checkGlobalVariables?: boolean;
}];
// ----- unicorn/no-unnecessary-polyfills -----
type UnicornNoUnnecessaryPolyfills = [] | [{
  targets: (string | unknown[] | {
    [k: string]: unknown | undefined;
  });
}];
// ----- unicorn/no-useless-undefined -----
type UnicornNoUselessUndefined = [] | [{
  checkArguments?: boolean;
  checkArrowFunctionBody?: boolean;
}];
// ----- unicorn/number-literal-case -----
type UnicornNumberLiteralCase = [] | [{
  hexadecimalValue?: ("uppercase" | "lowercase");
}];
// ----- unicorn/numeric-separators-style -----
type UnicornNumericSeparatorsStyle = [] | [{
  binary?: {
    onlyIfContainsSeparator?: boolean;
    minimumDigits?: number;
    groupLength?: number;
  };
  octal?: {
    onlyIfContainsSeparator?: boolean;
    minimumDigits?: number;
    groupLength?: number;
  };
  hexadecimal?: {
    onlyIfContainsSeparator?: boolean;
    minimumDigits?: number;
    groupLength?: number;
  };
  number?: {
    onlyIfContainsSeparator?: boolean;
    minimumDigits?: number;
    groupLength?: number;
  };
  onlyIfContainsSeparator?: boolean;
}];
// ----- unicorn/prefer-add-event-listener -----
type UnicornPreferAddEventListener = [] | [{
  excludedPackages?: string[];
}];
// ----- unicorn/prefer-array-find -----
type UnicornPreferArrayFind = [] | [{
  checkFromLast?: boolean;
}];
// ----- unicorn/prefer-array-flat -----
type UnicornPreferArrayFlat = [] | [{
  functions?: unknown[];
}];
// ----- unicorn/prefer-at -----
type UnicornPreferAt = [] | [{
  getLastElementFunctions?: unknown[];
  checkAllIndexAccess?: boolean;
}];
// ----- unicorn/prefer-export-from -----
type UnicornPreferExportFrom = [] | [{
  ignoreUsedVariables?: boolean;
}];
// ----- unicorn/prefer-number-properties -----
type UnicornPreferNumberProperties = [] | [{
  checkInfinity?: boolean;
  checkNaN?: boolean;
}];
// ----- unicorn/prefer-object-from-entries -----
type UnicornPreferObjectFromEntries = [] | [{
  functions?: unknown[];
}];
// ----- unicorn/prefer-single-call -----
type UnicornPreferSingleCall = [] | [{
  ignore?: unknown[];
}];
// ----- unicorn/prefer-structured-clone -----
type UnicornPreferStructuredClone = [] | [{
  functions?: unknown[];
}];
// ----- unicorn/prefer-switch -----
type UnicornPreferSwitch = [] | [{
  minimumCases?: number;
  emptyDefaultCase?: ("no-default-comment" | "do-nothing-comment" | "no-default-case");
}];
// ----- unicorn/prefer-ternary -----
type UnicornPreferTernary = [] | [("always" | "only-single-line")];
// ----- unicorn/prevent-abbreviations -----
type UnicornPreventAbbreviations = [] | [{
  checkProperties?: boolean;
  checkVariables?: boolean;
  checkDefaultAndNamespaceImports?: (boolean | string);
  checkShorthandImports?: (boolean | string);
  checkShorthandProperties?: boolean;
  checkFilenames?: boolean;
  extendDefaultReplacements?: boolean;
  replacements?: _UnicornPreventAbbreviations_Abbreviations;
  extendDefaultAllowList?: boolean;
  allowList?: _UnicornPreventAbbreviations_BooleanObject;
  ignore?: unknown[];
}];
type _UnicornPreventAbbreviationsReplacements = (false | _UnicornPreventAbbreviations_BooleanObject) | undefined;
interface _UnicornPreventAbbreviations_Abbreviations {
  [k: string]: _UnicornPreventAbbreviationsReplacements | undefined;
}
interface _UnicornPreventAbbreviations_BooleanObject {
  [k: string]: boolean | undefined;
}
// ----- unicorn/relative-url-style -----
type UnicornRelativeUrlStyle = [] | [("never" | "always")];
// ----- unicorn/string-content -----
type UnicornStringContent = [] | [{
  patterns?: {
    [k: string]: (string | {
      suggest: string;
      fix?: boolean;
      message?: string;
    }) | undefined;
  };
}];
// ----- unicorn/switch-case-braces -----
type UnicornSwitchCaseBraces = [] | [("always" | "avoid")];
// ----- unicorn/template-indent -----
type UnicornTemplateIndent = [] | [{
  indent?: (string | number);
  tags?: string[];
  functions?: string[];
  selectors?: string[];
  comments?: string[];
}];
// ----- unicorn/text-encoding-identifier-case -----
type UnicornTextEncodingIdentifierCase = [] | [{
  withDash?: boolean;
}];
// ----- unocss/enforce-class-compile -----
type UnocssEnforceClassCompile = [] | [{
  prefix?: string;
  enableFix?: boolean;
}];
// ----- unocss/order -----
type UnocssOrder = [] | [{
  unoFunctions?: string[];
  unoVariables?: string[];
}];
// ----- unused-imports/no-unused-imports -----
type UnusedImportsNoUnusedImports = [] | [(("all" | "local") | {
  args?: ("all" | "after-used" | "none");
  argsIgnorePattern?: string;
  caughtErrors?: ("all" | "none");
  caughtErrorsIgnorePattern?: string;
  destructuredArrayIgnorePattern?: string;
  ignoreClassWithStaticInitBlock?: boolean;
  ignoreRestSiblings?: boolean;
  ignoreUsingDeclarations?: boolean;
  reportUsedIgnorePattern?: boolean;
  vars?: ("all" | "local");
  varsIgnorePattern?: string;
})];
// ----- unused-imports/no-unused-vars -----
type UnusedImportsNoUnusedVars = [] | [(("all" | "local") | {
  args?: ("all" | "after-used" | "none");
  argsIgnorePattern?: string;
  caughtErrors?: ("all" | "none");
  caughtErrorsIgnorePattern?: string;
  destructuredArrayIgnorePattern?: string;
  ignoreClassWithStaticInitBlock?: boolean;
  ignoreRestSiblings?: boolean;
  ignoreUsingDeclarations?: boolean;
  reportUsedIgnorePattern?: boolean;
  vars?: ("all" | "local");
  varsIgnorePattern?: string;
})];
// ----- use-isnan -----
type UseIsnan = [] | [{
  enforceForSwitchCase?: boolean;
  enforceForIndexOf?: boolean;
}];
// ----- valid-typeof -----
type ValidTypeof = [] | [{
  requireStringLiterals?: boolean;
}];
// ----- vue-a11y/alt-text -----
type VueA11YAltText = [] | [{
  elements?: string[];
  img?: string[];
  object?: string[];
  area?: string[];
  "input[type=\"image\"]"?: string[];
  [k: string]: unknown | undefined;
}];
// ----- vue-a11y/anchor-has-content -----
type VueA11YAnchorHasContent = [] | [{
  components?: string[];
  accessibleChildren?: string[];
  accessibleDirectives?: string[];
  [k: string]: unknown | undefined;
}];
// ----- vue-a11y/aria-role -----
type VueA11YAriaRole = [] | [{
  ignoreNonDOM?: boolean;
}];
// ----- vue-a11y/form-control-has-label -----
type VueA11YFormControlHasLabel = [] | [{
  labelComponents?: string[];
  controlComponents?: string[];
  [k: string]: unknown | undefined;
}];
// ----- vue-a11y/heading-has-content -----
type VueA11YHeadingHasContent = [] | [{
  components?: string[];
  accessibleChildren?: string[];
  accessibleDirectives?: string[];
  [k: string]: unknown | undefined;
}];
// ----- vue-a11y/interactive-supports-focus -----
type VueA11YInteractiveSupportsFocus = [] | [{
  tabbable?: ("button" | "checkbox" | "columnheader" | "combobox" | "grid" | "gridcell" | "link" | "listbox" | "menu" | "menubar" | "menuitem" | "menuitemcheckbox" | "menuitemradio" | "option" | "progressbar" | "radio" | "radiogroup" | "row" | "rowheader" | "scrollbar" | "searchbox" | "slider" | "spinbutton" | "switch" | "tab" | "tablist" | "textbox" | "tree" | "treegrid" | "treeitem" | "doc-backlink" | "doc-biblioref" | "doc-glossref" | "doc-noteref")[];
  [k: string]: unknown | undefined;
}];
// ----- vue-a11y/label-has-for -----
type VueA11YLabelHasFor = [] | [{
  components?: string[];
  controlComponents?: string[];
  required?: (("nesting" | "id") | {
    some: ("nesting" | "id")[];
    [k: string]: unknown | undefined;
  } | {
    every: ("nesting" | "id")[];
    [k: string]: unknown | undefined;
  });
  allowChildren?: boolean;
  [k: string]: unknown | undefined;
}];
// ----- vue-a11y/media-has-caption -----
type VueA11YMediaHasCaption = [] | [{
  audio?: string[];
  track?: string[];
  video?: string[];
  [k: string]: unknown | undefined;
}];
// ----- vue-a11y/no-autofocus -----
type VueA11YNoAutofocus = [] | [{
  ignoreNonDOM?: boolean;
}];
// ----- vue-a11y/no-distracting-elements -----
type VueA11YNoDistractingElements = [] | [{
  [k: string]: unknown | undefined;
}];
// ----- vue-a11y/no-redundant-roles -----
type VueA11YNoRedundantRoles = [] | [{
  [k: string]: string[] | undefined;
}];
// ----- vue/array-bracket-newline -----
type VueArrayBracketNewline = [] | [(("always" | "never" | "consistent") | {
  multiline?: boolean;
  minItems?: (number | null);
})];
// ----- vue/array-bracket-spacing -----
type VueArrayBracketSpacing = [] | [("always" | "never")] | [("always" | "never"), {
  singleValue?: boolean;
  objectsInArrays?: boolean;
  arraysInArrays?: boolean;
}];
// ----- vue/array-element-newline -----
type VueArrayElementNewline = [] | [(_VueArrayElementNewlineBasicConfig | {
  ArrayExpression?: _VueArrayElementNewlineBasicConfig;
  ArrayPattern?: _VueArrayElementNewlineBasicConfig;
})];
type _VueArrayElementNewlineBasicConfig = (("always" | "never" | "consistent") | {
  multiline?: boolean;
  minItems?: (number | null);
});
// ----- vue/arrow-spacing -----
type VueArrowSpacing = [] | [{
  before?: boolean;
  after?: boolean;
}];
// ----- vue/attribute-hyphenation -----
type VueAttributeHyphenation = [] | [("always" | "never")] | [("always" | "never"), {
  ignore?: (string & {
    [k: string]: unknown | undefined;
  } & {
    [k: string]: unknown | undefined;
  })[];
  ignoreTags?: string[];
}];
// ----- vue/attributes-order -----
type VueAttributesOrder = [] | [{
  order?: (("DEFINITION" | "LIST_RENDERING" | "CONDITIONALS" | "RENDER_MODIFIERS" | "GLOBAL" | "UNIQUE" | "SLOT" | "TWO_WAY_BINDING" | "OTHER_DIRECTIVES" | "OTHER_ATTR" | "ATTR_STATIC" | "ATTR_DYNAMIC" | "ATTR_SHORTHAND_BOOL" | "EVENTS" | "CONTENT") | ("DEFINITION" | "LIST_RENDERING" | "CONDITIONALS" | "RENDER_MODIFIERS" | "GLOBAL" | "UNIQUE" | "SLOT" | "TWO_WAY_BINDING" | "OTHER_DIRECTIVES" | "OTHER_ATTR" | "ATTR_STATIC" | "ATTR_DYNAMIC" | "ATTR_SHORTHAND_BOOL" | "EVENTS" | "CONTENT")[])[];
  alphabetical?: boolean;
  sortLineLength?: boolean;
}];
// ----- vue/block-lang -----
type VueBlockLang = [] | [{
  [k: string]: {
    lang?: (string | string[]);
    allowNoLang?: boolean;
  };
}];
// ----- vue/block-order -----
type VueBlockOrder = [] | [{
  order?: (string | string[])[];
}];
// ----- vue/block-spacing -----
type VueBlockSpacing = [] | [("always" | "never")];
// ----- vue/block-tag-newline -----
type VueBlockTagNewline = [] | [{
  singleline?: ("always" | "never" | "consistent" | "ignore");
  multiline?: ("always" | "never" | "consistent" | "ignore");
  maxEmptyLines?: number;
  blocks?: {
    [k: string]: {
      singleline?: ("always" | "never" | "consistent" | "ignore");
      multiline?: ("always" | "never" | "consistent" | "ignore");
      maxEmptyLines?: number;
    };
  };
}];
// ----- vue/brace-style -----
type VueBraceStyle = [] | [("1tbs" | "stroustrup" | "allman")] | [("1tbs" | "stroustrup" | "allman"), {
  allowSingleLine?: boolean;
}];
// ----- vue/camelcase -----
type VueCamelcase = [] | [{
  ignoreDestructuring?: boolean;
  ignoreImports?: boolean;
  ignoreGlobals?: boolean;
  properties?: ("always" | "never");
  allow?: string[];
}];
// ----- vue/comma-dangle -----
type VueCommaDangle = [] | [(_VueCommaDangleValue | {
  arrays?: _VueCommaDangleValueWithIgnore;
  objects?: _VueCommaDangleValueWithIgnore;
  imports?: _VueCommaDangleValueWithIgnore;
  exports?: _VueCommaDangleValueWithIgnore;
  functions?: _VueCommaDangleValueWithIgnore;
})];
type _VueCommaDangleValue = ("always-multiline" | "always" | "never" | "only-multiline");
type _VueCommaDangleValueWithIgnore = ("always-multiline" | "always" | "ignore" | "never" | "only-multiline");
// ----- vue/comma-spacing -----
type VueCommaSpacing = [] | [{
  before?: boolean;
  after?: boolean;
}];
// ----- vue/comma-style -----
type VueCommaStyle = [] | [("first" | "last")] | [("first" | "last"), {
  exceptions?: {
    [k: string]: boolean | undefined;
  };
}];
// ----- vue/comment-directive -----
type VueCommentDirective = [] | [{
  reportUnusedDisableDirectives?: boolean;
}];
// ----- vue/component-api-style -----
type VueComponentApiStyle = [] | [[("script-setup" | "composition" | "composition-vue2" | "options"), ...(("script-setup" | "composition" | "composition-vue2" | "options"))[]]];
// ----- vue/component-definition-name-casing -----
type VueComponentDefinitionNameCasing = [] | [("PascalCase" | "kebab-case")];
// ----- vue/component-name-in-template-casing -----
type VueComponentNameInTemplateCasing = [] | [("PascalCase" | "kebab-case")] | [("PascalCase" | "kebab-case"), {
  globals?: string[];
  ignores?: string[];
  registeredComponentsOnly?: boolean;
}];
// ----- vue/component-options-name-casing -----
type VueComponentOptionsNameCasing = [] | [("camelCase" | "kebab-case" | "PascalCase")];
// ----- vue/custom-event-name-casing -----
type VueCustomEventNameCasing = [] | [("kebab-case" | "camelCase")] | [("kebab-case" | "camelCase"), {
  ignores?: string[];
}];
// ----- vue/define-emits-declaration -----
type VueDefineEmitsDeclaration = [] | [("type-based" | "type-literal" | "runtime")];
// ----- vue/define-macros-order -----
type VueDefineMacrosOrder = [] | [{
  order?: string[];
  defineExposeLast?: boolean;
}];
// ----- vue/define-props-declaration -----
type VueDefinePropsDeclaration = [] | [("type-based" | "runtime")];
// ----- vue/define-props-destructuring -----
type VueDefinePropsDestructuring = [] | [{
  destructure?: ("always" | "never");
}];
// ----- vue/dot-location -----
type VueDotLocation = [] | [("object" | "property")];
// ----- vue/dot-notation -----
type VueDotNotation = [] | [{
  allowKeywords?: boolean;
  allowPattern?: string;
}];
// ----- vue/enforce-style-attribute -----
type VueEnforceStyleAttribute = [] | [{
  allow?: [("plain" | "scoped" | "module"), ...(("plain" | "scoped" | "module"))[]];
}];
// ----- vue/eqeqeq -----
type VueEqeqeq = ([] | ["always"] | ["always", {
  null?: ("always" | "never" | "ignore");
}] | [] | [("smart" | "allow-null")]);
// ----- vue/first-attribute-linebreak -----
type VueFirstAttributeLinebreak = [] | [{
  multiline?: ("below" | "beside" | "ignore");
  singleline?: ("below" | "beside" | "ignore");
}];
// ----- vue/func-call-spacing -----
type VueFuncCallSpacing = ([] | ["never"] | [] | ["always"] | ["always", {
  allowNewlines?: boolean;
}]);
// ----- vue/html-button-has-type -----
type VueHtmlButtonHasType = [] | [{
  button?: boolean;
  submit?: boolean;
  reset?: boolean;
}];
// ----- vue/html-closing-bracket-newline -----
type VueHtmlClosingBracketNewline = [] | [{
  singleline?: ("always" | "never");
  multiline?: ("always" | "never");
  selfClosingTag?: {
    singleline?: ("always" | "never");
    multiline?: ("always" | "never");
  };
}];
// ----- vue/html-closing-bracket-spacing -----
type VueHtmlClosingBracketSpacing = [] | [{
  startTag?: ("always" | "never");
  endTag?: ("always" | "never");
  selfClosingTag?: ("always" | "never");
}];
// ----- vue/html-comment-content-newline -----
type VueHtmlCommentContentNewline = [] | [(("always" | "never") | {
  singleline?: ("always" | "never" | "ignore");
  multiline?: ("always" | "never" | "ignore");
})] | [(("always" | "never") | {
  singleline?: ("always" | "never" | "ignore");
  multiline?: ("always" | "never" | "ignore");
}), {
  exceptions?: string[];
}];
// ----- vue/html-comment-content-spacing -----
type VueHtmlCommentContentSpacing = [] | [("always" | "never")] | [("always" | "never"), {
  exceptions?: string[];
}];
// ----- vue/html-comment-indent -----
type VueHtmlCommentIndent = [] | [(number | "tab")];
// ----- vue/html-indent -----
type VueHtmlIndent = [] | [(number | "tab")] | [(number | "tab"), {
  attribute?: number;
  baseIndent?: number;
  closeBracket?: (number | {
    startTag?: number;
    endTag?: number;
    selfClosingTag?: number;
  });
  switchCase?: number;
  alignAttributesVertically?: boolean;
  ignores?: (string & {
    [k: string]: unknown | undefined;
  } & {
    [k: string]: unknown | undefined;
  })[];
}];
// ----- vue/html-quotes -----
type VueHtmlQuotes = [] | [("double" | "single")] | [("double" | "single"), {
  avoidEscape?: boolean;
}];
// ----- vue/html-self-closing -----
type VueHtmlSelfClosing = [] | [{
  html?: {
    normal?: _VueHtmlSelfClosingOptionValue;
    void?: _VueHtmlSelfClosingOptionValue;
    component?: _VueHtmlSelfClosingOptionValue;
  };
  svg?: _VueHtmlSelfClosingOptionValue;
  math?: _VueHtmlSelfClosingOptionValue;
}];
type _VueHtmlSelfClosingOptionValue = ("always" | "never" | "any");
// ----- vue/key-spacing -----
type VueKeySpacing = [] | [({
  align?: (("colon" | "value") | {
    mode?: ("strict" | "minimum");
    on?: ("colon" | "value");
    beforeColon?: boolean;
    afterColon?: boolean;
  });
  mode?: ("strict" | "minimum");
  beforeColon?: boolean;
  afterColon?: boolean;
} | {
  singleLine?: {
    mode?: ("strict" | "minimum");
    beforeColon?: boolean;
    afterColon?: boolean;
  };
  multiLine?: {
    align?: (("colon" | "value") | {
      mode?: ("strict" | "minimum");
      on?: ("colon" | "value");
      beforeColon?: boolean;
      afterColon?: boolean;
    });
    mode?: ("strict" | "minimum");
    beforeColon?: boolean;
    afterColon?: boolean;
  };
} | {
  singleLine?: {
    mode?: ("strict" | "minimum");
    beforeColon?: boolean;
    afterColon?: boolean;
  };
  multiLine?: {
    mode?: ("strict" | "minimum");
    beforeColon?: boolean;
    afterColon?: boolean;
  };
  align?: {
    mode?: ("strict" | "minimum");
    on?: ("colon" | "value");
    beforeColon?: boolean;
    afterColon?: boolean;
  };
})];
// ----- vue/keyword-spacing -----
type VueKeywordSpacing = [] | [{
  before?: boolean;
  after?: boolean;
  overrides?: {
    abstract?: {
      before?: boolean;
      after?: boolean;
    };
    as?: {
      before?: boolean;
      after?: boolean;
    };
    async?: {
      before?: boolean;
      after?: boolean;
    };
    await?: {
      before?: boolean;
      after?: boolean;
    };
    boolean?: {
      before?: boolean;
      after?: boolean;
    };
    break?: {
      before?: boolean;
      after?: boolean;
    };
    byte?: {
      before?: boolean;
      after?: boolean;
    };
    case?: {
      before?: boolean;
      after?: boolean;
    };
    catch?: {
      before?: boolean;
      after?: boolean;
    };
    char?: {
      before?: boolean;
      after?: boolean;
    };
    class?: {
      before?: boolean;
      after?: boolean;
    };
    const?: {
      before?: boolean;
      after?: boolean;
    };
    continue?: {
      before?: boolean;
      after?: boolean;
    };
    debugger?: {
      before?: boolean;
      after?: boolean;
    };
    default?: {
      before?: boolean;
      after?: boolean;
    };
    delete?: {
      before?: boolean;
      after?: boolean;
    };
    do?: {
      before?: boolean;
      after?: boolean;
    };
    double?: {
      before?: boolean;
      after?: boolean;
    };
    else?: {
      before?: boolean;
      after?: boolean;
    };
    enum?: {
      before?: boolean;
      after?: boolean;
    };
    export?: {
      before?: boolean;
      after?: boolean;
    };
    extends?: {
      before?: boolean;
      after?: boolean;
    };
    false?: {
      before?: boolean;
      after?: boolean;
    };
    final?: {
      before?: boolean;
      after?: boolean;
    };
    finally?: {
      before?: boolean;
      after?: boolean;
    };
    float?: {
      before?: boolean;
      after?: boolean;
    };
    for?: {
      before?: boolean;
      after?: boolean;
    };
    from?: {
      before?: boolean;
      after?: boolean;
    };
    function?: {
      before?: boolean;
      after?: boolean;
    };
    get?: {
      before?: boolean;
      after?: boolean;
    };
    goto?: {
      before?: boolean;
      after?: boolean;
    };
    if?: {
      before?: boolean;
      after?: boolean;
    };
    implements?: {
      before?: boolean;
      after?: boolean;
    };
    import?: {
      before?: boolean;
      after?: boolean;
    };
    in?: {
      before?: boolean;
      after?: boolean;
    };
    instanceof?: {
      before?: boolean;
      after?: boolean;
    };
    int?: {
      before?: boolean;
      after?: boolean;
    };
    interface?: {
      before?: boolean;
      after?: boolean;
    };
    let?: {
      before?: boolean;
      after?: boolean;
    };
    long?: {
      before?: boolean;
      after?: boolean;
    };
    native?: {
      before?: boolean;
      after?: boolean;
    };
    new?: {
      before?: boolean;
      after?: boolean;
    };
    null?: {
      before?: boolean;
      after?: boolean;
    };
    of?: {
      before?: boolean;
      after?: boolean;
    };
    package?: {
      before?: boolean;
      after?: boolean;
    };
    private?: {
      before?: boolean;
      after?: boolean;
    };
    protected?: {
      before?: boolean;
      after?: boolean;
    };
    public?: {
      before?: boolean;
      after?: boolean;
    };
    return?: {
      before?: boolean;
      after?: boolean;
    };
    set?: {
      before?: boolean;
      after?: boolean;
    };
    short?: {
      before?: boolean;
      after?: boolean;
    };
    static?: {
      before?: boolean;
      after?: boolean;
    };
    super?: {
      before?: boolean;
      after?: boolean;
    };
    switch?: {
      before?: boolean;
      after?: boolean;
    };
    synchronized?: {
      before?: boolean;
      after?: boolean;
    };
    this?: {
      before?: boolean;
      after?: boolean;
    };
    throw?: {
      before?: boolean;
      after?: boolean;
    };
    throws?: {
      before?: boolean;
      after?: boolean;
    };
    transient?: {
      before?: boolean;
      after?: boolean;
    };
    true?: {
      before?: boolean;
      after?: boolean;
    };
    try?: {
      before?: boolean;
      after?: boolean;
    };
    typeof?: {
      before?: boolean;
      after?: boolean;
    };
    var?: {
      before?: boolean;
      after?: boolean;
    };
    void?: {
      before?: boolean;
      after?: boolean;
    };
    volatile?: {
      before?: boolean;
      after?: boolean;
    };
    while?: {
      before?: boolean;
      after?: boolean;
    };
    with?: {
      before?: boolean;
      after?: boolean;
    };
    yield?: {
      before?: boolean;
      after?: boolean;
    };
  };
}];
// ----- vue/match-component-file-name -----
type VueMatchComponentFileName = [] | [{
  extensions?: string[];
  shouldMatchCase?: boolean;
}];
// ----- vue/max-attributes-per-line -----
type VueMaxAttributesPerLine = [] | [{
  singleline?: (number | {
    max?: number;
  });
  multiline?: (number | {
    max?: number;
  });
}];
// ----- vue/max-len -----
type VueMaxLen = [] | [({
  code?: number;
  template?: number;
  comments?: number;
  tabWidth?: number;
  ignorePattern?: string;
  ignoreComments?: boolean;
  ignoreTrailingComments?: boolean;
  ignoreUrls?: boolean;
  ignoreStrings?: boolean;
  ignoreTemplateLiterals?: boolean;
  ignoreRegExpLiterals?: boolean;
  ignoreHTMLAttributeValues?: boolean;
  ignoreHTMLTextContents?: boolean;
} | number)] | [({
  code?: number;
  template?: number;
  comments?: number;
  tabWidth?: number;
  ignorePattern?: string;
  ignoreComments?: boolean;
  ignoreTrailingComments?: boolean;
  ignoreUrls?: boolean;
  ignoreStrings?: boolean;
  ignoreTemplateLiterals?: boolean;
  ignoreRegExpLiterals?: boolean;
  ignoreHTMLAttributeValues?: boolean;
  ignoreHTMLTextContents?: boolean;
} | number), ({
  code?: number;
  template?: number;
  comments?: number;
  tabWidth?: number;
  ignorePattern?: string;
  ignoreComments?: boolean;
  ignoreTrailingComments?: boolean;
  ignoreUrls?: boolean;
  ignoreStrings?: boolean;
  ignoreTemplateLiterals?: boolean;
  ignoreRegExpLiterals?: boolean;
  ignoreHTMLAttributeValues?: boolean;
  ignoreHTMLTextContents?: boolean;
} | number)] | [({
  code?: number;
  template?: number;
  comments?: number;
  tabWidth?: number;
  ignorePattern?: string;
  ignoreComments?: boolean;
  ignoreTrailingComments?: boolean;
  ignoreUrls?: boolean;
  ignoreStrings?: boolean;
  ignoreTemplateLiterals?: boolean;
  ignoreRegExpLiterals?: boolean;
  ignoreHTMLAttributeValues?: boolean;
  ignoreHTMLTextContents?: boolean;
} | number), ({
  code?: number;
  template?: number;
  comments?: number;
  tabWidth?: number;
  ignorePattern?: string;
  ignoreComments?: boolean;
  ignoreTrailingComments?: boolean;
  ignoreUrls?: boolean;
  ignoreStrings?: boolean;
  ignoreTemplateLiterals?: boolean;
  ignoreRegExpLiterals?: boolean;
  ignoreHTMLAttributeValues?: boolean;
  ignoreHTMLTextContents?: boolean;
} | number), {
  code?: number;
  template?: number;
  comments?: number;
  tabWidth?: number;
  ignorePattern?: string;
  ignoreComments?: boolean;
  ignoreTrailingComments?: boolean;
  ignoreUrls?: boolean;
  ignoreStrings?: boolean;
  ignoreTemplateLiterals?: boolean;
  ignoreRegExpLiterals?: boolean;
  ignoreHTMLAttributeValues?: boolean;
  ignoreHTMLTextContents?: boolean;
}];
// ----- vue/max-lines-per-block -----
type VueMaxLinesPerBlock = [] | [{
  style?: number;
  template?: number;
  script?: number;
  skipBlankLines?: boolean;
}];
// ----- vue/max-props -----
type VueMaxProps = [] | [{
  maxProps?: number;
}];
// ----- vue/max-template-depth -----
type VueMaxTemplateDepth = [] | [{
  maxDepth?: number;
}];
// ----- vue/multi-word-component-names -----
type VueMultiWordComponentNames = [] | [{
  ignores?: string[];
}];
// ----- vue/multiline-html-element-content-newline -----
type VueMultilineHtmlElementContentNewline = [] | [{
  ignoreWhenEmpty?: boolean;
  ignores?: string[];
  allowEmptyLines?: boolean;
}];
// ----- vue/multiline-ternary -----
type VueMultilineTernary = [] | [("always" | "always-multiline" | "never")];
// ----- vue/mustache-interpolation-spacing -----
type VueMustacheInterpolationSpacing = [] | [("always" | "never")];
// ----- vue/new-line-between-multi-line-property -----
type VueNewLineBetweenMultiLineProperty = [] | [{
  minLineOfMultilineProperty?: number;
}];
// ----- vue/next-tick-style -----
type VueNextTickStyle = [] | [("promise" | "callback")];
// ----- vue/no-async-in-computed-properties -----
type VueNoAsyncInComputedProperties = [] | [{
  ignoredObjectNames?: string[];
}];
// ----- vue/no-bare-strings-in-template -----
type VueNoBareStringsInTemplate = [] | [{
  allowlist?: string[];
  attributes?: {
    [k: string]: string[];
  };
  directives?: string[];
}];
// ----- vue/no-boolean-default -----
type VueNoBooleanDefault = [] | [("default-false" | "no-default")];
// ----- vue/no-child-content -----
type VueNoChildContent = [] | [{
  additionalDirectives: [string, ...(string)[]];
}];
// ----- vue/no-console -----
type VueNoConsole = [] | [{
  allow?: [string, ...(string)[]];
}];
// ----- vue/no-constant-condition -----
type VueNoConstantCondition = [] | [{
  checkLoops?: ("all" | "allExceptWhileTrue" | "none" | true | false);
}];
// ----- vue/no-deprecated-model-definition -----
type VueNoDeprecatedModelDefinition = [] | [{
  allowVue3Compat?: boolean;
}];
// ----- vue/no-deprecated-router-link-tag-prop -----
type VueNoDeprecatedRouterLinkTagProp = [] | [{
  components?: [string, ...(string)[]];
}];
// ----- vue/no-deprecated-slot-attribute -----
type VueNoDeprecatedSlotAttribute = [] | [{
  ignore?: string[];
  ignoreParents?: string[];
}];
// ----- vue/no-dupe-keys -----
type VueNoDupeKeys = [] | [{
  groups?: unknown[];
}];
// ----- vue/no-duplicate-attr-inheritance -----
type VueNoDuplicateAttrInheritance = [] | [{
  checkMultiRootNodes?: boolean;
}];
// ----- vue/no-duplicate-attributes -----
type VueNoDuplicateAttributes = [] | [{
  allowCoexistClass?: boolean;
  allowCoexistStyle?: boolean;
}];
// ----- vue/no-empty-pattern -----
type VueNoEmptyPattern = [] | [{
  allowObjectPatternsAsParameters?: boolean;
}];
// ----- vue/no-extra-parens -----
type VueNoExtraParens = ([] | ["functions"] | [] | ["all"] | ["all", {
  conditionalAssign?: boolean;
  ternaryOperandBinaryExpressions?: boolean;
  nestedBinaryExpressions?: boolean;
  returnAssign?: boolean;
  ignoreJSX?: ("none" | "all" | "single-line" | "multi-line");
  enforceForArrowConditionals?: boolean;
  enforceForSequenceExpressions?: boolean;
  enforceForNewInMemberExpressions?: boolean;
  enforceForFunctionPrototypeMethods?: boolean;
  allowParensAfterCommentPattern?: string;
}]);
// ----- vue/no-implicit-coercion -----
type VueNoImplicitCoercion = [] | [{
  boolean?: boolean;
  number?: boolean;
  string?: boolean;
  disallowTemplateShorthand?: boolean;
  allow?: ("~" | "!!" | "+" | "- -" | "-" | "*")[];
}];
// ----- vue/no-irregular-whitespace -----
type VueNoIrregularWhitespace = [] | [{
  skipComments?: boolean;
  skipStrings?: boolean;
  skipTemplates?: boolean;
  skipRegExps?: boolean;
  skipHTMLAttributeValues?: boolean;
  skipHTMLTextContents?: boolean;
}];
// ----- vue/no-lone-template -----
type VueNoLoneTemplate = [] | [{
  ignoreAccessible?: boolean;
}];
// ----- vue/no-multi-spaces -----
type VueNoMultiSpaces = [] | [{
  ignoreProperties?: boolean;
}];
// ----- vue/no-multiple-template-root -----
type VueNoMultipleTemplateRoot = [] | [{
  disallowComments?: boolean;
}];
// ----- vue/no-mutating-props -----
type VueNoMutatingProps = [] | [{
  shallowOnly?: boolean;
}];
// ----- vue/no-parsing-error -----
type VueNoParsingError = [] | [{
  "abrupt-closing-of-empty-comment"?: boolean;
  "absence-of-digits-in-numeric-character-reference"?: boolean;
  "cdata-in-html-content"?: boolean;
  "character-reference-outside-unicode-range"?: boolean;
  "control-character-in-input-stream"?: boolean;
  "control-character-reference"?: boolean;
  "eof-before-tag-name"?: boolean;
  "eof-in-cdata"?: boolean;
  "eof-in-comment"?: boolean;
  "eof-in-tag"?: boolean;
  "incorrectly-closed-comment"?: boolean;
  "incorrectly-opened-comment"?: boolean;
  "invalid-first-character-of-tag-name"?: boolean;
  "missing-attribute-value"?: boolean;
  "missing-end-tag-name"?: boolean;
  "missing-semicolon-after-character-reference"?: boolean;
  "missing-whitespace-between-attributes"?: boolean;
  "nested-comment"?: boolean;
  "noncharacter-character-reference"?: boolean;
  "noncharacter-in-input-stream"?: boolean;
  "null-character-reference"?: boolean;
  "surrogate-character-reference"?: boolean;
  "surrogate-in-input-stream"?: boolean;
  "unexpected-character-in-attribute-name"?: boolean;
  "unexpected-character-in-unquoted-attribute-value"?: boolean;
  "unexpected-equals-sign-before-attribute-name"?: boolean;
  "unexpected-null-character"?: boolean;
  "unexpected-question-mark-instead-of-tag-name"?: boolean;
  "unexpected-solidus-in-tag"?: boolean;
  "unknown-named-character-reference"?: boolean;
  "end-tag-with-attributes"?: boolean;
  "duplicate-attribute"?: boolean;
  "end-tag-with-trailing-solidus"?: boolean;
  "non-void-html-element-start-tag-with-trailing-solidus"?: boolean;
  "x-invalid-end-tag"?: boolean;
  "x-invalid-namespace"?: boolean;
}];
// ----- vue/no-potential-component-option-typo -----
type VueNoPotentialComponentOptionTypo = [] | [{
  presets?: ("all" | "vue" | "vue-router" | "nuxt")[];
  custom?: string[];
  threshold?: number;
}];
// ----- vue/no-required-prop-with-default -----
type VueNoRequiredPropWithDefault = [] | [{
  autofix?: boolean;
}];
// ----- vue/no-reserved-component-names -----
type VueNoReservedComponentNames = [] | [{
  disallowVueBuiltInComponents?: boolean;
  disallowVue3BuiltInComponents?: boolean;
  htmlElementCaseSensitive?: boolean;
}];
// ----- vue/no-reserved-keys -----
type VueNoReservedKeys = [] | [{
  reserved?: unknown[];
  groups?: unknown[];
}];
// ----- vue/no-reserved-props -----
type VueNoReservedProps = [] | [{
  vueVersion?: (2 | 3);
}];
// ----- vue/no-restricted-block -----
type VueNoRestrictedBlock = (string | {
  element: string;
  message?: string;
})[];
// ----- vue/no-restricted-call-after-await -----
type VueNoRestrictedCallAfterAwait = {
  module: string;
  path?: (string | string[]);
  message?: string;
}[];
// ----- vue/no-restricted-class -----
type VueNoRestrictedClass = string[];
// ----- vue/no-restricted-component-names -----
type VueNoRestrictedComponentNames = (string | {
  name: string;
  message?: string;
  suggest?: string;
})[];
// ----- vue/no-restricted-component-options -----
type VueNoRestrictedComponentOptions = (string | string[] | {
  name: (string | string[]);
  message?: string;
})[];
// ----- vue/no-restricted-custom-event -----
type VueNoRestrictedCustomEvent = (string | {
  event: string;
  message?: string;
  suggest?: string;
})[];
// ----- vue/no-restricted-html-elements -----
type VueNoRestrictedHtmlElements = (string | {
  element: (string | string[]);
  message?: string;
})[];
// ----- vue/no-restricted-props -----
type VueNoRestrictedProps = (string | {
  name: string;
  message?: string;
  suggest?: string;
})[];
// ----- vue/no-restricted-static-attribute -----
type VueNoRestrictedStaticAttribute = (string | {
  key: string;
  value?: (string | true);
  element?: string;
  message?: string;
})[];
// ----- vue/no-restricted-syntax -----
type VueNoRestrictedSyntax = (string | {
  selector: string;
  message?: string;
})[];
// ----- vue/no-restricted-v-bind -----
type VueNoRestrictedVBind = ((string | null) | {
  argument: (string | null);
  modifiers?: ("prop" | "camel" | "sync" | "attr")[];
  element?: string;
  message?: string;
})[];
// ----- vue/no-restricted-v-on -----
type VueNoRestrictedVOn = ((string | null) | {
  argument: (string | null);
  element?: string;
  message?: string;
  modifiers?: [("prevent" | "stop" | "capture" | "self" | "once" | "passive"), ...(("prevent" | "stop" | "capture" | "self" | "once" | "passive"))[]];
})[];
// ----- vue/no-static-inline-styles -----
type VueNoStaticInlineStyles = [] | [{
  allowBinding?: boolean;
}];
// ----- vue/no-template-shadow -----
type VueNoTemplateShadow = [] | [{
  allow?: string[];
}];
// ----- vue/no-template-target-blank -----
type VueNoTemplateTargetBlank = [] | [{
  allowReferrer?: boolean;
  enforceDynamicLinks?: ("always" | "never");
}];
// ----- vue/no-undef-components -----
type VueNoUndefComponents = [] | [{
  ignorePatterns?: unknown[];
}];
// ----- vue/no-undef-properties -----
type VueNoUndefProperties = [] | [{
  ignores?: string[];
}];
// ----- vue/no-unsupported-features -----
type VueNoUnsupportedFeatures = [] | [{
  version?: string;
  ignores?: ("slot-scope-attribute" | "dynamic-directive-arguments" | "v-slot" | "script-setup" | "style-css-vars-injection" | "v-model-argument" | "v-model-custom-modifiers" | "v-is" | "is-attribute-with-vue-prefix" | "v-memo" | "v-bind-prop-modifier-shorthand" | "v-bind-attr-modifier" | "define-options" | "define-slots" | "define-model" | "v-bind-same-name-shorthand")[];
}];
// ----- vue/no-unused-components -----
type VueNoUnusedComponents = [] | [{
  ignoreWhenBindingPresent?: boolean;
}];
// ----- vue/no-unused-properties -----
type VueNoUnusedProperties = [] | [{
  groups?: ("props" | "data" | "asyncData" | "computed" | "methods" | "setup")[];
  deepData?: boolean;
  ignorePublicMembers?: boolean;
  unreferencedOptions?: ("unknownMemberAsUnreferenced" | "returnAsUnreferenced")[];
}];
// ----- vue/no-unused-vars -----
type VueNoUnusedVars = [] | [{
  ignorePattern?: string;
}];
// ----- vue/no-use-v-if-with-v-for -----
type VueNoUseVIfWithVFor = [] | [{
  allowUsingIterationVar?: boolean;
}];
// ----- vue/no-useless-mustaches -----
type VueNoUselessMustaches = [] | [{
  ignoreIncludesComment?: boolean;
  ignoreStringEscape?: boolean;
}];
// ----- vue/no-useless-v-bind -----
type VueNoUselessVBind = [] | [{
  ignoreIncludesComment?: boolean;
  ignoreStringEscape?: boolean;
}];
// ----- vue/no-v-html -----
type VueNoVHtml = [] | [{
  ignorePattern?: string;
}];
// ----- vue/no-v-text-v-html-on-component -----
type VueNoVTextVHtmlOnComponent = [] | [{
  allow?: string[];
  ignoreElementNamespaces?: boolean;
}];
// ----- vue/object-curly-newline -----
type VueObjectCurlyNewline = [] | [((("always" | "never") | {
  multiline?: boolean;
  minProperties?: number;
  consistent?: boolean;
}) | {
  ObjectExpression?: (("always" | "never") | {
    multiline?: boolean;
    minProperties?: number;
    consistent?: boolean;
  });
  ObjectPattern?: (("always" | "never") | {
    multiline?: boolean;
    minProperties?: number;
    consistent?: boolean;
  });
  ImportDeclaration?: (("always" | "never") | {
    multiline?: boolean;
    minProperties?: number;
    consistent?: boolean;
  });
  ExportDeclaration?: (("always" | "never") | {
    multiline?: boolean;
    minProperties?: number;
    consistent?: boolean;
  });
})];
// ----- vue/object-curly-spacing -----
type VueObjectCurlySpacing = [] | [("always" | "never")] | [("always" | "never"), {
  arraysInObjects?: boolean;
  objectsInObjects?: boolean;
}];
// ----- vue/object-property-newline -----
type VueObjectPropertyNewline = [] | [{
  allowAllPropertiesOnSameLine?: boolean;
  allowMultiplePropertiesPerLine?: boolean;
}];
// ----- vue/object-shorthand -----
type VueObjectShorthand = ([] | [("always" | "methods" | "properties" | "never" | "consistent" | "consistent-as-needed")] | [] | [("always" | "methods" | "properties")] | [("always" | "methods" | "properties"), {
  avoidQuotes?: boolean;
}] | [] | [("always" | "methods")] | [("always" | "methods"), {
  ignoreConstructors?: boolean;
  methodsIgnorePattern?: string;
  avoidQuotes?: boolean;
  avoidExplicitReturnArrows?: boolean;
}]);
// ----- vue/operator-linebreak -----
type VueOperatorLinebreak = [] | [("after" | "before" | "none" | null)] | [("after" | "before" | "none" | null), {
  overrides?: {
    [k: string]: ("after" | "before" | "none" | "ignore") | undefined;
  };
}];
// ----- vue/order-in-components -----
type VueOrderInComponents = [] | [{
  order?: unknown[];
}];
// ----- vue/padding-line-between-blocks -----
type VuePaddingLineBetweenBlocks = [] | [("never" | "always")];
// ----- vue/padding-line-between-tags -----
type VuePaddingLineBetweenTags = [] | [{
  blankLine: ("always" | "never" | "consistent");
  prev: string;
  next: string;
}[]];
// ----- vue/padding-lines-in-component-definition -----
type VuePaddingLinesInComponentDefinition = [] | [(("always" | "never") | {
  betweenOptions?: ("never" | "always" | "ignore");
  withinOption?: (("never" | "always" | "ignore") | {
    [k: string]: (("never" | "always" | "ignore") | {
      betweenItems?: ("never" | "always" | "ignore");
      withinEach?: ("never" | "always" | "ignore");
    });
  });
  groupSingleLineProperties?: boolean;
})];
// ----- vue/prefer-true-attribute-shorthand -----
type VuePreferTrueAttributeShorthand = [] | [("always" | "never")] | [("always" | "never"), {
  except?: string[];
}];
// ----- vue/prop-name-casing -----
type VuePropNameCasing = [] | [("camelCase" | "snake_case")] | [("camelCase" | "snake_case"), {
  ignoreProps?: string[];
}];
// ----- vue/quote-props -----
type VueQuoteProps = ([] | [("always" | "as-needed" | "consistent" | "consistent-as-needed")] | [] | [("always" | "as-needed" | "consistent" | "consistent-as-needed")] | [("always" | "as-needed" | "consistent" | "consistent-as-needed"), {
  keywords?: boolean;
  unnecessary?: boolean;
  numbers?: boolean;
}]);
// ----- vue/require-direct-export -----
type VueRequireDirectExport = [] | [{
  disallowFunctionalComponentFunction?: boolean;
}];
// ----- vue/require-explicit-emits -----
type VueRequireExplicitEmits = [] | [{
  allowProps?: boolean;
}];
// ----- vue/require-macro-variable-name -----
type VueRequireMacroVariableName = [] | [{
  defineProps?: string;
  defineEmits?: string;
  defineSlots?: string;
  useSlots?: string;
  useAttrs?: string;
}];
// ----- vue/require-prop-comment -----
type VueRequirePropComment = [] | [{
  type?: ("JSDoc" | "line" | "block" | "any");
}];
// ----- vue/require-toggle-inside-transition -----
type VueRequireToggleInsideTransition = [] | [{
  additionalDirectives?: string[];
}];
// ----- vue/restricted-component-names -----
type VueRestrictedComponentNames = [] | [{
  allow?: string[];
}];
// ----- vue/return-in-computed-property -----
type VueReturnInComputedProperty = [] | [{
  treatUndefinedAsUnspecified?: boolean;
}];
// ----- vue/script-indent -----
type VueScriptIndent = [] | [(number | "tab")] | [(number | "tab"), {
  baseIndent?: number;
  switchCase?: number;
  ignores?: (string & {
    [k: string]: unknown | undefined;
  } & {
    [k: string]: unknown | undefined;
  })[];
}];
// ----- vue/singleline-html-element-content-newline -----
type VueSinglelineHtmlElementContentNewline = [] | [{
  ignoreWhenNoAttributes?: boolean;
  ignoreWhenEmpty?: boolean;
  ignores?: string[];
  externalIgnores?: string[];
}];
// ----- vue/slot-name-casing -----
type VueSlotNameCasing = [] | [("camelCase" | "kebab-case" | "singleword")];
// ----- vue/sort-keys -----
type VueSortKeys = [] | [("asc" | "desc")] | [("asc" | "desc"), {
  caseSensitive?: boolean;
  ignoreChildrenOf?: unknown[];
  ignoreGrandchildrenOf?: unknown[];
  minKeys?: number;
  natural?: boolean;
}];
// ----- vue/space-in-parens -----
type VueSpaceInParens = [] | [("always" | "never")] | [("always" | "never"), {
  exceptions?: ("{}" | "[]" | "()" | "empty")[];
}];
// ----- vue/space-infix-ops -----
type VueSpaceInfixOps = [] | [{
  int32Hint?: boolean;
}];
// ----- vue/space-unary-ops -----
type VueSpaceUnaryOps = [] | [{
  words?: boolean;
  nonwords?: boolean;
  overrides?: {
    [k: string]: boolean | undefined;
  };
}];
// ----- vue/template-curly-spacing -----
type VueTemplateCurlySpacing = [] | [("always" | "never")];
// ----- vue/this-in-template -----
type VueThisInTemplate = [] | [("always" | "never")];
// ----- vue/v-bind-style -----
type VueVBindStyle = [] | [("shorthand" | "longform")] | [("shorthand" | "longform"), {
  sameNameShorthand?: ("always" | "never" | "ignore");
}];
// ----- vue/v-for-delimiter-style -----
type VueVForDelimiterStyle = [] | [("in" | "of")];
// ----- vue/v-on-event-hyphenation -----
type VueVOnEventHyphenation = [] | [("always" | "never")] | [("always" | "never"), {
  autofix?: boolean;
  ignore?: (string & {
    [k: string]: unknown | undefined;
  } & {
    [k: string]: unknown | undefined;
  })[];
  ignoreTags?: string[];
}];
// ----- vue/v-on-handler-style -----
type VueVOnHandlerStyle = [] | [(("inline" | "inline-function") | ["method", ("inline" | "inline-function")])] | [(("inline" | "inline-function") | ["method", ("inline" | "inline-function")]), {
  ignoreIncludesComment?: boolean;
}];
// ----- vue/v-on-style -----
type VueVOnStyle = [] | [("shorthand" | "longform")];
// ----- vue/v-slot-style -----
type VueVSlotStyle = [] | [(("shorthand" | "longform") | {
  atComponent?: ("shorthand" | "longform" | "v-slot");
  default?: ("shorthand" | "longform" | "v-slot");
  named?: ("shorthand" | "longform");
})];
// ----- vue/valid-v-on -----
type VueValidVOn = [] | [{
  modifiers?: unknown[];
}];
// ----- vue/valid-v-slot -----
type VueValidVSlot = [] | [{
  allowModifiers?: boolean;
}];
// ----- wrap-iife -----
type WrapIife = [] | [("outside" | "inside" | "any")] | [("outside" | "inside" | "any"), {
  functionPrototypeMethods?: boolean;
}];
// ----- yaml/block-mapping -----
type YamlBlockMapping = [] | [(("always" | "never") | {
  singleline?: ("always" | "never" | "ignore");
  multiline?: ("always" | "never" | "ignore");
})];
// ----- yaml/block-mapping-colon-indicator-newline -----
type YamlBlockMappingColonIndicatorNewline = [] | [("always" | "never")];
// ----- yaml/block-mapping-question-indicator-newline -----
type YamlBlockMappingQuestionIndicatorNewline = [] | [("always" | "never")];
// ----- yaml/block-sequence -----
type YamlBlockSequence = [] | [(("always" | "never") | {
  singleline?: ("always" | "never" | "ignore");
  multiline?: ("always" | "never" | "ignore");
})];
// ----- yaml/block-sequence-hyphen-indicator-newline -----
type YamlBlockSequenceHyphenIndicatorNewline = [] | [("always" | "never")] | [("always" | "never"), {
  nestedHyphen?: ("always" | "never");
  blockMapping?: ("always" | "never");
}];
// ----- yaml/file-extension -----
type YamlFileExtension = [] | [{
  extension?: ("yaml" | "yml");
  caseSensitive?: boolean;
}];
// ----- yaml/flow-mapping-curly-newline -----
type YamlFlowMappingCurlyNewline = [] | [(("always" | "never") | {
  multiline?: boolean;
  minProperties?: number;
  consistent?: boolean;
})];
// ----- yaml/flow-mapping-curly-spacing -----
type YamlFlowMappingCurlySpacing = [] | [("always" | "never")] | [("always" | "never"), {
  arraysInObjects?: boolean;
  objectsInObjects?: boolean;
}];
// ----- yaml/flow-sequence-bracket-newline -----
type YamlFlowSequenceBracketNewline = [] | [(("always" | "never" | "consistent") | {
  multiline?: boolean;
  minItems?: (number | null);
})];
// ----- yaml/flow-sequence-bracket-spacing -----
type YamlFlowSequenceBracketSpacing = [] | [("always" | "never")] | [("always" | "never"), {
  singleValue?: boolean;
  objectsInArrays?: boolean;
  arraysInArrays?: boolean;
}];
// ----- yaml/indent -----
type YamlIndent = [] | [number] | [number, {
  indentBlockSequences?: boolean;
  indicatorValueIndent?: number;
  alignMultilineFlowScalars?: boolean;
}];
// ----- yaml/key-name-casing -----
type YamlKeyNameCasing = [] | [{
  camelCase?: boolean;
  PascalCase?: boolean;
  SCREAMING_SNAKE_CASE?: boolean;
  "kebab-case"?: boolean;
  snake_case?: boolean;
  ignores?: string[];
}];
// ----- yaml/key-spacing -----
type YamlKeySpacing = [] | [({
  align?: (("colon" | "value") | {
    on?: ("colon" | "value");
    mode?: ("strict" | "minimum");
    beforeColon?: boolean;
    afterColon?: boolean;
  });
  mode?: ("strict" | "minimum");
  beforeColon?: boolean;
  afterColon?: boolean;
} | {
  singleLine?: {
    mode?: ("strict" | "minimum");
    beforeColon?: boolean;
    afterColon?: boolean;
  };
  multiLine?: {
    align?: (("colon" | "value") | {
      on?: ("colon" | "value");
      mode?: ("strict" | "minimum");
      beforeColon?: boolean;
      afterColon?: boolean;
    });
    mode?: ("strict" | "minimum");
    beforeColon?: boolean;
    afterColon?: boolean;
  };
} | {
  singleLine?: {
    mode?: ("strict" | "minimum");
    beforeColon?: boolean;
    afterColon?: boolean;
  };
  multiLine?: {
    mode?: ("strict" | "minimum");
    beforeColon?: boolean;
    afterColon?: boolean;
  };
  align?: {
    on?: ("colon" | "value");
    mode?: ("strict" | "minimum");
    beforeColon?: boolean;
    afterColon?: boolean;
  };
})];
// ----- yaml/no-irregular-whitespace -----
type YamlNoIrregularWhitespace = [] | [{
  skipComments?: boolean;
  skipQuotedScalars?: boolean;
}];
// ----- yaml/no-multiple-empty-lines -----
type YamlNoMultipleEmptyLines = [] | [{
  max: number;
  maxEOF?: number;
  maxBOF?: number;
}];
// ----- yaml/plain-scalar -----
type YamlPlainScalar = [] | [("always" | "never")] | [("always" | "never"), {
  ignorePatterns?: string[];
  overrides?: {
    mappingKey?: ("always" | "never" | null);
  };
}];
// ----- yaml/quotes -----
type YamlQuotes = [] | [{
  prefer?: ("double" | "single");
  avoidEscape?: boolean;
}];
// ----- yaml/sort-keys -----
type YamlSortKeys = ([{
  pathPattern: string;
  hasProperties?: string[];
  order: ((string | {
    keyPattern?: string;
    order?: {
      type?: ("asc" | "desc");
      caseSensitive?: boolean;
      natural?: boolean;
    };
  })[] | {
    type?: ("asc" | "desc");
    caseSensitive?: boolean;
    natural?: boolean;
  });
  minKeys?: number;
  allowLineSeparatedGroups?: boolean;
}, ...({
  pathPattern: string;
  hasProperties?: string[];
  order: ((string | {
    keyPattern?: string;
    order?: {
      type?: ("asc" | "desc");
      caseSensitive?: boolean;
      natural?: boolean;
    };
  })[] | {
    type?: ("asc" | "desc");
    caseSensitive?: boolean;
    natural?: boolean;
  });
  minKeys?: number;
  allowLineSeparatedGroups?: boolean;
})[]] | [] | [("asc" | "desc")] | [("asc" | "desc"), {
  caseSensitive?: boolean;
  natural?: boolean;
  minKeys?: number;
  allowLineSeparatedGroups?: boolean;
}]);
// ----- yaml/sort-sequence-values -----
type YamlSortSequenceValues = [{
  pathPattern: string;
  order: ((string | {
    valuePattern?: string;
    order?: {
      type?: ("asc" | "desc");
      caseSensitive?: boolean;
      natural?: boolean;
    };
  })[] | {
    type?: ("asc" | "desc");
    caseSensitive?: boolean;
    natural?: boolean;
  });
  minValues?: number;
}, ...({
  pathPattern: string;
  order: ((string | {
    valuePattern?: string;
    order?: {
      type?: ("asc" | "desc");
      caseSensitive?: boolean;
      natural?: boolean;
    };
  })[] | {
    type?: ("asc" | "desc");
    caseSensitive?: boolean;
    natural?: boolean;
  });
  minValues?: number;
})[]];
// ----- yaml/spaced-comment -----
type YamlSpacedComment = [] | [("always" | "never")] | [("always" | "never"), {
  exceptions?: string[];
  markers?: string[];
}];
// ----- yield-star-spacing -----
type YieldStarSpacing = [] | [(("before" | "after" | "both" | "neither") | {
  before?: boolean;
  after?: boolean;
})];
// ----- yoda -----
type Yoda = [] | [("always" | "never")] | [("always" | "never"), {
  exceptRange?: boolean;
  onlyEquality?: boolean;
}];
// Names of all the configs
type ConfigNames = 'antfu/gitignore' | 'antfu/ignores' | 'antfu/javascript/setup' | 'antfu/javascript/rules' | 'antfu/eslint-comments/rules' | 'antfu/command/rules' | 'antfu/perfectionist/setup' | 'antfu/node/rules' | 'antfu/jsdoc/rules' | 'antfu/imports/rules' | 'antfu/unicorn/rules' | 'antfu/jsx/setup' | 'antfu/typescript/setup' | 'antfu/typescript/parser' | 'antfu/typescript/type-aware-parser' | 'antfu/typescript/rules' | 'antfu/typescript/rules-type-aware' | 'antfu/typescript/erasable-syntax-only' | 'antfu/stylistic/rules' | 'antfu/regexp/rules' | 'antfu/test/setup' | 'antfu/test/rules' | 'antfu/vue/setup' | 'antfu/vue/rules' | 'antfu/react/setup' | 'antfu/react/rules' | 'antfu/react/type-aware-rules' | 'antfu/nextjs/setup' | 'antfu/nextjs/rules' | 'antfu/solid/setup' | 'antfu/solid/rules' | 'antfu/svelte/setup' | 'antfu/svelte/rules' | 'antfu/unocss' | 'antfu/astro/setup' | 'antfu/astro/rules' | 'antfu/jsonc/setup' | 'antfu/jsonc/rules' | 'antfu/sort/package-json' | 'antfu/sort/tsconfig-json' | 'antfu/pnpm/package-json' | 'antfu/pnpm/pnpm-workspace-yaml' | 'antfu/pnpm/pnpm-workspace-yaml-sort' | 'antfu/yaml/setup' | 'antfu/yaml/rules' | 'antfu/toml/setup' | 'antfu/toml/rules' | 'antfu/markdown/setup' | 'antfu/markdown/processor' | 'antfu/markdown/parser' | 'antfu/markdown/disables' | 'antfu/formatter/setup' | 'antfu/formatter/css' | 'antfu/formatter/scss' | 'antfu/formatter/less' | 'antfu/formatter/html' | 'antfu/formatter/xml' | 'antfu/formatter/svg' | 'antfu/formatter/markdown' | 'antfu/formatter/astro' | 'antfu/formatter/astro/disables' | 'antfu/formatter/graphql' | 'antfu/disables/scripts' | 'antfu/disables/cli' | 'antfu/disables/bin' | 'antfu/disables/dts' | 'antfu/disables/cjs' | 'antfu/disables/config-files';
//#endregion
//#region src/vender/prettier-types.d.ts
/**
 * Vendor types from Prettier so we don't rely on the dependency.
 */
type VendoredPrettierOptions = Partial<VendoredPrettierOptionsRequired>;
interface VendoredPrettierOptionsRequired {
  /**
   * Specify the line length that the printer will wrap on.
   * @default 120
   */
  printWidth: number;
  /**
   * Specify the number of spaces per indentation-level.
   */
  tabWidth: number;
  /**
   * Indent lines with tabs instead of spaces
   */
  useTabs?: boolean;
  /**
   * Print semicolons at the ends of statements.
   */
  semi: boolean;
  /**
   * Use single quotes instead of double quotes.
   */
  singleQuote: boolean;
  /**
   * Use single quotes in JSX.
   */
  jsxSingleQuote: boolean;
  /**
   * Print trailing commas wherever possible.
   */
  trailingComma: 'none' | 'es5' | 'all';
  /**
   * Print spaces between brackets in object literals.
   */
  bracketSpacing: boolean;
  /**
   * Put the `>` of a multi-line HTML (HTML, XML, JSX, Vue, Angular) element at the end of the last line instead of being
   * alone on the next line (does not apply to self closing elements).
   */
  bracketSameLine: boolean;
  /**
   * Put the `>` of a multi-line JSX element at the end of the last line instead of being alone on the next line.
   * @deprecated use bracketSameLine instead
   */
  jsxBracketSameLine: boolean;
  /**
   * Format only a segment of a file.
   */
  rangeStart: number;
  /**
   * Format only a segment of a file.
   * @default Number.POSITIVE_INFINITY
   */
  rangeEnd: number;
  /**
   * By default, Prettier will wrap markdown text as-is since some services use a linebreak-sensitive renderer.
   * In some cases you may want to rely on editor/viewer soft wrapping instead, so this option allows you to opt out.
   * @default "preserve"
   */
  proseWrap: 'always' | 'never' | 'preserve';
  /**
   * Include parentheses around a sole arrow function parameter.
   * @default "always"
   */
  arrowParens: 'avoid' | 'always';
  /**
   * Provide ability to support new languages to prettier.
   */
  plugins: Array<string | any>;
  /**
   * How to handle whitespaces in HTML.
   * @default "css"
   */
  htmlWhitespaceSensitivity: 'css' | 'strict' | 'ignore';
  /**
   * Which end of line characters to apply.
   * @default "lf"
   */
  endOfLine: 'auto' | 'lf' | 'crlf' | 'cr';
  /**
   * Change when properties in objects are quoted.
   * @default "as-needed"
   */
  quoteProps: 'as-needed' | 'consistent' | 'preserve';
  /**
   * Whether or not to indent the code inside <script> and <style> tags in Vue files.
   * @default false
   */
  vueIndentScriptAndStyle: boolean;
  /**
   * Enforce single attribute per line in HTML, XML, Vue and JSX.
   * @default false
   */
  singleAttributePerLine: boolean;
  /**
   * How to handle whitespaces in XML.
   * @default "preserve"
   */
  xmlQuoteAttributes: 'single' | 'double' | 'preserve';
  /**
   * Whether to put a space inside the brackets of self-closing XML elements.
   * @default true
   */
  xmlSelfClosingSpace: boolean;
  /**
   * Whether to sort attributes by key in XML elements.
   * @default false
   */
  xmlSortAttributesByKey: boolean;
  /**
   * How to handle whitespaces in XML.
   * @default "ignore"
   */
  xmlWhitespaceSensitivity: 'ignore' | 'strict' | 'preserve';
}
//#endregion
//#region src/types.d.ts
type Awaitable<T> = T | Promise<T>;
type Rules = Record<string, Linter.RuleEntry<any> | undefined> & RuleOptions;
/**
 * An updated version of ESLint's `Linter.Config`, which provides autocompletion
 * for `rules` and relaxes type limitations for `plugins` and `rules`, because
 * many plugins still lack proper type definitions.
 */
type TypedFlatConfigItem = Omit<Linter.Config, 'plugins' | 'rules'> & {
  /**
   * An object containing a name-value mapping of plugin names to plugin objects.
   * When `files` is specified, these plugins are only available to the matching files.
   *
   * @see [Using plugins in your configuration](https://eslint.org/docs/latest/user-guide/configuring/configuration-files-new#using-plugins-in-your-configuration)
   */
  plugins?: Record<string, any>;
  /**
   * An object containing the configured rules. When `files` or `ignores` are
   * specified, these rule configurations are only available to the matching files.
   */
  rules?: Rules;
};
interface OptionsFiles {
  /**
   * Override the `files` option to provide custom globs.
   */
  files?: string[];
}
interface OptionsVue extends OptionsOverrides {
  /**
   * Create virtual files for Vue SFC blocks to enable linting.
   *
   * @see https://github.com/antfu/eslint-processor-vue-blocks
   * @default true
   */
  sfcBlocks?: boolean | Options;
  /**
   * Vue version. Apply different rules set from `eslint-plugin-vue`.
   *
   * @default 3
   */
  vueVersion?: 2 | 3;
  /**
   * Vue accessibility plugin. Help check a11y issue in `.vue` files upon enabled
   *
   * @see https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/
   * @default false
   */
  a11y?: boolean;
}
interface OptionsJSXA11y extends OptionsOverrides {}
interface OptionsJSX {
  /**
   * Enable JSX accessibility rules.
   *
   * Requires installing:
   * - `eslint-plugin-jsx-a11y`
   *
   * Can be a boolean or an object for custom options and overrides.
   * @default false
   */
  a11y?: boolean | OptionsJSXA11y;
}
type OptionsTypescript = (OptionsTypeScriptWithTypes & OptionsOverrides & OptionsTypeScriptErasableOnly) | (OptionsTypeScriptParserOptions & OptionsOverrides & OptionsTypeScriptErasableOnly);
interface OptionsFormatters {
  /**
   * Enable formatting support for CSS, Less, Sass, and SCSS.
   *
   * Currently only support Prettier.
   */
  css?: 'prettier' | boolean;
  /**
   * Enable formatting support for HTML.
   *
   * Currently only support Prettier.
   */
  html?: 'prettier' | boolean;
  /**
   * Enable formatting support for XML.
   *
   * Currently only support Prettier.
   */
  xml?: 'prettier' | boolean;
  /**
   * Enable formatting support for SVG.
   *
   * Currently only support Prettier.
   */
  svg?: 'prettier' | boolean;
  /**
   * Enable formatting support for Markdown.
   *
   * Support both Prettier and dprint.
   *
   * When set to `true`, it will use Prettier.
   */
  markdown?: 'prettier' | 'dprint' | boolean;
  /**
   * Enable formatting support for GraphQL.
   */
  graphql?: 'prettier' | boolean;
  /**
   * Custom options for Prettier.
   *
   * By default it's controlled by our own config.
   */
  prettierOptions?: VendoredPrettierOptions;
  /**
   * Custom options for dprint.
   *
   * By default it's controlled by our own config.
   */
  dprintOptions?: boolean;
  /**
   * Install the prettier plugin for handle Slidev markdown
   *
   * Only works when `markdown` is enabled with `prettier`.
   */
  slidev?: boolean | {
    files?: string[];
  };
  /**
   * Enable formatting support for Astro.
   *
   * Currently only support Prettier.
   */
  astro?: 'prettier' | boolean;
}
interface OptionsComponentExts {
  /**
   * Additional extensions for components.
   *
   * @example ['vue']
   * @default []
   */
  componentExts?: string[];
}
interface OptionsUnicorn extends OptionsOverrides {
  /**
   * Include all rules recommended by `eslint-plugin-unicorn`, instead of only ones picked by Anthony.
   *
   * @default false
   */
  allRecommended?: boolean;
}
interface OptionsTypeScriptParserOptions {
  /**
   * Additional parser options for TypeScript.
   */
  parserOptions?: Partial<ParserOptions>;
  /**
   * Glob patterns for files that should be type aware.
   * @default ['**\/*.{ts,tsx}']
   */
  filesTypeAware?: string[];
  /**
   * Glob patterns for files that should not be type aware.
   * @default ['**\/*.md\/**', '**\/*.astro/*.ts']
   */
  ignoresTypeAware?: string[];
}
interface OptionsTypeScriptWithTypes {
  /**
   * When this options is provided, type aware rules will be enabled.
   * @see https://typescript-eslint.io/linting/typed-linting/
   */
  tsconfigPath?: string;
  /**
   * Override type aware rules.
   */
  overridesTypeAware?: TypedFlatConfigItem['rules'];
}
interface OptionsHasTypeScript {
  typescript?: boolean;
}
interface OptionsStylistic {
  stylistic?: boolean | StylisticConfig;
}
interface StylisticConfig extends Pick<StylisticCustomizeOptions, 'indent' | 'quotes' | 'jsx' | 'semi' | 'experimental'> {}
interface OptionsOverrides {
  overrides?: TypedFlatConfigItem['rules'];
}
interface OptionsProjectType {
  /**
   * Type of the project. `lib` will enable more strict rules for libraries.
   *
   * @default 'app'
   */
  type?: 'app' | 'lib';
}
interface OptionsTypeScriptErasableOnly {
  /**
   * Enable erasable syntax only rules.
   *
   * @see https://github.com/JoshuaKGoldberg/eslint-plugin-erasable-syntax-only
   * @default false
   */
  erasableOnly?: boolean;
}
interface OptionsRegExp {
  /**
   * Override rulelevels
   */
  level?: 'error' | 'warn';
}
interface OptionsIsInEditor {
  isInEditor?: boolean;
}
interface OptionsPnpm extends OptionsIsInEditor {
  /**
   * Requires catalogs usage
   *
   * Detects automatically based if `catalogs` is used in the pnpm-workspace.yaml file
   */
  catalogs?: boolean;
  /**
   * Enable linting for package.json, will install the jsonc parser
   *
   * @default true
   */
  json?: boolean;
  /**
   * Enable linting for pnpm-workspace.yaml, will install the yaml parser
   *
   * @default true
   */
  yaml?: boolean;
  /**
   * Sort entries in pnpm-workspace.yaml
   *
   * @default false
   */
  sort?: boolean;
}
interface OptionsUnoCSS extends OptionsOverrides {
  /**
   * Enable attributify support.
   * @default true
   */
  attributify?: boolean;
  /**
   * Enable strict mode by throwing errors about blocklisted classes.
   * @default false
   */
  strict?: boolean;
}
interface OptionsReact extends OptionsOverrides {
  reactCompiler?: boolean;
}
interface OptionsConfig extends OptionsComponentExts, OptionsProjectType {
  /**
   * Enable gitignore support.
   *
   * Passing an object to configure the options.
   *
   * @see https://github.com/antfu/eslint-config-flat-gitignore
   * @default true
   */
  gitignore?: boolean | FlatGitignoreOptions;
  /**
   * Extend the global ignores.
   *
   * Passing an array to extends the ignores.
   * Passing a function to modify the default ignores.
   *
   * @default []
   */
  ignores?: string[] | ((originals: string[]) => string[]);
  /**
   * Disable some opinionated rules to Anthony's preference.
   *
   * Including:
   * - `antfu/top-level-function`
   * - `antfu/if-newline`
   *
   * @default false
   */
  lessOpinionated?: boolean;
  /**
   * Core rules. Can't be disabled.
   */
  javascript?: OptionsOverrides;
  /**
   * Enable Node.js rules
   *
   * @default true
   */
  node?: boolean;
  /**
   * Enable JSDoc rules
   *
   * @default true
   */
  jsdoc?: boolean;
  /**
   * Enable TypeScript support.
   *
   * Passing an object to enable TypeScript Language Server support.
   *
   * @default auto-detect based on the dependencies
   */
  typescript?: boolean | OptionsTypescript;
  /**
   * Enable JSX related rules.
   *
   * Passing an object to enable JSX accessibility rules.
   *
   * @default true
   */
  jsx?: boolean | OptionsJSX;
  /**
   * Options for eslint-plugin-unicorn.
   *
   * @default true
   */
  unicorn?: boolean | OptionsUnicorn;
  /**
   * Options for eslint-plugin-import-lite.
   *
   * @default true
   */
  imports?: boolean | OptionsOverrides;
  /**
   * Enable test support.
   *
   * @default true
   */
  test?: boolean | OptionsOverrides;
  /**
   * Enable Vue support.
   *
   * @default auto-detect based on the dependencies
   */
  vue?: boolean | OptionsVue;
  /**
   * Enable JSONC support.
   *
   * @default true
   */
  jsonc?: boolean | OptionsOverrides;
  /**
   * Enable YAML support.
   *
   * @default true
   */
  yaml?: boolean | OptionsOverrides;
  /**
   * Enable TOML support.
   *
   * @default true
   */
  toml?: boolean | OptionsOverrides;
  /**
   * Enable ASTRO support.
   *
   * Requires installing:
   * - `eslint-plugin-astro`
   *
   * Requires installing for formatting .astro:
   * - `prettier-plugin-astro`
   *
   * @default false
   */
  astro?: boolean | OptionsOverrides;
  /**
   * Enable linting for **code snippets** in Markdown.
   *
   * For formatting Markdown content, enable also `formatters.markdown`.
   *
   * @default true
   */
  markdown?: boolean | OptionsOverrides;
  /**
   * Enable stylistic rules.
   *
   * @see https://eslint.style/
   * @default true
   */
  stylistic?: boolean | (StylisticConfig & OptionsOverrides);
  /**
   * Enable regexp rules.
   *
   * @see https://ota-meshi.github.io/eslint-plugin-regexp/
   * @default true
   */
  regexp?: boolean | (OptionsRegExp & OptionsOverrides);
  /**
   * Enable react rules.
   *
   * Requires installing:
   * - `@eslint-react/eslint-plugin`
   * - `eslint-plugin-react-hooks`
   * - `eslint-plugin-react-refresh`
   *
   * @default false
   */
  react?: boolean | OptionsReact;
  /**
   * Enable nextjs rules.
   *
   * Requires installing:
   * - `@next/eslint-plugin-next`
   *
   * @default false
   */
  nextjs?: boolean | OptionsOverrides;
  /**
   * Enable solid rules.
   *
   * Requires installing:
   * - `eslint-plugin-solid`
   *
   * @default false
   */
  solid?: boolean | OptionsOverrides;
  /**
   * Enable svelte rules.
   *
   * Requires installing:
   * - `eslint-plugin-svelte`
   *
   * @default false
   */
  svelte?: boolean | OptionsOverrides;
  /**
   * Enable unocss rules.
   *
   * Requires installing:
   * - `@unocss/eslint-plugin`
   *
   * @default false
   */
  unocss?: boolean | OptionsUnoCSS;
  /**
   * Enable pnpm (workspace/catalogs) support.
   *
   * Currently it's disabled by default, as it's still experimental.
   * In the future it will be smartly enabled based on the project usage.
   *
   * @see https://github.com/antfu/pnpm-workspace-utils
   * @experimental
   * @default false
   */
  pnpm?: boolean | OptionsPnpm;
  /**
   * Use external formatters to format files.
   *
   * Requires installing:
   * - `eslint-plugin-format`
   *
   * When set to `true`, it will enable all formatters.
   *
   * @default false
   */
  formatters?: boolean | OptionsFormatters;
  /**
   * Control to disable some rules in editors.
   * @default auto-detect based on the process.env
   */
  isInEditor?: boolean;
  /**
   * Automatically rename plugins in the config.
   *
   * @default true
   */
  autoRenamePlugins?: boolean;
  /**
   * Provide overrides for rules for each integration.
   *
   * @deprecated use `overrides` option in each integration key instead
   */
  overrides?: {
    stylistic?: TypedFlatConfigItem['rules'];
    javascript?: TypedFlatConfigItem['rules'];
    typescript?: TypedFlatConfigItem['rules'];
    test?: TypedFlatConfigItem['rules'];
    vue?: TypedFlatConfigItem['rules'];
    jsonc?: TypedFlatConfigItem['rules'];
    markdown?: TypedFlatConfigItem['rules'];
    yaml?: TypedFlatConfigItem['rules'];
    toml?: TypedFlatConfigItem['rules'];
    react?: TypedFlatConfigItem['rules'];
    svelte?: TypedFlatConfigItem['rules'];
  };
}
//#endregion
//#region src/factory.d.ts
declare const defaultPluginRenaming: {
  '@eslint-react': string;
  '@eslint-react/dom': string;
  '@eslint-react/hooks-extra': string;
  '@eslint-react/naming-convention': string;
  '@next/next': string;
  '@stylistic': string;
  '@typescript-eslint': string;
  'import-lite': string;
  n: string;
  vitest: string;
  yml: string;
};
/**
 * Construct an array of ESLint flat config items.
 *
 * @param {OptionsConfig & TypedFlatConfigItem} options
 *  The options for generating the ESLint configurations.
 * @param {Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[]>[]} userConfigs
 *  The user configurations to be merged with the generated configurations.
 * @returns {Promise<TypedFlatConfigItem[]>}
 *  The merged ESLint configurations.
 */
declare function antfu(options?: OptionsConfig & Omit<TypedFlatConfigItem, 'files' | 'ignores'>, ...userConfigs: Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[] | FlatConfigComposer<any, any> | Linter.Config[]>[]): FlatConfigComposer<TypedFlatConfigItem, ConfigNames>;
type ResolvedOptions<T> = T extends boolean ? never : NonNullable<T>;
declare function resolveSubOptions<K extends keyof OptionsConfig>(options: OptionsConfig, key: K): ResolvedOptions<OptionsConfig[K]>;
declare function getOverrides<K extends keyof OptionsConfig>(options: OptionsConfig, key: K): Partial<Linter.RulesRecord & RuleOptions>;
//#endregion
//#region src/config-presets.d.ts
declare const CONFIG_PRESET_FULL_ON: OptionsConfig;
declare const CONFIG_PRESET_FULL_OFF: OptionsConfig;
//#endregion
//#region src/configs/astro.d.ts
declare function astro(options?: OptionsOverrides & OptionsStylistic & OptionsFiles): Promise<TypedFlatConfigItem[]>;
//#endregion
//#region src/configs/command.d.ts
declare function command(): Promise<TypedFlatConfigItem[]>;
//#endregion
//#region src/configs/comments.d.ts
declare function comments(): Promise<TypedFlatConfigItem[]>;
//#endregion
//#region src/configs/disables.d.ts
declare function disables(): Promise<TypedFlatConfigItem[]>;
//#endregion
//#region src/configs/formatters.d.ts
declare function formatters(options?: OptionsFormatters | true, stylistic?: StylisticConfig): Promise<TypedFlatConfigItem[]>;
//#endregion
//#region src/configs/ignores.d.ts
declare function ignores(userIgnores?: string[] | ((originals: string[]) => string[])): Promise<TypedFlatConfigItem[]>;
//#endregion
//#region src/configs/imports.d.ts
declare function imports(options?: OptionsOverrides & OptionsStylistic): Promise<TypedFlatConfigItem[]>;
//#endregion
//#region src/configs/javascript.d.ts
declare function javascript(options?: OptionsIsInEditor & OptionsOverrides): Promise<TypedFlatConfigItem[]>;
//#endregion
//#region src/configs/jsdoc.d.ts
declare function jsdoc(options?: OptionsStylistic): Promise<TypedFlatConfigItem[]>;
//#endregion
//#region src/configs/jsonc.d.ts
declare function jsonc(options?: OptionsFiles & OptionsStylistic & OptionsOverrides): Promise<TypedFlatConfigItem[]>;
//#endregion
//#region src/configs/jsx.d.ts
declare function jsx(options?: OptionsJSX): Promise<TypedFlatConfigItem[]>;
//#endregion
//#region src/configs/markdown.d.ts
declare function markdown(options?: OptionsFiles & OptionsComponentExts & OptionsOverrides): Promise<TypedFlatConfigItem[]>;
//#endregion
//#region src/configs/nextjs.d.ts
declare function nextjs(options?: OptionsOverrides & OptionsFiles): Promise<TypedFlatConfigItem[]>;
//#endregion
//#region src/configs/node.d.ts
declare function node(): Promise<TypedFlatConfigItem[]>;
//#endregion
//#region src/configs/perfectionist.d.ts
/**
 * Perfectionist plugin for props and items sorting.
 *
 * @see https://github.com/azat-io/eslint-plugin-perfectionist
 */
declare function perfectionist(): Promise<TypedFlatConfigItem[]>;
//#endregion
//#region src/configs/pnpm.d.ts
declare function pnpm(options: OptionsPnpm): Promise<TypedFlatConfigItem[]>;
//#endregion
//#region src/configs/react.d.ts
declare function react(options?: OptionsTypeScriptParserOptions & OptionsTypeScriptWithTypes & OptionsReact & OptionsFiles): Promise<TypedFlatConfigItem[]>;
//#endregion
//#region src/configs/regexp.d.ts
declare function regexp(options?: OptionsRegExp & OptionsOverrides): Promise<TypedFlatConfigItem[]>;
//#endregion
//#region src/configs/solid.d.ts
declare function solid(options?: OptionsHasTypeScript & OptionsOverrides & OptionsFiles & OptionsTypeScriptWithTypes): Promise<TypedFlatConfigItem[]>;
//#endregion
//#region src/configs/sort.d.ts
/**
 * Sort package.json
 *
 * Requires `jsonc` config
 */
declare function sortPackageJson(): Promise<TypedFlatConfigItem[]>;
/**
 * Sort tsconfig.json
 *
 * Requires `jsonc` config
 */
declare function sortTsconfig(): TypedFlatConfigItem[];
//#endregion
//#region src/configs/stylistic.d.ts
declare const StylisticConfigDefaults: StylisticConfig;
interface StylisticOptions extends StylisticConfig, OptionsOverrides {
  lessOpinionated?: boolean;
}
declare function stylistic(options?: StylisticOptions): Promise<TypedFlatConfigItem[]>;
//#endregion
//#region src/configs/svelte.d.ts
declare function svelte(options?: OptionsHasTypeScript & OptionsOverrides & OptionsStylistic & OptionsFiles): Promise<TypedFlatConfigItem[]>;
//#endregion
//#region src/configs/test.d.ts
declare function test(options?: OptionsFiles & OptionsIsInEditor & OptionsOverrides): Promise<TypedFlatConfigItem[]>;
//#endregion
//#region src/configs/toml.d.ts
declare function toml(options?: OptionsOverrides & OptionsStylistic & OptionsFiles): Promise<TypedFlatConfigItem[]>;
//#endregion
//#region src/configs/typescript.d.ts
declare function typescript(options?: OptionsFiles & OptionsComponentExts & OptionsOverrides & OptionsTypeScriptWithTypes & OptionsTypeScriptParserOptions & OptionsProjectType & OptionsTypeScriptErasableOnly): Promise<TypedFlatConfigItem[]>;
//#endregion
//#region src/configs/unicorn.d.ts
declare function unicorn(options?: OptionsUnicorn): Promise<TypedFlatConfigItem[]>;
//#endregion
//#region src/configs/unocss.d.ts
declare function unocss(options?: OptionsUnoCSS): Promise<TypedFlatConfigItem[]>;
//#endregion
//#region src/configs/vue.d.ts
declare function vue(options?: OptionsVue & OptionsHasTypeScript & OptionsOverrides & OptionsStylistic & OptionsFiles): Promise<TypedFlatConfigItem[]>;
//#endregion
//#region src/configs/yaml.d.ts
declare function yaml(options?: OptionsOverrides & OptionsStylistic & OptionsFiles): Promise<TypedFlatConfigItem[]>;
//#endregion
//#region src/globs.d.ts
declare const GLOB_SRC_EXT = "?([cm])[jt]s?(x)";
declare const GLOB_SRC = "**/*.?([cm])[jt]s?(x)";
declare const GLOB_JS = "**/*.?([cm])js";
declare const GLOB_JSX = "**/*.?([cm])jsx";
declare const GLOB_TS = "**/*.?([cm])ts";
declare const GLOB_TSX = "**/*.?([cm])tsx";
declare const GLOB_STYLE = "**/*.{c,le,sc}ss";
declare const GLOB_CSS = "**/*.css";
declare const GLOB_POSTCSS = "**/*.{p,post}css";
declare const GLOB_LESS = "**/*.less";
declare const GLOB_SCSS = "**/*.scss";
declare const GLOB_JSON = "**/*.json";
declare const GLOB_JSON5 = "**/*.json5";
declare const GLOB_JSONC = "**/*.jsonc";
declare const GLOB_MARKDOWN = "**/*.md";
declare const GLOB_MARKDOWN_IN_MARKDOWN = "**/*.md/*.md";
declare const GLOB_SVELTE = "**/*.svelte?(.{js,ts})";
declare const GLOB_VUE = "**/*.vue";
declare const GLOB_YAML = "**/*.y?(a)ml";
declare const GLOB_TOML = "**/*.toml";
declare const GLOB_XML = "**/*.xml";
declare const GLOB_SVG = "**/*.svg";
declare const GLOB_HTML = "**/*.htm?(l)";
declare const GLOB_ASTRO = "**/*.astro";
declare const GLOB_ASTRO_TS = "**/*.astro/*.ts";
declare const GLOB_GRAPHQL = "**/*.{g,graph}ql";
declare const GLOB_MARKDOWN_CODE = "**/*.md/**/*.?([cm])[jt]s?(x)";
declare const GLOB_TESTS: string[];
declare const GLOB_ALL_SRC: string[];
declare const GLOB_EXCLUDE: string[];
//#endregion
//#region src/utils.d.ts
declare const parserPlain: {
  meta: {
    name: string;
  };
  parseForESLint: (code: string) => {
    ast: {
      body: never[];
      comments: never[];
      loc: {
        end: number;
        start: number;
      };
      range: number[];
      tokens: never[];
      type: string;
    };
    scopeManager: null;
    services: {
      isPlain: boolean;
    };
    visitorKeys: {
      Program: never[];
    };
  };
};
/**
 * Combine array and non-array configs into a single array.
 */
declare function combine(...configs: Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[]>[]): Promise<TypedFlatConfigItem[]>;
/**
 * Rename plugin prefixes in a rule object.
 * Accepts a map of prefixes to rename.
 *
 * @example
 * ```ts
 * import { renameRules } from '@antfu/eslint-config'
 *
 * export default [{
 *   rules: renameRules(
 *     {
 *       '@typescript-eslint/indent': 'error'
 *     },
 *     { '@typescript-eslint': 'ts' }
 *   )
 * }]
 * ```
 */
declare function renameRules(rules: Record<string, any>, map: Record<string, string>): Record<string, any>;
/**
 * Rename plugin names a flat configs array
 *
 * @example
 * ```ts
 * import { renamePluginInConfigs } from '@antfu/eslint-config'
 * import someConfigs from './some-configs'
 *
 * export default renamePluginInConfigs(someConfigs, {
 *   '@typescript-eslint': 'ts',
 *   '@stylistic': 'style',
 * })
 * ```
 */
declare function renamePluginInConfigs(configs: TypedFlatConfigItem[], map: Record<string, string>): TypedFlatConfigItem[];
declare function toArray<T>(value: T | T[]): T[];
declare function interopDefault<T>(m: Awaitable<T>): Promise<T extends {
  default: infer U;
} ? U : T>;
declare function isPackageInScope(name: string): boolean;
declare function ensurePackages(packages: (string | undefined)[]): Promise<void>;
declare function isInEditorEnv(): boolean;
declare function isInGitHooksOrLintStaged(): boolean;
//#endregion
export { Awaitable, CONFIG_PRESET_FULL_OFF, CONFIG_PRESET_FULL_ON, type ConfigNames, GLOB_ALL_SRC, GLOB_ASTRO, GLOB_ASTRO_TS, GLOB_CSS, GLOB_EXCLUDE, GLOB_GRAPHQL, GLOB_HTML, GLOB_JS, GLOB_JSON, GLOB_JSON5, GLOB_JSONC, GLOB_JSX, GLOB_LESS, GLOB_MARKDOWN, GLOB_MARKDOWN_CODE, GLOB_MARKDOWN_IN_MARKDOWN, GLOB_POSTCSS, GLOB_SCSS, GLOB_SRC, GLOB_SRC_EXT, GLOB_STYLE, GLOB_SVELTE, GLOB_SVG, GLOB_TESTS, GLOB_TOML, GLOB_TS, GLOB_TSX, GLOB_VUE, GLOB_XML, GLOB_YAML, OptionsComponentExts, OptionsConfig, OptionsFiles, OptionsFormatters, OptionsHasTypeScript, OptionsIsInEditor, OptionsJSX, OptionsJSXA11y, OptionsOverrides, OptionsPnpm, OptionsProjectType, OptionsReact, OptionsRegExp, OptionsStylistic, OptionsTypeScriptErasableOnly, OptionsTypeScriptParserOptions, OptionsTypeScriptWithTypes, OptionsTypescript, OptionsUnicorn, OptionsUnoCSS, OptionsVue, ResolvedOptions, Rules, StylisticConfig, StylisticConfigDefaults, StylisticOptions, TypedFlatConfigItem, antfu, antfu as default, astro, combine, command, comments, defaultPluginRenaming, disables, ensurePackages, formatters, getOverrides, ignores, imports, interopDefault, isInEditorEnv, isInGitHooksOrLintStaged, isPackageInScope, javascript, jsdoc, jsonc, jsx, markdown, nextjs, node, parserPlain, perfectionist, pnpm, react, regexp, renamePluginInConfigs, renameRules, resolveSubOptions, solid, sortPackageJson, sortTsconfig, stylistic, svelte, test, toArray, toml, typescript, unicorn, unocss, vue, yaml };