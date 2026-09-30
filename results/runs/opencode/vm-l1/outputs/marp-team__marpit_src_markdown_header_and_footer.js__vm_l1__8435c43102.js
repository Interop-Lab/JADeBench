"use strict";

/**
 * Wrap inline tokens in a semantic Marpit element.
 *
 * The closing token is marked as a block token, matching markdown-it's token
 * conventions and allowing Marpit's renderer rules to handle the wrapper.
 */
function wrapTokens(Token, type, tag, tokens) {
  const opening = new Token(`${type}_open`, tag, 1);
  const closing = new Token(`${type}_close`, tag, -1);

  for (const token of tokens) token.level += 1;
  closing.block = true;

  return [opening, ...tokens, closing];
}

/** Add parsed header and footer directives to each Marpit slide. */
function headerAndFooterPlugin(markdown) {
  if (!markdown.marpit) {
    throw new Error("Marpit plugin has detected incompatible markdown-it instance.");
  }

  markdown.core.ruler.after(
    "marpit_directives_apply",
    "marpit_header_and_footer",
    function applyHeaderAndFooter(state) {
      if (state.inlineMode) return;

      const output = [];
      let footerTokens;

      for (const token of state.tokens) {
        if (token.type === "marpit_slide_open") {
          const metadata = token.meta || {};
          output.push(token);

          if (metadata.marpitHeader) {
            const inlineTokens = markdown.parseInline(metadata.marpitHeader, state.env);
            output.push(
              ...wrapTokens(state.Token, "marpit_header", "header", inlineTokens),
            );
          }

          footerTokens = metadata.marpitFooter
            ? markdown.parseInline(metadata.marpitFooter, state.env)
            : undefined;
          continue;
        }

        if (token.type === "marpit_slide_close" && footerTokens) {
          output.push(
            ...wrapTokens(state.Token, "marpit_footer", "footer", footerTokens),
          );
          footerTokens = undefined;
        }

        output.push(token);
      }

      state.tokens = output;
    },
  );
}

// The bundled module exposes the plugin as both its default and named export.
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: () => headerAndFooterPlugin,
});
Object.defineProperty(exports, "headerAndFooter", {
  enumerable: true,
  get: () => headerAndFooterPlugin,
});
