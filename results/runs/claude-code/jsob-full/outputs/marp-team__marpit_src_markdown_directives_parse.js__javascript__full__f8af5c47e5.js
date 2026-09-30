'use strict';

const { CORE_SCHEMA, load: loadYaml } = require('js-yaml');
const frontMatter = require('markdown-it-front-matter');

const PARSED_META = 'marpitParsed';
const COMMENT_META = 'marpitCommentParsed';
const htmlComment = /<!--+\s*([\s\S]*?)\s*--+>/;
const opensHtmlComment = /^<!--/;
const closesHtmlComment = /-->/;
const magicComments = [
  /^prettier-ignore(-(start|end))?$/,
  /^markdownlint-((disable|enable).*|capture|restore)$/,
  /^lint (disable|enable|ignore).*$/,
];

function marpitPlugin(plugin) {
  function wrapped(md, ...args) {
    if (md.marpit) return plugin.call(this, md, ...args);
    throw new Error('Marpit plugin must be used through Marpit.');
  }

  Object.defineProperty(wrapped, 'name', { value: plugin.name });
  Object.defineProperty(wrapped, 'length', { value: plugin.length });
  Object.defineProperty(wrapped, 'prototype', { value: plugin.prototype });
  return wrapped;
}

function normalizeHeadingDivider(value) {
  const allowed = [1, 2, 3, 4, 5, 6];
  const toNumber = item =>
    Array.isArray(item) || Number.isInteger(item) ? item : Number.parseInt(item, 10);
  const normalized = toNumber(value);

  if (Array.isArray(normalized)) {
    const levels = normalized.map(toNumber);
    return { headingDivider: allowed.filter(level => levels.includes(level)) };
  }
  if (value === false) return { headingDivider: false };
  if (allowed.includes(normalized)) return { headingDivider: normalized };
  return {};
}

const globalDirectives = Object.assign(Object.create(null), {
  headingDivider: normalizeHeadingDivider,
  style: value => ({ style: value }),
  theme: (value, marpit) =>
    marpit.themeSet.has(value) ? { theme: value } : {},
  lang: value => ({ lang: value }),
});

const localDirectives = Object.assign(Object.create(null), {
  backgroundColor: value => ({ backgroundColor: value }),
  backgroundImage: value => ({ backgroundImage: value }),
  backgroundPosition: value => ({ backgroundPosition: value }),
  backgroundRepeat: value => ({ backgroundRepeat: value }),
  backgroundSize: value => ({ backgroundSize: value }),
  class: value => ({ class: Array.isArray(value) ? value.join(' ') : value }),
  color: value => ({ color: value }),
  footer: value => (typeof value === 'string' ? { footer: value } : {}),
  header: value => (typeof value === 'string' ? { header: value } : {}),
  paginate: value => {
    const normalized = (value || '').toString().toLowerCase();
    if (['true', 'false'].includes(normalized)) {
      return { paginate: normalized === 'true' };
    }
    return { paginate: Boolean(normalized) };
  },
});

const directiveNames = [
  ...Object.keys(globalDirectives),
  ...Object.keys(localDirectives),
];

function createLooseYamlPatterns(names) {
  const patterns = new Set();
  for (const name of names) {
    const pattern = `_${name.replace(/[.*+?^=!:${}()|[\]\\/]/g, '\\$&')}?`;
    patterns.add(pattern);
    patterns.add(`"${pattern}"`);
    patterns.add(`'${pattern}'`);
  }
  return [...patterns.values()];
}

const yamlSpecialChars = '{}[]&,*';

function convertLooseYaml(source, names) {
  const keyPattern = `(?:${createLooseYamlPatterns(names).join('|')})`;
  const directiveLine = new RegExp(`^(${keyPattern})(\\s*:\\s*)(.*?)$`);
  let converted = '';

  for (const line of source.split(/\r?\n/)) {
    converted += line.replace(directiveLine, (match, key, separator, value) => {
      const trimmed = value.trim();
      if (trimmed.length === 0 || yamlSpecialChars.includes(trimmed[0])) return match;
      const indentation = value.length - value.trimStart().length;
      const prefix = value.slice(0, indentation);
      return `${key}${separator}${prefix}"${trimmed.replace('"', '\\"')}"`;
    });
    converted += '\n';
  }
  return converted.trim();
}

