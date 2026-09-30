'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function plugin(pluginFunction) {
  function marpitPlugin(markdown, ...params) {
    if (markdown.marpit) return pluginFunction.call(this, markdown, ...params);
    throw new Error(
      'Marpit plugin has detected incompatible markdown-it instance.',
    );
  }

  Object.defineProperty(marpitPlugin, '__esModule', { value: true });
  Object.defineProperty(marpitPlugin, 'default', { value: marpitPlugin });
  Object.defineProperty(marpitPlugin, 'marpitPlugin', { value: marpitPlugin });
  return marpitPlugin;
}

function split(items, predicate, includeDivider = false) {
  const groups = [[]];

  for (const item of items) {
    if (predicate(item)) groups.push(includeDivider ? [item] : []);
    else groups[groups.length - 1].push(item);
  }

  return groups;
}

function _headingDivider(markdown) {
  const { marpit } = markdown;

  markdown.core.ruler.after('inline', 'marpit_heading_divider', (state) => {
    let levels = marpit.options.headingDivider;

    if (
      marpit.lastGlobalDirectives &&
      Object.prototype.hasOwnProperty.call(
        marpit.lastGlobalDirectives,
        'headingDivider',
      )
    ) {
      levels = marpit.lastGlobalDirectives.headingDivider;
    }

    if (state.inlineMode || levels === false) return;

    if (Number.isInteger(levels) && levels >= 1 && levels <= 6) {
      levels = [...Array(levels).keys()].map((level) => level + 1);
    }

    if (!Array.isArray(levels)) return;

    const tags = levels.map((level) => `h${level}`);
    const isTargetHeading = (token) =>
      token.type === 'heading_open' && tags.includes(token.tag);
    const tokens = [];

    for (const group of split(state.tokens, isTargetHeading, true)) {
      const [heading] = group;

      if (
        heading &&
        isTargetHeading(heading) &&
        tokens.some((token) => !token.hidden)
      ) {
        const divider = new state.Token('hr', '', 0);
        divider.hidden = true;
        divider.map = heading.map;
        tokens.push(divider);
      }

      tokens.push(...group);
    }

    state.tokens = tokens;
  });
}

const headingDivider = plugin(_headingDivider);

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: () => headingDivider,
});
Object.defineProperty(exports, 'headingDivider', {
  enumerable: true,
  get: () => headingDivider,
});
