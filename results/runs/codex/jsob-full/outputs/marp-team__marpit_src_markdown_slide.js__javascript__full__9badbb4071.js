'use strict';

function split(tokens, predicate, keepMatched = false) {
  const groups = [[]];
  for (const token of tokens) {
    if (predicate(token)) {
      if (keepMatched) groups.push([token]);
      else groups.push([]);
    } else {
      groups[groups.length - 1].push(token);
    }
  }
  return groups;
}

function wrapTokens(tokens, tag, options, slideIndex) {
  const content = Array.isArray(tokens) ? tokens : [];
  const attributes = options && options.attributes ? options.attributes : {};
  return [
    {
      type: 'hr',
      tag,
      id: `slide-${slideIndex}`,
      open: {
        block: true,
        meta: {
          marpitSlide: slideIndex,
          marpitSlideTotal: options.total,
          marpitSlideElement: 1,
        },
        map: options.map || [0, 0],
      },
      close: {
        block: true,
        meta: {
          marpitSlide: slideIndex,
          marpitSlideTotal: options.total,
          marpitSlideElement: -1,
        },
      },
      ...attributes,
    },
    ...content,
  ];
}

function defaultAnchorCallback(index) {
  return `${index + 1}`;
}

function slide(tokens, options = {}) {
  const source = Array.isArray(tokens) ? tokens : [];
  const sections = split(source, token => token && token.type === 'hr');
  const total = sections.length;
  const result = [];

  sections.forEach((section, index) => {
    const first = section[0];
    const map = first && first.map;
    result.push(...wrapTokens(section, options.tag || 'section', {
      ...options,
      total,
      map,
    }, index));
  });

  return result;
}

const exported = {
  default: slide,
  defaultAnchorCallback,
  slide,
};

module.exports = exported;