function yaml(source, loose = false) {
  try {
    const input = loose
      ? convertLooseYaml(source, [
          ...directiveNames,
          ...(Array.isArray(loose) ? loose : []),
        ])
      : source;
    const parsed = loadYaml(input, { schema: CORE_SCHEMA });
    if (parsed === null || typeof parsed !== 'object') return false;
    return parsed;
  } catch {
    return false;
  }
}

function markAsParsed(token, value) {
  token.meta = token.meta || {};
  token.meta[PARSED_META] = value;
}

function parseCommentDirective(token, content, loose) {
  const parsed = yaml(content, loose);
  token.meta = token.meta || {};
  token.meta[COMMENT_META] = parsed === false ? {} : parsed;

  for (const matcher of magicComments) {
    if (matcher.test(content.trim())) {
      markAsParsed(token, 'ignore');
      break;
    }
  }
}

function commentPlugin(md, options = {}) {
  const loose = options.looseYAML === undefined ? true : Boolean(options.looseYAML);
  md.block.ruler.before('html_block', 'marpit_comment', (state, start, end, silent) => {
    let position = state.bMarks[start] + state.tShift[start];
    if (state.sCount[start] - state.blkIndent >= 4) return false;

    let line = state.src.slice(position, state.eMarks[start]);
    if (!opensHtmlComment.test(line)) return false;
    if (silent) return true;

    let next = start + 1;
    if (!closesHtmlComment.test(line)) {
      while (next < end) {
        if (state.sCount[next] < state.blkIndent) break;
        position = state.bMarks[next] + state.tShift[next];
        line = state.src.slice(position, state.eMarks[next]);
        next += 1;
        if (closesHtmlComment.test(line)) break;
      }
    }

    state.line = next;
    const token = state.push('marpit_comment', '', 0);
    token.map = [start, next];
    token.content = state.getLines(start, next, state.blkIndent, true);
    token.block = true;

    const match = htmlComment.exec(token.content);
    token.markup = match ? match[1].trim() : '';
    parseCommentDirective(token, token.markup, loose);
    return true;
  });

  md.inline.ruler.before('html_inline', 'marpit_comment', (state, silent) => {
    const { posMax, src } = state;
    if (state.pos + 4 >= posMax || src.charCodeAt(state.pos) !== 0x3c || src.charCodeAt(state.pos + 1) !== 0x21) {
      return false;
    }

    const match = src.slice(state.pos).match(htmlComment);
    if (!match) return false;
    if (!silent) {
      const token = state.push('marpit_comment', '', 0);
      token.block = false;
      token.content = src.slice(state.pos, state.pos + match[0].length);
      token.markup = match[1].trim();
      parseCommentDirective(token, token.markup, loose);
    }
    state.pos += match[0].length;
    return true;
  });
}

function applyDirectives(input, handlers, marpit) {
  let output = {};
  for (const name of Object.keys(input)) {
    if (handlers[name]) output = { ...output, ...handlers[name](input[name], marpit) };
    else output[name] = input[name];
  }
  return output;
}

function isDirectiveComment(token) {
  return token.type === 'marpit_comment' && token.meta && token.meta[COMMENT_META];
}

