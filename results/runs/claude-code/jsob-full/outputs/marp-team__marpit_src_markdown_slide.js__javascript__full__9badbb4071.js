'use strict';

function marpitPlugin(plugin) {
  return function checkedMarpitPlugin(markdownIt, ...args) {
    if (markdownIt.marpit) return plugin.call(this, markdownIt, ...args);

    throw new Error(
      'Marpit plugin has detected incompatible markdown-it instance.',
    );
  };
}

function splitTokens(tokens, isSeparator, includeSeparator = false) {
  const groups = [[]];

  for (const token of tokens) {
    if (isSeparator(token)) {
      groups.push(includeSeparator ? [token] : []);
    } else {
      groups[groups.length - 1].push(token);
    }
  }

  return groups;
}

function wrapTokens(Token, type, options, tokens = []) {
  const { tag } = options;

  for (const token of tokens) token.level += 1;

  const openToken = new Token(`${type}_open`, tag, 1);
  const closeToken = new Token(`${type}_close`, tag, -1);

  Object.assign(openToken, options.open || {});
  Object.assign(closeToken, options.close || {});

  for (const key of Object.keys(options)) {
    if (!['open', 'close', 'tag'].includes(key) && options[key] != null) {
      openToken.attrSet(key, options[key]);
    }
  }

  return [openToken, ...tokens, closeToken];
}

const defaultAnchorCallback = slideIndex => `${slideIndex + 1}`;

function slidePlugin(markdownIt, options = {}) {
  const anchorOption = options.anchor === undefined ? true : options.anchor;
  let anchorCallback;

  if (typeof anchorOption === 'function') {
    anchorCallback = anchorOption;
  } else if (anchorOption) {
    anchorCallback = defaultAnchorCallback;
  } else {
    anchorCallback = () => undefined;
  }

  markdownIt.core.ruler.push('marpit_slide', state => {
    if (state.inlineMode) return;

    const slides = splitTokens(
      state.tokens,
      token => token.type === 'hr' && token.level === 0,
      true,
    );
    const slideCount = slides.length;

    state.tokens = slides.reduce((result, slideTokens, slideIndex) => {
      const separator =
        slideTokens[0] && slideTokens[0].type === 'hr'
          ? slideTokens[0]
          : undefined;
      const mappedToken = separator || slideTokens.find(token => token.map);

      const wrapped = wrapTokens(
        state.Token,
        'marpit_slide',
        {
          ...(options.attributes || {}),
          tag: 'section',
          id: anchorCallback(slideIndex),
          open: {
            block: true,
            meta: {
              marpitSlide: slideIndex,
              marpitSlideTotal: slideCount,
              marpitSlideElement: 1,
            },
            map: mappedToken ? mappedToken.map : [0, 1],
          },
          close: {
            block: true,
            meta: {
              marpitSlide: slideIndex,
              marpitSlideTotal: slideCount,
              marpitSlideElement: -1,
            },
          },
        },
        slideTokens.slice(separator ? 1 : 0),
      );

      return [...result, ...wrapped];
    }, []);
  });
}

const slide = marpitPlugin(slidePlugin);

module.exports = {
  defaultAnchorCallback,
  slide,
};
