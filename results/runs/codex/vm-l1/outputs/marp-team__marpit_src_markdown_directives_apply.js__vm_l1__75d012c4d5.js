const postcss = require('postcss');
const kebabCase = require('lodash.kebabcase');

class InlineStyle {
  constructor(style) {
    this.decls = {};

    if (typeof style === 'string' && style) {
      const root = postcss.parse(`a{${style}}`);
      for (const declaration of root.first.nodes) {
        if (declaration.type === 'decl') this.decls[declaration.prop] = declaration.value;
      }
    } else if (style && typeof style === 'object') {
      Object.assign(this.decls, style);
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
    return Object.entries(this.decls)
      .map(([property, value]) => `${property}:${value};`)
      .join('');
  }
}

const globalDirectives = {
  headingDivider(value) {
    if (value === false) return { headingDivider: false };
    const headingDivider = Number.parseInt(value, 10);
    return headingDivider > 0 ? { headingDivider } : {};
  },
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
  class: value => ({ class: value }),
  color: value => ({ color: value }),
  footer: value => (typeof value === 'string' ? { footer: value } : {}),
  header: value => (typeof value === 'string' ? { header: value } : {}),
  paginate: value => ({
    paginate: typeof value === 'string' ? value.toLowerCase() === 'true' : Boolean(value),
  }),
};

const directiveNames = [...Object.keys(globalDirectives), ...Object.keys(localDirectives)];

function apply(markdown) {
  if (!markdown.marpit) throw new Error('Marpit plugin has detected incompatible markdown-it instance.');

  const marpit = markdown.marpit;
  const customDirectives = marpit.customDirectives || {};
  const recognized = new Set([
    ...directiveNames,
    ...Object.keys(customDirectives.global || {}),
    ...Object.keys(customDirectives.local || {}),
  ]);

  markdown.core.ruler.after('marpit_directives_parse', 'marpit_directives_apply', state => {
    if (state.inlineMode) return;

    let page = 0;
    const paginatedTokens = [];

    for (const token of state.tokens) {
      const directives = token.meta && token.meta.marpitDirectives;
      if (!directives) continue;

      page += 1;
      const style = new InlineStyle(token.attrGet('style'));

      for (const [name, value] of Object.entries(directives)) {
        if (!recognized.has(name) || !value) continue;
        const property = kebabCase(name);
        token.attrSet(`data-${property}`, value);
        style.set(`--${property}`, value);
      }

      const language = directives.lang || marpit.options.lang;
      if (language) token.attrSet('lang', language);

      if (directives.class) token.attrJoin('class', directives.class);
      if (directives.color) style.set('color', directives.color);

      if (directives.backgroundColor) {
        style.set('background-color', directives.backgroundColor);
        if (!directives.backgroundImage) style.set('background-image', 'none');
      }

      if (directives.backgroundImage) {
        style
          .set('background-image', directives.backgroundImage)
          .set('background-position', directives.backgroundPosition || 'center')
          .set('background-repeat', directives.backgroundRepeat || 'no-repeat')
          .set('background-size', directives.backgroundSize || 'cover');
      }

      if (typeof directives.header === 'string') token.meta.marpitHeader = directives.header;
      if (typeof directives.footer === 'string') token.meta.marpitFooter = directives.footer;

      if (directives.paginate) {
        token.attrSet('data-marpit-pagination', page);
        paginatedTokens.push(token);
      }

      const serializedStyle = style.toString();
      if (serializedStyle) token.attrSet('style', serializedStyle);
    }

    for (const token of paginatedTokens) token.attrSet('data-marpit-pagination-total', page);
  });
}

Object.defineProperty(exports, '__esModule', { value: true });
Object.defineProperties(exports, {
  apply: { enumerable: true, get: () => apply },
  default: { enumerable: true, get: () => apply },
});
