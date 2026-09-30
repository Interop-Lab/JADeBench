'use strict';

const headingDivider = markdownIt => {
  if (!markdownIt.marpit) {
    throw new Error('Marpit plugin has detected incompatible markdown-it instance.');
  }

  markdownIt.core.ruler.before('marpit_slide', 'marpit_heading_divider', state => {
    const headingDivider = markdownIt.marpit.options.headingDivider;
    const levels = Array.isArray(headingDivider) ? headingDivider : [headingDivider];

    const originalTokens = state.tokens.slice();
    for (let index = 1; index < originalTokens.length; index++) {
      const token = originalTokens[index];
      const level = Number.parseInt(token.tag?.slice(1), 10);
      if (token.type === 'heading_open' && levels.includes(level)) {
        const divider = new state.Token('hr', '', 0);
        divider.hidden = true;
        divider.map = token.map;
        state.tokens.splice(state.tokens.indexOf(token), 0, divider);
      }
    }
  });
};

Object.defineProperty(exports, '__esModule', { value: true });
exports.headingDivider = headingDivider;
exports.default = headingDivider;
