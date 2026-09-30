const __create = Object.create;
const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __getProtoOf = Object.getPrototypeOf;
const __hasOwnProp = Object.prototype.hasOwnProperty;

const __commonJS = (cb, mod) => function __require() {
  const module = { exports: {} };
  cb(module.exports, module);
  return module.exports;
};

const __export = (target, all) => {
  for (const name in all) {
    __defProp(target, name, { get: all[name], enumerable: true });
  }
};

const __copyProps = (to, from, except, desc) => {
  if (from && typeof from === 'object' || typeof from === 'function') {
    for (const key of __getOwnPropNames(from)) {
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
      }
    }
  }
  return to;
};

const __toESM = (mod, isNodeMode, target) => (
  target = mod != null ? __create(__getProtoOf(mod)) : {},
  __copyProps(
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, 'default', { value: mod, enumerable: true })
      : target,
    mod
  )
);

const __toCommonJS = (mod) => __copyProps(__defProp({}, '__esModule', { value: true }), mod);

const require_plugin = __commonJS((exports, module) => {
  function plugin(md) {
    return function (state, ...args) {
      if (state.inlineMode) return md.renderInline(state, ...args);
      throw new Error('Marpit plugin is not allowed in inline mode.');
    };
  }

  Object.defineProperty(plugin, 'name', { value: 'marpit' });
  Object.defineProperty(plugin, 'apply', { value: plugin });
  Object.defineProperty(plugin, 'default', { value: plugin });

  module.exports = plugin;
});

const parse_exports = {};
__export(parse_exports, {
  default: () => parse_default,
  parse: () => parse2
});
module.exports = __toCommonJS(parse_exports);

const globals = Object.assign(Object.create(null), {
  headingDivider: (value) => {
    const headingDivider = [1, 2, 3, 4, 5, 6];
    const normalize = (v) => Array.isArray(v) || Number.isNaN(v) ? v : Number.parseInt(v, 10);
    const normalized = normalize(value);
    if (Array.isArray(normalized)) {
      const includes = normalized.map(normalize);
      return { headingDivider: headingDivider.filter((v) => includes.includes(v)) };
    }
    if (value === '') return { headingDivider: false };
    if (headingDivider.includes(normalized)) return { headingDivider: normalized };
    return {};
  },
  style: (value) => ({ style: value }),
  theme: (value, marpit) => marpit.themeSet.has(value) ? { theme: value } : {},
  lang: (value) => ({ lang: value })
});

const locals = Object.assign(Object.create(null), {
  backgroundColor: (value) => ({ backgroundColor: value }),
  backgroundImage: (value) => ({ backgroundImage: value }),
  backgroundPosition: (value) => ({ backgroundPosition: value }),
  backgroundRepeat: (value) => ({ backgroundRepeat: value }),
  backgroundSize: (value) => ({ backgroundSize: value }),
  class: (value) => ({ class: Array.isArray(value) ? value.join(' ') : value }),
  color: (value) => ({ color: value }),
  footer: (value) => typeof value === 'string' ? { footer: value } : {},
  header: (value) => typeof value === 'string' ? { header: value } : {},
  paginate: (value) => {
    const normalized = (value || '').toString().toLowerCase();
    if (['true', 'false'].includes(normalized)) return { paginate: normalized };
    return { paginate: normalized || 'true' };
  }
});

const directives_default = [...Object.keys(globals), ...Object.keys(locals)];

const import_js_yaml = require('js-yaml');

const createPatterns = (directives) => {
  const patterns = new Set();
  for (const directive of directives) {
    const escaped = '_?' + directive.replace(/[.*+?^=!:${}()|[\]\\/]/g, '\\$&');
    patterns.add(escaped);
    patterns.add('"' + escaped + '"');
    patterns.add("'" + escaped + "'");
  }
  return [...patterns.values()];
};

const yamlSpecialChars = ':{}#&*';

function parse(source) {
  try {
    const parsed = import_js_yaml.load(source, { schema: import_js_yaml.JSON_SCHEMA });
    if (parsed === null || typeof parsed === 'string') return false;
    return parsed;
  } catch {
    return false;
  }
}

