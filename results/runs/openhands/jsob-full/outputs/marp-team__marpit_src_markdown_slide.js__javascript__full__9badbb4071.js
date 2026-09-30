function marpitPlugin(plugin) {
  return function (markdownIt, ...params) {
    if (markdownIt.marpit) return plugin.call(this, markdownIt, ...params);

    throw new Error('Marpit plugin has detected incompatible markdown-it instance.');
  };
}

function split(items, predicate, includeSeparator = false) {
  const groups = [[]];

  for (const item of items) {
    if (predicate(item)) {
      groups.push(includeSeparator ? [item] : []);
    } else {
      groups[groups.length - 1].push(item);
    }
  }

  return groups;
}

function wrapTokens(Token, type, options, children = []) {
  const { tag } = options;

  for (const child of children) child.level += 1;

  const openingToken = new Token(`${type}_open`, tag, 1);
  const closingToken = new Token(`${type}_close`, tag, -1);

  Object.assign(openingToken, { ...(options.open || {}) });
  Object.assign(closingToken, { ...(options.close || {}) });

  for (const attribute of Object.keys(options)) {
    if (!['open', 'close', 'tag'].includes(attribute) && options[attribute] != null) {
      openingToken.attrSet(attribute, options[attribute]);
    }
  }

  return [openingToken, ...children, closingToken];
}

const defaultAnchorCallback = (slideIndex) => `${slideIndex + 1}`;

const slide = marpitPlugin((markdownIt, options = {}) => {
  const anchor = options.anchor === undefined || options.anchor;
  const anchorCallback =
    typeof anchor === 'function'
      ? anchor
      : anchor
        ? defaultAnchorCallback
        : () => undefined;

  markdownIt.core.ruler.push('marpit_slide', (state) => {
    if (state.inlineMode) return;

    const slides = split(
      state.tokens,
      (token) => token.type === 'hr' && token.level === 0,
      true,
    );
    const slideTotal = slides.length;

    state.tokens = slides.reduce((tokens, slideTokens, slideIndex) => {
      const separator =
        slideTokens[0] && slideTokens[0].type === 'hr' ? slideTokens[0] : undefined;
      const mappedToken = separator || slideTokens.find((token) => token.map);

      return [
        ...tokens,
        ...wrapTokens(
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
                marpitSlideTotal: slideTotal,
                marpitSlideElement: 1,
              },
              map: mappedToken ? mappedToken.map : [0, 1],
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
          slideTokens.slice(separator ? 1 : 0),
        ),
      ];
    }, []);
  });
});

const exported = {};
Object.defineProperty(exported, '__esModule', { value: true });
Object.defineProperties(exported, {
  default: {
    get: () => slide,
    enumerable: true,
  },
  defaultAnchorCallback: {
    get: () => defaultAnchorCallback,
    enumerable: true,
  },
  slide: {
    get: () => slide,
    enumerable: true,
  },
});

module.exports = exported;
