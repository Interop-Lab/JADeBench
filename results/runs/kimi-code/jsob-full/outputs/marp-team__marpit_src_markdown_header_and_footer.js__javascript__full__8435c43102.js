"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.headerAndFooter = exports.default = void 0;

function marpitPlugin(plugin) {
  function wrappedPlugin(markdownIt, ...params) {
    if (markdownIt.marpit) return plugin.call(this, markdownIt, ...params);
    throw new Error("Marpit plugin has detected incompatible markdown-it instance.");
  }

  Object.defineProperty(wrappedPlugin, "__esModule", { value: true });
  Object.defineProperty(wrappedPlugin, "default", { value: wrappedPlugin });
  Object.defineProperty(wrappedPlugin, "marpitPlugin", { value: wrappedPlugin });
  return wrappedPlugin;
}

function wrapTokens(Token, type, attributes, children = []) {
  const { tag } = attributes;

  for (const child of children) child.level += 1;

  const opening = new Token(`${type}_open`, tag, 1);
  const closing = new Token(`${type}_close`, tag, -1);

  Object.assign(opening, attributes.open || {});
  Object.assign(closing, attributes.close || {});

  for (const key of Object.keys(attributes)) {
    if (!["open", "close", "tag"].includes(key) && attributes[key] != null) {
      opening.attrSet(key, attributes[key]);
    }
  }

  return [opening, ...children, closing];
}

function registerHeaderAndFooter(markdownIt) {
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

      const createRegion = (name, source) =>
        wrapTokens(
          state.Token,
          `marpit_${name}`,
          { tag: name, close: { block: true } },
          parseInline(source),
        );

      let slideOpen;
      const output = [];

      for (const token of state.tokens) {
        if (token.type === "marpit_slide_open") {
          slideOpen = token;
          output.push(token);

          if (slideOpen.meta?.marpitHeader) {
            output.push(...createRegion("header", slideOpen.meta.marpitHeader));
          }
        } else if (token.type === "marpit_slide_close") {
          if (slideOpen.meta?.marpitFooter) {
            output.push(...createRegion("footer", slideOpen.meta.marpitFooter));
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

const headerAndFooter = marpitPlugin(registerHeaderAndFooter);
exports.default = headerAndFooter;
exports.headerAndFooter = headerAndFooter;
