"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rules = void 0;
const confusing_quantifier_1 = __importDefault(require("./rules/confusing-quantifier"));
const control_character_escape_1 = __importDefault(require("./rules/control-character-escape"));
const grapheme_string_literal_1 = __importDefault(require("./rules/grapheme-string-literal"));
const hexadecimal_escape_1 = __importDefault(require("./rules/hexadecimal-escape"));
const letter_case_1 = __importDefault(require("./rules/letter-case"));
const match_any_1 = __importDefault(require("./rules/match-any"));
const negation_1 = __importDefault(require("./rules/negation"));
const no_contradiction_with_assertion_1 = __importDefault(require("./rules/no-contradiction-with-assertion"));
const no_control_character_1 = __importDefault(require("./rules/no-control-character"));
const no_dupe_characters_character_class_1 = __importDefault(require("./rules/no-dupe-characters-character-class"));
const no_dupe_disjunctions_1 = __importDefault(require("./rules/no-dupe-disjunctions"));
const no_empty_alternative_1 = __importDefault(require("./rules/no-empty-alternative"));
const no_empty_capturing_group_1 = __importDefault(require("./rules/no-empty-capturing-group"));
const no_empty_character_class_1 = __importDefault(require("./rules/no-empty-character-class"));
const no_empty_group_1 = __importDefault(require("./rules/no-empty-group"));
const no_empty_lookarounds_assertion_1 = __importDefault(require("./rules/no-empty-lookarounds-assertion"));
const no_empty_string_literal_1 = __importDefault(require("./rules/no-empty-string-literal"));
const no_escape_backspace_1 = __importDefault(require("./rules/no-escape-backspace"));
const no_extra_lookaround_assertions_1 = __importDefault(require("./rules/no-extra-lookaround-assertions"));
const no_invalid_regexp_1 = __importDefault(require("./rules/no-invalid-regexp"));
const no_invisible_character_1 = __importDefault(require("./rules/no-invisible-character"));
const no_lazy_ends_1 = __importDefault(require("./rules/no-lazy-ends"));
const no_legacy_features_1 = __importDefault(require("./rules/no-legacy-features"));
const no_misleading_capturing_group_1 = __importDefault(require("./rules/no-misleading-capturing-group"));
const no_misleading_unicode_character_1 = __importDefault(require("./rules/no-misleading-unicode-character"));
const no_missing_g_flag_1 = __importDefault(require("./rules/no-missing-g-flag"));
const no_non_standard_flag_1 = __importDefault(require("./rules/no-non-standard-flag"));
const no_obscure_range_1 = __importDefault(require("./rules/no-obscure-range"));
const no_octal_1 = __importDefault(require("./rules/no-octal"));
const no_optional_assertion_1 = __importDefault(require("./rules/no-optional-assertion"));
const no_potentially_useless_backreference_1 = __importDefault(require("./rules/no-potentially-useless-backreference"));
const no_standalone_backslash_1 = __importDefault(require("./rules/no-standalone-backslash"));
const no_super_linear_backtracking_1 = __importDefault(require("./rules/no-super-linear-backtracking"));
const no_super_linear_move_1 = __importDefault(require("./rules/no-super-linear-move"));
const no_trivially_nested_assertion_1 = __importDefault(require("./rules/no-trivially-nested-assertion"));
const no_trivially_nested_quantifier_1 = __importDefault(require("./rules/no-trivially-nested-quantifier"));
const no_unused_capturing_group_1 = __importDefault(require("./rules/no-unused-capturing-group"));
const no_useless_assertions_1 = __importDefault(require("./rules/no-useless-assertions"));
const no_useless_backreference_1 = __importDefault(require("./rules/no-useless-backreference"));
const no_useless_character_class_1 = __importDefault(require("./rules/no-useless-character-class"));
const no_useless_dollar_replacements_1 = __importDefault(require("./rules/no-useless-dollar-replacements"));
const no_useless_escape_1 = __importDefault(require("./rules/no-useless-escape"));
const no_useless_flag_1 = __importDefault(require("./rules/no-useless-flag"));
const no_useless_lazy_1 = __importDefault(require("./rules/no-useless-lazy"));
const no_useless_non_capturing_group_1 = __importDefault(require("./rules/no-useless-non-capturing-group"));
const no_useless_quantifier_1 = __importDefault(require("./rules/no-useless-quantifier"));
const no_useless_range_1 = __importDefault(require("./rules/no-useless-range"));
const no_useless_set_operand_1 = __importDefault(require("./rules/no-useless-set-operand"));
const no_useless_string_literal_1 = __importDefault(require("./rules/no-useless-string-literal"));
const no_useless_two_nums_quantifier_1 = __importDefault(require("./rules/no-useless-two-nums-quantifier"));
const no_zero_quantifier_1 = __importDefault(require("./rules/no-zero-quantifier"));
const optimal_lookaround_quantifier_1 = __importDefault(require("./rules/optimal-lookaround-quantifier"));
const optimal_quantifier_concatenation_1 = __importDefault(require("./rules/optimal-quantifier-concatenation"));
const prefer_character_class_1 = __importDefault(require("./rules/prefer-character-class"));
const prefer_d_1 = __importDefault(require("./rules/prefer-d"));
const prefer_escape_replacement_dollar_char_1 = __importDefault(require("./rules/prefer-escape-replacement-dollar-char"));
const prefer_lookaround_1 = __importDefault(require("./rules/prefer-lookaround"));
const prefer_named_backreference_1 = __importDefault(require("./rules/prefer-named-backreference"));
const prefer_named_capture_group_1 = __importDefault(require("./rules/prefer-named-capture-group"));
const prefer_named_replacement_1 = __importDefault(require("./rules/prefer-named-replacement"));
const prefer_plus_quantifier_1 = __importDefault(require("./rules/prefer-plus-quantifier"));
const prefer_predefined_assertion_1 = __importDefault(require("./rules/prefer-predefined-assertion"));
const prefer_quantifier_1 = __importDefault(require("./rules/prefer-quantifier"));
const prefer_question_quantifier_1 = __importDefault(require("./rules/prefer-question-quantifier"));
const prefer_range_1 = __importDefault(require("./rules/prefer-range"));
const prefer_regexp_exec_1 = __importDefault(require("./rules/prefer-regexp-exec"));
const prefer_regexp_test_1 = __importDefault(require("./rules/prefer-regexp-test"));
const prefer_result_array_groups_1 = __importDefault(require("./rules/prefer-result-array-groups"));
const prefer_set_operation_1 = __importDefault(require("./rules/prefer-set-operation"));
const prefer_star_quantifier_1 = __importDefault(require("./rules/prefer-star-quantifier"));
const prefer_unicode_codepoint_escapes_1 = __importDefault(require("./rules/prefer-unicode-codepoint-escapes"));
const prefer_w_1 = __importDefault(require("./rules/prefer-w"));
const require_unicode_regexp_1 = __importDefault(require("./rules/require-unicode-regexp"));
const require_unicode_sets_regexp_1 = __importDefault(require("./rules/require-unicode-sets-regexp"));
const simplify_set_operations_1 = __importDefault(require("./rules/simplify-set-operations"));
const sort_alternatives_1 = __importDefault(require("./rules/sort-alternatives"));
const sort_character_class_elements_1 = __importDefault(require("./rules/sort-character-class-elements"));
const sort_flags_1 = __importDefault(require("./rules/sort-flags"));
const strict_1 = __importDefault(require("./rules/strict"));
const unicode_escape_1 = __importDefault(require("./rules/unicode-escape"));
const unicode_property_1 = __importDefault(require("./rules/unicode-property"));
const use_ignore_case_1 = __importDefault(require("./rules/use-ignore-case"));
exports.rules = [
    confusing_quantifier_1.default,
    control_character_escape_1.default,
    grapheme_string_literal_1.default,
    hexadecimal_escape_1.default,
    letter_case_1.default,
    match_any_1.default,
    negation_1.default,
    no_contradiction_with_assertion_1.default,
    no_control_character_1.default,
    no_dupe_characters_character_class_1.default,
    no_dupe_disjunctions_1.default,
    no_empty_alternative_1.default,
    no_empty_capturing_group_1.default,
    no_empty_character_class_1.default,
    no_empty_group_1.default,
    no_empty_lookarounds_assertion_1.default,
    no_empty_string_literal_1.default,
    no_escape_backspace_1.default,
    no_extra_lookaround_assertions_1.default,
    no_invalid_regexp_1.default,
    no_invisible_character_1.default,
    no_lazy_ends_1.default,
    no_legacy_features_1.default,
    no_misleading_capturing_group_1.default,
    no_misleading_unicode_character_1.default,
    no_missing_g_flag_1.default,
    no_non_standard_flag_1.default,
    no_obscure_range_1.default,
    no_octal_1.default,
    no_optional_assertion_1.default,
    no_potentially_useless_backreference_1.default,
    no_standalone_backslash_1.default,
    no_super_linear_backtracking_1.default,
    no_super_linear_move_1.default,
    no_trivially_nested_assertion_1.default,
    no_trivially_nested_quantifier_1.default,
    no_unused_capturing_group_1.default,
    no_useless_assertions_1.default,
    no_useless_backreference_1.default,
    no_useless_character_class_1.default,
    no_useless_dollar_replacements_1.default,
    no_useless_escape_1.default,
    no_useless_flag_1.default,
    no_useless_lazy_1.default,
    no_useless_non_capturing_group_1.default,
    no_useless_quantifier_1.default,
    no_useless_range_1.default,
    no_useless_set_operand_1.default,
    no_useless_string_literal_1.default,
    no_useless_two_nums_quantifier_1.default,
    no_zero_quantifier_1.default,
    optimal_lookaround_quantifier_1.default,
    optimal_quantifier_concatenation_1.default,
    prefer_character_class_1.default,
    prefer_d_1.default,
    prefer_escape_replacement_dollar_char_1.default,
    prefer_lookaround_1.default,
    prefer_named_backreference_1.default,
    prefer_named_capture_group_1.default,
    prefer_named_replacement_1.default,
    prefer_plus_quantifier_1.default,
    prefer_predefined_assertion_1.default,
    prefer_quantifier_1.default,
    prefer_question_quantifier_1.default,
    prefer_range_1.default,
    prefer_regexp_exec_1.default,
    prefer_regexp_test_1.default,
    prefer_result_array_groups_1.default,
    prefer_set_operation_1.default,
    prefer_star_quantifier_1.default,
    prefer_unicode_codepoint_escapes_1.default,
    prefer_w_1.default,
    require_unicode_regexp_1.default,
    require_unicode_sets_regexp_1.default,
    simplify_set_operations_1.default,
    sort_alternatives_1.default,
    sort_character_class_elements_1.default,
    sort_flags_1.default,
    strict_1.default,
    unicode_escape_1.default,
    unicode_property_1.default,
    use_ignore_case_1.default,
];
