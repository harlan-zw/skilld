"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rules = void 0;
const array_bracket_newline_1 = __importDefault(require("../rules/array-bracket-newline"));
const array_bracket_spacing_1 = __importDefault(require("../rules/array-bracket-spacing"));
const array_element_newline_1 = __importDefault(require("../rules/array-element-newline"));
const comma_style_1 = __importDefault(require("../rules/comma-style"));
const indent_1 = __importDefault(require("../rules/indent"));
const inline_table_curly_spacing_1 = __importDefault(require("../rules/inline-table-curly-spacing"));
const key_spacing_1 = __importDefault(require("../rules/key-spacing"));
const keys_order_1 = __importDefault(require("../rules/keys-order"));
const no_mixed_type_in_array_1 = __importDefault(require("../rules/no-mixed-type-in-array"));
const no_non_decimal_integer_1 = __importDefault(require("../rules/no-non-decimal-integer"));
const no_space_dots_1 = __importDefault(require("../rules/no-space-dots"));
const no_unreadable_number_separator_1 = __importDefault(require("../rules/no-unreadable-number-separator"));
const padding_line_between_pairs_1 = __importDefault(require("../rules/padding-line-between-pairs"));
const padding_line_between_tables_1 = __importDefault(require("../rules/padding-line-between-tables"));
const precision_of_fractional_seconds_1 = __importDefault(require("../rules/precision-of-fractional-seconds"));
const precision_of_integer_1 = __importDefault(require("../rules/precision-of-integer"));
const quoted_keys_1 = __importDefault(require("../rules/quoted-keys"));
const space_eq_sign_1 = __importDefault(require("../rules/space-eq-sign"));
const spaced_comment_1 = __importDefault(require("../rules/spaced-comment"));
const table_bracket_spacing_1 = __importDefault(require("../rules/table-bracket-spacing"));
const tables_order_1 = __importDefault(require("../rules/tables-order"));
const no_parsing_error_1 = __importDefault(require("../rules/vue-custom-block/no-parsing-error"));
exports.rules = [
    array_bracket_newline_1.default,
    array_bracket_spacing_1.default,
    array_element_newline_1.default,
    comma_style_1.default,
    indent_1.default,
    inline_table_curly_spacing_1.default,
    key_spacing_1.default,
    keys_order_1.default,
    no_mixed_type_in_array_1.default,
    no_non_decimal_integer_1.default,
    no_space_dots_1.default,
    no_unreadable_number_separator_1.default,
    padding_line_between_pairs_1.default,
    padding_line_between_tables_1.default,
    precision_of_fractional_seconds_1.default,
    precision_of_integer_1.default,
    quoted_keys_1.default,
    space_eq_sign_1.default,
    spaced_comment_1.default,
    table_bracket_spacing_1.default,
    tables_order_1.default,
    no_parsing_error_1.default,
];
