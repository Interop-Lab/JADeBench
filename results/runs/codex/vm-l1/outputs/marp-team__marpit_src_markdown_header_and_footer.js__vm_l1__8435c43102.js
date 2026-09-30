'use strict';

function marpitPlugin(plugin) {
  return function headerAndFooter(markdownIt, ...args) {
    if (!markdownIt.marpit) {
      throw new Error('Marpit plugin has detected incompatible markdown-it instance.');
    }

    return plugin.call(this, markdownIt, ...args);
  };
}

function wrapTokens(Token, type, options) {
  const open = new Token(`${type}_open`, options.tag, 1);
  const close = new Token(`${type}_close`, options.tag, -1);

  Object.assign(open, options.open);
  Object.assign(close, options.close);

  for (const key of Object.keys(options)) {
    if (!['tag', 'open', 'close'].includes(key)) open.attrSet(key, options[key]);
  }

  return [open, close];
}

function headerAndFooterPlugin(markdownIt) {
  markdownIt.core.ruler.after(
    'marpit_directives_apply',
    'marpit_header_and_footer',
    (state) => {
      if (state.inlineMode) return;

      const parsedDirectives = new Map();
      const parseDirective = (directive) => {
        let tokens = parsedDirectives.get(directive);
        if (!tokens) {
          tokens = markdownIt.parseInline(directive, state.env);
          parsedDirectives.set(directive, tokens);
        }
        return tokens;
      };

      const wrappedDirective = (name, directive) => {
        const [open, close] = wrapTokens(state.Token, `marpit_${name}`, {
          tag: name,
          close: { block: true },
        });
        const contents = parseDirective(directive).map((token) => {
          token.level += 1;
          return token;
        });
        return [open, ...contents, close];
      };

      const tokens = [];
      let slideOpen;
      for (const token of state.tokens) {
        if (token.type === 'marpit_slide_open') {
          slideOpen = token;
          tokens.push(token);
          const header = token.meta?.marpitHeader;
          if (header) tokens.push(...wrappedDirective('header', header));
        } else if (token.type === 'marpit_slide_close') {
          const footer = slideOpen.meta?.marpitFooter;
          if (footer) tokens.push(...wrappedDirective('footer', footer));
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
const exported = {};
Object.defineProperty(exported, '__esModule', { value: true });
Object.defineProperty(exported, 'default', {
  enumerable: true,
  get: () => headerAndFooter,
});
Object.defineProperty(exported, 'headerAndFooter', {
  enumerable: true,
  get: () => headerAndFooter,
});
module.exports = exported;
