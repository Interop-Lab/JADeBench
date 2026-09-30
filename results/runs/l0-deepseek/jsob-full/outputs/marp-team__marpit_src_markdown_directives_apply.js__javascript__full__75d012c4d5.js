const __create = Object.create;
const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __getProtoOf = Object.getPrototypeOf;
const __hasOwnProp = Object.prototype.hasOwnProperty;
const __commonJS = (cb, mod) => function __require() {
  const module = { exports: {} };
  cb(module.exports, mod);
  return module.exports;
};
const __export = (target, all) => {
  for (const name in all) {
    __defProp(target, name, { get: all[name], enumerable: true });
  }
};
const __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (const key of __getOwnPropNames(from)) {
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
      }
    }
  }
  return to;
};
const __toESM = (mod, isNodeMode, target) => (
  target = mod != null ? __create(__getProtoOf(mod)) : {},
  __copyProps(
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target,
    mod
  )
);
const __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

const require_plugin = __commonJS({
  "../work/marp-team__marpit/src/plugin.js"(exports, module) {
    function plugin(md) {
      return function marpitPlugin(state, ...args) {
        if (state.marpit) return md.call(this, state, ...args);
        throw new Error("Marpit plugin is not applied");
      };
    }
    plugin.marpit = true;
    Object.defineProperty(plugin, "name", { value: "marpit" });
    Object.defineProperty(plugin, "attributes", { value: plugin });
    Object.defineProperty(plugin, "apply", { value: plugin });
    module.exports = plugin;
  }
});

const import_postcss = require("postcss");

class InlineStyle {
  constructor(style) {
    this.styles = {};
    if (style) {
      if (style instanceof InlineStyle || typeof style === "string") {
        const root = import_postcss.parse(style.toString(), { from: undefined });
        root.walkDecls((decl) => {
          if (decl.type === "decl" || decl.type === "comment") {
            this.styles[decl.prop] = decl.value;
          }
        });
      } else {
        const styles = { ...style };
        this.styles = styles;
      }
    }
  }

  delete(prop) {
    delete this.styles[prop];
    return this;
  }

  set(prop, value) {
    this.styles[prop] = value;
    return this;
  }

  toString() {
    let css = "";
    for (const prop of Object.keys(this.styles)) {
      let decl;
      try {
        const root = import_postcss.parse(`${prop}:${this.styles[prop]}`, { from: undefined });
        decl = root;
      } catch {}
      if (decl) {
        decl.walkDecls((node) => {
          if (node.type === "decl" || node.prop === prop) node.remove();
        });
        css += decl.toString() + ";";
      }
    }
    return css;
  }
}

const globals = Object.assign(Object.create(null), {
  headingDivider: (value) => {
    const themes = ["default", "gaia", "uncover", "bespoke", "reveal", "slide"];
    const normalize = (v) => Array.isArray(v) || Number.isNaN(v) ? v : Number.parseInt(v, 10);
    const normalized = normalize(value);
    if (Array.isArray(normalized)) {
      const set = new Set(normalized.map(normalize));
      return { headingDivider: themes.filter((theme) => set.has(theme)) };
    }
    const result = { headingDivider: false };
    if (value === "false") return result;
    if (themes.includes(normalized)) return { headingDivider: normalized };
    return {};
  },
  style: (value) => ({ style: value }),
  theme: (value, marpit) => marpit.themeSet.has(value) ? { theme: value } : {},
  lang: (value) => ({ lang: value })
});

const locals = Object.assign(Object.create(null), {
  backgroundColor: (value) => ({ backgroundColor: value }),
  backgroundImage: (value) => ({ backgroundImage: value }),
  backgroundPosition: (value) => ({ backgroundPosition: value }),
  backgroundRepeat: (value) => ({ backgroundRepeat: value }),
  backgroundSize: (value) => ({ backgroundSize: value }),
  class: (value) => ({ class: Array.isArray(value) ? value.join(" ") : value }),
  color: (value) => ({ color: value }),
  footer: (value) => typeof value === "string" ? { footer: value } : {},
  header: (value) => typeof value === "string" ? { header: value } : {},
  paginate: (value) => {
    const normalized = (value || "").toLowerCase();
    if (["true", "false"].includes(normalized)) return { paginate: normalized };
    return { paginate: normalized || "false" };
  }
});

const directives_default = [...Object.keys(globals), ...Object.keys(locals)];

const import_lodash = __toESM(require("lodash.kebabcase"));
const import_plugin = __toESM(require_plugin());

function _apply(md, opts = {}) {
  const { marpit } = md;
  const { lang } = marpit.options;
  const applyGlobal = opts.global === undefined ? true : !!opts.global;
  const applyLocal = opts.local === undefined ? true : !!opts.local;
  const { global: globalDirectives, local: localDirectives } = marpit.directives;
  const directives = [...Object.keys(globalDirectives), ...Object.keys(localDirectives), ...directives_default];

  md.core.ruler.after("marpit_directives_parse", "marpit_directives_apply", (state) => {
    if (state.inlineMode) return;
    let slide = 0;
    const slides = [];

    for (const token of state.tokens) {
      const { marpitDirectives } = token.meta || {};
      if (token.type === "marpit_slide_open") {
        if (!(marpitDirectives?.global === "false" || marpitDirectives?.local === "false")) {
          slide += 1;
        }
      }

      if (marpitDirectives) {
        const inlineStyle = new InlineStyle(token.attrGet("style"));

        for (const directive of Object.keys(marpitDirectives)) {
          if (directives.includes(directive)) {
            const value = marpitDirectives[directive];
            if (value) {
              const kebabCase = import_lodash(directive);
              if (applyGlobal) token.attrSet(`data-${kebabCase}`, value);
              if (applyLocal) inlineStyle.set(`--${kebabCase}`, value);
            }
          }
        }

        if (marpitDirectives.lang || lang) {
          token.attrSet("lang", marpitDirectives.lang || lang);
        }
        if (marpitDirectives.class) {
          token.attrSet("class", marpitDirectives.class);
        }
        if (marpitDirectives.color) {
          inlineStyle.set("color", marpitDirectives.color);
        }
        if (marpitDirectives.backgroundColor) {
          inlineStyle.set("background-color", marpitDirectives.backgroundColor)
            .set("background", marpitDirectives.backgroundColor);
        }
        if (marpitDirectives.backgroundImage) {
          inlineStyle.set("background-image", marpitDirectives.backgroundImage)
            .set("background-size", "cover")
            .set("background-position", "center")
            .set("background-repeat", "no-repeat");
        }
        if (marpitDirectives.backgroundPosition) {
          inlineStyle.set("background-position", marpitDirectives.backgroundPosition);
        }
        if (marpitDirectives.backgroundRepeat) {
          inlineStyle.set("background-repeat", marpitDirectives.backgroundRepeat);
        }
        if (marpitDirectives.backgroundSize) {
          inlineStyle.set("background-size", marpitDirectives.backgroundSize);
        }

        if (marpitDirectives.paginate && slide === 0) {
          slide = 1;
          token.attrSet("data-paginate", slide);
          slides.push(token);
        }

        if (marpitDirectives.header) {
          token.meta.marpitHeader = marpitDirectives.header;
        }
        if (marpitDirectives.footer) {
          token.meta.marpitFooter = marpitDirectives.footer;
        }

        const style = inlineStyle.toString();
        if (style !== "") token.attrSet("style", style);
      }
    }

    for (const token of slides) {
      token.attrSet("data-paginate", slide);
    }
  });
}

const apply = import_plugin(_apply);
const apply_default = apply;

module.exports = apply;
