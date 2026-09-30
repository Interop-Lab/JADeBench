"use strict";

var postcssModule = require("postcss");
var kebabCaseModule = require("lodash.kebabcase");

var postcss = postcssModule.default || postcssModule;
var kebabCase = kebabCaseModule.default || kebabCaseModule;

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;

var apply_exports = {};
__defProp(apply_exports, "__esModule", { value: true });
__defProp(apply_exports, "apply", {
  enumerable: true,
  get: function () {
    return apply;
  }
});
__defProp(apply_exports, "default", {
  enumerable: true,
  get: function () {
    return apply_default;
  }
});
module.exports = apply_exports;

class InlineStyle {
  constructor(value) {
    this.rule = postcss.parse("a{" + (value == null ? "" : String(value)) + "}").first;
  }

  get(property) {
    var normalized = kebabCase(property);
    var declaration = this.rule.nodes && this.rule.nodes.find(function (node) {
      return node.type === "decl" && node.prop === normalized;
    });

    return declaration ? declaration.value : undefined;
  }

  set(property, value) {
    var normalized = kebabCase(property);

    if (this.rule.nodes) {
      for (var index = this.rule.nodes.length - 1; index >= 0; index--) {
        var node = this.rule.nodes[index];
        if (node.type === "decl" && node.prop === normalized) node.remove();
      }
    }

    if (value !== undefined && value !== null && value !== false) {
      this.rule.append({
        prop: normalized,
        value: String(value)
      });
    }

    return this;
  }

  toString() {
    var source = this.rule.toString();
    return source.slice(source.indexOf("{") + 1, source.lastIndexOf("}"));
  }
}

function parseHeadingDivider(value) {
  var divider = Number.parseInt(value, 10);
  return Number.isNaN(divider) || divider < 1 || divider > 6
    ? undefined
    : divider;
}

function parseStyle(value) {
  try {
    return new InlineStyle(value);
  } catch (_) {
    return undefined;
  }
}

function parseTheme(value, context) {
  var name = String(value).trim();
  var marpit = context && context.marpit;

  if (!marpit || !marpit.themeSet || typeof marpit.themeSet.get !== "function") {
    return name;
  }

  return marpit.themeSet.get(name) ? name : undefined;
}

function parseString(value) {
  return value == null ? undefined : String(value);
}

