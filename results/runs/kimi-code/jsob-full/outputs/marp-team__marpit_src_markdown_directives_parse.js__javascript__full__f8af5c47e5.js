'use strict';

const yaml = require('js-yaml');
const frontMatter = require('markdown-it-front-matter');

const HEADING_LEVELS = [1, 2, 3, 4, 5, 6];
const YAML_SPECIAL_CHARACTERS = '["\'{|>~&*';
const MAGIC_COMMENT_PATTERNS = [
  /^prettier-ignore(-(start|end))?$/,
  /^markdownlint-((disable|enable).*|capture|restore)$/,
  /^lint (disable|enable|ignore).*$/,
];

const globalDirectives = Object.assign(Object.create(null), {
  headingDivider(value) {
    const normalize = item => Array.isArray(item) || Number.isInteger(item)
      ? item
      : Number.parseInt(item, 10);
    const normalized = normalize(value);

    if (Array.isArray(normalized)) {
      const levels = normalized.map(normalize);
      return { headingDivider: HEADING_LEVELS.filter(level => levels.includes(level)) };
    }
    if (value === 'false') return { headingDivider: false };
    if (HEADING_LEVELS.includes(normalized)) return { headingDivider: normalized };
    return {};
  },
  style: value => ({ style: value }),
  theme: (value, marpit) => marpit.themeSet.has(value) ? { theme: value } : {},
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
  footer: value => typeof value === 'string' ? { footer: value } : {},
  header: value => typeof value === 'string' ? { header: value } : {},
  paginate(value) {
    const normalized = String(value || '').toLowerCase();
    if (normalized === 'hold' || normalized === 'skip') return { paginate: normalized };
    return { paginate: normalized === 'true' };
  },
});

const directiveNames = [...Object.keys(globalDirectives), ...Object.keys(localDirectives)];

function createDirectivePatterns(names) {
  const patterns = new Set();
  for (const name of names) {
    const pattern = `_?${name.replace(/[.*+?^=!:${}()|[\]\\/]/g, '\\$&')}`;
    patterns.add(pattern);
    patterns.add(`"${pattern}"`);
    patterns.add(`'${pattern}'`);
  }
  return [...patterns];
}

function convertLoose(source, customDirectiveNames = []) {
  const names = [...directiveNames, ...customDirectiveNames];
  const directivePattern = `(?:${createDirectivePatterns(names).join('|')})`;
  const linePattern = new RegExp(`^(${directivePattern}\\s*:)(.+)$`);
  let converted = '';

  for (const line of source.split(/\r?\n/)) {
    converted += line.replace(linePattern, (original, prefix, rawValue) => {
      const value = rawValue.trim();
      if (value.length === 0 || YAML_SPECIAL_CHARACTERS.includes(value[0])) return original;
      const indentation = rawValue.length - rawValue.trimLeft().length;
      return `${prefix}${rawValue.substring(0, indentation)}"${value.split('"').join('\\"')}"`;
    }) + '\n';
  }
  return converted.trim();
}

function parseYaml(source, customDirectiveNames = false) {
  try {
    const converted = customDirectiveNames === false ? source : convertLoose(source, customDirectiveNames);
    const value = yaml.load(converted, { schema: yaml.FAILSAFE_SCHEMA });
    return value !== null && typeof value === 'object' ? value : false;
  } catch {
    return false;
  }
}

function runDirectiveHandlers(values, handlers, marpit) {
  let result = {};
  for (const name of Object.keys(values)) {
    result = handlers[name]
      ? { ...result, ...handlers[name](values[name], marpit) }
      : { ...result, [name]: values[name] };
  }
  return result;
}

function applyGlobalDirectives(values, accumulator, marpit) {
  let parsed = false;
  for (const name of Object.keys(values)) {
    if (globalDirectives[name]) {
      parsed = true;
      Object.assign(accumulator, globalDirectives[name](values[name], marpit));
    } else if (marpit.customDirectives.global[name]) {
      parsed = true;
      Object.assign(
        accumulator,
        runDirectiveHandlers(marpit.customDirectives.global[name](values[name], marpit), globalDirectives, marpit),
      );
    }
  }
  return parsed;
}

function createLocalState() {
  return { slide: undefined, local: {}, spot: {} };
}

