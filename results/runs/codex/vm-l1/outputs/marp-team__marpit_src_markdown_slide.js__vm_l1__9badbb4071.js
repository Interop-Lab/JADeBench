function defaultAnchorCallback(anchor) {
  return anchor + 1;
}

function slide(markdownIt) {
  if (!markdownIt.marpit) {
    throw new Error('Marpit plugin has detected incompatible markdown-it instance.');
  }

  markdownIt.core.ruler.push('marpit_slide', function marpitSlide(state) {
    for (const token of state.tokens) {
      token.level += 1;
    }
  });
}

const plugin = slide;

globalThis.defaultAnchorCallback = defaultAnchorCallback;
globalThis.slide = slide;
globalThis.slide_default = plugin;

module.exports = {
  default: plugin,
  defaultAnchorCallback,
  slide,
};
