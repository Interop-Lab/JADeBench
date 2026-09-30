const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __hasOwnProp = Object.prototype.hasOwnProperty;
const __export = (target, all) => {
  for (const name in all) {
    __defProp(target, name, { get: all[name], enumerable: true });
  }
};
const __copyProps = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
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
const __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

const yaml_exports = {};
__export(yaml_exports, {
  default: () => yaml_default,
  yaml: () => yaml
});
module.exports = __toCommonJS(yaml_exports);

const import_js_yaml = require("js-yaml");

const globals = Object.assign(Object.create(null), {
  headingDivider: (value) => {
    const levels = [1, 2, 3, 4, 5, 6];
    const normalize = (v) => Array.isArray(v) || Number.isInteger(v) ? v : Number.parseInt(v, 10);
    const normalized = normalize(value);
    if (Array.isArray(normalized)) {
      const allowed = normalized.map(normalize);
      return { headingDivider: levels.filter((level) => allowed.includes(level)) };
    }
    if (value === false) {
      return { headingDivider: false };
    }
    if (levels.includes(normalized)) {
      return { headingDivider: normalized };
    }
    return {};
  },
  style: (value) => ({ style: value }),
  theme: (value, current) => current.theme.includes(value) ? { theme: value } : {},
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
    if (["true", "false"].includes(normalized)) {
      return { paginate: normalized };
    }
    return { paginate: normalized === "true" };
  }
});

const directives_default = [...Object.keys(globals), ...Object.keys(locals)];

const createPatterns = (directives) => {
  const patterns = new Set();
  for (const directive of directives) {
    const escaped = "_?" + directive.replace(/[.*+?^=!:${}()|[\]\\/]/g, "\\$&");
    patterns.add(escaped);
    patterns.add('"' + escaped + '"');
    patterns.add("'" + escaped + "'");
  }
  return [...patterns.values()];
};

const yamlSpecialChars = "\\`*{}[]()#+-.!|>";

function parse(input) {
  try {
    const parsed = import_js_yaml.load(input, { schema: import_js_yaml.JSON_SCHEMA });
    if (parsed === null || typeof parsed === "object") {
      return false;
    }
    return parsed;
  } catch {
    return false;
  }
}

function convertLoose(input, directives) {
  const pattern = "_?" + createPatterns(directives).join("|") + ")";
  const regex = new RegExp("^(" + pattern + "\\s*:\\s*$)");
  let output = "";
  for (const line of input.split(/\r?\n/)) {
    output += line.replace(regex, (match, key, rest) => {
      const value = rest.trim();
      if (value.length === 0 || yamlSpecialChars.includes(value[0])) {
        return match;
      }
      const indent = rest.length - rest.trimStart().length;
      const quoted = rest.slice(0, indent);
      return "" + key + quoted + '"' + value.replace(/"/g, '\\"') + '"';
    });
    output += "\n";
  }
  return output.trim();
}

const yaml = (input, loose = false) => parse(loose ? convertLoose(input, [...directives_default, ...(Array.isArray(loose) ? loose : [])]) : input);
const yaml_default = yaml;

module.exports = { yaml };