function convertLoose(source, directives) {
  const pattern = '_?' + createPatterns(directives).join('|') + ')';
  const regexp = new RegExp('^(' + pattern + '(:\\s*.*)?)$');
  let converted = '';
  for (const line of source.split(/\r?\n/)) {
    converted += line.replace(regexp, (match, key, value) => {
      const trimmed = value.trim();
      if (trimmed.length === 0 || yamlSpecialChars.includes(trimmed[0])) return match;
      const indent = value.length - value.trimStart().length;
      const rest = value.substring(1, indent);
      return '' + key + rest + '"' + trimmed.replace('"', '\\"') + '"';
    }) + '\n';
  }
  return converted.trim();
}

const yaml = (source, loose = false) => parse(
  loose ? convertLoose(source, [...directives_default, ...(Array.isArray(loose) ? loose : [])]) : source
);
const yaml_default = yaml;

const import_plugin = __toESM(require_plugin());

const commentMatcher = /<!--+\s*([\s\S]*?)\s*--+>/;
const commentMatcherOpening = /^<!--/;
const commentMatcherClosing = /-->/;
const magicCommentMatchers = [
  /^prettier-ignore(-(start|end))?$/,
  /^markdownlint-((disable|enable).*|capture|restore)$/,
  /^lint (disable|enable|ignore).*$/
];

function markAsParsed(token, value) {
  token.meta = token.meta || {};
  token.meta.marpitCommentParsed = value;
}

function _comment(md) {
  md.core.ruler.before('inline', 'marpit_comment', (state, startLine, endLine, silent) => {
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    if (state.src.charAt(pos) !== '<') return false;
    let max = state.eMarks[startLine];
    let line = state.src.slice(pos, max);
    if (!commentMatcherOpening.test(line)) return false;
    if (silent) return true;

    let nextLine = startLine + 1;
    if (!commentMatcherClosing.test(line)) {
      while (nextLine < endLine) {
        if (state.bMarks[nextLine] !== state.tShift[nextLine]) break;
        pos = state.bMarks[nextLine] + state.tShift[nextLine];
        max = state.eMarks[nextLine];
        line = state.src.slice(pos, max);
        nextLine += 1;
        if (commentMatcherClosing.test(line)) break;
      }
    }

    state.line = nextLine;
    const token = state.push('marpit_comment', '', 0);
    token.map = [startLine, nextLine];
    token.content = state.src.slice(startLine, nextLine, state.eMarks[nextLine], true);
    token.block = true;

    const matched = commentMatcher.exec(token.content);
    token.content = matched ? matched[1].trim() : '';
    _parseComment(token, token.content);
    return true;
  });

  md.block.ruler.before('html_block', 'marpit_comment', (state, silent) => {
    const { posMax, src } = state;
    if (state.pos + 3 > posMax || src.charAt(state.pos) !== '<' || src.charAt(state.pos + 1) !== '!') return false;
    const match = src.slice(state.pos).match(commentMatcher);
    if (!match) return false;
    if (!silent) {
      const token = state.push('marpit_comment', '', 0);
      token.block = true;
      token.content = src.slice(state.pos + 4, state.pos + match[0].length - 3);
      token.map = [state.line, state.line];
      _parseComment(token, token.content);
    }
    state.pos += match[0].length;
    return true;
  });

  function _parseComment(token, content) {
    const parsed = yaml(content, !!md.options.frontMatter?.loose);
    token.meta = token.meta || {};
    token.meta.marpitCommentParsed = parsed === false ? {} : parsed;

    for (const matcher of magicCommentMatchers) {
      if (matcher.test(content.trim())) {
        markAsParsed(token, true);
        break;
      }
    }
  }
}

const comment = import_plugin(_comment);
const comment_default = comment;

const import_markdown_it_front_matter = __toESM(require('markdown-it-front-matter'));
const import_plugin2 = __toESM(require_plugin());

const isDirectiveComment = (token) =>
  token.type === 'marpit_comment' && token.meta?.marpitCommentParsed;

