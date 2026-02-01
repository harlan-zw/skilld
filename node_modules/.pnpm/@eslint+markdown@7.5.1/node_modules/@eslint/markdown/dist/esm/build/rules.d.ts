declare const _default: {
    "fenced-code-language": import("../rules/fenced-code-language.js").FencedCodeLanguageRuleDefinition;
    "heading-increment": import("../rules/heading-increment.js").HeadingIncrementRuleDefinition;
    "no-bare-urls": import("../rules/no-bare-urls.js").NoBareUrlsRuleDefinition;
    "no-duplicate-definitions": import("../rules/no-duplicate-definitions.js").NoDuplicateDefinitionsRuleDefinition;
    "no-duplicate-headings": import("../rules/no-duplicate-headings.js").NoDuplicateHeadingsRuleDefinition;
    "no-empty-definitions": import("../types.js").MarkdownRuleDefinition<{
        RuleOptions: import("../rules/no-empty-definitions.js").NoEmptyDefinitionsOptions;
        MessageIds: import("../rules/no-empty-definitions.js").NoEmptyDefinitionsMessageIds;
    }>;
    "no-empty-images": import("../rules/no-empty-images.js").NoEmptyImagesRuleDefinition;
    "no-empty-links": import("../rules/no-empty-links.js").NoEmptyLinksRuleDefinition;
    "no-html": import("../rules/no-html.js").NoHtmlRuleDefinition;
    "no-invalid-label-refs": import("../rules/no-invalid-label-refs.js").NoInvalidLabelRefsRuleDefinition;
    "no-missing-atx-heading-space": import("../rules/no-missing-atx-heading-space.js").NoMissingAtxHeadingSpaceRuleDefinition;
    "no-missing-label-refs": import("../types.js").MarkdownRuleDefinition<{
        RuleOptions: import("../rules/no-missing-label-refs.js").NoMissingLabelRefsOptions;
        MessageIds: import("../rules/no-missing-label-refs.js").NoMissingLabelRefsMessageIds;
    }>;
    "no-missing-link-fragments": import("../rules/no-missing-link-fragments.js").NoMissingLinkFragmentsRuleDefinition;
    "no-multiple-h1": import("../rules/no-multiple-h1.js").NoMultipleH1RuleDefinition;
    "no-reference-like-urls": import("../rules/no-reference-like-urls.js").NoReferenceLikeUrlsRuleDefinition;
    "no-reversed-media-syntax": import("../rules/no-reversed-media-syntax.js").NoReversedMediaSyntaxRuleDefinition;
    "no-space-in-emphasis": import("../rules/no-space-in-emphasis.js").NoSpaceInEmphasisRuleDefinition;
    "no-unused-definitions": import("../rules/no-unused-definitions.js").NoUnusedDefinitionsRuleDefinition;
    "require-alt-text": import("../rules/require-alt-text.js").RequireAltTextRuleDefinition;
    "table-column-count": import("../rules/table-column-count.js").TableColumnCountRuleDefinition;
};
export default _default;
