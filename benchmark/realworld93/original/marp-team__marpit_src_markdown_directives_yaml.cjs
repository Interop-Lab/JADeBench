var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../work/marp-team__marpit/src/markdown/directives/yaml.js
var yaml_exports = {};
__export(yaml_exports, {
  default: () => yaml_default,
  yaml: () => yaml
});
module.exports = __toCommonJS(yaml_exports);

// ../work/marp-team__marpit/src/markdown/directives/directives.js
var globals = Object.assign(/* @__PURE__ */ Object.create(null), {
  headingDivider: (value) => {
    const headings = [1, 2, 3, 4, 5, 6];
    const toInt = (v) => Array.isArray(v) || Number.isNaN(v) ? v : Number.parseInt(v, 10);
    const converted = toInt(value);
    if (Array.isArray(converted)) {
      const convertedArr = converted.map(toInt);
      return {
        headingDivider: headings.filter((v) => convertedArr.includes(v))
      };
    }
    if (value === "false") return { headingDivider: false };
    if (headings.includes(converted)) return { headingDivider: converted };
    return {};
  },
  style: (v) => ({ style: v }),
  theme: (v, marpit) => marpit.themeSet.has(v) ? { theme: v } : {},
  lang: (v) => ({ lang: v })
});
var locals = Object.assign(/* @__PURE__ */ Object.create(null), {
  backgroundColor: (v) => ({ backgroundColor: v }),
  backgroundImage: (v) => ({ backgroundImage: v }),
  backgroundPosition: (v) => ({ backgroundPosition: v }),
  backgroundRepeat: (v) => ({ backgroundRepeat: v }),
  backgroundSize: (v) => ({ backgroundSize: v }),
  class: (v) => ({ class: Array.isArray(v) ? v.join(" ") : v }),
  color: (v) => ({ color: v }),
  footer: (v) => typeof v === "string" ? { footer: v } : {},
  header: (v) => typeof v === "string" ? { header: v } : {},
  paginate: (v) => {
    const normalized = (v || "").toLowerCase();
    if (["hold", "skip"].includes(normalized)) return { paginate: normalized };
    return { paginate: normalized === "true" };
  }
});
var directives_default = [...Object.keys(globals), ...Object.keys(locals)];

// ../work/marp-team__marpit/src/markdown/directives/yaml.js
var import_js_yaml = require("js-yaml");
var createPatterns = (keys) => {
  const set = /* @__PURE__ */ new Set();
  for (const k of keys) {
    const normalized = "_?" + k.replace(/[.*+?^=!:${}()|[\]\\/]/g, "\\$&");
    set.add(normalized);
    set.add(`"${normalized}"`);
    set.add(`'${normalized}'`);
  }
  return [...set.values()];
};
var yamlSpecialChars = `["'{|>~&*`;
function parse(text) {
  try {
    const obj = (0, import_js_yaml.load)(text, { schema: import_js_yaml.FAILSAFE_SCHEMA });
    if (obj === null || typeof obj !== "object") return false;
    return obj;
  } catch {
    return false;
  }
}
function convertLoose(text, looseDirectives) {
  const keyPattern = `(?:${createPatterns(looseDirectives).join("|")})`;
  const looseMatcher = new RegExp(`^(${keyPattern}\\s*:)(.+)$`);
  let normalized = "";
  for (const line of text.split(/\r?\n/))
    normalized += `${line.replace(looseMatcher, (original, prop, value) => {
      const trimmed = value.trim();
      if (trimmed.length === 0 || yamlSpecialChars.includes(trimmed[0]))
        return original;
      const spaceLength = value.length - value.trimLeft().length;
      const spaces = value.substring(0, spaceLength);
      return `${prop}${spaces}"${trimmed.split('"').join('\\"')}"`;
    })}
`;
  return normalized.trim();
}
var yaml = (text, looseDirectives = false) => parse(
  looseDirectives ? convertLoose(text, [
    ...directives_default,
    ...Array.isArray(looseDirectives) ? looseDirectives : []
  ]) : text
);
var yaml_default = yaml;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  yaml
});
