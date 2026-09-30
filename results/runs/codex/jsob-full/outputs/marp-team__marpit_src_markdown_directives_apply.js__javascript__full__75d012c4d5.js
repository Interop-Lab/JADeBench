"use strict";

const postcss = require("postcss");
const lodashKebabCase = require("lodash.kebabcase");
const kebabCase =
  lodashKebabCase && lodashKebabCase.__esModule
    ? lodashKebabCase.default
    : lodashKebabCase;

function marpitPlugin(plugin) {
  const wrappedPlugin = function (markdown, ...arguments_) {
    if (markdown.marpit) return plugin.call(this, markdown, ...arguments_);
    throw new Error(
      "Marpit plugin has detected incompatible markdown-it instance.",
    );
  };

  Object.defineProperty(wrappedPlugin, "__esModule", { value: true });
  Object.defineProperty(wrappedPlugin, "default", { value: wrappedPlugin });
  Object.defineProperty(wrappedPlugin, "marpitPlugin", { value: wrappedPlugin });
  return wrappedPlugin;
}

class InlineStyle {
  constructor(style) {
    this.decls = {};

    if (!style) return;

    if (style instanceof InlineStyle || typeof style === "string") {
      const parsed = postcss.parse(style.toString(), { from: undefined });
      parsed.each((node) => {
        if (node.type === "decl") this.decls[node.prop] = node.value;
      });
    } else {
      this.decls = { ...style };
    }
  }

  delete(property) {
    delete this.decls[property];
    return this;
  }

  set(property, value) {
    this.decls[property] = value;
    return this;
  }

  toString() {
    let result = "";

    for (const property of Object.keys(this.decls)) {
      let parsed;
      try {
        parsed = postcss.parse(`${property}:${this.decls[property]}`, {
          from: undefined,
        });
      } catch {}

      if (parsed) {
        parsed.each((node) => {
          if (node.type !== "decl" || node.prop !== property) node.remove();
        });
        result += `${parsed.toString()};`;
      }
    }

    return result;
  }
}

const globals = Object.assign(Object.create(null), {
  headingDivider(value) {
    const levels = [1, 2, 3, 4, 5, 6];
    const normalize = (level) =>
      Array.isArray(level) || Number.isNaN(level)
        ? level
        : Number.parseInt(level, 10);
    const normalized = normalize(value);

    if (Array.isArray(normalized)) {
      const selected = normalized.map(normalize);
      return { headingDivider: levels.filter((level) => selected.includes(level)) };
    }
    if (value === "false") return { headingDivider: false };
    if (levels.includes(normalized)) return { headingDivider: normalized };
    return {};
  },
  style: (value) => ({ style: value }),
  theme: (value, marpit) => (marpit.themeSet.has(value) ? { theme: value } : {}),
  lang: (value) => ({ lang: value }),
});

const locals = Object.assign(Object.create(null), {
  backgroundColor: (value) => ({ backgroundColor: value }),
  backgroundImage: (value) => ({ backgroundImage: value }),
  backgroundPosition: (value) => ({ backgroundPosition: value }),
  backgroundRepeat: (value) => ({ backgroundRepeat: value }),
  backgroundSize: (value) => ({ backgroundSize: value }),
  class: (value) => ({
    class: Array.isArray(value) ? value.join(" ") : value,
  }),
  color: (value) => ({ color: value }),
  footer: (value) => (typeof value === "string" ? { footer: value } : {}),
  header: (value) => (typeof value === "string" ? { header: value } : {}),
  paginate(value) {
    const normalized = (value || "").toLowerCase();
    if (["hold", "skip"].includes(normalized)) return { paginate: normalized };
    return { paginate: normalized === "true" };
  },
});

const defaultDirectives = [...Object.keys(globals), ...Object.keys(locals)];

function applyDirectives(markdown, options = {}) {
  const { marpit } = markdown;
  const { lang } = marpit.options;
  const dataset = options.dataset === undefined ? true : !!options.dataset;
  const css = options.css === undefined ? true : !!options.css;
  const { global, local } = marpit.customDirectives;
  const directives = [
    ...Object.keys(global),
    ...Object.keys(local),
    ...defaultDirectives,
  ];

  markdown.core.ruler.after(
    "marpit_directives_parse",
    "marpit_directives_apply",
    (state) => {
      if (state.inlineMode) return;

      let page = 0;
      const paginatedTokens = [];

      for (const token of state.tokens) {
        const { marpitDirectives } = token.meta || {};

        if (token.type === "marpit_slide_open") {
          if (
            !(
              marpitDirectives?.paginate === "skip" ||
              marpitDirectives?.paginate === "hold"
            )
          ) {
            page += 1;
          }
        }

        if (!marpitDirectives) continue;

        const style = new InlineStyle(token.attrGet("style"));

        for (const directive of Object.keys(marpitDirectives)) {
          if (!directives.includes(directive)) continue;

          const value = marpitDirectives[directive];
          if (value) {
            const property = kebabCase(directive);
            if (dataset) token.attrSet(`data-${property}`, value);
            if (css) style.set(`--${property}`, value);
          }
        }

        if (marpitDirectives.lang || lang) {
          token.attrSet("lang", marpitDirectives.lang || lang);
        }
        if (marpitDirectives.class) {
          token.attrJoin("class", marpitDirectives.class);
        }
        if (marpitDirectives.color) {
          style.set("color", marpitDirectives.color);
        }
        if (marpitDirectives.backgroundColor) {
          style
            .set("background-color", marpitDirectives.backgroundColor)
            .set("background-image", "none");
        }
        if (marpitDirectives.backgroundImage) {
          style
            .set("background-image", marpitDirectives.backgroundImage)
            .set("background-position", "center")
            .set("background-repeat", "no-repeat")
            .set("background-size", "cover");

          if (marpitDirectives.backgroundPosition) {
            style.set("background-position", marpitDirectives.backgroundPosition);
          }
          if (marpitDirectives.backgroundRepeat) {
            style.set("background-repeat", marpitDirectives.backgroundRepeat);
          }
          if (marpitDirectives.backgroundSize) {
            style.set("background-size", marpitDirectives.backgroundSize);
          }
        }

        if (
          marpitDirectives.paginate &&
          marpitDirectives.paginate !== "skip"
        ) {
          if (page <= 0) page = 1;
          token.attrSet("data-marpit-pagination", page);
          paginatedTokens.push(token);
        }

        if (marpitDirectives.header) {
          token.meta.marpitHeader = marpitDirectives.header;
        }
        if (marpitDirectives.footer) {
          token.meta.marpitFooter = marpitDirectives.footer;
        }

        const styleAttribute = style.toString();
        if (styleAttribute !== "") token.attrSet("style", styleAttribute);
      }

      for (const token of paginatedTokens) {
        token.attrSet("data-marpit-pagination-total", page);
      }
    },
  );
}

const apply = marpitPlugin(applyDirectives);

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "apply", { enumerable: true, get: () => apply });
Object.defineProperty(exports, "default", { enumerable: true, get: () => apply });
