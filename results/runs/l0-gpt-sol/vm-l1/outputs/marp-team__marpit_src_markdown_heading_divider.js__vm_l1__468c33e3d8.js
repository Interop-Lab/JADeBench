"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

function createDividerToken(headingToken) {
  const Token = headingToken && headingToken.constructor;
  const divider =
    typeof Token === "function"
      ? new Token("hr", "hr", 0)
      : {
          type: "hr",
          tag: "hr",
          attrs: null,
          map: null,
          nesting: 0,
          level: 0,
          children: null,
          content: "",
          markup: "---",
          info: "",
          meta: null,
          block: true,
          hidden: false,
        };

  divider.type = "hr";
  divider.tag = "hr";
  divider.nesting = 0;
  divider.level = headingToken && typeof headingToken.level === "number"
    ? headingToken.level
    : 0;
  divider.markup = "---";
  divider.block = true;
  divider.hidden = false;

  if (headingToken && headingToken.map) {
    divider.map = [headingToken.map[0], headingToken.map[0]];
  }

  return divider;
}

function split(tokens, headingLevels) {
  const levels =
    headingLevels === true
      ? [1, 2, 3, 4, 5, 6]
      : Array.isArray(headingLevels)
        ? headingLevels
        : typeof headingLevels === "number"
          ? [headingLevels]
          : [];

  if (levels.length === 0) return tokens;

  let hasSlideContent = false;

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];

    if (token.type === "hr" && token.level === 0) {
      hasSlideContent = false;
      continue;
    }

    if (token.type === "heading_open" && token.level === 0) {
      const level = Number(token.tag.slice(1));

      if (levels.includes(level)) {
        if (hasSlideContent) {
          tokens.splice(index, 0, createDividerToken(token));
          index++;
        }

        hasSlideContent = true;
        continue;
      }
    }

    if (
      token.level === 0 &&
      !token.hidden &&
      token.type !== "marpit_comment" &&
      !(token.type === "html_block" && /^\s*<!--[\s\S]*-->\s*$/.test(token.content))
    ) {
      hasSlideContent = true;
    }
  }

  return tokens;
}

function _headingDivider(md) {
  const rule = state => {
    const marpit = md.marpit;
    const option = marpit && marpit.options
      ? marpit.options.headingDivider
      : undefined;

    if (option) split(state.tokens, option);
  };

  try {
    md.core.ruler.before(
      "marpit_slide",
      "marpit_heading_divider",
      rule
    );
  } catch (_) {
    md.core.ruler.after(
      "block",
      "marpit_heading_divider",
      rule
    );
  }
}

const headingDivider = _headingDivider;

Object.defineProperty(exports, "default", {
  enumerable: true,
  get: function () {
    return headingDivider;
  },
});

Object.defineProperty(exports, "headingDivider", {
  enumerable: true,
  get: function () {
    return headingDivider;
  },
});
