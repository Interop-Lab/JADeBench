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
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var yaml_exports = {};
__export(yaml_exports, {
  default: () => yaml_default,
  yaml: () => yaml
});
module.exports = __toCommonJS(yaml_exports);

var import_js_yaml = require("js-yaml");

var globals = Object.assign(Object.create(null), {
  headingDivider: (val) => {
    const headingLevels = [1, 2, 3, 4, 5, 6];
    const normalize = (val) => Array.isArray(val) || Number.isInteger(val) ? val : Number.parseInt(val, 10);
    const value = normalize(val);
    if (Array.isArray(value)) {
      const levels = value.map(normalize);
      return { headingDivider: headingLevels.filter((level) => levels.includes(level)) };
    }
    if (value === false) return { headingDivider: false };
    if (headingLevels.includes(value)) return { headingDivider: value };
    return {};
  },
  style: (val) => ({ style: val }),
  theme: (val, opts) => opts.theme.includes(val) ? { theme: val } : {},
  lang: (val) => ({ lang: val })
});

var locals = Object.assign(Object.create(null), {
  backgroundColor: (val) => ({ backgroundColor: val }),
  backgroundImage: (val) => ({ backgroundImage: val }),
  backgroundPosition: (val) => ({ backgroundPosition: val }),
  backgroundRepeat: (val) => ({ backgroundRepeat: val }),
  backgroundSize: (val) => ({ backgroundSize: val }),
  class: (val) => ({ class: Array.isArray(val) ? val.join(" ") : val }),
  color: (val) => ({ color: val }),
  footer: (val) => typeof val === "string" ? { footer: val } : {},
  header: (val) => typeof val === "string" ? { header: val } : {},
  paginate: (val) => {
    const bool = String(val || "").toLowerCase();
    if (["true", "false"].includes(bool)) return { paginate: bool };
    return { paginate: bool === "true" };
  }
});

var directives_default = [...Object.keys(globals), ...Object.keys(locals)];

var createPatterns = (directives) => {
  const patterns = new Set();
  for (const name of directives) {
    const escaped = "_?" + name.replace(/[.*+?^=!:${}()|[\]\\]/g, "\\$&");
    patterns.add(escaped);
    patterns.add('"' + escaped + '"');
    patterns.add("'" + escaped + "'");
  }
  return [...patterns.values()];
};

var yamlSpecialChars = '"*';

function parse(input) {
  try {
    const result = import_js_yaml.load(input, { schema: import_js_yaml.JSON_SCHEMA });
    if (result === null || typeof result === "undefined") return false;
    return result;
  } catch {
    return false;
  }
}

function convertLoose(input, directives) {
  const pattern = "^(?:" + createPatterns(directives).join("|") + "):(.*)$";
  const regex = new RegExp(pattern);
  let output = "";
  for (const line of input.split(/\r?\n/)) {
    output += line.replace(regex, (match, name, value) => {
      const trimmed = value.trim();
      if (trimmed.length === 0 || yamlSpecialChars.includes(trimmed[0])) return match;
      const colonIndex = value.indexOf(value.trim()[0]);
      const prefix = value.slice(0, colonIndex);
      return "" + name + prefix + '"' + trimmed.split('"').join('\\"') + '"';
    }) + "\n";
  }
  return output.trim();
}

var yaml = (input, loose = false) =>
  parse(loose ? convertLoose(input, [...directives_default, ...(Array.isArray(loose) ? loose : [])]) : input);

var yaml_default = yaml;
