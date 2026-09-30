"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "apply", {
  enumerable: true,
  get: () => apply,
});
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: () => apply,
});

const postcss = require("postcss");
const kebabCaseModule = require("lodash.kebabcase");
const kebabCase = kebabCaseModule.default || kebabCaseModule;

class InlineStyle {
  constructor(style) {
    this.style = {};

    if (!style) return;

    if (style instanceof InlineStyle || typeof style === "string") {
      const root = postcss.parse(style.toString(), { from: undefined });

      root.walkDecls((declaration) => {
        if (declaration.parent.type === "root") {
          this.style[declaration.prop] = declaration.value;
        }
      });
    } else {
      this.style = { ...style };
    }
  }

  delete(property) {
    delete this.style[property];
    return this;
  }

  set(property, value) {
    this.style[property] = value;
    return this;
  }

  toString() {
    let result = "";

    for (const property of Object.keys(this.style)) {
      let root;

      try {
        root = postcss.parse(`${property}:${this.style[property]}`, {
          from: undefined,
        });
      } catch {
        continue;
      }

      if (!root) continue;

      root.walkDecls((declaration) => {
        if (
          declaration.parent.type !== "root" ||
          declaration.prop !== property
        ) {
          declaration.remove();
        }
      });

      result += `${root.toString()};`;
    }

    return result;
  }
}

const headingLevels = [1, 2, 3, 4, 5, 6];

const globals = Object.freeze(
  Object.assign(Object.create(null), {
    headingDivider(value) {
      const normalize = (item) =>
        Array.isArray(item) || Number.isFinite(item)
          ? item
          : Number.parseInt(item, 10);

      const normalized = normalize(value);

      if (Array.isArray(normalized)) {
        const values = normalized.map(normalize);
        return {
          headingDivider: headingLevels.filter((level) =>
            values.includes(level)
          ),
        };
      }

      if (value === false || value === "false") {
        return { headingDivider: false };
      }

      if (headingLevels.includes(normalized)) {
        return { headingDivider: normalized };
      }

      return {};
    },

    style(value) {
      return { style: value };
    },

    theme(value, marpit) {
      return marpit.themeSet.has(value) ? { theme: value } : {};
    },

    lang(value) {
      return { lang: value };
    },
  })
);

const locals = Object.freeze(
  Object.assign(Object.create(null), {
    backgroundColor(value) {
      return { backgroundColor: value };
    },

    backgroundImage(value) {
      return { backgroundImage: value };
    },

    backgroundPosition(value) {
      return { backgroundPosition: value };
    },

    backgroundRepeat(value) {
      return { backgroundRepeat: value };
    },

    backgroundSize(value) {
      return { backgroundSize: value };
    },

    class(value) {
      return {
        class: Array.isArray(value) ? value.join(" ") : value,
      };
    },

    color(value) {
      return { color: value };
    },

    footer(value) {
      return typeof value === "string" ? { footer: value } : {};
    },

    header(value) {
      return typeof value === "string" ? { header: value } : {};
    },

    paginate(value) {
      const normalized = (value || "").toString().toLowerCase();

      if (["true", "false"].includes(normalized)) {
        return { paginate: normalized };
      }

      return { paginate: normalized === "true" };
    },
  })
);

const defaultDirectives = [
  ...Object.keys(globals),
  ...Object.keys(locals),
];

function marpitPlugin(plugin) {
  function wrapped(markdown, ...args) {
    if (markdown.marpit) {
      return plugin.call(this, markdown, ...args);
    }

    throw new Error(
      "Marpit plugin must be used through a Marpit instance."
    );
  }

  Object.defineProperty(wrapped, "name", {
    value: plugin.name,
    configurable: true,
  });

  Object.defineProperty(wrapped, "length", {
    value: plugin.length,
    configurable: true,
  });

  return wrapped;
}

function applyPlugin(markdown, options = {}) {
  const { marpit } = markdown;
  const { lang } = marpit.options;

  const inlineSVG =
    options.inlineSVG === undefined ? true : Boolean(options.inlineSVG);
  const looseYAML =
    options.looseYAML === undefined ? true : Boolean(options.looseYAML);

  const { global, local } = marpit.customDirectives;
  const knownDirectives = [
    ...Object.keys(global),
    ...Object.keys(local),
    ...defaultDirectives,
  ];

  markdown.core.ruler.after(
    "marpit_directives_parse",
    "marpit_apply_directives",
    (state) => {
      if (state.inlineMode) return;

      let page = 0;
      const paginatedSlides = [];

      for (const token of state.tokens) {
        const { marpitDirectives: directives } = token.meta || {};

        if (token.type === "marpit_slide_open") {
          if (
            directives?.paginate !== false &&
            directives?.paginate !== "false"
          ) {
            page += 1;
          }
        }

        if (!directives) continue;

        const inlineStyle = new InlineStyle(token.attrGet("style"));

        for (const directiveName of Object.keys(directives)) {
          if (!knownDirectives.includes(directiveName)) continue;

          const value = directives[directiveName];
          if (!value) continue;

          const name = kebabCase(directiveName);

          if (inlineSVG) {
            token.attrSet(`data-${name}`, value);
          }

          if (looseYAML) {
            inlineStyle.set(`--${name}`, value);
          }
        }

        if (directives.lang || lang) {
          token.attrSet("lang", directives.lang || lang);
        }

        if (directives.class) {
          token.attrJoin("class", directives.class);
        }

        if (directives.color) {
          inlineStyle.set("color", directives.color);
        }

        if (directives.backgroundColor) {
          inlineStyle.set("background-color", directives.backgroundColor);
        }

        if (directives.backgroundImage) {
          inlineStyle.set("background-image", directives.backgroundImage);
        }

        if (directives.backgroundPosition) {
          inlineStyle.set(
            "background-position",
            directives.backgroundPosition
          );
        }

        if (directives.backgroundRepeat) {
          inlineStyle.set("background-repeat", directives.backgroundRepeat);
        }

        if (directives.backgroundSize) {
          inlineStyle.set("background-size", directives.backgroundSize);
        }

        if (
          directives.paginate &&
          directives.paginate !== "false" &&
          directives.paginate !== false
        ) {
          if (page <= 0) page = 1;

          token.attrSet("data-marpit-pagination", page);
          paginatedSlides.push(token);
        }

        if (directives.header) {
          token.meta.marpitHeader = directives.header;
        }

        if (directives.footer) {
          token.meta.marpitFooter = directives.footer;
        }

        const serializedStyle = inlineStyle.toString();

        if (serializedStyle !== "") {
          token.attrSet("style", serializedStyle);
        }
      }

      for (const token of paginatedSlides) {
        token.attrSet("data-marpit-pagination-total", page);
      }
    }
  );
}

const apply = marpitPlugin(applyPlugin);
