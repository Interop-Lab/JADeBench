'use strict';

const plugin = require('../work/marp-team__marpit/src/plugin.js');

function split(items, separator) {
  return items.reduce(
    (groups, item, index) => {
      if (separator(item, index, items)) groups.push([]);
      else groups[groups.length - 1].push(item);
      return groups;
    },
    [[]],
  );
}

function wrapTokens(Token, tokens, options) {
  const open = new Token(`${options.type}_open`, options.tag, 1);
  const close = new Token(`${options.type}_close`, options.tag, -1);

  Object.assign(open, options.open);
  Object.assign(close, options.close);

  return [open, ...tokens, close];
}

function defaultAnchorCallback(slideIndex) {
  return String(slideIndex + 1);
}

function slidePlugin(md, { anchor = true } = {}) {
  const anchorCallback =
    typeof anchor === 'function' ? anchor : defaultAnchorCallback;

  md.core.ruler.push('marpit_slide', state => {
    if (state.inlineMode) return;

    const slides = split(
      state.tokens,
      token => token.type === 'hr' && token.level === 0,
    );
    const separators = state.tokens.filter(
      token => token.type === 'hr' && token.level === 0,
    );
    const slideTotal = slides.length;

    state.tokens = slides.flatMap((tokens, slideIndex) => {
      const openMeta = {
        marpitSlide: slideIndex,
        marpitSlideTotal: slideTotal,
        marpitSlideElement: 1,
      };
      const closeMeta = {
        marpitSlide: slideIndex,
        marpitSlideTotal: slideTotal,
        marpitSlideElement: -1,
      };
      const wrapped = wrapTokens(state.Token, tokens, {
        type: 'marpit_slide',
        tag: 'section',
        open: {
          block: true,
          meta: openMeta,
          map:
            slideIndex === 0
              ? (tokens[0]?.map ?? [0, 1])
              : separators[slideIndex - 1].map,
        },
        close: { block: true, meta: closeMeta },
      });

      if (anchor) {
        const id = anchorCallback(slideIndex);
        if (id !== undefined && id !== null) wrapped[0].attrSet('id', id);
      }
      for (const token of tokens) token.level += 1;
      return wrapped;
    });
  });
}

const slide = plugin(slidePlugin);

module.exports = {
  default: slide,
  defaultAnchorCallback,
  slide,
};
