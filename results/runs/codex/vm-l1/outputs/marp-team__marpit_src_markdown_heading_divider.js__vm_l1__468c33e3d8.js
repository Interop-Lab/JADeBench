function asMarpitPlugin(plugin) {
  return function marpitPlugin(markdownIt) {
    if (!markdownIt.marpit) {
      throw new Error('Marpit plugin has detected incompatible markdown-it instance.');
    }

    return plugin(markdownIt);
  };
}

function split(values, predicate) {
  const groups = [[]];

  for (const value of values) {
    const current = groups[groups.length - 1];

    if (current.length > 0 && predicate(value)) {
      groups.push([value]);
    } else {
      current.push(value);
    }
  }

  return groups;
}

function registerHeadingDivider(markdownIt) {
  markdownIt.core.ruler.before(
    'marpit_slide',
    'marpit_heading_divider',
    state => {
      const option = markdownIt.marpit.options.headingDivider;
      let levels;

      if (Number.isInteger(option) && option > 0) {
        levels = Array.from({ length: option }, (_, index) => index + 1);
      } else if (Array.isArray(option)) {
        levels = option;
      } else {
        return;
      }

      const headingTags = levels.map(level => `h${level}`);
      const groups = split(
        state.tokens,
        token => token.type === 'heading_open' && headingTags.includes(token.tag),
      );

      state.tokens = groups.flatMap((group, index) => {
        if (index === 0) return group;

        const divider = new state.Token('hr', '', 0);
        divider.hidden = true;
        return [divider, ...group];
      });
    },
  );
}

const headingDivider = asMarpitPlugin(registerHeadingDivider);

Object.defineProperty(exports, '__esModule', { value: true });
Object.defineProperties(exports, {
  default: { enumerable: true, get: () => headingDivider },
  headingDivider: { enumerable: true, get: () => headingDivider },
});
