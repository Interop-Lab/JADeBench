function split(items, predicate, includeSeparator = false) {
  const groups = [[]];

  for (const item of items) {
    if (predicate(item)) {
      groups.push(includeSeparator ? [item] : []);
    } else {
      groups[groups.length - 1].push(item);
    }
  }

  return groups;
}

function plugin(callback) {
  return function (markdown, ...args) {
    if (markdown.marpit) {
      return callback.call(this, markdown, ...args);
    }

    throw new Error(
      "Marpit plugin should be registered by the Marpit.use() method."
    );
  };
}

function headingDividerPlugin(markdown) {
  const { marpit } = markdown;

  markdown.core.ruler.after(
    "inline",
    "marpit_heading_divider",
    (state) => {
      let dividerSetting = marpit.options.headingDivider;

      if (
        marpit.lastGlobalDirectives &&
        Object.prototype.hasOwnProperty.call(
          marpit.lastGlobalDirectives,
          "headingDivider"
        )
      ) {
        dividerSetting = marpit.lastGlobalDirectives.headingDivider;
      }

      if (state.inlineMode || dividerSetting === false) return;

      if (
        Number.isInteger(dividerSetting) &&
        dividerSetting >= 1 &&
        dividerSetting <= 6
      ) {
        dividerSetting = [...Array(dividerSetting).keys()].map(
          (level) => level + 1
        );
      }

      if (!Array.isArray(dividerSetting)) return;

      const headingTags = dividerSetting.map((level) => `h${level}`);
      const isDividerHeading = (token) =>
        token.type === "heading_open" && headingTags.includes(token.tag);

      const tokens = [];

      for (const group of split(state.tokens, isDividerHeading, true)) {
        const [heading] = group;

        if (
          heading &&
          isDividerHeading(heading) &&
          tokens.some((token) => !token.hidden)
        ) {
          const divider = new state.Token("hr", "", 0);
          divider.hidden = true;
          divider.map = heading.map;
          tokens.push(divider);
        }

        tokens.push(...group);
      }

      state.tokens = tokens;
    }
  );
}

const headingDivider = plugin(headingDividerPlugin);

Object.defineProperty(module.exports, "__esModule", {
  value: true
});

Object.defineProperty(module.exports, "default", {
  enumerable: true,
  get: () => headingDivider
});

Object.defineProperty(module.exports, "headingDivider", {
  enumerable: true,
  get: () => headingDivider
});
