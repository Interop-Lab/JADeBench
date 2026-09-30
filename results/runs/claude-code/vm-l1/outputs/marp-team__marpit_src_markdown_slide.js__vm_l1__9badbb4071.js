"use strict";

const defineProperty = Object.defineProperty;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

const exportProperties = (target, properties) => {
  for (const name in properties) {
    defineProperty(target, name, {
      get: properties[name],
      enumerable: true,
    });
  }
};

const copyProperties = (target, source, except, descriptor) => {
  if (source && (typeof source === "object" || typeof source === "function")) {
    for (const name of getOwnPropertyNames(source)) {
      if (name !== except && !hasOwnProperty.call(target, name)) {
        defineProperty(target, name, {
          get: () => source[name],
          enumerable: !(descriptor = getOwnPropertyDescriptor(source, name)) || descriptor.enumerable,
        });
      }
    }
  }
  return target;
};

const toCommonJS = (module) =>
  copyProperties(defineProperty({}, "__esModule", { value: true }), module);

const slideExports = {};
exportProperties(slideExports, {
  default: () => slideDefault,
  defaultAnchorCallback: () => defaultAnchorCallback,
  slide: () => slide,
});
module.exports = toCommonJS(slideExports);

function marpitPlugin(plugin) {
  return function markdownItPlugin(markdownIt, ...arguments_) {
    if (!markdownIt.marpit) {
      throw new Error("Marpit plugin has detected incompatible markdown-it instance.");
    }

    return plugin.call(this, markdownIt.marpit, ...arguments_);
  };
}

function split(tokens, predicate, keepSeparator = false) {
  const groups = [[]];

  for (const token of tokens) {
    if (predicate(token)) {
      groups.push(keepSeparator ? [token] : []);
    } else {
      groups[groups.length - 1].push(token);
    }
  }

  return groups;
}

function wrapTokens(Token, type, options, content = []) {
  const { tag } = options;

  for (const token of content) token.level += 1;

  const opening = new Token(`${type}_open`, tag, 1);
  const closing = new Token(`${type}_close`, tag, -1);

  Object.assign(opening, options.open || {});
  Object.assign(closing, options.close || {});

  for (const key of Object.keys(options)) {
    if (!["open", "close", "tag"].includes(key) && options[key] != null) {
      opening.attrSet(key, options[key]);
    }
  }

  return [opening, ...content, closing];
}

const defaultAnchorCallback = (index) => `${index + 1}`;

function slidePlugin(marpit, options = {}) {
  const anchorOption = options.anchor === undefined ? true : options.anchor;
  const anchor =
    typeof anchorOption === "function"
      ? anchorOption
      : anchorOption
        ? defaultAnchorCallback
        : () => undefined;

  marpit.core.ruler.push("marpit_slide", (state) => {
    if (state.inlineMode) return;

    const slides = split(
      state.tokens,
      (token) => token.type === "hr" && token.level === 0,
      true,
    );

    state.marpitSlideTotal = slides.length;
    state.tokens = slides.reduce((result, tokens, index) => {
      const divider =
        tokens[0] && tokens[0].type === "hr"
          ? tokens[0]
          : tokens.find((token) => token.type === "hr" && token.level === 0);
      const mapToken = divider || tokens.find((token) => token.map);

      return [
        ...result,
        ...wrapTokens(
          state.Token,
          "marpit_slide",
          {
            ...(options.attributes || {}),
            tag: "section",
            id: anchor(index),
            open: {
              block: true,
              meta: {
                marpitSlide: index,
                marpitSlideTotal: state.marpitSlideTotal,
                marpitSlideElement: 1,
              },
              map: mapToken ? mapToken.map : [0, 1],
            },
            close: {
              block: true,
              meta: {
                marpitSlide: index,
                marpitSlideTotal: state.marpitSlideTotal,
                marpitSlideElement: -1,
              },
            },
          },
          tokens.slice(divider ? 1 : 0),
        ),
      ];
    }, []);
  });
}

const slide = marpitPlugin(slidePlugin);
const slideDefault = slide;
