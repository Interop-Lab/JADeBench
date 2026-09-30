let parse;

Object.defineProperty(module.exports, '__esModule', { value: true });
Object.defineProperty(module.exports, 'default', {
  enumerable: true,
  get: () => parse,
});
Object.defineProperty(module.exports, 'parse', {
  enumerable: true,
  get: () => parse,
});

const jsYaml = require('js-yaml');
const frontMatterModule = require('markdown-it-front-matter');
const frontMatterImport = frontMatterModule.__esModule
  ? frontMatterModule
  : { default: frontMatterModule };

const incompatibleMarkdownIt =
  'Marpit plugin has detected incompatible markdown-it instance.';

function marpitPlugin(plugin) {
  return function (markdownIt, ...args) {
    if (markdownIt.marpit) return plugin.call(this, markdownIt, ...args);
    throw new Error(incompatibleMarkdownIt);
  };
}

Object.defineProperty(marpitPlugin, '__esModule', { value: true });
Object.defineProperty(marpitPlugin, 'default', { value: marpitPlugin });
Object.defineProperty(marpitPlugin, 'marpitPlugin', { value: marpitPlugin });

const globalDirectives = Object.assign(Object.create(null), {
  headingDivider(value) {
    const levels = [1, 2, 3, 4, 5, 6];
    const toInteger = (item) =>
      Array.isArray(item) || Number.isNaN(item)
        ? item
        : Number.parseInt(item, 10);
    const divider = toInteger(value);

    if (Array.isArray(divider)) {
      const selectedLevels = divider.map(toInteger);
      return {
        headingDivider: levels.filter((level) => selectedLevels.includes(level)),
      };
    }

    if (value === 'false') return { headingDivider: false };
    if (levels.includes(divider)) return { headingDivider: divider };
    return {};
  },
  style: (value) => ({ style: value }),
  theme: (value, marpit) =>
    marpit.themeSet.has(value) ? { theme: value } : {},
  lang: (value) => ({ lang: value }),
});

const localDirectives = Object.assign(Object.create(null), {
  backgroundColor: (value) => ({ backgroundColor: value }),
  backgroundImage: (value) => ({ backgroundImage: value }),
  backgroundPosition: (value) => ({ backgroundPosition: value }),
  backgroundRepeat: (value) => ({ backgroundRepeat: value }),
  backgroundSize: (value) => ({ backgroundSize: value }),
  class: (value) => ({
    class: Array.isArray(value) ? value.join(' ') : value,
  }),
  color: (value) => ({ color: value }),
  footer: (value) => (typeof value === 'string' ? { footer: value } : {}),
  header: (value) => (typeof value === 'string' ? { header: value } : {}),
  paginate(value) {
    const setting = (value || '').toLowerCase();
    if (['hold', 'skip'].includes(setting)) return { paginate: setting };
    return { paginate: setting === 'true' };
  },
});

const builtInDirectiveNames = [
  ...Object.keys(globalDirectives),
  ...Object.keys(localDirectives),
];

function createDirectivePatterns(names) {
  const patterns = new Set();

  for (const name of names) {
    const pattern = `_?${name.replace(/[.*+?^=!:${}()|[\]\\/]/g, '\\$&')}`;
    patterns.add(pattern);
    patterns.add(`"${pattern}"`);
    patterns.add(`'${pattern}'`);
  }

  return [...patterns.values()];
}

const yamlSpecialCharacters = '["\'{|>~&*';