function parseClass(value) {
  if (Array.isArray(value)) return value.filter(Boolean);

  return String(value == null ? "" : value)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function parsePaginate(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;

  var normalized = String(value == null ? "" : value).trim().toLowerCase();
  return normalized === "" || normalized === "true" || normalized === "yes" || normalized === "on";
}

var globals = Object.assign(Object.create(null), {
  headingDivider: parseHeadingDivider,
  style: parseStyle,
  theme: parseTheme,
  lang: parseString
});

var locals = Object.assign(Object.create(null), {
  backgroundColor: parseString,
  backgroundImage: parseString,
  backgroundPosition: parseString,
  backgroundRepeat: parseString,
  backgroundSize: parseString,
  class: parseClass,
  color: parseString,
  footer: parseString,
  header: parseString,
  paginate: parsePaginate
});

var directives_default = [
  ...Object.keys(globals),
  ...Object.keys(locals)
];

var canonicalDirectives = Object.create(null);

for (var globalName of Object.keys(globals)) {
  canonicalDirectives[kebabCase(globalName)] = {
    name: globalName,
    global: true,
    transform: globals[globalName]
  };
}

for (var localName of Object.keys(locals)) {
  canonicalDirectives[kebabCase(localName)] = {
    name: localName,
    global: false,
    transform: locals[localName]
  };
}

function cloneDirectiveValue(value) {
  if (value instanceof InlineStyle) return new InlineStyle(value.toString());
  if (Array.isArray(value)) return value.slice();
  return value;
}

function cloneDirectives(directives) {
  var cloned = Object.create(null);

  for (var key of Object.keys(directives)) {
    cloned[key] = cloneDirectiveValue(directives[key]);
  }

  return cloned;
}

function directiveEntries(metadata) {
  if (!metadata) return [];

  if (Array.isArray(metadata)) {
    var entries = [];

    for (var item of metadata) {
      if (Array.isArray(item) && item.length >= 2) {
        entries.push([item[0], item[1]]);
      } else if (item && typeof item === "object") {
        if ("key" in item || "name" in item) {
          entries.push([item.key === undefined ? item.name : item.key, item.value]);
        } else {
          entries.push(...Object.entries(item));
        }
      }
    }

    return entries;
  }

  if (typeof metadata === "object") {
    if (Array.isArray(metadata.parsed)) return directiveEntries(metadata.parsed);
    if (Array.isArray(metadata.directives)) return directiveEntries(metadata.directives);

    if ("key" in metadata || "name" in metadata) {
      return [[metadata.key === undefined ? metadata.name : metadata.key, metadata.value]];
    }

    return Object.entries(metadata);
  }

  return [];
}

function tokenDirectives(token) {
  if (!token || !token.meta) return [];

  return directiveEntries(
    token.meta.marpitDirectives ||
    token.meta.marpitDirective ||
    token.meta.directives ||
    token.meta.directive
  );
}

function isSlideBoundary(token, headingDivider) {
  if (!token) return false;
  if (token.type === "hr" || token.type === "marpit_slide_open") return true;

  return Boolean(
    headingDivider &&
    token.type === "heading_open" &&
    token.tag === "h" + headingDivider
  );
}

function setStyleProperty(target, property, value) {
  var style = target.style;

  if (!(style instanceof InlineStyle)) {
    style = new InlineStyle(style == null ? "" : String(style));
    target.style = style;
  }

  style.set(property, value);
}

function applyDirective(entry, value, globalState, localState, context) {
  var transformed = entry.transform(value, context);
  if (transformed === undefined) return;

  var target = entry.global ? globalState : localState;
  target[entry.name] = transformed;

  if (!entry.global) {
    switch (entry.name) {
      case "backgroundColor":
        setStyleProperty(target, "background-color", transformed);
        break;
      case "backgroundImage":
        setStyleProperty(target, "background-image", transformed);
        break;
      case "backgroundPosition":
        setStyleProperty(target, "background-position", transformed);
        break;
      case "backgroundRepeat":
        setStyleProperty(target, "background-repeat", transformed);
        break;
      case "backgroundSize":
        setStyleProperty(target, "background-size", transformed);
        break;
      case "color":
        setStyleProperty(target, "color", transformed);
        break;
    }
  }
}

function installApplyRule(md, marpit) {
  var rule = function (state) {
    var globalState = Object.create(null);
    var localState = Object.create(null);
    var context = {
      marpit: marpit || md.marpit || (state.env && state.env.marpit)
    };

    if (state.env && state.env.marpitDirectives) {
      for (var pair of directiveEntries(state.env.marpitDirectives)) {
        var initialEntry = canonicalDirectives[kebabCase(pair[0])];
        if (initialEntry) {
          applyDirective(initialEntry, pair[1], globalState, localState, context);
        }
      }
    }

    for (var token of state.tokens) {
      if (isSlideBoundary(token, globalState.headingDivider)) {
        localState = Object.create(null);
      }

      for (var directive of tokenDirectives(token)) {
        var definition = canonicalDirectives[kebabCase(directive[0])];
        if (!definition) continue;

        applyDirective(
          definition,
          directive[1],
          globalState,
          localState,
          context
        );
      }

      token.meta = token.meta || {};
      token.meta.marpitDirectives = {
        global: cloneDirectives(globalState),
        local: cloneDirectives(localState)
      };
    }

    if (state.env) {
      state.env.marpitDirectives = cloneDirectives(globalState);
    }
  };

  var ruler = md && md.core && md.core.ruler;
  if (!ruler) return;

  try {
    ruler.after("marpit_directives_parse", "marpit_directives_apply", rule);
  } catch (_) {
    ruler.push("marpit_directives_apply", rule);
  }
}

function apply(target) {
  var md = target && target.markdown ? target.markdown : target;
  var marpit = target && target.markdown ? target : target && target.marpit;

  installApplyRule(md, marpit);
}

var apply_default = apply;
