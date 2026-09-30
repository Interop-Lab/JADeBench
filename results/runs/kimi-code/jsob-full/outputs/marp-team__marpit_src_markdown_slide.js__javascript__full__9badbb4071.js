'use strict';

function split(tokens, predicate, includeSeparator = false) {
  const groups = [[]];

  for (const token of tokens) {
    if (predicate(token)) groups.push(includeSeparator ? [token] : []);
    else groups[groups.length - 1].push(token);
  }

  return groups;
}

function wrapTokens(Token, type, options, tokens = []) {
  const { tag } = options;

  for (const token of tokens) token.level += 1;

  const open = new Token(`${type}_open`, tag, 1);
  const close = new Token(`${type}_close`, tag, -1);
  Object.assign(open, { ...(options.open || {}) });
  Object.assign(close, { ...(options.close || {}) });

  for (const key of Object.keys(options)) {
    if (!['tag', 'open', 'close'].includes(key) && options[key] != null) {
      open.attrSet(key, options[key]);
    }
  }

  return [open, ...tokens, close];
}

const defaultAnchorCallback = (slideIndex) => String(slideIndex + 1);

function slidePlugin(markdown, options = {}) {
  const anchor = options.anchor === undefined ? true : options.anchor;
  const anchorCallback =
    typeof anchor === 'function'
      ? anchor
      : anchor
        ? defaultAnchorCallback
        : () => undefined;

  markdown.core.ruler.push('marpit_slide', (state) => {
    if (state.inlineMode) return;

    const slides = split(
      state.tokens,
      (token) => token.type === 'hr' && token.level === 0,
      true,
    );
    const slideTotal = slides.length;

    state.tokens = slides.reduce((result, slideTokens, slideIndex) => {
      const separator =
        slideTokens[0] && slideTokens[0].type === 'hr'
          ? slideTokens[0]
          : undefined;
      const mapSource = separator || slideTokens.find((token) => token.map);

      return [
        ...result,
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
              map: mapSource ? mapSource.map : [0, 1],
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
}

function marpitPlugin(plugin) {
  const wrapped = function wrappedMarpitPlugin(markdown, ...args) {
    if (markdown.marpit) return plugin.call(this, markdown, ...args);
    throw new Error(
      'Marpit plugin has detected incompatible markdown-it instance.',
    );
  };

  Object.defineProperty(wrapped, 'name', { value: plugin.name });
  Object.defineProperty(wrapped, 'length', { value: plugin.length });
  return wrapped;
}

const slide = marpitPlugin(slidePlugin);

module.exports = {
  default: slide,
  defaultAnchorCallback,
  slide,
};