function applyLocalDirectives(values, state, marpit) {
  let parsed = false;
  for (const name of Object.keys(values)) {
    if (localDirectives[name]) {
      parsed = true;
      state.local = { ...state.local, ...localDirectives[name](values[name], marpit) };
    } else if (marpit.customDirectives.local[name]) {
      parsed = true;
      state.local = {
        ...state.local,
        ...runDirectiveHandlers(marpit.customDirectives.local[name](values[name], marpit), localDirectives, marpit),
      };
    }

    if (name.startsWith('_')) {
      const spotName = name.slice(1);
      if (localDirectives[spotName]) {
        parsed = true;
        state.spot = { ...state.spot, ...localDirectives[spotName](values[name], marpit) };
      } else if (marpit.customDirectives.local[spotName]) {
        parsed = true;
        state.spot = {
          ...state.spot,
          ...runDirectiveHandlers(marpit.customDirectives.local[spotName](values[name], marpit), localDirectives, marpit),
        };
      }
    }
  }
  return parsed;
}

function isDirectiveComment(token) {
  return token.type === 'marpit_comment' && token.meta && token.meta.marpitParsedDirectives;
}

function markCommentParsed(token, value) {
  token.meta ||= {};
  token.meta.marpitCommentParsed = value;
}

function parse(md, options = {}) {
  if (!md || !md.marpit) {
    throw new Error('Marpit plugin has detected incompatible markdown-it instance.');
  }

  const marpit = md.marpit;
  const parseFrontMatter = options.frontMatter === undefined ? true : Boolean(options.frontMatter);
  let frontMatterData = {};

  if (parseFrontMatter) {
    md.core.ruler.before('block', 'marpit_directives_front_matter', state => {
      frontMatterData = {};
      if (!state.inlineMode) marpit.lastGlobalDirectives = {};
    });
    md.use(frontMatter, source => {
      frontMatterData.text = source;
      const customNames = marpit.options.looseYAML
        ? [...Object.keys(marpit.customDirectives.global), ...Object.keys(marpit.customDirectives.local)]
        : false;
      const parsed = parseYaml(source, customNames);
      if (parsed !== false) frontMatterData.yaml = parsed;
    });
  }

  md.core.ruler.after('inline', 'marpit_directives_global_parse', state => {
    if (state.inlineMode) return;

    const globalState = {};
    if (frontMatterData.yaml) applyGlobalDirectives(frontMatterData.yaml, globalState, marpit);
    for (const token of state.tokens) {
      if (
        isDirectiveComment(token)
        && applyGlobalDirectives(token.meta.marpitParsedDirectives, globalState, marpit)
      ) {
        markCommentParsed(token, 'directive');
      } else if (token.type === 'inline') {
        for (const child of token.children) {
          if (
            isDirectiveComment(child)
            && applyGlobalDirectives(child.meta.marpitParsedDirectives, globalState, marpit)
          ) {
            markCommentParsed(child, 'directive');
          }
        }
      }
    }
    marpit.lastGlobalDirectives = { ...globalState };
  });

  md.core.ruler.after('marpit_slide', 'marpit_directives_parse', state => {
    if (state.inlineMode) return;

    const slideOpenTokens = [];
    const localState = createLocalState();
    if (frontMatterData.yaml) applyLocalDirectives(frontMatterData.yaml, localState, marpit);

    for (const token of state.tokens) {
      if (token.meta && token.meta.marpitSlideElement === 1) {
        token.meta.marpitDirectives = {};
        slideOpenTokens.push(token);
        localState.slide = token;
      } else if (token.meta && token.meta.marpitSlideElement === -1) {
        localState.slide.meta.marpitDirectives = {
          ...localState.slide.meta.marpitDirectives,
          ...localState.local,
          ...localState.spot,
        };
        localState.spot = {};
      } else if (isDirectiveComment(token) && applyLocalDirectives(token.meta.marpitParsedDirectives, localState, marpit)) {
        markCommentParsed(token, 'directive');
      } else if (token.type === 'inline') {
        for (const child of token.children) {
          if (isDirectiveComment(child) && applyLocalDirectives(child.meta.marpitParsedDirectives, localState, marpit)) {
            markCommentParsed(child, 'directive');
          }
        }
      }
    }

    for (const token of slideOpenTokens) {
      token.meta.marpitDirectives = {
        ...token.meta.marpitDirectives,
        ...marpit.lastGlobalDirectives,
      };
    }
  });

  return md;
}

module.exports = { default: parse, parse };
