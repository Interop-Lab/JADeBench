'use strict';

const yaml = require('js-yaml');

const COMMENT_PATTERN = /<!--+\s*([\s\S]*?)\s*--+>/;
const COMMENT_OPENING_PATTERN = /^<!--/;
const COMMENT_CLOSING_PATTERN = /-->/;
const MAGIC_COMMENT_PATTERNS = [
  /^prettier-ignore(-(start|end))?$/,
  /^markdownlint-((disable|enable).*|capture|restore)$/,
  /^lint (disable|enable|ignore).*$/,
];
const PARSED_DIRECTIVES = 'marpitParsedDirectives';
const PARSED_COMMENT = 'marpitCommentParsed';
const MAGIC_COMMENT = 'well-known-magic-comment';

function parseDirectives(source) {
  if (typeof source !== 'string') return {};

  try {
    const parsed = yaml.load(source, { schema: yaml.FAILSAFE_SCHEMA });
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function parseComment(comment) {
  const trimmed = comment.trim();
  if (MAGIC_COMMENT_PATTERNS.some(pattern => pattern.test(trimmed))) {
    return { directives: {}, magic: true };
  }

  return { directives: parseDirectives(trimmed), magic: false };
}

function markAsParsed(token, parsed) {
  token.meta ||= {};
  if (typeof token.meta === 'object') token.meta[PARSED_COMMENT] = parsed;
}

function parseTokenComment(state, token) {
  const content = token.content;
  const { looseYAML } = state.md.marpit.options;
  const { directives, magic } = parseComment(content);
  token.meta ||= {};
  token.meta[PARSED_DIRECTIVES] = directives;
  if (magic) markAsParsed(token, MAGIC_COMMENT);
}

function inlineCommentRule(state, silent) {
  if (!COMMENT_OPENING_PATTERN.test(state.src.slice(state.pos))) return false;

  const match = state.src.slice(state.pos).match(COMMENT_PATTERN);
  if (!match || match.index !== 0) return false;

  if (silent) {
    state.pos += match[0].length;
    return true;
  }

  const token = state.push('marpit_comment', '', 0);
  token.hidden = true;
  token.markup = match[0];
  token.content = match[1];
  parseTokenComment(state, token);
  state.pos += match[0].length;
  return true;
}

function blockCommentRule(state, startLine, endLine, silent) {
  const start = state.bMarks[startLine] + state.tShift[startLine];
  if (!COMMENT_OPENING_PATTERN.test(state.src.slice(start))) return false;

  let finishLine = startLine;
  let line = state.src.slice(start, state.eMarks[finishLine]);

  while (!COMMENT_CLOSING_PATTERN.test(line) && finishLine + 1 < endLine) {
    const nextLine = finishLine + 1;
    if (state.sCount[nextLine] < state.blkIndent) break;
    finishLine = nextLine;
    const lineStart = state.bMarks[finishLine] + state.tShift[finishLine];
    line = state.src.slice(lineStart, state.eMarks[finishLine]);
  }

  if (silent) return true;

  state.line = finishLine + 1;
  const token = state.push('marpit_comment', '', 0);
  token.map = [startLine, state.line];
  token.markup = state.getLines(startLine, state.line, state.blkIndent, true);
  token.hidden = true;
  const match = token.markup.match(COMMENT_PATTERN);
  token.content = match ? match[1] : '';
  parseTokenComment(state, token);
  return true;
}

function comment(md) {
  if (!md.marpit) {
    throw new Error('Marpit plugin has detected incompatible markdown-it instance.');
  }

  md.block.ruler.before('html_block', 'marpit_comment', blockCommentRule);
  md.inline.ruler.before('html_inline', 'marpit_inline_comment', inlineCommentRule);
}

Object.defineProperty(exports, '__esModule', { value: true });
Object.defineProperties(exports, {
  comment: { enumerable: true, get: () => comment },
  default: { enumerable: true, get: () => comment },
  markAsParsed: { enumerable: true, get: () => markAsParsed },
});