function convertLooseYaml(source, directiveNames) {
  const directivePattern = `(?:${createDirectivePatterns(directiveNames).join('|')})`;
  const looseDirective = new RegExp(`^(${directivePattern}\\s*:)(.+)$`);
  let converted = '';

  for (const line of source.split(/\r?\n/)) {
    converted += `${line.replace(looseDirective, (original, key, value) => {
      const trimmedValue = value.trim();
      if (
        trimmedValue.length === 0 ||
        yamlSpecialCharacters.includes(trimmedValue[0])
      ) {
        return original;
      }

      const indentationLength = value.length - value.trimLeft().length;
      const indentation = value.substring(0, indentationLength);
      return `${key}${indentation}"${trimmedValue
        .split('"')
        .join('\\"')}"`;
    })}\n`;
  }

  return converted.trim();
}

function parseYaml(source) {
  try {
    const parsed = jsYaml.load(source, { schema: jsYaml.FAILSAFE_SCHEMA });
    if (parsed === null || typeof parsed !== 'object') return false;
    return parsed;
  } catch {
    return false;
  }
}

function loadYaml(source, loose = false) {
  const yamlSource = loose
    ? convertLooseYaml(source, [
        ...builtInDirectiveNames,
        ...(Array.isArray(loose) ? loose : []),
      ])
    : source;

  return parseYaml(yamlSource);
}

function markCommentAsParsed(token, kind) {
  token.meta = token.meta || {};
  token.meta.marpitCommentParsed = kind;
}

function isDirectiveComment(token) {
  return (
    token.type === 'marpit_comment' && token.meta.marpitParsedDirectives
  );
}

function parseImplementation(markdownIt, options = {}) {
  const { marpit } = markdownIt;

  function applyDirectives(source, handlers) {
    let directives = {};

    for (const name of Object.keys(source)) {
      if (handlers[name]) {
        directives = {
          ...directives,
          ...handlers[name](source[name], marpit),
        };
      } else {
        directives[name] = source[name];
      }
    }

    return directives;
  }

  const useFrontMatter =
    options.frontMatter === undefined ? true : Boolean(options.frontMatter);
  let frontMatter = {};

  if (useFrontMatter) {
    markdownIt.core.ruler.before(
      'block',
      'marpit_directives_front_matter',
      (state) => {
        frontMatter = {};
        if (!state.inlineMode) marpit.lastGlobalDirectives = {};
      },
    );

    markdownIt.use(frontMatterImport.default, (source) => {
      frontMatter.text = source;
      const parsed = loadYaml(
        source,
        marpit.options.looseYAML
          ? [
              ...Object.keys(marpit.customDirectives.global),
              ...Object.keys(marpit.customDirectives.local),
            ]
          : false,
      );
      if (parsed !== false) frontMatter.yaml = parsed;
    });
  }

  markdownIt.core.ruler.after(
    'inline',
    'marpit_directives_global_parse',
    (state) => {
      if (state.inlineMode) return;

      let parsedGlobals = {};
      const parseGlobalDirectives = (directives) => {
        let parsed = false;

        for (const name of Object.keys(directives)) {
          if (globalDirectives[name]) {
            parsed = true;
            parsedGlobals = {
              ...parsedGlobals,
              ...globalDirectives[name](directives[name], marpit),
            };
          } else if (marpit.customDirectives.global[name]) {
            parsed = true;
            parsedGlobals = {
              ...parsedGlobals,
              ...applyDirectives(
                marpit.customDirectives.global[name](directives[name], marpit),
                globalDirectives,
              ),
            };
          }
        }

        return parsed;
      };

      if (frontMatter.yaml) parseGlobalDirectives(frontMatter.yaml);

      for (const token of state.tokens) {
        if (
          isDirectiveComment(token) &&
          parseGlobalDirectives(token.meta.marpitParsedDirectives)
        ) {
          markCommentAsParsed(token, 'directive');
        } else if (token.type === 'inline') {
          for (const child of token.children) {
            if (
              isDirectiveComment(child) &&
              parseGlobalDirectives(child.meta.marpitParsedDirectives)
            ) {
              markCommentAsParsed(child, 'directive');
            }
          }
        }
      }

      marpit.lastGlobalDirectives = { ...parsedGlobals };
    },
  );

  markdownIt.core.ruler.after(
    'marpit_slide',
    'marpit_directives_parse',
    (state) => {
      if (state.inlineMode) return;

      const slides = [];
      const parsedState = {
        slide: undefined,
        local: {},
        spot: {},
      };

      const parseLocalDirectives = (directives) => {
        let parsed = false;

        for (const name of Object.keys(directives)) {
          if (localDirectives[name]) {
            parsed = true;
            parsedState.local = {
              ...parsedState.local,
              ...localDirectives[name](directives[name], marpit),
            };
          } else if (marpit.customDirectives.local[name]) {
            parsed = true;
            parsedState.local = {
              ...parsedState.local,
              ...applyDirectives(
                marpit.customDirectives.local[name](directives[name], marpit),
                localDirectives,
              ),
            };
          }

          if (name.startsWith('_')) {
            const spotName = name.slice(1);
            if (localDirectives[spotName]) {
              parsed = true;
              parsedState.spot = {
                ...parsedState.spot,
                ...localDirectives[spotName](directives[name], marpit),
              };
            } else if (marpit.customDirectives.local[spotName]) {
              parsed = true;
              parsedState.spot = {
                ...parsedState.spot,
                ...applyDirectives(
                  marpit.customDirectives.local[spotName](
                    directives[name],
                    marpit,
                  ),
                  localDirectives,
                ),
              };
            }
          }
        }

        return parsed;
      };

      if (frontMatter.yaml) parseLocalDirectives(frontMatter.yaml);

      for (const token of state.tokens) {
        if (token.meta && token.meta.marpitSlideElement === 1) {
          token.meta.marpitDirectives = {};
          slides.push(token);
          parsedState.slide = token;
        } else if (token.meta && token.meta.marpitSlideElement === -1) {
          parsedState.slide.meta.marpitDirectives = {
            ...parsedState.slide.meta.marpitDirectives,
            ...parsedState.local,
            ...parsedState.spot,
          };
          parsedState.spot = {};
        } else if (
          isDirectiveComment(token) &&
          parseLocalDirectives(token.meta.marpitParsedDirectives)
        ) {
          markCommentAsParsed(token, 'directive');
        } else if (token.type === 'inline') {
          for (const child of token.children) {
            if (
              isDirectiveComment(child) &&
              parseLocalDirectives(child.meta.marpitParsedDirectives)
            ) {
              markCommentAsParsed(child, 'directive');
            }
          }
        }
      }

      for (const slide of slides) {
        slide.meta.marpitDirectives = {
          ...slide.meta.marpitDirectives,
          ...marpit.lastGlobalDirectives,
        };
      }
    },
  );
}

parse = marpitPlugin(parseImplementation);
