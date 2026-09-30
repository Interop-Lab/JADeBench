'use strict';

const postcss = require('postcss');
const kebabCase = require('lodash.kebabcase');

class InlineStyle {
  constructor(style) {
    this.decls = {};

    if (style instanceof InlineStyle) {
      Object.assign(this.decls, style.decls);
    } else if (typeof style === 'string') {
      postcss.parse(style, { from: undefined }).each((node) => {
        if (node.type === 'decl') this.decls[node.prop] = node.value;
      });
    } else {
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
    return Object.keys(this.decls)
      .map((property) => {
        const root = postcss.parse(`${property}:${this.decls[property]}`, {
          from: undefined,
        });

        root.each((node) => {
          if (node.type !== 'decl' || node.prop !== property) node.remove();
        });

        const declaration = root.toString();
        return declaration ? `${declaration};` : '';
      })
      .join('');
  }
}

const validHeadingDividers = [1, 2, 3, 4, 5, 6];

function parseHeadingDivider(value) {
  if (Number.isNaN(value)) return value;
  return Number.parseInt(value, 10);
}

const globals = Object.assign(Object.create(null), {
  headingDivider(value) {
    if (Array.isArray(value)) {
      return {
        headingDivider: value
          .map(parseHeadingDivider)
          .filter((divider) => validHeadingDividers.includes(divider)),
      };
    }

    if (value === 'false') return { headingDivider: false };

    const divider = parseHeadingDivider(value);
    return validHeadingDividers.includes(divider)
      ? { headingDivider: divider }
      : {};
  },

  style(value) {
    return { style: value };
  },

  theme(value, marpit) {
    return marpit.themeSet.has(value) ? { theme: value } : {};
  },

  lang(value) {
    return { lang: value };
  },
});

function valueDirective(name) {
  return (value) => ({ [name]: value });
}

const locals = Object.assign(Object.create(null), {
  backgroundColor: valueDirective('backgroundColor'),
  backgroundImage: valueDirective('backgroundImage'),
  backgroundPosition: valueDirective('backgroundPosition'),
  backgroundRepeat: valueDirective('backgroundRepeat'),
  backgroundSize: valueDirective('backgroundSize'),

  class(value) {
    return { class: Array.isArray(value) ? value.join(' ') : value };
  },

  color: valueDirective('color'),

  footer(value) {
    return typeof value === 'string' ? { footer: value } : {};
  },

  header(value) {
    return typeof value === 'string' ? { header: value } : {};
  },

  paginate(value) {
    const normalized = (value || '').toLowerCase();
    return {
      paginate: ['hold', 'skip'].includes(normalized)
        ? normalized
        : normalized === 'true',
    };
  },
});

const builtInDirectives = [...Object.keys(globals), ...Object.keys(locals)];

function installDirectives(markdownIt, pluginOptions) {
  const { marpit } = markdownIt;
  const { lang: defaultLanguage } = marpit.options;
  const options = pluginOptions === undefined ? {} : pluginOptions;
  const dataset = options.dataset === undefined ? true : !!options.dataset;
  const css = options.css === undefined ? true : !!options.css;
  const { global: customGlobals, local: customLocals } = marpit.customDirectives;
  const directiveNames = [
    ...Object.keys(customGlobals),
    ...Object.keys(customLocals),
    ...builtInDirectives,
  ];

  markdownIt.core.ruler.after(
    'marpit_directives_parse',
    'marpit_directives_apply',
    (state) => {
      if (state.inlineMode) return;

      let page = 0;
      const paginatedTokens = [];

      for (const token of state.tokens) {
        const directives = token.meta && token.meta.marpitDirectives;
        if (!directives) continue;

        const style = new InlineStyle(token.attrGet('style'));

        for (const name of Object.keys(directives)) {
          const value = directives[name];
          if (!value || !directiveNames.includes(name)) continue;

          const kebabName = kebabCase(name);
          if (dataset) token.attrSet(`data-${kebabName}`, value);
          if (css) style.set(`--${kebabName}`, value);
        }

        const language = directives.lang || defaultLanguage;
        if (language) token.attrSet('lang', language);
        if (directives.class) token.attrJoin('class', directives.class);

        if (
          token.type === 'marpit_slide_open' &&
          directives.paginate !== 'skip' &&
          directives.paginate !== 'hold'
        ) {
          page += 1;
        }

        if (directives.paginate && directives.paginate !== 'skip') {
          if (page <= 0) page = 1;
          token.attrSet('data-marpit-pagination', page);
          paginatedTokens.push(token);
        }

        if (directives.header) token.meta.marpitHeader = directives.header;
        if (directives.footer) token.meta.marpitFooter = directives.footer;

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

        const serializedStyle = style.toString();
        if (serializedStyle) token.attrSet('style', serializedStyle);
      }

      for (const token of paginatedTokens) {
        token.attrSet('data-marpit-pagination-total', page);
      }
    },
  );
}

function apply(markdownIt, ...args) {
  if (!markdownIt.marpit) {
    throw new Error(
      'Marpit plugin has detected incompatible markdown-it instance.',
    );
  }

  return installDirectives.call(this, markdownIt, args[0]);
}

const exported = {};
Object.defineProperty(exported, '__esModule', { value: true });
Object.defineProperties(exported, {
  apply: { enumerable: true, get: () => apply },
  default: { enumerable: true, get: () => apply },
});
module.exports = exported;
