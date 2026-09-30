'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function split(values, predicate, keepSeparator = false) {
  const groups = [[]];

  for (const value of values) {
    if (predicate(value)) groups.push(keepSeparator ? [value] : []);
    else groups[groups.length - 1].push(value);
  }

  return groups;
}

function marpitPlugin(plugin) {
  function wrappedPlugin(markdown, ...args) {
    if (markdown.marpit) return plugin.call(this, markdown, ...args);
    throw new Error(
      'Marpit plugin has detected incompatible markdown-it instance.',
    );
  }

  Object.defineProperty(wrappedPlugin, '__esModule', { value: true });
  Object.defineProperty(wrappedPlugin, 'default', { value: wrappedPlugin });
  Object.defineProperty(wrappedPlugin, 'marpitPlugin', { value: wrappedPlugin });
  return wrappedPlugin;
}

function applyHeadingDivider(markdown) {
  const { marpit } = markdown;

  markdown.core.ruler.after('inline', 'marpit_heading_divider', state => {
    let dividerLevels = marpit.options.headingDivider;

    if (
      marpit.customDirectives.global &&
      Object.prototype.hasOwnProperty.call(
        marpit.lastGlobalDirectives,
        'headingDivider',
      )
    ) {
      dividerLevels = marpit.lastGlobalDirectives.headingDivider;
    }

    if (state.inlineMode || dividerLevels === false) return;

    if (
      Number.isInteger(dividerLevels) &&
      dividerLevels >= 1 &&
      dividerLevels <= 6
    ) {
      dividerLevels = Array.from({ length: dividerLevels }).map(
        (_, index) => index + 1,
      );
    }

    if (!Array.isArray(dividerLevels)) return;

    const headingTypes = dividerLevels.map(level => `h${level}`);
    const isDividerHeading = token =>
      token.type === 'heading_open' && headingTypes.includes(token.tag);
    const tokens = [];

    for (const group of split(state.tokens, isDividerHeading, true)) {
      const [firstToken] = group;

      if (
        firstToken &&
        isDividerHeading(firstToken) &&
        tokens.every(token => !token.hidden)
      ) {
        const divider = new state.Token('hr', '', 0);
        divider.hidden = true;
        divider.map = firstToken.map;
        tokens.push(divider);
      }

      tokens.push(...group);
    }

    state.tokens = tokens;
  });
}

const headingDivider = marpitPlugin(applyHeadingDivider);

exports.default = headingDivider;
exports.headingDivider = headingDivider;
