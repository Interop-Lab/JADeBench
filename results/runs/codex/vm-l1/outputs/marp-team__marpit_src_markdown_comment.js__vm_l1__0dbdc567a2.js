'use strict';

const yaml = require('js-yaml');

const commentMatcher = /<!--+\s*([\s\S]*?)\s*--+>/;
const commentMatcherOpening = /^<!--/;
const commentMatcherClosing = /-->/;
const magicCommentMatchers = [
  /^prettier-ignore(-(start|end))?$/,
  /^markdownlint-((disable|enable).*|capture|restore)$/,
  /^lint (disable|enable|ignore).*/,
];
const yamlSpecialChars = "['{|>~&*";

const directives = [
  'color',
  'footer',
  'header',
  'paginate',
];

function createPatterns(patterns) {
  return patterns.map((pattern) => (pattern instanceof RegExp ? pattern : new RegExp(pattern)));
}

function convertLoose(value) {
  if (typeof value !== 'string') return value;
  try {
    return yaml.load(value);
  } catch {
    return value;
  }
}

function parse(value, options) {
  return yaml.load(value, options);
}

function markAsParsed(value, parsed = true) {
  if (value && typeof value === 'object') value.parsed = parsed;
  return value;
}

function comment(value) {
  if (typeof value !== 'string') return value;
  const match = value.match(commentMatcher);
  return match ? match[1] : value;
}

module.exports = {
  comment,
  default: comment,
  markAsParsed,
};
