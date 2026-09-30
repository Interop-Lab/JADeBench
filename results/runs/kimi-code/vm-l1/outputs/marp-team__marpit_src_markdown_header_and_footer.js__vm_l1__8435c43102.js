"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

function wrapTokens(markdown, state, content, type) {
  const openToken = new state.Token(`marpit_${type}_open`, type, 1);
  const inlineTokens = markdown.parseInline(content, state.env);
  const closeToken = new state.Token(`marpit_${type}_close`, type, -1);
  closeToken.block = true;

  return [openToken, ...inlineTokens, closeToken];
}

function headerAndFooter(markdown) {
  if (!markdown.marpit) {
    throw new Error("Marpit plugin has detected incompatible markdown-it instance.");
  }

  markdown.core.ruler.after(
    "marpit_directives_apply",
    "marpit_header_and_footer",
    state => {
      if (state.inlineMode) return;

      const output = [];
      let footerTokens;

      const appendWrappedTokens = tokens => {
        if (!tokens) return;
        for (let index = 1; index < tokens.length - 1; index++) tokens[index].level += 1;
        output.push(...tokens);
      };

      for (const token of state.tokens) {
        if (token.type === "marpit_slide_open") {
          const header = token.meta && token.meta.marpitHeader;
          const footer = token.meta && token.meta.marpitFooter;
          const headerTokens = header && wrapTokens(markdown, state, header, "header");
          footerTokens = footer && wrapTokens(markdown, state, footer, "footer");

          output.push(token);
          appendWrappedTokens(headerTokens);
        } else if (token.type === "marpit_slide_close") {
          appendWrappedTokens(footerTokens);
          output.push(token);
        } else {
          output.push(token);
        }
      }

      state.tokens = output;
    },
  );
}

Object.defineProperties(exports, {
  default: { enumerable: true, get: () => headerAndFooter },
  headerAndFooter: { enumerable: true, get: () => headerAndFooter },
});
