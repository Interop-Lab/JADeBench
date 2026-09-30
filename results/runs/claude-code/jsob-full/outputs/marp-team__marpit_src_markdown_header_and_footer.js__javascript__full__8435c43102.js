"use strict";

function marpitPlugin(plugin) {
  return function guardedMarpitPlugin(markdownIt, ...args) {
    if (markdownIt.marpit) {
      return plugin.call(this, markdownIt, ...args);
    }

    throw new Error(
      "Marpit plugin has detected incompatible markdown-it instance.",
    );
  };
}

function wrapTokens(Token, type, options, children = []) {
  const { tag } = options;

  for (const child of children) child.level += 1;

  const open = new Token(`${type}_open`, tag, 1);
  const close = new Token(`${type}_close`, tag, -1);

  Object.assign(open, options.open || {});
  Object.assign(close, options.close || {});

  for (const key of Object.keys(options)) {
    if (!["open", "close", "tag"].includes(key) && options[key] != null) {
      open.attrSet(key, options[key]);
    }
  }

  return [open, ...children, close];
}

function headerAndFooterPlugin(markdownIt) {
  markdownIt.core.ruler.after(
    "marpit_directives_apply",
    "marpit_header_and_footer",
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

      const wrapHeaderOrFooter = (tag, source) =>
        wrapTokens(
          state.Token,
          `marpit_${tag}`,
          { tag, close: { block: true } },
          parseInline(source),
        );

      let slideOpenToken;
      const tokens = [];

      for (const token of state.tokens) {
        if (token.type === "marpit_slide_open") {
          slideOpenToken = token;
          tokens.push(token);

          if (slideOpenToken.meta && slideOpenToken.meta.marpitHeader) {
            tokens.push(
              ...wrapHeaderOrFooter(
                "header",
                slideOpenToken.meta.marpitHeader,
              ),
            );
          }
        } else if (token.type === "marpit_slide_close") {
          if (slideOpenToken.meta && slideOpenToken.meta.marpitFooter) {
            tokens.push(
              ...wrapHeaderOrFooter(
                "footer",
                slideOpenToken.meta.marpitFooter,
              ),
            );
          }

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

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: () => headerAndFooter,
});
Object.defineProperty(exports, "headerAndFooter", {
  enumerable: true,
  get: () => headerAndFooter,
});
