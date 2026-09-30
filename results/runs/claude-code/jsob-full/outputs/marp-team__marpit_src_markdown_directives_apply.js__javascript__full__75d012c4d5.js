'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const postcss = require('postcss');
const kebabCase = require('lodash.kebabcase');

class InlineStyle {
  constructor(style) {
    this.declarations = {};

    if (!style) return;
    if (style instanceof InlineStyle || typeof style === 'object') {
      this.declarations = { ...style.declarations };
      return;
    }

    const root = postcss.parse(style, { from: undefined });
    root.each(node => {
      if (node.type === 'decl') this.declarations[node.prop] = node.value;
    });
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
    let style = '';

    for (const property of Object.keys(this.declarations)) {
      let root;
      try {
        root = postcss.parse(`${property}:${this.declarations[property]}`, {
          from: undefined,
        });
      } catch {
        continue;
      }

      root.each(node => {
        if (node.type !== 'decl' || node.prop !== property) node.remove();
      });
      style += `${root.toString()};`;
    }

    return style;
  }
}

const headingLevels = [1, 2, 3, 4, 5, 6];

const globalDirectives = Object.assign(Object.create(null), {
  headingDivider(value) {
    const normalize = item =>
      Array.isArray(item) || Number.isNaN(item) ? item : Number.parseInt(item, 10);
    const normalized = normalize(value);

    if (Array.isArray(normalized)) {
      const levels = normalized.map(normalize);
      return { headingDivider: headingLevels.filter(level => levels.includes(level)) };
    }
    if (value === false) return { headingDivider: false };
    if (headingLevels.includes(normalized)) return { headingDivider: normalized };
    return {};
  },

  style: value => ({ style: value }),
  theme: (value, marpit) => (marpit.themeSet.has(value) ? { theme: value } : {}),
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
  paginate(value) {
    const normalized = (value || '').toString().toLowerCase();
    if (normalized === 'true' || normalized === 'false') return { paginate: normalized };
    return { paginate: normalized === 'true' };
  },
});

const knownDirectives = [
  ...Object.keys(globalDirectives),
  ...Object.keys(localDirectives),
];

function applyDirectives(markdown, options = {}) {
  const { marpit } = markdown;
  if (!marpit) throw new Error('Marpit instance is required.');

  const { lang } = marpit.options;
  const applyDataset = options.dataset === undefined ? true : Boolean(options.dataset);
  const applyCssVariables = options.css === undefined ? true : Boolean(options.css);
  const directiveNames = [
    ...Object.keys(marpit.customDirectives.global),
    ...Object.keys(marpit.customDirectives.local),
    ...knownDirectives,
  ];

  markdown.core.ruler.after(
    'marpit_directives_parse',
    'marpit_directives_apply',
    state => {
      if (state.inlineMode) return;

      let page = 0;
      const paginatedSlides = [];

      for (const token of state.tokens) {
        const directives = token.meta?.marpitDirectives;
        if (token.type !== 'marpit_slide_open') continue;

        if (!(directives?.paginate === false || directives?.paginate === 'false')) {
          page += 1;
        }
        if (!directives) continue;

        const style = new InlineStyle(token.attrGet('style'));

        for (const name of Object.keys(directives)) {
          if (!directiveNames.includes(name)) continue;
          const value = directives[name];
          if (!value) continue;

          const cssName = kebabCase(name);
          if (applyDataset) token.attrSet(`data-marpit-${cssName}`, value);
          if (applyCssVariables) style.set(`--${cssName}`, value);
        }

        if (directives.lang || lang) token.attrSet('lang', directives.lang || lang);
        if (directives.class) token.attrJoin('class', directives.class);
        if (directives.style) style.set('css', directives.style);

        if (directives.backgroundColor) {
          style.set('background-color', directives.backgroundColor);
        }
        if (directives.backgroundImage) {
          style.set(
            'background-image',
            directives.backgroundImage
              .replace(/^url\((.*)\)$/i, '$1')
              .replace(/^['"]|['"]$/g, ''),
          );
        }
        if (directives.backgroundPosition) {
          style.set('background-position', directives.backgroundPosition);
        }
        if (directives.backgroundRepeat) {
          style.set('background-repeat', directives.backgroundRepeat);
        }
        if (directives.backgroundSize) {
          style.set('background-size', directives.backgroundSize);
        }

        if (directives.paginate && directives.paginate !== 'false') {
          if (page <= 0) page = 1;
          token.attrSet('data-marpit-pagination', page);
          paginatedSlides.push(token);
        }
        if (directives.header) token.meta.marpitHeader = directives.header;
        if (directives.footer) token.meta.marpitFooter = directives.footer;

        const inlineStyle = style.toString();
        if (inlineStyle !== '') token.attrSet('style', inlineStyle);
      }

      for (const token of paginatedSlides) {
        token.attrSet('data-marpit-pagination-total', page);
      }
    },
  );
}

function apply(markdown, ...args) {
  if (!markdown?.marpit) throw new Error('Marpit instance is required.');
  return applyDirectives.call(this, markdown, ...args);
}

exports.apply = apply;
exports.default = apply;
