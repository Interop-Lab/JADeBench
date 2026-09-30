var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (let name in all)
    __defProp(target, name, { get: all[name], enumerable: true, configurable: true });
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
var yaml_exports = {};
__export(yaml_exports, {
  default: () => yaml_default,
  yaml: () => yaml
});
module.exports = __toCommonJS(yaml_exports);
var globals = Object.assign(Object.create(null), {
  headingDivider: (value) => ({ name: "headingDivider", value }),
  style: (value) => ({ name: "style", value }),
  theme: (theme, inherit) => ({ name: "theme", value: { theme, inherit } }),
  lang: (value) => ({ name: "lang", value })
});
var locals = Object.assign(Object.create(null), {
  backgroundColor: (value) => ({ name: "backgroundColor", value }),
  backgroundImage: (value) => ({ name: "backgroundImage", value }),
  backgroundPosition: (value) => ({ name: "backgroundPosition", value }),
  backgroundRepeat: (value) => ({ name: "backgroundRepeat", value }),
  backgroundSize: (value) => ({ name: "backgroundSize", value }),
  class: (value) => ({ name: "class", value }),
  color: (value) => ({ name: "color", value }),
  footer: (value) => ({ name: "footer", value }),
  header: (value) => ({ name: "header", value }),
  paginate: (value) => ({ name: "paginate", value })
});
var directives_default = [...Object.values(globals), ...Object.values(locals)];
var import_js_yaml = require("js-yaml");
var createPatterns = (directives) => {
  const patterns = [];
  for (const directive of directives) {
    patterns.push(new RegExp(`^(?:\\s*<!--\\s*${directive.name}\\s*:\\s*(.*?)\\s*-->\\s*\\n?)+`, "m"));
  }
  return patterns;
};
var yamlSpecialChars = `"'{|>~&*`;
function parse(content) {
  const lines = content.split("\n");
  const result = { directives: {}, content: [] };
  const patterns = createPatterns(directives_default);
  let inFrontmatter = false;
  let frontmatterContent = [];
  let contentStarted = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!contentStarted && line.trim() === "---") {
      if (!inFrontmatter) {
        inFrontmatter = true;
        continue;
      } else {
        inFrontmatter = false;
        contentStarted = true;
        if (frontmatterContent.length > 0) {
          try {
            const parsed = import_js_yaml.load(frontmatterContent.join("\n"));
            if (parsed && typeof parsed === "object") {
              Object.assign(result.directives, parsed);
            }
          } catch (e) {}
        }
        continue;
      }
    }
    if (inFrontmatter) {
      frontmatterContent.push(line);
      continue;
    }
    let matched = false;
    for (let j = 0; j < patterns.length; j++) {
      const match = line.match(patterns[j]);
      if (match) {
        const directive = directives_default[j];
        const value = match[1] || "";
        result.directives[directive.name] = directive(value).value;
        matched = true;
        break;
      }
    }
    if (!matched) {
      result.content.push(line);
    }
  }
  result.content = result.content.join("\n");
  return result;
}
function convertLoose(content, options = {}) {
  const parsed = parse(content);
  const directives = parsed.directives;
  let output = "";
  if (Object.keys(directives).length > 0) {
    output += "---\n";
    output += import_js_yaml.dump(directives);
    output += "---\n";
  }
  output += parsed.content;
  return output;
}
var yaml = (content, options = {}) => {
  return convertLoose(content, options);
};
var yaml_default = yaml;
0 && (module.exports = { yaml });
