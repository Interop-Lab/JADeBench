'use strict';

const postcss = require('postcss');
const kebabCase = require('lodash.kebabcase');

/**
 * A small mutable representation of an element's inline CSS declarations.
 * Invalid CSS fragments are ignored by PostCSS in the same way as the source
 * implementation.
 */
class InlineStyle {
  constructor(style) {
    this.declarations = {};

    if (style instanceof InlineStyle || (style && typeof style === 'object')) {
      this.declarations = { ...(style.declarations || style) };
    } else if (style) {
      const root = postcss.parse(String(style), { from: undefined });
      root.walkDecls(declaration => {
        if (declaration.type === 'decl') {
          this.declarations[declaration.prop] = declaration.value;
        }
      });
    }
  }

  setProperty(property, value) {
    this.declarations[property] = value;
  }

  toString() {
    return Object.entries(this.declarations)
      .map(([property, value]) => `${property}:${value};`)
      .join('');
  }
}

// Directive names handled specially rather than exposed as CSS variables.
const BUILTIN_DIRECTIVES = new Set([
  'backgroundColor',
  'backgroundImage',
  'backgroundPosition',
  'backgroundRepeat',
  'backgroundSize',
  'class',
  'color',
  'footer',
  'header',
  'headingDivider',
  'lang',
  'paginate',
  'style',
  'theme',
]);

function applyDirectives(markdown, options = {}) {
  const { marpit } = markdown;
  const { lang } = marpit.options;

  const inlineSVG = options.inlineSVG === undefined ? true : Boolean(options.inlineSVG);
  const html = options.html === undefined ? true : Boolean(options.html);

  const { global = {}, local = {} } = marpit.customDirectives;
  const customDirectives = new Set([
    ...Object.keys(global),
    ...Object.keys(local),
    ...BUILTIN_DIRECTIVES,
  ]);

  markdown.core.ruler.after(
    'marpit_directives_parse',
    'marpit_directives_apply',
    state => {
      if (state.inlineMode) return;

      let pageNumber = 0;
      const paginatedTokens = [];

      for (const token of state.tokens) {
        const { marpitDirectives: directives } = token.meta || {};

        if (token.type !== 'inline') continue;

        if (!directives?.theme && !directives?.size) pageNumber += 1;
        if (!directives) continue;

        const style = new InlineStyle(token.attrGet('style'));

        for (const directive of Object.keys(directives)) {
          if (customDirectives.has(directive)) {
            const value = directives[directive];
            if (!value) continue;
            const property = kebabCase(directive);
            if (inlineSVG) token.attrSet(`data-${property}`, value);
            if (html) style.setProperty(`--${property}`, value);
          }
        }

        if (directives.lang || lang) token.attrSet('lang', directives.lang || lang);
        if (directives.class) token.attrJoin('class', directives.class);

        if (directives.color) style.setProperty('color', directives.color);
        if (directives.backgroundColor)
          style.setProperty('background-color', directives.backgroundColor);
        if (directives.backgroundColor) style.setProperty('background-image', 'none');
        if (directives.backgroundImage) {
          style.setProperty('background-image', directives.backgroundImage);
          style.setProperty('background-position', 'center');
          style.setProperty('background-repeat', 'no-repeat');
          style.setProperty('background-size', 'cover');
        }
        if (directives.backgroundPosition)
          style.setProperty('background-position', directives.backgroundPosition);
        if (directives.backgroundRepeat)
          style.setProperty('background-repeat', directives.backgroundRepeat);
        if (directives.backgroundSize)
          style.setProperty('background-size', directives.backgroundSize);

        if (directives.paginate) {
          if (pageNumber <= 0) pageNumber = 1;
          token.attrSet('data-marpit-pagination', pageNumber);
          paginatedTokens.push(token);
        }

        if (directives.header) token.meta.marpitHeader = directives.header;
        if (directives.footer) token.meta.marpitFooter = directives.footer;

        const serializedStyle = style.toString();
        if (serializedStyle !== '') token.attrSet('style', serializedStyle);
      }

      for (const token of paginatedTokens) {
        token.attrSet('data-marpit-pagination-total', pageNumber);
      }
    },
  );
}

/**
 * Marpit's plugin adapter: reject an incompatible markdown-it instance and
 * otherwise install the directive application rule.
 */
function marpitPlugin(plugin) {
  return function pluginAdapter(markdown, ...args) {
    if (!markdown || !markdown.marpit) {
      throw new Error('Marpit plugin has detected incompatible markdown-it instance.');
    }
    return plugin.call(this, markdown, ...args);
  };
}

const apply = marpitPlugin(applyDirectives);

module.exports = {};
Object.defineProperties(module.exports, {
  apply: { enumerable: true, get: () => apply },
  default: { enumerable: true, get: () => apply },
});
