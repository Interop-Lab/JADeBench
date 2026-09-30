'use strict';

function marpitPlugin(plugin) {
  return function marpitPluginWrapper(markdown, ...args) {
    if (markdown.marpit) return plugin.call(this, markdown, ...args);

    throw new Error(
      'Marpit plugin has detected incompatible markdown-it instance.',
    );
  };
}

function split(items, isSeparator, includeSeparators = false) {
  const groups = [[]];

  for (const item of items) {
    if (isSeparator(item)) {
      groups.push([]);
      if (includeSeparators) groups[groups.length - 1].push(item);
    } else {
      groups[groups.length - 1].push(item);
    }
  }

  return groups;
}

function wrapTokens(Token, type, options, tokens = []) {
  const tag = options.tag;
  const open = new Token(`${type}_open`, tag, 1);
  const close = new Token(`${type}_close`, tag, -1);

  Object.assign(open, options.open);
  Object.assign(close, options.close);

  for (const attribute of Object.keys(options)) {
    if (!['tag', 'open', 'close'].includes(attribute)) {
      open.attrSet(attribute, options[attribute]);
    }
  }

  for (const token of tokens) token.level += 1;

  return [open, ...tokens, close];
}

const defaultAnchorCallback = (index) => `${index + 1}`;

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
      const divider =
        slideTokens[0] && slideTokens[0].type === 'hr'
          ? slideTokens[0]
          : undefined;
      const mappedToken = divider || slideTokens.find((token) => token.map);
      const metadata = {
        marpitSlide: slideIndex,
        marpitSlideTotal: slideTotal,
      };

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
              meta: { ...metadata, marpitSlideElement: 1 },
              map: mappedToken ? mappedToken.map : [0, 1],
            },
            close: {
              block: true,
              meta: { ...metadata, marpitSlideElement: -1 },
            },
          },
          slideTokens.slice(divider ? 1 : 0),
        ),
      ];
    }, []);
  });
}

const slide = marpitPlugin(slidePlugin);

Object.defineProperty(exports, '__esModule', { value: true });
Object.defineProperties(exports, {
  default: { enumerable: true, get: () => slide },
  defaultAnchorCallback: {
    enumerable: true,
    get: () => defaultAnchorCallback,
  },
  slide: { enumerable: true, get: () => slide },
});