function parse(md, options = {}) {
  const { marpit } = md;
  const loose = options.looseYAML === undefined ? true : Boolean(options.looseYAML);
  let frontMatterData = {};

  md.use(marpitPlugin(commentPlugin), options);

  if (loose) {
    md.core.ruler.before('normalize', 'marpit_reset', state => {
      frontMatterData = {};
      if (!state.inlineMode) marpit.lastGlobalDirectives = {};
    });
  }

  md.use(frontMatter, source => {
    frontMatterData.source = source;
    const extraNames = marpit.customDirectives
      ? [
          ...Object.keys(marpit.customDirectives.global || {}),
          ...Object.keys(marpit.customDirectives.local || {}),
        ]
      : [];
    const parsed = yaml(source, loose ? extraNames : false);
    if (parsed !== false) frontMatterData.parsed = parsed;
  });

  md.core.ruler.after('inline', 'marpit_global_directives', state => {
    if (state.inlineMode) return;
    let directives = {};
    let changed = false;

    const applyGlobal = values => {
      for (const name of Object.keys(values)) {
        if (globalDirectives[name]) {
          changed = true;
          directives = { ...directives, ...globalDirectives[name](values[name], marpit) };
        } else if (marpit.customDirectives?.global?.[name]) {
          changed = true;
          directives = {
            ...directives,
            ...applyDirectives(
              marpit.customDirectives.global[name](values[name], marpit),
              globalDirectives,
              marpit,
            ),
          };
        }
      }
      return changed;
    };

    if (frontMatterData.parsed) applyGlobal(frontMatterData.parsed);
    for (const token of state.tokens) {
      if (isDirectiveComment(token) && applyGlobal(token.meta[COMMENT_META])) {
        markAsParsed(token, 'global');
      } else if (token.type === 'inline') {
        for (const child of token.children || []) {
          if (isDirectiveComment(child) && applyGlobal(child.meta[COMMENT_META])) {
            markAsParsed(child, 'global');
          }
        }
      }
    }
    marpit.lastGlobalDirectives = { ...directives };
  });

  md.core.ruler.after('marpit_global_directives', 'marpit_local_directives', state => {
    if (state.inlineMode) return;
    const slides = [];
    const current = { token: undefined, directives: {}, spotDirectives: {} };

    const applyLocal = values => {
      let changed = false;
      for (const name of Object.keys(values)) {
        const localName = name.startsWith('_') ? name.slice(1) : name;
        const isSpot = name.startsWith('_');
        const target = isSpot ? current.spotDirectives : current.directives;
        if (localDirectives[localName]) {
          changed = true;
          Object.assign(target, localDirectives[localName](values[name], marpit));
        } else if (marpit.customDirectives?.local?.[localName]) {
          changed = true;
          Object.assign(
            target,
            applyDirectives(
              marpit.customDirectives.local[localName](values[name], marpit),
              localDirectives,
              marpit,
            ),
          );
        }
      }
      return changed;
    };

    if (frontMatterData.parsed) applyLocal(frontMatterData.parsed);
    for (const token of state.tokens) {
      if (token.type === 'marpit_slide_open') {
        token.meta = token.meta || {};
        token.meta.marpitSlideElement = {};
        slides.push(token);
        current.token = token;
      } else if (token.type === 'marpit_slide_close') {
        if (current.token) {
          current.token.meta.marpitSlideElement.attributes = {
            ...current.token.meta.marpitSlideElement.attributes,
            ...current.directives,
            ...current.spotDirectives,
          };
        }
        current.spotDirectives = {};
      } else if (isDirectiveComment(token) && applyLocal(token.meta[COMMENT_META])) {
        markAsParsed(token, 'local');
      } else if (token.type === 'inline') {
        for (const child of token.children || []) {
          if (isDirectiveComment(child) && applyLocal(child.meta[COMMENT_META])) {
            markAsParsed(child, 'local');
          }
        }
      }
    }

    for (const slide of slides) {
      slide.meta.marpitSlideElement.attributes = {
        ...slide.meta.marpitSlideElement.attributes,
        ...marpit.lastGlobalDirectives,
      };
    }
  });
}

const parsePlugin = marpitPlugin(parse);

Object.defineProperty(exports, '__esModule', { value: true });
Object.defineProperty(exports, 'default', { enumerable: true, get: () => parsePlugin });
Object.defineProperty(exports, 'parse', { enumerable: true, get: () => parsePlugin });
