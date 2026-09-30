'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function split(array, predicate) {
  const groups = [[]];

  array.forEach((value, index) => {
    if (index > 0 && predicate(value, index, array)) groups.push([]);
    groups[groups.length - 1].push(value);
  });

  return groups;
}

function _headingDivider(md) {
  md.core.ruler.before('marpit_slide', 'marpit_heading_divider', state => {
    const { headingDivider } = md.marpit.options;
    if (!headingDivider) return;

    state.tokens = split(
      state.tokens,
      token => {
        if (token.type !== 'heading_open') return false;

        const level = Number.parseInt(token.tag.slice(1), 10);
        return Array.isArray(headingDivider)
          ? headingDivider.includes(level)
          : typeof headingDivider === 'number' && level <= headingDivider;
      },
    ).flatMap((tokens, index) => {
      if (index === 0 || tokens.length === 0) return tokens;

      const divider = new state.Token('hr', '', 0);
      divider.map = tokens[0].map;
      divider.hidden = true;
      return [divider, ...tokens];
    });
  });
}

function headingDivider(md) {
  if (!md.marpit) {
    throw new Error('Marpit plugin has detected incompatible markdown-it instance.');
  }
  return _headingDivider(md);
}

exports.default = headingDivider;
exports.headingDivider = headingDivider;
