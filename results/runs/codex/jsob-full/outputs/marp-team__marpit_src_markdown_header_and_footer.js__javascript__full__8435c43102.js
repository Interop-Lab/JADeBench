"use strict";

const INCOMPATIBLE_MARKDOWN_IT =
  "Marpit plugin has detected incompatible markdown-it instance.";

function marpitPlugin(plugin) {
  return function (markdown, ...arguments_) {
    if (markdown.marpit) {
      return plugin.call(this, markdown, ...arguments_);
    }

    throw new Error(INCOMPATIBLE_MARKDOWN_IT);
  };
}

function wrapTokens(Token, type, options, children = []) {
  const { tag } = options;

  for (const child of children) child.level += 1;

  const open = new Token(type + "_open", tag, 1);
  const close = new Token(type + "_close", tag, -1);

  Object.assign(open, { ...(options.open || {}) });
  Object.assign(close, { ...(options.close || {}) });

  for (const key of Object.keys(options)) {
    if (!["open", "close", "tag"].includes(key) && options[key] != null) {
      open.attrSet(key, options[key]);
    }
  }

  return [open, ...children, close];
}

function headerAndFooterPlugin(markdown) {
  markdown.core.ruler.after(
    "marpit_directives_apply",
    "marpit_header_and_footer",
    (state) => {
      if (state.inlineMode) return;

      const inlineCache = new Map();
      const parseInline = (content) => {
        let parsed = inlineCache.get(content);

        if (!parsed) {
          parsed = markdown.parseInline(content, state.env);
          delete parsed.map;
          inlineCache.set(content, parsed);
        }

        return parsed;
      };

      const createWrapper = (tag, content) =>
        wrapTokens(
          state.Token,
          "marpit_" + tag,
          { tag, close: { block: true } },
          parseInline(content),
        );

      let slideOpen;
      const tokens = [];

      for (const token of state.tokens) {
        if (token.type === "marpit_slide_open") {
          slideOpen = token;
          tokens.push(token);

          if (slideOpen.meta && slideOpen.meta.marpitHeader) {
            tokens.push(...createWrapper("header", slideOpen.meta.marpitHeader));
          }
        } else if (token.type === "marpit_slide_close") {
          if (slideOpen.meta && slideOpen.meta.marpitFooter) {
            tokens.push(...createWrapper("footer", slideOpen.meta.marpitFooter));
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
