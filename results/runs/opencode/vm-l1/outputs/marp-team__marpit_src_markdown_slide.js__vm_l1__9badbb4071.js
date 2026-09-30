"use strict";

/**
 * Split an array whenever `isSeparator` returns true.
 *
 * A separator starts the following group when `keepSeparator` is true;
 * otherwise it is discarded.
 */
function split(items, isSeparator, keepSeparator = false) {
  const groups = [[]];

  for (const item of items) {
    if (isSeparator(item)) {
      groups.push(keepSeparator ? [item] : []);
    } else {
      groups[groups.length - 1].push(item);
    }
  }

  return groups;
}

/**
 * Surround markdown-it tokens with a matching pair of container tokens.
 */
function wrapTokens(Token, type, options = {}, tokens = []) {
  const { tag = "", open = {}, close = {}, ...attributes } = options;
  const openingToken = new Token(`${type}_open`, tag, 1);
  const closingToken = new Token(`${type}_close`, tag, -1);

  Object.assign(openingToken, open);
  Object.assign(closingToken, close);

  for (const [name, value] of Object.entries(attributes)) {
    openingToken.attrSet(name, value);
  }

  for (const token of tokens) token.level += 1;
  return [openingToken, ...tokens, closingToken];
}

function defaultAnchorCallback(index) {
  return String(index + 1);
}

/**
 * markdown-it core plugin that turns top-level horizontal rules into slide
 * boundaries and wraps every resulting group in a `<section>`.
 */
function slide(md) {
  md.core.ruler.push("marpit_slide", (state) => {
    if (state.inlineMode) return;

    const slides = split(
      state.tokens,
      (token) => token.type === "hr" && token.level === 0,
      true,
    );
    const slideCount = slides.length;

    state.tokens = slides.flatMap((tokens, index) => {
      const boundary = tokens[0];
      const map = boundary && boundary.map ? boundary.map : [0, 1];
      if (boundary && boundary.type === "hr") tokens.shift();

      return wrapTokens(
        state.Token,
        "marpit_slide",
        {
          tag: "section",
          id: defaultAnchorCallback(index),
          open: {
            block: true,
            meta: {
              marpitSlide: index,
              marpitSlideTotal: slideCount,
              marpitSlideElement: 1,
            },
            map,
          },
          close: {
            block: true,
            meta: {
              marpitSlide: index,
              marpitSlideTotal: slideCount,
              marpitSlideElement: -1,
            },
          },
        },
        tokens,
      );
    });
  });
}

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = slide;
exports.defaultAnchorCallback = defaultAnchorCallback;
exports.slide = slide;
