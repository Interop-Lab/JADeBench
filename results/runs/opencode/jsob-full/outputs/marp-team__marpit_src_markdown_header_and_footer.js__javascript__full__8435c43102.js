"use strict";

/**
 * Mark a function as a Marpit plugin.
 *
 * Marpit plugins must only be installed into markdown-it instances created by
 * Marpit. Keeping this wrapper local also preserves the original module's
 * behavior without depending on the source package's plugin helper.
 */
function plugin(fn) {
  function marpitPlugin(md, ...args) {
    if (md.marpit) return fn.call(this, md, ...args);

    throw new Error(
      "Marpit plugin has detected incompatible markdown-it instance.",
    );
  }

  return marpitPlugin;
}

function wrapTokens(Token, type, options, children = []) {
  const { tag } = options;

  for (const child of children) child.level += 1;

  const open = new Token(`${type}_open`, tag, 1);
  const close = new Token(`${type}_close`, tag, -1);

  Object.assign(open, { ...(options.open || {}) });
  Object.assign(close, { ...(options.close || {}) });

  for (const key of Object.keys(options)) {
    if (!["open", "close", "tag"].includes(key) && options[key] != null) {
      open.attrSet(key, options[key]);
    }
  }

  return [open, ...children, close];
}

function _headerAndFooter(md) {
  md.core.ruler.after(
    "marpit_directives_apply",
    "marpit_header_and_footer",
    (state) => {
      if (state.inlineMode) return;

      // Parsing identical header/footer strings repeatedly is needlessly
      // expensive. Parsed tokens are cloned below because their levels are
      // adjusted when they are inserted into a wrapper.
      const parsed = new Map();
      const parseInline = (source) => {
        let tokens = parsed.get(source);
        if (!tokens) {
          tokens = md.parseInline(source, state.env);
          delete tokens.hidden;
          parsed.set(source, tokens);
        }
        return tokens;
      };

      const block = { block: true };
      const wrap = (name, source) =>
        wrapTokens(
          state.Token,
          `marpit_${name}`,
          { tag: name, close: block },
          parseInline(source),
        );

      let slideOpen;
      const output = [];

      for (const token of state.tokens) {
        if (token.type === "marpit_slide_open") {
          slideOpen = token;
          output.push(token);

          if (slideOpen.meta && slideOpen.meta.marpitHeader) {
            output.push(...wrap("header", slideOpen.meta.marpitHeader));
          }
        } else if (token.type === "marpit_slide_close") {
          if (slideOpen.meta && slideOpen.meta.marpitFooter) {
            output.push(...wrap("footer", slideOpen.meta.marpitFooter));
          }
          output.push(token);
        } else {
          output.push(token);
        }
      }

      state.tokens = output;
    },
  );
}

const headerAndFooter = plugin(_headerAndFooter);

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: () => headerAndFooter,
});
Object.defineProperty(exports, "headerAndFooter", {
  enumerable: true,
  get: () => headerAndFooter,
});
