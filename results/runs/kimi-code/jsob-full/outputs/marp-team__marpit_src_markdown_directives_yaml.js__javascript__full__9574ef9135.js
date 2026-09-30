"use strict";

const jsYaml = require("js-yaml");

const globals = Object.freeze(Object.assign(Object.create(null), {
  headingDivider(value) {
    const validLevels = [1, 2, 3, 4, 5, 6];
    const normalize = (level) => Array.isArray(level) || Number.isInteger(level)
      ? level
      : Number.parseInt(level, 10);
    const normalized = normalize(value);

    if (Array.isArray(normalized)) {
      const levels = normalized.map(normalize);
      return { headingDivider: validLevels.filter((level) => levels.includes(level)) };
    }
    if (value === false) return { headingDivider: false };
    if (validLevels.includes(normalized)) return { headingDivider: normalized };
    return {};
  },
  style: (style) => ({ style }),
  theme: (theme, context) => context.themeSet.has(theme) ? { theme } : {},
  lang: (lang) => ({ lang }),
}));

const locals = Object.freeze(Object.assign(Object.create(null), {
  backgroundColor: (backgroundColor) => ({ backgroundColor }),
  backgroundImage: (backgroundImage) => ({ backgroundImage }),
  backgroundPosition: (backgroundPosition) => ({ backgroundPosition }),
  backgroundRepeat: (backgroundRepeat) => ({ backgroundRepeat }),
  backgroundSize: (backgroundSize) => ({ backgroundSize }),
  class: (value) => ({ class: Array.isArray(value) ? value.join(" ") : value }),
  color: (color) => ({ color }),
  footer: (footer) => typeof footer === "string" ? { footer } : {},
  header: (header) => typeof header === "string" ? { header } : {},
  paginate(value) {
    const normalized = (value || "").toString().trim().toLowerCase();
    if (["true", "false"].includes(normalized)) return { paginate: normalized };
    return { paginate: normalized === "" || normalized === "true" };
  },
}));

const directives = [...Object.keys(globals), ...Object.keys(locals)];
const yamlSpecialChars = "[\"'{|>~&*";

function escapeRegExp(value) {
  return value.replace(/[.*+?^=!:${}()|[\]\\/]/g, "\\$&");
}

function createPatterns(names) {
  const patterns = new Set();
  for (const name of names) {
    const pattern = `_?${escapeRegExp(name)}`;
    patterns.add(pattern);
    patterns.add(`"${pattern}"`);
    patterns.add(`'${pattern}'`);
  }
  return [...patterns].sort();
}

function parse(source) {
  try {
    const result = jsYaml.load(source, { schema: jsYaml.FAILSAFE_SCHEMA });
    if (result === null || typeof result !== "object") return false;
    return result;
  } catch {
    return false;
  }
}

function convertLoose(source, customDirectives) {
  const directivePattern = `(?:${createPatterns(customDirectives).join("|")})`;
  const linePattern = new RegExp(`^(${directivePattern}\\s*:)(.+)$`);
  let converted = "";

  for (const line of source.split(/\r?\n/)) {
    converted += line.replace(linePattern, (match, key, rawValue) => {
      const value = rawValue.trim();
      if (value.length === 0 || yamlSpecialChars.includes(value[0])) return match;
      const indentation = rawValue.length - rawValue.trimLeft().length;
      const prefix = rawValue.substring(0, indentation);
      return `${key}${prefix}"${value.split('"').join('\\"')}"`;
    }) + "\n";
  }

  return converted.trim();
}

function yaml(source, loose = false) {
  const customDirectives = Array.isArray(loose) ? loose : [];
  return parse(loose ? convertLoose(source, [...directives, ...customDirectives]) : source);
}

module.exports = Object.defineProperties({}, {
  __esModule: { value: true },
  default: { enumerable: true, get: () => yaml },
  yaml: { enumerable: true, get: () => yaml },
});
