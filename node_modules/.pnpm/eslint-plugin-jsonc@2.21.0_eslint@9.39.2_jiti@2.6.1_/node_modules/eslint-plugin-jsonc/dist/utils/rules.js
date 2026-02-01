"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rules = void 0;
const array_bracket_newline_1 = __importDefault(require("../rules/array-bracket-newline"));
const array_bracket_spacing_1 = __importDefault(require("../rules/array-bracket-spacing"));
const array_element_newline_1 = __importDefault(require("../rules/array-element-newline"));
const auto_1 = __importDefault(require("../rules/auto"));
const comma_dangle_1 = __importDefault(require("../rules/comma-dangle"));
const comma_style_1 = __importDefault(require("../rules/comma-style"));
const indent_1 = __importDefault(require("../rules/indent"));
const key_name_casing_1 = __importDefault(require("../rules/key-name-casing"));
const key_spacing_1 = __importDefault(require("../rules/key-spacing"));
const no_bigint_literals_1 = __importDefault(require("../rules/no-bigint-literals"));
const no_binary_expression_1 = __importDefault(require("../rules/no-binary-expression"));
const no_binary_numeric_literals_1 = __importDefault(require("../rules/no-binary-numeric-literals"));
const no_comments_1 = __importDefault(require("../rules/no-comments"));
const no_dupe_keys_1 = __importDefault(require("../rules/no-dupe-keys"));
const no_escape_sequence_in_identifier_1 = __importDefault(require("../rules/no-escape-sequence-in-identifier"));
const no_floating_decimal_1 = __importDefault(require("../rules/no-floating-decimal"));
const no_hexadecimal_numeric_literals_1 = __importDefault(require("../rules/no-hexadecimal-numeric-literals"));
const no_infinity_1 = __importDefault(require("../rules/no-infinity"));
const no_irregular_whitespace_1 = __importDefault(require("../rules/no-irregular-whitespace"));
const no_multi_str_1 = __importDefault(require("../rules/no-multi-str"));
const no_nan_1 = __importDefault(require("../rules/no-nan"));
const no_number_props_1 = __importDefault(require("../rules/no-number-props"));
const no_numeric_separators_1 = __importDefault(require("../rules/no-numeric-separators"));
const no_octal_escape_1 = __importDefault(require("../rules/no-octal-escape"));
const no_octal_numeric_literals_1 = __importDefault(require("../rules/no-octal-numeric-literals"));
const no_octal_1 = __importDefault(require("../rules/no-octal"));
const no_parenthesized_1 = __importDefault(require("../rules/no-parenthesized"));
const no_plus_sign_1 = __importDefault(require("../rules/no-plus-sign"));
const no_regexp_literals_1 = __importDefault(require("../rules/no-regexp-literals"));
const no_sparse_arrays_1 = __importDefault(require("../rules/no-sparse-arrays"));
const no_template_literals_1 = __importDefault(require("../rules/no-template-literals"));
const no_undefined_value_1 = __importDefault(require("../rules/no-undefined-value"));
const no_unicode_codepoint_escapes_1 = __importDefault(require("../rules/no-unicode-codepoint-escapes"));
const no_useless_escape_1 = __importDefault(require("../rules/no-useless-escape"));
const object_curly_newline_1 = __importDefault(require("../rules/object-curly-newline"));
const object_curly_spacing_1 = __importDefault(require("../rules/object-curly-spacing"));
const object_property_newline_1 = __importDefault(require("../rules/object-property-newline"));
const quote_props_1 = __importDefault(require("../rules/quote-props"));
const quotes_1 = __importDefault(require("../rules/quotes"));
const sort_array_values_1 = __importDefault(require("../rules/sort-array-values"));
const sort_keys_1 = __importDefault(require("../rules/sort-keys"));
const space_unary_ops_1 = __importDefault(require("../rules/space-unary-ops"));
const valid_json_number_1 = __importDefault(require("../rules/valid-json-number"));
const no_parsing_error_1 = __importDefault(require("../rules/vue-custom-block/no-parsing-error"));
exports.rules = [
    array_bracket_newline_1.default,
    array_bracket_spacing_1.default,
    array_element_newline_1.default,
    auto_1.default,
    comma_dangle_1.default,
    comma_style_1.default,
    indent_1.default,
    key_name_casing_1.default,
    key_spacing_1.default,
    no_bigint_literals_1.default,
    no_binary_expression_1.default,
    no_binary_numeric_literals_1.default,
    no_comments_1.default,
    no_dupe_keys_1.default,
    no_escape_sequence_in_identifier_1.default,
    no_floating_decimal_1.default,
    no_hexadecimal_numeric_literals_1.default,
    no_infinity_1.default,
    no_irregular_whitespace_1.default,
    no_multi_str_1.default,
    no_nan_1.default,
    no_number_props_1.default,
    no_numeric_separators_1.default,
    no_octal_escape_1.default,
    no_octal_numeric_literals_1.default,
    no_octal_1.default,
    no_parenthesized_1.default,
    no_plus_sign_1.default,
    no_regexp_literals_1.default,
    no_sparse_arrays_1.default,
    no_template_literals_1.default,
    no_undefined_value_1.default,
    no_unicode_codepoint_escapes_1.default,
    no_useless_escape_1.default,
    object_curly_newline_1.default,
    object_curly_spacing_1.default,
    object_property_newline_1.default,
    quote_props_1.default,
    quotes_1.default,
    sort_array_values_1.default,
    sort_keys_1.default,
    space_unary_ops_1.default,
    valid_json_number_1.default,
    no_parsing_error_1.default,
];
