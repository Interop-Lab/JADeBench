'use strict';

const postcss = require('postcss');
const kebabCase = require('lodash.kebabcase');

const globalDirectives = {
  headingDivider: parseHeadingDivider,
  style: value => ({ style: value }),
  theme: (value, marpit) => (marpit.themeSet.has(value) ? { theme: value } : {}),
  lang: value => ({ lang: value }),
};

const localDirectives = {
  backgroundColor: value => ({ backgroundColor: value }),
  backgroundImage: value => ({ backgroundImage: value }),
  backgroundPosition: value => ({ backgroundPosition: value }),
  backgroundRepeat: value => ({ backgroundRepeat: value }),
  backgroundSize: value => ({ backgroundSize: value }),
  class: value => ({ class: Array.isArray(value) ? value.join(' ') : value }),
  color: value => ({ color: value }),
  footer: value => (typeof value === 'string' ? { footer: value } : {}),
  header: value => (typeof value === 'string' ? { header: value } : {}),
  paginate: parsePaginate,
};

const builtInDirectives = [
  ...Object.keys(globalDirectives),
  ...Object.keys(localDirectives),
];

class InlineStyle {
  constructor(style) {
    this.declarations = {};
    if (!style) return;

    if (style instanceof InlineStyle) {
      this.declarations = { ...style.declarations };
    } else if (typeof style === 'string') {
      postcss.parse(style, { from: undefined }).each(node => {
        if (node.type === 'decl') this.declarations[node.prop] = node.value;
      });
    } else {
      this.declarations = { ...style };
    }
  }

  delete(property) {
    delete this.declarations[property];
    return this;
  }

  set(property, value) {
    this.declarations[property] = value;
    return this;
  }

  toString() {
    let css = '';
    for (const [property, value] of Object.entries(this.declarations)) {
      try {
        const declaration = postcss.parse(`${property}:${value}`, { from: undefined });
        declaration.each(node => {
          if (node.type !== 'decl' || node.prop !== property) node.remove();
        });
        css += `${declaration.toString()};`;
      } catch {}
    }
    return css;
  }
}

function parseHeadingDivider(value) {
  const levels = [1, 2, 3, 4, 5, 6];
  const normalize = level =>
    Array.isArray(level) || Number.isInteger(level) ? level : Number.parseInt(level, 10);
  const normalized = normalize(value);

  if (Array.isArray(normalized)) {
    const requested = normalized.map(normalize);
    return { headingDivider: levels.filter(level => requested.includes(level)) };
  }
  if (value === false) return { headingDivider: false };
  if (levels.includes(normalized)) return { headingDivider: normalized };
  return {};
}

function parsePaginate(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'true' || normalized === 'false') return { paginate: normalized };
  return { paginate: Boolean(normalized) };
}

function apply(markdownIt, options = {}) {
  const { marpit } = markdownIt;
  const { lang } = marpit.options;
  const applyDataset = options.dataset === undefined ? true : Boolean(options.dataset);
  const applyCss = options.css === undefined ? true : Boolean(options.css);
  const { global, local } = marpit.customDirectives;
  const directiveNames = [
    ...Object.keys(global),
    ...Object.keys(local),
    ...builtInDirectives,
  ];

  markdownIt.core.ruler.after(
    'marpit_directives_parse',
    'marpit_directives_apply',
    state => {
      if (state.inlineMode) return;

      let slideNumber = 0;
      const paginatedSlides = [];

      for (const token of state.tokens) {
        const directives = token.meta?.marpitDirectives;
        if (token.type === 'marpit_slide_open') {
          if (directives?.paginate !== 'skip' && directives?.paginate !== 'hold') {
            slideNumber += 1;
          }
        }
        if (!directives) continue;

        const style = new InlineStyle(token.attrGet('style'));
        for (const name of Object.keys(directives)) {
          if (!directiveNames.includes(name)) continue;
          const value = directives[name];
          if (!value) continue;

          const property = kebabCase(name);
          if (applyDataset) token.attrSet(`data-${property}`, value);
          if (applyCss) style.set(`--${property}`, value);
        }

        if (directives.lang || lang) token.attrSet('lang', directives.lang || lang);
        if (directives.class) token.attrJoin('class', directives.class);
        if (directives.color) style.set('color', directives.color);
        if (directives.backgroundColor) {
          style
            .set('background-color', directives.backgroundColor)
            .set('background-image', 'none');
        }
        if (directives.backgroundImage) {
          style
            .set('background-image', directives.backgroundImage)
            .set('background-position', 'center')
            .set('background-repeat', 'no-repeat')
            .set('background-size', 'cover');
          if (directives.backgroundPosition) {
            style.set('background-position', directives.backgroundPosition);
          }
          if (directives.backgroundRepeat) {
            style.set('background-repeat', directives.backgroundRepeat);
          }
          if (directives.backgroundSize) style.set('background-size', directives.backgroundSize);
        }

        if (directives.paginate && directives.paginate !== 'skip') {
          if (slideNumber <= 0) slideNumber = 1;
          token.attrSet('data-marpit-pagination', slideNumber);
          paginatedSlides.push(token);
        }
        if (directives.header) token.meta.marpitHeader = directives.header;
        if (directives.footer) token.meta.marpitFooter = directives.footer;

        const serialized = style.toString();
        if (serialized) token.attrSet('style', serialized);
      }

      for (const slide of paginatedSlides) {
        slide.attrSet('data-marpit-pagination-total', slideNumber);
      }
    },
  );
}

module.exports = {
  apply,
  default: apply,
};
