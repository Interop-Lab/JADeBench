function wrapMarpitPlugin(plugin) {
  return function (markdownIt, ...args) {
    if (markdownIt.marpit) {
      return plugin.call(this, markdownIt, ...args);
    }

    throw new Error(
      'Marpit plugin has detected incompatible markdown-it instance.',
    );
  };
}

function wrapTokens(Token, typePrefix, options, innerTokens = []) {
  const { tag } = options;

  for (const token of innerTokens) {
    token.level += 1;
  }

  const openingToken = new Token(`${typePrefix}_open`, tag, 1);
  const closingToken = new Token(`${typePrefix}_close`, tag, -1);

  Object.assign(openingToken, { ...(options.open || {}) });
  Object.assign(closingToken, { ...(options.close || {}) });

  for (const key of Object.keys(options)) {
    if (!['open', 'close', 'tag'].includes(key) && options[key] != null) {
      openingToken.attrSet(key, options[key]);
    }
  }

  return [openingToken, ...innerTokens, closingToken];
}

function registerHeaderAndFooter(markdownIt) {
  markdownIt.core.ruler.after(
    'marpit_directives_apply',
    'marpit_header_and_footer',
    (state) => {
      if (state.inlineMode) return;

      const inlineTokenCache = new Map();
      const parseInline = (source) => {
        let tokens = inlineTokenCache.get(source);

        if (!tokens) {
          tokens = markdownIt.parseInline(source, state.env);
          delete tokens.map;
          inlineTokenCache.set(source, tokens);
        }

        return tokens;
      };

      const createRegion = (name, source) =>
        wrapTokens(
          state.Token,
          `marpit_${name}`,
          { tag: name, close: { block: true } },
          parseInline(source),
        );

      let slideOpeningToken;
      const transformedTokens = [];

      for (const token of state.tokens) {
        if (token.type === 'marpit_slide_open') {
          slideOpeningToken = token;
          transformedTokens.push(token);

          if (
            slideOpeningToken.meta &&
            slideOpeningToken.meta.marpitHeader
          ) {
            transformedTokens.push(
              ...createRegion(
                'header',
                slideOpeningToken.meta.marpitHeader,
              ),
            );
          }
        } else if (token.type === 'marpit_slide_close') {
          if (
            slideOpeningToken.meta &&
            slideOpeningToken.meta.marpitFooter
          ) {
            transformedTokens.push(
              ...createRegion(
                'footer',
                slideOpeningToken.meta.marpitFooter,
              ),
            );
          }

          transformedTokens.push(token);
        } else {
          transformedTokens.push(token);
        }
      }

      state.tokens = transformedTokens;
    },
  );
}

const headerAndFooter = wrapMarpitPlugin(registerHeaderAndFooter);
const exported = {};

Object.defineProperty(exported, '__esModule', { value: true });
Object.defineProperties(exported, {
  default: {
    enumerable: true,
    get: () => headerAndFooter,
  },
  headerAndFooter: {
    enumerable: true,
    get: () => headerAndFooter,
  },
});

module.exports = exported;
