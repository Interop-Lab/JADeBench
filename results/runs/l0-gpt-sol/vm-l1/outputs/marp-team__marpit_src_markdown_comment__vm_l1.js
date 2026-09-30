'use strict';

const yaml = require('js-yaml');

const parsed = new WeakSet();
const parsedValue = Symbol('marpit.parsed');

const globals = Object.create(null);
const locals = Object.create(null);

function parse(source) {
  if (source == null || source === '') return undefined;
  return yaml.load(String(source));
}

function convertLoose(value, fallback) {
  if (typeof value !== 'string') return value;

  try {
    const parsedValue = parse(value);
    return parsedValue === undefined ? fallback : parsedValue;
  } catch (_) {
    return fallback === undefined ? value : fallback;
  }
}

function markAsParsed(value, metadata) {
  if (value !== null && (typeof value === 'object' || typeof value === 'function')) {
    parsed.add(value);
    if (metadata !== undefined) {
      try {
        Object.defineProperty(value, parsedValue, {
          value: metadata,
          writable: true,
          configurable: true
        });
      } catch (_) {}
    }
  }
  return value;
}

function isParsed(value) {
  return value !== null &&
    (typeof value === 'object' || typeof value === 'function') &&
    parsed.has(value);
}

const commentMatcher = /<!--+\s*([\s\S]*?)\s*--+>/;
const commentMatcherOpening = /^<!--/;
const commentMatcherClosing = /-->/;
const magicCommentMatchers = [
  /^prettier-ignore(-(start|end))?$/,
  /^markdownlint-((disable|enable).*|capture|restore)$/,
  /^lint (disable|enable|ignore).*$/
];

function extractComment(source, start) {
  const match = commentMatcher.exec(source.slice(start));
  if (!match) return null;
  return {
    text: match[1],
    raw: match[0],
    end: start + match[0].length
  };
}

function isMagicComment(value) {
  return magicCommentMatchers.some((matcher) => matcher.test(value.trim()));
}

function applyDirectives(value, env) {
  if (!env || typeof env !== 'object') return;

  let directives;
  try {
    directives = parse(value);
  } catch (_) {
    directives = convertLoose(value);
  }

  if (!directives || typeof directives !== 'object' || Array.isArray(directives)) {
    return;
  }

  const target = env.marpit || env;
  if (!target || typeof target !== 'object') return;

  if (!target.directives || typeof target.directives !== 'object') {
    target.directives = Object.create(null);
  }

  Object.keys(directives).forEach((key) => {
    target.directives[key] = directives[key];
  });
}

function _comment(state, startLine, endLine, silent) {
  if (!state || typeof state.src !== 'string') return false;

  const begin = state.bMarks && state.tShift
    ? state.bMarks[startLine] + state.tShift[startLine]
    : 0;

  const comment = extractComment(state.src, begin);
  if (!comment) return false;

  const lineEnd = state.eMarks ? state.eMarks[startLine] : state.src.length;
  if (comment.end > lineEnd && comment.end !== state.src.length) return false;

  if (silent) return true;

  if (!isMagicComment(comment.text)) {
    applyDirectives(comment.text, state.env);
  }

  const token = state.push('html_block', '', 0);
  token.map = [startLine, startLine + 1];
  token.content = comment.raw;
  markAsParsed(token, comment.text);

  if (state.line !== undefined) {
    state.line = startLine + 1;
  }

  return true;
}

function commentPlugin(md) {
  if (!md || !md.block || !md.block.ruler) return md;

  const ruler = md.block.ruler;
  if (typeof ruler.before === 'function') {
    ruler.before('html_block', 'comment', _comment, {
      alt: ['paragraph', 'reference', 'blockquote', 'list']
    });
  } else if (typeof ruler.push === 'function') {
    ruler.push('comment', _comment, {
      alt: ['paragraph', 'reference', 'blockquote', 'list']
    });
  }

  return md;
}

const comment = commentPlugin;

module.exports = {
  comment,
  default: comment,
  markAsParsed
};
