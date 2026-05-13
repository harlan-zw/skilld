export const API_CHANGE_BULLET_RE = /^- (?:BREAKING|DEPRECATED|NEW): /m
export const COMMA_OR_WHITESPACE_RE = /[,\s]+/
export const GIT_PROTOCOL_PREFIX_RE = /^git:\/\//
export const GIT_SUFFIX_RE = /\.git$/
export const GITHUB_SSH_URL_PREFIX_RE = /^ssh:\/\/git@github\.com/
export const GIT_PLUS_PREFIX_RE = /^git\+/
export const LEADING_SLASH_RE = /^\//
export const README_FILENAME_RE = /^readme\.md$/i
export const SECTION_HEADING_RE = /^##\s/m
export const SEMVER_MAJOR_MINOR_RE = /^(\d+)\.(\d+)/
export const SOURCE_LINK_RE = /\[source\]/
export const TRAILING_SLASH_RE = /\/$/
export const V_PREFIX_RE = /^v/
export const VERSION_RANGE_PREFIX_RE = /^[\^~>=<]+/
export const NPM_SCOPE_PREFIX_RE = /^@/
export const NPM_SCOPE_WITH_SLASH_RE = /^@.*\//
