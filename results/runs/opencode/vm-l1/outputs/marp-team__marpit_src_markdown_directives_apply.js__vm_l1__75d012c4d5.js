"use strict";

const postcss = require("postcss");
const kebabCase = require("lodash.kebabcase");

/** A small mutable representation of an element's inline CSS. */
class InlineStyle {
  constructor(source = "") {
    this.decls = Object.create(null);
    if (typeof source !== "string" || source === "") return;

    try {
      const rule = postcss.parse(`x{${source}}`).first;
      rule.each(node => {
        if (node.type === "decl") this.decls[node.prop] = node.value;
      });
    } catch {
      // Invalid inline CSS is ignored, just as an empty declaration list is.
    }
  }

  delete(property) {
    delete this.decls[kebabCase(property)];
    return this;
  }

  set(property, value) {
    this.decls[kebabCase(property)] = String(value);
    return this;
  }

  toString() {
    return Object.entries(this.decls)
      .map(([property, value]) => `${property}:${value};`)
      .join("");
  }
}

const globals = Object.assign(Object.create(null), {
  headingDivider(value) {
    const level = Number.parseInt(value, 10);
    return level > 0 ? { headingDivider: level } : {};
  },

  style: value => ({ style: value }),

  theme(value, { marpit } = {}) {
    if (!marpit.themeSet.has(value)) return {};
    return { theme: value };
  },

  lang: value => ({ lang: value }),
});

const locals = Object.assign(Object.create(null), {
  backgroundColor: value => ({ backgroundColor: value }),
  backgroundImage: value => ({ backgroundImage: value }),
  backgroundPosition: value => ({ backgroundPosition: value }),
  backgroundRepeat: value => ({ backgroundRepeat: value }),
  backgroundSize: value => ({ backgroundSize: value }),
  class: value => ({ class: Array.isArray(value) ? value.join(" ") : value }),
  color: value => ({ color: value }),
  footer: value => (typeof value === "string" ? { footer: value } : {}),
  header: value => (typeof value === "string" ? { header: value } : {}),
  paginate: value => ({
    paginate: typeof value === "string" && value.toLowerCase() === "true",
  }),
});

const builtinDirectives = [...Object.keys(globals), ...Object.keys(locals)];

function mergeDirectives(original, builtins) {
  const custom = Object.create(null);
  for (const [name, directive] of Object.entries(original || {})) {
    if (!builtinDirectives.includes(name)) custom[name] = directive;
  }
  return Object.assign(custom, builtins);
}

/**
 * Installs Marpit's built-in global and local directives.
 *
 * The plugin callback receives the Marpit instance and its markdown-it parser.
 * Existing user directives are retained unless they use a built-in name.
 */
function apply({ marpit, ...markdown } = {}) {
  const language = marpit.options.lang;
  marpit.customDirectives.global = mergeDirectives(
    marpit.customDirectives.global,
    globals,
  );
  marpit.customDirectives.local = mergeDirectives(
    marpit.customDirectives.local,
    locals,
  );

  // Run after Marpit has parsed and applied directives. The rule normalizes
  // language metadata while leaving unrelated token metadata untouched.
  if (markdown.core && markdown.core.ruler) {
    markdown.core.ruler.after(
      "marpit_directives_parse",
      "marpit_directives_apply",
      state => {
        if (state.inlineMode) return;

        for (const token of state.tokens) {
          const directives = token.meta && token.meta.marpitDirectives;
          if (!directives) continue;

          // Normalize directive-derived attributes before rendering. Parsing
          // and applying the directives themselves is handled by Marpit's
          // two preceding core rules.
          if (directives.style != null) {
            directives.style = new InlineStyle(directives.style).toString();
          }
          if (directives.lang == null && language !== undefined) {
            directives.lang = language;
          }
        }
      },
    );
  }
}

// Preserve the transpiled CommonJS module's public shape.
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = apply;
exports.default = apply;
