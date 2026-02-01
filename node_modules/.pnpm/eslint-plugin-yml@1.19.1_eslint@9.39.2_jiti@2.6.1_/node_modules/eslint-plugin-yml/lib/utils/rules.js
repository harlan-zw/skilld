"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rules = void 0;
const block_mapping_colon_indicator_newline_1 = __importDefault(require("../rules/block-mapping-colon-indicator-newline"));
const block_mapping_question_indicator_newline_1 = __importDefault(require("../rules/block-mapping-question-indicator-newline"));
const block_mapping_1 = __importDefault(require("../rules/block-mapping"));
const block_sequence_hyphen_indicator_newline_1 = __importDefault(require("../rules/block-sequence-hyphen-indicator-newline"));
const block_sequence_1 = __importDefault(require("../rules/block-sequence"));
const file_extension_1 = __importDefault(require("../rules/file-extension"));
const flow_mapping_curly_newline_1 = __importDefault(require("../rules/flow-mapping-curly-newline"));
const flow_mapping_curly_spacing_1 = __importDefault(require("../rules/flow-mapping-curly-spacing"));
const flow_sequence_bracket_newline_1 = __importDefault(require("../rules/flow-sequence-bracket-newline"));
const flow_sequence_bracket_spacing_1 = __importDefault(require("../rules/flow-sequence-bracket-spacing"));
const indent_1 = __importDefault(require("../rules/indent"));
const key_name_casing_1 = __importDefault(require("../rules/key-name-casing"));
const key_spacing_1 = __importDefault(require("../rules/key-spacing"));
const no_empty_document_1 = __importDefault(require("../rules/no-empty-document"));
const no_empty_key_1 = __importDefault(require("../rules/no-empty-key"));
const no_empty_mapping_value_1 = __importDefault(require("../rules/no-empty-mapping-value"));
const no_empty_sequence_entry_1 = __importDefault(require("../rules/no-empty-sequence-entry"));
const no_irregular_whitespace_1 = __importDefault(require("../rules/no-irregular-whitespace"));
const no_multiple_empty_lines_1 = __importDefault(require("../rules/no-multiple-empty-lines"));
const no_tab_indent_1 = __importDefault(require("../rules/no-tab-indent"));
const no_trailing_zeros_1 = __importDefault(require("../rules/no-trailing-zeros"));
const plain_scalar_1 = __importDefault(require("../rules/plain-scalar"));
const quotes_1 = __importDefault(require("../rules/quotes"));
const require_string_key_1 = __importDefault(require("../rules/require-string-key"));
const sort_keys_1 = __importDefault(require("../rules/sort-keys"));
const sort_sequence_values_1 = __importDefault(require("../rules/sort-sequence-values"));
const spaced_comment_1 = __importDefault(require("../rules/spaced-comment"));
const no_parsing_error_1 = __importDefault(require("../rules/vue-custom-block/no-parsing-error"));
exports.rules = [
    block_mapping_colon_indicator_newline_1.default,
    block_mapping_question_indicator_newline_1.default,
    block_mapping_1.default,
    block_sequence_hyphen_indicator_newline_1.default,
    block_sequence_1.default,
    file_extension_1.default,
    flow_mapping_curly_newline_1.default,
    flow_mapping_curly_spacing_1.default,
    flow_sequence_bracket_newline_1.default,
    flow_sequence_bracket_spacing_1.default,
    indent_1.default,
    key_name_casing_1.default,
    key_spacing_1.default,
    no_empty_document_1.default,
    no_empty_key_1.default,
    no_empty_mapping_value_1.default,
    no_empty_sequence_entry_1.default,
    no_irregular_whitespace_1.default,
    no_multiple_empty_lines_1.default,
    no_tab_indent_1.default,
    no_trailing_zeros_1.default,
    plain_scalar_1.default,
    quotes_1.default,
    require_string_key_1.default,
    sort_keys_1.default,
    sort_sequence_values_1.default,
    spaced_comment_1.default,
    no_parsing_error_1.default,
];
