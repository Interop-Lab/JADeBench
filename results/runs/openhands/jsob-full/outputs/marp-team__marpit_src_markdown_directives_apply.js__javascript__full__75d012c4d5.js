const postcss = require("postcss");
const kebabCase = require("lodash.kebabcase");

function marpitPlugin(plugin) {
  return function (markdown, ...args) {
    if (markdown.marpit) return plugin.call(this, markdown, ...args);

    throw new Error(
      "Marpit plugin has detected incompatible markdown-it instance."
    );
  };
}

class InlineStyle {
  constructor(style) {
    this.declarations = {};

    if (!style) return;

    if (style instanceof InlineStyle || typeof style === "string") {
      const root = postcss.parse(style.toString(), { from: undefined });
      root.each((node) => {
        if (node.type === "decl") {
          this.declarations[node.prop] = node.value;
        }
      });
    } else {
      this.declarations = { ...style };
    }
  }

  delete(property) {
    delete this.declarations[property];
    return this;
  }

  set(property, value) {
    this.declarations[property] = value;
    return this;
  }

  toString() {
    let serialized = "";

    for (const property of Object.keys(this.declarations)) {
      let root;

      try {
        root = postcss.parse(
          property + ":" + this.declarations[property],
          { from: undefined }
        );
      } catch {}

      if (!root) continue;

      root.each((node) => {
        if (node.type !== "decl" || node.prop !== property) node.remove();
      });
      serialized += root.toString() + ";";
    }

    return serialized;
  }
}

const globalDirectives = Object.assign(Object.create(null), {
  headingDivider(value) {
    const validLevels = [1, 2, 3, 4, 5, 6];
    const parseLevel = (level) =>
      Array.isArray(level) || Number.isNaN(level)
        ? level
        : Number.parseInt(level, 10);
    const parsed = parseLevel(value);

    if (Array.isArray(parsed)) {
      const selectedLevels = parsed.map(parseLevel);
      return {
        headingDivider: validLevels.filter((level) =>
          selectedLevels.includes(level)
        ),
      };
    }

    if (value === "false") return { headingDivider: false };
    if (validLevels.includes(parsed)) return { headingDivider: parsed };
    return {};
  },

  style: (value) => ({ style: value }),

  theme: (value, marpit) =>
    marpit.themeSet.has(value) ? { theme: value } : {},

  lang: (value) => ({ lang: value }),
});

const localDirectives = Object.assign(Object.create(null), {
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
    if (["hold", "skip"].includes(normalized)) {
      return { paginate: normalized };
    }
    return { paginate: normalized === "true" };
  },
});

const builtInDirectiveNames = [
  ...Object.keys(globalDirectives),
  ...Object.keys(localDirectives),
];

function applyDirectives(markdown, options = {}) {
  const { marpit } = markdown;
  const { lang: defaultLanguage } = marpit.options;
  const datasetEnabled =
    options.dataset === undefined ? true : Boolean(options.dataset);
  const cssEnabled = options.css === undefined ? true : Boolean(options.css);
  const { global, local } = marpit.customDirectives;
  const recognizedDirectiveNames = [
    ...Object.keys(global),
    ...Object.keys(local),
    ...builtInDirectiveNames,
  ];

  markdown.core.ruler.after(
    "marpit_directives_parse",
    "marpit_directives_apply",
    (state) => {
      if (state.inlineMode) return;

      let pageNumber = 0;
      const paginatedTokens = [];

      for (const token of state.tokens) {
        const { marpitDirectives: directives } = token.meta || {};

        if (token.type === "marpit_slide_open") {
          if (
            directives?.paginate !== "skip" &&
            directives?.paginate !== "hold"
          ) {
            pageNumber += 1;
          }
        }

        if (!directives) continue;

        const style = new InlineStyle(token.attrGet("style"));

        for (const name of Object.keys(directives)) {
          if (!recognizedDirectiveNames.includes(name)) continue;

          const value = directives[name];
          if (!value) continue;

          const kebabName = kebabCase(name);
          if (datasetEnabled) token.attrSet("data-" + kebabName, value);
          if (cssEnabled) style.set("--" + kebabName, value);
        }

        if (directives.lang || defaultLanguage) {
          token.attrSet("lang", directives.lang || defaultLanguage);
        }
        if (directives.class) token.attrJoin("class", directives.class);
        if (directives.color) style.set("color", directives.color);

        if (directives.backgroundColor) {
          style
            .set("background-color", directives.backgroundColor)
            .set("background-image", "none");
        }

        if (directives.backgroundImage) {
          style
            .set("background-image", directives.backgroundImage)
            .set("background-position", "center")
            .set("background-repeat", "no-repeat")
            .set("background-size", "cover");

          if (directives.backgroundPosition) {
            style.set("background-position", directives.backgroundPosition);
          }
          if (directives.backgroundRepeat) {
            style.set("background-repeat", directives.backgroundRepeat);
          }
          if (directives.backgroundSize) {
            style.set("background-size", directives.backgroundSize);
          }
        }

        if (directives.paginate && directives.paginate !== "skip") {
          if (pageNumber <= 0) pageNumber = 1;
          token.attrSet("data-marpit-pagination", pageNumber);
          paginatedTokens.push(token);
        }

        if (directives.header) token.meta.marpitHeader = directives.header;
        if (directives.footer) token.meta.marpitFooter = directives.footer;

        const serializedStyle = style.toString();
        if (serializedStyle !== "") token.attrSet("style", serializedStyle);
      }

      for (const token of paginatedTokens) {
        token.attrSet("data-marpit-pagination-total", pageNumber);
      }
    }
  );
}

const apply = marpitPlugin(applyDirectives);
const exported = {};

Object.defineProperty(exported, "__esModule", { value: true });
Object.defineProperties(exported, {
  apply: { get: () => apply, enumerable: true },
  default: { get: () => apply, enumerable: true },
});

module.exports = exported;
