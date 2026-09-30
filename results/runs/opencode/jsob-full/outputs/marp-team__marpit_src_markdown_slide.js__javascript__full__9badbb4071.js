"use strict";

/**
 * Split an array whenever `isSeparator` matches an item.
 *
 * With `keepSeparator`, a separator becomes the first item of the following
 * group. This is used to preserve the source map of a slide-separating `<hr>`.
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

/** Create the opening and closing tokens surrounding one slide. */
function wrapTokens(Token, type, attributes, tokens = []) {
  const { tag } = attributes;

  for (const token of tokens) token.level += 1;

  const open = new Token(`${type}_open`, tag, 1);
  const close = new Token(`${type}_close`, tag, -1);

  Object.assign(open, { ...(attributes.open || {}) });
  Object.assign(close, { ...(attributes.close || {}) });

  for (const name of Object.keys(attributes)) {
    if (
      !["tag", "open", "close"].includes(name) &&
      attributes[name] != null
    ) {
      open.attrSet(name, attributes[name]);
    }
  }

  return [open, ...tokens, close];
}

const defaultAnchorCallback = (index) => `${index + 1}`;

function slidePlugin(markdownIt, options = {}) {
  const anchorOption = options.anchor === undefined ? true : options.anchor;
  const anchorCallback = (() => {
    if (typeof anchorOption === "function") return anchorOption;
    if (anchorOption) return defaultAnchorCallback;
    return () => undefined;
  })();

  markdownIt.core.ruler.push("marpit_slide", (state) => {
    if (state.inlineMode) return;

    const slides = split(
      state.tokens,
      (token) => token.type === "hr" && token.level === 0,
      true,
    );

    const { length: slideTotal } = slides;

    state.tokens = slides.reduce((result, tokens, slideIndex) => {
      const separator =
        tokens[0] && tokens[0].type === "hr" ? tokens[0] : undefined;
      const mapToken = separator || tokens.find((token) => token.map);

      return [
        ...result,
        ...wrapTokens(
          state.Token,
          "marpit_slide",
          {
            ...(options.attributes || {}),
            tag: "section",
            id: anchorCallback(slideIndex),
            open: {
              block: true,
              meta: {
                marpitSlide: slideIndex,
                marpitSlideTotal: slideTotal,
                marpitSlideElement: 1,
              },
              map: mapToken ? mapToken.map : [0, 1],
            },
            close: {
              block: true,
              meta: {
                marpitSlide: slideIndex,
                marpitSlideTotal: slideTotal,
                marpitSlideElement: -1,
              },
            },
          },
          tokens.slice(separator ? 1 : 0),
        ),
      ];
    }, []);
  });
}

// Marpit plugins reject an ordinary markdown-it instance. Keep the same
// compatibility guard used by the bundled plugin helper.
function slide(markdownIt, ...args) {
  if (markdownIt.marpit) return slidePlugin.call(this, markdownIt, ...args);
  throw new Error(
    "Marpit plugin has detected incompatible markdown-it instance.",
  );
}

const exported = {};
Object.defineProperty(exported, "__esModule", { value: true });
Object.defineProperties(exported, {
  default: { enumerable: true, get: () => slide },
  defaultAnchorCallback: {
    enumerable: true,
    get: () => defaultAnchorCallback,
  },
  slide: { enumerable: true, get: () => slide },
});

module.exports = exported;