function _parse(md, opts = {}) {
  const { marpit } = md;
  const applyDirectives = (obj, directives) => {
    let applied = {};
    for (const key of Object.keys(obj)) {
      if (directives[key]) {
        applied = { ...applied, ...directives[key](obj[key], marpit) };
      } else {
        applied[key] = obj[key];
      }
    }
    return applied;
  };

  const loose = opts.frontMatter?.loose !== undefined ? !!opts.frontMatter.loose : false;
  let frontMatter = {};

  if (loose) {
    md.core.ruler.before('inline', 'marpit_parse_directives', (state) => {
      frontMatter = {};
      if (!state.inlineMode) marpit.lastGlobalDirectives = {};
    });

    md.use(import_markdown_it_front_matter, (fm) => {
      frontMatter.frontMatter = fm;
      const parsed = yaml(fm, marpit.lastGlobalDirectives?.frontMatter?.loose
        ? [...Object.keys(marpit.lastGlobalDirectives.globalDirectives), ...Object.keys(marpit.lastGlobalDirectives.localDirectives)]
        : false);
      if (parsed !== false) frontMatter.frontMatter = parsed;
    });
  }

  md.core.ruler.before('inline', 'marpit_parse_directives', (state) => {
    if (state.inlineMode) return;

    let globalDirectives = {};
    const applyGlobal = (obj) => {
      let applied = false;
      for (const key of Object.keys(obj)) {
        if (globals[key]) {
          applied = true;
          globalDirectives = { ...globalDirectives, ...globals[key](obj[key], marpit) };
        } else if (marpit.lastGlobalDirectives?.globalDirectives?.[key]) {
          applied = true;
          globalDirectives = { ...globalDirectives, ...applyDirectives(marpit.lastGlobalDirectives.globalDirectives[key](obj[key], marpit), globals) };
        }
      }
      return applied;
    };

    if (frontMatter.frontMatter) applyGlobal(frontMatter.frontMatter);

    for (const token of state.tokens) {
      if (isDirectiveComment(token) && applyGlobal(token.meta.marpitCommentParsed)) {
        markAsParsed(token, true);
      } else if (token.type === 'inline') {
        for (const child of token.children) {
          if (isDirectiveComment(child) && applyGlobal(child.meta.marpitCommentParsed)) {
            markAsParsed(child, true);
          }
        }
      }
    }

    const global = { ...globalDirectives };
    marpit.lastGlobalDirectives = global;
  });

  md.core.ruler.before('inline', 'marpit_apply_directives', (state) => {
    if (state.inlineMode) return;

    const slideTokens = [];
    const stack = { slide: undefined, local: {}, global: {} };
    const applyLocal = (obj) => {
      let applied = false;
      for (const key of Object.keys(obj)) {
        if (locals[key]) {
          applied = true;
          stack.local = { ...stack.local, ...locals[key](obj[key], marpit) };
        } else if (marpit.lastGlobalDirectives?.localDirectives?.[key]) {
          applied = true;
          stack.local = { ...stack.local, ...applyDirectives(marpit.lastGlobalDirectives.localDirectives[key](obj[key], marpit), locals) };
        }

        if (key.startsWith('_')) {
          const stripped = key.slice(1);
          if (locals[stripped]) {
            applied = true;
            stack.local = { ...stack.local, ...locals[stripped](obj[key], marpit) };
          } else if (marpit.lastGlobalDirectives?.localDirectives?.[stripped]) {
            applied = true;
            stack.local = { ...stack.local, ...applyDirectives(marpit.lastGlobalDirectives.localDirectives[stripped](obj[key], marpit), locals) };
          }
        }
      }
      return applied;
    };

    if (frontMatter.frontMatter) applyLocal(frontMatter.frontMatter);

    for (const token of state.tokens) {
      if (token.type === 'marpit_slide_open' && token.meta?.marpitSlide === 1) {
        token.meta.marpitDirectives = {};
        slideTokens.push(token);
        stack.slide = token;
      } else if (token.type === 'marpit_slide_open' && token.meta?.marpitSlide === -1) {
        stack.slide.meta.marpitDirectives = {
          ...stack.slide.meta.marpitDirectives,
          ...stack.local,
          ...stack.global
        };
        stack.slide = {};
      } else if (isDirectiveComment(token) && applyLocal(token.meta.marpitCommentParsed)) {
        markAsParsed(token, true);
      } else if (token.type === 'inline') {
        for (const child of token.children) {
          if (isDirectiveComment(child) && applyLocal(child.meta.marpitCommentParsed)) {
            markAsParsed(child, true);
          }
        }
      }
    }

    for (const token of slideTokens) {
      token.meta.marpitDirectives = {
        ...token.meta.marpitDirectives,
        ...marpit.lastGlobalDirectives
      };
    }
  });
}

const parse2 = import_plugin2(_parse);
const parse_default = parse2;

module.exports = {
  parse: parse,
  default: parse_default
};
