'use strict';

const kebabCase = require('lodash.kebabcase');
const postcss = require('postcss');

class InlineStyle {
  constructor(style) {
    this.decls = {};
    if (typeof style === 'string') {
      postcss.parse(style).each(node => {
        if (node.type === 'decl') this.decls[node.prop] = node.value;
      });
    }
  }

  delete(property) {
    delete this.decls[property];
    return this;
  }

  set(property, value) {
    this.decls[property] = value;
    return this;
  }

  toString() {
    return Object.keys(this.decls)
      .map(property => `${property}:${this.decls[property]};`)
      .join('');
  }
}

const globals = Object.freeze(Object.assign(Object.create(null), {
  headingDivider(value) {
    if (value === 'false') return { headingDivider: false };
    const dividers = (Array.isArray(value) ? value : [value])
      .map(divider => Number.parseInt(divider, 10))
      .filter(divider => [1, 2, 3, 4, 5, 6].includes(divider));
    if (dividers.length === 0) return {};
    return { headingDivider: Array.isArray(value) ? dividers : dividers[0] };
  },
  style: value => ({ style: value }),
  theme: (value, { themeSet }) => themeSet.has(value) ? { theme: value } : {},
  lang: value => ({ lang: value }),
}));

const locals = Object.freeze(Object.assign(Object.create(null), {
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
    const normalized = (value || '').toLowerCase();
    return { paginate: !['hold', 'skip', 'false'].includes(normalized) && normalized === 'true' };
  },
}));

const directiveNames = [...Object.keys(globals), ...Object.keys(locals)];

function apply(markdownIt) {
  const marpit = markdownIt.marpit;
  if (!marpit) throw new Error('Marpit plugin has detected incompatible markdown-it instance.');

  const { lang } = marpit.options;
  const { global: customGlobals, local: customLocals } = marpit.customDirectives;
  const customDirectiveNames = [...Object.keys(customGlobals), ...Object.keys(customLocals)];

  markdownIt.core.ruler.after(
    'marpit_directives_parse',
    'marpit_directives_apply',
    state => {
      if (state.inlineMode) return;

      let slide = 0;
      const paginatedTokens = [];
      for (const token of state.tokens) {
        if (token.type === 'marpit_slide_open') slide += 1;

        const directives = token.meta && token.meta.marpitDirectives;
        if (!directives) continue;

        const style = new InlineStyle(token.attrGet('style'));
        const applicableDirectives = Object.keys(directives).filter(name =>
          directiveNames.includes(name) || customDirectiveNames.includes(name),
        );
        for (const name of applicableDirectives) {
          const value = directives[name];
          if (!value) continue;
          const property = kebabCase(name);
          token.attrSet(`data-${property}`, value);
          style.set(`--${property}`, value);
        }

        token.attrSet('lang', directives.lang || lang);
        if (directives.class) token.attrJoin('class', directives.class);
        if (directives.color) style.set('color', directives.color);

        if (directives.backgroundColor) {
          style.set('background-color', directives.backgroundColor);
          if (!directives.backgroundImage) style.set('background-image', 'none');
        }
        if (directives.backgroundImage) {
          style.set('background-image', directives.backgroundImage);
          style.set('background-position', directives.backgroundPosition || 'center');
          style.set('background-repeat', directives.backgroundRepeat || 'no-repeat');
          style.set('background-size', directives.backgroundSize || 'cover');
        }

        if (directives.paginate) {
          token.attrSet('data-marpit-pagination', slide || 1);
          paginatedTokens.push(token);
        }
        if (directives.header) token.meta.marpitHeader = directives.header;
        if (directives.footer) token.meta.marpitFooter = directives.footer;
        token.attrSet('style', style.toString());
      }

      const total = slide || 1;
      for (const token of paginatedTokens) token.attrSet('data-marpit-pagination-total', total);
    },
  );
}

module.exports = {
  apply,
  default: apply,
};
