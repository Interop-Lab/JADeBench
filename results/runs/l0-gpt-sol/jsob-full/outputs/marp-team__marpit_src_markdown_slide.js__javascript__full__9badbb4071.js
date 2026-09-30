var slide_exports = {};

Object.defineProperty(slide_exports, "__esModule", {
  value: true
});

function plugin(pluginFunction) {
  return function (markdownIt, ...parameters) {
    if (markdownIt.marpit) {
      return pluginFunction.call(this, markdownIt, ...parameters);
    }

    throw new Error(
      "Marpit plugin is required to be passed to Marpit.use()."
    );
  };
}

function split(tokens, predicate, includeSeparator = false) {
  const groups = [[]];

  for (const token of tokens) {
    if (predicate(token)) {
      groups.push(includeSeparator ? [token] : []);
    } else {
      groups[groups.length - 1].push(token);
    }
  }

  return groups;
}

function wrapTokens(Token, name, options, prepend = []) {
  const { tag } = options;

  for (const token of prepend) token.level += 1;

  const openToken = new Token(`${name}_open`, tag, 1);
  const closeToken = new Token(`${name}_close`, tag, -1);

  Object.assign(openToken, { ...(options.open || {}) });
  Object.assign(closeToken, { ...(options.close || {}) });

  for (const key of Object.keys(options)) {
    if (
      !["tag", "open", "close"].includes(key) &&
      options[key] != null
    ) {
      openToken.attrSet(key, options[key]);
    }
  }

  return [openToken, ...prepend, closeToken];
}

const defaultAnchorCallback = index => `${index + 1}`;

function slidePlugin(markdownIt, options = {}) {
  const anchor =
    options.anchor === undefined ? true : options.anchor;

  const anchorCallback = (() => {
    if (typeof anchor === "function") return anchor;
    if (anchor) return defaultAnchorCallback;
    return () => undefined;
  })();

  markdownIt.core.ruler.push("marpit_slide", state => {
    if (state.inlineMode) return;

    const slides = split(
      state.tokens,
      token => token.type === "hr" && token.level === 0,
      true
    );

    const { length: slideTotal } = slides;

    state.tokens = slides.reduce((result, tokens, slideIndex) => {
      const separator =
        tokens[0] && tokens[0].type === "hr"
          ? tokens[0]
          : undefined;

      const mappingToken =
        separator || tokens.find(token => token.map);

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
                marpitSlideElement: 1
              },
              map: mappingToken ? mappingToken.map : [0, 1]
            },
            close: {
              block: true,
              meta: {
                marpitSlide: slideIndex,
                marpitSlideTotal: slideTotal,
                marpitSlideElement: -1
              }
            }
          },
          tokens.slice(separator ? 1 : 0)
        )
      ];
    }, []);
  });
}

var slide = plugin(slidePlugin);
var slide_default = slide;

Object.defineProperty(slide_exports, "default", {
  enumerable: true,
  get: () => slide_default
});

Object.defineProperty(slide_exports, "defaultAnchorCallback", {
  enumerable: true,
  get: () => defaultAnchorCallback
});

Object.defineProperty(slide_exports, "slide", {
  enumerable: true,
  get: () => slide
});

module.exports = slide_exports;
