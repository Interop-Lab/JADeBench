'use strict';

const hasOwn = Object.prototype.hasOwnProperty;

const marpitPlugin = plugin => function (...args) {
  const markdownIt = args[0];
  if (!markdownIt.marpit) {
    throw new Error('Marpit plugin has detected incompatible markdown-it instance.');
  }
  return plugin.call(this, ...args);
};

function split(items, predicate) {
  const groups = [[]];

  for (const item of items) {
    if (predicate(item)) groups.push([]);
    else groups[groups.length - 1].push(item);
  }

  return groups;
}

function _headingDivider(markdownIt) {
  const { marpit } = markdownIt;

  markdownIt.core.ruler.before(
    'marpit_slide',
    'marpit_heading_divider',
    state => {
      let divider = marpit.options.headingDivider;
      if (hasOwn.call(marpit.lastGlobalDirectives, 'headingDivider')) {
        divider = marpit.lastGlobalDirectives.headingDivider;
      }

      if (state.inlineMode || divider === false) return;

      const levels = Number.isInteger(divider)
        ? [...Array(divider).keys()].map(index => index + 1)
        : Array.isArray(divider)
          ? divider
          : [];

      if (levels.length === 0) return;

      const tokens = [];
      for (const token of state.tokens) {
        const headingLevel =
          token.type === 'heading_open' ? Number(token.tag.slice(1)) : undefined;

        if (tokens.length > 0 && levels.includes(headingLevel)) {
          const dividerToken = new state.Token('hr', '', 0);
          dividerToken.hidden = true;
          tokens.push(dividerToken);
        }
        tokens.push(token);
      }
      state.tokens = tokens;
    },
  );
}

const headingDivider = marpitPlugin(_headingDivider);

Object.defineProperty(exports, '__esModule', { value: true });
Object.defineProperties(exports, {
  default: { enumerable: true, get: () => headingDivider },
  headingDivider: { enumerable: true, get: () => headingDivider },
});
