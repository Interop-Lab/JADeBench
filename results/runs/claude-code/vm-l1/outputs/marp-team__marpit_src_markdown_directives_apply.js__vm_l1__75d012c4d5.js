"use strict";

const postcss = require("postcss");
const kebabCase = require("lodash.kebabcase");

class InlineStyle {
  constructor(style) {
    this.decls = Object.create(null);
    if (typeof style === "string" && style.length > 0) {
      const rule = postcss.parse(`a{${style}}`).first;
      for (const declaration of rule.nodes) {
        if (declaration.type === "decl") this.decls[declaration.prop] = declaration.value;
      }
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
    return Object.entries(this.decls).map(([property, value]) => `${property}:${value};`).join("");
  }
}

const defined = (name, value) => (value === undefined ? {} : { [name]: value });

const globalDirectives = Object.assign(Object.create(null), {
  headingDivider(value) {
    const level = Number.parseInt(value, 10);
    return level >= 1 && level <= 6 ? { headingDivider: level } : {};
  },
  style: (value) => defined("style", value),
  theme(value, marpit) {
    return value !== undefined && marpit.themeSet.has(value) ? { theme: value } : {};
  },
  lang: (value) => defined("lang", value),
});

const localDirectives = Object.assign(Object.create(null), {
  backgroundColor: (value) => defined("backgroundColor", value),
  backgroundImage: (value) => defined("backgroundImage", value),
  backgroundPosition: (value) => defined("backgroundPosition", value),
  backgroundRepeat: (value) => defined("backgroundRepeat", value),
  backgroundSize: (value) => defined("backgroundSize", value),
  class: (value) => defined("class", value),
  color: (value) => defined("color", value),
  footer: (value) => (typeof value === "string" ? { footer: value } : {}),
  header: (value) => (typeof value === "string" ? { header: value } : {}),
  paginate(value) {
    return { paginate: typeof value === "string" && value.toLowerCase() === "true" };
  },
});

const directiveNames = [...Object.keys(globalDirectives), ...Object.keys(localDirectives)];

function marpitPlugin(plugin) {
  return function compatibleMarpitPlugin(markdown, ...args) {
    if (!markdown.marpit) {
      throw new Error("Marpit plugin has detected incompatible markdown-it instance.");
    }
    return plugin.call(this, markdown, ...args);
  };
}

function setDataAttributes(token, directives, style) {
  for (const [name, value] of Object.entries(directives)) {
    if (value === undefined) continue;
    const property = kebabCase(name);
    token.attrSet(`data-${property}`, value);
    style.set(`--${property}`, String(value));
  }
}

function resolveDirectives(directives, handlers, defaults, marpit) {
  const resolved = {};
  for (const name of directiveNames) {
    if (!(name in directives)) continue;
    const handler = defaults[name] || handlers[name];
    if (typeof handler === "function") Object.assign(resolved, handler(directives[name], marpit));
  }
  return resolved;
}

function applyLocalDirectives(token, values, style) {
  if (values.lang !== undefined) token.attrSet("lang", values.lang);
  if (values.class !== undefined) {
    token.attrSet("class", Array.isArray(values.class) ? values.class.join(" ") : values.class);
  }
  if (values.header !== undefined) token.meta.marpitHeader = values.header;
  if (values.footer !== undefined) token.meta.marpitFooter = values.footer;
  if (values.color !== undefined) style.set("color", values.color);

  if (values.backgroundColor !== undefined) {
    style.set("background-color", values.backgroundColor);
    style.set("background-image", "none");
  }

  if (values.backgroundImage !== undefined) {
    style.set("background-image", values.backgroundImage);
    style.set("background-position", values.backgroundPosition ?? "center");
    style.set("background-repeat", values.backgroundRepeat ?? "no-repeat");
    style.set("background-size", values.backgroundSize ?? "cover");
  } else {
    if (values.backgroundPosition !== undefined) style.set("background-position", values.backgroundPosition);
    if (values.backgroundRepeat !== undefined) style.set("background-repeat", values.backgroundRepeat);
    if (values.backgroundSize !== undefined) style.set("background-size", values.backgroundSize);
  }

  return values.paginate === true;
}

function applyDirectives(markdown) {
  const { marpit } = markdown;
  const { lang } = marpit.options;
  const customGlobal = marpit.customDirectives.global;
  const customLocal = marpit.customDirectives.local;

  markdown.core.ruler.after(
    "marpit_directives_parse",
    "marpit_directives_apply",
    (state) => {
      if (state.inlineMode) return;
      const slideTokens = [];
      let paginationEnabled = false;

      for (const token of state.tokens) {
        if (token.type === "marpit_slide_open") slideTokens.push(token);
        const directives = token.meta && token.meta.marpitDirectives;
        if (!directives) continue;

        const style = new InlineStyle(token.attrGet("style"));
        setDataAttributes(token, directives, style);

        const globalValues = resolveDirectives(directives, customGlobal, globalDirectives, marpit);
        const localValues = resolveDirectives(directives, customLocal, localDirectives, marpit);
        const language = localValues.lang ?? globalValues.lang ?? lang;
        const shouldPaginate = applyLocalDirectives(
          token,
          { ...globalValues, ...localValues, lang: language },
          style,
        );

        token.attrSet("style", style.toString());
        if (shouldPaginate) paginationEnabled = true;
      }

      if (paginationEnabled) {
        for (const [index, token] of slideTokens.entries()) {
          token.attrSet("data-marpit-pagination", index + 1);
          token.attrSet("data-marpit-pagination-total", slideTokens.length);
        }
      }
    },
  );
}

const apply = marpitPlugin(applyDirectives);

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "apply", { enumerable: true, get: () => apply });
Object.defineProperty(exports, "default", { enumerable: true, get: () => apply });
