'use strict';

function defaultAnchorCallback(slug) {
  return slug;
}

function split(tokens) {
  const slides = [];
  let current = [];

  for (const token of tokens || []) {
    if (token && token.type === 'hr' && token.markup === '---') {
      slides.push(current);
      current = [];
    } else {
      current.push(token);
    }
  }

  if (current.length > 0 || slides.length === 0) {
    slides.push(current);
  }

  return slides;
}

function wrapTokens(tokens, options, env) {
  const slides = split(tokens);
  const result = [];

  for (let index = 0; index < slides.length; index += 1) {
    const open = {
      type: 'slide_open',
      tag: 'section',
      nesting: 1,
      level: 0,
      attrs: null,
      map: null,
      markup: '',
      info: '',
      meta: { index },
      block: true,
      hidden: false,
      children: null,
      content: ''
    };

    const close = {
      type: 'slide_close',
      tag: 'section',
      nesting: -1,
      level: 0,
      attrs: null,
      map: null,
      markup: '',
      info: '',
      meta: { index },
      block: true,
      hidden: false,
      children: null,
      content: ''
    };

    result.push(open, ...slides[index], close);
  }

  if (env && typeof env === 'object') {
    env.slides = slides.length;
  }

  return result;
}

function slide(tokens, options, env) {
  if (Array.isArray(tokens)) {
    return wrapTokens(tokens, options, env);
  }

  if (tokens && typeof tokens === 'object' && Array.isArray(tokens.children)) {
    return {
      ...tokens,
      children: wrapTokens(tokens.children, options, env)
    };
  }

  return tokens;
}

module.exports = {
  default: slide,
  defaultAnchorCallback,
  slide
};
