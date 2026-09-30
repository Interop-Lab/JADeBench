'use strict';

Object.defineProperty(exports, '__esModule', { value: true });
Object.defineProperties(exports, {
  default: { enumerable: true, get: () => headerAndFooter },
  headerAndFooter: { enumerable: true, get: () => headerAndFooter },
});

function marpitPlugin(plugin) {
  return function wrappedMarpitPlugin(markdown) {
    if (!markdown.marpit) {
      throw new Error('Marpit plugin has detected incompatible markdown-it instance.');
    }

    return plugin.apply(this, arguments);
  };
}

function wrapTokens(Token, type, options) {
  const tag = options.tag;
  const open = new Token(`${type}_open`, tag, 1);
  const close = new Token(`${type}_close`, tag, -1);

  Object.assign(open, options.open);
  Object.assign(close, options.close);

  for (const key of Object.keys(options)) {
    if (!['tag', 'open', 'close'].includes(key)) open.attrSet(key, options[key]);
  }

  return [open, close];
}

function headerAndFooterPlugin(markdown) {
  markdown.core.ruler.after(
    'marpit_directives_apply',
    'marpit_header_and_footer',
    (state) => {
      if (state.inlineMode) return;

      const parsedDirectives = new Map();
      const parseDirective = (directive) => {
        let tokens = parsedDirectives.get(directive);
        if (!tokens) {
          tokens = markdown.parseInline(directive, state.env);
          parsedDirectives.set(directive, tokens);
        }
        return tokens;
      };
      const renderDirective = (directive, type) => {
        const tokens = parseDirective(directive);
        const [open, close] = wrapTokens(state.Token, `marpit_${type}`, {
          tag: type,
          close: { block: true },
        });

        for (const token of tokens) token.level += 1;
        return [open, ...tokens, close];
      };

      const tokens = [];
      let footer;
      for (const token of state.tokens) {
        if (token.type === 'marpit_slide_open') {
          tokens.push(token);
          footer = token.meta.marpitFooter;

          const header = token.meta.marpitHeader;
          if (header) tokens.push(...renderDirective(header, 'header'));
        } else if (token.type === 'marpit_slide_close') {
          if (footer) tokens.push(...renderDirective(footer, 'footer'));
          tokens.push(token);
        } else {
          tokens.push(token);
        }
      }

      state.tokens = tokens;
    },
  );
}

const headerAndFooter = marpitPlugin(headerAndFooterPlugin);
