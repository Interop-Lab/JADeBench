'use strict';

function split(items, predicate, keepDelimiter = false) {
  const groups = [[]];

  for (const item of items) {
    if (predicate(item)) groups.push(keepDelimiter ? [item] : []);
    else groups[groups.length - 1].push(item);
  }

  return groups;
}

function plugin(pluginFunction) {
  function marpitPlugin(md, ...args) {
    if (md.marpit) return pluginFunction.call(this, md, ...args);
    throw new Error('Marpit plugin has detected incompatible markdown-it instance.');
  }

  Object.defineProperty(marpitPlugin, '__esModule', { enumerable: true });
  Object.defineProperty(marpitPlugin, 'default', { value: marpitPlugin });
  Object.defineProperty(marpitPlugin, 'marpitPlugin', { value: marpitPlugin });
  return marpitPlugin;
}

function headingDividerPlugin(md) {
  const { marpit } = md;

  md.core.ruler.before('marpit_slide', 'marpit_heading_divider', state => {
    let headingDivider = marpit.options.headingDivider;

    if (
      marpit.lastGlobalDirectives
      && Object.prototype.hasOwnProperty.call(marpit.lastGlobalDirectives, 'headingDivider')
    ) {
      headingDivider = marpit.lastGlobalDirectives.headingDivider;
    }

    if (state.inlineMode || headingDivider === false) return;

    if (Number.isInteger(headingDivider) && headingDivider >= 1 && headingDivider <= 6) {
      headingDivider = [...Array(headingDivider).keys()].map(level => level + 1);
    }

    if (!Array.isArray(headingDivider)) return;

    const headingTags = headingDivider.map(level => `h${level}`);
    const isDividerHeading = token => token.type === 'heading_open' && headingTags.includes(token.tag);
    const tokens = [];

    for (const group of split(state.tokens, isDividerHeading, true)) {
      const [heading] = group;

      if (heading && isDividerHeading(heading) && tokens.some(token => !token.hidden)) {
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

const headingDivider = plugin(headingDividerPlugin);

module.exports = {
  default: headingDivider,
  headingDivider,
};
