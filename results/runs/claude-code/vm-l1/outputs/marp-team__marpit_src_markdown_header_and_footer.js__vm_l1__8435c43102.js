"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: () => headerAndFooter,
});
Object.defineProperty(exports, "headerAndFooter", {
  enumerable: true,
  get: () => headerAndFooter,
});

function marpitPlugin(plugin) {
  return function wrappedMarpitPlugin(markdown, ...parameters) {
    if (!markdown.marpit) {
      throw new Error(
        "Marpit plugin has detected incompatible markdown-it instance.",
      );
    }

    return plugin.call(this, markdown, ...parameters);
  };
}

function wrapTokens(
  Token,
  type,
  tokens,
  { tag = false, level = 1, ...properties } = {},
) {
  const open = Object.assign(
    new Token(`${type}_open`, tag || "", level),
    properties,
    properties.open,
  );
  const close = Object.assign(
    new Token(`${type}_close`, tag || "", -level),
    properties,
    properties.close,
  );

  for (const name of Object.keys(properties)) {
    if (["open", "close"].includes(name)) {
      delete open[name];
      delete close[name];
    } else {
      open.attrSet(name, open[name]);
      close.attrSet(name, close[name]);
    }
  }

  return [open, ...tokens, close];
}

function installHeaderAndFooterRule(markdown) {
  markdown.core.ruler.after(
    "marpit_directives_apply",
    "marpit_header_and_footer",
    (state) => {
      if (state.inlineMode) return;

      const parsedInline = new Map();
      const parseInline = (source) => {
        if (!parsedInline.has(source)) {
          parsedInline.set(source, markdown.parseInline(source, state.env));
        }

        return parsedInline
          .get(source)
          .map((token) => Object.assign(new state.Token(), token));
      };

      const wrappedContent = (name, source) =>
        wrapTokens(state.Token, `marpit_${name}`, parseInline(source), {
          tag: name,
          block: true,
          close: { block: true },
        });

      const tokens = [];

      for (const token of state.tokens) {
        if (token.type === "marpit_slide_open") {
          tokens.push(token);

          if (token.meta?.marpitHeader) {
            tokens.push(...wrappedContent("header", token.meta.marpitHeader));
          }
        } else if (token.type === "marpit_slide_close") {
          if (token.meta?.marpitFooter) {
            tokens.push(...wrappedContent("footer", token.meta.marpitFooter));
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

const headerAndFooter = marpitPlugin(installHeaderAndFooterRule);
