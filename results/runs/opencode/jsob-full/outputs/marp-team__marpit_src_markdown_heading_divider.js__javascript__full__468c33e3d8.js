'use strict';

/**
 * Divide a token list immediately before each matching token.
 *
 * When `includeDelimiter` is true, the delimiter starts the following group.
 */
function split(tokens, isDelimiter, includeDelimiter = false) {
  const groups = [[]];

  for (const token of tokens) {
    if (isDelimiter(token)) {
      groups.push(includeDelimiter ? [token] : []);
    } else {
      groups[groups.length - 1].push(token);
    }
  }

  return groups;
}

function headingDividerPlugin(md) {
  const { marpit } = md;

  md.core.ruler.before(
    'marpit_slide',
    'marpit_heading_divider',
    (state) => {
      let headingDivider = marpit.options.headingDivider;

      // A global directive takes precedence over the configured option.
      if (
        marpit.lastGlobalDirectives &&
        Object.prototype.hasOwnProperty.call(
          marpit.lastGlobalDirectives,
          'headingDivider',
        )
      ) {
        headingDivider = marpit.lastGlobalDirectives.headingDivider;
      }

      if (state.inlineMode || headingDivider === false) return;

      // A single level means every heading from h1 through that level.
      if (
        Number.isInteger(headingDivider) &&
        headingDivider >= 1 &&
        headingDivider <= 6
      ) {
        headingDivider = [...Array(headingDivider).keys()].map(
          (level) => level + 1,
        );
      }

      if (!Array.isArray(headingDivider)) return;

      const dividerTags = headingDivider.map((level) => `h${level}`);
      const isDividerHeading = (token) =>
        token.type === 'heading_open' && dividerTags.includes(token.tag);

      const output = [];
      for (const tokenGroup of split(state.tokens, isDividerHeading, true)) {
        const [heading] = tokenGroup;

        // Do not create a divider before the first visible content.
        if (
          heading &&
          isDividerHeading(heading) &&
          output.some((token) => !token.hidden)
        ) {
          const divider = new state.Token('hr', '', 0);
          divider.hidden = true;
          divider.map = heading.map;
          output.push(divider);
        }

        output.push(...tokenGroup);
      }

      state.tokens = output;
    },
  );
}

const headingDivider = function (md, ...args) {
  if (md.marpit) return headingDividerPlugin.call(this, md, ...args);
  throw new Error('Marpit plugin has detected incompatible markdown-it instance.');
};

Object.defineProperty(headingDivider, 'name', { value: '' });

const exportsObject = {
  get default() {
    return headingDivider;
  },
  get headingDivider() {
    return headingDivider;
  },
};

Object.defineProperty(exportsObject, '__esModule', { value: true });
module.exports = exportsObject;
