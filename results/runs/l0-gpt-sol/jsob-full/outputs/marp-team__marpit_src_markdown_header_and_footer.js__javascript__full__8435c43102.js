function wrapTokens(Token, type, token, children = []) {
  const { tag } = token;

  for (const child of children) child.level += 1;

  const opening = new Token(`${type}_open`, tag, 1);
  const closing = new Token(`${type}_close`, tag, -1);

  Object.assign(opening, { ...(token.open || {}) });
  Object.assign(closing, { ...(token.close || {}) });

  for (const key of Object.keys(token)) {
    if (!["tag", "open", "close"].includes(key) && token[key] != null) {
      opening.attrSet(key, token[key]);
    }
  }

  return [opening, ...children, closing];
}

function plugin(callback) {
  return function (markdown, ...parameters) {
    if (markdown.marpit) {
      return callback.call(this, markdown, ...parameters);
    }

    throw new Error(
      "Marpit plugin is designed to use with Marpit class. Please use Marpit.use() instead of MarkdownIt.use()."
    );
  };
}

function registerHeaderAndFooter(markdown) {
  markdown.core.ruler.after(
    "marpit_slide",
    "marpit_header_and_footer",
    state => {
      if (state.inlineMode) return;

      const parsedTokens = new Map();

      const parse = content => {
        let tokens = parsedTokens.get(content);

        if (!tokens) {
          tokens = markdown.parseInline(content, state.env);
          delete tokens[0].map;
          parsedTokens.set(content, tokens);
        }

        return tokens;
      };

      const create = (tag, content) =>
        wrapTokens(
          state.Token,
          `marpit_${tag}`,
          { tag, close: { hidden: true } },
          parse(content)
        );

      let slide;
      const tokens = [];

      for (const token of state.tokens) {
        if (token.type === "marpit_slide_open") {
          slide = token;
          tokens.push(token);

          if (slide.meta && slide.meta.marpitHeader) {
            tokens.push(...create("header", slide.meta.marpitHeader));
          }
        } else if (token.type === "marpit_slide_close") {
          if (slide.meta && slide.meta.marpitFooter) {
            tokens.push(...create("footer", slide.meta.marpitFooter));
          }

          tokens.push(token);
        } else {
          tokens.push(token);
        }
      }

      state.tokens = tokens;
    }
  );
}

const headerAndFooter = plugin(registerHeaderAndFooter);

const exportsObject = {};

Object.defineProperty(exportsObject, "__esModule", { value: true });
Object.defineProperty(exportsObject, "default", {
  enumerable: true,
  get: () => headerAndFooter
});
Object.defineProperty(exportsObject, "headerAndFooter", {
  enumerable: true,
  get: () => headerAndFooter
});

module.exports = exportsObject;
