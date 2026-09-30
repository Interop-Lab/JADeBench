'use strict';

const { plugin } = require('@marp-team/marpit');

/*
 * Split a token stream into groups separated by matching tokens.
 * When includeDivider is true, each divider is retained as its own group.
 */
function split(tokens, predicate, includeDivider = false) {
  const groups = [[]];

  for (const token of tokens) {
    if (predicate(token)) {
      groups.push(includeDivider ? [token] : []);
    } else {
      groups[groups.length - 1].push(token);
    }
  }

  return groups;
}

function headingDividerPlugin(md) {
  const { marpit } = md;

  md.core.ruler.after('inline', 'marpit_heading_divider', state => {
    const headingDivider = marpit.options.headingDivider;

    if (headingDivider === false) return;

    let levels = headingDivider;
    if (Number.isInteger(levels) && levels >= 1 && levels <= 6) {
      levels = Array.from({ length: levels }, (_, index) => index + 1);
    }
    if (!Array.isArray(levels)) return;

    const headingTypes = levels.map(level => `h${level}`);
    const isDivider = token =>
      token.type === 'heading_open' && headingTypes.includes(token.tag);

    const rebuilt = [];
    for (const section of split(state.tokens, isDivider, true)) {
      const [first] = section;
      if (first && isDivider(first) && rebuilt.some(token => !token.hidden)) {
        const divider = new state.Token('hr', '', 0);
        divider.hidden = true;
        divider.map = first.map;
        rebuilt.push(divider);
      }
      rebuilt.push(...section);
    }

    state.tokens = rebuilt;
  });
}

const headingDivider = plugin(headingDividerPlugin);

module.exports = { headingDivider };
